import React, { useState, useMemo } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  useColorModeValue,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
  Progress,
  Table,
  TableContainer,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Input,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
} from "@chakra-ui/react";
import {
  IoTime,
  IoStop,
  IoCash,
  IoStatsChart,
  IoArrowBackOutline,
  IoRefresh,
  IoCheckmarkCircle,
  IoWarning,
  IoReceiptOutline,
  IoPeople,
  IoCard,
  IoQrCode,
  IoWallet,
} from "react-icons/io5";
import { POSLayout } from "../../components";
import { formatCurrency } from "../../lib/sales";
import { useRouter } from "next/router";

// Mock current shift data
const mockCurrentShift = {
  id: "shift_20250801_001",
  startTime: "2025-01-08T08:00:00",
  cashierName: "สมชาย ดีเยี่ยม",
  cashierId: "cashier001",
  openingCash: 5000,
  currentCash: 8750,
  totalSales: 12750,
  transactions: [
    {
      id: "txn_001",
      time: "08:15",
      amount: 350,
      paymentMethod: "cash",
      items: 3,
      customer: null,
    },
    {
      id: "txn_002", 
      time: "08:32",
      amount: 250,
      paymentMethod: "card",
      items: 2,
      customer: "ลูกค้า A",
    },
    {
      id: "txn_003",
      time: "08:45",
      amount: 180,
      paymentMethod: "qr",
      items: 1,
      customer: null,
    },
    // ... more transactions
  ],
  paymentBreakdown: {
    cash: { amount: 6750, count: 25 },
    card: { amount: 3500, count: 12 },
    qr: { amount: 2250, count: 8 },
    ewallet: { amount: 250, count: 2 },
  },
  hourlyStats: [
    { hour: "08:00", sales: 1250, transactions: 8 },
    { hour: "09:00", sales: 1850, transactions: 12 },
    { hour: "10:00", sales: 2150, transactions: 15 },
    { hour: "11:00", sales: 2750, transactions: 18 },
    { hour: "12:00", sales: 4750, transactions: 25 },
  ],
  targets: {
    dailySales: 15000,
    transactionTarget: 60,
  },
};

