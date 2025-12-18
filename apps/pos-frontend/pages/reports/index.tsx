import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Divider,
  useColorModeValue,
  Icon,
  Badge,
  Flex,
  Card,
  CardBody,
  CardHeader,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Avatar,
  AvatarGroup,
  List,
  ListItem,
  ListIcon,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import {
  IoBarChart,
  IoTrendingUp,
  IoTrendingDown,
  IoCalendar,
  IoDownload,
  IoPrint,
  IoMail,
  IoRefresh,
  IoFilter,
  IoSearch,
  IoTime,
  IoCheckmarkCircle,
  IoWarning,
  IoCart,
  IoPeople,
  IoBag,
  IoCash,
  IoCard,
  IoStatsChart,
  IoAnalytics,
  IoPieChart,
  IoArrowForward,
  IoEye,
  IoAlertCircle,
} from "react-icons/io5";
import { POSLayout } from "../../components";
import { formatCurrency } from "../../lib/sales";
// Use dynamic imports for ESM modules
const Bar = dynamic(() => import("react-chartjs-2").then((mod) => mod.Bar), { ssr: false });
const Line = dynamic(() => import("react-chartjs-2").then((mod) => mod.Line), { ssr: false });
const Doughnut = dynamic(() => import("react-chartjs-2").then((mod) => mod.Doughnut), { ssr: false });

import Link from "next/link";
import { registerChartJS } from "../../lib/chartConfig";

// Register Chart.js
registerChartJS();

const ReportsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [selectedReport, setSelectedReport] = useState("sales");

  // Color mode values
  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #2d3748 0%, #1a202c 100%)"
  );
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Mock data
  const salesData = {
    labels: ["จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์", "อาทิตย์"],
    datasets: [
      {
        label: "ยอดขาย (บาท)",
        data: [12000, 19000, 17000, 21000, 25000, 30000, 22000],
        backgroundColor: "rgba(102, 126, 234, 0.8)",
        borderColor: "rgba(102, 126, 234, 1)",
        borderWidth: 2,
        borderRadius: 8,
        barThickness: 36,
      },
    ],
  };

  const customerData = {
    labels: ["ลูกค้าใหม่", "ลูกค้าเก่า", "VIP"],
    datasets: [
      {
        data: [30, 50, 20],
        backgroundColor: [
          "rgba(102, 126, 234, 0.8)",
          "rgba(79, 172, 254, 0.8)",
          "rgba(255, 206, 84, 0.8)",
        ],
        borderWidth: 2,
        borderColor: [
          "rgba(102, 126, 234, 1)",
          "rgba(79, 172, 254, 1)",
          "rgba(255, 206, 84, 1)",
        ],
      },
    ],
  };

  const productData = {
    labels: ["Coca Cola", "น้ำส้ม", "ขนมปัง", "นม", "อื่นๆ"],
    datasets: [
      {
        label: "ยอดขาย (ชิ้น)",
        data: [150, 120, 80, 90, 60],
        backgroundColor: "rgba(255, 108, 67, 0.8)",
        borderColor: "rgba(255, 108, 67, 1)",
        borderWidth: 2,
        borderRadius: 8,
        barThickness: 36,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: { 
        grid: { display: false },
        ticks: { color: "#666" }
      },
      y: { 
        beginAtZero: true, 
        grid: { color: "#e2e8f0" },
        ticks: { color: "#666" }
      },
    },
  };

  const stats = {
    todaySales: 25437.50,
    totalTransactions: 89,
    averageTicket: 285.81,
    profit: 6505.50,
    growth: 12.5,
    customerCount: 156,
    topProduct: "Coca Cola",
    topCategory: "เครื่องดื่ม",
  };

  const recentActivities = [
    {
      id: 1,
      type: "sale",
      message: "ขาย Coca Cola - 330ml",
      time: "2 นาทีที่แล้ว",
      amount: 45.00,
    },
    {
      id: 2,
      type: "customer",
      message: "ลูกค้าใหม่ลงทะเบียน",
      time: "15 นาทีที่แล้ว",
      amount: null,
    },
    {
      id: 3,
      type: "inventory",
      message: "อัพเดทสต็อก Fresh Bread",
      time: "1 ชั่วโมงที่แล้ว",
      amount: null,
    },
  ];

  // Extended mock data for dashboard
  const dashboardData = {
    overview: {
      totalRevenue: 128750,
      totalOrders: 324,
      averageOrderValue: 397.37,
      salesGrowth: 12.5,
      ordersGrowth: 8.3,
      revenueGrowth: 15.2,
    },
    todayStats: {
      customers: 38,
      peakHour: "14:00-15:00",
      topProduct: "กาแฟเย็น",
    },
    alerts: [
      { type: "critical", message: "สินค้าหมดสต็อก 3 รายการ", count: 3 },
      { type: "warning", message: "สินค้าใกล้หมด 8 รายการ", count: 8 },
      { type: "info", message: "รายงานสำเร็จ 1 รายการ", count: 1 },
    ],
  };

  const reportCards = [
    {
      title: "รายงานยอดขาย",
      description: "วิเคราะห์ยอดขายรายวัน รายสัปดาห์ และรายเดือน",
      icon: IoBarChart,
      color: "blue",
      href: "/reports/sales",
      stats: `${formatCurrency(stats.todaySales)} วันนี้`,
    },
    {
      title: "รายงานสินค้าคงคลัง",
      description: "ติดตามสต็อกสินค้า การเคลื่อนไหว และการสั่งซื้อ",
      icon: IoAnalytics,
      color: "green",
      href: "/reports/inventory",
      stats: `${dashboardData.alerts[0].count + dashboardData.alerts[1].count} รายการต้องดูแล`,
    },
    {
      title: "รายงานการเงิน",
      description: "วิเคราะห์รายได้ ค่าใช้จ่าย และกำไรขาดทุน",
      icon: IoCash,
      color: "purple",
      href: "/reports/financial",
      stats: `${formatCurrency(dashboardData.overview.totalRevenue)} รายได้รวม`,
    },
    {
      title: "รายงานลูกค้า",
      description: "วิเคราะห์พฤติกรรมลูกค้าและความพึงพอใจ",
      icon: IoPeople,
      color: "orange",
      href: "/reports/customers",
      stats: `${dashboardData.todayStats.customers} คนวันนี้`,
    },
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critical": return IoAlertCircle;
      case "warning": return IoWarning;
      case "info": return IoCheckmarkCircle;
      default: return IoStatsChart;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "critical": return "red";
      case "warning": return "orange";
      case "info": return "blue";
      default: return "gray";
    }
  };

  return (
    <POSLayout>
      <VStack spacing={8} align="stretch">
        {/* Header with Stats */}
        <Box
          bgGradient={bgGradient}
          borderRadius="2xl"
          p={8}
          color="white"
          position="relative"
          overflow="hidden"
          _before={{
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bg: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Flex justify="space-between" align="center" position="relative" zIndex={1}>
            <VStack align="start" spacing={3}>
              <HStack spacing={3}>
                <Box
                  p={3}
                  borderRadius="xl"
                  bg="rgba(255,255,255,0.2)"
                  color="white"
                >
                  <Icon as={IoStatsChart} boxSize={6} />
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm" fontWeight="medium">
                    รายงานและวิเคราะห์
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    แดชบอร์ดรายงาน
                  </Text>
                </VStack>
              </HStack>

              {/* Breadcrumb */}
              <Breadcrumb color="whiteAlpha.800" fontSize="sm">
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">หน้าแรก</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem isCurrentPage>
                  <BreadcrumbLink>รายงาน</BreadcrumbLink>
                </BreadcrumbItem>
              </Breadcrumb>
            </VStack>
            <HStack spacing={3}>
              <Select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                bg="rgba(255,255,255,0.2)"
                border="none"
                color="white"
                _focus={{ bg: "rgba(255,255,255,0.3)" }}
              >
                <option value="today" style={{ color: "black" }}>วันนี้</option>
                <option value="week" style={{ color: "black" }}>สัปดาห์นี้</option>
                <option value="month" style={{ color: "black" }}>เดือนนี้</option>
                <option value="year" style={{ color: "black" }}>ปีนี้</option>
              </Select>
              <Button
                leftIcon={<Icon as={IoDownload} />}
                variant="solid"
                colorScheme="whiteAlpha"
                onClick={() => {
                  // This would open an export modal or dropdown
                  // For now, we'll just show a toast
                  alert("เลือกประเภทรายงานที่ต้องการส่งออกจากเมนูด้านล่าง");
                }}
              >
                ส่งออก
              </Button>
            </HStack>
          </Flex>
        </Box>

        {/* Quick Stats */}
        <SimpleGrid
          columns={{ base: 1, md: 2, lg: 4 }}
          spacing={6}
          position="relative"
          zIndex={1}
        >
          <Stat>
            <StatLabel color="whiteAlpha.800">ยอดขายวันนี้</StatLabel>
            <StatNumber fontSize="3xl">
              {formatCurrency(stats.todaySales)}
            </StatNumber>
            <StatHelpText color="whiteAlpha.800">
              <StatArrow type="increase" />
              {dashboardData.overview.salesGrowth}%
            </StatHelpText>
          </Stat>

          <Stat>
            <StatLabel color="whiteAlpha.800">คำสั่งซื้อ</StatLabel>
            <StatNumber fontSize="3xl">
              {stats.totalTransactions}
            </StatNumber>
            <StatHelpText color="whiteAlpha.800">
              <StatArrow type="increase" />
              {dashboardData.overview.ordersGrowth}%
            </StatHelpText>
          </Stat>

          <Stat>
            <StatLabel color="whiteAlpha.800">ค่าเฉลี่ยต่อออเดอร์</StatLabel>
            <StatNumber fontSize="3xl">
              {formatCurrency(stats.averageTicket)}
            </StatNumber>
            <StatHelpText color="whiteAlpha.800">
              <StatArrow type="increase" />
              {dashboardData.overview.revenueGrowth}%
            </StatHelpText>
          </Stat>

          <Stat>
            <StatLabel color="whiteAlpha.800">ลูกค้าวันนี้</StatLabel>
            <StatNumber fontSize="3xl">
              {dashboardData.todayStats.customers}
            </StatNumber>
            <StatHelpText color="whiteAlpha.800">
              ช่วงเวลาที่คึกคัก: {dashboardData.todayStats.peakHour}
            </StatHelpText>
          </Stat>
        </SimpleGrid>

        {/* Alerts Section */}
        {dashboardData.alerts.length > 0 && (
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            {dashboardData.alerts.map((alert, index) => (
              <Card
                key={index}
                bg={cardBg}
                borderWidth="1px"
                borderColor={`${getAlertColor(alert.type)}.200`}
                borderLeftWidth="4px"
                borderLeftColor={`${getAlertColor(alert.type)}.500`}
              >
                <CardBody>
                  <HStack spacing={3}>
                    <Icon 
                      as={getAlertIcon(alert.type)} 
                      color={`${getAlertColor(alert.type)}.500`}
                      boxSize={5}
                    />
                    <VStack align="start" spacing={1} flex={1}>
                      <Text fontSize="sm" fontWeight="medium">
                        {alert.message}
                      </Text>
                      <Badge colorScheme={getAlertColor(alert.type)} size="sm">
                        {alert.count} รายการ
                      </Badge>
                    </VStack>
                  </HStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        )}

        {/* Report Categories */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {reportCards.map((report, index) => (
            <Link key={index} href={report.href}>
              <Card
                bg={cardBg}
                borderWidth="1px"
                borderColor={borderColor}
                cursor="pointer"
                transition="all 0.2s"
                _hover={{
                  shadow: "lg",
                  transform: "translateY(-2px)",
                  borderColor: `${report.color}.300`,
                }}
              >
                <CardHeader>
                  <HStack spacing={4}>
                    <Box
                      p={3}
                      borderRadius="xl"
                      bg={`${report.color}.100`}
                      color={`${report.color}.600`}
                    >
                      <Icon as={report.icon} boxSize={6} />
                    </Box>
                    <VStack align="start" spacing={1} flex={1}>
                      <Text fontSize="lg" fontWeight="bold">
                        {report.title}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {report.description}
                      </Text>
                    </VStack>
                    <Icon as={IoArrowForward} color="gray.400" />
                  </HStack>
                </CardHeader>
                <CardBody pt={0}>
                  <Text fontSize="sm" fontWeight="medium" color={`${report.color}.600`}>
                    {report.stats}
                  </Text>
                </CardBody>
              </Card>
            </Link>
          ))}
        </SimpleGrid>

        {/* Reports Tabs */}
        <Box>
          <HStack justify="space-between" mb={6}>
            <Heading size="md" color="gray.700">
              📈 รายงานต่างๆ
            </Heading>
            <HStack spacing={3}>
              <Select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                size="sm"
                w="150px"
              >
                <option value="week">สัปดาห์นี้</option>
                <option value="month">เดือนนี้</option>
                <option value="quarter">ไตรมาส</option>
                <option value="year">ปีนี้</option>
              </Select>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<IoRefresh />}
              >
                รีเฟรช
              </Button>
            </HStack>
          </HStack>

          <Tabs variant="soft-rounded" colorScheme="blue">
            <TabList>
              <Tab>ยอดขาย</Tab>
              <Tab>ลูกค้า</Tab>
              <Tab>สินค้า</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Card bg={cardBg} borderColor={borderColor} shadow="lg">
                  <CardBody>
                    <VStack spacing={4}>
                      <HStack justify="space-between" w="full">
                        <Heading size="md" color="gray.700">
                          กราฟยอดขายรายวัน
                        </Heading>
                        <Badge colorScheme="green" variant="subtle">
                          +{stats.growth}%
                        </Badge>
                      </HStack>
                      <Box h="400px" w="full">
                        <Bar data={salesData} options={chartOptions} />
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>
              
              <TabPanel>
                <Card bg={cardBg} borderColor={borderColor} shadow="lg">
                  <CardBody>
                    <VStack spacing={4}>
                      <HStack justify="space-between" w="full">
                        <Heading size="md" color="gray.700">
                          สัดส่วนลูกค้า
                        </Heading>
                        <Badge colorScheme="blue" variant="subtle">
                          {stats.customerCount} คน
                        </Badge>
                      </HStack>
                      <Box h="400px" w="full">
                        <Doughnut data={customerData} options={chartOptions} />
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>
              
              <TabPanel>
                <Card bg={cardBg} borderColor={borderColor} shadow="lg">
                  <CardBody>
                    <VStack spacing={4}>
                      <HStack justify="space-between" w="full">
                        <Heading size="md" color="gray.700">
                          ยอดขายสินค้าขายดี
                        </Heading>
                        <Badge colorScheme="orange" variant="subtle">
                          {stats.topProduct}
                        </Badge>
                      </HStack>
                      <Box h="400px" w="full">
                        <Bar data={productData} options={chartOptions} />
                      </Box>
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>

        {/* Recent Activity */}
        <Box>
          <Heading size="md" mb={6} color="gray.700">
            📝 กิจกรรมล่าสุด
          </Heading>
          <Card bg={cardBg} borderColor={borderColor} shadow="lg">
            <CardBody>
              <VStack spacing={4} align="stretch">
                {recentActivities.map((activity, index) => (
                  <Box key={activity.id}>
                    <HStack justify="space-between" align="start">
                      <HStack spacing={3} align="start">
                        <Box
                          p={2}
                          borderRadius="md"
                          bg={activity.type === "sale" ? "green.100" : 
                              activity.type === "customer" ? "blue.100" : "purple.100"}
                          color={activity.type === "sale" ? "green.600" : 
                                 activity.type === "customer" ? "blue.600" : "purple.600"}
                        >
                          <Icon 
                            as={activity.type === "sale" ? IoCart : 
                                activity.type === "customer" ? IoPeople : IoBag} 
                            boxSize={4} 
                          />
                        </Box>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm" fontWeight="medium">
                            {activity.message}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {activity.time}
                          </Text>
                        </VStack>
                      </HStack>
                      {activity.amount && (
                        <Text fontSize="sm" fontWeight="bold" color="green.500">
                          ฿{activity.amount}
                        </Text>
                      )}
                    </HStack>
                    {index < recentActivities.length - 1 && <Divider mt={4} />}
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </Box>

        {/* System Status */}
        <Box>
          <Heading size="md" mb={6} color="gray.700">
            🔧 สถานะระบบ
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Alert status="success" borderRadius="lg">
              <AlertIcon />
              <Box>
                <AlertTitle>ระบบรายงานพร้อมใช้งาน!</AlertTitle>
                <AlertDescription>
                  ข้อมูลทั้งหมดอัพเดทล่าสุดเมื่อ 2 นาทีที่แล้ว
                </AlertDescription>
              </Box>
            </Alert>
            <Alert status="info" borderRadius="lg">
              <AlertIcon />
              <Box>
                <AlertTitle>การสำรองข้อมูล</AlertTitle>
                <AlertDescription>
                  สำรองข้อมูลรายงานอัตโนมัติทุกวันเวลา 02:00 น.
                </AlertDescription>
              </Box>
            </Alert>
          </SimpleGrid>
        </Box>
      </VStack>
    </POSLayout>
  );
};

export default ReportsPage;

// Disable static generation for pages that use React Query
export const getServerSideProps = async () => {
  return {
    props: {},
  };
};
