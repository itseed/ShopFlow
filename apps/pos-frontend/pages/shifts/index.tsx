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
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useDisclosure,
} from "@chakra-ui/react";
import {
  IoTime,
  IoPlay,
  IoStop,
  IoCash,
  IoStatsChart,
  IoCalendar,
  IoCheckmarkCircle,
  IoWarning,
  IoRefresh,
  IoDownload,
  IoPeople,
  IoReceiptOutline,
} from "react-icons/io5";
import { POSLayout } from "../../components";
import { formatCurrency } from "../../lib/sales";
import Link from "next/link";

// Mock shift data
const mockShiftData = {
  currentShift: {
    id: "shift_20250801_001",
    startTime: "2025-01-08T08:00:00",
    cashierName: "สมชาย ดีเยี่ยม",
    cashierId: "cashier001",
    openingCash: 5000,
    expectedCash: 8750,
    actualCash: null,
    status: "active",
    transactionCount: 45,
    totalSales: 12750,
    variance: null,
  },
  recentShifts: [
    {
      id: "shift_20250107_003",
      date: "2025-01-07",
      cashierName: "สมหญิง เก่งดี",
      startTime: "16:00",
      endTime: "23:59",
      openingCash: 5000,
      expectedCash: 9200,
      actualCash: 9180,
      variance: -20,
      totalSales: 15200,
      transactionCount: 52,
      status: "completed",
    },
    {
      id: "shift_20250107_002",
      date: "2025-01-07",
      cashierName: "สมชาย ดีเยี่ยม",
      startTime: "08:00",
      endTime: "16:00",
      openingCash: 5000,
      expectedCash: 8750,
      actualCash: 8750,
      variance: 0,
      totalSales: 12750,
      transactionCount: 38,
      status: "completed",
    },
    {
      id: "shift_20250106_002",
      date: "2025-01-06",
      cashierName: "สมหญิง เก่งดี",
      startTime: "08:00",
      endTime: "16:00",
      openingCash: 5000,
      expectedCash: 7850,
      actualCash: 7820,
      variance: -30,
      totalSales: 9850,
      transactionCount: 42,
      status: "completed",
    },
  ],
  todayStats: {
    totalShifts: 2,
    totalSales: 27950,
    totalTransactions: 90,
    averageTransaction: 310.56,
    totalVariance: -20,
    cashiers: ["สมชาย ดีเยี่ยม", "สมหญิง เก่งดี"],
  },
};

const ShiftsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [selectedTab, setSelectedTab] = useState(0);

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #2d3748 0%, #1a202c 100%)"
  );

  const { isOpen: isStartShiftOpen, onOpen: onStartShiftOpen, onClose: onStartShiftClose } = useDisclosure();
  const { isOpen: isEndShiftOpen, onOpen: onEndShiftOpen, onClose: onEndShiftClose } = useDisclosure();

  const { currentShift, recentShifts, todayStats } = mockShiftData;

  const getShiftStatusColor = (status: string) => {
    switch (status) {
      case "active": return "green";
      case "completed": return "blue";
      case "pending": return "orange";
      default: return "gray";
    }
  };

  const getShiftStatusText = (status: string) => {
    switch (status) {
      case "active": return "กำลังทำงาน";
      case "completed": return "เสร็จสิ้น";
      case "pending": return "รอเริ่มงาน";
      default: return status;
    }
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return "green";
    if (variance < 0) return "red";
    return "gray";
  };

  const formatShiftTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateShiftDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60));
    return `${duration} ชั่วโมง`;
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
                    การจัดการกะงาน
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    จัดการกะงานและเงินสด
                  </Text>
                </VStack>
              </HStack>

              {/* Breadcrumb */}
              <Breadcrumb color="whiteAlpha.800" fontSize="sm">
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">หน้าแรก</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem isCurrentPage>
                  <BreadcrumbLink>จัดการกะงาน</BreadcrumbLink>
                </BreadcrumbItem>
              </Breadcrumb>
            </VStack>

            <HStack spacing={3}>
              <Select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                bg="rgba(255,255,255,0.2)"
                border="none"
                color="white"
                _focus={{ bg: "rgba(255,255,255,0.3)" }}
                w="150px"
              >
                <option value="today" style={{ color: "black" }}>วันนี้</option>
                <option value="week" style={{ color: "black" }}>สัปดาห์นี้</option>
                <option value="month" style={{ color: "black" }}>เดือนนี้</option>
              </Select>
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

        {/* Current Shift Status */}
        {currentShift ? (
          <Alert 
            status={currentShift.status === "active" ? "success" : "info"} 
            borderRadius="lg" 
            variant="left-accent"
          >
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>
                {currentShift.status === "active" ? "กะงานปัจจุบัน" : "ไม่มีกะงานที่เปิดอยู่"}
              </AlertTitle>
              <AlertDescription>
                {currentShift.status === "active" ? (
                  <>
                    แคชเชียร์: <strong>{currentShift.cashierName}</strong> | 
                    เริ่มงาน: <strong>{formatShiftTime(currentShift.startTime)}</strong> | 
                    ยอดขาย: <strong>{formatCurrency(currentShift.totalSales)}</strong> | 
                    รายการ: <strong>{currentShift.transactionCount}</strong>
                  </>
                ) : (
                  "ไม่มีกะงานที่เปิดอยู่ในขณะนี้"
                )}
              </AlertDescription>
            </Box>
            <VStack spacing={2}>
              {currentShift.status === "active" ? (
                <>
                  <Link href="/shifts/current">
                    <Button size="sm" colorScheme="blue">
                      ดูรายละเอียด
                    </Button>
                  </Link>
                  <Button size="sm" colorScheme="red" variant="outline">
                    ปิดกะงาน
                  </Button>
                </>
              ) : (
                <Button size="sm" colorScheme="green" leftIcon={<Icon as={IoPlay} />}>
                  เริ่มกะงานใหม่
                </Button>
              )}
            </VStack>
          </Alert>
        ) : (
          <Alert status="warning" borderRadius="lg">
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>ไม่มีกะงานที่เปิดอยู่</AlertTitle>
              <AlertDescription>
                คลิกปุ่ม "เริ่มกะงานใหม่" เพื่อเริ่มต้นกะงานใหม่
              </AlertDescription>
            </Box>
            <Button colorScheme="green" leftIcon={<Icon as={IoPlay} />}>
              เริ่มกะงานใหม่
            </Button>
          </Alert>
        )}

        {/* Today's Stats */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Stat>
            <StatLabel>กะงานวันนี้</StatLabel>
            <StatNumber fontSize="3xl">{todayStats.totalShifts}</StatNumber>
            <StatHelpText>กะงาน</StatHelpText>
          </Stat>

          <Stat>
            <StatLabel>ยอดขายรวม</StatLabel>
            <StatNumber fontSize="3xl" color="green.600">
              {formatCurrency(todayStats.totalSales)}
            </StatNumber>
            <StatHelpText>
              <StatArrow type="increase" />
              จาก {todayStats.totalTransactions} รายการ
            </StatHelpText>
          </Stat>

          <Stat>
            <StatLabel>ค่าเฉลี่ยต่อรายการ</StatLabel>
            <StatNumber fontSize="3xl" color="blue.600">
              {formatCurrency(todayStats.averageTransaction)}
            </StatNumber>
            <StatHelpText>บาท</StatHelpText>
          </Stat>

          <Stat>
            <StatLabel>ความแตกต่างเงินสด</StatLabel>
            <StatNumber 
              fontSize="3xl" 
              color={getVarianceColor(todayStats.totalVariance)}
            >
              {todayStats.totalVariance >= 0 ? "+" : ""}{formatCurrency(Math.abs(todayStats.totalVariance))}
            </StatNumber>
            <StatHelpText>
              {todayStats.totalVariance === 0 ? "ครบถ้วน" : 
               todayStats.totalVariance > 0 ? "เกิน" : "ขาด"}
            </StatHelpText>
          </Stat>
        </SimpleGrid>

        {/* Main Content Tabs */}
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>กะงานล่าสุด</Tab>
            <Tab>ประวัติกะงาน</Tab>
            <Tab>สถิติแคชเชียร์</Tab>
          </TabList>

          <TabPanels>
            {/* Recent Shifts Tab */}
            <TabPanel>
              <VStack spacing={4} align="stretch">
                {recentShifts.map((shift, index) => (
                  <Card key={shift.id} bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                    <CardBody>
                      <HStack justify="space-between" align="start">
                        <VStack align="start" spacing={2}>
                          <HStack spacing={3}>
                            <Badge 
                              colorScheme={getShiftStatusColor(shift.status)} 
                              variant="solid"
                            >
                              {getShiftStatusText(shift.status)}
                            </Badge>
                            <Text fontSize="sm" color="gray.500">
                              {new Date(shift.date).toLocaleDateString("th-TH", {
                                year: "numeric",
                                month: "long", 
                                day: "numeric"
                              })}
                            </Text>
                          </HStack>
                          
                          <Text fontSize="lg" fontWeight="bold">
                            {shift.cashierName}
                          </Text>
                          
                          <HStack spacing={6}>
                            <VStack align="start" spacing={0}>
                              <Text fontSize="sm" color="gray.500">เวลาทำงาน</Text>
                              <Text fontWeight="medium">
                                {shift.startTime} - {shift.endTime}
                              </Text>
                            </VStack>
                            <VStack align="start" spacing={0}>
                              <Text fontSize="sm" color="gray.500">ยอดขาย</Text>
                              <Text fontWeight="bold" color="green.600">
                                {formatCurrency(shift.totalSales)}
                              </Text>
                            </VStack>
                            <VStack align="start" spacing={0}>
                              <Text fontSize="sm" color="gray.500">รายการ</Text>
                              <Text fontWeight="medium">
                                {shift.transactionCount}
                              </Text>
                            </VStack>
                          </HStack>
                        </VStack>

                        <VStack align="end" spacing={2}>
                          <HStack spacing={4}>
                            <VStack align="end" spacing={0}>
                              <Text fontSize="sm" color="gray.500">เงินสดคาดหวัง</Text>
                              <Text fontWeight="medium">
                                {formatCurrency(shift.expectedCash)}
                              </Text>
                            </VStack>
                            <VStack align="end" spacing={0}>
                              <Text fontSize="sm" color="gray.500">เงินสดจริง</Text>
                              <Text fontWeight="bold">
                                {formatCurrency(shift.actualCash)}
                              </Text>
                            </VStack>
                          </HStack>
                          
                          <HStack spacing={2}>
                            <Text fontSize="sm" color="gray.500">ความแตกต่าง:</Text>
                            <Text 
                              fontWeight="bold" 
                              color={getVarianceColor(shift.variance)}
                            >
                              {shift.variance >= 0 ? "+" : ""}
                              {formatCurrency(Math.abs(shift.variance))}
                            </Text>
                          </HStack>

                          <Button size="sm" variant="outline" colorScheme="blue">
                            ดูรายละเอียด
                          </Button>
                        </VStack>
                      </HStack>
                    </CardBody>
                  </Card>
                ))}
              </VStack>
            </TabPanel>

            {/* Shift History Tab */}
            <TabPanel>
              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                <CardHeader>
                  <HStack justify="space-between">
                    <Text fontSize="lg" fontWeight="bold">ประวัติกะงาน</Text>
                    <Link href="/shifts/history">
                      <Button size="sm" variant="outline">
                        ดูทั้งหมด
                      </Button>
                    </Link>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <Text color="gray.500" textAlign="center" py={8}>
                    คลิก "ดูทั้งหมด" เพื่อดูประวัติกะงานแบบละเอียด
                  </Text>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Cashier Stats Tab */}
            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {todayStats.cashiers.map((cashier, index) => (
                  <Card key={index} bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                    <CardHeader>
                      <HStack spacing={3}>
                        <Icon as={IoPeople} color="blue.500" />
                        <Text fontSize="lg" fontWeight="bold">{cashier}</Text>
                      </HStack>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between">
                          <Text>กะงานวันนี้:</Text>
                          <Text fontWeight="bold">1 กะ</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>ยอดขาย:</Text>
                          <Text fontWeight="bold" color="green.600">
                            {formatCurrency(todayStats.totalSales / 2)}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>ความแม่นยำเงินสด:</Text>
                          <Badge colorScheme="green">99.9%</Badge>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/* Quick Actions */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} cursor="pointer" _hover={{ shadow: "md" }}>
            <CardBody textAlign="center" py={6}>
              <VStack spacing={3}>
                <Icon as={IoPlay} boxSize={8} color="green.500" />
                <Text fontWeight="bold">เริ่มกะงานใหม่</Text>
                <Text fontSize="sm" color="gray.500">เปิดกะงานและตั้งเงินทอนเริ่มต้น</Text>
              </VStack>
            </CardBody>
          </Card>

          <Link href="/shifts/current">
            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} cursor="pointer" _hover={{ shadow: "md" }}>
              <CardBody textAlign="center" py={6}>
                <VStack spacing={3}>
                  <Icon as={IoStatsChart} boxSize={8} color="blue.500" />
                  <Text fontWeight="bold">กะงานปัจจุบัน</Text>
                  <Text fontSize="sm" color="gray.500">ดูรายละเอียดกะงานที่กำลังทำงาน</Text>
                </VStack>
              </CardBody>
            </Card>
          </Link>

          <Link href="/shifts/history">
            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} cursor="pointer" _hover={{ shadow: "md" }}>
              <CardBody textAlign="center" py={6}>
                <VStack spacing={3}>
                  <Icon as={IoCalendar} boxSize={8} color="purple.500" />
                  <Text fontWeight="bold">ประวัติกะงาน</Text>
                  <Text fontSize="sm" color="gray.500">ดูประวัติกะงานทั้งหมด</Text>
                </VStack>
              </CardBody>
            </Card>
          </Link>
        </SimpleGrid>
      </VStack>
    </POSLayout>
  );
};

export default ShiftsPage;