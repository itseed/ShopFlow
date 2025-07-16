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
  Progress,
  Flex,
  Icon,
  Grid,
  GridItem,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import {
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiPercent,
  FiDownload,
  FiRefreshCw,
  FiPieChart,
  FiBarChart,
  FiCalendar,
  FiTarget,
  FiShoppingCart,
  FiPackage,
  FiCreditCard,
  FiTruck,
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
  ComposedChart,
} from "recharts";

function ProfitLossPage() {
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedBranch, setSelectedBranch] = useState("all");

  // Mock data
  const profitStats = [
    {
      label: "กำไรสุทธิ",
      value: "1,234,567",
      change: 15.3,
      changeType: "increase",
      icon: FiDollarSign,
      color: "green",
    },
    {
      label: "อัตรากำไรขั้นต้น",
      value: "32.5%",
      change: 2.1,
      changeType: "increase",
      icon: FiPercent,
      color: "blue",
    },
    {
      label: "รายได้รวม",
      value: "4,567,890",
      change: 18.7,
      changeType: "increase",
      icon: FiTrendingUp,
      color: "purple",
    },
    {
      label: "ต้นทุนรวม",
      value: "3,089,234",
      change: 12.4,
      changeType: "increase",
      icon: FiTrendingDown,
      color: "orange",
    },
  ];

  const monthlyProfitData = [
    {
      month: "ม.ค.",
      revenue: 450000,
      cost: 320000,
      profit: 130000,
      margin: 28.9,
    },
    {
      month: "ก.พ.",
      revenue: 520000,
      cost: 348000,
      profit: 172000,
      margin: 33.1,
    },
    {
      month: "มี.ค.",
      revenue: 480000,
      cost: 335000,
      profit: 145000,
      margin: 30.2,
    },
    {
      month: "เม.ย.",
      revenue: 580000,
      cost: 389000,
      profit: 191000,
      margin: 32.9,
    },
    {
      month: "พ.ค.",
      revenue: 650000,
      cost: 425000,
      profit: 225000,
      margin: 34.6,
    },
    {
      month: "มิ.ย.",
      revenue: 720000,
      cost: 468000,
      profit: 252000,
      margin: 35.0,
    },
    {
      month: "ก.ค.",
      revenue: 690000,
      cost: 456000,
      profit: 234000,
      margin: 33.9,
    },
  ];

  const costBreakdown = [
    { name: "ต้นทุนสินค้า", value: 45, amount: 1389000, color: "#3182CE" },
    { name: "ค่าแรงพนักงาน", value: 25, amount: 772000, color: "#38A169" },
    { name: "ค่าเช่าพื้นที่", value: 15, amount: 463000, color: "#D69E2E" },
    { name: "ค่าไฟฟ้า", value: 8, amount: 247000, color: "#9F7AEA" },
    { name: "ค่าขนส่ง", value: 4, amount: 123000, color: "#F56565" },
    { name: "อื่นๆ", value: 3, amount: 95000, color: "#718096" },
  ];

  const branchProfitData = [
    {
      branch: "สยามสแควร์",
      revenue: 1250000,
      cost: 820000,
      profit: 430000,
      margin: 34.4,
      status: "excellent",
    },
    {
      branch: "เซ็นทรัลเวิลด์",
      revenue: 1180000,
      cost: 789000,
      profit: 391000,
      margin: 33.1,
      status: "good",
    },
    {
      branch: "เอ็มควอเทียร์",
      revenue: 980000,
      cost: 685000,
      profit: 295000,
      margin: 30.1,
      status: "average",
    },
    {
      branch: "เทอร์มินอล 21",
      revenue: 1050000,
      cost: 742000,
      profit: 308000,
      margin: 29.3,
      status: "average",
    },
    {
      branch: "พารากอน",
      revenue: 1320000,
      cost: 856000,
      profit: 464000,
      margin: 35.2,
      status: "excellent",
    },
  ];

  const profitTrends = [
    { week: "สัปดาห์ 1", profit: 85000, target: 80000 },
    { week: "สัปดาห์ 2", profit: 92000, target: 85000 },
    { week: "สัปดาห์ 3", profit: 78000, target: 82000 },
    { week: "สัปดาห์ 4", profit: 105000, target: 90000 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "green";
      case "good":
        return "blue";
      case "average":
        return "yellow";
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

  const formatCurrency = (value: number) => {
    return `฿${value.toLocaleString()}`;
  };

  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Heading size="2xl" mb={2} fontFamily="heading">
            รายงานกำไรขาดทุน
          </Heading>
          <Text color="gray.600" fontSize="lg">
            วิเคราะห์กำไรขาดทุนและต้นทุนดำเนินงาน
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
            width="150px"
            bg="white"
            borderColor="gray.300"
            borderRadius="xl"
          >
            <option value="7d">7 วัน</option>
            <option value="30d">30 วัน</option>
            <option value="90d">90 วัน</option>
            <option value="1y">1 ปี</option>
          </Select>
          <Button
            leftIcon={<FiDownload />}
            colorScheme="gray"
            size="md"
            variant="outline"
          >
            ส่งออก
          </Button>
          <Button leftIcon={<FiRefreshCw />} colorScheme="blue" size="md">
            รีเฟรช
          </Button>
        </HStack>
      </Flex>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        {profitStats.map((stat, index) => (
          <Card
            key={index}
            borderRadius="2xl"
            border="1px"
            borderColor="gray.100"
            shadow="lg"
          >
            <CardBody p={6}>
              <Flex align="center" justify="space-between">
                <Box>
                  <Stat>
                    <StatLabel
                      color="gray.500"
                      fontSize="sm"
                      fontWeight="medium"
                    >
                      {stat.label}
                    </StatLabel>
                    <StatNumber
                      fontSize="2xl"
                      fontWeight="bold"
                      color="gray.900"
                    >
                      {stat.label.includes("%") ? stat.value : `฿${stat.value}`}
                    </StatNumber>
                    <StatHelpText fontSize="sm" fontWeight="medium">
                      <StatArrow
                        type={stat.changeType as "increase" | "decrease"}
                      />
                      {stat.change}%
                    </StatHelpText>
                  </Stat>
                </Box>
                <Box
                  p={3}
                  borderRadius="xl"
                  bg={`${stat.color}.50`}
                  color={`${stat.color}.600`}
                >
                  <Icon as={stat.icon} boxSize={6} />
                </Box>
              </Flex>
            </CardBody>
          </Card>
        ))}
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
                แนวโน้มกำไรรายเดือน
              </Heading>
              <Text fontSize="sm" color="gray.600">
                เปรียบเทียบรายได้ ต้นทุน และกำไร
              </Text>
            </CardHeader>
            <CardBody>
              <Box height="400px">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={monthlyProfitData}>
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
                    <Bar dataKey="revenue" fill="#3182CE" name="รายได้" />
                    <Bar dataKey="cost" fill="#F56565" name="ต้นทุน" />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#38A169"
                      strokeWidth={3}
                      name="กำไร"
                    />
                  </ComposedChart>
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
                โครงสร้างต้นทุน
              </Heading>
              <Text fontSize="sm" color="gray.600">
                การแบ่งสัดส่วนต้นทุนดำเนินงาน
              </Text>
            </CardHeader>
            <CardBody>
              <Box height="400px">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={costBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
                      }
                    >
                      {costBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [
                        `${value}% (${formatCurrency(
                          costBreakdown.find((c) => c.name === name)?.amount ||
                            0
                        )})`,
                        name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* Detailed Analysis */}
      <Card borderRadius="2xl" border="1px" borderColor="gray.100" shadow="lg">
        <CardHeader>
          <Heading size="md" fontFamily="heading">
            วิเคราะห์รายละเอียด
          </Heading>
          <Text fontSize="sm" color="gray.600">
            ข้อมูลกำไรขาดทุนแบ่งตามหมวดหมู่
          </Text>
        </CardHeader>
        <CardBody>
          <Tabs colorScheme="blue">
            <TabList>
              <Tab>กำไรตามสาขา</Tab>
              <Tab>แนวโน้มรายสัปดาห์</Tab>
              <Tab>โครงสร้างต้นทุน</Tab>
            </TabList>

            <TabPanels>
              <TabPanel px={0}>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>สาขา</Th>
                        <Th>รายได้</Th>
                        <Th>ต้นทุน</Th>
                        <Th>กำไร</Th>
                        <Th>อัตรากำไร</Th>
                        <Th>สถานะ</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {branchProfitData.map((branch, index) => (
                        <Tr key={index}>
                          <Td>
                            <Text fontWeight="semibold">{branch.branch}</Text>
                          </Td>
                          <Td>
                            <Text fontWeight="bold" color="blue.600">
                              {formatCurrency(branch.revenue)}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontWeight="bold" color="red.600">
                              {formatCurrency(branch.cost)}
                            </Text>
                          </Td>
                          <Td>
                            <Text fontWeight="bold" color="green.600">
                              {formatCurrency(branch.profit)}
                            </Text>
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              <Text fontWeight="bold">{branch.margin}%</Text>
                              <Progress
                                value={branch.margin}
                                max={40}
                                colorScheme={getStatusColor(branch.status)}
                                size="sm"
                                width="60px"
                                borderRadius="full"
                              />
                            </HStack>
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={getStatusColor(branch.status)}
                              variant="subtle"
                            >
                              {getStatusLabel(branch.status)}
                            </Badge>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </TabPanel>

              <TabPanel px={0}>
                <Box height="400px">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={profitTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="week" stroke="#718096" />
                      <YAxis stroke="#718096" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #E2E8F0",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="profit"
                        stroke="#38A169"
                        strokeWidth={3}
                        name="กำไรจริง"
                      />
                      <Line
                        type="monotone"
                        dataKey="target"
                        stroke="#F56565"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="เป้าหมาย"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </TabPanel>

              <TabPanel px={0}>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {costBreakdown.map((cost, index) => (
                    <Card
                      key={index}
                      borderRadius="xl"
                      border="1px"
                      borderColor="gray.100"
                    >
                      <CardBody p={6}>
                        <VStack spacing={4}>
                          <Box
                            p={3}
                            borderRadius="xl"
                            bg={`${cost.color}20`}
                            color={cost.color}
                          >
                            <Icon as={FiPieChart} boxSize={6} />
                          </Box>
                          <VStack spacing={2}>
                            <Text fontWeight="bold" fontSize="lg">
                              {cost.name}
                            </Text>
                            <Text
                              fontSize="2xl"
                              fontWeight="bold"
                              color="gray.900"
                            >
                              {formatCurrency(cost.amount)}
                            </Text>
                            <Badge colorScheme="blue" variant="subtle">
                              {cost.value}% ของต้นทุนรวม
                            </Badge>
                          </VStack>
                        </VStack>
                      </CardBody>
                    </Card>
                  ))}
                </SimpleGrid>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>
    </Box>
  );
}

// Use dashboard layout
ProfitLossPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="รายงานกำไรขาดทุน">{page}</Layout>;
};

// Protected route - requires authentication
export default withAuth(ProfitLossPage, "staff");
