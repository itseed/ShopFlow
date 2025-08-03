import React, { useMemo } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardHeader,
  CardBody,
  useColorModeValue,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  Badge,
  Progress,
  Avatar,
  AvatarGroup,
  Table,
  TableContainer,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import {
  IoPeople,
  IoPersonAdd,
  IoHeart,
  IoTrendingUp,
  IoTrendingDown,
  IoStatsChart,
  IoBarChart,
  IoPieChart,
  IoGift,
  IoTime,
  IoStar,
} from "react-icons/io5";
import { Line, Bar, Doughnut } from "react-chartjs-2";
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
import { formatCurrency } from "../../lib/sales";

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

interface CustomerSegment {
  segment: string;
  count: number;
  percentage: number;
  avgOrderValue: number;
  totalRevenue: number;
  color: string;
}

interface CustomerTrend {
  period: string;
  newCustomers: number;
  returningCustomers: number;
  totalCustomers: number;
  retentionRate: number;
}

interface TopCustomer {
  id: string;
  name: string;
  email: string;
  totalSpent: number;
  orderCount: number;
  avgOrderValue: number;
  lastVisit: string;
  loyaltyTier: "Bronze" | "Silver" | "Gold" | "Platinum";
}

interface CustomerAnalyticsProps {
  segments: CustomerSegment[];
  trends: CustomerTrend[];
  topCustomers: TopCustomer[];
  totalCustomers: number;
  newCustomersThisPeriod: number;
  customerGrowthRate: number;
  avgCustomerLifetime: number;
  customerRetentionRate: number;
  avgOrdersPerCustomer: number;
  type?: "overview" | "detailed";
  period?: "daily" | "weekly" | "monthly";
  height?: string;
}

