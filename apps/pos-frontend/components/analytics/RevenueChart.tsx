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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import {
  IoTrendingUp,
  IoTrendingDown,
  IoCash,
  IoCard,
  IoWallet,
  IoStatsChart,
  IoBarChart,
  IoPieChart,
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

interface RevenueData {
  period: string;
  revenue: number;
  profit: number;
  expenses: number;
  margin: number;
}

interface PaymentMethod {
  method: string;
  amount: number;
  percentage: number;
  growth: number;
}

interface RevenueStream {
  source: string;
  amount: number;
  percentage: number;
  trend: "up" | "down" | "stable";
}

interface RevenueChartProps {
  revenueData: RevenueData[];
  paymentMethods: PaymentMethod[];
  revenueStreams: RevenueStream[];
  totalRevenue: number;
  totalProfit: number;
  profitMargin: number;
  revenueGrowth: number;
  type?: "overview" | "detailed";
  period?: "daily" | "weekly" | "monthly";
  height?: string;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  revenueData,
  paymentMethods,
  revenueStreams,
  totalRevenue,
  totalProfit,
  profitMargin,
  revenueGrowth,
  type = "overview",
  period = "daily",
  height = "300px",
}) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const revenueVsProfitChart = useMemo(() => ({
    labels: revenueData.map(d => d.period),
    datasets: [
      {
        label: "รายได้",
        data: revenueData.map(d => d.revenue),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 3,
        fill: false,
        tension: 0.4,
      },
      {
        label: "กำไร",
        data: revenueData.map(d => d.profit),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        borderWidth: 3,
        fill: false,
        tension: 0.4,
      },
    ],
  }), [revenueData]);

  const paymentMethodChart = useMemo(() => ({
    labels: paymentMethods.map(p => p.method),
    datasets: [
      {
        data: paymentMethods.map(p => p.amount),
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(251, 146, 60, 0.8)",
          "rgba(147, 51, 234, 0.8)",
        ],
        borderWidth: 2,
      },
    ],
  }), [paymentMethods]);

  const revenueStreamChart = useMemo(() => ({
    labels: revenueStreams.map(r => r.source),
    datasets: [
      {
        label: "รายได้",
        data: revenueStreams.map(r => r.amount),
        backgroundColor: [
          "rgba(102, 126, 234, 0.8)",
          "rgba(255, 99, 132, 0.8)",
          "rgba(255, 206, 86, 0.8)",
          "rgba(75, 192, 192, 0.8)",
        ],
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  }), [revenueStreams]);

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
        ticks: {
          color: "#666",
          callback: function(value: any) {
            return '฿' + value.toLocaleString();
          }
        },
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
            return '฿' + value.toLocaleString();
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return IoTrendingUp;
      case "down": return IoTrendingDown;
      default: return IoStatsChart;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up": return "green";
      case "down": return "red";
      default: return "gray";
    }
  };

  const getPeriodLabel = () => {
    switch (period) {
      case "daily": return "รายวัน";
      case "weekly": return "รายสัปดาห์";
      case "monthly": return "รายเดือน";
      default: return "รายวัน";
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Revenue Stats */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
        <Stat>
          <StatLabel>รายได้รวม</StatLabel>
          <StatNumber fontSize="xl" color="blue.600">
            {formatCurrency(totalRevenue)}
          </StatNumber>
          <StatHelpText>
            <StatArrow type={revenueGrowth >= 0 ? "increase" : "decrease"} />
            {Math.abs(revenueGrowth).toFixed(1)}%
          </StatHelpText>
        </Stat>

        <Stat>
          <StatLabel>กำไรรวม</StatLabel>
          <StatNumber fontSize="xl" color="green.600">
            {formatCurrency(totalProfit)}
          </StatNumber>
          <StatHelpText>จากรายได้</StatHelpText>
        </Stat>

        <Stat>
          <StatLabel>อัตรากำไร</StatLabel>
          <StatNumber fontSize="xl" color="purple.600">
            {profitMargin.toFixed(1)}%
          </StatNumber>
          <StatHelpText>ของรายได้รวม</StatHelpText>
        </Stat>

        <Stat>
          <StatLabel>อัตราการเติบโต</StatLabel>
          <StatNumber 
            fontSize="xl" 
            color={revenueGrowth >= 0 ? "green.600" : "red.600"}
          >
            {revenueGrowth >= 0 ? "+" : ""}{revenueGrowth.toFixed(1)}%
          </StatNumber>
          <StatHelpText>เมื่อเทียบกับช่วงก่อน</StatHelpText>
        </Stat>
      </SimpleGrid>

      {/* Main Charts */}
      <Tabs variant="enclosed" colorScheme="blue">
        <TabList>
          <Tab>ภาพรวม</Tab>
          <Tab>รายได้ vs กำไร</Tab>
          <Tab>วิธีการชำระ</Tab>
          <Tab>แหล่งรายได้</Tab>
        </TabList>

        <TabPanels>
          {/* Overview Tab */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                <CardHeader>
                  <HStack spacing={3}>
                    <Icon as={IoStatsChart} boxSize={5} color="blue.500" />
                    <Text fontSize="lg" fontWeight="bold">รายได้และกำไร{getPeriodLabel()}</Text>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <Box height={height}>
                    <Line data={revenueVsProfitChart} options={lineChartOptions} />
                  </Box>
                </CardBody>
              </Card>

              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                <CardHeader>
                  <HStack spacing={3}>
                    <Icon as={IoPieChart} boxSize={5} color="green.500" />
                    <Text fontSize="lg" fontWeight="bold">วิธีการชำระเงิน</Text>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <Box height={height}>
                    <Doughnut data={paymentMethodChart} options={doughnutOptions} />
                  </Box>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>

          {/* Revenue vs Profit Tab */}
          <TabPanel>
            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <CardHeader>
                <HStack justify="space-between">
                  <HStack spacing={3}>
                    <Icon as={IoStatsChart} boxSize={5} color="blue.500" />
                    <Text fontSize="lg" fontWeight="bold">แนวโน้มรายได้และกำไร</Text>
                  </HStack>
                  <Badge colorScheme="green" variant="subtle">
                    อัตรากำไร {profitMargin.toFixed(1)}%
                  </Badge>
                </HStack>
              </CardHeader>
              <CardBody>
                <Box height="400px">
                  <Line data={revenueVsProfitChart} options={lineChartOptions} />
                </Box>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Payment Methods Tab */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                <CardHeader>
                  <HStack spacing={3}>
                    <Icon as={IoPieChart} boxSize={5} color="purple.500" />
                    <Text fontSize="lg" fontWeight="bold">สัดส่วนการชำระเงิน</Text>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <Box height={height}>
                    <Doughnut data={paymentMethodChart} options={doughnutOptions} />
                  </Box>
                </CardBody>
              </Card>

              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                <CardHeader>
                  <Text fontSize="lg" fontWeight="bold">รายละเอียดการชำระ</Text>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {paymentMethods.map((method, index) => (
                      <VStack key={index} align="stretch" spacing={2}>
                        <HStack justify="space-between">
                          <HStack spacing={3}>
                            <Icon 
                              as={method.method === "เงินสด" ? IoCash : 
                                  method.method.includes("บัตร") ? IoCard : IoWallet}
                              color="gray.500" 
                            />
                            <Text fontWeight="medium">{method.method}</Text>
                          </HStack>
                          <VStack align="end" spacing={0}>
                            <Text fontWeight="bold" color="green.600">
                              {formatCurrency(method.amount)}
                            </Text>
                            <HStack spacing={1}>
                              <Icon 
                                as={method.growth >= 0 ? IoTrendingUp : IoTrendingDown}
                                color={method.growth >= 0 ? "green.500" : "red.500"}
                                boxSize={3}
                              />
                              <Text 
                                fontSize="xs" 
                                color={method.growth >= 0 ? "green.500" : "red.500"}
                              >
                                {Math.abs(method.growth).toFixed(1)}%
                              </Text>
                            </HStack>
                          </VStack>
                        </HStack>
                        <Progress
                          value={method.percentage}
                          colorScheme="blue"
                          size="md"
                          borderRadius="full"
                        />
                        <Text fontSize="sm" color="gray.500" textAlign="right">
                          {method.percentage.toFixed(1)}% ของรายได้รวม
                        </Text>
                      </VStack>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>

          {/* Revenue Streams Tab */}
          <TabPanel>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                <CardHeader>
                  <HStack spacing={3}>
                    <Icon as={IoBarChart} boxSize={5} color="orange.500" />
                    <Text fontSize="lg" fontWeight="bold">แหล่งที่มาของรายได้</Text>
                  </HStack>
                </CardHeader>
                <CardBody>
                  <Box height={height}>
                    <Bar data={revenueStreamChart} options={barChartOptions} />
                  </Box>
                </CardBody>
              </Card>

              <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
                <CardHeader>
                  <Text fontSize="lg" fontWeight="bold">รายละเอียดแหล่งรายได้</Text>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    {revenueStreams.map((stream, index) => (
                      <HStack key={index} justify="space-between" p={3} bg="gray.50" borderRadius="md">
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">{stream.source}</Text>
                          <Text fontSize="sm" color="gray.500">
                            {stream.percentage.toFixed(1)}% ของรายได้รวม
                          </Text>
                        </VStack>
                        <VStack align="end" spacing={0}>
                          <Text fontWeight="bold" color="green.600">
                            {formatCurrency(stream.amount)}
                          </Text>
                          <HStack spacing={1}>
                            <Icon 
                              as={getTrendIcon(stream.trend)}
                              color={`${getTrendColor(stream.trend)}.500`}
                              boxSize={3}
                            />
                            <Text 
                              fontSize="xs" 
                              color={`${getTrendColor(stream.trend)}.500`}
                            >
                              {stream.trend === "up" ? "เพิ่มขึ้น" :
                               stream.trend === "down" ? "ลดลง" : "คงที่"}
                            </Text>
                          </HStack>
                        </VStack>
                      </HStack>
                    ))}
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </VStack>
  );
};

export default RevenueChart;