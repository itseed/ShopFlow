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
  Progress,
  Icon,
} from "@chakra-ui/react";
import {
  IoWarning,
  IoCheckmarkCircle,
  IoCash,
  IoCard,
  IoTime,
} from "react-icons/io5";

interface RefundData {
  refundId: string;
  originalOrderId: string;
  refundAmount: number;
  refundReason: string;
  refundMethod: "cash" | "card" | "original_method";
  estimatedProcessingTime: string;
  approvalRequired: boolean;
}

interface RefundModalProps {
  refundData: RefundData | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (refundMethod: string, notes?: string) => Promise<void>;
  onCancel?: () => void;
}

const RefundModal: React.FC<RefundModalProps> = ({
  refundData,
  isOpen,
  onClose,
  onConfirm,
  onCancel,
}) => {
  const [refundMethod, setRefundMethod] = useState("original_method");
  const [processingNotes, setProcessingNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const toast = useToast();

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const handleConfirm = async () => {
    if (!refundData) return;

    setIsProcessing(true);
    setProcessingStep(1);

    try {
      // Simulate processing steps
      for (let step = 1; step <= 4; step++) {
        setProcessingStep(step);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      await onConfirm(refundMethod, processingNotes);

      toast({
        title: "คืนเงินสำเร็จ",
        description: `คืนเงินจำนวน ${formatCurrency(
          refundData.refundAmount
        )} เรียบร้อยแล้ว`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      onClose();
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดำเนินการคืนเงินได้",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
      setProcessingStep(0);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onClose();
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getRefundMethodText = (method: string) => {
    switch (method) {
      case "cash":
        return "คืนเป็นเงินสด";
      case "card":
        return "คืนเข้าบัตรเครดิต/เดบิต";
      case "original_method":
        return "คืนตามวิธีการชำระเดิม";
      default:
        return method;
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

  const getProcessingStepText = (step: number) => {
    switch (step) {
      case 1:
        return "กำลังตรวจสอบข้อมูล...";
      case 2:
        return "กำลังประมวลผลการคืนเงิน...";
      case 3:
        return "กำลังอัปเดตระบบ...";
      case 4:
        return "กำลังสร้างใบเสร็จคืนเงิน...";
      default:
        return "เตรียมดำเนินการ";
    }
  };

  if (!refundData) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      closeOnOverlayClick={!isProcessing}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={3}>
            <Icon as={IoCash} color="orange.500" boxSize={6} />
            <VStack align="start" spacing={0}>
              <Text>ยืนยันการคืนเงิน</Text>
              <Text fontSize="sm" color="gray.500" fontWeight="normal">
                รหัสการคืน: {refundData.refundId}
              </Text>
            </VStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton isDisabled={isProcessing} />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Processing Status */}
            {isProcessing && (
              <Card variant="filled" bg="blue.50" borderColor="blue.200">
                <CardBody>
                  <VStack spacing={4}>
                    <HStack spacing={3}>
                      <Icon as={IoTime} color="blue.500" />
                      <Text fontWeight="medium" color="blue.700">
                        กำลังดำเนินการคืนเงิน...
                      </Text>
                    </HStack>
                    <Progress
                      value={(processingStep / 4) * 100}
                      colorScheme="blue"
                      size="lg"
                      w="full"
                      borderRadius="md"
                    />
                    <Text fontSize="sm" color="blue.600">
                      {getProcessingStepText(processingStep)}
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            )}

            {/* Refund Information */}
            <Card variant="outline" bg={cardBg}>
              <CardBody>
                <VStack spacing={3} align="stretch">
                  <Text fontWeight="bold" fontSize="lg">
                    ข้อมูลการคืนเงิน
                  </Text>
                  <HStack justify="space-between">
                    <Text color="gray.600">จำนวนเงินที่คืน:</Text>
                    <Text fontWeight="bold" fontSize="xl" color="red.600">
                      {formatCurrency(refundData.refundAmount)}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.600">เหตุผลการคืน:</Text>
                    <Text fontWeight="medium">
                      {getReasonText(refundData.refundReason)}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text color="gray.600">เวลาประมวลผลโดยประมาณ:</Text>
                    <Text fontWeight="medium">
                      {refundData.estimatedProcessingTime}
                    </Text>
                  </HStack>
                  {refundData.approvalRequired && (
                    <Alert status="warning" borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <AlertTitle fontSize="sm">ต้องการการอนุมัติ</AlertTitle>
                        <AlertDescription fontSize="sm">
                          การคืนเงินนี้ต้องผ่านการอนุมัติจากผู้จัดการก่อน
                        </AlertDescription>
                      </Box>
                    </Alert>
                  )}
                </VStack>
              </CardBody>
            </Card>

            {/* Refund Method Selection */}
            {!isProcessing && (
              <Card variant="outline" bg={cardBg}>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Text fontWeight="bold">วิธีการคืนเงิน</Text>
                    <FormControl isRequired>
                      <FormLabel>เลือกวิธีการคืนเงิน</FormLabel>
                      <Select
                        value={refundMethod}
                        onChange={(e) => setRefundMethod(e.target.value)}
                        isDisabled={isProcessing}
                      >
                        <option value="original_method">
                          คืนตามวิธีการชำระเดิม
                        </option>
                        <option value="cash">คืนเป็นเงินสด</option>
                        <option value="card">คืนเข้าบัตรเครดิต/เดบิต</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>หมายเหตุการประมวลผล</FormLabel>
                      <Textarea
                        placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
                        value={processingNotes}
                        onChange={(e) => setProcessingNotes(e.target.value)}
                        rows={3}
                        isDisabled={isProcessing}
                      />
                    </FormControl>
                  </VStack>
                </CardBody>
              </Card>
            )}

            {/* Important Notes */}
            {!isProcessing && (
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle fontSize="sm">ข้อมูลสำคัญ</AlertTitle>
                  <AlertDescription fontSize="sm">
                    • การคืนเงินจะใช้เวลา {refundData.estimatedProcessingTime}
                    <br />
                    • ลูกค้าจะได้รับใบเสร็จการคืนเงิน
                    <br />
                    • สามารถติดตามสถานะได้ผ่านรหัสการคืน
                    <br />• การคืนเงินนี้ไม่สามารถยกเลิกได้หลังจากยืนยันแล้ว
                  </AlertDescription>
                </Box>
              </Alert>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack spacing={3} w="full" justify="space-between">
            <Button
              variant="ghost"
              onClick={handleCancel}
              isDisabled={isProcessing}
            >
              ยกเลิก
            </Button>
            <HStack spacing={2}>
              <Text fontSize="sm" color="gray.500">
                วิธีการ: {getRefundMethodText(refundMethod)}
              </Text>
              <Button
                colorScheme="red"
                onClick={handleConfirm}
                isLoading={isProcessing}
                loadingText="กำลังประมวลผล..."
              >
                ยืนยันคืนเงิน
              </Button>
            </HStack>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default RefundModal;