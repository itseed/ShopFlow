import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Avatar,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useColorModeValue,
  Icon,
  Divider,
  Grid,
  GridItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Progress,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
} from "@chakra-ui/react";
import {
  IoPersonOutline,
  IoCallOutline,
  IoMailOutline,
  IoLocationOutline,
  IoCalendarOutline,
  IoStarOutline,
  IoStar,
  IoCashOutline,
  IoReceiptOutline,
  IoTrendingUpOutline,
  IoGiftOutline,
  IoEditOutline,
  IoTrashOutline,
  IoAddOutline,
} from "react-icons/io5";
import {
  Customer,
  CustomerStats,
  CustomerTransaction,
  CustomerActivity,
} from "@shopflow/types";
import { formatCurrency } from "../../lib/sales";

interface CustomerDetailProps {
  customer: Customer;
  stats: CustomerStats;
  transactions: CustomerTransaction[];
  activities: CustomerActivity[];
  onEdit?: () => void;
  onDelete?: () => void;
  onAddTransaction?: () => void;
  showActions?: boolean;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({
  customer,
  stats,
  transactions,
  activities,
  onEdit,
  onDelete,
  onAddTransaction,
  showActions = true,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const statBg = useColorModeValue("gray.50", "gray.700");

  const getMembershipColor = (membershipType?: string) => {
    switch (membershipType?.toLowerCase()) {
      case "platinum":
        return "purple";
      case "gold":
        return "yellow";
      case "silver":
        return "gray";
      case "bronze":
        return "orange";
      default:
        return "blue";
    }
  };

  const getCustomerInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatPhoneNumber = (phone?: string) => {
    if (!phone) return "";
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "purchase":
        return "green";
      case "return":
        return "red";
      case "points_redeem":
        return "orange";
      case "points_earn":
        return "blue";
      default:
        return "gray";
    }
  };

  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case "purchase":
        return "ซื้อสินค้า";
      case "return":
        return "คืนสินค้า";
      case "points_redeem":
        return "ใช้แต้ม";
      case "points_earn":
        return "ได้รับแต้ม";
      default:
        return type;
    }
  };

  const handleDeleteConfirm = () => {
    onDelete?.();
    onClose();
    toast({
      title: "ลบลูกค้าสำเร็จ",
      description: `ข้อมูลลูกค้า ${customer.name} ได้รับการลบแล้ว`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Customer Header */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <HStack spacing={6} align="start">
              <Avatar
                size="xl"
                name={customer.name}
                bg={`${getMembershipColor(
                  customer.membership?.membershipType.name
                )}.500`}
                color="white"
              >
                {getCustomerInitials(customer.name)}
              </Avatar>

              <VStack align="start" spacing={2} flex={1}>
                <HStack spacing={3} align="center">
                  <Text fontSize="2xl" fontWeight="bold">
                    {customer.name}
                  </Text>
                  {customer.membership && (
                    <HStack spacing={1}>
                      <Icon
                        as={IoStar}
                        color={`${getMembershipColor(
                          customer.membership.membershipType.name
                        )}.500`}
                      />
                      <Badge
                        colorScheme={getMembershipColor(
                          customer.membership.membershipType.name
                        )}
                        size="lg"
                      >
                        {customer.membership.membershipType.name}
                      </Badge>
                    </HStack>
                  )}
                  {!customer.isActive && (
                    <Badge colorScheme="red" size="lg">
                      ไม่ใช้งาน
                    </Badge>
                  )}
                </HStack>

                <Text fontSize="md" color="gray.500">
                  รหัสลูกค้า: {customer.customerNumber}
                </Text>

                <Grid
                  templateColumns="repeat(auto-fit, minmax(200px, 1fr))"
                  gap={4}
                  w="full"
                >
                  {customer.phone && (
                    <HStack spacing={2}>
                      <Icon as={IoCallOutline} color="gray.500" />
                      <Text fontSize="sm">
                        {formatPhoneNumber(customer.phone)}
                      </Text>
                    </HStack>
                  )}
                  {customer.email && (
                    <HStack spacing={2}>
                      <Icon as={IoMailOutline} color="gray.500" />
                      <Text fontSize="sm">{customer.email}</Text>
                    </HStack>
                  )}
                  {customer.address && (
                    <HStack spacing={2}>
                      <Icon as={IoLocationOutline} color="gray.500" />
                      <Text fontSize="sm">{customer.address}</Text>
                    </HStack>
                  )}
                  <HStack spacing={2}>
                    <Icon as={IoCalendarOutline} color="gray.500" />
                    <Text fontSize="sm">
                      สมัคร {customer.createdAt.toLocaleDateString("th-TH")}
                    </Text>
                  </HStack>
                </Grid>
              </VStack>

              {showActions && (
                <VStack spacing={2}>
                  <Button
                    leftIcon={<Icon as={IoEditOutline} />}
                    colorScheme="blue"
                    size="sm"
                    onClick={onEdit}
                  >
                    แก้ไข
                  </Button>
                  <Button
                    leftIcon={<Icon as={IoTrashOutline} />}
                    colorScheme="red"
                    variant="outline"
                    size="sm"
                    onClick={onOpen}
                  >
                    ลบ
                  </Button>
                </VStack>
              )}
            </HStack>
          </CardBody>
        </Card>

        {/* Statistics Cards */}
        <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={4}>
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>
                  <HStack>
                    <Icon as={IoReceiptOutline} />
                    <Text>จำนวนคำสั่งซื้อ</Text>
                  </HStack>
                </StatLabel>
                <StatNumber color="blue.500">{stats.totalOrders}</StatNumber>
                <StatHelpText>คำสั่งทั้งหมด</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>
                  <HStack>
                    <Icon as={IoCashOutline} />
                    <Text>ยอดซื้อสะสม</Text>
                  </HStack>
                </StatLabel>
                <StatNumber color="green.500">
                  {formatCurrency(stats.totalSpent)}
                </StatNumber>
                <StatHelpText>ยอดซื้อทั้งหมด</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>
                  <HStack>
                    <Icon as={IoTrendingUpOutline} />
                    <Text>ค่าเฉลี่ยต่อคำสั่ง</Text>
                  </HStack>
                </StatLabel>
                <StatNumber color="purple.500">
                  {formatCurrency(stats.averageOrderValue)}
                </StatNumber>
                <StatHelpText>ยอดเฉลี่ย</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          {customer.membership && (
            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>
                    <HStack>
                      <Icon as={IoGiftOutline} />
                      <Text>แต้มสะสม</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber color="orange.500">
                    {customer.membership.points.toLocaleString()}
                  </StatNumber>
                  <StatHelpText>แต้มที่มี</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          )}
        </Grid>

        {/* Membership Progress */}
        {customer.membership && stats.membershipStatus && (
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardHeader>
              <Text fontSize="lg" fontWeight="medium">
                สถานะสมาชิก
              </Text>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="md">
                    ปัจจุบัน:{" "}
                    <strong>{stats.membershipStatus.currentType}</strong>
                  </Text>
                  {stats.membershipStatus.nextType && (
                    <Text fontSize="md">
                      เป้าหมาย:{" "}
                      <strong>{stats.membershipStatus.nextType}</strong>
                    </Text>
                  )}
                </HStack>

                {stats.membershipStatus.progressToNext && (
                  <>
                    <Progress
                      value={stats.membershipStatus.progressToNext}
                      colorScheme={getMembershipColor(
                        stats.membershipStatus.nextType
                      )}
                      size="lg"
                      borderRadius="md"
                    />
                    <Text fontSize="sm" color="gray.500" textAlign="center">
                      ความก้าวหน้าไปสู่ระดับ {stats.membershipStatus.nextType}:{" "}
                      {stats.membershipStatus.progressToNext.toFixed(1)}%
                    </Text>
                  </>
                )}
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Detailed Information Tabs */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <Tabs index={activeTab} onChange={setActiveTab}>
            <TabList>
              <Tab>ประวัติการซื้อ</Tab>
              <Tab>ธุรกรรมแต้ม</Tab>
              <Tab>สินค้าที่ชื่นชอบ</Tab>
              <Tab>กิจกรรม</Tab>
            </TabList>

            <TabPanels>
              {/* Purchase History */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="md" fontWeight="medium">
                      ประวัติการซื้อ ({stats.totalOrders} รายการ)
                    </Text>
                    <Button
                      leftIcon={<Icon as={IoAddOutline} />}
                      size="sm"
                      colorScheme="blue"
                      onClick={onAddTransaction}
                    >
                      เพิ่มรายการ
                    </Button>
                  </HStack>

                  {transactions.length > 0 ? (
                    <TableContainer>
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th>วันที่</Th>
                            <Th>ประเภท</Th>
                            <Th>รายละเอียด</Th>
                            <Th isNumeric>จำนวน</Th>
                            <Th isNumeric>แต้ม</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {transactions.map((transaction) => (
                            <Tr key={transaction.id}>
                              <Td>
                                {transaction.createdAt.toLocaleDateString(
                                  "th-TH"
                                )}
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
                              <Td>{transaction.description}</Td>
                              <Td isNumeric>
                                {formatCurrency(transaction.amount)}
                              </Td>
                              <Td isNumeric>
                                {transaction.pointsEarned && (
                                  <Text color="green.500">
                                    +{transaction.pointsEarned}
                                  </Text>
                                )}
                                {transaction.pointsRedeemed && (
                                  <Text color="red.500">
                                    -{transaction.pointsRedeemed}
                                  </Text>
                                )}
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Alert status="info">
                      <AlertIcon />
                      <AlertTitle>ไม่มีประวัติการซื้อ</AlertTitle>
                      <AlertDescription>
                        ลูกค้ารายนี้ยังไม่มีประวัติการซื้อสินค้า
                      </AlertDescription>
                    </Alert>
                  )}
                </VStack>
              </TabPanel>

              {/* Points Transactions */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Text fontSize="md" fontWeight="medium">
                    รายการแต้มสะสม
                  </Text>

                  {/* Points transactions would go here */}
                  <Alert status="info">
                    <AlertIcon />
                    <AlertDescription>
                      ระบบแต้มสะสมจะแสดงรายละเอียดการได้รับและการใช้แต้ม
                    </AlertDescription>
                  </Alert>
                </VStack>
              </TabPanel>

              {/* Favorite Products */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Text fontSize="md" fontWeight="medium">
                    สินค้าที่ซื้อบ่อย
                  </Text>

                  {stats.favoriteProducts.length > 0 ? (
                    <TableContainer>
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th>สินค้า</Th>
                            <Th isNumeric>ซื้อกี่ครั้ง</Th>
                            <Th isNumeric>ยอดรวม</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {stats.favoriteProducts.map((product, index) => (
                            <Tr key={index}>
                              <Td>{product.productName}</Td>
                              <Td isNumeric>{product.purchaseCount}</Td>
                              <Td isNumeric>
                                {formatCurrency(product.totalAmount)}
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Alert status="info">
                      <AlertIcon />
                      <AlertDescription>
                        ยังไม่มีข้อมูลสินค้าที่ซื้อบ่อย
                      </AlertDescription>
                    </Alert>
                  )}
                </VStack>
              </TabPanel>

              {/* Activities */}
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Text fontSize="md" fontWeight="medium">
                    กิจกรรมล่าสุด
                  </Text>

                  {activities.length > 0 ? (
                    <VStack spacing={3} align="stretch">
                      {activities.map((activity) => (
                        <Box
                          key={activity.id}
                          p={3}
                          bg={statBg}
                          borderRadius="md"
                          borderLeft="4px"
                          borderLeftColor="blue.500"
                        >
                          <HStack justify="space-between">
                            <VStack align="start" spacing={1}>
                              <Text fontWeight="medium">{activity.title}</Text>
                              <Text fontSize="sm" color="gray.600">
                                {activity.description}
                              </Text>
                            </VStack>
                            <Text fontSize="xs" color="gray.500">
                              {activity.createdAt.toLocaleDateString("th-TH")}
                            </Text>
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  ) : (
                    <Alert status="info">
                      <AlertIcon />
                      <AlertDescription>ไม่มีประวัติกิจกรรม</AlertDescription>
                    </Alert>
                  )}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Card>
      </VStack>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>ยืนยันการลบลูกค้า</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Alert status="warning">
              <AlertIcon />
              <VStack align="start" spacing={2}>
                <AlertTitle>คำเตือน!</AlertTitle>
                <AlertDescription>
                  คุณต้องการลบข้อมูลลูกค้า "{customer.name}" หรือไม่?
                  การดำเนินการนี้ไม่สามารถยกเลิกได้
                </AlertDescription>
              </VStack>
            </Alert>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onClose}>
                ยกเลิก
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm}>
                ลบลูกค้า
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CustomerDetail;
