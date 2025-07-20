import React, { useState } from "react";
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
  Divider,
  useColorModeValue,
  Icon,
  Badge,
  Flex,
  Card,
  CardBody,
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
} from "react-icons/io5";
import { POSLayout } from "../../components";
import { Bar, Line, Doughnut } from "react-chartjs-2";
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
                  <Icon as={IoBarChart} boxSize={6} />
                </Box>
                <VStack align="start" spacing={1}>
                  <Heading size="lg" fontWeight="bold">
                    📊 รายงานและวิเคราะห์
                  </Heading>
                  <Text fontSize="lg" opacity={0.9}>
                    ข้อมูลยอดขายและสถิติการทำงาน
                  </Text>
                </VStack>
              </HStack>
              <HStack spacing={4}>
                <Badge colorScheme="green" variant="solid" px={3} py={1}>
                  <HStack spacing={1}>
                    <Icon as={IoTrendingUp} />
                    <Text>+{stats.growth}% จากเมื่อวาน</Text>
                  </HStack>
                </Badge>
                <Badge colorScheme="blue" variant="solid" px={3} py={1}>
                  <HStack spacing={1}>
                    <Icon as={IoTime} />
                    <Text>อัพเดทล่าสุด: 2 นาทีที่แล้ว</Text>
                  </HStack>
                </Badge>
              </HStack>
            </VStack>
            <VStack spacing={3}>
              <HStack spacing={2}>
                <Button
                  variant="secondary"
                  size="lg"
                  leftIcon={<IoDownload />}
                  bg="rgba(255,255,255,0.2)"
                  _hover={{ bg: "rgba(255,255,255,0.3)" }}
                  color="white"
                >
                  Export
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  leftIcon={<IoPrint />}
                  bg="rgba(255,255,255,0.2)"
                  _hover={{ bg: "rgba(255,255,255,0.3)" }}
                  color="white"
                >
                  Print
                </Button>
              </HStack>
            </VStack>
          </Flex>
        </Box>

        {/* Quick Stats */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
          <Card bg={cardBg} borderColor={borderColor} shadow="lg">
            <CardBody>
              <VStack spacing={3}>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="gray.500">ยอดขายวันนี้</Text>
                  <Icon as={IoTrendingUp} color="green.500" />
                </HStack>
                <Text fontSize="3xl" fontWeight="bold" color="green.500">
                  ฿{stats.todaySales.toLocaleString()}
                </Text>
                <HStack spacing={1}>
                  <Icon as={IoTrendingUp} color="green.500" size="sm" />
                  <Text fontSize="sm" color="green.500">+{stats.growth}%</Text>
                </HStack>
                <Progress value={75} colorScheme="green" size="sm" w="full" />
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor} shadow="lg">
            <CardBody>
              <VStack spacing={3}>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="gray.500">ธุรกรรม</Text>
                  <Icon as={IoCart} color="blue.500" />
                </HStack>
                <Text fontSize="3xl" fontWeight="bold" color="blue.500">
                  {stats.totalTransactions}
                </Text>
                <Text fontSize="sm" color="gray.500">รายการวันนี้</Text>
                <Progress value={60} colorScheme="blue" size="sm" w="full" />
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor} shadow="lg">
            <CardBody>
              <VStack spacing={3}>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="gray.500">เฉลี่ย/รายการ</Text>
                  <Icon as={IoCash} color="purple.500" />
                </HStack>
                <Text fontSize="3xl" fontWeight="bold" color="purple.500">
                  ฿{stats.averageTicket}
                </Text>
                <Text fontSize="sm" color="gray.500">บาท</Text>
                <Progress value={85} colorScheme="purple" size="sm" w="full" />
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor} shadow="lg">
            <CardBody>
              <VStack spacing={3}>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="gray.500">กำไร</Text>
                  <Icon as={IoCheckmarkCircle} color="orange.500" />
                </HStack>
                <Text fontSize="3xl" fontWeight="bold" color="orange.500">
                  ฿{stats.profit.toLocaleString()}
                </Text>
                <Text fontSize="sm" color="gray.500">บาท</Text>
                <Progress value={70} colorScheme="orange" size="sm" w="full" />
              </VStack>
            </CardBody>
          </Card>
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
