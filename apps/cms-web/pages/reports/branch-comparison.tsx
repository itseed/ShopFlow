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
  Avatar,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import {
  FiMapPin,
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiUsers,
  FiPackage,
  FiTarget,
  FiDownload,
  FiRefreshCw,
  FiAward,
  FiBarChart,
} from "react-icons/fi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";

function BranchComparisonPage() {
  const [timeRange, setTimeRange] = useState("30days");
  const [selectedMetric, setSelectedMetric] = useState("sales");

  // Mock data
  const branchData = [
    {
      id: "branch-001",
      name: "สาขาสยามสแควร์",
      location: "สยามสแควร์",
      sales: 89500,
      target: 85000,
      orders: 456,
      customers: 234,
      avgOrder: 196,
      growth: 12.5,
      employees: 8,
      status: "excellent",
    },
    {
      id: "branch-002",
      name: "สาขาเซ็นทรัลเวิลด์",
      location: "เซ็นทรัลเวิลด์",
      sales: 76200,
      target: 80000,
      orders: 389,
      customers: 201,
      avgOrder: 196,
      growth: -3.2,
      employees: 7,
      status: "good",
    },
    {
      id: "branch-003",
      name: "สาขาเอ็มควอเทียร์",
      location: "เอ็มควอเทียร์",
      sales: 68900,
      target: 70000,
      orders: 352,
      customers: 189,
      avgOrder: 196,
      growth: 8.7,
      employees: 6,
      status: "good",
    },
    {
      id: "branch-004",
      name: "สาขาเทอร์มินอล 21",
      location: "เทอร์มินอล 21",
      sales: 72100,
      target: 75000,
      orders: 367,
      customers: 194,
      avgOrder: 196,
      growth: -1.4,
      employees: 7,
      status: "average",
    },
    {
      id: "branch-005",
      name: "สาขาพารากอน",
      location: "พารากอน",
      sales: 81200,
      target: 78000,
      orders: 414,
      customers: 218,
      avgOrder: 196,
      growth: 15.3,
      employees: 8,
      status: "excellent",
    },
  ];

  const monthlyComparison = [
    {
      month: "ม.ค.",
      siam: 82000,
      central: 71000,
      emq: 65000,
      terminal: 69000,
      paragon: 75000,
    },
    {
      month: "ก.พ.",
      siam: 85000,
      central: 73000,
      emq: 67000,
      terminal: 71000,
      paragon: 78000,
    },
    {
      month: "มี.ค.",
      siam: 87000,
      central: 75000,
      emq: 68000,
      terminal: 70000,
      paragon: 79000,
    },
    {
      month: "เม.ย.",
      siam: 88000,
      central: 74000,
      emq: 69000,
      terminal: 72000,
      paragon: 80000,
    },
    {
      month: "พ.ค.",
      siam: 89000,
      central: 76000,
      emq: 68500,
      terminal: 71500,
      paragon: 81000,
    },
    {
      month: "มิ.ย.",
      siam: 89500,
      central: 76200,
      emq: 68900,
      terminal: 72100,
      paragon: 81200,
    },
  ];

  const performanceMetrics = [
    {
      branch: "สยามสแควร์",
      sales: 95,
      efficiency: 92,
      customer: 88,
      growth: 90,
      quality: 94,
    },
    {
      branch: "เซ็นทรัลเวิลด์",
      sales: 85,
      efficiency: 78,
      customer: 82,
      growth: 65,
      quality: 85,
    },
    {
      branch: "เอ็มควอเทียร์",
      sales: 80,
      efficiency: 85,
      customer: 79,
      growth: 88,
      quality: 82,
    },
    {
      branch: "เทอร์มินอล 21",
      sales: 78,
      efficiency: 82,
      customer: 77,
      growth: 70,
      quality: 80,
    },
    {
      branch: "พารากอน",
      sales: 92,
      efficiency: 89,
      customer: 86,
      growth: 95,
      quality: 91,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "green";
      case "good":
        return "blue";
      case "average":
        return "orange";
      case "poor":
        return "red";
      default:
        return "gray";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "excellent":
        return "ดีเยี่ยม";
      case "good":
        return "ดี";
      case "average":
        return "ปานกลาง";
      case "poor":
        return "ต้องปรับปรุง";
      default:
        return "ไม่ทราบ";
    }
  };

  const totalSales = branchData.reduce((sum, branch) => sum + branch.sales, 0);
  const totalTarget = branchData.reduce(
    (sum, branch) => sum + branch.target,
    0
  );
  const totalOrders = branchData.reduce(
    (sum, branch) => sum + branch.orders,
    0
  );
  const totalCustomers = branchData.reduce(
    (sum, branch) => sum + branch.customers,
    0
  );

  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Heading size="2xl" mb={2} fontFamily="heading">
            เปรียบเทียบสาขา
          </Heading>
          <Text color="gray.600" fontSize="lg">
            เปรียบเทียบประสิทธิภาพระหว่างสาขาต่างๆ
          </Text>
        </Box>
        <HStack spacing={4}>
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

      {/* Overall Summary */}
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
                +8.4% จากเดือนก่อน
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
                เป้าหมายรวม
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color="gray.900">
                {((totalSales / totalTarget) * 100).toFixed(1)}%
              </StatNumber>
              <StatHelpText color="green.500" fontSize="sm" fontWeight="medium">
                <StatArrow type="increase" />
                +2.1% จากเดือนก่อน
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
                คำสั่งซื้อรวม
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color="gray.900">
                {totalOrders.toLocaleString()}
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
                ลูกค้าทั้งหมด
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color="gray.900">
                {totalCustomers.toLocaleString()}
              </StatNumber>
              <StatHelpText color="green.500" fontSize="sm" fontWeight="medium">
                <StatArrow type="increase" />
                +12.3% จากเดือนก่อน
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Tabs */}
      <Tabs variant="enclosed" colorScheme="blue" mb={8}>
        <TabList>
          <Tab>ยอดขายรายเดือน</Tab>
          <Tab>ประสิทธิภาพ</Tab>
          <Tab>รายละเอียดสาขา</Tab>
        </TabList>

        <TabPanels>
          {/* Monthly Sales Comparison */}
          <TabPanel px={0}>
            <Card
              borderRadius="2xl"
              border="1px"
              borderColor="gray.100"
              shadow="lg"
            >
              <CardHeader>
                <Heading size="md" fontFamily="heading">
                  เปรียบเทียบยอดขายรายเดือน
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  แนวโน้มยอดขายของแต่ละสาขา
                </Text>
              </CardHeader>
              <CardBody>
                <Box height="400px">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyComparison}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="month" stroke="#718096" />
                      <YAxis stroke="#718096" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #E2E8F0",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="siam"
                        stroke="#3182CE"
                        strokeWidth={2}
                        name="สยามสแควร์"
                      />
                      <Line
                        type="monotone"
                        dataKey="central"
                        stroke="#38A169"
                        strokeWidth={2}
                        name="เซ็นทรัลเวิลด์"
                      />
                      <Line
                        type="monotone"
                        dataKey="emq"
                        stroke="#D69E2E"
                        strokeWidth={2}
                        name="เอ็มควอเทียร์"
                      />
                      <Line
                        type="monotone"
                        dataKey="terminal"
                        stroke="#9F7AEA"
                        strokeWidth={2}
                        name="เทอร์มินอล 21"
                      />
                      <Line
                        type="monotone"
                        dataKey="paragon"
                        stroke="#F56565"
                        strokeWidth={2}
                        name="พารากอน"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Performance Radar */}
          <TabPanel px={0}>
            <Card
              borderRadius="2xl"
              border="1px"
              borderColor="gray.100"
              shadow="lg"
            >
              <CardHeader>
                <Heading size="md" fontFamily="heading">
                  ประสิทธิภาพแต่ละด้าน
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  เปรียบเทียบประสิทธิภาพในด้านต่างๆ
                </Text>
              </CardHeader>
              <CardBody>
                <Box height="500px">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={performanceMetrics}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="branch" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar
                        name="ยอดขาย"
                        dataKey="sales"
                        stroke="#3182CE"
                        fill="#3182CE"
                        fillOpacity={0.1}
                      />
                      <Radar
                        name="ประสิทธิภาพ"
                        dataKey="efficiency"
                        stroke="#38A169"
                        fill="#38A169"
                        fillOpacity={0.1}
                      />
                      <Radar
                        name="ลูกค้า"
                        dataKey="customer"
                        stroke="#D69E2E"
                        fill="#D69E2E"
                        fillOpacity={0.1}
                      />
                      <Radar
                        name="การเติบโต"
                        dataKey="growth"
                        stroke="#9F7AEA"
                        fill="#9F7AEA"
                        fillOpacity={0.1}
                      />
                      <Radar
                        name="คุณภาพ"
                        dataKey="quality"
                        stroke="#F56565"
                        fill="#F56565"
                        fillOpacity={0.1}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </Box>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Branch Details */}
          <TabPanel px={0}>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              {branchData.map((branch, index) => (
                <Card
                  key={index}
                  borderRadius="2xl"
                  border="1px"
                  borderColor="gray.100"
                  shadow="lg"
                >
                  <CardBody p={6}>
                    <VStack spacing={4} align="stretch">
                      <HStack justify="space-between">
                        <HStack spacing={3}>
                          <Avatar name={branch.name} bg="blue.500" />
                          <VStack align="start" spacing={1}>
                            <Text fontSize="lg" fontWeight="bold">
                              {branch.name}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              {branch.location}
                            </Text>
                          </VStack>
                        </HStack>
                        <Badge
                          colorScheme={getStatusColor(branch.status)}
                          variant="subtle"
                        >
                          {getStatusLabel(branch.status)}
                        </Badge>
                      </HStack>

                      <SimpleGrid columns={2} spacing={4}>
                        <Box>
                          <Text fontSize="sm" color="gray.500">
                            ยอดขาย
                          </Text>
                          <Text
                            fontSize="xl"
                            fontWeight="bold"
                            color="gray.900"
                          >
                            ฿{branch.sales.toLocaleString()}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.500">
                            เป้าหมาย
                          </Text>
                          <Text
                            fontSize="xl"
                            fontWeight="bold"
                            color="gray.900"
                          >
                            {((branch.sales / branch.target) * 100).toFixed(1)}%
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.500">
                            คำสั่งซื้อ
                          </Text>
                          <Text
                            fontSize="xl"
                            fontWeight="bold"
                            color="gray.900"
                          >
                            {branch.orders}
                          </Text>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.500">
                            ลูกค้า
                          </Text>
                          <Text
                            fontSize="xl"
                            fontWeight="bold"
                            color="gray.900"
                          >
                            {branch.customers}
                          </Text>
                        </Box>
                      </SimpleGrid>

                      <Box>
                        <Text fontSize="sm" color="gray.500" mb={2}>
                          ความคืบหน้าเป้าหมาย
                        </Text>
                        <Progress
                          value={(branch.sales / branch.target) * 100}
                          max={120}
                          colorScheme={
                            branch.sales >= branch.target ? "green" : "orange"
                          }
                          size="lg"
                          borderRadius="full"
                        />
                      </Box>

                      <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm" color="gray.500">
                            การเติบโต
                          </Text>
                          <HStack>
                            <Icon
                              as={
                                branch.growth > 0
                                  ? FiTrendingUp
                                  : FiTrendingDown
                              }
                              color={
                                branch.growth > 0 ? "green.500" : "red.500"
                              }
                            />
                            <Text
                              fontSize="sm"
                              fontWeight="medium"
                              color={
                                branch.growth > 0 ? "green.500" : "red.500"
                              }
                            >
                              {branch.growth > 0 ? "+" : ""}
                              {branch.growth}%
                            </Text>
                          </HStack>
                        </VStack>
                        <VStack align="end" spacing={1}>
                          <Text fontSize="sm" color="gray.500">
                            พนักงาน
                          </Text>
                          <Text fontSize="sm" fontWeight="medium">
                            {branch.employees} คน
                          </Text>
                        </VStack>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

// Use dashboard layout
BranchComparisonPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="เปรียบเทียบสาขา">{page}</Layout>;
};

// Protected route - requires authentication
export default withAuth(BranchComparisonPage, "staff");
