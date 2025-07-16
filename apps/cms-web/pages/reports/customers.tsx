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
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import {
  FiUsers,
  FiUserPlus,
  FiTrendingUp,
  FiHeart,
  FiDownload,
  FiSearch,
  FiRefreshCw,
  FiMail,
  FiPhone,
  FiCalendar,
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
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

function CustomersReportPage() {
  const [timeRange, setTimeRange] = useState("30days");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data
  const customerGrowth = [
    { month: "ม.ค.", new: 45, returning: 123, total: 168 },
    { month: "ก.พ.", new: 62, returning: 135, total: 197 },
    { month: "มี.ค.", new: 38, returning: 142, total: 180 },
    { month: "เม.ย.", new: 71, returning: 156, total: 227 },
    { month: "พ.ค.", new: 54, returning: 148, total: 202 },
    { month: "มิ.ย.", new: 67, returning: 167, total: 234 },
  ];

  const customerSegments = [
    { name: "ลูกค้าใหม่", value: 35, color: "#3182CE" },
    { name: "ลูกค้าประจำ", value: 45, color: "#38A169" },
    { name: "ลูกค้า VIP", value: 15, color: "#D69E2E" },
    { name: "ไม่ใช้งาน", value: 5, color: "#F56565" },
  ];

  const topCustomers = [
    {
      name: "สมชาย ใจดี",
      email: "somchai@example.com",
      orders: 45,
      spent: 12500,
      lastVisit: "2024-07-15",
      tier: "VIP",
    },
    {
      name: "สมหญิง รักดี",
      email: "somying@example.com",
      orders: 38,
      spent: 9800,
      lastVisit: "2024-07-14",
      tier: "Gold",
    },
    {
      name: "วิชัย เก่งมาก",
      email: "wichai@example.com",
      orders: 32,
      spent: 8200,
      lastVisit: "2024-07-13",
      tier: "Silver",
    },
    {
      name: "นันท์ สุขดี",
      email: "nan@example.com",
      orders: 28,
      spent: 7100,
      lastVisit: "2024-07-12",
      tier: "Silver",
    },
    {
      name: "ปิยะ มั่นใจ",
      email: "piya@example.com",
      orders: 25,
      spent: 6800,
      lastVisit: "2024-07-11",
      tier: "Bronze",
    },
  ];

  const customerBehavior = [
    { day: "จ", visits: 245, purchases: 189, conversion: 77.1 },
    { day: "อ", visits: 198, purchases: 145, conversion: 73.2 },
    { day: "พ", visits: 167, purchases: 123, conversion: 73.7 },
    { day: "พฤ", visits: 223, purchases: 178, conversion: 79.8 },
    { day: "ศ", visits: 256, purchases: 198, conversion: 77.3 },
    { day: "ส", visits: 334, purchases: 267, conversion: 79.9 },
    { day: "อา", visits: 298, purchases: 234, conversion: 78.5 },
  ];

  const recentCustomers = [
    {
      name: "อารยา สวยงาม",
      email: "araya@example.com",
      joinDate: "2024-07-15",
      source: "Facebook",
    },
    {
      name: "ธนา รวยมาก",
      email: "thana@example.com",
      joinDate: "2024-07-14",
      source: "Google",
    },
    {
      name: "สุดา ดีใจ",
      email: "suda@example.com",
      joinDate: "2024-07-13",
      source: "Line",
    },
    {
      name: "มานะ ขยันมาก",
      email: "mana@example.com",
      joinDate: "2024-07-12",
      source: "เพื่อนแนะนำ",
    },
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "VIP":
        return "purple";
      case "Gold":
        return "yellow";
      case "Silver":
        return "gray";
      case "Bronze":
        return "orange";
      default:
        return "blue";
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case "Facebook":
        return "blue";
      case "Google":
        return "red";
      case "Line":
        return "green";
      default:
        return "gray";
    }
  };

  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Heading size="2xl" mb={2} fontFamily="heading">
            รายงานลูกค้า
          </Heading>
          <Text color="gray.600" fontSize="lg">
            ข้อมูลลูกค้าและพฤติกรรมการซื้อ
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

      {/* Customer Summary */}
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
                ลูกค้าทั้งหมด
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color="gray.900">
                2,347
              </StatNumber>
              <StatHelpText color="green.500" fontSize="sm" fontWeight="medium">
                <StatArrow type="increase" />
                +15.2% จากเดือนก่อน
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
                ลูกค้าใหม่
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color="gray.900">
                67
              </StatNumber>
              <StatHelpText color="green.500" fontSize="sm" fontWeight="medium">
                <StatArrow type="increase" />
                +8.3% จากเดือนก่อน
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
                ลูกค้าที่กลับมา
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color="gray.900">
                78.5%
              </StatNumber>
              <StatHelpText color="green.500" fontSize="sm" fontWeight="medium">
                <StatArrow type="increase" />
                +3.2% จากเดือนก่อน
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
                ค่าใช้จ่ายเฉลี่ย
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color="gray.900">
                ฿1,245
              </StatNumber>
              <StatHelpText color="green.500" fontSize="sm" fontWeight="medium">
                <StatArrow type="increase" />
                +12.7% จากเดือนก่อน
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
                การเติบโตของลูกค้า
              </Heading>
              <Text fontSize="sm" color="gray.600">
                ลูกค้าใหม่ vs ลูกค้าเก่า
              </Text>
            </CardHeader>
            <CardBody>
              <Box height="300px">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={customerGrowth}>
                    <defs>
                      <linearGradient
                        id="newCustomers"
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
                      <linearGradient
                        id="returningCustomers"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#38A169"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#38A169"
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
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="new"
                      stackId="1"
                      stroke="#3182CE"
                      fill="url(#newCustomers)"
                    />
                    <Area
                      type="monotone"
                      dataKey="returning"
                      stackId="1"
                      stroke="#38A169"
                      fill="url(#returningCustomers)"
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
                กลุ่มลูกค้า
              </Heading>
              <Text fontSize="sm" color="gray.600">
                แบ่งตามระดับ
              </Text>
            </CardHeader>
            <CardBody>
              <Box height="300px">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={customerSegments}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {customerSegments.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <VStack spacing={2} mt={4}>
                {customerSegments.map((item, index) => (
                  <HStack key={index} justify="space-between" w="100%">
                    <HStack spacing={2}>
                      <Box w={3} h={3} bg={item.color} borderRadius="full" />
                      <Text fontSize="sm">{item.name}</Text>
                    </HStack>
                    <Text fontSize="sm" fontWeight="medium">
                      {item.value}%
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Customer Behavior */}
      <Card
        borderRadius="2xl"
        border="1px"
        borderColor="gray.100"
        shadow="lg"
        mb={8}
      >
        <CardHeader>
          <Heading size="md" fontFamily="heading">
            พฤติกรรมลูกค้ารายวัน
          </Heading>
          <Text fontSize="sm" color="gray.600">
            จำนวนการเข้าชมและอัตราการซื้อ
          </Text>
        </CardHeader>
        <CardBody>
          <Box height="300px">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerBehavior}>
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
                <Bar dataKey="visits" fill="#3182CE" name="เข้าชม" />
                <Bar dataKey="purchases" fill="#38A169" name="ซื้อสินค้า" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardBody>
      </Card>

      {/* Bottom Section */}
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={8}>
        {/* Top Customers */}
        <GridItem>
          <Card
            borderRadius="2xl"
            border="1px"
            borderColor="gray.100"
            shadow="lg"
          >
            <CardHeader>
              <Heading size="md" fontFamily="heading">
                ลูกค้าที่ซื้อมากที่สุด
              </Heading>
              <Text fontSize="sm" color="gray.600">
                TOP 5 ลูกค้า
              </Text>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {topCustomers.map((customer, index) => (
                  <HStack
                    key={index}
                    justify="space-between"
                    p={4}
                    bg="gray.50"
                    borderRadius="md"
                  >
                    <HStack spacing={3}>
                      <Avatar size="sm" name={customer.name} />
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium" fontSize="sm">
                          {customer.name}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {customer.orders} คำสั่ง • {customer.lastVisit}
                        </Text>
                      </VStack>
                    </HStack>
                    <VStack align="end" spacing={1}>
                      <Text fontWeight="bold" fontSize="sm" color="green.600">
                        ฿{customer.spent.toLocaleString()}
                      </Text>
                      <Badge
                        colorScheme={getTierColor(customer.tier)}
                        variant="subtle"
                      >
                        {customer.tier}
                      </Badge>
                    </VStack>
                  </HStack>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </GridItem>

        {/* Recent Customers */}
        <GridItem>
          <Card
            borderRadius="2xl"
            border="1px"
            borderColor="gray.100"
            shadow="lg"
          >
            <CardHeader>
              <Heading size="md" fontFamily="heading">
                ลูกค้าใหม่ล่าสุด
              </Heading>
              <Text fontSize="sm" color="gray.600">
                ลูกค้าที่เพิ่งสมัครสมาชิก
              </Text>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {recentCustomers.map((customer, index) => (
                  <HStack
                    key={index}
                    justify="space-between"
                    p={4}
                    bg="gray.50"
                    borderRadius="md"
                  >
                    <HStack spacing={3}>
                      <Avatar size="sm" name={customer.name} />
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium" fontSize="sm">
                          {customer.name}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {customer.email}
                        </Text>
                      </VStack>
                    </HStack>
                    <VStack align="end" spacing={1}>
                      <Text fontSize="xs" color="gray.600">
                        {customer.joinDate}
                      </Text>
                      <Badge
                        colorScheme={getSourceColor(customer.source)}
                        variant="subtle"
                      >
                        {customer.source}
                      </Badge>
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
CustomersReportPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="รายงานลูกค้า">{page}</Layout>;
};

// Protected route - requires authentication
export default withAuth(CustomersReportPage, "staff");
