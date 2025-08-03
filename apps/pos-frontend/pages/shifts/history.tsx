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
  Badge,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  TableContainer,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import {
  IoCalendar,
  IoArrowBackOutline,
  IoDownload,
  IoPrint,
  IoSearch,
  IoFilter,
  IoEye,
  IoTime,
  IoCash,
  IoStatsChart,
  IoCheckmarkCircle,
  IoWarning,
  IoAlertCircle,
} from "react-icons/io5";
import { POSLayout } from "../../components";
import { formatCurrency } from "../../lib/sales";
import { useRouter } from "next/router";

// Mock shift history data
const mockShiftHistory = [
  {
    id: "shift_20250107_003",
    date: "2025-01-07",
    cashierName: "สมหญิง เก่งดี",
    startTime: "16:00",
    endTime: "23:59",
    duration: "7:59",
    openingCash: 5000,
    expectedCash: 9200,
    actualCash: 9180,
    variance: -20,
    totalSales: 15200,
    transactionCount: 52,
    status: "completed",
    performance: "good",
    notes: "",
  },
  {
    id: "shift_20250107_002",
    date: "2025-01-07",
    cashierName: "สมชาย ดีเยี่ยม",
    startTime: "08:00",
    endTime: "16:00",
    duration: "8:00",
    openingCash: 5000,
    expectedCash: 8750,
    actualCash: 8750,
    variance: 0,
    totalSales: 12750,
    transactionCount: 38,
    status: "completed",
    performance: "excellent",
    notes: "",
  },
  {
    id: "shift_20250106_002",
    date: "2025-01-06",
    cashierName: "สมหญิง เก่งดี",
    startTime: "08:00",
    endTime: "16:00",
    duration: "8:00",
    openingCash: 5000,
    expectedCash: 7850,
    actualCash: 7820,
    variance: -30,
    totalSales: 9850,
    transactionCount: 42,
    status: "completed",
    performance: "good",
    notes: "เงินขาดจากการทอนผิด",
  },
  {
    id: "shift_20250106_001",
    date: "2025-01-06",
    cashierName: "สมใจ มืออาชีพ",
    startTime: "08:00",
    endTime: "16:00",
    duration: "8:00",
    openingCash: 5000,
    expectedCash: 11250,
    actualCash: 11200,
    variance: -50,
    totalSales: 18250,
    transactionCount: 67,
    status: "completed",
    performance: "good",
    notes: "วันที่มียอดขายสูง",
  },
  {
    id: "shift_20250105_003",
    date: "2025-01-05",
    cashierName: "สมชาย ดีเยี่ยม",
    startTime: "16:00",
    endTime: "23:59",
    duration: "7:59",
    openingCash: 5000,
    expectedCash: 8950,
    actualCash: 8950,
    variance: 0,
    totalSales: 13950,
    transactionCount: 45,
    status: "completed",
    performance: "excellent",
    notes: "",
  },
];

const ShiftHistoryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [selectedCashier, setSelectedCashier] = useState("all");
  const [selectedShift, setSelectedShift] = useState<any>(null);
  
  const router = useRouter();
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #2d3748 0%, #1a202c 100%)"
  );

  const shifts = mockShiftHistory;

  // Filter shifts based on search and filters
  const filteredShifts = useMemo(() => {
    return shifts.filter(shift => {
      const matchSearch = !searchTerm || 
        shift.cashierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shift.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchCashier = selectedCashier === "all" || shift.cashierName === selectedCashier;
      
      return matchSearch && matchCashier;
    });
  }, [shifts, searchTerm, selectedCashier]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalShifts = filteredShifts.length;
    const totalSales = filteredShifts.reduce((sum, shift) => sum + shift.totalSales, 0);
    const totalTransactions = filteredShifts.reduce((sum, shift) => sum + shift.transactionCount, 0);
    const totalVariance = filteredShifts.reduce((sum, shift) => sum + shift.variance, 0);
    const averageSales = totalSales / (totalShifts || 1);
    const perfectShifts = filteredShifts.filter(shift => shift.variance === 0).length;
    const accuracyRate = (perfectShifts / (totalShifts || 1)) * 100;

    return {
      totalShifts,
      totalSales,
      totalTransactions,
      totalVariance,
      averageSales,
      perfectShifts,
      accuracyRate,
    };
  }, [filteredShifts]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "green";
      case "cancelled": return "red";
      default: return "gray";
    }
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case "excellent": return "green";
      case "good": return "blue";
      case "fair": return "orange";
      case "poor": return "red";
      default: return "gray";
    }
  };

  const getPerformanceLabel = (performance: string) => {
    switch (performance) {
      case "excellent": return "ดีเยี่ยม";
      case "good": return "ดี";
      case "fair": return "พอใช้";
      case "poor": return "ต้องปรับปรุง";
      default: return performance;
    }
  };

  const getVarianceColor = (variance: number) => {
    if (variance === 0) return "green";
    if (Math.abs(variance) <= 50) return "orange";
    return "red";
  };

  const getVarianceIcon = (variance: number) => {
    if (variance === 0) return IoCheckmarkCircle;
    if (Math.abs(variance) <= 50) return IoWarning;
    return IoAlertCircle;
  };

  const handleViewDetails = (shift: any) => {
    setSelectedShift(shift);
    onDetailOpen();
  };

  const uniqueCashiers = [...new Set(shifts.map(shift => shift.cashierName))];

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
                  <Icon as={IoCalendar} boxSize={6} />
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm" fontWeight="medium">
                    ประวัติกะงาน
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    รายงานกะงานทั้งหมด
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
                  <BreadcrumbLink>ประวัติกะงาน</BreadcrumbLink>
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
                leftIcon={<Icon as={IoDownload} />}
                variant="solid"
                colorScheme="whiteAlpha"
              >
                ส่งออก
              </Button>
            </HStack>
          </Flex>
        </Box>

        {/* Summary Statistics */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Stat>
            <StatLabel>กะงานทั้งหมด</StatLabel>
            <StatNumber fontSize="3xl">{summaryStats.totalShifts}</StatNumber>
            <StatHelpText>กะงาน</StatHelpText>
          </Stat>

          <Stat>
            <StatLabel>ยอดขายรวม</StatLabel>
            <StatNumber fontSize="3xl" color="green.600">
              {formatCurrency(summaryStats.totalSales)}
            </StatNumber>
            <StatHelpText>
              เฉลี่ย {formatCurrency(summaryStats.averageSales)} ต่อกะ
            </StatHelpText>
          </Stat>

          <Stat>
            <StatLabel>ความแม่นยำเงินสด</StatLabel>
            <StatNumber fontSize="3xl" color="blue.600">
              {summaryStats.accuracyRate.toFixed(1)}%
            </StatNumber>
            <StatHelpText>
              {summaryStats.perfectShifts} กะงานที่ครบถ้วน
            </StatHelpText>
          </Stat>

          <Stat>
            <StatLabel>ความแตกต่างรวม</StatLabel>
            <StatNumber 
              fontSize="3xl" 
              color={getVarianceColor(summaryStats.totalVariance)}
            >
              {summaryStats.totalVariance >= 0 ? "+" : ""}
              {formatCurrency(Math.abs(summaryStats.totalVariance))}
            </StatNumber>
            <StatHelpText>
              {summaryStats.totalVariance === 0 ? "ครบถ้วน" :
               summaryStats.totalVariance > 0 ? "เกิน" : "ขาด"}
            </StatHelpText>
          </Stat>
        </SimpleGrid>

        {/* Filters */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="bold">ค้นหาและกรองข้อมูล</Text>
              <Badge colorScheme="blue" variant="subtle">
                {filteredShifts.length} รายการ
              </Badge>
            </HStack>
          </CardHeader>
          <CardBody>
            <HStack spacing={4} wrap="wrap">
              <InputGroup maxW="300px">
                <InputLeftElement>
                  <Icon as={IoSearch} color="gray.500" />
                </InputLeftElement>
                <Input
                  placeholder="ค้นหาแคชเชียร์หรือรหัสกะงาน..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>

              <Select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                maxW="150px"
              >
                <option value="today">วันนี้</option>
                <option value="week">สัปดาห์นี้</option>
                <option value="month">เดือนนี้</option>
                <option value="quarter">ไตรมาส</option>
              </Select>

              <Select
                value={selectedCashier}
                onChange={(e) => setSelectedCashier(e.target.value)}
                maxW="200px"
              >
                <option value="all">แคชเชียร์ทั้งหมด</option>
                {uniqueCashiers.map((cashier) => (
                  <option key={cashier} value={cashier}>
                    {cashier}
                  </option>
                ))}
              </Select>

              <Button leftIcon={<Icon as={IoFilter} />} variant="outline">
                ตัวกรองเพิ่มเติม
              </Button>
            </HStack>
          </CardBody>
        </Card>

        {/* Shifts Table */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Text fontSize="lg" fontWeight="bold">รายการกะงาน</Text>
          </CardHeader>
          <CardBody>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>วันที่</Th>
                    <Th>แคชเชียร์</Th>
                    <Th>เวลาทำงาน</Th>
                    <Th>ยอดขาย</Th>
                    <Th>รายการ</Th>
                    <Th>ความแตกต่าง</Th>
                    <Th>ประสิทธิภาพ</Th>
                    <Th>สถานะ</Th>
                    <Th>การดำเนินการ</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredShifts.map((shift) => (
                    <Tr key={shift.id}>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">
                            {new Date(shift.date).toLocaleDateString("th-TH", {
                              day: "numeric",
                              month: "short",
                            })}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {shift.startTime} - {shift.endTime}
                          </Text>
                        </VStack>
                      </Td>
                      <Td fontWeight="medium">{shift.cashierName}</Td>
                      <Td>{shift.duration}</Td>
                      <Td>
                        <Text fontWeight="bold" color="green.600">
                          {formatCurrency(shift.totalSales)}
                        </Text>
                      </Td>
                      <Td>{shift.transactionCount}</Td>
                      <Td>
                        <HStack spacing={2}>
                          <Icon 
                            as={getVarianceIcon(shift.variance)} 
                            color={`${getVarianceColor(shift.variance)}.500`}
                            boxSize={4}
                          />
                          <Text 
                            fontWeight="medium"
                            color={`${getVarianceColor(shift.variance)}.600`}
                          >
                            {shift.variance >= 0 ? "+" : ""}
                            {formatCurrency(Math.abs(shift.variance))}
                          </Text>
                        </HStack>
                      </Td>
                      <Td>
                        <Badge 
                          colorScheme={getPerformanceColor(shift.performance)}
                          variant="solid"
                        >
                          {getPerformanceLabel(shift.performance)}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge 
                          colorScheme={getStatusColor(shift.status)}
                          variant="subtle"
                        >
                          เสร็จสิ้น
                        </Badge>
                      </Td>
                      <Td>
                        <Button
                          size="sm"
                          leftIcon={<Icon as={IoEye} />}
                          variant="ghost"
                          onClick={() => handleViewDetails(shift)}
                        >
                          ดู
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>

        {/* Shift Detail Modal */}
        <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack spacing={3}>
                <Icon as={IoTime} color="blue.500" />
                <Text>รายละเอียดกะงาน</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            
            <ModalBody pb={6}>
              {selectedShift && (
                <VStack spacing={6} align="stretch">
                  {/* Basic Info */}
                  <SimpleGrid columns={2} spacing={4}>
                    <VStack align="start" spacing={2}>
                      <Text fontSize="sm" color="gray.500">รหัสกะงาน</Text>
                      <Text fontWeight="bold">{selectedShift.id}</Text>
                    </VStack>
                    <VStack align="start" spacing={2}>
                      <Text fontSize="sm" color="gray.500">แคชเชียร์</Text>
                      <Text fontWeight="bold">{selectedShift.cashierName}</Text>
                    </VStack>
                    <VStack align="start" spacing={2}>
                      <Text fontSize="sm" color="gray.500">วันที่</Text>
                      <Text fontWeight="bold">
                        {new Date(selectedShift.date).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </Text>
                    </VStack>
                    <VStack align="start" spacing={2}>
                      <Text fontSize="sm" color="gray.500">ระยะเวลา</Text>
                      <Text fontWeight="bold">
                        {selectedShift.startTime} - {selectedShift.endTime} ({selectedShift.duration})
                      </Text>
                    </VStack>
                  </SimpleGrid>

                  {/* Financial Summary */}
                  <Card bg="gray.50" borderRadius="md">
                    <CardBody>
                      <Text fontSize="md" fontWeight="bold" mb={4}>สรุปทางการเงิน</Text>
                      <SimpleGrid columns={2} spacing={4}>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm" color="gray.500">เงินทอนเริ่มต้น</Text>
                          <Text fontWeight="bold">{formatCurrency(selectedShift.openingCash)}</Text>
                        </VStack>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm" color="gray.500">ยอดขายรวม</Text>
                          <Text fontWeight="bold" color="green.600">
                            {formatCurrency(selectedShift.totalSales)}
                          </Text>
                        </VStack>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm" color="gray.500">เงินสดคาดหวัง</Text>
                          <Text fontWeight="bold">{formatCurrency(selectedShift.expectedCash)}</Text>
                        </VStack>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm" color="gray.500">เงินสดจริง</Text>
                          <Text fontWeight="bold">{formatCurrency(selectedShift.actualCash)}</Text>
                        </VStack>
                      </SimpleGrid>
                    </CardBody>
                  </Card>

                  {/* Performance */}
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" color="gray.500">ประสิทธิภาพ</Text>
                      <Badge 
                        colorScheme={getPerformanceColor(selectedShift.performance)}
                        variant="solid"
                        fontSize="md"
                        px={3}
                        py={1}
                      >
                        {getPerformanceLabel(selectedShift.performance)}
                      </Badge>
                    </VStack>
                    <VStack align="end" spacing={1}>
                      <Text fontSize="sm" color="gray.500">ความแตกต่างเงินสด</Text>
                      <HStack spacing={2}>
                        <Icon 
                          as={getVarianceIcon(selectedShift.variance)}
                          color={`${getVarianceColor(selectedShift.variance)}.500`}
                        />
                        <Text 
                          fontWeight="bold" 
                          color={`${getVarianceColor(selectedShift.variance)}.600`}
                          fontSize="lg"
                        >
                          {selectedShift.variance >= 0 ? "+" : ""}
                          {formatCurrency(Math.abs(selectedShift.variance))}
                        </Text>
                      </HStack>
                    </VStack>
                  </HStack>

                  {/* Notes */}
                  {selectedShift.notes && (
                    <VStack align="start" spacing={2}>
                      <Text fontSize="sm" color="gray.500">หมายเหตุ</Text>
                      <Text>{selectedShift.notes}</Text>
                    </VStack>
                  )}
                </VStack>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </POSLayout>
  );
};

export default ShiftHistoryPage;