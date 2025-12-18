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
  Badge,
  SimpleGrid,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import {
  IoWarning,
  IoCheckmarkCircle,
  IoAlertCircle,
  IoLayers,
  IoPieChart,
  IoBarChart,
} from "react-icons/io5";
import dynamic from "next/dynamic";
// Use dynamic imports for ESM modules
const Doughnut = dynamic(() => import("react-chartjs-2").then((mod) => mod.Doughnut), { ssr: false });
const Bar = dynamic(() => import("react-chartjs-2").then((mod) => mod.Bar), { ssr: false });

import { formatCurrency } from "../../lib/sales";
import { registerChartJS } from "../../lib/chartConfig";

// Register Chart.js
registerChartJS();

interface StockLevel {
  level: string;
  count: number;
  percentage: number;
  color: string;
}

interface CategoryData {
  category: string;
  items: number;
  value: number;
  stockLevel: "healthy" | "low" | "critical" | "out";
}

interface InventoryChartProps {
  stockLevels: StockLevel[];
  categories: CategoryData[];
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  criticalItems: number;
  outOfStockItems: number;
  type?: "overview" | "detailed";
  height?: string;
}

export const InventoryChart: React.FC<InventoryChartProps> = ({
  stockLevels,
  categories,
  totalItems,
  totalValue,
  lowStockItems,
  criticalItems,
  outOfStockItems,
  type = "overview",
  height = "300px",
}) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const stockLevelChart = useMemo(() => ({
    labels: stockLevels.map(s => s.level),
    datasets: [
      {
        data: stockLevels.map(s => s.count),
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",
          "rgba(251, 146, 60, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(156, 163, 175, 0.8)",
        ],
        borderWidth: 2,
        borderColor: [
          "rgb(34, 197, 94)",
          "rgb(251, 146, 60)",
          "rgb(239, 68, 68)",
          "rgb(156, 163, 175)",
        ],
      },
    ],
  }), [stockLevels]);

  const categoryChart = useMemo(() => ({
    labels: categories.map(c => c.category),
    datasets: [
      {
        label: "มูลค่าสต็อก",
        data: categories.map(c => c.value),
        backgroundColor: [
          "rgba(102, 126, 234, 0.8)",
          "rgba(255, 99, 132, 0.8)",
          "rgba(255, 206, 86, 0.8)",
          "rgba(75, 192, 192, 0.8)",
          "rgba(153, 102, 255, 0.8)",
        ],
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  }), [categories]);

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

  const barOptions = {
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

  const getStockIcon = (level: string) => {
    switch (level) {
      case "สต็อกปกติ": return IoCheckmarkCircle;
      case "สต็อกต่ำ": return IoWarning;
      case "สต็อกวิกฤต": return IoAlertCircle;
      case "หมดสต็อก": return IoAlertCircle;
      default: return IoLayers;
    }
  };

  const getStockColor = (level: string) => {
    switch (level) {
      case "สต็อกปกติ": return "green";
      case "สต็อกต่ำ": return "orange";
      case "สต็อกวิกฤต": return "red";
      case "หมดสต็อก": return "gray";
      default: return "gray";
    }
  };

  const getCategoryStockColor = (level: "healthy" | "low" | "critical" | "out") => {
    switch (level) {
      case "healthy": return "green";
      case "low": return "orange";
      case "critical": return "red";
      case "out": return "gray";
      default: return "gray";
    }
  };

  const alertsCount = lowStockItems + criticalItems + outOfStockItems;

  return (
    <VStack spacing={6} align="stretch">
      {/* Alert Status */}
      {alertsCount > 0 && (
        <Alert 
          status={outOfStockItems > 0 ? "error" : criticalItems > 0 ? "warning" : "info"} 
          borderRadius="lg"
        >
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>สินค้าต้องการความสนใจ!</AlertTitle>
            <AlertDescription>
              หมดสต็อก {outOfStockItems} รายการ, วิกฤต {criticalItems} รายการ, ต่ำ {lowStockItems} รายการ
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {/* Stock Level Overview */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <HStack spacing={3}>
              <Icon as={IoPieChart} boxSize={5} color="blue.500" />
              <Text fontSize="lg" fontWeight="bold">สถานะสต็อกสินค้า</Text>
            </HStack>
          </CardHeader>
          <CardBody>
            <Box height={height}>
              <Doughnut data={stockLevelChart} options={doughnutOptions} />
            </Box>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <HStack spacing={3}>
              <Icon as={IoBarChart} boxSize={5} color="green.500" />
              <Text fontSize="lg" fontWeight="bold">มูลค่าตามหมวดหมู่</Text>
            </HStack>
          </CardHeader>
          <CardBody>
            <Box height={height}>
              <Bar data={categoryChart} options={barOptions} />
            </Box>
          </CardBody>
        </Card>
      </SimpleGrid>

      {type === "detailed" && (
        <>
          {/* Stock Level Details */}
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardHeader>
              <Text fontSize="lg" fontWeight="bold">รายละเอียดระดับสต็อก</Text>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
                {stockLevels.map((level, index) => (
                  <VStack key={index} spacing={3} p={4} bg="gray.50" borderRadius="lg">
                    <Icon
                      as={getStockIcon(level.level)}
                      color={`${getStockColor(level.level)}.500`}
                      boxSize={8}
                    />
                    <Text fontSize="sm" color="gray.600" textAlign="center">
                      {level.level}
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color={`${getStockColor(level.level)}.600`}>
                      {level.count}
                    </Text>
                    <Progress
                      value={level.percentage}
                      colorScheme={getStockColor(level.level)}
                      size="sm"
                      w="full"
                      borderRadius="full"
                    />
                    <Text fontSize="xs" color="gray.500">
                      {level.percentage.toFixed(1)}%
                    </Text>
                  </VStack>
                ))}
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Category Details */}
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardHeader>
              <Text fontSize="lg" fontWeight="bold">รายละเอียดหมวดหมู่</Text>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {categories.map((category, index) => (
                  <HStack key={index} justify="space-between" p={4} bg="gray.50" borderRadius="md">
                    <VStack align="start" spacing={1}>
                      <HStack spacing={2}>
                        <Text fontWeight="medium">{category.category}</Text>
                        <Badge 
                          colorScheme={getCategoryStockColor(category.stockLevel)} 
                          size="sm"
                        >
                          {category.stockLevel === "healthy" ? "ปกติ" :
                           category.stockLevel === "low" ? "ต่ำ" :
                           category.stockLevel === "critical" ? "วิกฤต" : "หมด"}
                        </Badge>
                      </HStack>
                      <Text fontSize="sm" color="gray.500">
                        {category.items} รายการ
                      </Text>
                    </VStack>
                    <VStack align="end" spacing={1}>
                      <Text fontWeight="bold" color="green.600">
                        {formatCurrency(category.value)}
                      </Text>
                      <Progress
                        value={(category.value / totalValue) * 100}
                        colorScheme="blue"
                        size="sm"
                        w="100px"
                        borderRadius="full"
                      />
                    </VStack>
                  </HStack>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </>
      )}

      {/* Summary Stats */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} textAlign="center">
          <CardBody>
            <VStack spacing={2}>
              <Icon as={IoLayers} boxSize={8} color="blue.500" />
              <Text fontSize="2xl" fontWeight="bold">{totalItems.toLocaleString()}</Text>
              <Text fontSize="sm" color="gray.500">สินค้าทั้งหมด</Text>
            </VStack>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} textAlign="center">
          <CardBody>
            <VStack spacing={2}>
              <Icon as={IoCheckmarkCircle} boxSize={8} color="green.500" />
              <Text fontSize="2xl" fontWeight="bold" color="green.600">
                {formatCurrency(totalValue)}
              </Text>
              <Text fontSize="sm" color="gray.500">มูลค่าสต็อกรวม</Text>
            </VStack>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} textAlign="center">
          <CardBody>
            <VStack spacing={2}>
              <Icon 
                as={alertsCount > 0 ? IoWarning : IoCheckmarkCircle} 
                boxSize={8} 
                color={alertsCount > 0 ? "orange.500" : "green.500"} 
              />
              <Text 
                fontSize="2xl" 
                fontWeight="bold" 
                color={alertsCount > 0 ? "orange.600" : "green.600"}
              >
                {alertsCount}
              </Text>
              <Text fontSize="sm" color="gray.500">รายการต้องดูแล</Text>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>
    </VStack>
  );
};

export default InventoryChart;