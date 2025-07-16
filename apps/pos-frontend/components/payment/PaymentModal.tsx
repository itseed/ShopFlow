import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Box,
  Text,
  Button,
  useToast,
  Divider,
  Badge,
  useColorModeValue,
  SimpleGrid,
  Icon,
  Flex,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import {
  FaCreditCard,
  FaMoneyBillWave,
  FaQrcode,
  FaWallet,
} from "react-icons/fa";
import { SalesCart, SalesPaymentMethod, PaymentResult } from "@shopflow/types";
import { formatCurrency } from "../../lib/sales";
import CashPayment from "./CashPayment";
import CardPayment from "./CardPayment";
import QRPayment from "./QRPayment";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: SalesCart;
  onPaymentComplete: (result: PaymentResult) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  cart,
  onPaymentComplete,
}) => {
  const [selectedMethod, setSelectedMethod] =
    useState<SalesPaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [splitPayment, setSplitPayment] = useState(false);
  const [splitAmount, setSplitAmount] = useState(0);
  const [firstPaymentComplete, setFirstPaymentComplete] = useState(false);
  const [remainingAmount, setRemainingAmount] = useState(cart.total);

  const toast = useToast();
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const selectedBg = useColorModeValue("blue.50", "blue.900");
  const selectedBorder = useColorModeValue("blue.500", "blue.300");

  const paymentMethods = [
    {
      id: "cash" as SalesPaymentMethod,
      name: "เงินสด",
      icon: FaMoneyBillWave,
      color: "green",
      description: "ชำระด้วยเงินสด",
    },
    {
      id: "card" as SalesPaymentMethod,
      name: "บัตรเครดิต/เดบิต",
      icon: FaCreditCard,
      color: "blue",
      description: "ชำระด้วยบัตร",
    },
    {
      id: "qr" as SalesPaymentMethod,
      name: "QR Code",
      icon: FaQrcode,
      color: "purple",
      description: "PromptPay / QR Payment",
    },
    {
      id: "wallet" as SalesPaymentMethod,
      name: "E-Wallet",
      icon: FaWallet,
      color: "orange",
      description: "TrueMoney / ShopeePay",
    },
  ];

  useEffect(() => {
    if (isOpen) {
      setSelectedMethod(null);
      setIsProcessing(false);
      setSplitPayment(false);
      setSplitAmount(0);
      setFirstPaymentComplete(false);
      setRemainingAmount(cart.total);
    }
  }, [isOpen, cart.total]);

  const handleMethodSelect = (method: SalesPaymentMethod) => {
    setSelectedMethod(method);
  };

  const handlePaymentResult = (result: PaymentResult) => {
    if (splitPayment && !firstPaymentComplete) {
      // First payment in split payment
      setFirstPaymentComplete(true);
      setRemainingAmount(cart.total - splitAmount);
      setSelectedMethod(null);
      toast({
        title: "ชำระเงินส่วนแรกสำเร็จ",
        description: `ชำระแล้ว ${formatCurrency(
          splitAmount
        )} เหลือ ${formatCurrency(cart.total - splitAmount)}`,
        status: "success",
        duration: 3000,
      });
    } else {
      // Complete payment
      onPaymentComplete(result);
      onClose();
    }
  };

  const handleSplitPayment = () => {
    setSplitPayment(true);
    setSplitAmount(Math.floor(cart.total / 2));
  };

  const renderPaymentComponent = () => {
    if (!selectedMethod) return null;

    const paymentAmount =
      splitPayment && !firstPaymentComplete ? splitAmount : remainingAmount;

    switch (selectedMethod) {
      case "cash":
        return (
          <CashPayment
            amount={paymentAmount}
            onPaymentComplete={handlePaymentResult}
            onCancel={() => setSelectedMethod(null)}
          />
        );
      case "card":
        return (
          <CardPayment
            amount={paymentAmount}
            onPaymentComplete={handlePaymentResult}
            onCancel={() => setSelectedMethod(null)}
          />
        );
      case "qr":
        return (
          <QRPayment
            amount={paymentAmount}
            onPaymentComplete={handlePaymentResult}
            onCancel={() => setSelectedMethod(null)}
          />
        );
      case "wallet":
        return (
          <QRPayment
            amount={paymentAmount}
            onPaymentComplete={handlePaymentResult}
            onCancel={() => setSelectedMethod(null)}
            walletType="wallet"
          />
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent maxW="600px">
        <ModalHeader>
          <HStack justify="space-between" align="center">
            <Text fontSize="xl" fontWeight="bold">
              ชำระเงิน
            </Text>
            {splitPayment && (
              <Badge colorScheme="blue" fontSize="sm">
                {firstPaymentComplete ? "ชำระส่วนที่ 2" : "ชำระส่วนที่ 1"}
              </Badge>
            )}
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={6}>
            {/* Order Summary */}
            <Box
              w="full"
              p={4}
              bg={cardBg}
              borderRadius="md"
              border="1px"
              borderColor={borderColor}
            >
              <VStack spacing={3}>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="gray.600">
                    รายการสินค้า
                  </Text>
                  <Text fontSize="sm">{cart.items.length} รายการ</Text>
                </HStack>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="gray.600">
                    ยอดรวม
                  </Text>
                  <Text fontSize="lg" fontWeight="bold">
                    {formatCurrency(cart.total)}
                  </Text>
                </HStack>
                {splitPayment && (
                  <>
                    <Divider />
                    <HStack justify="space-between" w="full">
                      <Text fontSize="sm" color="gray.600">
                        {firstPaymentComplete
                          ? "ยอดชำระ (ส่วนที่ 2)"
                          : "ยอดชำระ (ส่วนที่ 1)"}
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color="blue.500">
                        {formatCurrency(
                          firstPaymentComplete ? remainingAmount : splitAmount
                        )}
                      </Text>
                    </HStack>
                  </>
                )}
              </VStack>
            </Box>

            {/* Payment Method Selection */}
            {!selectedMethod && (
              <VStack spacing={4} w="full">
                <HStack justify="space-between" w="full">
                  <Text fontSize="md" fontWeight="medium">
                    เลือกวิธีการชำระเงิน
                  </Text>
                  {!splitPayment && !firstPaymentComplete && (
                    <Button
                      size="sm"
                      variant="outline"
                      colorScheme="blue"
                      onClick={handleSplitPayment}
                    >
                      แยกชำระ
                    </Button>
                  )}
                </HStack>

                {splitPayment && !firstPaymentComplete && (
                  <Box w="full" p={3} bg="blue.50" borderRadius="md">
                    <VStack spacing={3}>
                      <Text fontSize="sm" color="blue.800">
                        กำหนดจำนวนเงินสำหรับการชำระส่วนแรก
                      </Text>
                      <NumberInput
                        value={splitAmount}
                        onChange={(_, valueAsNumber) =>
                          setSplitAmount(valueAsNumber || 0)
                        }
                        min={1}
                        max={cart.total - 1}
                        precision={2}
                        w="200px"
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <Text fontSize="xs" color="gray.600">
                        เหลือ: {formatCurrency(cart.total - splitAmount)}
                      </Text>
                    </VStack>
                  </Box>
                )}

                <SimpleGrid columns={2} spacing={4} w="full">
                  {paymentMethods.map((method) => (
                    <Box
                      key={method.id}
                      p={4}
                      bg={selectedMethod === method.id ? selectedBg : cardBg}
                      border="2px"
                      borderColor={
                        selectedMethod === method.id
                          ? selectedBorder
                          : borderColor
                      }
                      borderRadius="md"
                      cursor="pointer"
                      onClick={() => handleMethodSelect(method.id)}
                      _hover={{ borderColor: selectedBorder }}
                      transition="all 0.2s"
                    >
                      <VStack spacing={2}>
                        <Icon
                          as={method.icon}
                          w={8}
                          h={8}
                          color={`${method.color}.500`}
                        />
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          textAlign="center"
                        >
                          {method.name}
                        </Text>
                        <Text fontSize="xs" color="gray.600" textAlign="center">
                          {method.description}
                        </Text>
                      </VStack>
                    </Box>
                  ))}
                </SimpleGrid>
              </VStack>
            )}

            {/* Payment Component */}
            {renderPaymentComponent()}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            ยกเลิก
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default PaymentModal;
