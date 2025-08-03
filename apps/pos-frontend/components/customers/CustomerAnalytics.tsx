import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  useColorModeValue,
  Icon,
  Badge,
  Divider,
  Flex,
  Center,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import {
  IoTrendingUpOutline,
  IoTrendingDownOutline,
  IoPersonOutline,
  IoCardOutline,
  IoCashOutline,
  IoStatsChartOutline,
  IoStarOutline,
  IoTimeOutline,
  IoCalendarOutline,
  IoBarChartOutline,
} from "react-icons/io5";
import { formatCurrency } from "../../lib/sales";

interface CustomerAnalytics {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  membersCount: number;
  nonMembersCount: number;
  totalRevenue: number;
  averageSpending: number;
  membershipPercentage: number;
  genderStats: Record<string, number>;
  ageStats: Record<string, number>;
  membershipStats: Record<string, number>;
  monthlyGrowth?: {
    newCustomers: number;
    growthRate: number;
  };
  topSpenders?: Array<{
    customerId: string;
    customerName: string;
    totalSpent: number;
    ordersCount: number;
  }>;
}

interface CustomerAnalyticsProps {
  analytics: CustomerAnalytics;
  isLoading?: boolean;
  period?: string;
  onPeriodChange?: (period: string) => void;
}

const CustomerAnalyticsComponent: React.FC<CustomerAnalyticsProps> = ({
  analytics,
  isLoading = false,
  period = "month",
}) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const statBg = useColorModeValue("gray.50", "gray.700");

  if (isLoading) {
    return (
      <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
        <CardBody>
          <Center py={10}>
            <Text>กำลังโหลดข้อมูลการวิเคราะห์...</Text>
          </Center>
        </CardBody>
      </Card>
    );
  }

  const getGenderText = (gender: string) => {
    switch (gender) {
      case "male":
        return "ชาย";
      case "female":
        return "หญิง";
      case "other":
        return "อื่นๆ";
      default:
        return "ไม่ระบุ";
    }
  };

  const getAgeGroupText = (group: string) => {
    switch (group) {
      case "under18":
        return "ต่ำกว่า 18";
      case "age18to29":
        return "18-29";
      case "age30to49":
        return "30-49";
      case "age50to64":
        return "50-64";
      case "age65plus":
        return "65+";
      default:
        return "ไม่ระบุ";
    }
  };

  const getTotalGenderCount = () =>
    Object.values(analytics.genderStats).reduce((sum, count) => sum + count, 0);
  
  const getTotalAgeCount = () =>
    Object.values(analytics.ageStats).reduce((sum, count) => sum + count, 0);

  const getTotalMembershipCount = () =>
    Object.values(analytics.membershipStats).reduce((sum, count) => sum + count, 0);

  return (
    <VStack spacing={6} align="stretch">
      {/* Main Statistics */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <HStack spacing={3}>
                <Box p={2} borderRadius="lg" bg="blue.100" color="blue.600">
                  <Icon as={IoPersonOutline} boxSize={5} />
                </Box>
                <VStack align="start" spacing={0}>
                  <StatLabel fontSize="sm">ลูกค้าทั้งหมด</StatLabel>
                  <StatNumber fontSize="2xl">
                    {analytics.totalCustomers.toLocaleString()}
                  </StatNumber>
                  <StatHelpText fontSize="xs">
                    ใช้งาน: {analytics.activeCustomers} คน
                  </StatHelpText>
                </VStack>
              </HStack>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <HStack spacing={3}>
                <Box p={2} borderRadius="lg" bg="green.100" color="green.600">
                  <Icon as={IoCashOutline} boxSize={5} />
                </Box>
                <VStack align="start" spacing={0}>
                  <StatLabel fontSize="sm">ยอดขายรวม</StatLabel>
                  <StatNumber fontSize="2xl" color="green.600">
                    {formatCurrency(analytics.totalRevenue)}
                  </StatNumber>
                  <StatHelpText fontSize="xs">
                    จากลูกค้าทั้งหมด
                  </StatHelpText>
                </VStack>
              </HStack>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <HStack spacing={3}>
                <Box p={2} borderRadius="lg" bg="purple.100" color="purple.600">
                  <Icon as={IoStatsChartOutline} boxSize={5} />
                </Box>
                <VStack align="start" spacing={0}>
                  <StatLabel fontSize="sm">ค่าเฉลี่ยต่อคน</StatLabel>
                  <StatNumber fontSize="2xl" color="purple.600">
                    {formatCurrency(analytics.averageSpending)}
                  </StatNumber>
                  <StatHelpText fontSize="xs">
                    การซื้อเฉลี่ย
                  </StatHelpText>
                </VStack>
              </HStack>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stat>
              <HStack spacing={3}>
                <Box p={2} borderRadius="lg" bg="orange.100" color="orange.600">
                  <Icon as={IoCardOutline} boxSize={5} />
                </Box>
                <VStack align="start" spacing={0}>
                  <StatLabel fontSize="sm">สมาชิก</StatLabel>
                  <StatNumber fontSize="2xl" color="orange.600">
                    {analytics.membersCount.toLocaleString()}
                  </StatNumber>
                  <StatHelpText fontSize="xs">
                    {analytics.membershipPercentage.toFixed(1)}% ของทั้งหมด
                  </StatHelpText>
                </VStack>
              </HStack>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Growth Statistics */}
      {analytics.monthlyGrowth && (
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <HStack spacing={2}>
              <Icon as={IoTrendingUpOutline} color="blue.500" />
              <Text fontSize="lg" fontWeight="bold">
                การเติบโตรายเดือน
              </Text>
            </HStack>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <Stat>
                <StatLabel>ลูกค้าใหม่เดือนนี้</StatLabel>
                <StatNumber color="blue.600">
                  {analytics.monthlyGrowth.newCustomers.toLocaleString()}
                </StatNumber>
                <StatHelpText>
                  <StatArrow
                    type={analytics.monthlyGrowth.growthRate >= 0 ? "increase" : "decrease"}
                  />
                  {Math.abs(analytics.monthlyGrowth.growthRate).toFixed(1)}%
                </StatHelpText>
              </Stat>
              <Box>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  อัตราการเติบโต
                </Text>
                <Progress
                  value={Math.min(Math.abs(analytics.monthlyGrowth.growthRate), 100)}
                  colorScheme={analytics.monthlyGrowth.growthRate >= 0 ? "green" : "red"}
                  size="lg"
                  borderRadius="full"
                />
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>
      )}

      {/* Demographics */}
      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
        {/* Gender Distribution */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <HStack spacing={2}>
              <Icon as={IoPersonOutline} color="blue.500" />
              <Text fontSize="md" fontWeight="bold">
                การแจกแจงตามเพศ
              </Text>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="stretch">
              {Object.entries(analytics.genderStats).map(([gender, count]) => {
                const percentage = getTotalGenderCount() > 0 
                  ? (count / getTotalGenderCount()) * 100 
                  : 0;
                return (
                  <Box key={gender}>
                    <Flex justify="space-between" align="center" mb={1}>
                      <Text fontSize="sm">{getGenderText(gender)}</Text>
                      <HStack spacing={2}>
                        <Text fontSize="sm" fontWeight="medium">
                          {count}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          ({percentage.toFixed(1)}%)
                        </Text>
                      </HStack>
                    </Flex>
                    <Progress
                      value={percentage}
                      colorScheme="blue"
                      size="sm"
                      borderRadius="full"
                    />
                  </Box>
                );
              })}
            </VStack>
          </CardBody>
        </Card>

        {/* Age Distribution */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <HStack spacing={2}>
              <Icon as={IoCalendarOutline} color="green.500" />
              <Text fontSize="md" fontWeight="bold">
                การแจกแจงตามอายุ
              </Text>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="stretch">
              {Object.entries(analytics.ageStats).map(([ageGroup, count]) => {
                const percentage = getTotalAgeCount() > 0 
                  ? (count / getTotalAgeCount()) * 100 
                  : 0;
                return (
                  <Box key={ageGroup}>
                    <Flex justify="space-between" align="center" mb={1}>
                      <Text fontSize="sm">{getAgeGroupText(ageGroup)}</Text>
                      <HStack spacing={2}>
                        <Text fontSize="sm" fontWeight="medium">
                          {count}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          ({percentage.toFixed(1)}%)
                        </Text>
                      </HStack>
                    </Flex>
                    <Progress
                      value={percentage}
                      colorScheme="green"
                      size="sm"
                      borderRadius="full"
                    />
                  </Box>
                );
              })}
            </VStack>
          </CardBody>
        </Card>

        {/* Membership Distribution */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <HStack spacing={2}>
              <Icon as={IoStarOutline} color="orange.500" />
              <Text fontSize="md" fontWeight="bold">
                การแจกแจงสมาชิก
              </Text>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="stretch">
              {Object.entries(analytics.membershipStats).map(([membershipType, count]) => {
                const percentage = getTotalMembershipCount() > 0 
                  ? (count / getTotalMembershipCount()) * 100 
                  : 0;
                return (
                  <Box key={membershipType}>
                    <Flex justify="space-between" align="center" mb={1}>
                      <Text fontSize="sm">
                        {membershipType === "none" ? "ไม่เป็นสมาชิก" : membershipType}
                      </Text>
                      <HStack spacing={2}>
                        <Text fontSize="sm" fontWeight="medium">
                          {count}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          ({percentage.toFixed(1)}%)
                        </Text>
                      </HStack>
                    </Flex>
                    <Progress
                      value={percentage}
                      colorScheme="orange"
                      size="sm"
                      borderRadius="full"
                    />
                  </Box>
                );
              })}
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Top Spenders */}
      {analytics.topSpenders && analytics.topSpenders.length > 0 && (
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <HStack spacing={2}>
              <Icon as={IoBarChartOutline} color="purple.500" />
              <Text fontSize="lg" fontWeight="bold">
                ลูกค้าที่ซื้อมากที่สุด
              </Text>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="stretch">
              {analytics.topSpenders.map((customer, index) => (
                <Box
                  key={customer.customerId}
                  p={4}
                  bg={statBg}
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor={borderColor}
                >
                  <Flex justify="space-between" align="center">
                    <HStack spacing={3}>
                      <Badge
                        colorScheme={index === 0 ? "gold" : index === 1 ? "gray" : "orange"}
                        variant="solid"
                        fontSize="xs"
                      >
                        #{index + 1}
                      </Badge>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="medium">
                          {customer.customerName}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {customer.ordersCount} คำสั่งซื้อ
                        </Text>
                      </VStack>
                    </HStack>
                    <Text fontSize="lg" fontWeight="bold" color="green.600">
                      {formatCurrency(customer.totalSpent)}
                    </Text>
                  </Flex>
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Summary Insights */}
      <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
        <CardHeader>
          <HStack spacing={2}>
            <Icon as={IoStatsChartOutline} color="blue.500" />
            <Text fontSize="lg" fontWeight="bold">
              สรุปข้อมูลเชิงลึก
            </Text>
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={3} align="stretch">
            <Alert status="info" borderRadius="lg">
              <AlertIcon />
              <Box>
                <Text fontSize="sm">
                  <strong>อัตราเป็นสมาชิก:</strong> {analytics.membershipPercentage.toFixed(1)}%
                  {analytics.membershipPercentage < 30 && " - พิจารณาสร้างแคมเปญสมาชิกใหม่"}
                  {analytics.membershipPercentage >= 30 && analytics.membershipPercentage < 60 && " - อัตราปานกลาง"}
                  {analytics.membershipPercentage >= 60 && " - อัตราดีมาก"}
                </Text>
              </Box>
            </Alert>
            
            <Alert 
              status={analytics.averageSpending > 2000 ? "success" : "warning"} 
              borderRadius="lg"
            >
              <AlertIcon />
              <Box>
                <Text fontSize="sm">
                  <strong>ค่าเฉลี่ยการซื้อ:</strong> {formatCurrency(analytics.averageSpending)}
                  {analytics.averageSpending > 2000 
                    ? " - ค่าเฉลี่ยดี" 
                    : " - อาจต้องกระตุ้นการซื้อเพิ่มเติม"
                  }
                </Text>
              </Box>
            </Alert>

            <Alert 
              status={analytics.activeCustomers / analytics.totalCustomers > 0.8 ? "success" : "warning"} 
              borderRadius="lg"
            >
              <AlertIcon />
              <Box>
                <Text fontSize="sm">
                  <strong>ลูกค้าที่ใช้งาน:</strong> {((analytics.activeCustomers / analytics.totalCustomers) * 100).toFixed(1)}%
                  {(analytics.activeCustomers / analytics.totalCustomers) > 0.8 
                    ? " - อัตราการใช้งานดี" 
                    : " - ควรติดตามลูกค้าที่ไม่ใช้งาน"
                  }
                </Text>
              </Box>
            </Alert>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default CustomerAnalyticsComponent;