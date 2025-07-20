import React, { useState, useEffect } from "react";
import {
  VStack,
  HStack,
  Box,
  Text,
  Button,
  useToast,
  Divider,
  Alert,
  AlertIcon,
  useColorModeValue,
  Select,
  Center,
  Image,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Progress,
} from "@chakra-ui/react";
import { FaQrcode, FaCheck, FaTimes } from "react-icons/fa";
import { PaymentResult } from "@shopflow/types";
import { formatCurrency } from "../../lib/sales";

interface QRPaymentProps {
  amount: number;
  onPaymentComplete: (result: PaymentResult) => void;
  onCancel: () => void;
  walletType?: "qr" | "wallet";
}

const QRPayment: React.FC<QRPaymentProps> = ({
  amount,
  onPaymentComplete,
  onCancel,
  walletType = "qr",
}) => {
  const [selectedProvider, setSelectedProvider] = useState<string>("promptpay");
  const [qrCode, setQrCode] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isWaitingPayment, setIsWaitingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "checking" | "success" | "failed"
  >("pending");
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const blueBg = useColorModeValue("blue.50", "blue.900");
  const greenBg = useColorModeValue("green.50", "green.900");
  const redBg = useColorModeValue("red.50", "red.900");

  const qrProviders = [
    { id: "promptpay", name: "PromptPay", logo: "🏦" },
    { id: "truemoney", name: "TrueMoney Wallet", logo: "💳" },
    { id: "shopeepay", name: "ShopeePay", logo: "🛒" },
    { id: "rabbit", name: "Rabbit LINE Pay", logo: "🐰" },
  ];

  const walletProviders = [
    { id: "truemoney", name: "TrueMoney Wallet", logo: "💳" },
    { id: "shopeepay", name: "ShopeePay", logo: "🛒" },
    { id: "rabbit", name: "Rabbit LINE Pay", logo: "🐰" },
    { id: "airpay", name: "AirPay", logo: "✈️" },
  ];

  const providers = walletType === "wallet" ? walletProviders : qrProviders;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWaitingPayment && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setPaymentStatus("failed");
      setIsWaitingPayment(false);
      toast({
        title: "หมดเวลาการชำระเงิน",
        description: "กรุณาทำรายการใหม่อีกครั้ง",
        status: "error",
        duration: 5000,
      });
    }
    return () => clearInterval(interval);
  }, [isWaitingPayment, timeRemaining, toast]);

  const generateQRCode = async () => {
    setIsGenerating(true);

    try {
      // Simulate QR code generation
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Generate mock QR code data
      const qrData = `${selectedProvider}://pay?amount=${amount}&ref=${Date.now()}`;
      setQrCode(qrData);
      setIsWaitingPayment(true);
      setPaymentStatus("pending");
      setTimeRemaining(300);
      onOpen();

      // Start checking payment status
      checkPaymentStatus();
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถสร้าง QR Code ได้",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const checkPaymentStatus = async () => {
    // Simulate payment status checking
    const checkInterval = setInterval(async () => {
      if (paymentStatus === "success" || paymentStatus === "failed") {
        clearInterval(checkInterval);
        return;
      }

      setPaymentStatus("checking");

      // Simulate random payment success after 10-30 seconds
      const randomDelay = Math.random() * 20000 + 10000;

      setTimeout(() => {
        if (Math.random() > 0.3) {
          // 70% success rate
          setPaymentStatus("success");
          setIsWaitingPayment(false);

          const result: PaymentResult = {
            success: true,
            method: walletType === "wallet" ? "wallet" : "qr",
            amount: amount,
            transactionId: `${selectedProvider.toUpperCase()}_${Date.now()}`,
            timestamp: new Date().toISOString(),
            qrCode: qrCode,
            walletType: selectedProvider as any,
          };

          setTimeout(() => {
            onPaymentComplete(result);
            onClose();

            toast({
              title: "ชำระเงินสำเร็จ",
              description: `ชำระผ่าน ${
                providers.find((p) => p.id === selectedProvider)?.name
              } สำเร็จ`,
              status: "success",
              duration: 3000,
            });
          }, 1000);
        }
      }, randomDelay);
    }, 3000);
  };

  const handleCancel = () => {
    setIsWaitingPayment(false);
    setPaymentStatus("pending");
    setQrCode("");
    onClose();
    onCancel();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const renderPaymentStatus = () => {
    switch (paymentStatus) {
      case "pending":
        return (
          <VStack spacing={4}>
            <Box fontSize="64px">📱</Box>
            <Text fontSize="lg" fontWeight="bold">
              สแกน QR Code เพื่อชำระเงิน
            </Text>
            <Text fontSize="md" color="gray.600" textAlign="center">
              เปิดแอป {providers.find((p) => p.id === selectedProvider)?.name}{" "}
              และสแกน QR Code
            </Text>
          </VStack>
        );

      case "checking":
        return (
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" />
            <Text fontSize="lg" fontWeight="bold">
              กำลังตรวจสอบการชำระเงิน...
            </Text>
            <Text fontSize="sm" color="gray.600">
              กรุณารอสักครู่
            </Text>
          </VStack>
        );

      case "success":
        return (
          <VStack spacing={4}>
            <Box color="green.500" fontSize="64px">
              ✓
            </Box>
            <Text fontSize="lg" fontWeight="bold" color="green.600">
              ชำระเงินสำเร็จ
            </Text>
            <Text fontSize="md" color="gray.600">
              {formatCurrency(amount)}
            </Text>
          </VStack>
        );

      case "failed":
        return (
          <VStack spacing={4}>
            <Box color="red.500" fontSize="64px">
              ✗
            </Box>
            <Text fontSize="lg" fontWeight="bold" color="red.600">
              การชำระเงินล้มเหลว
            </Text>
            <Text fontSize="sm" color="gray.600">
              กรุณาลองใหม่อีกครั้ง
            </Text>
          </VStack>
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

            <VStack spacing={3} w="full">
              <Text fontSize="sm" color="gray.600">
                เลือก
                {walletType === "wallet"
                  ? "กระเป๋าเงินอิเล็กทรอนิกส์"
                  : "วิธีการชำระ"}
              </Text>
              <Select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                size="lg"
              >
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.logo} {provider.name}
                  </option>
                ))}
              </Select>
            </VStack>
          </VStack>
        </Box>

        {/* Info Alert */}
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <VStack spacing={1} align="start">
            <Text fontSize="sm" fontWeight="medium">
              วิธีการชำระเงิน
            </Text>
            <Text fontSize="xs">
              1. กดปุ่ม "สร้าง QR Code"
              <br />
              2. สแกน QR Code ด้วยแอปที่เลือก
              <br />
              3. ยืนยันการชำระเงินในแอป
            </Text>
          </VStack>
        </Alert>

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
            onClick={generateQRCode}
            isLoading={isGenerating}
            loadingText="กำลังสร้าง QR Code..."
            flex={2}
            h="60px"
            leftIcon={<FaQrcode />}
          >
            สร้าง QR Code
          </Button>
        </HStack>
      </VStack>

      {/* QR Code Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => {}}
        closeOnOverlayClick={false}
        size="md"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack justify="space-between" align="center">
              <Text>การชำระเงิน</Text>
              {isWaitingPayment && (
                <Text fontSize="sm" color="gray.600">
                  เหลือเวลา: {formatTime(timeRemaining)}
                </Text>
              )}
            </HStack>
            {isWaitingPayment && (
              <Progress
                value={((300 - timeRemaining) / 300) * 100}
                colorScheme="blue"
                size="sm"
                mt={2}
              />
            )}
          </ModalHeader>

          <ModalBody>
            <VStack spacing={6}>
              {/* QR Code Display */}
              {qrCode && paymentStatus === "pending" && (
                <Box
                  w="250px"
                  h="250px"
                  bg="white"
                  p={4}
                  borderRadius="md"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  border="2px"
                  borderColor="gray.300"
                >
                  {/* Mock QR Code - in real app, use QR code library */}
                  <Box
                    w="full"
                    h="full"
                    bg="black"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="white"
                    fontSize="sm"
                    textAlign="center"
                  >
                    QR CODE
                    <br />
                    {formatCurrency(amount)}
                  </Box>
                </Box>
              )}

              {/* Payment Status */}
              <Box textAlign="center">{renderPaymentStatus()}</Box>

              {/* Amount Display */}
              <Box
                p={3}
                bg={paymentStatus === "success" ? greenBg : blueBg}
                borderRadius="md"
                w="full"
              >
                <Text textAlign="center" fontSize="lg" fontWeight="bold">
                  {formatCurrency(amount)}
                </Text>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            {paymentStatus === "pending" && (
              <Button
                onClick={handleCancel}
                colorScheme="red"
                variant="outline"
              >
                ยกเลิก
              </Button>
            )}
            {paymentStatus === "failed" && (
              <Button onClick={handleCancel} colorScheme="gray">
                ปิด
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default QRPayment;
