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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import {
  IoArrowBackOutline,
  IoDownload,
  IoPrint,
  IoAnalytics,
  IoTrendingUp,
  IoTrendingDown,
  IoWarning,
  IoAlertCircle,
  IoCheckmarkCircle,
  IoLayers,
  IoBarChart,
  IoPieChart,
  IoSearch,
  IoRefresh,
  IoFilter,
  IoTime,
  IoStatsChart,
} from "react-icons/io5";
import { POSLayout } from "../../components";
import { formatCurrency } from "../../lib/sales";
import { Bar, Line, Doughnut } from "react-chartjs-2";
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

// Mock inventory data
const mockInventoryData = {
  overview: {
    totalProducts: 1247,
    totalValue: 2850000,
    lowStockItems: 34,
    outOfStockItems: 8,
    criticalItems: 12,
    reorderRequired: 42,
    stockTurnover: 6.8,
    averageAge: 12.5,
  },
  stockLevels: [
    { level: "สต็อกปกติ", count: 1193, percentage: 95.7, color: "green" },
    { level: "สต็อกต่ำ", count: 34, percentage: 2.7, color: "orange" },
    { level: "สต็อกวิกฤต", count: 12, percentage: 1.0, color: "red" },
    { level: "หมดสต็อก", count: 8, percentage: 0.6, color: "gray" },
  ],
  categoryBreakdown: [
    { category: "เครื่องดื่ม", items: 425, value: 1125000, turnover: 8.2 },
    { category: "อาหาร", items: 312, value: 890000, turnover: 6.5 },
    { category: "ขนม", items: 298, value: 445000, turnover: 5.8 },
    { category: "เครื่องใช้", items: 156, value: 285000, turnover: 4.2 },
    { category: "อื่นๆ", items: 56, value: 105000, turnover: 3.9 },
  ],
  movementHistory: [
    { date: "2024-01-26", in: 1250, out: 890, adjustment: 15, net: 375 },
    { date: "2024-01-25", in: 980, out: 1120, adjustment: -8, net: -148 },
    { date: "2024-01-24", in: 1450, out: 1050, adjustment: 22, net: 422 },
    { date: "2024-01-23", in: 1100, out: 1300, adjustment: -5, net: -205 },
    { date: "2024-01-22", in: 1320, out: 980, adjustment: 12, net: 352 },
    { date: "2024-01-21", in: 1180, out: 1450, adjustment: -18, net: -288 },
    { date: "2024-01-20", in: 1650, out: 1200, adjustment: 25, net: 475 },
  ],
  criticalItems: [
    { id: "1", name: "น้ำดื่ม", sku: "DRINK001", currentStock: 2, minStock: 50, maxStock: 500, status: "critical", lastRestock: "2024-01-20" },
    { id: "2", name: "กาแฟเย็น", sku: "DRINK002", currentStock: 8, minStock: 30, maxStock: 200, status: "critical", lastRestock: "2024-01-22" },
    { id: "3", name: "ขนมปัง", sku: "FOOD001", currentStock: 0, minStock: 25, maxStock: 150, status: "out", lastRestock: "2024-01-19" },
    { id: "4", name: "นม", sku: "DRINK003", currentStock: 5, minStock: 20, maxStock: 100, status: "critical", lastRestock: "2024-01-21" },
    { id: "5", name: "แซนด์วิช", sku: "FOOD002", currentStock: 3, minStock: 15, maxStock: 80, status: "critical", lastRestock: "2024-01-23" },
  ],
  topMovingItems: [
    { name: "กาแฟเย็น", sold: 324, restocked: 500, turnover: 12.5, trend: "up" },
    { name: "น้ำส้ม", sold: 289, restocked: 400, turnover: 10.8, trend: "up" },
    { name: "ขนมปัง", sold: 256, restocked: 350, turnover: 9.2, trend: "down" },
    { name: "แซนด์วิช", sold: 198, restocked: 250, turnover: 8.9, trend: "up" },
    { name: "ชาเขียว", sold: 167, restocked: 200, turnover: 7.5, trend: "stable" },
  ],
  warehouseZones: [
    { zone: "เขต A - เครื่องดื่ม", utilization: 85, capacity: 2000, current: 1700 },
    { zone: "เขต B - อาหารสด", utilization: 72, capacity: 1500, current: 1080 },
    { zone: "เขต C - ขนม", utilization: 68, capacity: 1200, current: 816 },
    { zone: "เขต D - เครื่องใช้", utilization: 45, capacity: 800, current: 360 },
  ],
};

const InventoryReportPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [selectedView, setSelectedView] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #2d3748 0%, #1a202c 100%)"
  );

  const { 
    overview, 
    stockLevels, 
    categoryBreakdown, 
    movementHistory, 
    criticalItems, 
    topMovingItems,
    warehouseZones 
  } = mockInventoryData;

  // Chart data
  const stockLevelChart = {
    labels: stockLevels.map(s => s.level),
    datasets: [
      {
        data: stockLevels.map(s => s.count),
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",
          "rgba(251, 146, 60, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(156, 163, 175, 0.8)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const categoryValueChart = {
    labels: categoryBreakdown.map(c => c.category),
    datasets: [
      {
        label: "มูลค่าสต็อก",
        data: categoryBreakdown.map(c => c.value),
        backgroundColor: [
          "rgba(102, 126, 234, 0.8)",
          "rgba(255, 99, 132, 0.8)",
          "rgba(255, 206, 86, 0.8)",
          "rgba(75, 192, 192, 0.8)",
          "rgba(153, 102, 255, 0.8)",
        ],
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const movementChart = {
    labels: movementHistory.map(m => new Date(m.date).toLocaleDateString("th-TH", { day: "numeric", month: "short" })),
    datasets: [
      {
        label: "สินค้าเข้า",
        data: movementHistory.map(m => m.in),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        borderWidth: 3,
        fill: false,
      },
      {
        label: "สินค้าออก",
        data: movementHistory.map(m => m.out),
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderWidth: 3,
        fill: false,
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
        ticks: { color: "#666" }
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical": return "red";
      case "low": return "orange";
      case "out": return "gray";
      default: return "green";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "critical": return "วิกฤต";
      case "low": return "ต่ำ";
      case "out": return "หมด";
      default: return "ปกติ";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return IoTrendingUp;
      case "down": return IoTrendingDown;
      default: return IoStatsChart;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up": return "green";
      case "down": return "red";
      default: return "gray";
    }
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
                  <Icon as={IoAnalytics} boxSize={6} />
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm" fontWeight="medium">
                    รายงานสินค้าคงคลัง
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    วิเคราะห์สต็อกสินค้า
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
                  <BreadcrumbLink>สินค้าคงคลัง</BreadcrumbLink>
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
              <StatLabel color="whiteAlpha.800">สินค้าทั้งหมด</StatLabel>
              <StatNumber fontSize="3xl">
                {overview.totalProducts.toLocaleString()}
              </StatNumber>
              <StatHelpText color="whiteAlpha.800">
                รายการ
              </StatHelpText>
            </Stat>

            <Stat>
              <StatLabel color="whiteAlpha.800">มูลค่าสต็อก</StatLabel>
              <StatNumber fontSize="3xl">
                {formatCurrency(overview.totalValue)}
              </StatNumber>
              <StatHelpText color="whiteAlpha.800">
                บาท
              </StatHelpText>
            </Stat>

            <Stat>
              <StatLabel color="whiteAlpha.800">อัตราหมุนเวียน</StatLabel>
              <StatNumber fontSize="3xl" color="green.200">
                {overview.stockTurnover}
              </StatNumber>
              <StatHelpText color="whiteAlpha.800">
                <StatArrow type="increase" />
                ครั้งต่อปี
              </StatHelpText>
            </Stat>

            <Stat>
              <StatLabel color="whiteAlpha.800">ต้องสั่งซื้อ</StatLabel>
              <StatNumber fontSize="3xl" color="orange.200">
                {overview.reorderRequired}
              </StatNumber>
              <StatHelpText color="whiteAlpha.800">
                รายการ
              </StatHelpText>
            </Stat>
          </SimpleGrid>
        </Box>

        {/* Critical Alerts */}
        <VStack spacing={4} align="stretch">
          <Alert status="error" borderRadius="lg">
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>สินค้าต้องการความสนใจ!</AlertTitle>
              <AlertDescription>
                มีสินค้าหมดสต็อก {overview.outOfStockItems} รายการ และสต็อกวิกฤต {overview.criticalItems} รายการ
              </AlertDescription>
            </Box>
            <Button colorScheme="red" size="sm">
              ดูรายละเอียด
            </Button>
          </Alert>

          <Alert status="warning" borderRadius="lg">
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>ต้องสั่งซื้อเพิ่ม</AlertTitle>
              <AlertDescription>
                มีสินค้า {overview.reorderRequired} รายการที่ควรสั่งซื้อเพิ่ม
              </AlertDescription>
            </Box>
            <Button colorScheme="orange" size="sm">
              ดูรายการ
            </Button>
          </Alert>
        </VStack>

        {/* Charts Section */}
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>ภาพรวม</Tab>
            <Tab>ระดับสต็อก</Tab>
            <Tab>การเคลื่อนไหว</Tab>
            <Tab>รายการวิกฤต</Tab>
            <Tab>หมวดหมู่</Tab>
            <Tab>คลังสินค้า</Tab>
          </TabList>

          <TabPanels>
            {/* Overview Tab */}
            <TabPanel>
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                  <CardHeader>
                    <Text fontSize="lg" fontWeight="bold">ระดับสต็อกสินค้า</Text>
                  </CardHeader>
                  <CardBody>
                    <Box height="300px">
                      <Doughnut data={stockLevelChart} options={doughnutOptions} />
                    </Box>
                  </CardBody>
                </Card>

                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                  <CardHeader>
                    <Text fontSize="lg" fontWeight="bold">มูลค่าตามหมวดหมู่</Text>
                  </CardHeader>
                  <CardBody>
                    <Box height="300px">
                      <Bar data={categoryValueChart} options={chartOptions} />
                    </Box>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </TabPanel>

            {/* Stock Levels Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                  {stockLevels.map((level, index) => (
                    <Card key={index} bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                      <CardBody textAlign="center">
                        <VStack spacing={3}>
                          <Icon
                            as={level.level === "หมดสต็อก" ? IoAlertCircle : 
                                level.level === "สต็อกวิกฤต" ? IoWarning :
                                level.level === "สต็อกต่ำ" ? IoWarning : IoCheckmarkCircle}
                            color={`${level.color}.500`}
                            boxSize={8}
                          />
                          <Text fontSize="sm" color="gray.500">{level.level}</Text>
                          <Text fontSize="3xl" fontWeight="bold" color={`${level.color}.600`}>
                            {level.count}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            {level.percentage}%
                          </Text>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>

                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                  <CardHeader>
                    <Text fontSize="lg" fontWeight="bold">การกระจายระดับสต็อก</Text>
                  </CardHeader>
                  <CardBody>
                    <Box height="300px">
                      <Doughnut data={stockLevelChart} options={doughnutOptions} />
                    </Box>
                  </CardBody>
                </Card>
              </VStack>
            </TabPanel>

            {/* Movement Tab */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                  <CardHeader>
                    <Text fontSize="lg" fontWeight="bold">การเคลื่อนไหวสินค้า</Text>
                  </CardHeader>
                  <CardBody>
                    <Box height="400px">
                      <Line data={movementChart} options={chartOptions} />
                    </Box>
                  </CardBody>
                </Card>

                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                  <CardHeader>
                    <Text fontSize="lg" fontWeight="bold">ประวัติการเคลื่อนไหว</Text>
                  </CardHeader>
                  <CardBody>
                    <TableContainer>
                      <Table variant="simple">
                        <Thead>
                          <Tr>
                            <Th>วันที่</Th>
                            <Th isNumeric>เข้า</Th>
                            <Th isNumeric>ออก</Th>
                            <Th isNumeric>ปรับปรุง</Th>
                            <Th isNumeric>สุทธิ</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {movementHistory.map((day, index) => (
                            <Tr key={index}>
                              <Td>
                                {new Date(day.date).toLocaleDateString("th-TH", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </Td>
                              <Td isNumeric color="green.600" fontWeight="medium">
                                +{day.in}
                              </Td>
                              <Td isNumeric color="red.600" fontWeight="medium">
                                -{day.out}
                              </Td>
                              <Td isNumeric color={day.adjustment >= 0 ? "blue.600" : "orange.600"} fontWeight="medium">
                                {day.adjustment >= 0 ? "+" : ""}{day.adjustment}
                              </Td>
                              <Td isNumeric fontWeight="bold" color={day.net >= 0 ? "green.600" : "red.600"}>
                                {day.net >= 0 ? "+" : ""}{day.net}
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

            {/* Critical Items Tab */}
            <TabPanel>
              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                <CardHeader>
                  <HStack justify="space-between">
                    <Text fontSize="lg" fontWeight="bold">รายการสินค้าวิกฤต</Text>
                    <InputGroup maxW="300px">
                      <InputLeftElement>
                        <Icon as={IoSearch} color="gray.400" />
                      </InputLeftElement>
                      <Input
                        placeholder="ค้นหาสินค้า..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <TableContainer>
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>สินค้า</Th>
                          <Th>SKU</Th>
                          <Th isNumeric>สต็อกปัจจุบัน</Th>
                          <Th isNumeric>ขั้นต่ำ</Th>
                          <Th>สถานะ</Th>
                          <Th>เติมล่าสุด</Th>
                          <Th>การดำเนินการ</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {criticalItems.map((item) => (
                          <Tr key={item.id}>
                            <Td fontWeight="medium">{item.name}</Td>
                            <Td>{item.sku}</Td>
                            <Td isNumeric>
                              <Text 
                                fontWeight="bold" 
                                color={item.currentStock === 0 ? "red.600" : "orange.600"}
                              >
                                {item.currentStock}
                              </Text>
                            </Td>
                            <Td isNumeric>{item.minStock}</Td>
                            <Td>
                              <Badge colorScheme={getStatusColor(item.status)} variant="solid">
                                {getStatusText(item.status)}
                              </Badge>
                            </Td>
                            <Td>
                              {new Date(item.lastRestock).toLocaleDateString("th-TH")}
                            </Td>
                            <Td>
                              <Button size="sm" colorScheme="red">
                                เติมสต็อก
                              </Button>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Card>
              </TabPanel>

            {/* Categories Tab */}
            <TabPanel>
              <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                  <CardHeader>
                    <Text fontSize="lg" fontWeight="bold">มูลค่าตามหมวดหมู่</Text>
                  </CardHeader>
                  <CardBody>
                    <Box height="300px">
                      <Bar data={categoryValueChart} options={chartOptions} />
                    </Box>
                  </CardBody>
                </Card>

                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                  <CardHeader>
                    <Text fontSize="lg" fontWeight="bold">รายละเอียดหมวดหมู่</Text>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      {categoryBreakdown.map((category, index) => (
                        <HStack key={index} justify="space-between" p={3} bg="gray.50" borderRadius="md">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="medium">{category.category}</Text>
                            <Text fontSize="sm" color="gray.500">
                              {category.items} รายการ
                            </Text>
                          </VStack>
                          <VStack align="end" spacing={1}>
                            <Text fontWeight="bold" color="green.600">
                              {formatCurrency(category.value)}
                            </Text>
                            <HStack spacing={1}>
                              <Text fontSize="sm" color="blue.600">
                                หมุนเวียน: {category.turnover}x
                              </Text>
                            </HStack>
                          </VStack>
                        </HStack>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </TabPanel>

            {/* Warehouse Tab */}
            <TabPanel>
              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                <CardHeader>
                  <Text fontSize="lg" fontWeight="bold">การใช้งานคลังสินค้า</Text>
                </CardHeader>
                <CardBody>
                  <VStack spacing={6} align="stretch">
                    {warehouseZones.map((zone, index) => (
                      <VStack key={index} align="stretch" spacing={3}>
                        <HStack justify="space-between">
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="medium">{zone.zone}</Text>
                            <Text fontSize="sm" color="gray.500">
                              {zone.current} / {zone.capacity} รายการ
                            </Text>
                          </VStack>
                          <VStack align="end" spacing={0}>
                            <Text fontWeight="bold" color={zone.utilization > 80 ? "red.600" : zone.utilization > 60 ? "orange.500" : "green.600"}>
                              {zone.utilization}%
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              ใช้งาน
                            </Text>
                          </VStack>
                        </HStack>
                        <Progress
                          value={zone.utilization}
                          colorScheme={zone.utilization > 80 ? "red" : zone.utilization > 60 ? "orange" : "green"}
                          size="lg"
                          borderRadius="full"
                        />
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

export default InventoryReportPage;