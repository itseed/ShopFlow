import React, { useState, useEffect } from "react";
import {
  VStack,
  HStack,
  Box,
  Text,
  Button,
  Input,
  Select,
  useToast,
  Divider,
  Badge,
  Alert,
  AlertIcon,
  useColorModeValue,
  FormControl,
  FormLabel,
  PinInput,
  PinInputField,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { FaCreditCard, FaShieldAlt } from "react-icons/fa";
import { PaymentResult } from "@shopflow/types";
import { formatCurrency } from "../../lib/sales";

interface CardPaymentProps {
  amount: number;
  onPaymentComplete: (result: PaymentResult) => void;
  onCancel: () => void;
}

const CardPayment: React.FC<CardPaymentProps> = ({
  amount,
  onPaymentComplete,
  onCancel,
}) => {
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [paymentType, setPaymentType] = useState<"credit" | "debit">("credit");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<
    "card" | "pin" | "processing" | "complete"
  >("card");
  const [pin, setPin] = useState("");

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const blueBg = useColorModeValue("blue.50", "blue.900");

  const isValidCard =
    cardNumber.length >= 16 && expiryDate.length >= 5 && cvv.length >= 3;

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.length <= 19) {
      setCardNumber(formatted);
    }
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    if (formatted.length <= 5) {
      setExpiryDate(formatted);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/gi, "");
    if (value.length <= 4) {
      setCvv(value);
    }
  };

  const handleCardPayment = async () => {
    if (!isValidCard) {
      toast({
        title: "ข้อมูลบัตรไม่ถูกต้อง",
        description: "กรุณากรอกข้อมูลบัตรให้ครบถ้วน",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setIsProcessing(true);
    setProcessingStep("pin");
    onOpen();
  };

  const handlePinSubmit = async () => {
    if (pin.length !== 6) {
      toast({
        title: "PIN ไม่ถูกต้อง",
        description: "กรุณาใส่ PIN 6 หลัก",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setProcessingStep("processing");

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const result: PaymentResult = {
        success: true,
        method: "card",
        amount: amount,
        cardType: paymentType,
        cardNumber: cardNumber.slice(-4),
        transactionId: `CARD_${Date.now()}`,
        timestamp: new Date().toISOString(),
        approvalCode: `APP${Math.random()
          .toString(36)
          .substr(2, 9)
          .toUpperCase()}`,
      };

      setProcessingStep("complete");

      setTimeout(() => {
        onPaymentComplete(result);
        onClose();

        toast({
          title: "ชำระเงินสำเร็จ",
          description: `ชำระด้วยบัตรสำเร็จ ${formatCurrency(amount)}`,
          status: "success",
          duration: 3000,
        });
      }, 1000);
    } catch (error) {
      setProcessingStep("card");
      onClose();

      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถประมวลผลการชำระเงินได้",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setProcessingStep("card");
    setPin("");
    onClose();
    onCancel();
  };

  const renderProcessingContent = () => {
    switch (processingStep) {
      case "pin":
        return (
          <>
            <ModalHeader>ใส่รหัส PIN</ModalHeader>
            <ModalBody>
              <VStack spacing={4}>
                <FaShieldAlt size="48" color="blue" />
                <Text textAlign="center" color="gray.600">
                  กรุณาใส่รหัส PIN 6 หลัก
                </Text>
                <HStack spacing={2}>
                  <PinInput
                    value={pin}
                    onChange={setPin}
                    size="lg"
                    type="number"
                  >
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                  </PinInput>
                </HStack>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" onClick={handleCancel} mr={3}>
                ยกเลิก
              </Button>
              <Button
                colorScheme="blue"
                onClick={handlePinSubmit}
                isDisabled={pin.length !== 6}
              >
                ยืนยัน
              </Button>
            </ModalFooter>
          </>
        );

      case "processing":
        return (
          <>
            <ModalHeader>กำลังประมวลผล</ModalHeader>
            <ModalBody>
              <Center>
                <VStack spacing={4}>
                  <Spinner size="xl" color="blue.500" />
                  <Text>กำลังติดต่อธนาคาร...</Text>
                  <Text fontSize="sm" color="gray.600">
                    กรุณาอย่าถอดบัตรหรือยกเลิกการทำรายการ
                  </Text>
                </VStack>
              </Center>
            </ModalBody>
          </>
        );

      case "complete":
        return (
          <>
            <ModalHeader>ชำระเงินสำเร็จ</ModalHeader>
            <ModalBody>
              <Center>
                <VStack spacing={4}>
                  <Box color="green.500" fontSize="48px">
                    ✓
                  </Box>
                  <Text color="green.600" fontWeight="bold">
                    การชำระเงินสำเร็จ
                  </Text>
                  <Text color="gray.600">{formatCurrency(amount)}</Text>
                </VStack>
              </Center>
            </ModalBody>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <VStack spacing={6} w="full">
        <Box
          w="full"
          p={4}
          bg={cardBg}
          borderRadius="md"
          border="1px"
          borderColor={borderColor}
        >
          <VStack spacing={4}>
            <HStack justify="space-between" w="full">
              <Text fontSize="md" fontWeight="medium">
                ยอดที่ต้องชำระ
              </Text>
              <Text fontSize="xl" fontWeight="bold" color="red.500">
                {formatCurrency(amount)}
              </Text>
            </HStack>

            <Divider />

            <FormControl>
              <FormLabel>ประเภทบัตร</FormLabel>
              <Select
                value={paymentType}
                onChange={(e) =>
                  setPaymentType(e.target.value as "credit" | "debit")
                }
              >
                <option value="credit">บัตรเครดิต</option>
                <option value="debit">บัตรเดบิต</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>หมายเลขบัตร</FormLabel>
              <Input
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                size="lg"
                fontFamily="mono"
                letterSpacing="wider"
              />
            </FormControl>

            <HStack spacing={4} w="full">
              <FormControl>
                <FormLabel>วันหมดอายุ</FormLabel>
                <Input
                  value={expiryDate}
                  onChange={handleExpiryDateChange}
                  placeholder="MM/YY"
                  size="lg"
                  fontFamily="mono"
                />
              </FormControl>

              <FormControl>
                <FormLabel>CVV</FormLabel>
                <Input
                  value={cvv}
                  onChange={handleCvvChange}
                  placeholder="123"
                  size="lg"
                  fontFamily="mono"
                  type="password"
                />
              </FormControl>
            </HStack>

            <FormControl>
              <FormLabel>ชื่อผู้ถือบัตร</FormLabel>
              <Input
                value={cardholderName}
                onChange={(e) =>
                  setCardholderName(e.target.value.toUpperCase())
                }
                placeholder="CARDHOLDER NAME"
                size="lg"
                textTransform="uppercase"
              />
            </FormControl>
          </VStack>
        </Box>

        {/* Security Notice */}
        <Box w="full" p={3} bg={blueBg} borderRadius="md">
          <HStack spacing={2}>
            <FaShieldAlt color="blue" />
            <Text fontSize="sm" color="blue.800">
              ข้อมูลบัตรของคุณได้รับการป้องกันด้วยระบบความปลอดภัยระดับสูง
            </Text>
          </HStack>
        </Box>

        {/* Action Buttons */}
        <HStack spacing={4} w="full">
          <Button
            variant="outline"
            size="lg"
            onClick={onCancel}
            flex={1}
            h="60px"
          >
            ยกเลิก
          </Button>
          <Button
            colorScheme="blue"
            size="lg"
            onClick={handleCardPayment}
            isLoading={isProcessing}
            loadingText="กำลังประมวลผล..."
            isDisabled={!isValidCard}
            flex={2}
            h="60px"
            leftIcon={<FaCreditCard />}
          >
            ชำระเงิน
          </Button>
        </HStack>
      </VStack>

      {/* Processing Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => {}}
        closeOnOverlayClick={false}
        size="md"
      >
        <ModalOverlay />
        <ModalContent>{renderProcessingContent()}</ModalContent>
      </Modal>
    </>
  );
};

export default CardPayment;
