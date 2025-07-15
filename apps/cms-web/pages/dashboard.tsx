import { ReactElement, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  Grid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Icon,
  Flex,
  VStack,
  HStack,
  Badge,
  Progress,
  useColorModeValue,
  Avatar,
  AvatarGroup,
  Divider,
  Select,
  CircularProgress,
  CircularProgressLabel,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
} from "@chakra-ui/react";
import {
  FiPackage,
  FiShoppingCart,
  FiUsers,
  FiTrendingUp,
  FiPlus,
  FiEye,
  FiBarChart,
  FiAlertTriangle,
  FiDollarSign,
  FiTarget,
  FiClock,
  FiStar,
  FiActivity,
  FiCalendar,
  FiMoreVertical,
} from "react-icons/fi";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { withAuth } from "../lib/auth";
import Layout from "../components/Layout";
import Link from "next/link";

// Mock data for charts
const salesData = [
  { name: "จ", ยอดขาย: 4000, คำสั่งซื้อ: 24 },
  { name: "อ", ยอดขาย: 3000, คำสั่งซื้อ: 18 },
  { name: "พ", ยอดขาย: 2000, คำสั่งซื้อ: 12 },
  { name: "พฤ", ยอดขาย: 2780, คำสั่งซื้อ: 16 },
  { name: "ศ", ยอดขาย: 1890, คำสั่งซื้อ: 11 },
  { name: "ส", ยอดขาย: 2390, คำสั่งซื้อ: 14 },
  { name: "อา", ยอดขาย: 3490, คำสั่งซื้อ: 20 },
];

const monthlyData = [
  { month: "ม.ค.", revenue: 45000, orders: 245, customers: 180 },
  { month: "ก.พ.", revenue: 52000, orders: 287, customers: 220 },
  { month: "มี.ค.", revenue: 48000, orders: 265, customers: 195 },
  { month: "เม.ย.", revenue: 61000, orders: 310, customers: 250 },
  { month: "พ.ค.", revenue: 55000, orders: 295, customers: 230 },
  { month: "มิ.ย.", revenue: 67000, orders: 345, customers: 280 },
];

const categoryData = [
  { name: "เครื่องดื่ม", value: 35, color: "#3182CE" },
  { name: "ขนม", value: 25, color: "#38A169" },
  { name: "อาหารแห้ง", value: 20, color: "#D69E2E" },
  { name: "ของใช้", value: 15, color: "#9F7AEA" },
  { name: "อื่นๆ", value: 5, color: "#F56565" },
];

const topProducts = [
  { name: "โค้ก 325ml", sales: 234, revenue: 5850, growth: 12 },
  { name: "น้ำเปล่า 600ml", sales: 189, revenue: 1890, growth: -3 },
  { name: "ลายส์ธรรมดา", sales: 156, revenue: 3120, growth: 8 },
  { name: "มาม่า หมูสับ", sales: 143, revenue: 1430, growth: 15 },
  { name: "นมเย็น UHT", sales: 128, revenue: 2560, growth: 5 },
];

const recentActivities = [
  {
    type: "order",
    user: "สมชาย ใจดี",
    action: "สร้างคำสั่งซื้อ #ORD-1234",
    time: "5 นาทีที่แล้ว",
    avatar: "SC",
  },
  {
    type: "product",
    user: "วิชัย เก่งมาก",
    action: "เพิ่มสินค้าใหม่ 3 รายการ",
    time: "15 นาทีที่แล้ว",
    avatar: "WK",
  },
  {
    type: "stock",
    user: "ระบบ",
    action: "แจ้งเตือนสต็อกต่ำ - โค้ก 325ml",
    time: "32 นาทีที่แล้ว",
    avatar: "SYS",
  },
  {
    type: "sale",
    user: "สมหญิง รักดี",
    action: "ขายสินค้า ฿1,250",
    time: "1 ชั่วโมงที่แล้ว",
    avatar: "SR",
  },
];

