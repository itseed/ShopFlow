import React, { useState, useEffect } from "react";
import {
  VStack,
  Heading,
  Text,
  HStack,
  Box,
  SimpleGrid,
  Flex,
  Badge,
  Avatar,
  Divider,
  useColorModeValue,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import {
  IoCart,
  IoBag,
  IoLayers,
  IoBarChart,
  IoPeople,
  IoSettings,
  IoDocumentText,
  IoSpeedometer,
  IoTime,
  IoCheckmarkCircle,
  IoWarning,
  IoTrendingUp,
  IoTrendingDown,
  IoRefresh,
  IoLogOut,
  IoNotifications,
} from "react-icons/io5";
import { POSLayout, TouchButton, POSCard, LoadingSpinner } from "../components";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/router";

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const { session, logout, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && (!session || !session.isAuthenticated)) {
      router.push("/login");
    }
  }, [session, isLoading, router]);

  const handleQuickAction = (action: string) => {
    setLoading(true);
    console.log(`Quick action: ${action}`);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <LoadingSpinner fullScreen size="xl" message="Loading POS system..." />
    );
  }

  if (!session) {
    return (
      <LoadingSpinner fullScreen size="xl" message="Redirecting to login..." />
    );
  }

  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #2d3748 0%, #1a202c 100%)"
  );
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Mock data for stats
  const stats = {
    todaySales: 2543.75,
    transactions: 47,
    lowStockItems: 12,
    totalProducts: 156,
    salesGrowth: 15.2,
    customerGrowth: 8.5,
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
      type: "inventory",
      message: "อัพเดทสต็อก Fresh Bread",
      time: "15 นาทีที่แล้ว",
      amount: null,
    },
    {
      id: 3,
      type: "customer",
      message: "ลูกค้าใหม่ลงทะเบียน",
      time: "1 ชั่วโมงที่แล้ว",
      amount: null,
    },
  ];

  const quickActions = [
    {
      id: "sales",
      title: "ขายสินค้า",
      description: "เริ่มต้นการขายและจัดการธุรกรรม",
      icon: IoCart,
      color: "blue",
      path: "/sales",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      id: "products",
      title: "จัดการสินค้า",
      description: "จัดการรายการสินค้าและราคา",
      icon: IoBag,
      color: "teal",
      path: "/products",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    {
      id: "inventory",
      title: "สต็อกสินค้า",
      description: "ดูและจัดการสต็อกสินค้า",
      icon: IoLayers,
      color: "purple",
      path: "/inventory",
      gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    },
    {
      id: "reports",
      title: "รายงาน",
      description: "ดูรายงานยอดขายและวิเคราะห์",
      icon: IoBarChart,
      color: "orange",
      path: "/reports",
      gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
    },
    {
      id: "customers",
      title: "ลูกค้า",
      description: "จัดการข้อมูลลูกค้าและประวัติการซื้อ",
      icon: IoPeople,
      color: "pink",
      path: "/customers",
      gradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    },
    {
      id: "orders",
      title: "ออเดอร์",
      description: "ดูและจัดการออเดอร์ทั้งหมด",
      icon: IoDocumentText,
      color: "cyan",
      path: "/orders",
      gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    },
    {
      id: "settings",
      title: "ตั้งค่า",
      description: "ตั้งค่าระบบและความชอบ",
      icon: IoSettings,
      color: "gray",
      path: "/settings",
      gradient: "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)",
    },
  ];

  return (
    <POSLayout>
      <VStack spacing={8} align="stretch">
        {/* Hero Section */}
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
                <Avatar size="lg" name={session.user.firstName} bg="whiteAlpha.200" />
                <VStack align="start" spacing={1}>
                  <Heading size="lg" fontWeight="bold">
                    สวัสดี, {session.user.firstName}! 👋
                  </Heading>
                  <Text fontSize="lg" opacity={0.9}>
                    {session.branch.name} • {new Date().toLocaleDateString('th-TH', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </Text>
                </VStack>
              </HStack>
              <HStack spacing={4}>
                <Badge colorScheme="green" variant="solid" px={3} py={1}>
                  <HStack spacing={1}>
                    <Icon as={IoCheckmarkCircle} />
                    <Text>ระบบพร้อมใช้งาน</Text>
                  </HStack>
                </Badge>
                <Badge colorScheme="blue" variant="solid" px={3} py={1}>
                  <HStack spacing={1}>
                    <Icon as={IoTime} />
                    <Text>ออนไลน์</Text>
                  </HStack>
                </Badge>
              </HStack>
            </VStack>
            <VStack spacing={3}>
              <TouchButton
                variant="secondary"
                size="lg"
                onClick={handleLogout}
                isLoading={loading}
                leftIcon={<IoLogOut />}
                bg="whiteAlpha.200"
                _hover={{ bg: "whiteAlpha.300" }}
                color="white"
              >
                ออกจากระบบ
              </TouchButton>
              <HStack spacing={2}>
                <Icon as={IoNotifications} color="yellow.300" />
                <Text fontSize="sm" opacity={0.9}>3 การแจ้งเตือนใหม่</Text>
              </HStack>
            </VStack>
          </Flex>
        </Box>

        {/* Quick Stats */}
        <Box>
          <HStack justify="space-between" mb={6}>
            <Heading size="md" color="gray.700">
              📊 สถิติวันนี้
            </Heading>
                         <TouchButton
               variant="secondary"
               size="sm"
               leftIcon={<IoRefresh />}
               onClick={() => handleQuickAction("refresh")}
             >
               รีเฟรช
             </TouchButton>
          </HStack>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
            <POSCard variant="elevated" bg={cardBg} borderColor={borderColor}>
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
                  <Text fontSize="sm" color="green.500">+{stats.salesGrowth}%</Text>
                </HStack>
                <Progress value={75} colorScheme="green" size="sm" w="full" />
              </VStack>
            </POSCard>

            <POSCard variant="elevated" bg={cardBg} borderColor={borderColor}>
              <VStack spacing={3}>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="gray.500">ธุรกรรม</Text>
                  <Icon as={IoCart} color="blue.500" />
                </HStack>
                <Text fontSize="3xl" fontWeight="bold" color="blue.500">
                  {stats.transactions}
                </Text>
                <Text fontSize="sm" color="gray.500">รายการวันนี้</Text>
                <Progress value={60} colorScheme="blue" size="sm" w="full" />
              </VStack>
            </POSCard>

            <POSCard variant="elevated" bg={cardBg} borderColor={borderColor}>
              <VStack spacing={3}>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="gray.500">สินค้าใกล้หมด</Text>
                  <Icon as={IoWarning} color="orange.500" />
                </HStack>
                <Text fontSize="3xl" fontWeight="bold" color="orange.500">
                  {stats.lowStockItems}
                </Text>
                <Text fontSize="sm" color="gray.500">รายการ</Text>
                <Progress value={40} colorScheme="orange" size="sm" w="full" />
              </VStack>
            </POSCard>

            <POSCard variant="elevated" bg={cardBg} borderColor={borderColor}>
              <VStack spacing={3}>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="gray.500">สินค้าทั้งหมด</Text>
                  <Icon as={IoBag} color="purple.500" />
                </HStack>
                <Text fontSize="3xl" fontWeight="bold" color="purple.500">
                  {stats.totalProducts}
                </Text>
                <Text fontSize="sm" color="gray.500">รายการ</Text>
                <Progress value={85} colorScheme="purple" size="sm" w="full" />
              </VStack>
            </POSCard>
          </SimpleGrid>
        </Box>

        {/* Quick Actions */}
        <Box>
          <Heading size="md" mb={6} color="gray.700">
            ⚡ การดำเนินการด่วน
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {quickActions.map((action) => (
              <POSCard
                key={action.id}
                variant="elevated"
                interactive
                bg={cardBg}
                borderColor={borderColor}
                _hover={{
                  transform: "translateY(-4px)",
                  boxShadow: "xl",
                }}
                transition="all 0.3s ease"
              >
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Box
                      p={3}
                      borderRadius="xl"
                      bgGradient={action.gradient}
                      color="white"
                    >
                      <Icon as={action.icon} boxSize={6} />
                    </Box>
                    <Badge colorScheme={action.color} variant="subtle">
                      {action.color}
                    </Badge>
                  </HStack>
                  <VStack spacing={2} align="start">
                    <Heading size="md" color="gray.700">
                      {action.title}
                    </Heading>
                    <Text fontSize="sm" color="gray.500" noOfLines={2}>
                      {action.description}
                    </Text>
                  </VStack>
                  <TouchButton
                    variant="primary"
                    size="lg"
                    width="full"
                    onClick={() => router.push(action.path)}
                    bgGradient={action.gradient}
                    _hover={{
                      transform: "translateY(-1px)",
                      boxShadow: "lg",
                    }}
                    color="white"
                  >
                    เริ่มต้น
                  </TouchButton>
                </VStack>
              </POSCard>
            ))}
          </SimpleGrid>
        </Box>

        {/* Recent Activity */}
        <Box>
          <Heading size="md" mb={6} color="gray.700">
            📝 กิจกรรมล่าสุด
          </Heading>
          <POSCard variant="elevated" bg={cardBg} borderColor={borderColor}>
            <VStack spacing={4} align="stretch">
              {recentActivities.map((activity, index) => (
                <Box key={activity.id}>
                  <HStack justify="space-between" align="start">
                    <HStack spacing={3} align="start">
                      <Box
                        p={2}
                        borderRadius="md"
                        bg={activity.type === "sale" ? "green.100" : 
                            activity.type === "inventory" ? "blue.100" : "purple.100"}
                        color={activity.type === "sale" ? "green.600" : 
                               activity.type === "inventory" ? "blue.600" : "purple.600"}
                      >
                        <Icon 
                          as={activity.type === "sale" ? IoCart : 
                              activity.type === "inventory" ? IoLayers : IoPeople} 
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
          </POSCard>
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
                <AlertTitle>ระบบพร้อมใช้งาน!</AlertTitle>
                <AlertDescription>
                  POS system ทำงานปกติ ทุกฟีเจอร์พร้อมใช้งาน
                </AlertDescription>
              </Box>
            </Alert>
            <Alert status="info" borderRadius="lg">
              <AlertIcon />
              <Box>
                <AlertTitle>การสำรองข้อมูล</AlertTitle>
                <AlertDescription>
                  สำรองข้อมูลอัตโนมัติครั้งล่าสุดเมื่อ 2 ชั่วโมงที่แล้ว
                </AlertDescription>
              </Box>
            </Alert>
          </SimpleGrid>
        </Box>
      </VStack>
    </POSLayout>
  );
}
