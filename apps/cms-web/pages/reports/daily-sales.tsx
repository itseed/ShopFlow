import React, { useState } from "react";
import { ReactElement } from "react";
import Layout from "../../components/Layout";
import { withAuth } from "../../lib/auth";
import {
  useDailySalesReport,
  useExportReport,
} from "../../lib/hooks/useCMSReports";
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

  // Use real data hooks
  const {
    data: dailyData,
    isLoading,
    error,
    refetch,
  } = useDailySalesReport(
    selectedDate,
    selectedBranch === "all" ? undefined : selectedBranch
  );

  const exportMutation = useExportReport();

  // Extract data with fallbacks
  const hourlyData = dailyData?.hourlyData || [];
  const topProducts = dailyData?.topProducts || [];
  const recentTransactions = dailyData?.recentTransactions || [];
  const summary = dailyData?.summary || {
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    topPaymentMethod: "cash",
  };

  const totalSales = summary.totalSales;
  const totalOrders = summary.totalOrders;
  const totalCustomers = hourlyData.reduce(
    (sum, item) => sum + item.customers,
    0
  );

  // Calculate top hours from hourly data
  const topHours = hourlyData
    .map((item) => ({
      time: `${item.hour}-${(parseInt(item.hour.split(":")[0]) + 1)
        .toString()
        .padStart(2, "0")}:00`,
      sales: item.sales,
      orders: item.orders,
      percentage: totalSales > 0 ? (item.sales / totalSales) * 100 : 0,
    }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  const handleExport = () => {
    exportMutation.mutate({
      reportType: "sales",
      filters: {
        startDate: selectedDate + "T00:00:00.000Z",
        endDate: selectedDate + "T23:59:59.999Z",
        branchId: selectedBranch === "all" ? undefined : selectedBranch,
      },
    });
  };

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <Box>
        <Flex justify="center" align="center" minH="400px">
          <VStack>
            <Progress size="lg" isIndeterminate colorScheme="blue" />
            <Text color="gray.600">กำลังโหลดข้อมูลรายงาน...</Text>
          </VStack>
        </Flex>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Flex justify="center" align="center" minH="400px">
          <VStack>
            <Text color="red.500" fontSize="lg">
              เกิดข้อผิดพลาดในการโหลดข้อมูล
            </Text>
            <Text color="gray.600">{error.message}</Text>
            <Button colorScheme="blue" onClick={handleRefresh}>
              ลองใหม่
            </Button>
          </VStack>
        </Flex>
      </Box>
    );
  }

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
            onClick={handleRefresh}
            isLoading={isLoading}
          >
            รีเฟรช
          </Button>
          <Button
            leftIcon={<FiDownload />}
            colorScheme="blue"
            size="md"
            onClick={handleExport}
            isLoading={exportMutation.isPending}
          >
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
                 {recentTransactions.map((transaction: any, index: number) => (
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
