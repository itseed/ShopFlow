import React, { useState } from "react";
import { ReactElement } from "react";
import { NextPageWithLayout } from "../_app";
import Layout from "../../components/Layout";
import { withAuth } from "../../lib/auth";
import {
  Box,
  Grid,
  GridItem,
  Heading,
  Text,
  Card,
  CardBody,
  CardHeader,
  Icon,
  Badge,
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
  useColorModeValue,
  Flex,
  Avatar,
  Progress,
} from "@chakra-ui/react";
import {
  FiBarChart,
  FiTrendingUp,
  FiCalendar,
  FiPackage,
  FiUsers,
  FiDollarSign,
  FiTarget,
  FiPieChart,
  FiArrowRight,
  FiClock,
  FiTrendingDown,
  FiActivity,
} from "react-icons/fi";
import Link from "next/link";

function ReportsPage() {
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [timeRange, setTimeRange] = useState("30days");

  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const reportCategories = [
    {
      title: "รายงานขาย",
      icon: FiTrendingUp,
      color: "blue",
      reports: [
        {
          name: "รายงานขายรายวัน",
          href: "/reports/daily-sales",
          description: "ข้อมูลยอดขายรายวัน",
        },
        {
          name: "รายงานขายรายเดือน",
          href: "/reports/sales",
          description: "สรุปยอดขายรายเดือน",
        },
        {
          name: "เป้าหมายยอดขาย",
          href: "/reports/sales-targets",
          description: "ติดตามเป้าหมาย",
        },
      ],
    },
    {
      title: "รายงานสินค้า",
      icon: FiPackage,
      color: "green",
      reports: [
        {
          name: "รายงานสต็อก",
          href: "/reports/inventory",
          description: "ข้อมูลสินค้าคงคลัง",
        },
        {
          name: "ผลิตภัณฑ์ยอดนิยม",
          href: "/reports/popular-products",
          description: "สินค้าที่ขายดีที่สุด",
        },
        {
          name: "สินค้าเคลื่อนไหวช้า",
          href: "/reports/slow-moving",
          description: "สินค้าที่ขายช้า",
        },
      ],
    },
    {
      title: "รายงานลูกค้า",
      icon: FiUsers,
      color: "purple",
      reports: [
        {
          name: "รายงานลูกค้า",
          href: "/reports/customers",
          description: "ข้อมูลและพฤติกรรมลูกค้า",
        },
        {
          name: "ลูกค้าใหม่",
          href: "/reports/new-customers",
          description: "ลูกค้าใหม่รายเดือน",
        },
        {
          name: "ลูกค้าออกไป",
          href: "/reports/customer-churn",
          description: "ลูกค้าที่เลิกใช้บริการ",
        },
      ],
    },
    {
      title: "รายงานการเงิน",
      icon: FiDollarSign,
      color: "orange",
      reports: [
        {
          name: "กำไรขาดทุน",
          href: "/reports/profit-loss",
          description: "รายงานทางการเงิน",
        },
        {
          name: "รายจ่าย",
          href: "/reports/expenses",
          description: "ค่าใช้จ่ายทั้งหมด",
        },
        {
          name: "รายได้",
          href: "/reports/revenue",
          description: "รายได้ต่างๆ",
        },
      ],
    },
    {
      title: "รายงานสาขา",
      icon: FiPieChart,
      color: "teal",
      reports: [
        {
          name: "เปรียบเทียบสาขา",
          href: "/reports/branch-comparison",
          description: "เปรียบเทียบประสิทธิภาพสาขา",
        },
        {
          name: "ประสิทธิภาพสาขา",
          href: "/reports/branch-performance",
          description: "ประสิทธิภาพแต่ละสาขา",
        },
        {
          name: "ต้นทุนสาขา",
          href: "/reports/branch-costs",
          description: "ต้นทุนการดำเนินการสาขา",
        },
      ],
    },
    {
      title: "รายงานเป้าหมาย",
      icon: FiTarget,
      color: "pink",
      reports: [
        {
          name: "เป้าหมายยอดขาย",
          href: "/reports/sales-targets",
          description: "ติดตามเป้าหมายการขาย",
        },
        {
          name: "ผลงานพนักงาน",
          href: "/reports/employee-targets",
          description: "เป้าหมายของพนักงาน",
        },
        {
          name: "เป้าหมายสาขา",
          href: "/reports/branch-targets",
          description: "เป้าหมายแต่ละสาขา",
        },
      ],
    },
    {
      title: "รายงานการปฏิบัติงาน",
      icon: FiActivity,
      color: "red",
      reports: [
        {
          name: "ประสิทธิภาพพนักงาน",
          href: "/reports/employee-performance",
          description: "ผลงานพนักงาน",
        },
        {
          name: "เวลาทำงาน",
          href: "/reports/work-hours",
          description: "เวลาทำงานพนักงาน",
        },
        {
          name: "การขาย",
          href: "/reports/sales-performance",
          description: "ประสิทธิภาพการขาย",
        },
      ],
    },
  ];

  const quickStats = [
    {
      label: "ยอดขายวันนี้",
      value: "฿45,230",
      change: "+12.5%",
      trend: "increase",
    },
    { label: "คำสั่งซื้อ", value: "124", change: "+8.3%", trend: "increase" },
    { label: "ลูกค้าใหม่", value: "23", change: "-2.1%", trend: "decrease" },
    {
      label: "เป้าหมายเดือน",
      value: "78%",
      change: "+5.2%",
      trend: "increase",
    },
  ];

  const recentReports = [
    { name: "รายงานขายรายวัน", date: "วันนี้", status: "สำเร็จ" },
    { name: "รายงานสต็อก", date: "2 ชั่วโมงที่แล้ว", status: "สำเร็จ" },
    { name: "รายงานลูกค้า", date: "เมื่อวาน", status: "สำเร็จ" },
    { name: "เปรียบเทียบสาขา", date: "วันนี้", status: "กำลังสร้าง" },
  ];

  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={8}>
        <Box>
          <Heading size="2xl" mb={2} fontFamily="heading">
            รายงานทั้งหมด
          </Heading>
          <Text color="gray.600" fontSize="lg">
            ภาพรวมและรายงานที่สำคัญทั้งหมด
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
            width="180px"
            bg="white"
            borderColor="gray.300"
            borderRadius="xl"
          >
            <option value="today">วันนี้</option>
            <option value="7days">7 วัน</option>
            <option value="30days">30 วัน</option>
            <option value="90days">90 วัน</option>
          </Select>
        </HStack>
      </Flex>

      {/* Quick Stats */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        {quickStats.map((stat, index) => (
          <Card
            key={index}
            borderRadius="2xl"
            border="1px"
            borderColor="gray.100"
            shadow="lg"
          >
            <CardBody p={6}>
              <Stat>
                <StatLabel color="gray.500" fontSize="sm" fontWeight="medium">
                  {stat.label}
                </StatLabel>
                <StatNumber fontSize="2xl" fontWeight="bold" color="gray.900">
                  {stat.value}
                </StatNumber>
                <StatHelpText
                  color={stat.trend === "increase" ? "green.500" : "red.500"}
                  fontSize="sm"
                  fontWeight="medium"
                >
                  <StatArrow type={stat.trend as "increase" | "decrease"} />
                  {stat.change}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* Main Content */}
      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
        {/* Report Categories */}
        <GridItem>
          <Card
            borderRadius="2xl"
            border="1px"
            borderColor="gray.100"
            shadow="lg"
          >
            <CardHeader>
              <Heading size="lg" fontFamily="heading">
                หมวดหมู่รายงาน
              </Heading>
              <Text color="gray.600">เลือกรายงานที่ต้องการดู</Text>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {reportCategories.map((category, index) => (
                  <Card
                    key={index}
                    borderRadius="xl"
                    border="1px"
                    borderColor="gray.100"
                    _hover={{ shadow: "md" }}
                  >
                    <CardBody p={6}>
                      <VStack align="stretch" spacing={4}>
                        <HStack spacing={3}>
                          <Box
                            p={3}
                            borderRadius="xl"
                            bg={`${category.color}.50`}
                            color={`${category.color}.600`}
                          >
                            <Icon as={category.icon} boxSize={6} />
                          </Box>
                          <Text
                            fontSize="lg"
                            fontWeight="bold"
                            color="gray.800"
                          >
                            {category.title}
                          </Text>
                        </HStack>
                        <VStack align="stretch" spacing={2}>
                          {category.reports.map((report, idx) => (
                            <Link key={idx} href={report.href}>
                              <Box
                                p={3}
                                borderRadius="md"
                                bg="gray.50"
                                _hover={{
                                  bg: "gray.100",
                                  transform: "translateY(-1px)",
                                }}
                                transition="all 0.2s"
                                cursor="pointer"
                              >
                                <HStack justify="space-between">
                                  <VStack align="start" spacing={1}>
                                    <Text fontSize="sm" fontWeight="medium">
                                      {report.name}
                                    </Text>
                                    <Text fontSize="xs" color="gray.600">
                                      {report.description}
                                    </Text>
                                  </VStack>
                                  <Icon as={FiArrowRight} color="gray.400" />
                                </HStack>
                              </Box>
                            </Link>
                          ))}
                        </VStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            </CardBody>
          </Card>
        </GridItem>

        {/* Sidebar */}
        <GridItem>
          <VStack spacing={6} align="stretch">
            {/* Recent Reports */}
            <Card
              borderRadius="2xl"
              border="1px"
              borderColor="gray.100"
              shadow="lg"
            >
              <CardHeader>
                <Heading size="md" fontFamily="heading">
                  รายงานล่าสุด
                </Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={4} align="stretch">
                  {recentReports.map((report, index) => (
                    <HStack
                      key={index}
                      justify="space-between"
                      p={3}
                      bg="gray.50"
                      borderRadius="md"
                    >
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm" fontWeight="medium">
                          {report.name}
                        </Text>
                        <Text fontSize="xs" color="gray.600">
                          {report.date}
                        </Text>
                      </VStack>
                      <Badge
                        colorScheme={
                          report.status === "สำเร็จ" ? "green" : "yellow"
                        }
                        variant="subtle"
                      >
                        {report.status}
                      </Badge>
                    </HStack>
                  ))}
                </VStack>
              </CardBody>
            </Card>

            {/* Quick Actions */}
            <Card
              borderRadius="2xl"
              border="1px"
              borderColor="gray.100"
              shadow="lg"
            >
              <CardHeader>
                <Heading size="md" fontFamily="heading">
                  การดำเนินการด่วน
                </Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={3} align="stretch">
                  <Button
                    leftIcon={<FiBarChart />}
                    colorScheme="blue"
                    variant="outline"
                    size="sm"
                    justifyContent="flex-start"
                  >
                    สร้างรายงานใหม่
                  </Button>
                  <Button
                    leftIcon={<FiCalendar />}
                    colorScheme="green"
                    variant="outline"
                    size="sm"
                    justifyContent="flex-start"
                  >
                    กำหนดการรายงาน
                  </Button>
                  <Button
                    leftIcon={<FiTarget />}
                    colorScheme="purple"
                    variant="outline"
                    size="sm"
                    justifyContent="flex-start"
                  >
                    ตั้งเป้าหมาย
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </GridItem>
      </Grid>
    </Box>
  );
}

// Use dashboard layout
ReportsPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="รายงานทั้งหมด">{page}</Layout>;
};

// Protected route - requires authentication
export default withAuth(ReportsPage, "staff");