export const CustomerAnalytics: React.FC<CustomerAnalyticsProps> = ({
  segments,
  trends,
  topCustomers,
  totalCustomers,
  newCustomersThisPeriod,
  customerGrowthRate,
  avgCustomerLifetime,
  customerRetentionRate,
  avgOrdersPerCustomer,
  type = "overview",
  period = "weekly",
  height = "300px",
}) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const segmentChart = useMemo(() => ({
    labels: segments.map(s => s.segment),
    datasets: [
      {
        data: segments.map(s => s.count),
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(251, 146, 60, 0.8)",
          "rgba(147, 51, 234, 0.8)",
        ],
        borderWidth: 2,
      },
    ],
  }), [segments]);

  const customerTrendChart = useMemo(() => ({
    labels: trends.map(t => t.period),
    datasets: [
      {
        label: "ลูกค้าใหม่",
        data: trends.map(t => t.newCustomers),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        borderWidth: 3,
        fill: false,
        tension: 0.4,
      },
      {
        label: "ลูกค้าเก่า",
        data: trends.map(t => t.returningCustomers),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 3,
        fill: false,
        tension: 0.4,
      },
    ],
  }), [trends]);

  const retentionChart = useMemo(() => ({
    labels: trends.map(t => t.period),
    datasets: [
      {
        label: "อัตราการกลับมา (%)",
        data: trends.map(t => t.retentionRate),
        backgroundColor: "rgba(147, 51, 234, 0.8)",
        borderColor: "rgba(147, 51, 234, 1)",
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  }), [trends]);

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true, 
        position: 'top' as const 
      },
      title: { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#666" },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#e2e8f0" },
        ticks: { color: "#666" },
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#666" },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#e2e8f0" },
        ticks: {
          color: "#666",
          callback: function(value: any) {
            return value + '%';
          }
        },
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

  const getLoyaltyTierColor = (tier: string) => {
    switch (tier) {
      case "Platinum": return "purple";
      case "Gold": return "yellow";
      case "Silver": return "gray";
      case "Bronze": return "orange";
      default: return "gray";
    }
  };

  const getLoyaltyTierIcon = (tier: string) => {
    switch (tier) {
      case "Platinum": 
      case "Gold": return IoStar;
      case "Silver": return IoGift;
      case "Bronze": return IoHeart;
      default: return IoPeople;
    }
  };

  const getPeriodLabel = () => {
    switch (period) {
      case "daily": return "รายวัน";
      case "weekly": return "รายสัปดาห์";
      case "monthly": return "รายเดือน";
      default: return "รายสัปดาห์";
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Customer Stats */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
        <Stat>
          <StatLabel>ลูกค้าทั้งหมด</StatLabel>
          <StatNumber fontSize="xl" color="blue.600">
            {totalCustomers.toLocaleString()}
          </StatNumber>
          <StatHelpText>
            <StatArrow type={customerGrowthRate >= 0 ? "increase" : "decrease"} />
            {Math.abs(customerGrowthRate).toFixed(1)}%
          </StatHelpText>
        </Stat>

        <Stat>
          <StatLabel>ลูกค้าใหม่</StatLabel>
          <StatNumber fontSize="xl" color="green.600">
            {newCustomersThisPeriod}
          </StatNumber>
          <StatHelpText>ช่วงนี้</StatHelpText>
        </Stat>

        <Stat>
          <StatLabel>อัตราการกลับมา</StatLabel>
          <StatNumber fontSize="xl" color="purple.600">
            {customerRetentionRate.toFixed(1)}%
          </StatNumber>
          <StatHelpText>ของลูกค้าทั้งหมด</StatHelpText>
        </Stat>

        <Stat>
          <StatLabel>ค่าเฉลี่ยต่อลูกค้า</StatLabel>
          <StatNumber fontSize="xl" color="orange.600">
            {avgOrdersPerCustomer.toFixed(1)}
          </StatNumber>
          <StatHelpText>คำสั่งซื้อ</StatHelpText>
        </Stat>
      </SimpleGrid>

      {/* Main Analytics */}
      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab>ภาพรวม</Tab>
          <Tab>แนวโน้ม</Tab>
          <Tab>กลุ่มลูกค้า</Tab>
          <Tab>ลูกค้าชั้นนำ</Tab>
        </TabList>

        <TabPanels>
          {/* Overview Tab */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                <CardHeader>
                  <HStack spacing={3}>
                    <Icon as={IoPieChart} boxSize={5} color="blue.500" />
                    <Text fontSize="lg" fontWeight="bold">กลุ่มลูกค้า</Text>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <Box height={height}>
                    <Doughnut data={segmentChart} options={doughnutOptions} />
                  </Box>
                </CardBody>
              </Card>

              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                <CardHeader>
                  <HStack spacing={3}>
                    <Icon as={IoBarChart} boxSize={5} color="purple.500" />
                    <Text fontSize="lg" fontWeight="bold">อัตราการกลับมา</Text>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <Box height={height}>
                    <Bar data={retentionChart} options={barChartOptions} />
                  </Box>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>

          {/* Trends Tab */}
          <TabPanel>
            <VStack spacing={6} align="stretch">
              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                <CardHeader>
                  <HStack justify="space-between">
                    <HStack spacing={3}>
                      <Icon as={IoStatsChart} boxSize={5} color="green.500" />
                      <Text fontSize="lg" fontWeight="bold">แนวโน้มลูกค้า{getPeriodLabel()}</Text>
                    </HStack>
                    <Badge colorScheme="green" variant="subtle">
                      การเติบโต {customerGrowthRate.toFixed(1)}%
                    </Badge>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <Box height="400px">
                    <Line data={customerTrendChart} options={lineChartOptions} />
                  </Box>
                </CardBody>
              </Card>

              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} textAlign="center">
                  <CardBody>
                    <VStack spacing={2}>
                      <Icon as={IoPersonAdd} boxSize={8} color="green.500" />
                      <Text fontSize="2xl" fontWeight="bold" color="green.600">
                        {trends.reduce((sum, t) => sum + t.newCustomers, 0)}
                      </Text>
                      <Text fontSize="sm" color="gray.500">ลูกค้าใหม่รวม</Text>
                    </VStack>
                  </CardBody>
                </Card>

                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} textAlign="center">
                  <CardBody>
                    <VStack spacing={2}>
                      <Icon as={IoHeart} boxSize={8} color="blue.500" />
                      <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                        {trends.reduce((sum, t) => sum + t.returningCustomers, 0)}
                      </Text>
                      <Text fontSize="sm" color="gray.500">ลูกค้าเก่า</Text>
                    </VStack>
                  </CardBody>
                </Card>

                <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} textAlign="center">
                  <CardBody>
                    <VStack spacing={2}>
                      <Icon as={IoTime} boxSize={8} color="purple.500" />
                      <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                        {avgCustomerLifetime.toFixed(0)}
                      </Text>
                      <Text fontSize="sm" color="gray.500">วันเฉลี่ย</Text>
                    </VStack>
                  </CardBody>
                </Card>
              </SimpleGrid>
            </VStack>
          </TabPanel>

          {/* Segments Tab */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                <CardHeader>
                  <HStack spacing={3}>
                    <Icon as={IoPieChart} boxSize={5} color="orange.500" />
                    <Text fontSize="lg" fontWeight="bold">การแบ่งกลุ่มลูกค้า</Text>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <Box height={height}>
                    <Doughnut data={segmentChart} options={doughnutOptions} />
                  </Box>
                </CardBody>
              </Card>

              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                <CardHeader>
                  <Text fontSize="lg" fontWeight="bold">รายละเอียดกลุ่มลูกค้า</Text>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {segments.map((segment, index) => (
                      <VStack key={index} align="stretch" spacing={3} p={4} bg="gray.50" borderRadius="lg">
                        <HStack justify="space-between">
                          <Text fontWeight="bold">{segment.segment}</Text>
                          <Badge colorScheme={segment.color} variant="solid">
                            {segment.count} คน
                          </Badge>
                        </HStack>
                        
                        <SimpleGrid columns={2} spacing={4}>
                          <Box>
                            <Text fontSize="sm" color="gray.500">ค่าเฉลี่ยต่อออเดอร์</Text>
                            <Text fontWeight="medium" color="green.600">
                              {formatCurrency(segment.avgOrderValue)}
                            </Text>
                          </Box>
                          <Box>
                            <Text fontSize="sm" color="gray.500">รายได้รวม</Text>
                            <Text fontWeight="medium" color="blue.600">
                              {formatCurrency(segment.totalRevenue)}
                            </Text>
                          </Box>
                        </SimpleGrid>

                        <Progress
                          value={segment.percentage}
                          colorScheme={segment.color}
                          size="md"
                          borderRadius="full"
                        />
                        <Text fontSize="sm" color="gray.500" textAlign="center">
                          {segment.percentage.toFixed(1)}% ของลูกค้าทั้งหมด
                        </Text>
                      </VStack>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>

          {/* Top Customers Tab */}
          <TabPanel>
            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <CardHeader>
                <HStack justify="space-between">
                  <HStack spacing={3}>
                    <Icon as={IoStar} boxSize={5} color="gold" />
                    <Text fontSize="lg" fontWeight="bold">ลูกค้าชั้นนำ</Text>
                  </HStack>
                  <AvatarGroup size="sm" max={3}>
                    {topCustomers.slice(0, 3).map((customer, index) => (
                      <Avatar key={index} name={customer.name} />
                    ))}
                  </AvatarGroup>
                </HStack>
              </CardHeader>
              <CardBody>
                <TableContainer>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>ลูกค้า</Th>
                        <Th>ระดับสมาชิก</Th>
                        <Th isNumeric>ยอดซื้อรวม</Th>
                        <Th isNumeric>จำนวนออเดอร์</Th>
                        <Th isNumeric>ค่าเฉลี่ย</Th>
                        <Th>เข้าใช้ล่าสุด</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {topCustomers.map((customer, index) => (
                        <Tr key={customer.id}>
                          <Td>
                            <HStack spacing={3}>
                              <Avatar size="sm" name={customer.name} />
                              <VStack align="start" spacing={0}>
                                <Text fontWeight="medium">{customer.name}</Text>
                                <Text fontSize="xs" color="gray.500">
                                  {customer.email}
                                </Text>
                              </VStack>
                            </HStack>
                          </Td>
                          <Td>
                            <Badge 
                              colorScheme={getLoyaltyTierColor(customer.loyaltyTier)}
                              variant="solid"
                              leftIcon={<Icon as={getLoyaltyTierIcon(customer.loyaltyTier)} />}
                            >
                              {customer.loyaltyTier}
                            </Badge>
                          </Td>
                          <Td isNumeric fontWeight="bold" color="green.600">
                            {formatCurrency(customer.totalSpent)}
                          </Td>
                          <Td isNumeric>{customer.orderCount}</Td>
                          <Td isNumeric>
                            {formatCurrency(customer.avgOrderValue)}
                          </Td>
                          <Td>
                            <Text fontSize="sm">
                              {new Date(customer.lastVisit).toLocaleDateString("th-TH")}
                            </Text>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};

export default CustomerAnalytics;