const CurrentShiftPage = () => {
  const [actualCash, setActualCash] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  
  const router = useRouter();
  const toast = useToast();
  const { isOpen: isCloseShiftOpen, onOpen: onCloseShiftOpen, onClose: onCloseShiftClose } = useDisclosure();

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #2d3748 0%, #1a202c 100%)"
  );

  const shift = mockCurrentShift;

  const shiftDuration = useMemo(() => {
    const start = new Date(shift.startTime);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60));
    const diffMinutes = Math.floor(((now.getTime() - start.getTime()) % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours} ชม. ${diffMinutes} นาที`;
  }, [shift.startTime]);

  const salesProgress = (shift.totalSales / shift.targets.dailySales) * 100;
  const transactionProgress = (shift.transactions.length / shift.targets.transactionTarget) * 100;

  const variance = actualCash - shift.currentCash;

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "cash": return IoCash;
      case "card": return IoCard;
      case "qr": return IoQrCode;
      case "ewallet": return IoWallet;
      default: return IoCash;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "cash": return "เงินสด";
      case "card": return "บัตร";
      case "qr": return "QR Code";
      case "ewallet": return "E-Wallet";
      default: return method;
    }
  };

  const handleCloseShift = async () => {
    setIsClosing(true);
    
    // Simulate shift closing process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "ปิดกะงานสำเร็จ",
      description: `ปิดกะงานเรียบร้อยแล้ว ความแตกต่าง: ${formatCurrency(Math.abs(variance))}`,
      status: variance === 0 ? "success" : "warning",
      duration: 5000,
    });
    
    setIsClosing(false);
    onCloseShiftClose();
    router.push("/shifts");
  };

  return (
    <POSLayout>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box
          bgGradient={bgGradient}
          borderRadius="2xl"
          p={8}
          color="white"
          position="relative"
          overflow="hidden"
          _before={{
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bg: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Flex
            justify="space-between"
            align="center"
            position="relative"
            zIndex={1}
          >
            <VStack align="start" spacing={3}>
              <HStack spacing={3}>
                <Box
                  p={3}
                  borderRadius="xl"
                  bg="rgba(255,255,255,0.2)"
                  color="white"
                >
                  <Icon as={IoTime} boxSize={6} />
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm" fontWeight="medium">
                    กะงานปัจจุบัน
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {shift.cashierName}
                  </Text>
                </VStack>
              </HStack>

              {/* Breadcrumb */}
              <Breadcrumb color="whiteAlpha.800" fontSize="sm">
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">หน้าแรก</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/shifts">จัดการกะงาน</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem isCurrentPage>
                  <BreadcrumbLink>กะงานปัจจุบัน</BreadcrumbLink>
                </BreadcrumbItem>
              </Breadcrumb>
            </VStack>

            <HStack spacing={3}>
              <Button
                leftIcon={<Icon as={IoArrowBackOutline} />}
                variant="ghost"
                colorScheme="whiteAlpha"
                onClick={() => router.push("/shifts")}
              >
                กลับ
              </Button>
              <Button
                leftIcon={<Icon as={IoRefresh} />}
                variant="solid"
                colorScheme="whiteAlpha"
              >
                รีเฟรช
              </Button>
              <Button
                leftIcon={<Icon as={IoStop} />}
                colorScheme="red"
                onClick={onCloseShiftOpen}
              >
                ปิดกะงาน
              </Button>
            </HStack>
          </Flex>

          {/* Shift Info */}
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 4 }}
            spacing={6}
            mt={8}
            position="relative"
            zIndex={1}
          >
            <Stat>
              <StatLabel color="whiteAlpha.800">เริ่มงาน</StatLabel>
              <StatNumber fontSize="2xl">
                {new Date(shift.startTime).toLocaleTimeString("th-TH", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </StatNumber>
              <StatHelpText color="whiteAlpha.800">
                ทำงานมาแล้ว {shiftDuration}
              </StatHelpText>
            </Stat>

            <Stat>
              <StatLabel color="whiteAlpha.800">เงินทอนต้นงาน</StatLabel>
              <StatNumber fontSize="2xl">
                {formatCurrency(shift.openingCash)}
              </StatNumber>
              <StatHelpText color="whiteAlpha.800">
                บาท
              </StatHelpText>
            </Stat>

            <Stat>
              <StatLabel color="whiteAlpha.800">ยอดขายปัจจุบัน</StatLabel>
              <StatNumber fontSize="2xl" color="green.200">
                {formatCurrency(shift.totalSales)}
              </StatNumber>
              <StatHelpText color="whiteAlpha.800">
                <StatArrow type="increase" />
                {((shift.totalSales / shift.targets.dailySales) * 100).toFixed(1)}% ของเป้า
              </StatHelpText>
            </Stat>

            <Stat>
              <StatLabel color="whiteAlpha.800">รายการขาย</StatLabel>
              <StatNumber fontSize="2xl" color="blue.200">
                {shift.transactions.length}
              </StatNumber>
              <StatHelpText color="whiteAlpha.800">
                รายการ
              </StatHelpText>
            </Stat>
          </SimpleGrid>
        </Box>

        {/* Progress Tracking */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardHeader>
              <HStack spacing={3}>
                <Icon as={IoStatsChart} color="green.500" />
                <Text fontSize="lg" fontWeight="bold">เป้าหมายยอดขาย</Text>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={4}>
                <HStack justify="space-between" w="full">
                  <Text>ปัจจุบัน: {formatCurrency(shift.totalSales)}</Text>
                  <Text>เป้าหมาย: {formatCurrency(shift.targets.dailySales)}</Text>
                </HStack>
                <Progress
                  value={salesProgress}
                  colorScheme={salesProgress >= 100 ? "green" : "blue"}
                  size="lg"
                  w="full"
                  borderRadius="full"
                />
                <Text fontSize="sm" color="gray.500">
                  {salesProgress.toFixed(1)}% ของเป้าหมาย
                </Text>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardHeader>
              <HStack spacing={3}>
                <Icon as={IoReceiptOutline} color="blue.500" />
                <Text fontSize="lg" fontWeight="bold">เป้าหมายรายการขาย</Text>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={4}>
                <HStack justify="space-between" w="full">
                  <Text>ปัจจุบัน: {shift.transactions.length} รายการ</Text>
                  <Text>เป้าหมาย: {shift.targets.transactionTarget} รายการ</Text>
                </HStack>
                <Progress
                  value={transactionProgress}
                  colorScheme={transactionProgress >= 100 ? "green" : "orange"}
                  size="lg"
                  w="full"
                  borderRadius="full"
                />
                <Text fontSize="sm" color="gray.500">
                  {transactionProgress.toFixed(1)}% ของเป้าหมาย
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Payment Breakdown */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Text fontSize="lg" fontWeight="bold">สรุปการชำระเงิน</Text>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
              {Object.entries(shift.paymentBreakdown).map(([method, data]) => (
                <VStack key={method} spacing={3} p={4} bg="gray.50" borderRadius="lg">
                  <Icon 
                    as={getPaymentMethodIcon(method)} 
                    boxSize={6} 
                    color="blue.500" 
                  />
                  <Text fontWeight="bold">{getPaymentMethodLabel(method)}</Text>
                  <Text fontSize="2xl" fontWeight="bold" color="green.600">
                    {formatCurrency(data.amount)}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {data.count} รายการ
                  </Text>
                </VStack>
              ))}
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* Recent Transactions */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Text fontSize="lg" fontWeight="bold">รายการขายล่าสุด</Text>
          </CardHeader>
          <CardBody>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>เวลา</Th>
                    <Th>จำนวนเงิน</Th>
                    <Th>การชำระ</Th>
                    <Th>รายการ</Th>
                    <Th>ลูกค้า</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {shift.transactions.slice(-10).map((txn) => (
                    <Tr key={txn.id}>
                      <Td>{txn.time}</Td>
                      <Td fontWeight="bold" color="green.600">
                        {formatCurrency(txn.amount)}
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Icon as={getPaymentMethodIcon(txn.paymentMethod)} boxSize={4} />
                          <Text>{getPaymentMethodLabel(txn.paymentMethod)}</Text>
                        </HStack>
                      </Td>
                      <Td>{txn.items} รายการ</Td>
                      <Td>{txn.customer || "-"}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>

        {/* Close Shift Modal */}
        <Modal isOpen={isCloseShiftOpen} onClose={onCloseShiftClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack spacing={3}>
                <Icon as={IoStop} color="red.500" />
                <Text>ปิดกะงาน</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            
            <ModalBody>
              <VStack spacing={6} align="stretch">
                <Alert status="info">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>กรุณานับเงินสดในลิ้นชัก</AlertTitle>
                    <AlertDescription>
                      นับเงินสดทั้งหมดในลิ้นชักและกรอกจำนวนที่นับได้
                    </AlertDescription>
                  </Box>
                </Alert>

                <SimpleGrid columns={2} spacing={4}>
                  <VStack align="start" spacing={2}>
                    <Text fontWeight="bold">เงินสดที่คาดหวัง</Text>
                    <Text fontSize="2xl" color="blue.600">
                      {formatCurrency(shift.currentCash)}
                    </Text>
                  </VStack>
                  <VStack align="start" spacing={2}>
                    <Text fontWeight="bold">เงินสดที่นับได้</Text>
                    <NumberInput
                      value={actualCash}
                      onChange={(_, value) => setActualCash(value)}
                      min={0}
                      precision={2}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </VStack>
                </SimpleGrid>

                {actualCash > 0 && (
                  <Alert status={variance === 0 ? "success" : variance > 0 ? "warning" : "error"}>
                    <AlertIcon />
                    <Box>
                      <AlertTitle>
                        ความแตกต่าง: {variance >= 0 ? "+" : ""}{formatCurrency(Math.abs(variance))}
                      </AlertTitle>
                      <AlertDescription>
                        {variance === 0 ? "เงินสดครบถ้วนตามที่คาดหวัง" :
                         variance > 0 ? "เงินสดเกินกว่าที่คาดหวัง" : "เงินสดขาดจากที่คาดหวัง"}
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}

                <FormControl>
                  <FormLabel>หมายเหตุ (ถ้ามี)</FormLabel>
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="ระบุหมายเหตุเพิ่มเติม..."
                  />
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <HStack spacing={3}>
                <Button variant="ghost" onClick={onCloseShiftClose}>
                  ยกเลิก
                </Button>
                <Button
                  colorScheme="red"
                  onClick={handleCloseShift}
                  isLoading={isClosing}
                  loadingText="กำลังปิดกะงาน..."
                  isDisabled={actualCash === 0}
                >
                  ปิดกะงาน
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </POSLayout>
  );
};

export default CurrentShiftPage;