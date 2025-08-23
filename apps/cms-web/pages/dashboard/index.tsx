import { ReactElement, useState, useMemo } from "react";
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
  Spinner,
  Alert,
  AlertIcon,
  AlertDescription,
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
  FiTruck,
  FiCreditCard,
  FiPercent,
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
import { withAuth } from "../../lib/auth";
import Layout from "../../components/Layout";
import { useDashboard } from "../../lib/hooks/useDashboard";
import { useBranches } from "../../lib/hooks/useBranches";
import Link from "next/link";

// Real-time activity types
interface RecentActivity {
  id: string;
  type: "order" | "product" | "customer" | "stock" | "payment";
  title: string;
  description: string;
  user?: string;
  timestamp: string;
  status?: "success" | "warning" | "error" | "info";
  amount?: number;
}

// Generate recent activities from real data
const generateRecentActivities = (
  metrics: any,
  topPerformers: any
): RecentActivity[] => {
  const activities: RecentActivity[] = [];

  // Add recent order activity
  if (metrics.todayOrders > 0) {
    activities.push({
      id: "recent_orders",
      type: "order",
      title: "คำสั่งซื้อใหม่",
      description: `มีคำสั่งซื้อใหม่ ${metrics.todayOrders} รายการวันนี้`,
      timestamp: "เมื่อสักครู่",
      status: "success",
      amount: metrics.todaySales,
    });
  }

  // Add stock alerts
  if (metrics.lowStockCount > 0) {
    activities.push({
      id: "low_stock",
      type: "stock",
      title: "แจ้งเตือนสต็อกต่ำ",
      description: `พบสินค้าสต็อกต่ำ ${metrics.lowStockCount} รายการ`,
      timestamp: "30 นาทีที่แล้ว",
      status: "warning",
    });
  }

  if (metrics.outOfStockCount > 0) {
    activities.push({
      id: "out_of_stock",
      type: "stock",
      title: "สินค้าหมด",
      description: `พบสินค้าหมด ${metrics.outOfStockCount} รายการ`,
      timestamp: "1 ชั่วโมงที่แล้ว",
      status: "error",
    });
  }

  // Add customer activity
  if (metrics.todayCustomers > 0) {
    activities.push({
      id: "new_customers",
      type: "customer",
      title: "ลูกค้าใหม่",
      description: `มีลูกค้าใหม่ ${metrics.todayCustomers} ราย`,
      timestamp: "2 ชั่วโมงที่แล้ว",
      status: "info",
    });
  }

  // Add payment activity
  if (metrics.pendingPayments > 0) {
    activities.push({
      id: "pending_payments",
      type: "payment",
      title: "การชำระเงินค้างชำระ",
      description: `มียอดค้างชำระ ฿${metrics.pendingPayments.toLocaleString()}`,
      timestamp: "3 ชั่วโมงที่แล้ว",
      status: "warning",
      amount: metrics.pendingPayments,
    });
  }

  return activities.slice(0, 5); // Limit to 5 recent activities
};

