import { SalesTransaction } from "@shopflow/types";

export interface RefundItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  reason?: string;
}

export interface RefundRequest {
  id: string;
  originalOrderId: string;
  originalTransactionNumber: string;
  refundNumber: string;
  refundAmount: number;
  refundReason: string;
  refundNotes?: string;
  refundedItems: RefundItem[];
  customer?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  processedBy: {
    id: string;
    name: string;
    username: string;
  };
  status: "pending" | "approved" | "completed" | "rejected";
  createdAt: Date;
  processedAt?: Date;
  approvedBy?: {
    id: string;
    name: string;
    username: string;
  };
  refundMethod?: "cash" | "card" | "original_method";
  approvalNotes?: string;
}

export interface RefundTransaction {
  id: string;
  refundRequestId: string;
  amount: number;
  method: "cash" | "card" | "original_method";
  status: "processing" | "completed" | "failed";
  processedAt: Date;
  completedAt?: Date;
  failureReason?: string;
  receiptNumber?: string;
}

/**
 * Validate if an order can be refunded
 */
export const canRefundOrder = (order: SalesTransaction): boolean => {
  // Check if order is completed
  if (order.status !== "completed") {
    return false;
  }

  // Check if order is not already refunded
  if (order.status === "refunded") {
    return false;
  }

  // Check if order is within refund time limit (e.g., 30 days)
  const refundTimeLimit = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
  const timeSinceOrder = Date.now() - order.createdAt.getTime();
  
  if (timeSinceOrder > refundTimeLimit) {
    return false;
  }

  return true;
};

/**
 * Validate refund items
 */
export const validateRefundItems = (
  order: SalesTransaction,
  refundItems: RefundItem[]
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (refundItems.length === 0) {
    errors.push("กรุณาเลือกรายการที่ต้องการคืน");
    return { isValid: false, errors };
  }

  for (const refundItem of refundItems) {
    const originalItem = order.cart.items.find((item) => item.id === refundItem.itemId);
    
    if (!originalItem) {
      errors.push(`ไม่พบสินค้า ID: ${refundItem.itemId} ในออเดอร์เดิม`);
      continue;
    }

    if (refundItem.quantity <= 0) {
      errors.push(`จำนวนที่คืนต้องมากกว่า 0 สำหรับ ${originalItem.product.name}`);
    }

    if (refundItem.quantity > originalItem.quantity) {
      errors.push(
        `จำนวนที่คืน (${refundItem.quantity}) เกินจำนวนที่ซื้อ (${originalItem.quantity}) สำหรับ ${originalItem.product.name}`
      );
    }

    // Check if item has already been refunded
    // This would typically involve checking previous refund records
    // For now, we'll skip this check as it requires database integration
  }

  return { isValid: errors.length === 0, errors };
};

/**
 * Calculate refund amount
 */
export const calculateRefundAmount = (
  order: SalesTransaction,
  refundItems: RefundItem[]
): {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
} => {
  let subtotal = 0;
  let discountAmount = 0;
  let taxAmount = 0;

  for (const refundItem of refundItems) {
    const originalItem = order.cart.items.find((item) => item.id === refundItem.itemId);
    if (!originalItem) continue;

    const itemSubtotal = originalItem.unitPrice * refundItem.quantity;
    const itemDiscountPerItem = originalItem.discountAmount / originalItem.quantity;
    const itemTaxPerItem = originalItem.taxAmount / originalItem.quantity;

    subtotal += itemSubtotal;
    discountAmount += itemDiscountPerItem * refundItem.quantity;
    taxAmount += itemTaxPerItem * refundItem.quantity;
  }

  const total = subtotal - discountAmount + taxAmount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
};

/**
 * Create refund request
 */
export const createRefundRequest = (
  order: SalesTransaction,
  refundItems: RefundItem[],
  reason: string,
  notes?: string,
  processedBy?: { id: string; name: string; username: string }
): RefundRequest => {
  const refundCalculation = calculateRefundAmount(order, refundItems);
  const refundNumber = generateRefundNumber();

  return {
    id: generateRefundId(),
    originalOrderId: order.id,
    originalTransactionNumber: order.transactionNumber,
    refundNumber,
    refundAmount: refundCalculation.total,
    refundReason: reason,
    refundNotes: notes,
    refundedItems: refundItems,
    customer: order.customer,
    processedBy: processedBy || {
      id: "current_user_id",
      name: "Current User",
      username: "current_user",
    },
    status: "pending",
    createdAt: new Date(),
  };
};

/**
 * Process refund approval
 */
export const processRefundApproval = (
  refundRequest: RefundRequest,
  approved: boolean,
  approvedBy: { id: string; name: string; username: string },
  notes?: string
): RefundRequest => {
  return {
    ...refundRequest,
    status: approved ? "approved" : "rejected",
    processedAt: new Date(),
    approvedBy,
    approvalNotes: notes,
  };
};

