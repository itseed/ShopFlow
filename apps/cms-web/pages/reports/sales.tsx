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
} from "@chakra-ui/react";
import {
  FiTrendingUp,
  FiDollarSign,
  FiShoppingCart,
  FiTarget,
  FiDownload,
  FiRefreshCw,
  FiCalendar,
  FiBarChart,
} from "react-icons/fi";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function SalesReportPage() {
  const [timeRange, setTimeRange] = useState("30days");
  const [selectedBranch, setSelectedBranch] = useState("all");

  // Mock data
  const salesData = [
    { month: "ม.ค.", sales: 45000, target: 40000, orders: 245 },
    { month: "ก.พ.", sales: 52000, target: 45000, orders: 287 },
    { month: "มี.ค.", sales: 48000, target: 50000, orders: 265 },
    { month: "เม.ย.", sales: 61000, target: 55000, orders: 310 },
    { month: "พ.ค.", sales: 55000, target: 60000, orders: 295 },
    { month: "มิ.ย.", sales: 67000, target: 65000, orders: 345 },
  ];

  const dailySales = [
    { day: "จ", sales: 8200, orders: 45 },
    { day: "อ", sales: 7800, orders: 42 },
    { day: "พ", sales: 6500, orders: 38 },
    { day: "พฤ", sales: 9200, orders: 52 },
    { day: "ศ", sales: 8800, orders: 48 },
    { day: "ส", sales: 12500, orders: 68 },
    { day: "อา", sales: 11200, orders: 62 },
  ];

  const topProducts = [
    { name: "โค้ก 325ml", sales: 15420, quantity: 234, growth: 12.5 },
    { name: "น้ำเปล่า 600ml", sales: 8950, quantity: 189, growth: -3.2 },
    { name: "ลายส์ธรรมดา", sales: 6720, quantity: 156, growth: 8.7 },
    { name: "มาม่า หมูสับ", sales: 5680, quantity: 143, growth: 15.3 },
    { name: "นมเย็น UHT", sales: 4320, quantity: 128, growth: 5.1 },
  ];

  const branchPerformance = [
    { name: "สยามสแควร์", sales: 89500, target: 85000, percentage: 105.3 },
    { name: "เซ็นทรัลเวิลด์", sales: 76200, target: 80000, percentage: 95.3 },
    { name: "เอ็มควอเทียร์", sales: 68900, target: 70000, percentage: 98.4 },
    { name: "เทอร์มินอล 21", sales: 72100, target: 75000, percentage: 96.1 },
    { name: "พารากอน", sales: 81200, target: 78000, percentage: 104.1 },
  ];

  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Heading size="2xl" mb={2} fontFamily="heading">
            รายงานขาย
          </Heading>
          <Text color="gray.600" fontSize="lg">
            ข้อมูลยอดขายและแนวโน้มการขาย
          </Text>
        </Box>
        <HStack spacing={4}>
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
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            size="md"
            width="180px"
            bg="white"
            borderColor="gray.300"
            borderRadius="xl"
          >
            <option value="7days">7 วัน</option>
            <option value="30days">30 วัน</option>
            <option value="90days">90 วัน</option>
            <option value="1year">1 ปี</option>
          </Select>
          <Button leftIcon={<FiDownload />} colorScheme="blue" size="md">
            ส่งออก
          </Button>
        </HStack>
      </Flex>

      {/* Key Metrics */}
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
                ฿328,500
              </StatNumber>
              <StatHelpText color="green.500" fontSize="sm" fontWeight="medium">
                <StatArrow type="increase" />
                +15.4% จากเดือนก่อน
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
                1,847
              </StatNumber>
              <StatHelpText color="green.500" fontSize="sm" fontWeight="medium">
                <StatArrow type="increase" />
                +8.2% จากเดือนก่อน
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
                ฿178
              </StatNumber>
              <StatHelpText color="green.500" fontSize="sm" fontWeight="medium">
                <StatArrow type="increase" />
                +6.7% จากเดือนก่อน
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
                เป้าหมายยอดขาย
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color="gray.900">
                89.2%
              </StatNumber>
              <StatHelpText
                color="orange.500"
                fontSize="sm"
                fontWeight="medium"
              >
                <StatArrow type="increase" />
                +3.1% จากเดือนก่อน
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Charts */}
      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8} mb={8}>
        <GridItem>
          <Card
            borderRadius="2xl"
            border="1px"
            borderColor="gray.100"
            shadow="lg"
          >
            <CardHeader>
              <Heading size="md" fontFamily="heading">
                แนวโน้มยอดขายรายเดือน
              </Heading>
              <Text fontSize="sm" color="gray.600">
                เปรียบเทียบกับเป้าหมาย
              </Text>
            </CardHeader>
            <CardBody>
              <Box height="300px">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient
                        id="salesGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3182CE"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3182CE"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="month" stroke="#718096" />
                    <YAxis stroke="#718096" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #E2E8F0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#3182CE"
                      strokeWidth={3}
                      fill="url(#salesGradient)"
                    />
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="#F56565"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card
            borderRadius="2xl"
            border="1px"
            borderColor="gray.100"
            shadow="lg"
          >
            <CardHeader>
              <Heading size="md" fontFamily="heading">
                ยอดขายรายวัน
              </Heading>
              <Text fontSize="sm" color="gray.600">
                7 วันที่ผ่านมา
              </Text>
            </CardHeader>
            <CardBody>
              <Box height="300px">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailySales}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="day" stroke="#718096" />
                    <YAxis stroke="#718096" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #E2E8F0",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="sales" fill="#3182CE" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Tables */}
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={8}>
        <GridItem>
          <Card
            borderRadius="2xl"
            border="1px"
            borderColor="gray.100"
            shadow="lg"
          >
            <CardHeader>
              <Heading size="md" fontFamily="heading">
                สินค้าขายดี
              </Heading>
              <Text fontSize="sm" color="gray.600">
                TOP 5 รายการ
              </Text>
            </CardHeader>
            <CardBody>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>สินค้า</Th>
                    <Th isNumeric>ยอดขาย</Th>
                    <Th isNumeric>จำนวน</Th>
                    <Th isNumeric>การเติบโต</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {topProducts.map((product, index) => (
                    <Tr key={index}>
                      <Td fontWeight="medium">{product.name}</Td>
                      <Td isNumeric>฿{product.sales.toLocaleString()}</Td>
                      <Td isNumeric>{product.quantity}</Td>
                      <Td isNumeric>
                        <Badge
                          colorScheme={product.growth > 0 ? "green" : "red"}
                          variant="subtle"
                        >
                          {product.growth > 0 ? "+" : ""}
                          {product.growth}%
                        </Badge>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card
            borderRadius="2xl"
            border="1px"
            borderColor="gray.100"
            shadow="lg"
          >
            <CardHeader>
              <Heading size="md" fontFamily="heading">
                ประสิทธิภาพสาขา
              </Heading>
              <Text fontSize="sm" color="gray.600">
                เปรียบเทียบกับเป้าหมาย
              </Text>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {branchPerformance.map((branch, index) => (
                  <Box key={index} p={4} bg="gray.50" borderRadius="md">
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="medium">{branch.name}</Text>
                      <Badge
                        colorScheme={
                          branch.percentage >= 100 ? "green" : "orange"
                        }
                        variant="subtle"
                      >
                        {branch.percentage}%
                      </Badge>
                    </HStack>
                    <Progress
                      value={branch.percentage}
                      max={120}
                      colorScheme={
                        branch.percentage >= 100 ? "green" : "orange"
                      }
                      size="sm"
                      borderRadius="full"
                    />
                    <HStack justify="space-between" mt={2}>
                      <Text fontSize="sm" color="gray.600">
                        ฿{branch.sales.toLocaleString()}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        เป้าหมาย: ฿{branch.target.toLocaleString()}
                      </Text>
                    </HStack>
                  </Box>
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
SalesReportPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="รายงานขาย">{page}</Layout>;
};

// Protected route - requires authentication
export default withAuth(SalesReportPage, "staff");