function DashboardPage() {
  const toast = useToast();
  const [timeRange, setTimeRange] = useState<
    "today" | "7days" | "30days" | "90days"
  >("7days");
  const [selectedBranch, setSelectedBranch] = useState("all");

  // Get branches data
  const { branches = [], loading: branchesLoading } = useBranches();

  // Enhanced dashboard data
  const { metrics, chartData, topPerformers, isLoading, error } = useDashboard({
    timeRange,
    branchId: selectedBranch,
  });

  // Generate recent activities from real data
  const recentActivities = useMemo(() => {
    if (!metrics) return [];
    return generateRecentActivities(metrics, topPerformers);
  }, [metrics, topPerformers]);

  // Prepare branches for select dropdown
  const branchOptions = useMemo(() => {
    const options = [
      { id: "all", name: "ทุกสาขา", count: (branches || []).length },
    ];
    (branches || []).forEach((branch) => {
      options.push({
        id: branch.id,
        name: branch.name,
        count: 1,
      });
    });
    return options;
  }, [branches]);

  if (error) {
    return (
      <Box>
        <Alert status="error" mb={4}>
          <AlertIcon />
          <AlertDescription>
            เกิดข้อผิดพลาดในการโหลดข้อมูลแดชบอร์ด: {error}
          </AlertDescription>
        </Alert>
      </Box>
    );
  }

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
                • {branchOptions.find((b) => b.id === selectedBranch)?.name}
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
            {branchOptions.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name} {branch.id !== "all" && `(${branch.count})`}
              </option>
            ))}
          </Select>

          <Select
            value={timeRange}
            onChange={(e) =>
              setTimeRange(
                e.target.value as "today" | "7days" | "30days" | "90days"
              )
            }
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

      {/* Enhanced Branch Performance Summary */}
      {selectedBranch === "all" &&
        chartData &&
        chartData.branchPerformance &&
        chartData.branchPerformance.length > 0 && (
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
                เปรียบเทียบยอดขายและประสิทธิภาพระหว่างสาขา
              </Text>
            </CardHeader>
            <CardBody>
              {isLoading ? (
                <Flex justify="center" p={8}>
                  <Spinner size="lg" />
                </Flex>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={4}>
                  {chartData.branchPerformance.map((branch, index) => {
                    const performanceColor =
                      branch.status === "excellent"
                        ? "green"
                        : branch.status === "good"
                        ? "blue"
                        : branch.status === "average"
                        ? "orange"
                        : "red";

                    return (
                      <Box
                        key={branch.branchId}
                        p={4}
                        bg="gray.50"
                        borderRadius="xl"
                        border="1px"
                        borderColor="gray.200"
                        _hover={{ bg: "gray.100", borderColor: "blue.200" }}
                        transition="all 0.2s"
                        cursor="pointer"
                        onClick={() => setSelectedBranch(branch.branchId)}
                      >
                        <VStack spacing={3}>
                          <Text
                            fontSize="sm"
                            fontWeight="bold"
                            color="gray.700"
                            noOfLines={1}
                            textAlign="center"
                          >
                            {branch.branchName}
                          </Text>
                          <VStack spacing={1}>
                            <Text
                              fontSize="lg"
                              fontWeight="bold"
                              color="blue.600"
                            >
                              ฿{branch.sales.toLocaleString()}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              ยอดขาย ({branch.orders} คำสั่ง)
                            </Text>
                          </VStack>
                          <Badge
                            colorScheme={performanceColor}
                            variant="subtle"
                            fontSize="xs"
                          >
                            {branch.performance.toFixed(1)}% ของเป้า
                          </Badge>
                        </VStack>
                      </Box>
                    );
                  })}
                </SimpleGrid>
              )}
            </CardBody>
          </Card>
        )}

      {/* Enhanced Stats Cards with Real Data */}
      {isLoading ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8} mb={12}>
          {[1, 2, 3, 4].map((i) => (
            <Card
              key={i}
              bg="white"
              borderRadius="2xl"
              border="1px"
              borderColor="gray.100"
              shadow="lg"
            >
              <CardBody p={8}>
                <Flex justify="center" align="center" h="120px">
                  <Spinner size="lg" />
                </Flex>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8} mb={12}>
          {/* Sales Card */}
          <Card
            bg="white"
            borderRadius="2xl"
            border="1px"
            borderColor="gray.100"
            shadow="lg"
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
                        ? "ยอดขายรวม (ทุกสาขา)"
                        : "ยอดขายรวม"}
                    </StatLabel>
                    <StatNumber
                      fontSize="3xl"
                      fontWeight="bold"
                      color="gray.900"
                      letterSpacing="tight"
                    >
                      ฿{metrics.todaySales.toLocaleString()}
                    </StatNumber>
                    <StatHelpText
                      color={metrics.salesGrowth >= 0 ? "green.500" : "red.500"}
                      fontSize="sm"
                      fontWeight="medium"
                    >
                      <StatArrow
                        type={
                          metrics.salesGrowth >= 0 ? "increase" : "decrease"
                        }
                      />
                      {metrics.salesGrowth >= 0 ? "+" : ""}
                      {metrics.salesGrowth.toFixed(1)}% จากช่วงก่อน
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

          {/* Orders Card */}
          <Card
            bg="white"
            borderRadius="2xl"
            border="1px"
            borderColor="gray.100"
            shadow="lg"
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
                        ? "คำสั่งซื้อรวม (ทุกสาขา)"
                        : "คำสั่งซื้อรวม"}
                    </StatLabel>
                    <StatNumber
                      fontSize="3xl"
                      fontWeight="bold"
                      color="gray.900"
                      letterSpacing="tight"
                    >
                      {metrics.todayOrders.toLocaleString()}
                    </StatNumber>
                    <StatHelpText
                      color={
                        metrics.ordersGrowth >= 0 ? "green.500" : "red.500"
                      }
                      fontSize="sm"
                      fontWeight="medium"
                    >
                      <StatArrow
                        type={
                          metrics.ordersGrowth >= 0 ? "increase" : "decrease"
                        }
                      />
                      {metrics.ordersGrowth >= 0 ? "+" : ""}
                      {metrics.ordersGrowth.toFixed(1)}% เทียบช่วงก่อน
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

          {/* Products Card */}
          <Card
            bg="white"
            borderRadius="2xl"
            border="1px"
            borderColor="gray.100"
            shadow="lg"
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
                      {metrics.totalProducts.toLocaleString()}
                    </StatNumber>
                    <StatHelpText
                      color={
                        metrics.lowStockCount > 0 ? "orange.500" : "green.500"
                      }
                      fontSize="sm"
                      fontWeight="medium"
                    >
                      {metrics.lowStockCount > 0 ? (
                        <>
                          <Icon as={FiAlertTriangle} mr={1} />
                          {metrics.lowStockCount} รายการสต็อกต่ำ
                        </>
                      ) : (
                        <>
                          <StatArrow type="increase" />
                          สต็อกปกติ
                        </>
                      )}
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

          {/* Customers Card */}
          <Card
            bg="white"
            borderRadius="2xl"
            border="1px"
            borderColor="gray.100"
            shadow="lg"
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
                      {metrics.todayCustomers.toLocaleString()}
                    </StatNumber>
                    <StatHelpText
                      color={
                        metrics.customerGrowth >= 0 ? "green.500" : "red.500"
                      }
                      fontSize="sm"
                      fontWeight="medium"
                    >
                      <StatArrow
                        type={
                          metrics.customerGrowth >= 0 ? "increase" : "decrease"
                        }
                      />
                      {metrics.customerGrowth >= 0 ? "+" : ""}
                      {metrics.customerGrowth.toFixed(1)}% เดือนนี้
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
      )}

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
            </HStack>
          </CardHeader>
          <CardBody>
            <Box height="300px">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.salesChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="date" stroke="#718096" />
                  <YAxis stroke="#718096" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#3182CE"
                    fill="rgba(49, 130, 206, 0.1)"
                  />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    stroke="#38A169"
                    fill="rgba(56, 161, 105, 0.1)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>

        {/* Category Chart */}
        <Card>
          <CardHeader>
            <Heading size="md" fontFamily="heading">
              หมวดหมู่สินค้า
            </Heading>
          </CardHeader>
          <CardBody>
            <Box height="300px">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.categoryChart}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {chartData.categoryChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </CardBody>
        </Card>
      </Grid>

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
              {topPerformers.products.map((product, index) => (
                <HStack
                  key={product.id}
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
                        as={FiTrendingUp}
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
              {topPerformers.products.length === 0 && (
                <Text color="gray.500" textAlign="center" py={4}>
                  ไม่มีข้อมูลสินค้า
                </Text>
              )}
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
              {recentActivities.map((activity) => (
                <HStack key={activity.id} spacing={3} p={2}>
                  <Box
                    w={8}
                    h={8}
                    bg={
                      activity.status === "success"
                        ? "green.500"
                        : activity.status === "warning"
                        ? "orange.500"
                        : activity.status === "error"
                        ? "red.500"
                        : "blue.500"
                    }
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="white"
                    fontSize="xs"
                  >
                    <Icon
                      as={
                        activity.type === "order"
                          ? FiShoppingCart
                          : activity.type === "stock"
                          ? FiPackage
                          : activity.type === "customer"
                          ? FiUsers
                          : activity.type === "payment"
                          ? FiCreditCard
                          : FiActivity
                      }
                    />
                  </Box>
                  <VStack align="start" spacing={0} flex={1}>
                    <Text fontSize="sm" fontWeight="medium">
                      {activity.title}
                    </Text>
                    <Text fontSize="xs" color="gray.600" noOfLines={2}>
                      {activity.description}
                    </Text>
                    <HStack spacing={1}>
                      <Icon as={FiClock} boxSize={3} color="gray.400" />
                      <Text fontSize="xs" color="gray.500">
                        {activity.timestamp}
                      </Text>
                    </HStack>
                  </VStack>
                  {activity.amount && (
                    <Text fontSize="xs" fontWeight="bold" color="green.600">
                      ฿{activity.amount.toLocaleString()}
                    </Text>
                  )}
                </HStack>
              ))}
              {recentActivities.length === 0 && (
                <Text color="gray.500" textAlign="center" py={4}>
                  ไม่มีกิจกรรมล่าสุด
                </Text>
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
              <Badge
                colorScheme={
                  metrics.outOfStockCount + metrics.lowStockCount > 0
                    ? "red"
                    : "green"
                }
                variant="solid"
              >
                {metrics.outOfStockCount + metrics.lowStockCount}
              </Badge>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="stretch">
              {metrics.outOfStockCount > 0 && (
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
                        พบสินค้าหมด {metrics.outOfStockCount} รายการ
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              )}

              {metrics.lowStockCount > 0 && (
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
                        พบสินค้าสต็อกต่ำ {metrics.lowStockCount} รายการ
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              )}

              {metrics.pendingPayments > 0 && (
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
                        การชำระเงินค้างชำระ
                      </Text>
                      <Text fontSize="xs" color="yellow.600">
                        ยอดค้างชำระ ฿{metrics.pendingPayments.toLocaleString()}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              )}

              {metrics.outOfStockCount === 0 &&
                metrics.lowStockCount === 0 &&
                metrics.pendingPayments === 0 && (
                  <Box
                    p={3}
                    bg="green.50"
                    borderRadius="md"
                    borderLeft="4px solid"
                    borderLeftColor="green.400"
                  >
                    <HStack align="start" spacing={2}>
                      <Icon as={FiTarget} color="green.500" mt={0.5} />
                      <VStack align="start" spacing={1} flex={1}>
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color="green.700"
                        >
                          ทุกอย่างเรียบร้อย
                        </Text>
                        <Text fontSize="xs" color="green.600">
                          ไม่มีปัญหาที่ต้องแก้ไขด่วน
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                )}
            </VStack>
          </CardBody>
        </Card>
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