/**
 * Execute refund transaction
 */
export const executeRefundTransaction = async (
  refundRequest: RefundRequest,
  method: "cash" | "card" | "original_method"
): Promise<RefundTransaction> => {
  // Simulate payment processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const transaction: RefundTransaction = {
    id: generateTransactionId(),
    refundRequestId: refundRequest.id,
    amount: refundRequest.refundAmount,
    method,
    status: "processing",
    processedAt: new Date(),
  };

  // Simulate processing steps
  try {
    // Step 1: Validate refund request
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Step 2: Process payment
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Step 3: Update inventory (if applicable)
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Step 4: Generate receipt
    const receiptNumber = generateRefundReceiptNumber();
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      ...transaction,
      status: "completed",
      completedAt: new Date(),
      receiptNumber,
    };
  } catch (error) {
    return {
      ...transaction,
      status: "failed",
      failureReason: "ไม่สามารถประมวลผลการคืนเงินได้",
    };
  }
};

/**
 * Get refund eligibility info
 */
export const getRefundEligibility = (order: SalesTransaction) => {
  const canRefund = canRefundOrder(order);
  const refundTimeLimit = 30 * 24 * 60 * 60 * 1000; // 30 days
  const timeSinceOrder = Date.now() - order.createdAt.getTime();
  const timeRemaining = refundTimeLimit - timeSinceOrder;
  const daysRemaining = Math.ceil(timeRemaining / (24 * 60 * 60 * 1000));

  return {
    canRefund,
    reason: canRefund
      ? "สามารถคืนเงินได้"
      : order.status !== "completed"
      ? "ออเดอร์ยังไม่เสร็จสิ้น"
      : order.status === "refunded"
      ? "ออเดอร์นี้ได้คืนเงินแล้ว"
      : timeRemaining <= 0
      ? "เกินระยะเวลาคืนเงิน (30 วัน)"
      : "ไม่สามารถคืนเงินได้",
    daysRemaining: Math.max(0, daysRemaining),
    timeRemaining: Math.max(0, timeRemaining),
  };
};

/**
 * Get refund reasons
 */
export const getRefundReasons = () => [
  { value: "damaged", label: "สินค้าเสียหาย" },
  { value: "wrong_item", label: "สินค้าไม่ตรงตามคำสั่ง" },
  { value: "customer_change_mind", label: "ลูกค้าเปลี่ยนใจ" },
  { value: "quality_issue", label: "คุณภาพไม่ตรงตามมาตรฐาน" },
  { value: "expired", label: "สินค้าหมดอายุ" },
  { value: "duplicate_order", label: "สั่งซ้ำ" },
  { value: "pricing_error", label: "ราคาผิดพลาด" },
  { value: "other", label: "อื่นๆ" },
];

/**
 * Utility functions for generating IDs and numbers
 */
const generateRefundId = (): string => {
  return `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const generateRefundNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const sequence = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
  return `REF${year}${month}${day}${sequence}`;
};

const generateTransactionId = (): string => {
  return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const generateRefundReceiptNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const sequence = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
  return `RR${year}${month}${day}${sequence}`;
};

/**
 * Format refund status text
 */
export const formatRefundStatusText = (status: string): string => {
  switch (status) {
    case "pending":
      return "รอการอนุมัติ";
    case "approved":
      return "อนุมัติแล้ว";
    case "completed":
      return "เสร็จสิ้น";
    case "rejected":
      return "ปฏิเสธ";
    case "processing":
      return "กำลังประมวลผล";
    case "failed":
      return "ล้มเหลว";
    default:
      return status;
  }
};

/**
 * Get refund method text
 */
export const formatRefundMethodText = (method: string): string => {
  switch (method) {
    case "cash":
      return "เงินสด";
    case "card":
      return "บัตรเครดิต/เดบิต";
    case "original_method":
      return "วิธีการเดิม";
    default:
      return method;
  }
};

/**
 * Export refunds to CSV
 */
export const exportRefundsToCSV = (refunds: RefundRequest[]): string => {
  const headers = [
    "เลขที่การคืน",
    "เลขที่คำสั่งเดิม",
    "วันที่คืน",
    "ลูกค้า",
    "เหตุผล",
    "ยอดคืน",
    "สถานะ",
    "ประมวลผลโดย",
    "อนุมัติโดย",
    "หมายเหตุ",
  ];

  const rows = refunds.map((refund) => [
    refund.refundNumber,
    refund.originalTransactionNumber,
    refund.createdAt.toLocaleString("th-TH"),
    refund.customer?.name || "",
    refund.refundReason,
    refund.refundAmount.toFixed(2),
    formatRefundStatusText(refund.status),
    refund.processedBy.name,
    refund.approvedBy?.name || "",
    refund.refundNotes || "",
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  return csvContent;
};