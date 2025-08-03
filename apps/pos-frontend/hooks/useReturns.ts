import { useState, useCallback } from "react";
import { useToast } from "@chakra-ui/react";
import { SalesTransaction } from "@shopflow/types";
import {
  RefundRequest,
  RefundItem,
  RefundTransaction,
  createRefundRequest,
  validateRefundItems,
  canRefundOrder,
  executeRefundTransaction,
  processRefundApproval,
  getRefundEligibility,
} from "../lib/returns";

interface UseReturnsOptions {
  onRefundSuccess?: (refund: RefundRequest) => void;
  onRefundError?: (error: string) => void;
}

export const useReturns = (options: UseReturnsOptions = {}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const toast = useToast();

  const { onRefundSuccess, onRefundError } = options;

  /**
   * Check if order can be refunded
   */
  const checkRefundEligibility = useCallback((order: SalesTransaction) => {
    return getRefundEligibility(order);
  }, []);

  /**
   * Validate refund items before processing
   */
  const validateRefund = useCallback(
    (order: SalesTransaction, refundItems: RefundItem[]) => {
      if (!canRefundOrder(order)) {
        return {
          isValid: false,
          errors: ["ออเดอร์นี้ไม่สามารถคืนเงินได้"],
        };
      }

      return validateRefundItems(order, refundItems);
    },
    []
  );

  /**
   * Submit refund request
   */
  const submitRefundRequest = useCallback(
    async (
      order: SalesTransaction,
      refundItems: RefundItem[],
      reason: string,
      notes?: string
    ): Promise<RefundRequest | null> => {
      setIsProcessing(true);

      try {
        // Validate refund
        const validation = validateRefund(order, refundItems);
        if (!validation.isValid) {
          validation.errors.forEach((error) => {
            toast({
              title: "ข้อผิดพลาด",
              description: error,
              status: "error",
              duration: 3000,
              isClosable: true,
            });
          });
          return null;
        }

        // Create refund request
        const refundRequest = createRefundRequest(order, refundItems, reason, notes);

        // Store refund request (in real app, this would be API call)
        setRefundRequests((prev) => [...prev, refundRequest]);

        toast({
          title: "ส่งคำขอคืนเงินสำเร็จ",
          description: `เลขที่การคืน: ${refundRequest.refundNumber}`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        if (onRefundSuccess) {
          onRefundSuccess(refundRequest);
        }

        return refundRequest;
      } catch (error) {
        const errorMessage = "ไม่สามารถส่งคำขอคืนเงินได้";
        
        toast({
          title: "เกิดข้อผิดพลาด",
          description: errorMessage,
          status: "error",
          duration: 3000,
          isClosable: true,
        });

        if (onRefundError) {
          onRefundError(errorMessage);
        }

        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [validateRefund, toast, onRefundSuccess, onRefundError]
  );

  /**
   * Approve or reject refund request
   */
  const processRefund = useCallback(
    async (
      refundId: string,
      approved: boolean,
      approver: { id: string; name: string; username: string },
      notes?: string
    ): Promise<boolean> => {
      setIsProcessing(true);

      try {
        const refundRequest = refundRequests.find((r) => r.id === refundId);
        if (!refundRequest) {
          throw new Error("ไม่พบคำขอคืนเงิน");
        }

        // Process approval
        const updatedRefund = processRefundApproval(
          refundRequest,
          approved,
          approver,
          notes
        );

        // Update refund request
        setRefundRequests((prev) =>
          prev.map((r) => (r.id === refundId ? updatedRefund : r))
        );

        toast({
          title: approved ? "อนุมัติการคืนเงินสำเร็จ" : "ปฏิเสธการคืนเงินสำเร็จ",
          description: `${approved ? "อนุมัติ" : "ปฏิเสธ"}คำขอ ${updatedRefund.refundNumber}`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        return true;
      } catch (error) {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถดำเนินการได้",
          status: "error",
          duration: 3000,
          isClosable: true,
        });

        return false;
      } finally {
        setIsProcessing(false);
      }
    },
    [refundRequests, toast]
  );

  /**
   * Execute refund transaction
   */
  const executeRefund = useCallback(
    async (
      refundId: string,
      method: "cash" | "card" | "original_method"
    ): Promise<RefundTransaction | null> => {
      setIsProcessing(true);

      try {
        const refundRequest = refundRequests.find((r) => r.id === refundId);
        if (!refundRequest) {
          throw new Error("ไม่พบคำขอคืนเงิน");
        }

        if (refundRequest.status !== "approved") {
          throw new Error("คำขอคืนเงินยังไม่ได้รับการอนุมัติ");
        }

        // Execute refund transaction
        const transaction = await executeRefundTransaction(refundRequest, method);

        if (transaction.status === "completed") {
          // Update refund request status
          const updatedRefund = {
            ...refundRequest,
            status: "completed" as const,
            refundMethod: method,
          };

          setRefundRequests((prev) =>
            prev.map((r) => (r.id === refundId ? updatedRefund : r))
          );

          toast({
            title: "คืนเงินสำเร็จ",
            description: `คืนเงิน ${refundRequest.refundAmount.toFixed(2)} บาท เรียบร้อยแล้ว`,
            status: "success",
            duration: 5000,
            isClosable: true,
          });
        } else {
          throw new Error(transaction.failureReason || "การคืนเงินล้มเหลว");
        }

        return transaction;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "ไม่สามารถคืนเงินได้";
        
        toast({
          title: "เกิดข้อผิดพลาด",
          description: errorMessage,
          status: "error",
          duration: 3000,
          isClosable: true,
        });

        return null;
      } finally {
        setIsProcessing(false);
      }
    },
    [refundRequests, toast]
  );

  /**
   * Get refund request by ID
   */
  const getRefundRequest = useCallback(
    (refundId: string): RefundRequest | null => {
      return refundRequests.find((r) => r.id === refundId) || null;
    },
    [refundRequests]
  );

  /**
   * Filter refund requests
   */
  const filterRefundRequests = useCallback(
    (filters: {
      status?: string;
      dateFrom?: Date;
      dateTo?: Date;
      searchTerm?: string;
    }) => {
      let filtered = [...refundRequests];

      if (filters.status && filters.status !== "all") {
        filtered = filtered.filter((r) => r.status === filters.status);
      }

      if (filters.dateFrom) {
        filtered = filtered.filter((r) => r.createdAt >= filters.dateFrom!);
      }

      if (filters.dateTo) {
        filtered = filtered.filter((r) => r.createdAt <= filters.dateTo!);
      }

      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.refundNumber.toLowerCase().includes(searchLower) ||
            r.originalTransactionNumber.toLowerCase().includes(searchLower) ||
            r.customer?.name?.toLowerCase().includes(searchLower)
        );
      }

      return filtered;
    },
    [refundRequests]
  );

  /**
   * Get refund statistics
   */
  const getRefundStats = useCallback(() => {
    const total = refundRequests.length;
    const totalAmount = refundRequests.reduce((sum, r) => sum + r.refundAmount, 0);
    
    const statusCounts = refundRequests.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalRefunds: total,
      totalAmount,
      averageAmount: total > 0 ? totalAmount / total : 0,
      pendingRefunds: statusCounts.pending || 0,
      approvedRefunds: statusCounts.approved || 0,
      completedRefunds: statusCounts.completed || 0,
      rejectedRefunds: statusCounts.rejected || 0,
    };
  }, [refundRequests]);

  /**
   * Load mock refund data (for development)
   */
  const loadMockRefunds = useCallback(() => {
    // This would be replaced with actual API call in production
    const mockRefunds: RefundRequest[] = [
      {
        id: "refund_001",
        originalOrderId: "tx_001",
        originalTransactionNumber: "TXN-2024-001",
        refundNumber: "REF20241201001",
        refundAmount: 90,
        refundReason: "damaged",
        refundNotes: "กาแฟร้อนเกินไป ลูกค้าไม่พอใจ",
        refundedItems: [
          {
            itemId: "item_001",
            itemName: "กาแฟอเมริกาโน่",
            quantity: 2,
            unitPrice: 45,
            totalAmount: 90,
          },
        ],
        customer: {
          id: "cust_001",
          name: "คุณสมชาย ใจดี",
          phone: "081-234-5678",
        },
        processedBy: {
          id: "cashier_001",
          name: "พนักงานเก็บเงิน",
          username: "cashier01",
        },
        status: "pending",
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      },
    ];

    setRefundRequests(mockRefunds);
  }, []);

  return {
    // State
    isProcessing,
    refundRequests,
    selectedRefund,
    setSelectedRefund,

    // Actions
    checkRefundEligibility,
    validateRefund,
    submitRefundRequest,
    processRefund,
    executeRefund,
    getRefundRequest,
    filterRefundRequests,
    getRefundStats,
    loadMockRefunds,
  };
};