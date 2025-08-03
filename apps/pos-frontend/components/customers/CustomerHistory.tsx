import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Card,
  CardBody,
  CardHeader,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Button,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  Icon,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Divider,
  Avatar,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  IoSearch,
  IoCalendar,
  IoReceiptOutline,
  IoTrendingUpOutline,
  IoStarOutline,
  IoTimeOutline,
  IoCardOutline,
  IoCashOutline,
  IoGiftOutline,
} from "react-icons/io5";
import {
  Customer,
  CustomerStats,
  CustomerTransaction,
  CustomerActivity,
} from "@shopflow/types";
import { formatCurrency } from "../../lib/sales";

interface CustomerHistoryProps {
  customer: Customer;
  stats: CustomerStats;
  transactions?: CustomerTransaction[];
  activities?: CustomerActivity[];
  showActions?: boolean;
}

const CustomerHistory: React.FC<CustomerHistoryProps> = ({
  customer,
  stats,
  transactions = [],
  activities = [],
  showActions = true,
}) => {
  const [filteredTransactions, setFilteredTransactions] = useState(transactions);
  const [filteredActivities, setFilteredActivities] = useState(activities);
  const [transactionFilter, setTransactionFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    filterTransactions();
  }, [transactions, transactionFilter, searchTerm]);

  useEffect(() => {
    filterActivities();
  }, [activities, searchTerm]);

  const filterTransactions = () => {
    let filtered = transactions;

    // Filter by type
    if (transactionFilter !== "all") {
      filtered = filtered.filter((t) => t.type === transactionFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((t) =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  };

  const filterActivities = () => {
    let filtered = activities;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredActivities(filtered);
  };

  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case "purchase":
        return "ซื้อสินค้า";
      case "refund":
        return "คืนเงิน";
      case "points_redeem":
        return "ใช้แต้ม";
      case "points_earn":
        return "ได้แต้ม";
      default:
        return type;
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "purchase":
        return "green";
      case "refund":
        return "red";
      case "points_redeem":
        return "orange";
      case "points_earn":
        return "blue";
      default:
        return "gray";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "purchase":
        return IoReceiptOutline;
      case "points_activity":
        return IoStarOutline;
      case "membership_update":
        return IoCardOutline;
      case "profile_update":
        return IoTimeOutline;
      default:
        return IoTimeOutline;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateMembershipProgress = () => {
    if (!customer.membership) return 0;
    
    const currentSpent = customer.membership.totalSpent;
    const nextLevelSpent = 100000; // Mock next level requirement
    return Math.min((currentSpent / nextLevelSpent) * 100, 100);
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Customer Stats Summary */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        <Card variant="elevated" bg={cardBg}>
          <CardBody>
            <Stat>
              <StatLabel fontSize="sm">ยอดซื้อทั้งหมด</StatLabel>
              <StatNumber fontSize="2xl" color="green.500">
                {formatCurrency(stats.totalSpent)}
              </StatNumber>
              <StatHelpText>
                <HStack spacing={1}>
                  <IoTrendingUpOutline />
                  <Text>เฉลี่ย {formatCurrency(stats.averageOrderValue)}</Text>
                </HStack>
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card variant="elevated" bg={cardBg}>
          <CardBody>
            <Stat>
              <StatLabel fontSize="sm">คำสั่งซื้อทั้งหมด</StatLabel>
              <StatNumber fontSize="2xl" color="blue.500">
                {stats.totalOrders}
              </StatNumber>
              <StatHelpText>
                การซื้อล่าสุด: {stats.lastPurchaseDate ? formatDate(stats.lastPurchaseDate) : "ไม่มีข้อมูล"}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card variant="elevated" bg={cardBg}>
          <CardBody>
            <Stat>
              <StatLabel fontSize="sm">แต้มสะสม</StatLabel>
              <StatNumber fontSize="2xl" color="purple.500">
                {stats.pointsBalance?.toLocaleString() || 0}
              </StatNumber>
              <StatHelpText>แต้มพร้อมใช้</StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card variant="elevated" bg={cardBg}>
          <CardBody>
            <Stat>
              <StatLabel fontSize="sm">สถานะสมาชิก</StatLabel>
              <StatNumber fontSize="lg">
                {customer.membership?.membershipType.name || "ไม่เป็นสมาชิก"}
              </StatNumber>
              {customer.membership && (
                <StatHelpText>
                  <Progress
                    value={calculateMembershipProgress()}
                    size="sm"
                    colorScheme="blue"
                    mt={2}
                  />
                  <Text fontSize="xs" mt={1}>
                    {Math.round(calculateMembershipProgress())}% สู่ระดับถัดไป
                  </Text>
                </StatHelpText>
              )}
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Favorite Products */}
      {stats.favoriteProducts && stats.favoriteProducts.length > 0 && (
        <Card variant="elevated" bg={cardBg}>
          <CardHeader>
            <HStack spacing={2}>
              <Icon as={IoStarOutline} color="orange.500" />
              <Text fontSize="lg" fontWeight="bold">
                สินค้าที่ซื้อบ่อย
              </Text>
            </HStack>
          </CardHeader>
          <CardBody>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              {stats.favoriteProducts.map((product, index) => (
                <Box
                  key={product.productId}
                  p={4}
                  borderWidth="1px"
                  borderColor={borderColor}
                  borderRadius="lg"
                >
                  <VStack align="start" spacing={2}>
                    <HStack justify="space-between" w="full">
                      <Text fontSize="sm" fontWeight="medium">
                        {product.productName}
                      </Text>
                      <Badge colorScheme="blue" size="sm">
                        #{index + 1}
                      </Badge>
                    </HStack>
                    <HStack spacing={4}>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" color="gray.500">
                          จำนวนครั้ง
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {product.purchaseCount}
                        </Text>
                      </VStack>
                      <VStack align="start" spacing={0}>
                        <Text fontSize="xs" color="gray.500">
                          ยอดรวม
                        </Text>
                        <Text fontSize="sm" fontWeight="medium">
                          {formatCurrency(product.totalAmount)}
                        </Text>
                      </VStack>
                    </HStack>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          </CardBody>
        </Card>
      )}

      {/* History Tabs */}
      <Card variant="elevated" bg={cardBg}>
        <CardBody p={0}>
          <Tabs>
            <TabList>
              <Tab>ประวัติการซื้อ</Tab>
              <Tab>กิจกรรมทั้งหมด</Tab>
            </TabList>

            <TabPanels>
              {/* Transactions Tab */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  {/* Filters */}
                  <HStack spacing={4} flexWrap="wrap">
                    <InputGroup maxW="300px">
                      <InputLeftElement>
                        <IoSearch color="gray.400" />
                      </InputLeftElement>
                      <Input
                        placeholder="ค้นหาในประวัติ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        size="sm"
                      />
                    </InputGroup>

                    <Select
                      value={transactionFilter}
                      onChange={(e) => setTransactionFilter(e.target.value)}
                      maxW="200px"
                      size="sm"
                    >
                      <option value="all">ทุกประเภท</option>
                      <option value="purchase">ซื้อสินค้า</option>
                      <option value="refund">คืนเงิน</option>
                      <option value="points_redeem">ใช้แต้ม</option>
                    </Select>
                  </HStack>

                  {/* Transactions Table */}
                  {loading ? (
                    <Center py={8}>
                      <Spinner />
                    </Center>
                  ) : filteredTransactions.length === 0 ? (
                    <Center py={8}>
                      <Alert status="info" maxW="md">
                        <AlertIcon />
                        <Text>ไม่มีประวัติการทำรายการ</Text>
                      </Alert>
                    </Center>
                  ) : (
                    <TableContainer>
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th>วันที่</Th>
                            <Th>ประเภท</Th>
                            <Th>รายละเอียด</Th>
                            <Th>จำนวนเงิน</Th>
                            <Th>แต้ม</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {filteredTransactions.map((transaction) => (
                            <Tr key={transaction.id}>
                              <Td>
                                <Text fontSize="sm">
                                  {formatDate(transaction.createdAt)}
                                </Text>
                              </Td>
                              <Td>
                                <Badge
                                  colorScheme={getTransactionTypeColor(
                                    transaction.type
                                  )}
                                  size="sm"
                                >
                                  {getTransactionTypeText(transaction.type)}
                                </Badge>
                              </Td>
                              <Td>
                                <Text fontSize="sm">
                                  {transaction.description}
                                </Text>
                              </Td>
                              <Td>
                                <Text
                                  fontSize="sm"
                                  fontWeight="medium"
                                  color={
                                    transaction.amount >= 0
                                      ? "green.600"
                                      : "red.600"
                                  }
                                >
                                  {transaction.amount >= 0 ? "+" : ""}
                                  {formatCurrency(transaction.amount)}
                                </Text>
                              </Td>
                              <Td>
                                {transaction.pointsEarned && (
                                  <Text fontSize="sm" color="blue.600">
                                    +{transaction.pointsEarned}
                                  </Text>
                                )}
                                {transaction.pointsRedeemed && (
                                  <Text fontSize="sm" color="orange.600">
                                    -{transaction.pointsRedeemed}
                                  </Text>
                                )}
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  )}
                </VStack>
              </TabPanel>

              {/* Activities Tab */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  {/* Search */}
                  <InputGroup maxW="300px">
                    <InputLeftElement>
                      <IoSearch color="gray.400" />
                    </InputLeftElement>
                    <Input
                      placeholder="ค้นหากิจกรรม..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      size="sm"
                    />
                  </InputGroup>

                  {/* Activities List */}
                  {filteredActivities.length === 0 ? (
                    <Center py={8}>
                      <Alert status="info" maxW="md">
                        <AlertIcon />
                        <Text>ไม่มีกิจกรรม</Text>
                      </Alert>
                    </Center>
                  ) : (
                    <VStack spacing={3} align="stretch">
                      {filteredActivities.map((activity, index) => (
                        <Box key={activity.id}>
                          <HStack spacing={4} align="start">
                            <Box
                              p={2}
                              borderRadius="full"
                              bg="blue.100"
                              color="blue.600"
                            >
                              <Icon
                                as={getActivityIcon(activity.type)}
                                boxSize={4}
                              />
                            </Box>
                            <VStack align="start" spacing={1} flex={1}>
                              <HStack justify="space-between" w="full">
                                <Text fontSize="sm" fontWeight="medium">
                                  {activity.title}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  {formatDate(activity.createdAt)}
                                </Text>
                              </HStack>
                              <Text fontSize="sm" color="gray.600">
                                {activity.description}
                              </Text>
                            </VStack>
                          </HStack>
                          {index < filteredActivities.length - 1 && (
                            <Divider mt={3} />
                          )}
                        </Box>
                      ))}
                    </VStack>
                  )}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default CustomerHistory;