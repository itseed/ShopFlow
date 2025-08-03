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
  Flex,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Select,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Progress,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import {
  IoArrowBackOutline,
  IoDownload,
  IoPrint,
  IoCash,
  IoTrendingUp,
  IoTrendingDown,
  IoWallet,
  IoCard,
  IoReceiptOutline,
  IoCalculator,
  IoStatsChart,
  IoPieChart,
  IoBarChart,
  IoTime,
  IoCheckmarkCircle,
  IoWarning,
} from "react-icons/io5";
import { POSLayout } from "../../components";
import { formatCurrency } from "../../lib/sales";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Mock financial data
const mockFinancialData = {
  overview: {
    totalRevenue: 1285750,
    totalCosts: 642875,
    grossProfit: 642875,
    netProfit: 485650,
    grossMargin: 50.0,
    netMargin: 37.8,
    revenueGrowth: 15.3,
    profitGrowth: 18.7,
  },
  monthlyFinancials: [
    { month: "ม.ค.", revenue: 185750, costs: 92875, profit: 92875, margin: 50.0 },
    { month: "ก.พ.", revenue: 198650, costs: 99325, profit: 99325, margin: 50.0 },
    { month: "มี.ค.", revenue: 215430, costs: 107715, profit: 107715, margin: 50.0 },
    { month: "เม.ย.", revenue: 198750, costs: 99375, profit: 99375, margin: 50.0 },
    { month: "พ.ค.", revenue: 225680, costs: 112840, profit: 112840, margin: 50.0 },
    { month: "มิ.ย.", revenue: 261490, costs: 130745, profit: 130745, margin: 50.0 },
  ],
  expenseBreakdown: [
    { category: "ต้นทุนสินค้า", amount: 450000, percentage: 35.0, type: "variable" },
    { category: "เงินเดือน", amount: 180000, percentage: 14.0, type: "fixed" },
    { category: "ค่าเช่า", amount: 50000, percentage: 3.9, type: "fixed" },
    { category: "ค่าไฟฟ้า", amount: 25000, percentage: 1.9, type: "variable" },
    { category: "การตลาด", amount: 35000, percentage: 2.7, type: "variable" },
    { category: "อื่นๆ", amount: 45000, percentage: 3.5, type: "variable" },
  ],
  revenueStreams: [
    { source: "ขายหน้าร้าน", amount: 850000, percentage: 66.1, growth: 12.5 },
    { source: "เดลิเวอรี่", amount: 285750, percentage: 22.2, growth: 28.9 },
    { source: "คาเตอร์ริ่ง", amount: 125000, percentage: 9.7, growth: 15.3 },
    { source: "ออนไลน์", amount: 25000, percentage: 1.9, growth: 45.2 },
  ],
  cashFlow: [
    { date: "2024-01-20", inflow: 45000, outflow: 22000, net: 23000 },
    { date: "2024-01-21", inflow: 52000, outflow: 28000, net: 24000 },
    { date: "2024-01-22", inflow: 48000, outflow: 25000, net: 23000 },
    { date: "2024-01-23", inflow: 55000, outflow: 30000, net: 25000 },
    { date: "2024-01-24", inflow: 58000, outflow: 32000, net: 26000 },
    { date: "2024-01-25", inflow: 62000, outflow: 35000, net: 27000 },
    { date: "2024-01-26", inflow: 59000, outflow: 33000, net: 26000 },
  ],
  profitLoss: {
    revenue: {
      sales: 1285750,
      other: 35000,
      total: 1320750,
    },
    costs: {
      cogs: 450000,
      salaries: 180000,
      rent: 50000,
      utilities: 25000,
      marketing: 35000,
      other: 45000,
      total: 785000,
    },
    taxes: 65000,
    netIncome: 470750,
  },
  kpis: [
    { name: "ROI", value: 45.2, unit: "%", trend: "up", target: 40.0 },
    { name: "ROE", value: 38.5, unit: "%", trend: "up", target: 35.0 },
    { name: "อัตราส่วนหนี้สิน", value: 0.25, unit: "", trend: "down", target: 0.30 },
    { name: "อัตราส่วนสภาพคล่อง", value: 2.8, unit: "", trend: "up", target: 2.0 },
  ],
};

const FinancialReportPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedView, setSelectedView] = useState("overview");

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #2d3748 0%, #1a202c 100%)"
  );

  const { 
    overview, 
    monthlyFinancials, 
    expenseBreakdown, 
    revenueStreams, 
    cashFlow, 
    profitLoss,
    kpis 
  } = mockFinancialData;

  // Chart data
  const revenueVsProfitChart = {
    labels: monthlyFinancials.map(m => m.month),
    datasets: [
      {
        label: "รายได้",
        data: monthlyFinancials.map(m => m.revenue),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 3,
        fill: false,
      },
      {
        label: "กำไร",
        data: monthlyFinancials.map(m => m.profit),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        borderWidth: 3,
        fill: false,
      },
    ],
  };

  const expenseChart = {
    labels: expenseBreakdown.map(e => e.category),
    datasets: [
      {
        data: expenseBreakdown.map(e => e.amount),
        backgroundColor: [
          "rgba(239, 68, 68, 0.8)",
          "rgba(251, 146, 60, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(147, 51, 234, 0.8)",
          "rgba(156, 163, 175, 0.8)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const revenueStreamChart = {
    labels: revenueStreams.map(r => r.source),
    datasets: [
      {
        label: "รายได้",
        data: revenueStreams.map(r => r.amount),
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(251, 146, 60, 0.8)",
          "rgba(147, 51, 234, 0.8)",
        ],
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const cashFlowChart = {
    labels: cashFlow.map(c => new Date(c.date).toLocaleDateString("th-TH", { day: "numeric", month: "short" })),
    datasets: [
      {
        label: "เงินเข้า",
        data: cashFlow.map(c => c.inflow),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        borderWidth: 3,
        fill: false,
      },
      {
        label: "เงินออก",
        data: cashFlow.map(c => c.outflow),
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderWidth: 3,
        fill: false,
      },
      {
        label: "กระแสเงินสุทธิ",
        data: cashFlow.map(c => c.net),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 3,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' as const },
      title: { display: false },
    },
    scales: {
      x: { 
        grid: { display: false },
        ticks: { color: "#666" }
      },
      y: { 
        beginAtZero: true, 
        grid: { color: "#e2e8f0" },
        ticks: { 
          color: "#666",
          callback: function(value: any) {
            return '฿' + value.toLocaleString();
          }
        }
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
    },
  };

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? IoTrendingUp : IoTrendingDown;
  };

  const getTrendColor = (trend: string) => {
    return trend === "up" ? "green" : "red";
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
                  <Icon as={IoCash} boxSize={6} />
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm" fontWeight="medium">
                    รายงานการเงิน
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    วิเคราะห์ทางการเงิน
                  </Text>
                </VStack>
              </HStack>

              {/* Breadcrumb */}
              <Breadcrumb color="whiteAlpha.800" fontSize="sm">
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">หน้าแรก</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/reports">รายงาน</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem isCurrentPage>
                  <BreadcrumbLink>การเงิน</BreadcrumbLink>
                </BreadcrumbItem>
              </Breadcrumb>
            </VStack>

            <HStack spacing={3}>
              <Button
                leftIcon={<Icon as={IoArrowBackOutline} />}
                variant="ghost"
                colorScheme="whiteAlpha"
                onClick={() => window.history.back()}
              >
                กลับ
              </Button>
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
                <option value="quarter" style={{ color: "black" }}>ไตรมาส</option>
                <option value="year" style={{ color: "black" }}>ปีนี้</option>
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

          {/* Quick Stats */}
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 4 }}
            spacing={6}
            mt={8}
            position="relative"
            zIndex={1}
          >
            <Stat>
              <StatLabel color="whiteAlpha.800">รายได้รวม</StatLabel>
              <StatNumber fontSize="3xl">
                {formatCurrency(overview.totalRevenue)}
              </StatNumber>
              <StatHelpText color="whiteAlpha.800">
                <StatArrow type="increase" />
                {overview.revenueGrowth}%
              </StatHelpText>
            </Stat>

            <Stat>
              <StatLabel color="whiteAlpha.800">กำไรขั้นต้น</StatLabel>
              <StatNumber fontSize="3xl" color="green.200">
                {formatCurrency(overview.grossProfit)}
              </StatNumber>
              <StatHelpText color="whiteAlpha.800">
                อัตราส่วน: {overview.grossMargin}%
              </StatHelpText>
            </Stat>

            <Stat>
              <StatLabel color="whiteAlpha.800">กำไรสุทธิ</StatLabel>
              <StatNumber fontSize="3xl" color="green.200">
                {formatCurrency(overview.netProfit)}
              </StatNumber>
              <StatHelpText color="whiteAlpha.800">
                <StatArrow type="increase" />
                {overview.profitGrowth}%
              </StatHelpText>
            </Stat>

            <Stat>
              <StatLabel color="whiteAlpha.800">อัตรากำไรสุทธิ</StatLabel>
              <StatNumber fontSize="3xl" color="yellow.200">
                {overview.netMargin}%
              </StatNumber>
              <StatHelpText color="whiteAlpha.800">
                ของรายได้รวม
              </StatHelpText>
            </Stat>
          </SimpleGrid>
        </Box>

        {/* Performance Alerts */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <Alert status="success" borderRadius="lg">
            <AlertIcon />
            <Box>
              <AlertTitle>ผลประกอบการดี!</AlertTitle>
              <AlertDescription>
                กำไรสุทธิเพิ่มขึ้น {overview.profitGrowth}% เมื่อเทียบกับเดือนที่แล้ว
              </AlertDescription>
            </Box>
          </Alert>

          <Alert status="info" borderRadius="lg">
            <AlertIcon />
            <Box>
              <AlertTitle>อัตรากำไรมั่นคง</AlertTitle>
              <AlertDescription>
                อัตรากำไรขั้นต้น {overview.grossMargin}% อยู่ในเกณฑ์ดี
              </AlertDescription>
            </Box>
          </Alert>
        </SimpleGrid>

        {/* Charts Section */}
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>ภาพรวม</Tab>
            <Tab>รายได้และกำไร</Tab>
            <Tab>ค่าใช้จ่าย</Tab>
            <Tab>กระแสเงินสด</Tab>
            <Tab>งบกำไรขาดทุน</Tab>
            <Tab>ตัวชี้วัดหลัก</Tab>
          </TabList>

          <TabPanels>
            {/* Overview Tab */}
            <TabPanel>
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                  <CardHeader>
                    <Text fontSize="lg" fontWeight="bold">รายได้ vs กำไร</Text>
                  </CardHeader>
                  <CardBody>
                    <Box height="300px">
                      <Line data={revenueVsProfitChart} options={chartOptions} />
                    </Box>
                  </CardBody>
                </Card>

                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                  <CardHeader>
                    <Text fontSize="lg" fontWeight="bold">แหล่งรายได้</Text>
                  </CardHeader>
                  <CardBody>
                    <Box height="300px">
                      <Bar data={revenueStreamChart} options={chartOptions} />
                    </Box>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </TabPanel>

            {/* Revenue & Profit Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                  <CardHeader>
                    <Text fontSize="lg" fontWeight="bold">แนวโน้มรายได้และกำไร</Text>
                  </CardHeader>
                  <CardBody>
                    <Box height="400px">
                      <Line data={revenueVsProfitChart} options={chartOptions} />
                    </Box>
                  </CardBody>
                </Card>

                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                  <CardHeader>
                    <Text fontSize="lg" fontWeight="bold">แหล่งรายได้</Text>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      {revenueStreams.map((stream, index) => (
                        <HStack key={index} justify="space-between" p={3} bg="gray.50" borderRadius="md">
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="medium">{stream.source}</Text>
                            <Text fontSize="sm" color="gray.500">
                              {stream.percentage}% ของรายได้รวม
                            </Text>
                          </VStack>
                          <VStack align="end" spacing={0}>
                            <Text fontWeight="bold" color="green.600">
                              {formatCurrency(stream.amount)}
                            </Text>
                            <HStack spacing={1}>
                              <Icon as={IoTrendingUp} color="green.500" boxSize={3} />
                              <Text fontSize="xs" color="green.500">
                                +{stream.growth}%
                              </Text>
                            </HStack>
                          </VStack>
                        </HStack>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Expenses Tab */}
            <TabPanel>
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                  <CardHeader>
                    <Text fontSize="lg" fontWeight="bold">โครงสร้างค่าใช้จ่าย</Text>
                  </CardHeader>
                  <CardBody>
                    <Box height="300px">
                      <Doughnut data={expenseChart} options={doughnutOptions} />
                    </Box>
                  </CardBody>
                </Card>

                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                  <CardHeader>
                    <Text fontSize="lg" fontWeight="bold">รายละเอียดค่าใช้จ่าย</Text>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      {expenseBreakdown.map((expense, index) => (
                        <HStack key={index} justify="space-between" p={3} bg="gray.50" borderRadius="md">
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="medium">{expense.category}</Text>
                            <Badge
                              colorScheme={expense.type === "fixed" ? "blue" : "orange"}
                              size="sm"
                            >
                              {expense.type === "fixed" ? "คงที่" : "ผันแปร"}
                            </Badge>
                            <Text fontSize="sm" color="gray.500">
                              {expense.percentage}% ของรายได้
                            </Text>
                          </VStack>
                          <Text fontWeight="bold" color="red.600">
                            {formatCurrency(expense.amount)}
                          </Text>
                        </HStack>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </TabPanel>

            {/* Cash Flow Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                  <CardHeader>
                    <Text fontSize="lg" fontWeight="bold">กระแสเงินสด</Text>
                  </CardHeader>
                  <CardBody>
                    <Box height="400px">
                      <Line data={cashFlowChart} options={chartOptions} />
                    </Box>
                  </CardBody>
                </Card>

                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                  <CardHeader>
                    <Text fontSize="lg" fontWeight="bold">รายละเอียดกระแสเงินสด</Text>
                  </CardHeader>
                  <CardBody>
                    <TableContainer>
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>วันที่</Th>
                            <Th isNumeric>เงินเข้า</Th>
                            <Th isNumeric>เงินออก</Th>
                            <Th isNumeric>สุทธิ</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {cashFlow.map((day, index) => (
                            <Tr key={index}>
                              <Td>
                                {new Date(day.date).toLocaleDateString("th-TH", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </Td>
                              <Td isNumeric color="green.600" fontWeight="medium">
                                {formatCurrency(day.inflow)}
                              </Td>
                              <Td isNumeric color="red.600" fontWeight="medium">
                                {formatCurrency(day.outflow)}
                              </Td>
                              <Td isNumeric fontWeight="bold" color={day.net >= 0 ? "green.600" : "red.600"}>
                                {formatCurrency(day.net)}
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* P&L Tab */}
            <TabPanel>
              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                <CardHeader>
                  <Text fontSize="lg" fontWeight="bold">งบกำไรขาดทุน</Text>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {/* Revenue Section */}
                    <Box p={4} bg="green.50" borderRadius="md">
                      <Text fontSize="md" fontWeight="bold" color="green.700" mb={3}>
                        รายได้
                      </Text>
                      <VStack spacing={2} align="stretch">
                        <HStack justify="space-between">
                          <Text>รายได้จากการขาย</Text>
                          <Text fontWeight="medium">{formatCurrency(profitLoss.revenue.sales)}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>รายได้อื่นๆ</Text>
                          <Text fontWeight="medium">{formatCurrency(profitLoss.revenue.other)}</Text>
                        </HStack>
                        <Divider />
                        <HStack justify="space-between">
                          <Text fontWeight="bold">รายได้รวม</Text>
                          <Text fontWeight="bold" color="green.600">
                            {formatCurrency(profitLoss.revenue.total)}
                          </Text>
                        </HStack>
                      </VStack>
                    </Box>

                    {/* Costs Section */}
                    <Box p={4} bg="red.50" borderRadius="md">
                      <Text fontSize="md" fontWeight="bold" color="red.700" mb={3}>
                        ค่าใช้จ่าย
                      </Text>
                      <VStack spacing={2} align="stretch">
                        <HStack justify="space-between">
                          <Text>ต้นทุนขาย</Text>
                          <Text fontWeight="medium">{formatCurrency(profitLoss.costs.cogs)}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>เงินเดือน</Text>
                          <Text fontWeight="medium">{formatCurrency(profitLoss.costs.salaries)}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>ค่าเช่า</Text>
                          <Text fontWeight="medium">{formatCurrency(profitLoss.costs.rent)}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>ค่าสาธารณูปโภค</Text>
                          <Text fontWeight="medium">{formatCurrency(profitLoss.costs.utilities)}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>การตลาด</Text>
                          <Text fontWeight="medium">{formatCurrency(profitLoss.costs.marketing)}</Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>อื่นๆ</Text>
                          <Text fontWeight="medium">{formatCurrency(profitLoss.costs.other)}</Text>
                        </HStack>
                        <Divider />
                        <HStack justify="space-between">
                          <Text fontWeight="bold">ค่าใช้จ่ายรวม</Text>
                          <Text fontWeight="bold" color="red.600">
                            {formatCurrency(profitLoss.costs.total)}
                          </Text>
                        </HStack>
                      </VStack>
                    </Box>

                    {/* Net Income */}
                    <Box p={4} bg="blue.50" borderRadius="md">
                      <VStack spacing={2} align="stretch">
                        <HStack justify="space-between">
                          <Text fontWeight="bold">กำไรก่อนภาษี</Text>
                          <Text fontWeight="bold" color="blue.600">
                            {formatCurrency(profitLoss.revenue.total - profitLoss.costs.total)}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text>ภาษี</Text>
                          <Text fontWeight="medium" color="red.600">
                            {formatCurrency(profitLoss.taxes)}
                          </Text>
                        </HStack>
                        <Divider />
                        <HStack justify="space-between">
                          <Text fontSize="lg" fontWeight="bold">กำไรสุทธิ</Text>
                          <Text fontSize="lg" fontWeight="bold" color="green.600">
                            {formatCurrency(profitLoss.netIncome)}
                          </Text>
                        </HStack>
                      </VStack>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>

            {/* KPIs Tab */}
            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {kpis.map((kpi, index) => (
                  <Card key={index} bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                    <CardBody>
                      <VStack spacing={4}>
                        <HStack justify="space-between" w="full">
                          <Text fontSize="lg" fontWeight="bold">{kpi.name}</Text>
                          <Icon
                            as={getTrendIcon(kpi.trend)}
                            color={`${getTrendColor(kpi.trend)}.500`}
                            boxSize={5}
                          />
                        </HStack>
                        
                        <Text fontSize="4xl" fontWeight="bold" color={`${getTrendColor(kpi.trend)}.600`}>
                          {kpi.value.toFixed(1)}{kpi.unit}
                        </Text>

                        <VStack spacing={2} w="full">
                          <HStack justify="space-between" w="full" fontSize="sm">
                            <Text color="gray.500">เป้าหมาย:</Text>
                            <Text fontWeight="medium">{kpi.target.toFixed(1)}{kpi.unit}</Text>
                          </HStack>
                          <Progress
                            value={(kpi.value / kpi.target) * 100}
                            colorScheme={getTrendColor(kpi.trend)}
                            size="lg"
                            w="full"
                            borderRadius="full"
                          />
                          <Text fontSize="sm" color="gray.500">
                            {((kpi.value / kpi.target) * 100).toFixed(0)}% ของเป้าหมาย
                          </Text>
                        </VStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </POSLayout>
  );
};

export default FinancialReportPage;