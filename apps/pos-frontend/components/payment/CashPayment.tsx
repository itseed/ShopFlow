import React, { useState, useEffect } from "react";
import {
  VStack,
  HStack,
  Box,
  Text,
  Button,
  Input,
  SimpleGrid,
  useToast,
  Divider,
  Badge,
  Alert,
  AlertIcon,
  useColorModeValue,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { PaymentResult } from "@shopflow/types";
import { formatCurrency } from "../../lib/sales";

interface CashPaymentProps {
  amount: number;
  onPaymentComplete: (result: PaymentResult) => void;
  onCancel: () => void;
}

const CashPayment: React.FC<CashPaymentProps> = ({
  amount,
  onPaymentComplete,
  onCancel,
}) => {
  const [receivedAmount, setReceivedAmount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const toast = useToast();

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const greenBg = useColorModeValue("green.50", "green.900");
  const redBg = useColorModeValue("red.50", "red.900");

  const change = receivedAmount - amount;
  const isValidPayment = receivedAmount >= amount;

  // Quick amount buttons
  const quickAmounts = [20, 50, 100, 200, 500, 1000];

  const handleQuickAmount = (quickAmount: number) => {
    if (quickAmount >= amount) {
      setReceivedAmount(quickAmount);
    } else {
      // If quick amount is less than total, add to current received amount
      setReceivedAmount((prev) => prev + quickAmount);
    }
  };

  const handleExactAmount = () => {
    setReceivedAmount(amount);
  };

  const handlePayment = async () => {
    if (!isValidPayment) {
      toast({
        title: "จำนวนเงินไม่เพียงพอ",
        description: "กรุณาใส่จำนวนเงินที่รับมาให้ถูกต้อง",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const result: PaymentResult = {
        success: true,
        method: "cash",
        amount: amount,
        receivedAmount: receivedAmount,
        change: change,
        transactionId: `CASH_${Date.now()}`,
        timestamp: new Date().toISOString(),
      };

      onPaymentComplete(result);

      toast({
        title: "ชำระเงินสำเร็จ",
        description: `ทอนเงิน ${formatCurrency(change)}`,
        status: "success",
        duration: 3000,
      });
    } catch (error) {
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

  const handleReset = () => {
    setReceivedAmount(0);
  };

  return (
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

          <VStack spacing={3} w="full">
            <Text fontSize="sm" color="gray.600">
              จำนวนเงินที่รับมา
            </Text>
            <NumberInput
              value={receivedAmount}
              onChange={(_, valueAsNumber) =>
                setReceivedAmount(valueAsNumber || 0)
              }
              min={0}
              precision={2}
              size="lg"
              w="full"
            >
              <NumberInputField
                textAlign="center"
                fontSize="xl"
                fontWeight="bold"
                h="60px"
                placeholder="0.00"
              />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </VStack>

          <HStack justify="space-between" w="full">
            <Button size="sm" variant="outline" onClick={handleExactAmount}>
              จำนวนพอดี
            </Button>
            <Button size="sm" variant="outline" onClick={handleReset}>
              ล้างค่า
            </Button>
          </HStack>
        </VStack>
      </Box>

      {/* Quick Amount Buttons */}
      <Box w="full">
        <Text fontSize="sm" color="gray.600" mb={3}>
          จำนวนเงินที่ใช้บ่อย
        </Text>
        <SimpleGrid columns={3} spacing={3}>
          {quickAmounts.map((quickAmount) => (
            <Button
              key={quickAmount}
              size="lg"
              variant="outline"
              onClick={() => handleQuickAmount(quickAmount)}
              h="50px"
              fontSize="md"
              fontWeight="medium"
            >
              {formatCurrency(quickAmount)}
            </Button>
          ))}
        </SimpleGrid>
      </Box>

      {/* Change Calculation */}
      {receivedAmount > 0 && (
        <Box
          w="full"
          p={4}
          bg={isValidPayment ? greenBg : redBg}
          borderRadius="md"
          border="1px"
          borderColor={isValidPayment ? "green.200" : "red.200"}
        >
          <VStack spacing={2}>
            <HStack justify="space-between" w="full">
              <Text fontSize="md" fontWeight="medium">
                {isValidPayment ? "ทอนเงิน" : "ยอดขาด"}
              </Text>
              <Text
                fontSize="xl"
                fontWeight="bold"
                color={isValidPayment ? "green.600" : "red.600"}
              >
                {formatCurrency(Math.abs(change))}
              </Text>
            </HStack>

            {!isValidPayment && (
              <Alert status="error" size="sm">
                <AlertIcon />
                <Text fontSize="sm">จำนวนเงินที่รับมาไม่เพียงพอ</Text>
              </Alert>
            )}
          </VStack>
        </Box>
      )}

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
          colorScheme="green"
          size="lg"
          onClick={handlePayment}
          isLoading={isProcessing}
          loadingText="กำลังประมวลผล..."
          isDisabled={!isValidPayment || receivedAmount === 0}
          flex={2}
          h="60px"
        >
          ชำระเงิน
        </Button>
      </HStack>
    </VStack>
  );
};

export default CashPayment;
