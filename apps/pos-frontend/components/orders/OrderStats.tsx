import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  Select,
  useColorModeValue,
  Icon,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Center,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  useToast,
} from "@chakra-ui/react";
import {
  IoTrendingUp,
  IoTrendingDown,
  IoReceipt,
  IoCard,
  IoCash,
  IoTime,
  IoCheckmarkCircle,
  IoClose,
  IoArrowUndo,
  IoRefresh,
  IoAnalytics,
  IoPeople,
  IoStorefront,
} from "react-icons/io5";
import { formatCurrency } from "../../lib/sales";

interface OrderStats {
  period: string;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  refundedOrders: number;
  refundAmount: number;
  topProducts: Array<{
    id: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  paymentMethods: Array<{
    type: string;
    count: number;
    amount: number;
    percentage: number;
  }>;
  hourlyStats: Array<{
    hour: number;
    orders: number;
    revenue: number;
  }>;
  previousPeriod: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
  };
}

interface OrderStatsProps {
  dateRange?: {
    start: Date;
    end: Date;
  };
  refreshInterval?: number;
}

const OrderStats: React.FC<OrderStatsProps> = ({
  dateRange,
  refreshInterval = 30000,
}) => {
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"today" | "week" | "month" | "year">(
    "today"
  );
  const [refreshing, setRefreshing] = useState(false);

  const toast = useToast();

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const successColor = useColorModeValue("green.500", "green.300");
  const warningColor = useColorModeValue("orange.500", "orange.300");
  const errorColor = useColorModeValue("red.500", "red.300");
  const infoColor = useColorModeValue("blue.500", "blue.300");

  useEffect(() => {
    loadStats();

    const interval = setInterval(() => {
      loadStats(true);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [period, dateRange, refreshInterval]);

  const loadStats = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock data
      const mockStats: OrderStats = {
        period: period,
        totalOrders: 156,
        totalRevenue: 45600,
        averageOrderValue: 292.31,
        completedOrders: 148,
        pendingOrders: 5,
        cancelledOrders: 2,
        refundedOrders: 1,
        refundAmount: 450,
        topProducts: [
          {
            id: "1",
            name: "กาแฟอเมริกาโน่",
            quantity: 45,
            revenue: 2025,
          },
          {
            id: "2",
            name: "ข้าวผัดกุ้ง",
            quantity: 28,
            revenue: 2240,
          },
          {
            id: "3",
            name: "ต้มยำกุ้ง",
            quantity: 22,
            revenue: 1980,
          },
          {
            id: "4",
            name: "ส้มตำ",
            quantity: 35,
            revenue: 1750,
          },
          {
            id: "5",
            name: "ชาเขียว",
            quantity: 18,
            revenue: 540,
          },
        ],
        paymentMethods: [
          {
            type: "cash",
            count: 89,
            amount: 25600,
            percentage: 56.1,
          },
          {
            type: "card",
            count: 52,
            amount: 15800,
            percentage: 34.6,
          },
          {
            type: "digital",
            count: 15,
            amount: 4200,
            percentage: 9.2,
          },
        ],
        hourlyStats: [
          { hour: 6, orders: 2, revenue: 150 },
          { hour: 7, orders: 8, revenue: 680 },
          { hour: 8, orders: 15, revenue: 1200 },
          { hour: 9, orders: 12, revenue: 980 },
          { hour: 10, orders: 18, revenue: 1450 },
          { hour: 11, orders: 25, revenue: 2100 },
          { hour: 12, orders: 32, revenue: 2850 },
          { hour: 13, orders: 28, revenue: 2400 },
          { hour: 14, orders: 16, revenue: 1350 },
          { hour: 15, orders: 12, revenue: 980 },
          { hour: 16, orders: 8, revenue: 650 },
          { hour: 17, orders: 15, revenue: 1200 },
          { hour: 18, orders: 22, revenue: 1800 },
          { hour: 19, orders: 18, revenue: 1450 },
          { hour: 20, orders: 14, revenue: 1150 },
          { hour: 21, orders: 8, revenue: 680 },
          { hour: 22, orders: 3, revenue: 250 },
        ],
        previousPeriod: {
          totalOrders: 142,
          totalRevenue: 41200,
          averageOrderValue: 290.14,
        },
      };

      setStats(mockStats);
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลสถิติได้",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return successColor;
      case "pending":
        return warningColor;
      case "cancelled":
        return errorColor;
      case "refunded":
        return infoColor;
      default:
        return "gray.500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return IoCheckmarkCircle;
      case "pending":
        return IoTime;
      case "cancelled":
        return IoClose;
      case "refunded":
        return IoArrowUndo;
      default:
        return IoReceipt;
    }
  };

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case "cash":
        return IoCash;
      case "card":
        return IoCard;
      case "digital":
        return IoStorefront;
      default:
        return IoCard;
    }
  };

  const getPaymentMethodText = (type: string) => {
    switch (type) {
      case "cash":
        return "เงินสด";
      case "card":
        return "บัตรเครดิต/เดบิต";
      case "digital":
        return "ชำระดิจิทัล";
      default:
        return type;
    }
  };

  const getPeriodText = (period: string) => {
    switch (period) {
      case "today":
        return "วันนี้";
      case "week":
        return "สัปดาห์นี้";
      case "month":
        return "เดือนนี้";
      case "year":
        return "ปีนี้";
      default:
        return period;
    }
  };

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <Center py={20}>
        <VStack spacing={3}>
          <Spinner size="xl" />
          <Text>กำลังโหลดข้อมูลสถิติ...</Text>
        </VStack>
      </Center>
    );
  }

  if (!stats) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>เกิดข้อผิดพลาด</AlertTitle>
        <AlertDescription>ไม่สามารถโหลดข้อมูลสถิติได้</AlertDescription>
      </Alert>
    );
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <HStack spacing={3}>
            <Icon as={IoAnalytics} w={6} h={6} />
            <Text fontSize="xl" fontWeight="bold">
              สถิติคำสั่งซื้อ
            </Text>
          </HStack>
          <HStack spacing={3}>
            <Select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              size="sm"
              w="120px"
            >
              <option value="today">วันนี้</option>
              <option value="week">สัปดาห์นี้</option>
              <option value="month">เดือนนี้</option>
              <option value="year">ปีนี้</option>
            </Select>
            <Button
              size="sm"
              leftIcon={<IoRefresh />}
              onClick={() => loadStats(true)}
              isLoading={refreshing}
              loadingText="รีเฟรช..."
            >
              รีเฟรช
            </Button>
          </HStack>
        </HStack>

        {/* Overview Stats */}
        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={6}>
          <GridItem>
            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>จำนวนคำสั่งซื้อ</StatLabel>
                  <StatNumber>{stats.totalOrders}</StatNumber>
                  <StatHelpText>
                    <StatArrow
                      type={
                        calculateGrowth(
                          stats.totalOrders,
                          stats.previousPeriod.totalOrders
                        ) >= 0
                          ? "increase"
                          : "decrease"
                      }
                    />
                    {formatPercentage(
                      calculateGrowth(
                        stats.totalOrders,
                        stats.previousPeriod.totalOrders
                      )
                    )}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>ยอดขายรวม</StatLabel>
                  <StatNumber>{formatCurrency(stats.totalRevenue)}</StatNumber>
                  <StatHelpText>
                    <StatArrow
                      type={
                        calculateGrowth(
                          stats.totalRevenue,
                          stats.previousPeriod.totalRevenue
                        ) >= 0
                          ? "increase"
                          : "decrease"
                      }
                    />
                    {formatPercentage(
                      calculateGrowth(
                        stats.totalRevenue,
                        stats.previousPeriod.totalRevenue
                      )
                    )}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>ยอดเฉลี่ย/คำสั่ง</StatLabel>
                  <StatNumber>
                    {formatCurrency(stats.averageOrderValue)}
                  </StatNumber>
                  <StatHelpText>
                    <StatArrow
                      type={
                        calculateGrowth(
                          stats.averageOrderValue,
                          stats.previousPeriod.averageOrderValue
                        ) >= 0
                          ? "increase"
                          : "decrease"
                      }
                    />
                    {formatPercentage(
                      calculateGrowth(
                        stats.averageOrderValue,
                        stats.previousPeriod.averageOrderValue
                      )
                    )}
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>อัตราความสำเร็จ</StatLabel>
                  <StatNumber>
                    {(
                      (stats.completedOrders / stats.totalOrders) *
                      100
                    ).toFixed(1)}
                    %
                  </StatNumber>
                  <StatHelpText>
                    {stats.completedOrders} จาก {stats.totalOrders} คำสั่ง
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* Order Status Breakdown */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Text fontSize="lg" fontWeight="medium">
              สถานะคำสั่งซื้อ
            </Text>
          </CardHeader>
          <CardBody>
            <Grid
              templateColumns="repeat(auto-fit, minmax(200px, 1fr))"
              gap={4}
            >
              <GridItem>
                <HStack>
                  <Icon
                    as={getStatusIcon("completed")}
                    color={getStatusColor("completed")}
                  />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm">สำเร็จ</Text>
                    <Text fontSize="lg" fontWeight="bold">
                      {stats.completedOrders}
                    </Text>
                  </VStack>
                </HStack>
              </GridItem>
              <GridItem>
                <HStack>
                  <Icon
                    as={getStatusIcon("pending")}
                    color={getStatusColor("pending")}
                  />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm">รอดำเนินการ</Text>
                    <Text fontSize="lg" fontWeight="bold">
                      {stats.pendingOrders}
                    </Text>
                  </VStack>
                </HStack>
              </GridItem>
              <GridItem>
                <HStack>
                  <Icon
                    as={getStatusIcon("cancelled")}
                    color={getStatusColor("cancelled")}
                  />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm">ยกเลิก</Text>
                    <Text fontSize="lg" fontWeight="bold">
                      {stats.cancelledOrders}
                    </Text>
                  </VStack>
                </HStack>
              </GridItem>
              <GridItem>
                <HStack>
                  <Icon
                    as={getStatusIcon("refunded")}
                    color={getStatusColor("refunded")}
                  />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm">คืนเงิน</Text>
                    <Text fontSize="lg" fontWeight="bold">
                      {stats.refundedOrders}
                    </Text>
                  </VStack>
                </HStack>
              </GridItem>
            </Grid>
          </CardBody>
        </Card>

        {/* Payment Methods */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Text fontSize="lg" fontWeight="medium">
              วิธีการชำระเงิน
            </Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {stats.paymentMethods.map((method, index) => (
                <Box key={index}>
                  <HStack justify="space-between" mb={2}>
                    <HStack>
                      <Icon as={getPaymentIcon(method.type)} />
                      <Text fontSize="sm">
                        {getPaymentMethodText(method.type)}
                      </Text>
                    </HStack>
                    <VStack align="end" spacing={0}>
                      <Text fontSize="sm" fontWeight="bold">
                        {formatCurrency(method.amount)}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {method.count} คำสั่ง
                      </Text>
                    </VStack>
                  </HStack>
                  <Progress
                    value={method.percentage}
                    size="sm"
                    colorScheme={
                      method.type === "cash"
                        ? "green"
                        : method.type === "card"
                        ? "blue"
                        : "purple"
                    }
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    {method.percentage.toFixed(1)}%
                  </Text>
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>

        {/* Top Products */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Text fontSize="lg" fontWeight="medium">
              สินค้าขายดี
            </Text>
          </CardHeader>
          <CardBody>
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>อันดับ</Th>
                    <Th>สินค้า</Th>
                    <Th isNumeric>จำนวน</Th>
                    <Th isNumeric>ยอดขาย</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {stats.topProducts.map((product, index) => (
                    <Tr key={product.id}>
                      <Td>
                        <Badge colorScheme={index < 3 ? "gold" : "gray"}>
                          #{index + 1}
                        </Badge>
                      </Td>
                      <Td>{product.name}</Td>
                      <Td isNumeric>{product.quantity}</Td>
                      <Td isNumeric fontWeight="medium">
                        {formatCurrency(product.revenue)}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default OrderStats;