function DashboardPage() {
  const toast = useToast();
  const [timeRange, setTimeRange] = useState("7days");
  const [selectedBranch, setSelectedBranch] = useState("all");

  // Mock branch data
  const branches = [
    { id: "all", name: "ทุกสาขา", count: 5 },
    { id: "branch-001", name: "สาขาสยามสแควร์", count: 1 },
    { id: "branch-002", name: "สาขาเซ็นทรัลเวิลด์", count: 1 },
    { id: "branch-003", name: "สาขาเอ็มควอเทียร์", count: 1 },
    { id: "branch-004", name: "สาขาเทอร์มินอล 21", count: 1 },
    { id: "branch-005", name: "สาขาพารากอน", count: 1 },
  ];

  return (
    <Box>
      {/* Header with Time Range Selector */}
      <Flex justify="space-between" align="center" mb={10}>
        <Box>
          <Heading
            size="2xl"
            mb={3}
            fontFamily="heading"
            bgGradient="linear(to-r, gray.800, gray.600)"
            bgClip="text"
            letterSpacing="tight"
          >
            แดชบอร์ด
          </Heading>
          <Text color="gray.600" fontSize="lg">
            ภาพรวมร้านค้าและการขายของคุณ
            {selectedBranch !== "all" && (
              <Text as="span" color="blue.600" fontWeight="medium">
                {" "}
                • {branches.find((b) => b.id === selectedBranch)?.name}
              </Text>
            )}
          </Text>
        </Box>
        <HStack spacing={4}>
          <Select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            size="md"
            width="220px"
            bg="white"
            borderColor="gray.300"
            borderRadius="xl"
            _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182CE" }}
          >
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name} {branch.id !== "all" && `(${branch.count})`}
              </option>
            ))}
          </Select>

          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            size="md"
            width="180px"
            bg="white"
            borderColor="gray.300"
            borderRadius="xl"
            _focus={{ borderColor: "blue.400", boxShadow: "0 0 0 1px #3182CE" }}
          >
            <option value="today">วันนี้</option>
            <option value="7days">7 วันที่ผ่านมา</option>
            <option value="30days">30 วันที่ผ่านมา</option>
            <option value="90days">3 เดือนที่ผ่านมา</option>
          </Select>
        </HStack>
      </Flex>

      {/* Branch Performance Summary */}
      {selectedBranch === "all" && (
        <Card
          mb={8}
          borderRadius="2xl"
          border="1px"
          borderColor="gray.100"
          shadow="lg"
        >
          <CardHeader>
            <Heading size="md" fontFamily="heading">
              ประสิทธิภาพตามสาขา
            </Heading>
            <Text fontSize="sm" color="gray.600">
              เปรียบเทียบยอดขายระหว่างสาขา
            </Text>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={4}>
              {branches.slice(1).map((branch, index) => (
                <Box
                  key={branch.id}
                  p={4}
                  bg="gray.50"
                  borderRadius="xl"
                  border="1px"
                  borderColor="gray.200"
                  _hover={{ bg: "gray.100", borderColor: "blue.200" }}
                  transition="all 0.2s"
                  cursor="pointer"
                  onClick={() => setSelectedBranch(branch.id)}
                >
                  <VStack spacing={3}>
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color="gray.700"
                      noOfLines={1}
                    >
                      {branch.name}
                    </Text>
                    <VStack spacing={1}>
                      <Text fontSize="lg" fontWeight="bold" color="blue.600">
                        ฿
                        {((15420 / 5) * (1 + (Math.random() - 0.5) * 0.4))
                          .toFixed(0)
                          .toLocaleString()}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        ยอดขายวันนี้
                      </Text>
                    </VStack>
                    <Badge
                      colorScheme={
                        index % 3 === 0
                          ? "green"
                          : index % 3 === 1
                          ? "blue"
                          : "orange"
                      }
                      variant="subtle"
                      fontSize="xs"
                    >
                      {index % 3 === 0
                        ? "เป้าหมาย 120%"
                        : index % 3 === 1
                        ? "เป้าหมาย 95%"
                        : "เป้าหมาย 85%"}
                    </Badge>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          </CardBody>
        </Card>
      )}

      {/* Enhanced Stats Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8} mb={12}>
        <Card
          bg="white"
          borderRadius="2xl"
          border="1px"
          borderColor="gray.100"
          shadow="lg"
          transition="all 0.3s"
          _hover={{ transform: "translateY(-4px)", shadow: "2xl" }}
          overflow="hidden"
          position="relative"
        >
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            height="4px"
            bg="linear-gradient(90deg, #667eea 0%, #764ba2 100%)"
          />
          <CardBody p={8}>
            <Stat>
              <Flex justify="space-between" align="center">
                <Box>
                  <StatLabel
                    color="gray.500"
                    fontSize="sm"
                    fontWeight="medium"
                    textTransform="uppercase"
                    letterSpacing="wide"
                  >
                    {selectedBranch === "all"
                      ? "ยอดขายวันนี้ (ทุกสาขา)"
                      : "ยอดขายวันนี้"}
                  </StatLabel>
                  <StatNumber
                    fontSize="3xl"
                    fontWeight="bold"
                    color="gray.900"
                    letterSpacing="tight"
                  >
                    ฿15,420
                  </StatNumber>
                  <StatHelpText
                    color="green.500"
                    fontSize="sm"
                    fontWeight="medium"
                  >
                    <StatArrow type="increase" />
                    +12.5% จากเมื่อวาน
                  </StatHelpText>
                </Box>
                <Box
                  bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  p={4}
                  borderRadius="2xl"
                  color="white"
                >
                  <Icon as={FiDollarSign} boxSize={8} />
                </Box>
              </Flex>
            </Stat>
          </CardBody>
        </Card>

        <Card
          bg="white"
          borderRadius="2xl"
          border="1px"
          borderColor="gray.100"
          shadow="lg"
          transition="all 0.3s"
          _hover={{ transform: "translateY(-4px)", shadow: "2xl" }}
          overflow="hidden"
          position="relative"
        >
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            height="4px"
            bg="linear-gradient(90deg, #11998e 0%, #38ef7d 100%)"
          />
          <CardBody p={8}>
            <Stat>
              <Flex justify="space-between" align="center">
                <Box>
                  <StatLabel
                    color="gray.500"
                    fontSize="sm"
                    fontWeight="medium"
                    textTransform="uppercase"
                    letterSpacing="wide"
                  >
                    {selectedBranch === "all"
                      ? "คำสั่งซื้อวันนี้ (ทุกสาขา)"
                      : "คำสั่งซื้อวันนี้"}
                  </StatLabel>
                  <StatNumber
                    fontSize="3xl"
                    fontWeight="bold"
                    color="gray.900"
                    letterSpacing="tight"
                  >
                    89
                  </StatNumber>
                  <StatHelpText
                    color="green.500"
                    fontSize="sm"
                    fontWeight="medium"
                  >
                    <StatArrow type="increase" />
                    +8 รายการ
                  </StatHelpText>
                </Box>
                <Box
                  bg="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
                  p={4}
                  borderRadius="2xl"
                  color="white"
                >
                  <Icon as={FiShoppingCart} boxSize={8} />
                </Box>
              </Flex>
            </Stat>
          </CardBody>
        </Card>

        <Card
          bg="white"
          borderRadius="2xl"
          border="1px"
          borderColor="gray.100"
          shadow="lg"
          transition="all 0.3s"
          _hover={{ transform: "translateY(-4px)", shadow: "2xl" }}
          overflow="hidden"
          position="relative"
        >
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            height="4px"
            bg="linear-gradient(90deg, #f093fb 0%, #f5576c 100%)"
          />
          <CardBody p={8}>
            <Stat>
              <Flex justify="space-between" align="center">
                <Box>
                  <StatLabel
                    color="gray.500"
                    fontSize="sm"
                    fontWeight="medium"
                    textTransform="uppercase"
                    letterSpacing="wide"
                  >
                    {selectedBranch === "all"
                      ? "สินค้าทั้งหมด (ทุกสาขา)"
                      : "สินค้าทั้งหมด"}
                  </StatLabel>
                  <StatNumber
                    fontSize="3xl"
                    fontWeight="bold"
                    color="gray.900"
                    letterSpacing="tight"
                  >
                    1,234
                  </StatNumber>
                  <StatHelpText
                    color="green.500"
                    fontSize="sm"
                    fontWeight="medium"
                  >
                    <StatArrow type="increase" />
                    23 รายการใหม่
                  </StatHelpText>
                </Box>
                <Box
                  bg="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                  p={4}
                  borderRadius="2xl"
                  color="white"
                >
                  <Icon as={FiPackage} boxSize={8} />
                </Box>
              </Flex>
            </Stat>
          </CardBody>
        </Card>

        <Card
          bg="white"
          borderRadius="2xl"
          border="1px"
          borderColor="gray.100"
          shadow="lg"
          transition="all 0.3s"
          _hover={{ transform: "translateY(-4px)", shadow: "2xl" }}
          overflow="hidden"
          position="relative"
        >
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            height="4px"
            bg="linear-gradient(90deg, #ffecd2 0%, #fcb69f 100%)"
          />
          <CardBody p={8}>
            <Stat>
              <Flex justify="space-between" align="center">
                <Box>
                  <StatLabel
                    color="gray.500"
                    fontSize="sm"
                    fontWeight="medium"
                    textTransform="uppercase"
                    letterSpacing="wide"
                  >
                    {selectedBranch === "all"
                      ? "ลูกค้าใหม่ (ทุกสาขา)"
                      : "ลูกค้าใหม่"}
                  </StatLabel>
                  <StatNumber
                    fontSize="3xl"
                    fontWeight="bold"
                    color="gray.900"
                    letterSpacing="tight"
                  >
                    45
                  </StatNumber>
                  <StatHelpText
                    color="green.500"
                    fontSize="sm"
                    fontWeight="medium"
                  >
                    <StatArrow type="increase" />
                    +15.2% เดือนนี้
                  </StatHelpText>
                </Box>
                <Box
                  bg="linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"
                  p={4}
                  borderRadius="2xl"
                  color="white"
                >
                  <Icon as={FiUsers} boxSize={8} />
                </Box>
              </Flex>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Chart Section */}
      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8} mb={12}>
        {/* Sales Trend Chart */}
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <Box>
                <Heading size="md" fontFamily="heading">
                  ยอดขายรายวัน
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  แนวโน้มยอดขายและคำสั่งซื้อ
                </Text>
              </Box>
              <Menu>
                <MenuButton as={Button} variant="ghost" size="sm">
                  <Icon as={FiMoreVertical} />
                </MenuButton>
                <MenuList>
                  <MenuItem>ดูรายละเอียด</MenuItem>
                  <MenuItem>ส่งออกข้อมูล</MenuItem>
                  <MenuItem>แชร์</MenuItem>
                </MenuList>
              </Menu>
            </HStack>
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
                      <stop offset="5%" stopColor="#3182CE" stopOpacity={0.3} />
                      <stop
                        offset="95%"
                        stopColor="#3182CE"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#718096" />
                  <YAxis stroke="#718096" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #E2E8F0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(value, name) => [
                      name === "ยอดขาย" ? `฿${value.toLocaleString()}` : value,
                      name,
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="ยอดขาย"
                    stroke="#3182CE"
                    strokeWidth={3}
                    fill="url(#salesGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <Heading size="md" fontFamily="heading">
              หมวดหมู่สินค้า
            </Heading>
            <Text fontSize="sm" color="gray.600">
              สัดส่วนการขายตามหมวดหมู่
            </Text>
          </CardHeader>
          <CardBody>
            <Box height="300px">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value}%`, "สัดส่วน"]}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #E2E8F0",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <VStack spacing={2} mt={4}>
              {categoryData.map((item, index) => (
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
      </Grid>

      {/* Performance Metrics */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <VStack spacing={4}>
              <CircularProgress
                value={75}
                color="blue.400"
                size="100px"
                thickness={8}
              >
                <CircularProgressLabel fontSize="lg" fontWeight="bold">
                  75%
                </CircularProgressLabel>
              </CircularProgress>
              <VStack spacing={1}>
                <Text fontWeight="semibold">เป้าหมายยอดขาย</Text>
                <Text fontSize="sm" color="gray.600">
                  ฿45,000 / ฿60,000
                </Text>
                <Badge colorScheme="blue" variant="subtle">
                  ใกล้ถึงเป้าหมาย
                </Badge>
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <VStack spacing={4}>
              <CircularProgress
                value={92}
                color="green.400"
                size="100px"
                thickness={8}
              >
                <CircularProgressLabel fontSize="lg" fontWeight="bold">
                  92%
                </CircularProgressLabel>
              </CircularProgress>
              <VStack spacing={1}>
                <Text fontWeight="semibold">ความพึงพอใจลูกค้า</Text>
                <Text fontSize="sm" color="gray.600">
                  4.6/5.0 ดาว
                </Text>
                <Badge colorScheme="green" variant="subtle">
                  ดีเยี่ยม
                </Badge>
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <VStack spacing={4}>
              <CircularProgress
                value={67}
                color="orange.400"
                size="100px"
                thickness={8}
              >
                <CircularProgressLabel fontSize="lg" fontWeight="bold">
                  67%
                </CircularProgressLabel>
              </CircularProgress>
              <VStack spacing={1}>
                <Text fontWeight="semibold">อัตราการกลับมาซื้อ</Text>
                <Text fontSize="sm" color="gray.600">
                  324 จาก 483 คน
                </Text>
                <Badge colorScheme="orange" variant="subtle">
                  ปานกลาง
                </Badge>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Bottom Section */}
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr 1fr" }} gap={6}>
        {/* Top Products */}
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <Box>
                <Heading size="md" fontFamily="heading">
                  สินค้าขายดี
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  TOP 5 รายการ
                </Text>
              </Box>
              <Link href="/products">
                <Button size="sm" variant="ghost" rightIcon={<FiEye />}>
                  ดูทั้งหมด
                </Button>
              </Link>
            </HStack>
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
                  <HStack spacing={3}>
                    <Box
                      w={8}
                      h={8}
                      bg={
                        index === 0
                          ? "gold"
                          : index === 1
                          ? "silver"
                          : index === 2
                          ? "#CD7F32"
                          : "gray.300"
                      }
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      color="white"
                      fontSize="sm"
                      fontWeight="bold"
                    >
                      {index + 1}
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="medium" fontSize="sm">
                        {product.name}
                      </Text>
                      <Text fontSize="xs" color="gray.600">
                        {product.sales} ขาย
                      </Text>
                    </VStack>
                  </HStack>
                  <VStack align="end" spacing={0}>
                    <Text fontWeight="bold" fontSize="sm" color="green.600">
                      ฿{product.revenue.toLocaleString()}
                    </Text>
                    <HStack spacing={1}>
                      <Icon
                        as={product.growth > 0 ? FiTrendingUp : FiTrendingUp}
                        color={product.growth > 0 ? "green.500" : "red.500"}
                        boxSize={3}
                      />
                      <Text
                        fontSize="xs"
                        color={product.growth > 0 ? "green.500" : "red.500"}
                      >
                        {product.growth > 0 ? "+" : ""}
                        {product.growth}%
                      </Text>
                    </HStack>
                  </VStack>
                </HStack>
              ))}
            </VStack>
          </CardBody>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <Box>
                <Heading size="md" fontFamily="heading">
                  กิจกรรมล่าสุด
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  อัพเดตแบบเรียลไทม์
                </Text>
              </Box>
              <Icon as={FiActivity} color="blue.500" />
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {recentActivities.map((activity, index) => (
                <HStack key={index} spacing={3} p={2}>
                  <Avatar
                    size="sm"
                    name={activity.user}
                    bg="blue.500"
                    color="white"
                  >
                    {activity.avatar}
                  </Avatar>
                  <VStack align="start" spacing={0} flex={1}>
                    <Text fontSize="sm" fontWeight="medium">
                      {activity.user}
                    </Text>
                    <Text fontSize="xs" color="gray.600" noOfLines={2}>
                      {activity.action}
                    </Text>
                    <HStack spacing={1}>
                      <Icon as={FiClock} boxSize={3} color="gray.400" />
                      <Text fontSize="xs" color="gray.500">
                        {activity.time}
                      </Text>
                    </HStack>
                  </VStack>
                </HStack>
              ))}
            </VStack>
          </CardBody>
        </Card>

        {/* Quick Actions & Alerts */}
        <VStack spacing={6} align="stretch">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <Heading size="md" fontFamily="heading">
                การดำเนินการด่วน
              </Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={3} align="stretch">
                <Link href="/products/new">
                  <Button
                    leftIcon={<FiPlus />}
                    colorScheme="blue"
                    variant="outline"
                    size="sm"
                    w="100%"
                    justifyContent="flex-start"
                  >
                    เพิ่มสินค้าใหม่
                  </Button>
                </Link>
                <Link href="/orders">
                  <Button
                    leftIcon={<FiEye />}
                    colorScheme="green"
                    variant="outline"
                    size="sm"
                    w="100%"
                    justifyContent="flex-start"
                  >
                    ตรวจสอบคำสั่งซื้อ
                  </Button>
                </Link>
                <Link href="/reports/sales">
                  <Button
                    leftIcon={<FiBarChart />}
                    colorScheme="purple"
                    variant="outline"
                    size="sm"
                    w="100%"
                    justifyContent="flex-start"
                  >
                    ดูรายงานขาย
                  </Button>
                </Link>
                <Link href="/reports/inventory">
                  <Button
                    leftIcon={<FiPackage />}
                    colorScheme="teal"
                    variant="outline"
                    size="sm"
                    w="100%"
                    justifyContent="flex-start"
                  >
                    รายงานสต็อก
                  </Button>
                </Link>
                <Link href="/inventory/manage">
                  <Button
                    leftIcon={<FiPackage />}
                    colorScheme="orange"
                    variant="outline"
                    size="sm"
                    w="100%"
                    justifyContent="flex-start"
                  >
                    จัดการสต็อก
                  </Button>
                </Link>
              </VStack>
            </CardBody>
          </Card>

          {/* Reports Summary */}
          <Card>
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="md" fontFamily="heading">
                  รายงานสรุป
                </Heading>
                <Link href="/reports">
                  <Button size="sm" variant="ghost" rightIcon={<FiBarChart />}>
                    ดูทั้งหมด
                  </Button>
                </Link>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Box
                  p={3}
                  bg="blue.50"
                  borderRadius="md"
                  borderLeft="4px solid"
                  borderLeftColor="blue.400"
                >
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" fontWeight="medium" color="blue.700">
                        รายงานขายรายวัน
                      </Text>
                      <Text fontSize="xs" color="blue.600">
                        อัพเดตล่าสุด: วันนี้
                      </Text>
                    </VStack>
                    <Link href="/reports/daily-sales">
                      <Button size="xs" colorScheme="blue" variant="ghost">
                        ดู
                      </Button>
                    </Link>
                  </HStack>
                </Box>

                <Box
                  p={3}
                  bg="green.50"
                  borderRadius="md"
                  borderLeft="4px solid"
                  borderLeftColor="green.400"
                >
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <Text fontSize="sm" fontWeight="medium" color="green.700">
                        รายงานสต็อกสินค้า
                      </Text>
                      <Text fontSize="xs" color="green.600">
                        อัพเดตล่าสุด: 2 ชั่วโมงที่แล้ว
                      </Text>
                    </VStack>
                    <Link href="/reports/stock">
                      <Button size="xs" colorScheme="green" variant="ghost">
                        ดู
                      </Button>
                    </Link>
                  </HStack>
                </Box>

                <Box
                  p={3}
                  bg="purple.50"
                  borderRadius="md"
                  borderLeft="4px solid"
                  borderLeftColor="purple.400"
                >
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        color="purple.700"
                      >
                        รายงานลูกค้า
                      </Text>
                      <Text fontSize="xs" color="purple.600">
                        อัพเดตล่าสุด: เมื่อวาน
                      </Text>
                    </VStack>
                    <Link href="/reports/customers">
                      <Button size="xs" colorScheme="purple" variant="ghost">
                        ดู
                      </Button>
                    </Link>
                  </HStack>
                </Box>

                {selectedBranch === "all" && (
                  <Box
                    p={3}
                    bg="orange.50"
                    borderRadius="md"
                    borderLeft="4px solid"
                    borderLeftColor="orange.400"
                  >
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1}>
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color="orange.700"
                        >
                          รายงานเปรียบเทียบสาขา
                        </Text>
                        <Text fontSize="xs" color="orange.600">
                          อัพเดตล่าสุด: วันนี้
                        </Text>
                      </VStack>
                      <Link href="/reports/branch-comparison">
                        <Button size="xs" colorScheme="orange" variant="ghost">
                          ดู
                        </Button>
                      </Link>
                    </HStack>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="md" fontFamily="heading">
                  แจ้งเตือนสำคัญ
                </Heading>
                <Badge colorScheme="red" variant="solid">
                  3
                </Badge>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={3} align="stretch">
                <Box
                  p={3}
                  bg="red.50"
                  borderRadius="md"
                  borderLeft="4px solid"
                  borderLeftColor="red.400"
                >
                  <HStack align="start" spacing={2}>
                    <Icon as={FiAlertTriangle} color="red.500" mt={0.5} />
                    <VStack align="start" spacing={1} flex={1}>
                      <Text fontSize="sm" fontWeight="medium" color="red.700">
                        สต็อกหมด
                      </Text>
                      <Text fontSize="xs" color="red.600">
                        โค้ก 325ml และอีก 2 รายการ
                      </Text>
                    </VStack>
                  </HStack>
                </Box>

                <Box
                  p={3}
                  bg="orange.50"
                  borderRadius="md"
                  borderLeft="4px solid"
                  borderLeftColor="orange.400"
                >
                  <HStack align="start" spacing={2}>
                    <Icon as={FiPackage} color="orange.500" mt={0.5} />
                    <VStack align="start" spacing={1} flex={1}>
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        color="orange.700"
                      >
                        สต็อกต่ำ
                      </Text>
                      <Text fontSize="xs" color="orange.600">
                        น้ำเปล่า 600ml เหลือ 15 ขวด
                      </Text>
                    </VStack>
                  </HStack>
                </Box>

                <Box
                  p={3}
                  bg="yellow.50"
                  borderRadius="md"
                  borderLeft="4px solid"
                  borderLeftColor="yellow.400"
                >
                  <HStack align="start" spacing={2}>
                    <Icon as={FiClock} color="yellow.500" mt={0.5} />
                    <VStack align="start" spacing={1} flex={1}>
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        color="yellow.700"
                      >
                        คำสั่งซื้อรอดำเนินการ
                      </Text>
                      <Text fontSize="xs" color="yellow.600">
                        5 รายการรอการยืนยัน
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Grid>
    </Box>
  );
}

// Use dashboard layout
DashboardPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="แดชบอร์ด">{page}</Layout>;
};

// Protected route - requires authentication
export default withAuth(DashboardPage, "staff");
