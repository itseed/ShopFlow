import React from "react";
import { ReactElement } from "react";
import { NextPageWithLayout } from "../_app";
import Layout from "../../components/Layout";
import { withAuth } from "../../lib/auth";
import { useDashboardSummary } from "../../lib/hooks/useCMSReports";
import {
  useProducts,
  useCategories,
  useLowStockProducts,
  useFeaturedProducts,
  useSuppliers,
} from "../../lib/hooks";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Icon,
  Badge,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Spinner,
} from "@chakra-ui/react";
import {
  FiPackage,
  FiGrid,
  FiPlus,
  FiTrendingUp,
  FiTrendingDown,
  FiShoppingCart,
  FiEye,
  FiBarChart,
  FiCheck,
  FiX,
  FiTruck,
  FiStar,
} from "react-icons/fi";
import Link from "next/link";

const CatalogPage: NextPageWithLayout = () => {
  // Real data from API - Only fetch summary data, not full lists
  const { data: dashboardData, isLoading: dashboardLoading } =
    useDashboardSummary();
  
  // Fetch only essential data for stats
  const { data: categoriesData = [], isLoading: categoriesLoading } = useCategories(
    { status: "active" }
  );
  const { data: lowStockProducts = [], isLoading: lowStockLoading } =
    useLowStockProducts();
  
  // Use dashboard data for stats instead of loading full products list
  const totalProducts = dashboardData?.totalProducts || 0;
  const totalCategories = categoriesData.length;
  const totalSuppliers = (dashboardData as { totalSuppliers?: number })?.totalSuppliers || 0;
  const outOfStockProducts = (dashboardData as { outOfStockProducts?: number })?.outOfStockProducts || 0;
  const lowStockCount = lowStockProducts.length;
  const featuredCount = (dashboardData as { featuredProducts?: number })?.featuredProducts || 0;

  const catalogStats = [
    {
      label: "จำนวนสินค้าทั้งหมด",
      value: totalProducts.toLocaleString(),
      change: 12.5, // TODO: Calculate real change based on historical data
      changeType: "increase" as const,
      icon: FiPackage,
      color: "blue",
    },
    {
      label: "จำนวนหมวดหมู่",
      value: totalCategories.toLocaleString(),
      change: 8.3, // TODO: Calculate real change based on historical data
      changeType: "increase" as const,
      icon: FiGrid,
      color: "green",
    },
    {
      label: "ซัพพลายเออร์",
      value: totalSuppliers.toLocaleString(),
      change: 12.1, // TODO: Calculate real change based on historical data
      changeType: "increase" as const,
      icon: FiTruck,
      color: "purple",
    },
    {
      label: "สินค้าแนะนำ",
      value: featuredCount.toLocaleString(),
      change: 5.2, // TODO: Calculate real change based on historical data
      changeType: "increase" as const,
      icon: FiStar,
      color: "yellow",
    },
    {
      label: "สินค้าสต็อกต่ำ",
      value: lowStockCount.toLocaleString(),
      change: 15.2, // TODO: Calculate real change based on historical data
      changeType:
        lowStockCount > 5 ? ("increase" as const) : ("decrease" as const),
      icon: FiTrendingUp,
      color: "orange",
    },
    {
      label: "สินค้าหมด",
      value: outOfStockProducts.toLocaleString(),
      change: outOfStockProducts > 0 ? 5.7 : -5.7,
      changeType:
        outOfStockProducts > 0 ? ("increase" as const) : ("decrease" as const),
      icon: FiTrendingDown,
      color: "red",
    },
  ];

  const loading =
    dashboardLoading ||
    categoriesLoading ||
    lowStockLoading;

  const quickActions = [
    {
      title: "เพิ่มสินค้าใหม่",
      description: "เพิ่มสินค้าเข้าสู่ระบบ",
      icon: FiPlus,
      color: "blue",
      href: "/catalog/products",
    },
    {
      title: "จัดการหมวดหมู่",
      description: "จัดการหมวดหมู่สินค้า",
      icon: FiGrid,
      color: "green",
      href: "/catalog/categories",
    },
    {
      title: "จัดการซัพพลายเออร์",
      description: "จัดการซัพพลายเออร์และคู่ค้า",
      icon: FiTruck,
      color: "purple",
      href: "/catalog/suppliers",
    },
    {
      title: "ดูรายงานสินค้า",
      description: "วิเคราะห์ข้อมูลสินค้า",
      icon: FiBarChart,
      color: "purple",
      href: "/reports/popular-products",
    },
    {
      title: "ตรวจสอบสต็อก",
      description: "ตรวจสอบสินค้าคงคลัง",
      icon: FiEye,
      color: "orange",
      href: "/reports/inventory",
    },
  ];

  return (
    <VStack spacing={8} align="stretch">
      {/* Header */}
      <Box>
        <Heading size="2xl" mb={2} fontFamily="heading">
          จัดการสินค้า
        </Heading>
        <Text color="gray.600" fontSize="lg">
          จัดการสินค้าและหมวดหมู่สินค้าในระบบ
        </Text>
      </Box>

      {/* Loading State */}
      {loading && (
        <Card
          borderRadius="2xl"
          border="1px"
          borderColor="gray.100"
          shadow="lg"
        >
          <CardBody p={6}>
            <VStack spacing={4}>
              <Spinner size="lg" color="blue.500" />
              <Text color="gray.600">กำลังโหลดข้อมูลสินค้า...</Text>
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Stats */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        {catalogStats.map((stat, index) => (
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
                      {stat.value}
                    </StatNumber>
                    <StatHelpText fontSize="sm" fontWeight="medium">
                      <StatArrow type={stat.changeType} />
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

      {/* Quick Actions */}
      <Card borderRadius="2xl" border="1px" borderColor="gray.100" shadow="lg">
        <CardHeader>
          <Heading size="md" fontFamily="heading">
            การดำเนินการด่วน
          </Heading>
          <Text fontSize="sm" color="gray.600">
            เข้าถึงฟังก์ชันที่ใช้บ่อยได้อย่างรวดเร็ว
          </Text>
        </CardHeader>
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card
                  borderRadius="xl"
                  border="1px"
                  borderColor="gray.100"
                  shadow="sm"
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{
                    transform: "translateY(-2px)",
                    shadow: "md",
                    borderColor: `${action.color}.200`,
                  }}
                >
                  <CardBody p={6}>
                    <VStack spacing={4}>
                      <Box
                        p={4}
                        borderRadius="xl"
                        bg={`${action.color}.50`}
                        color={`${action.color}.600`}
                      >
                        <Icon as={action.icon} boxSize={8} />
                      </Box>
                      <VStack spacing={2}>
                        <Text
                          fontWeight="bold"
                          fontSize="lg"
                          textAlign="center"
                        >
                          {action.title}
                        </Text>
                        <Text fontSize="sm" color="gray.600" textAlign="center">
                          {action.description}
                        </Text>
                      </VStack>
                    </VStack>
                  </CardBody>
                </Card>
              </Link>
            ))}
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Recent Activity */}
      <Card borderRadius="2xl" border="1px" borderColor="gray.100" shadow="lg">
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Box>
              <Heading size="md" fontFamily="heading">
                สถานะสินค้า
              </Heading>
              <Text fontSize="sm" color="gray.600">
                รายการสินค้าที่ต้องการความสนใจ
              </Text>
            </Box>
            <Button size="sm" variant="outline" colorScheme="blue">
              จัดการสต็อก
            </Button>
          </Flex>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            {/* Show real products with low stock if available */}
            {lowStockProducts.length > 0 ? (
              lowStockProducts.slice(0, 3).map((product, index) => (
                <HStack
                  key={index}
                  justify="space-between"
                  p={4}
                  bg="orange.50"
                  borderRadius="lg"
                  border="1px"
                  borderColor="orange.200"
                >
                  <HStack spacing={3}>
                    <Box
                      p={2}
                      bg="orange.100"
                      borderRadius="md"
                      color="orange.600"
                    >
                      <Icon as={FiTrendingDown} />
                    </Box>
                    <Box>
                      <Text fontWeight="medium">
                        สินค้า "{product.name}" สต็อกต่ำ
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        เหลือ {product.stock} ชิ้น (ขั้นต่ำ {product.min_stock}{" "}
                        ชิ้น)
                      </Text>
                    </Box>
                  </HStack>
                  <Badge colorScheme="orange" variant="subtle">
                    สต็อกต่ำ
                  </Badge>
                </HStack>
              ))
            ) : (
              <VStack spacing={4} py={8}>
                <Icon as={FiCheck} boxSize={8} color="green.500" />
                <Text color="gray.600" textAlign="center">
                  ไม่มีสินค้าสต็อกต่ำในขณะนี้
                </Text>
              </VStack>
            )}

            {/* Show out of stock products if any */}
            {outOfStockProducts > 0 && (
              <HStack
                justify="space-between"
                p={4}
                bg="red.50"
                borderRadius="lg"
                border="1px"
                borderColor="red.200"
              >
                <HStack spacing={3}>
                  <Box p={2} bg="red.100" borderRadius="md" color="red.600">
                    <Icon as={FiX} />
                  </Box>
                  <Box>
                    <Text fontWeight="medium">
                      มีสินค้าหมด {outOfStockProducts} รายการ
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      ต้องการเติมสต็อกด่วน
                    </Text>
                  </Box>
                </HStack>
                <Badge colorScheme="red" variant="subtle">
                  หมดสต็อก
                </Badge>
              </HStack>
            )}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

// Use layout
CatalogPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="จัดการสินค้า">{page}</Layout>;
};

export default withAuth(CatalogPage, "staff");
