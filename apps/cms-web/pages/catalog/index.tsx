import React from "react";
import { ReactElement } from "react";
import { NextPageWithLayout } from "../_app";
import Layout from "../../components/Layout";
import { withAuth } from "../../lib/auth";
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
} from "react-icons/fi";
import Link from "next/link";

const CatalogPage: NextPageWithLayout = () => {
  // Mock data - in real app, fetch from API
  const catalogStats = [
    {
      label: "จำนวนสินค้าทั้งหมด",
      value: "1,234",
      change: 12.5,
      changeType: "increase" as const,
      icon: FiPackage,
      color: "blue",
    },
    {
      label: "จำนวนหมวดหมู่",
      value: "45",
      change: 8.3,
      changeType: "increase" as const,
      icon: FiGrid,
      color: "green",
    },
    {
      label: "สินค้าขายดี",
      value: "89",
      change: 15.2,
      changeType: "increase" as const,
      icon: FiTrendingUp,
      color: "purple",
    },
    {
      label: "สินค้าหมด",
      value: "12",
      change: -5.7,
      changeType: "decrease" as const,
      icon: FiTrendingDown,
      color: "red",
    },
  ];

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
                กิจกรรมล่าสุด
              </Heading>
              <Text fontSize="sm" color="gray.600">
                การเปลี่ยนแปลงสินค้าล่าสุด
              </Text>
            </Box>
            <Button size="sm" variant="outline" colorScheme="blue">
              ดูทั้งหมด
            </Button>
          </Flex>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <HStack
              justify="space-between"
              p={4}
              bg="gray.50"
              borderRadius="lg"
            >
              <HStack spacing={3}>
                <Box p={2} bg="green.100" borderRadius="md" color="green.600">
                  <Icon as={FiPlus} />
                </Box>
                <Box>
                  <Text fontWeight="medium">เพิ่มสินค้า "กาแฟลาเต้" ใหม่</Text>
                  <Text fontSize="sm" color="gray.600">
                    5 นาทีที่ผ่านมา
                  </Text>
                </Box>
              </HStack>
              <Badge colorScheme="green" variant="subtle">
                เพิ่มใหม่
              </Badge>
            </HStack>

            <HStack
              justify="space-between"
              p={4}
              bg="gray.50"
              borderRadius="lg"
            >
              <HStack spacing={3}>
                <Box p={2} bg="blue.100" borderRadius="md" color="blue.600">
                  <Icon as={FiPackage} />
                </Box>
                <Box>
                  <Text fontWeight="medium">อัปเดตสต็อก "ขนมปังโฮลวีท"</Text>
                  <Text fontSize="sm" color="gray.600">
                    15 นาทีที่ผ่านมา
                  </Text>
                </Box>
              </HStack>
              <Badge colorScheme="blue" variant="subtle">
                อัปเดต
              </Badge>
            </HStack>

            <HStack
              justify="space-between"
              p={4}
              bg="gray.50"
              borderRadius="lg"
            >
              <HStack spacing={3}>
                <Box p={2} bg="purple.100" borderRadius="md" color="purple.600">
                  <Icon as={FiGrid} />
                </Box>
                <Box>
                  <Text fontWeight="medium">เพิ่มหมวดหมู่ "ขนมหวาน"</Text>
                  <Text fontSize="sm" color="gray.600">
                    1 ชั่วโมงที่ผ่านมา
                  </Text>
                </Box>
              </HStack>
              <Badge colorScheme="purple" variant="subtle">
                เพิ่มใหม่
              </Badge>
            </HStack>
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
