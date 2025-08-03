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
  Divider,
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
  Input,
  InputGroup,
  InputLeftElement,
  DatePicker,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
} from "@chakra-ui/react";
import {
  IoTrendingUp,
  IoTrendingDown,
  IoArrowBackOutline,
  IoDownload,
  IoPrint,
  IoCalendar,
  IoStatsChart,
  IoBarChart,
  IoCart,
  IoCash,
  IoTime,
  IoFilter,
  IoSearch,
  IoEye,
  IoRefresh,
  IoPeople,
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

// Mock sales data
const mockSalesData = {
  overview: {
    totalRevenue: 285750,
    totalOrders: 1247,
    averageOrderValue: 229.15,
    totalCustomers: 892,
    revenueGrowth: 15.3,
    orderGrowth: 12.8,
    customerGrowth: 8.9,
  },
  dailySales: [
    { date: "2024-01-20", revenue: 38500, orders: 142, customers: 98 },
    { date: "2024-01-21", revenue: 42300, orders: 156, customers: 102 },
    { date: "2024-01-22", revenue: 39800, orders: 148, customers: 95 },
    { date: "2024-01-23", revenue: 45200, orders: 167, customers: 110 },
    { date: "2024-01-24", revenue: 48900, orders: 182, customers: 118 },
    { date: "2024-01-25", revenue: 52100, orders: 195, customers: 125 },
    { date: "2024-01-26", revenue: 49950, orders: 189, customers: 122 },
  ],
  hourlySales: [
    { hour: "09:00", revenue: 2450, orders: 12 },
    { hour: "10:00", revenue: 3890, orders: 18 },
    { hour: "11:00", revenue: 5240, orders: 24 },
    { hour: "12:00", revenue: 8750, orders: 42 },
    { hour: "13:00", revenue: 9200, orders: 45 },
    { hour: "14:00", revenue: 7800, orders: 38 },
    { hour: "15:00", revenue: 6900, orders: 33 },
    { hour: "16:00", revenue: 5100, orders: 25 },
    { hour: "17:00", revenue: 4200, orders: 20 },
    { hour: "18:00", revenue: 3500, orders: 16 },
  ],
  topProducts: [
    { name: "กาแฟเย็น", quantity: 324, revenue: 12960, growth: 18.5 },
    { name: "ขนมปังโฮลวีท", quantity: 189, revenue: 4725, growth: -2.3 },
    { name: "น้ำส้มคั้นสด", quantity: 156, revenue: 7020, growth: 12.8 },
    { name: "แซนด์วิชทูน่า", quantity: 143, revenue: 7150, growth: 25.1 },
    { name: "ชาเขียวเย็น", quantity: 128, revenue: 4480, growth: 8.9 },
  ],
  salesByCategory: [
    { category: "เครื่องดื่ม", revenue: 125400, percentage: 43.9 },
    { category: "อาหาร", revenue: 89750, percentage: 31.4 },
    { category: "ขนม", revenue: 42300, percentage: 14.8 },
    { category: "อื่นๆ", revenue: 28300, percentage: 9.9 },
  ],
  paymentMethods: [
    { method: "เงินสด", amount: 142800, percentage: 50.0 },
    { method: "บัตรเครดิต", amount: 85650, percentage: 30.0 },
    { method: "QR Code", amount: 42825, percentage: 15.0 },
    { method: "บัตรเดบิต", amount: 14275, percentage: 5.0 },
  ],
};

const SalesReportPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [selectedView, setSelectedView] = useState("overview");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const { isOpen: isFilterOpen, onOpen: onFilterOpen, onClose: onFilterClose } = useDisclosure();

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #2d3748 0%, #1a202c 100%)"
  );

  const { overview, dailySales, hourlySales, topProducts, salesByCategory, paymentMethods } = mockSalesData;

  // Chart data
  const dailyRevenueChart = {
    labels: dailySales.map(d => new Date(d.date).toLocaleDateString("th-TH", { day: "numeric", month: "short" })),
    datasets: [
      {
        label: "รายได้",
        data: dailySales.map(d => d.revenue),
        borderColor: "rgb(102, 126, 234)",
        backgroundColor: "rgba(102, 126, 234, 0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const hourlyChart = {
    labels: hourlySales.map(h => h.hour),
    datasets: [
      {
        label: "รายได้ต่อชั่วโมง",
        data: hourlySales.map(h => h.revenue),
        backgroundColor: "rgba(54, 162, 235, 0.8)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const categoryChart = {
    labels: salesByCategory.map(c => c.category),
    datasets: [
      {
        data: salesByCategory.map(c => c.revenue),
        backgroundColor: [
          "rgba(102, 126, 234, 0.8)",
          "rgba(255, 99, 132, 0.8)",
          "rgba(255, 206, 86, 0.8)",
          "rgba(75, 192, 192, 0.8)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
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
                  <Icon as={IoBarChart} boxSize={6} />
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm" fontWeight="medium">
                    รายงานยอดขาย
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    วิเคราะห์การขาย
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
                  <BreadcrumbLink>ยอดขาย</BreadcrumbLink>
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
              <StatLabel color="whiteAlpha.800">คำสั่งซื้อทั้งหมด</StatLabel>
              <StatNumber fontSize="3xl">
                {overview.totalOrders.toLocaleString()}
              </StatNumber>
              <StatHelpText color="whiteAlpha.800">
                <StatArrow type="increase" />
                {overview.orderGrowth}%
              </StatHelpText>
            </Stat>

            <Stat>
              <StatLabel color="whiteAlpha.800">ค่าเฉลี่ยต่อออเดอร์</StatLabel>
              <StatNumber fontSize="3xl">
                {formatCurrency(overview.averageOrderValue)}
              </StatNumber>
              <StatHelpText color="whiteAlpha.800">
                เพิ่มขึ้นจากเดือนที่แล้ว
              </StatHelpText>
            </Stat>

            <Stat>
              <StatLabel color="whiteAlpha.800">ลูกค้าทั้งหมด</StatLabel>
              <StatNumber fontSize="3xl">
                {overview.totalCustomers.toLocaleString()}
              </StatNumber>
              <StatHelpText color="whiteAlpha.800">
                <StatArrow type="increase" />
                {overview.customerGrowth}%
              </StatHelpText>
            </Stat>
          </SimpleGrid>
        </Box>

        {/* Charts Section */}
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>ภาพรวม</Tab>
            <Tab>รายได้รายวัน</Tab>
            <Tab>รายได้รายชั่วโมง</Tab>
            <Tab>สินค้าขายดี</Tab>
            <Tab>หมวดหมู่</Tab>
            <Tab>วิธีการชำระ</Tab>
          </TabList>

          <TabPanels>
            {/* Overview Tab */}
            <TabPanel>
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                  <CardHeader>
                    <Text fontSize="lg" fontWeight="bold">กราฟรายได้รายวัน</Text>
                  </CardHeader>
                  <CardBody>
                    <Box height="300px">
                      <Line data={dailyRevenueChart} options={chartOptions} />
                    </Box>
                  </CardBody>
                </Card>

                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                  <CardHeader>
                    <Text fontSize="lg" fontWeight="bold">สัดส่วนตามหมวดหมู่</Text>
                  </CardHeader>
                  <CardBody>
                    <Box height="300px">
                      <Doughnut data={categoryChart} options={doughnutOptions} />
                    </Box>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </TabPanel>

            {/* Daily Revenue Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                  <CardHeader>
                    <HStack justify="space-between">
                      <Text fontSize="lg" fontWeight="bold">รายได้รายวัน</Text>
                      <Badge colorScheme="green">
                        <StatArrow type="increase" />
                        {overview.revenueGrowth}%
                      </Badge>
                    </HStack>
                  </CardHeader>
                  <CardBody>
                    <Box height="400px">
                      <Line data={dailyRevenueChart} options={chartOptions} />
                    </Box>
                  </CardBody>
                </Card>

                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                  <CardHeader>
                    <Text fontSize="lg" fontWeight="bold">รายละเอียดรายวัน</Text>
                  </CardHeader>
                  <CardBody>
                    <TableContainer>
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>วันที่</Th>
                            <Th isNumeric>รายได้</Th>
                            <Th isNumeric>คำสั่งซื้อ</Th>
                            <Th isNumeric>ลูกค้า</Th>
                            <Th isNumeric>เฉลี่ย/ออเดอร์</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {dailySales.map((day, index) => (
                            <Tr key={index}>
                              <Td>
                                {new Date(day.date).toLocaleDateString("th-TH", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </Td>
                              <Td isNumeric fontWeight="bold" color="green.600">
                                {formatCurrency(day.revenue)}
                              </Td>
                              <Td isNumeric>{day.orders}</Td>
                              <Td isNumeric>{day.customers}</Td>
                              <Td isNumeric>
                                {formatCurrency(day.revenue / day.orders)}
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

            {/* Hourly Revenue Tab */}
            <TabPanel>
              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                <CardHeader>
                  <Text fontSize="lg" fontWeight="bold">รายได้รายชั่วโมง</Text>
                </CardHeader>
                <CardBody>
                  <Box height="400px">
                    <Bar data={hourlyChart} options={chartOptions} />
                  </Box>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Top Products Tab */}
            <TabPanel>
              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                <CardHeader>
                  <Text fontSize="lg" fontWeight="bold">สินค้าขายดี</Text>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {topProducts.map((product, index) => (
                      <HStack key={index} justify="space-between" p={4} bg="gray.50" borderRadius="md">
                        <HStack spacing={4}>
                          <Badge
                            colorScheme={index < 3 ? "gold" : "gray"}
                            variant="solid"
                            borderRadius="full"
                            w="30px"
                            h="30px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            {index + 1}
                          </Badge>
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="bold">{product.name}</Text>
                            <Text fontSize="sm" color="gray.500">
                              ขาย {product.quantity} รายการ
                            </Text>
                          </VStack>
                        </HStack>
                        <VStack align="end" spacing={0}>
                          <Text fontWeight="bold" color="green.600">
                            {formatCurrency(product.revenue)}
                          </Text>
                          <HStack spacing={1}>
                            <Icon
                              as={product.growth > 0 ? IoTrendingUp : IoTrendingDown}
                              color={product.growth > 0 ? "green.500" : "red.500"}
                              boxSize={3}
                            />
                            <Text
                              fontSize="xs"
                              color={product.growth > 0 ? "green.500" : "red.500"}
                            >
                              {Math.abs(product.growth)}%
                            </Text>
                          </HStack>
                        </VStack>
                      </HStack>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Categories Tab */}
            <TabPanel>
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                  <CardHeader>
                    <Text fontSize="lg" fontWeight="bold">สัดส่วนตามหมวดหมู่</Text>
                  </CardHeader>
                  <CardBody>
                    <Box height="300px">
                      <Doughnut data={categoryChart} options={doughnutOptions} />
                    </Box>
                  </CardBody>
                </Card>

                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                  <CardHeader>
                    <Text fontSize="lg" fontWeight="bold">รายละเอียดหมวดหมู่</Text>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      {salesByCategory.map((category, index) => (
                        <HStack key={index} justify="space-between">
                          <HStack spacing={3}>
                            <Box
                              w="12px"
                              h="12px"
                              borderRadius="full"
                              bg={[
                                "blue.500",
                                "red.500", 
                                "yellow.500",
                                "teal.500"
                              ][index]}
                            />
                            <Text fontWeight="medium">{category.category}</Text>
                          </HStack>
                          <VStack align="end" spacing={0}>
                            <Text fontWeight="bold" color="green.600">
                              {formatCurrency(category.revenue)}
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              {category.percentage}%
                            </Text>
                          </VStack>
                        </HStack>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </TabPanel>

            {/* Payment Methods Tab */}
            <TabPanel>
              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                <CardHeader>
                  <Text fontSize="lg" fontWeight="bold">วิธีการชำระเงิน</Text>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {paymentMethods.map((method, index) => (
                      <VStack key={index} align="stretch" spacing={2}>
                        <HStack justify="space-between">
                          <Text fontWeight="medium">{method.method}</Text>
                          <Text fontWeight="bold" color="green.600">
                            {formatCurrency(method.amount)}
                          </Text>
                        </HStack>
                        <HStack justify="space-between" align="center">
                          <Progress
                            value={method.percentage}
                            colorScheme="blue"
                            size="md"
                            flex={1}
                            borderRadius="full"
                          />
                          <Text fontSize="sm" color="gray.500" w="50px" textAlign="right">
                            {method.percentage}%
                          </Text>
                        </HStack>
                      </VStack>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </POSLayout>
  );
};

export default SalesReportPage;