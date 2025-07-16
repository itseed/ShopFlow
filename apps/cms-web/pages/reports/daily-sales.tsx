import React, { useState } from "react";
import { ReactElement } from "react";
import Layout from "../../components/Layout";
import { withAuth } from "../../lib/auth";
import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Button,
  HStack,
  VStack,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Progress,
  Flex,
  Icon,
  Grid,
  GridItem,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import {
  FiCalendar,
  FiTrendingUp,
  FiClock,
  FiDownload,
  FiSearch,
  FiFilter,
  FiRefreshCw,
} from "react-icons/fi";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function DailySalesReportPage() {
  const [selectedDate, setSelectedDate] = useState("2024-07-15");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data
  const hourlyData = [
    { hour: "06:00", sales: 1200, orders: 8, customers: 6 },
    { hour: "07:00", sales: 2800, orders: 15, customers: 12 },
    { hour: "08:00", sales: 4200, orders: 23, customers: 18 },
    { hour: "09:00", sales: 3600, orders: 19, customers: 15 },
    { hour: "10:00", sales: 4800, orders: 28, customers: 22 },
    { hour: "11:00", sales: 5200, orders: 32, customers: 25 },
    { hour: "12:00", sales: 7800, orders: 45, customers: 35 },
    { hour: "13:00", sales: 6400, orders: 38, customers: 30 },
    { hour: "14:00", sales: 5600, orders: 34, customers: 28 },
    { hour: "15:00", sales: 4200, orders: 26, customers: 20 },
    { hour: "16:00", sales: 3800, orders: 24, customers: 18 },
    { hour: "17:00", sales: 5400, orders: 31, customers: 24 },
    { hour: "18:00", sales: 6800, orders: 39, customers: 32 },
    { hour: "19:00", sales: 7200, orders: 42, customers: 36 },
    { hour: "20:00", sales: 6200, orders: 35, customers: 28 },
    { hour: "21:00", sales: 4800, orders: 28, customers: 22 },
    { hour: "22:00", sales: 2400, orders: 16, customers: 14 },
  ];

  const topHours = [
    { time: "12:00-13:00", sales: 7800, orders: 45, percentage: 12.5 },
    { time: "19:00-20:00", sales: 7200, orders: 42, percentage: 11.8 },
    { time: "18:00-19:00", sales: 6800, orders: 39, percentage: 11.2 },
    { time: "13:00-14:00", sales: 6400, orders: 38, percentage: 10.5 },
    { time: "17:00-18:00", sales: 5400, orders: 31, percentage: 8.9 },
  ];

  const topProducts = [
    { name: "โค้ก 325ml", sales: 3280, quantity: 82, revenue: 8200 },
    { name: "น้ำเปล่า 600ml", sales: 2840, quantity: 71, revenue: 3550 },
    { name: "ลายส์ธรรมดา", sales: 2160, quantity: 54, revenue: 5400 },
    { name: "มาม่า หมูสับ", sales: 1920, quantity: 48, revenue: 1920 },
    { name: "นมเย็น UHT", sales: 1680, quantity: 42, revenue: 3360 },
  ];

  const recentTransactions = [
    { time: "14:23", amount: 185, items: 3, cashier: "สมหญิง ร." },
    { time: "14:21", amount: 92, items: 2, cashier: "วิชัย ก." },
    { time: "14:19", amount: 247, items: 5, cashier: "สมหญิง ร." },
    { time: "14:17", amount: 68, items: 1, cashier: "นันท์ ส." },
    { time: "14:15", amount: 156, items: 4, cashier: "วิชัย ก." },
  ];

  const totalSales = hourlyData.reduce((sum, item) => sum + item.sales, 0);
  const totalOrders = hourlyData.reduce((sum, item) => sum + item.orders, 0);
  const totalCustomers = hourlyData.reduce(
    (sum, item) => sum + item.customers,
    0
  );

  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Heading size="2xl" mb={2} fontFamily="heading">
            รายงานขายรายวัน
          </Heading>
          <Text color="gray.600" fontSize="lg">
            ข้อมูลยอดขายรายชั่วโมงและการวิเคราะห์รายวัน
          </Text>
        </Box>
        <HStack spacing={4}>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            width="180px"
            bg="white"
            borderColor="gray.300"
            borderRadius="xl"
          />
          <Select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            size="md"
            width="200px"
            bg="white"
            borderColor="gray.300"
            borderRadius="xl"
          >
            <option value="all">ทุกสาขา</option>
            <option value="branch-001">สาขาสยามสแควร์</option>
            <option value="branch-002">สาขาเซ็นทรัลเวิลด์</option>
            <option value="branch-003">สาขาเอ็มควอเทียร์</option>
          </Select>
          <Button
            leftIcon={<FiRefreshCw />}
            colorScheme="gray"
            size="md"
            variant="outline"
          >
            รีเฟรช
          </Button>
          <Button leftIcon={<FiDownload />} colorScheme="blue" size="md">
            ส่งออก
          </Button>
        </HStack>
      </Flex>

      {/* Daily Summary */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card
          borderRadius="2xl"
          border="1px"
          borderColor="gray.100"
          shadow="lg"
        >
          <CardBody p={6}>
            <Stat>
              <StatLabel color="gray.500" fontSize="sm" fontWeight="medium">
                ยอดขายรวม
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color="gray.900">
                ฿{totalSales.toLocaleString()}
              </StatNumber>
              <StatHelpText color="green.500" fontSize="sm" fontWeight="medium">
                <StatArrow type="increase" />
                +12.5% จากเมื่อวาน
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card
          borderRadius="2xl"
          border="1px"
          borderColor="gray.100"
          shadow="lg"
        >
          <CardBody p={6}>
            <Stat>
              <StatLabel color="gray.500" fontSize="sm" fontWeight="medium">
                จำนวนคำสั่งซื้อ
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color="gray.900">
                {totalOrders}
              </StatNumber>
              <StatHelpText color="green.500" fontSize="sm" fontWeight="medium">
                <StatArrow type="increase" />
                +8.3% จากเมื่อวาน
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card
          borderRadius="2xl"
          border="1px"
          borderColor="gray.100"
          shadow="lg"
        >
          <CardBody p={6}>
            <Stat>
              <StatLabel color="gray.500" fontSize="sm" fontWeight="medium">
                ลูกค้าทั้งหมด
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color="gray.900">
                {totalCustomers}
              </StatNumber>
              <StatHelpText color="blue.500" fontSize="sm" fontWeight="medium">
                <StatArrow type="increase" />
                +15.2% จากเมื่อวาน
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card
          borderRadius="2xl"
          border="1px"
          borderColor="gray.100"
          shadow="lg"
        >
          <CardBody p={6}>
            <Stat>
              <StatLabel color="gray.500" fontSize="sm" fontWeight="medium">
                มูลค่าเฉลี่ย/ใบ
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color="gray.900">
                ฿{Math.round(totalSales / totalOrders)}
              </StatNumber>
              <StatHelpText color="green.500" fontSize="sm" fontWeight="medium">
                <StatArrow type="increase" />
                +3.7% จากเมื่อวาน
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Hourly Sales Chart */}
      <Card
        borderRadius="2xl"
        border="1px"
        borderColor="gray.100"
        shadow="lg"
        mb={8}
      >
        <CardHeader>
          <Heading size="md" fontFamily="heading">
            ยอดขายรายชั่วโมง
          </Heading>
          <Text fontSize="sm" color="gray.600">
            วันที่ {new Date(selectedDate).toLocaleDateString("th-TH")}
          </Text>
        </CardHeader>
        <CardBody>
          <Box height="400px">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="hour" stroke="#718096" />
                <YAxis stroke="#718096" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #E2E8F0",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#3182CE"
                  strokeWidth={3}
                  dot={{ fill: "#3182CE", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </CardBody>
      </Card>

      {/* Bottom Section */}
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr 1fr" }} gap={6}>
        {/* Top Hours */}
        <GridItem>
          <Card
            borderRadius="2xl"
            border="1px"
            borderColor="gray.100"
            shadow="lg"
          >
            <CardHeader>
              <Heading size="md" fontFamily="heading">
                ช่วงเวลาขายดี
              </Heading>
              <Text fontSize="sm" color="gray.600">
                TOP 5 ช่วงเวลา
              </Text>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {topHours.map((hour, index) => (
                  <Box key={index} p={4} bg="gray.50" borderRadius="md">
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="medium">{hour.time}</Text>
                      <Badge colorScheme="blue" variant="subtle">
                        {hour.percentage}%
                      </Badge>
                    </HStack>
                    <Progress
                      value={hour.percentage}
                      max={15}
                      colorScheme="blue"
                      size="sm"
                      borderRadius="full"
                    />
                    <HStack justify="space-between" mt={2}>
                      <Text fontSize="sm" color="gray.600">
                        ฿{hour.sales.toLocaleString()}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {hour.orders} คำสั่ง
                      </Text>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </GridItem>

        {/* Top Products */}
        <GridItem>
          <Card
            borderRadius="2xl"
            border="1px"
            borderColor="gray.100"
            shadow="lg"
          >
            <CardHeader>
              <Heading size="md" fontFamily="heading">
                สินค้าขายดีวันนี้
              </Heading>
              <Text fontSize="sm" color="gray.600">
                TOP 5 รายการ
              </Text>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {topProducts.map((product, index) => (
                  <HStack
                    key={index}
                    justify="space-between"
                    p={3}
                    bg="gray.50"
                    borderRadius="md"
                  >
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="medium" fontSize="sm">
                        {product.name}
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        {product.quantity} ชิ้น
                      </Text>
                    </VStack>
                    <VStack align="end" spacing={1}>
                      <Text fontWeight="bold" fontSize="sm" color="green.600">
                        ฿{product.revenue.toLocaleString()}
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        ฿{product.sales.toLocaleString()}
                      </Text>
                    </VStack>
                  </HStack>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </GridItem>

        {/* Recent Transactions */}
        <GridItem>
          <Card
            borderRadius="2xl"
            border="1px"
            borderColor="gray.100"
            shadow="lg"
          >
            <CardHeader>
              <Heading size="md" fontFamily="heading">
                ธุรกรรมล่าสุด
              </Heading>
              <Text fontSize="sm" color="gray.600">
                5 รายการล่าสุด
              </Text>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {recentTransactions.map((transaction, index) => (
                  <HStack
                    key={index}
                    justify="space-between"
                    p={3}
                    bg="gray.50"
                    borderRadius="md"
                  >
                    <HStack spacing={3}>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium" fontSize="sm">
                          ฿{transaction.amount}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {transaction.items} รายการ
                        </Text>
                      </VStack>
                    </HStack>
                    <VStack align="end" spacing={1}>
                      <Text fontSize="xs" color="gray.600">
                        {transaction.time}
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        {transaction.cashier}
                      </Text>
                    </VStack>
                  </HStack>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  );
}

// Use dashboard layout
DailySalesReportPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="รายงานขายรายวัน">{page}</Layout>;
};

// Protected route - requires authentication
export default withAuth(DailySalesReportPage, "staff");
