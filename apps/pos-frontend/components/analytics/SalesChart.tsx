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
  Select,
} from "@chakra-ui/react";
import {
  IoTrendingUp,
  IoTrendingDown,
  IoStatsChart,
  IoBarChart,
} from "react-icons/io5";
import dynamic from "next/dynamic";
// Use dynamic imports for ESM modules
const Line = dynamic(() => import("react-chartjs-2").then((mod) => mod.Line), { ssr: false });
const Bar = dynamic(() => import("react-chartjs-2").then((mod) => mod.Bar), { ssr: false });

import { formatCurrency } from "../../lib/sales";
import { registerChartJS } from "../../lib/chartConfig";

// Register Chart.js
registerChartJS();

interface SalesData {
  period: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
  growth: number;
}

interface SalesChartProps {
  data: SalesData[];
  type?: "line" | "bar";
  period?: "daily" | "weekly" | "monthly";
  showStats?: boolean;
  height?: string;
}

export const SalesChart: React.FC<SalesChartProps> = ({
  data,
  type = "line",
  period = "daily",
  showStats = true,
  height = "300px",
}) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const chartData = useMemo(() => ({
    labels: data.map(d => d.period),
    datasets: [
      {
        label: "รายได้",
        data: data.map(d => d.revenue),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: type === "bar" ? "rgba(59, 130, 246, 0.8)" : "rgba(59, 130, 246, 0.1)",
        borderWidth: 3,
        fill: type === "line",
        tension: 0.4,
        borderRadius: type === "bar" ? 6 : 0,
      },
    ],
  }), [data, type]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
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
  }), []);

  const stats = useMemo(() => {
    const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
    const totalOrders = data.reduce((sum, d) => sum + d.orders, 0);
    const avgGrowth = data.reduce((sum, d) => sum + d.growth, 0) / data.length;
    const avgOrderValue = totalRevenue / totalOrders;

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      avgGrowth,
    };
  }, [data]);

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? IoTrendingUp : IoTrendingDown;
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? "green" : "red";
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
      {showStats && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          <Stat>
            <StatLabel>รายได้รวม</StatLabel>
            <StatNumber fontSize="xl">
              {formatCurrency(stats.totalRevenue)}
            </StatNumber>
            <StatHelpText>
              <StatArrow type={stats.avgGrowth >= 0 ? "increase" : "decrease"} />
              {Math.abs(stats.avgGrowth).toFixed(1)}%
            </StatHelpText>
          </Stat>

          <Stat>
            <StatLabel>คำสั่งซื้อรวม</StatLabel>
            <StatNumber fontSize="xl">
              {stats.totalOrders.toLocaleString()}
            </StatNumber>
            <StatHelpText>รายการ</StatHelpText>
          </Stat>

          <Stat>
            <StatLabel>ค่าเฉลี่ยต่อออเดอร์</StatLabel>
            <StatNumber fontSize="xl">
              {formatCurrency(stats.avgOrderValue)}
            </StatNumber>
            <StatHelpText>บาท</StatHelpText>
          </Stat>

          <Stat>
            <StatLabel>อัตราการเติบโต</StatLabel>
            <StatNumber fontSize="xl" color={`${getGrowthColor(stats.avgGrowth)}.600`}>
              {stats.avgGrowth >= 0 ? "+" : ""}{stats.avgGrowth.toFixed(1)}%
            </StatNumber>
            <StatHelpText>เฉลี่ย</StatHelpText>
          </Stat>
        </SimpleGrid>
      )}

      <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
        <CardHeader>
          <HStack justify="space-between">
            <HStack spacing={3}>
              <Icon as={type === "line" ? IoStatsChart : IoBarChart} boxSize={5} color="blue.500" />
              <Text fontSize="lg" fontWeight="bold">
                แผนภูมิยอดขาย{getPeriodLabel()}
              </Text>
            </HStack>
            <Badge colorScheme="blue" variant="subtle">
              {data.length} รายการ
            </Badge>
          </HStack>
        </CardHeader>
        <CardBody>
          <Box height={height}>
            {type === "line" ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <Bar data={chartData} options={chartOptions} />
            )}
          </Box>
        </CardBody>
      </Card>

      {data.length > 0 && (
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Text fontSize="md" fontWeight="bold">รายละเอียดยอดขาย</Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="stretch">
              {data.slice(-5).map((item, index) => (
                <HStack key={index} justify="space-between" p={3} bg="gray.50" borderRadius="md">
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="medium">{item.period}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {item.orders} คำสั่งซื้อ
                    </Text>
                  </VStack>
                  <VStack align="end" spacing={0}>
                    <Text fontWeight="bold" color="green.600">
                      {formatCurrency(item.revenue)}
                    </Text>
                    <HStack spacing={1}>
                      <Icon 
                        as={getGrowthIcon(item.growth)} 
                        color={`${getGrowthColor(item.growth)}.500`}
                        boxSize={3}
                      />
                      <Text 
                        fontSize="xs" 
                        color={`${getGrowthColor(item.growth)}.500`}
                      >
                        {Math.abs(item.growth).toFixed(1)}%
                      </Text>
                    </HStack>
                  </VStack>
                </HStack>
              ))}
            </VStack>
          </CardBody>
        </Card>
      )}
    </VStack>
  );
};

export default SalesChart;