import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Divider,
  Card,
  CardBody,
  Input,
  Select,
  Textarea,
  FormControl,
  FormLabel,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Box,
  useColorModeValue,
} from "@chakra-ui/react";
import { IoWarning, IoCheckmarkCircle } from "react-icons/io5";
import { SalesTransaction } from "@shopflow/types";
import { formatCurrency } from "../../lib/sales";

interface RefundItem {
  itemId: string;
  quantity: number;
  reason: string;
  amount: number;
}

interface ReturnModalProps {
  order: SalesTransaction | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (refundData: {
    orderId: string;
    items: RefundItem[];
    reason: string;
    notes: string;
    totalAmount: number;
  }) => Promise<void>;
}

const ReturnModal: React.FC<ReturnModalProps> = ({
  order,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [refundItems, setRefundItems] = useState<RefundItem[]>([]);
  const [refundReason, setRefundReason] = useState("");
  const [refundNotes, setRefundNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const handleQuantityChange = (itemId: string, quantity: number) => {
    if (!order) return;

    const item = order.cart.items.find((i) => i.id === itemId);
    if (!item) return;

    if (quantity <= 0) {
      // Remove item from refund list
      setRefundItems((prev) => prev.filter((ri) => ri.itemId !== itemId));
      return;
    }

    const maxQuantity = item.quantity;
    const validQuantity = Math.min(quantity, maxQuantity);
    const refundAmount = item.unitPrice * validQuantity;

    setRefundItems((prev) => {
      const existingIndex = prev.findIndex((ri) => ri.itemId === itemId);
      
      if (existingIndex >= 0) {
        // Update existing item
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: validQuantity,
          amount: refundAmount,
        };
        return updated;
      } else {
        // Add new item
        return [
          ...prev,
          {
            itemId,
            quantity: validQuantity,
            reason: refundReason,
            amount: refundAmount,
          },
        ];
      }
    });
  };

  const handleSubmit = async () => {
    if (!order) return;

    if (refundItems.length === 0) {
      toast({
        title: "กรุณาเลือกรายการที่ต้องการคืน",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!refundReason) {
      toast({
        title: "กรุณาระบุเหตุผลในการคืนสินค้า",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const totalAmount = refundItems.reduce((sum, item) => sum + item.amount, 0);
      
      await onSubmit({
        orderId: order.id,
        items: refundItems,
        reason: refundReason,
        notes: refundNotes,
        totalAmount,
      });

      // Reset form
      setRefundItems([]);
      setRefundReason("");
      setRefundNotes("");
      onClose();
    } catch (error) {
      console.error("Return submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getReasonText = (reason: string) => {
    switch (reason) {
      case "damaged":
        return "สินค้าเสียหาย";
      case "wrong_item":
        return "สินค้าไม่ตรงตามคำสั่ง";
      case "customer_change_mind":
        return "ลูกค้าเปลี่ยนใจ";
      case "quality_issue":
        return "คุณภาพไม่ตรงตามมาตรฐาน";
      case "expired":
        return "สินค้าหมดอายุ";
      case "other":
        return "อื่นๆ";
      default:
        return reason;
    }
  };

  const totalRefundAmount = refundItems.reduce((sum, item) => sum + item.amount, 0);

  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={3}>
            <IoWarning color="orange" />
            <VStack align="start" spacing={0}>
              <Text>คืนสินค้า</Text>
              <Text fontSize="sm" color="gray.500" fontWeight="normal">
                {order.transactionNumber}
              </Text>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Warning Alert */}
            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>คำเตือน!</AlertTitle>
                <AlertDescription>
                  การคืนสินค้าจะไม่สามารถยกเลิกได้ กรุณาตรวจสอบข้อมูลให้ถูกต้อง
                </AlertDescription>
              </Box>
            </Alert>

            {/* Return Reason */}
            <FormControl isRequired>
              <FormLabel>เหตุผลในการคืนสินค้า</FormLabel>
              <Select
                placeholder="เลือกเหตุผล"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
              >
                <option value="damaged">สินค้าเสียหาย</option>
                <option value="wrong_item">สินค้าไม่ตรงตามคำสั่ง</option>
                <option value="customer_change_mind">ลูกค้าเปลี่ยนใจ</option>
                <option value="quality_issue">คุณภาพไม่ตรงตามมาตรฐาน</option>
                <option value="expired">สินค้าหมดอายุ</option>
                <option value="other">อื่นๆ</option>
              </Select>
            </FormControl>

            {/* Additional Notes */}
            <FormControl>
              <FormLabel>หมายเหตุเพิ่มเติม</FormLabel>
              <Textarea
                placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
                value={refundNotes}
                onChange={(e) => setRefundNotes(e.target.value)}
                rows={3}
              />
            </FormControl>

            {/* Items Selection */}
            <Box>
              <Text fontWeight="medium" mb={4}>
                เลือกรายการที่ต้องการคืน:
              </Text>
              <VStack spacing={3} align="stretch">
                {order.cart.items.map((item) => {
                  const refundItem = refundItems.find((ri) => ri.itemId === item.id);
                  const refundQuantity = refundItem?.quantity || 0;

                  return (
                    <Card key={item.id} variant="outline" bg={cardBg}>
                      <CardBody>
                        <HStack justify="space-between" align="start">
                          <VStack align="start" spacing={2} flex={1}>
                            <Text fontWeight="medium">{item.product.name}</Text>
                            <Text fontSize="sm" color="gray.500">
                              {item.product.description}
                            </Text>
                            <HStack spacing={4}>
                              <Text fontSize="sm">
                                ราคา: {formatCurrency(item.unitPrice)}
                              </Text>
                              <Text fontSize="sm">
                                จำนวนที่ซื้อ: {item.quantity}
                              </Text>
                              <Text fontSize="sm">
                                รวม: {formatCurrency(item.total)}
                              </Text>
                            </HStack>
                          </VStack>
                          <VStack align="end" spacing={2}>
                            <Text fontSize="sm" fontWeight="medium">
                              จำนวนที่คืน:
                            </Text>
                            <Input
                              type="number"
                              min="0"
                              max={item.quantity}
                              value={refundQuantity}
                              onChange={(e) => {
                                const quantity = parseInt(e.target.value) || 0;
                                handleQuantityChange(item.id, quantity);
                              }}
                              w="100px"
                              size="sm"
                            />
                            {refundQuantity > 0 && (
                              <Text fontSize="sm" color="red.500" fontWeight="medium">
                                คืน: {formatCurrency(refundItem?.amount || 0)}
                              </Text>
                            )}
                          </VStack>
                        </HStack>
                      </CardBody>
                    </Card>
                  );
                })}
              </VStack>
            </Box>

            {/* Refund Summary */}
            {refundItems.length > 0 && (
              <Card variant="filled" bg="red.50" borderColor="red.200">
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    <Text fontWeight="bold" color="red.700">
                      สรุปการคืนสินค้า:
                    </Text>
                    {refundItems.map((refundItem) => {
                      const item = order.cart.items.find(
                        (i) => i.id === refundItem.itemId
                      );
                      return item ? (
                        <HStack key={refundItem.itemId} justify="space-between">
                          <Text fontSize="sm">
                            {item.product.name} x {refundItem.quantity}
                          </Text>
                          <Text fontSize="sm" fontWeight="medium">
                            {formatCurrency(refundItem.amount)}
                          </Text>
                        </HStack>
                      ) : null;
                    })}
                    <Divider borderColor="red.300" />
                    <HStack justify="space-between">
                      <Text fontWeight="bold" color="red.700">
                        ยอดคืนรวม:
                      </Text>
                      <Text fontWeight="bold" color="red.700" fontSize="lg">
                        {formatCurrency(totalRefundAmount)}
                      </Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack spacing={3}>
            <Button variant="ghost" onClick={onClose} isDisabled={isSubmitting}>
              ยกเลิก
            </Button>
            <Button
              colorScheme="red"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              isDisabled={refundItems.length === 0 || !refundReason}
            >
              ยืนยันคืนสินค้า
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ReturnModal;