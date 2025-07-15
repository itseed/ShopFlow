import React, { useState, useEffect } from "react";
import { ReactElement } from "react";
import { NextPageWithLayout } from "./_app";
import Layout from "../components/Layout";
import {
  Order,
  OrderStatus,
  PaymentStatus,
  CustomerType,
  ShopType,
  DeliveryMethod,
  OrderPriority,
} from "@shopflow/types";
import { withAuth } from "../lib/auth";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  NumberInput,
  NumberInputField,
  Textarea,
  useDisclosure,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Flex,
  Icon,
  InputGroup,
  InputLeftElement,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  Tooltip,
  Avatar,
  AvatarGroup,
} from "@chakra-ui/react";
import {
  FiShoppingCart,
  FiSearch,
  FiFilter,
  FiDownload,
  FiEye,
  FiEdit,
  FiMoreVertical,
  FiPlus,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiPackage,
  FiTruck,
  FiPhone,
  FiMail,
  FiMapPin,
  FiUser,
  FiUsers,
  FiAlertTriangle,
  FiTrendingUp,
  FiDollarSign,
  FiCalendar,
  FiPrinter,
} from "react-icons/fi";

// Mock data for wholesale orders
const mockOrders: Order[] = [
  {
    id: "ORD-001",
    order_number: "WS-2024-001",
    customer_type: "registered",
    customer_id: "CUST-001",
    customer_name: "นายสมชาย ใจดี",
    customer_phone: "081-234-5678",
    customer_email: "somchai@email.com",
    shop_name: "ร้านสะดวกซื้อ สมชาย",
    shop_type: "convenience_store",
    branch_name: "สาขาหลัก",
    subtotal: 12500,
    discount_amount: 500,
    tax: 840,
    delivery_fee: 200,
    total: 13040,
    payment_method: "credit",
    payment_status: "pending",
    delivery_method: "delivery",
    delivery_address: "123 ถ.รัชดาภิเษก แขวงดินแดง เขตดินแดง กรุงเทพฯ 10400",
    delivery_date: "2024-01-16",
    status: "confirmed",
    priority: "normal",
    notes: "ขอส่งเช้า 8 โมง",
    sales_rep: "วิชาญ",
    items: [],
    created_at: "2024-01-15T10:30:00Z",
  },
  {
    id: "ORD-002",
    order_number: "WS-2024-002",
    customer_type: "walk_in",
    customer_name: "นางสาวสมหญิง รักดี",
    customer_phone: "082-345-6789",
    shop_name: "ร้านโชว์ห่วย สมหญิง",
    shop_type: "mini_mart",
    subtotal: 8990,
    discount_amount: 0,
    tax: 629,
    delivery_fee: 0,
    total: 9619,
    payment_method: "cash",
    payment_status: "paid",
    delivery_method: "pickup",
    status: "ready",
    priority: "normal",
    sales_rep: "สมศักดิ์",
    items: [],
    created_at: "2024-01-15T09:15:00Z",
  },
  {
    id: "ORD-002-A",
    order_number: "WS-2024-002A",
    customer_type: "walk_in",
    // ลูกค้าหน้าร้านไม่ได้ให้ข้อมูล
    subtotal: 3250,
    discount_amount: 0,
    tax: 228,
    delivery_fee: 0,
    total: 3478,
    payment_method: "cash",
    payment_status: "paid",
    delivery_method: "pickup",
    status: "completed",
    priority: "normal",
    notes: "ลูกค้าหน้าร้าน ไม่ได้ระบุชื่อ",
    sales_rep: "สมศักดิ์",
    items: [],
    created_at: "2024-01-15T11:45:00Z",
  },
  {
    id: "ORD-002-B",
    order_number: "WS-2024-002B",
    customer_type: "walk_in",
    customer_phone: "081-999-8888", // มีเบอร์โทรแต่ไม่มีชื่อ
    subtotal: 1890,
    discount_amount: 0,
    tax: 132,
    delivery_fee: 0,
    total: 2022,
    payment_method: "cash",
    payment_status: "paid",
    delivery_method: "pickup",
    status: "completed",
    priority: "normal",
    notes: "ลูกค้าให้เบอร์โทรเฉพาะ",
    sales_rep: "วิชาญ",
    items: [],
    created_at: "2024-01-15T14:20:00Z",
  },
  {
    id: "ORD-003",
    order_number: "WS-2024-003",
    customer_type: "registered",
    customer_id: "CUST-003",
    customer_name: "นายประยุทธ มั่นคง",
    customer_phone: "083-456-7890",
    customer_email: "prayuth@shop.com",
    shop_name: "ซูเปอร์มาร์เก็ต ประยุทธ",
    shop_type: "supermarket",
    branch_name: "สาขา 1",
    subtotal: 25000,
    discount_amount: 1250,
    tax: 1656,
    delivery_fee: 500,
    total: 25906,
    payment_method: "bank_transfer",
    payment_status: "paid",
    delivery_method: "scheduled",
    delivery_address: "456 ถ.พหลโยธิน แขวงลาดยาว เขตจตุจักร กรุงเทพฯ 10900",
    delivery_date: "2024-01-17",
    status: "processing",
    priority: "high",
    notes: "ลูกค้าใหญ่ ขอความรวดเร็ว",
    internal_notes: "ตรวจสอบสต๊อกให้ดี",
    sales_rep: "วิชาญ",
    items: [],
    created_at: "2024-01-15T08:45:00Z",
  },
  {
    id: "ORD-004",
    order_number: "WS-2024-004",
    customer_type: "phone_order",
    customer_name: "นางสาวสมใจ ยิ้มแย้ม",
    customer_phone: "084-567-8901",
    shop_name: "ร้านชำ สมใจ",
    shop_type: "grocery_store",
    subtotal: 4500,
    discount_amount: 0,
    tax: 315,
    delivery_fee: 150,
    total: 4965,
    payment_method: "e_wallet",
    payment_status: "paid",
    delivery_method: "express",
    delivery_address: "789 ถ.สุขุมวิท แขวงคลองตัน เขตคลองตัน กรุงเทพฯ 10110",
    status: "delivering",
    priority: "urgent",
    notes: "ต้องการด่วน สินค้าหมด",
    sales_rep: "มานะ",
    items: [],
    created_at: "2024-01-14T16:20:00Z",
  },
];

const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case "pending":
      return "yellow";
    case "confirmed":
      return "blue";
    case "processing":
      return "purple";
    case "ready":
      return "cyan";
    case "delivering":
      return "orange";
    case "completed":
      return "green";
    case "cancelled":
      return "red";
    case "refunded":
      return "gray";
    default:
      return "gray";
  }
};

const getStatusText = (status: OrderStatus): string => {
  switch (status) {
    case "pending":
      return "รอยืนยัน";
    case "confirmed":
      return "ยืนยันแล้ว";
    case "processing":
      return "กำลังจัดเตรียม";
    case "ready":
      return "พร้อมส่ง";
    case "delivering":
      return "กำลังจัดส่ง";
    case "completed":
      return "สำเร็จ";
    case "cancelled":
      return "ยกเลิก";
    case "refunded":
      return "คืนเงิน";
    default:
      return status;
  }
};

const getPriorityColor = (priority: OrderPriority): string => {
  switch (priority) {
    case "low":
      return "gray";
    case "normal":
      return "blue";
    case "high":
      return "orange";
    case "urgent":
      return "red";
    default:
      return "gray";
  }
};

const getPriorityText = (priority: OrderPriority): string => {
  switch (priority) {
    case "low":
      return "ต่ำ";
    case "normal":
      return "ปกติ";
    case "high":
      return "สูง";
    case "urgent":
      return "ด่วน";
    default:
      return priority;
  }
};

const getPaymentStatusColor = (status: PaymentStatus): string => {
  switch (status) {
    case "pending":
      return "yellow";
    case "paid":
      return "green";
    case "partial":
      return "orange";
    case "overdue":
      return "red";
    case "refunded":
      return "gray";
    default:
      return "gray";
  }
};

const getPaymentStatusText = (status: PaymentStatus): string => {
  switch (status) {
    case "pending":
      return "รอชำระ";
    case "paid":
      return "ชำระแล้ว";
    case "partial":
      return "ชำระบางส่วน";
    case "overdue":
      return "เกินกำหนด";
    case "refunded":
      return "คืนเงิน";
    default:
      return status;
  }
};

const getCustomerTypeText = (type: CustomerType): string => {
  switch (type) {
    case "registered":
      return "ลูกค้าประจำ";
    case "walk_in":
      return "ลูกค้าหน้าร้าน";
    case "phone_order":
      return "สั่งทางโทรศัพท์";
    case "repeat_customer":
      return "ลูกค้าเก่า";
    default:
      return type;
  }
};

const getShopTypeText = (type: ShopType): string => {
  switch (type) {
    case "convenience_store":
      return "ร้านสะดวกซื้อ";
    case "grocery_store":
      return "ร้านชำ";
    case "mini_mart":
      return "มินิมาร์ท";
    case "supermarket":
      return "ซูเปอร์มาร์เก็ต";
    case "restaurant":
      return "ร้านอาหาร";
    case "other":
      return "อื่นๆ";
    default:
      return type;
  }
};

// Helper functions for displaying customer info that might be missing
const getDisplayCustomerName = (order: Order): string => {
  if (order.customer_name) {
    return order.customer_name;
  }
  if (order.customer_type === "walk_in") {
    return "ลูกค้าหน้าร้าน";
  }
  return "ไม่ระบุชื่อ";
};

const getDisplayShopInfo = (
  order: Order
): { name: string; hasShop: boolean } => {
  if (order.shop_name) {
    return { name: order.shop_name, hasShop: true };
  }
  if (order.customer_type === "walk_in") {
    return { name: "ซื้อใช้ส่วนตัว", hasShop: false };
  }
  return { name: "ไม่ระบุร้านค้า", hasShop: false };
};

const shouldShowContactInfo = (order: Order): boolean => {
  return !!(order.customer_phone || order.customer_email);
};

function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [customerTypeFilter, setCustomerTypeFilter] = useState<
    CustomerType | ""
  >("");
  const [priorityFilter, setPriorityFilter] = useState<OrderPriority | "">("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const {
    isOpen: isDetailOpen,
    onOpen: onDetailOpen,
    onClose: onDetailClose,
  } = useDisclosure();
  const toast = useToast();

  // Statistics calculation
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (o) => o.status === "pending" || o.status === "confirmed"
  ).length;
  const completedOrders = orders.filter((o) => o.status === "completed").length;
  const totalRevenue = orders
    .filter((o) => o.status === "completed")
    .reduce((sum, order) => sum + order.total, 0);

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      !searchTerm ||
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shop_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || order.status === statusFilter;
    const matchesCustomerType =
      !customerTypeFilter || order.customer_type === customerTypeFilter;
    const matchesPriority =
      !priorityFilter || order.priority === priorityFilter;

    return (
      matchesSearch && matchesStatus && matchesCustomerType && matchesPriority
    );
  });

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    onDetailOpen();
  };

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );

    toast({
      title: "อัปเดตสถานะสำเร็จ",
      description: `เปลี่ยนสถานะเป็น ${getStatusText(newStatus)}`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box>
      {/* Header */}
      <Box mb={8}>
        <HStack justify="space-between" mb={4}>
          <Box>
            <Heading size="lg" mb={2} fontFamily="heading">
              จัดการคำสั่งซื้อ
            </Heading>
            <Text color="gray.600">
              จัดการคำสั่งซื้อจากร้านค้าปลีกและลูกค้าขายส่ง
            </Text>
          </Box>
          <Button leftIcon={<FiPlus />} colorScheme="blue" size="lg">
            สร้างคำสั่งซื้อใหม่
          </Button>
        </HStack>

        {/* Statistics */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} mb={6}>
          <Card>
            <CardBody>
              <Stat>
                <Flex justify="space-between" align="center">
                  <Box>
                    <StatLabel>คำสั่งซื้อทั้งหมด</StatLabel>
                    <StatNumber>{totalOrders}</StatNumber>
                  </Box>
                  <Icon as={FiShoppingCart} boxSize={8} color="blue.500" />
                </Flex>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <Flex justify="space-between" align="center">
                  <Box>
                    <StatLabel>รอดำเนินการ</StatLabel>
                    <StatNumber>{pendingOrders}</StatNumber>
                  </Box>
                  <Icon as={FiClock} boxSize={8} color="yellow.500" />
                </Flex>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <Flex justify="space-between" align="center">
                  <Box>
                    <StatLabel>สำเร็จแล้ว</StatLabel>
                    <StatNumber>{completedOrders}</StatNumber>
                  </Box>
                  <Icon as={FiCheckCircle} boxSize={8} color="green.500" />
                </Flex>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <Flex justify="space-between" align="center">
                  <Box>
                    <StatLabel>ยอดขายรวม</StatLabel>
                    <StatNumber>฿{totalRevenue.toLocaleString()}</StatNumber>
                  </Box>
                  <Icon as={FiDollarSign} boxSize={8} color="green.500" />
                </Flex>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>
      </Box>

      {/* Filters */}
      <Card mb={6}>
        <CardBody>
          <HStack spacing={4} wrap="wrap">
            <InputGroup maxW="300px">
              <InputLeftElement>
                <FiSearch />
              </InputLeftElement>
              <Input
                placeholder="ค้นหาหมายเลข, ชื่อลูกค้า, ร้านค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>

            <Select
              placeholder="สถานะ"
              maxW="150px"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus)}
            >
              <option value="pending">รอยืนยัน</option>
              <option value="confirmed">ยืนยันแล้ว</option>
              <option value="processing">กำลังจัดเตรียม</option>
              <option value="ready">พร้อมส่ง</option>
              <option value="delivering">กำลังจัดส่ง</option>
              <option value="completed">สำเร็จ</option>
              <option value="cancelled">ยกเลิก</option>
            </Select>

            <Select
              placeholder="ประเภทลูกค้า"
              maxW="180px"
              value={customerTypeFilter}
              onChange={(e) =>
                setCustomerTypeFilter(e.target.value as CustomerType)
              }
            >
              <option value="registered">ลูกค้าประจำ</option>
              <option value="walk_in">ลูกค้าหน้าร้าน</option>
              <option value="phone_order">สั่งทางโทรศัพท์</option>
              <option value="repeat_customer">ลูกค้าเก่า</option>
            </Select>

            <Select
              placeholder="ความสำคัญ"
              maxW="130px"
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(e.target.value as OrderPriority)
              }
            >
              <option value="low">ต่ำ</option>
              <option value="normal">ปกติ</option>
              <option value="high">สูง</option>
              <option value="urgent">ด่วน</option>
            </Select>

            <Button leftIcon={<FiDownload />} variant="outline">
              ส่งออก
            </Button>
          </HStack>
        </CardBody>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="semibold">
              รายการคำสั่งซื้อ ({filteredOrders.length})
            </Text>
          </HStack>
        </CardHeader>
        <CardBody p={0}>
          {loading ? (
            <Flex justify="center" p={8}>
              <Spinner size="lg" />
            </Flex>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>หมายเลขคำสั่ง</Th>
                  <Th>ลูกค้า/ร้านค้า</Th>
                  <Th>ประเภท</Th>
                  <Th>ยอดรวม</Th>
                  <Th>การชำระ</Th>
                  <Th>สถานะ</Th>
                  <Th>ความสำคัญ</Th>
                  <Th>พนักงานขาย</Th>
                  <Th>วันที่</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredOrders.map((order) => (
                  <Tr key={order.id}>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="semibold">{order.order_number}</Text>
                        {order.delivery_date && (
                          <Text fontSize="xs" color="gray.500">
                            <Icon as={FiCalendar} mr={1} />
                            ส่ง:{" "}
                            {new Date(order.delivery_date).toLocaleDateString(
                              "th-TH"
                            )}
                          </Text>
                        )}
                      </VStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">
                          {getDisplayCustomerName(order)}
                        </Text>
                        {shouldShowContactInfo(order) &&
                          order.customer_phone && (
                            <Text fontSize="xs" color="gray.600">
                              <Icon as={FiPhone} mr={1} />
                              {order.customer_phone}
                            </Text>
                          )}
                        {(() => {
                          const shopInfo = getDisplayShopInfo(order);
                          return (
                            <Text
                              fontSize="sm"
                              color={shopInfo.hasShop ? "blue.600" : "gray.500"}
                              fontWeight={
                                shopInfo.hasShop ? "medium" : "normal"
                              }
                              fontStyle={
                                !shopInfo.hasShop ? "italic" : "normal"
                              }
                            >
                              {shopInfo.name}
                            </Text>
                          );
                        })()}
                        {order.branch_name && (
                          <Text fontSize="xs" color="gray.500">
                            {order.branch_name}
                          </Text>
                        )}
                        <HStack spacing={2}>
                          {order.shop_type && (
                            <Badge colorScheme="gray" size="sm">
                              {getShopTypeText(order.shop_type)}
                            </Badge>
                          )}
                          {order.customer_type === "walk_in" &&
                            !order.customer_name && (
                              <Badge
                                colorScheme="orange"
                                size="sm"
                                variant="outline"
                              >
                                ไม่ระบุข้อมูล
                              </Badge>
                            )}
                        </HStack>
                      </VStack>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={
                          order.customer_type === "registered" ? "blue" : "gray"
                        }
                        variant="outline"
                      >
                        {getCustomerTypeText(order.customer_type)}
                      </Badge>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="semibold">
                          ฿{order.total.toLocaleString()}
                        </Text>
                        {order.discount_amount > 0 && (
                          <Text fontSize="xs" color="green.500">
                            ส่วนลด ฿{order.discount_amount.toLocaleString()}
                          </Text>
                        )}
                      </VStack>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Badge
                          colorScheme={getPaymentStatusColor(
                            order.payment_status
                          )}
                        >
                          {getPaymentStatusText(order.payment_status)}
                        </Badge>
                        <Text fontSize="xs" color="gray.500">
                          {order.payment_method}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={getPriorityColor(order.priority)}
                        variant={
                          order.priority === "urgent" ? "solid" : "outline"
                        }
                      >
                        {getPriorityText(order.priority)}
                      </Badge>
                    </Td>
                    <Td>
                      <HStack>
                        <Avatar size="sm" name={order.sales_rep} />
                        <Text fontSize="sm">{order.sales_rep}</Text>
                      </HStack>
                    </Td>
                    <Td>
                      <Text fontSize="sm">
                        {new Date(order.created_at!).toLocaleDateString(
                          "th-TH"
                        )}
                      </Text>
                    </Td>
                    <Td>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<FiMoreVertical />}
                          variant="ghost"
                          size="sm"
                        />
                        <MenuList>
                          <MenuItem
                            icon={<FiEye />}
                            onClick={() => handleViewOrder(order)}
                          >
                            ดูรายละเอียด
                          </MenuItem>
                          <MenuItem icon={<FiEdit />}>แก้ไข</MenuItem>
                          <MenuItem icon={<FiPrinter />}>พิมพ์ใบสั่ง</MenuItem>
                          {order.status === "pending" && (
                            <MenuItem
                              icon={<FiCheckCircle />}
                              onClick={() =>
                                handleUpdateStatus(order.id, "confirmed")
                              }
                            >
                              ยืนยันคำสั่ง
                            </MenuItem>
                          )}
                          {order.status === "confirmed" && (
                            <MenuItem
                              icon={<FiPackage />}
                              onClick={() =>
                                handleUpdateStatus(order.id, "processing")
                              }
                            >
                              เริ่มจัดเตรียม
                            </MenuItem>
                          )}
                          {order.status === "processing" && (
                            <MenuItem
                              icon={<FiTruck />}
                              onClick={() =>
                                handleUpdateStatus(order.id, "ready")
                              }
                            >
                              พร้อมส่ง
                            </MenuItem>
                          )}
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Order Detail Modal */}
      <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            รายละเอียดคำสั่งซื้อ {selectedOrder?.order_number}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedOrder && (
              <VStack spacing={6} align="stretch">
                {/* Customer Info */}
                <Card>
                  <CardHeader>
                    <Heading size="md">ข้อมูลลูกค้า</Heading>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={2} spacing={4}>
                      <Box>
                        <Text fontWeight="medium">ชื่อลูกค้า</Text>
                        <Text>
                          {selectedOrder.customer_name || (
                            <Text as="span" color="gray.500" fontStyle="italic">
                              ลูกค้าไม่ระบุชื่อ
                            </Text>
                          )}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontWeight="medium">เบอร์โทร</Text>
                        <Text>
                          {selectedOrder.customer_phone || (
                            <Text as="span" color="gray.500" fontStyle="italic">
                              ไม่ระบุ
                            </Text>
                          )}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontWeight="medium">อีเมล</Text>
                        <Text>
                          {selectedOrder.customer_email || (
                            <Text as="span" color="gray.500" fontStyle="italic">
                              ไม่ระบุ
                            </Text>
                          )}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontWeight="medium">ชื่อร้านค้า</Text>
                        <Text
                          color={
                            selectedOrder.shop_name ? "blue.600" : "gray.500"
                          }
                          fontWeight={
                            selectedOrder.shop_name ? "medium" : "normal"
                          }
                          fontStyle={
                            !selectedOrder.shop_name ? "italic" : "normal"
                          }
                        >
                          {selectedOrder.shop_name || "ไม่ระบุร้านค้า"}
                        </Text>
                      </Box>
                      {selectedOrder.shop_type && (
                        <Box>
                          <Text fontWeight="medium">ประเภทร้าน</Text>
                          <Badge>
                            {getShopTypeText(selectedOrder.shop_type)}
                          </Badge>
                        </Box>
                      )}
                      {selectedOrder.branch_name && (
                        <Box>
                          <Text fontWeight="medium">สาขา</Text>
                          <Text>{selectedOrder.branch_name}</Text>
                        </Box>
                      )}
                      <Box>
                        <Text fontWeight="medium">ประเภทลูกค้า</Text>
                        <Badge colorScheme="blue">
                          {getCustomerTypeText(selectedOrder.customer_type)}
                        </Badge>
                      </Box>
                    </SimpleGrid>
                  </CardBody>
                </Card>

                {/* Order Info */}
                <Card>
                  <CardHeader>
                    <Heading size="md">ข้อมูลคำสั่งซื้อ</Heading>
                  </CardHeader>
                  <CardBody>
                    <SimpleGrid columns={2} spacing={4}>
                      <Box>
                        <Text fontWeight="medium">สถานะ</Text>
                        <Badge
                          colorScheme={getStatusColor(selectedOrder.status)}
                        >
                          {getStatusText(selectedOrder.status)}
                        </Badge>
                      </Box>
                      <Box>
                        <Text fontWeight="medium">ความสำคัญ</Text>
                        <Badge
                          colorScheme={getPriorityColor(selectedOrder.priority)}
                        >
                          {getPriorityText(selectedOrder.priority)}
                        </Badge>
                      </Box>
                      <Box>
                        <Text fontWeight="medium">การชำระเงิน</Text>
                        <VStack align="start" spacing={1}>
                          <Badge
                            colorScheme={getPaymentStatusColor(
                              selectedOrder.payment_status
                            )}
                          >
                            {getPaymentStatusText(selectedOrder.payment_status)}
                          </Badge>
                          <Text fontSize="sm" color="gray.600">
                            {selectedOrder.payment_method}
                          </Text>
                        </VStack>
                      </Box>
                      <Box>
                        <Text fontWeight="medium">การจัดส่ง</Text>
                        <Text>{selectedOrder.delivery_method}</Text>
                        {selectedOrder.delivery_date && (
                          <Text fontSize="sm" color="gray.600">
                            {new Date(
                              selectedOrder.delivery_date
                            ).toLocaleDateString("th-TH")}
                          </Text>
                        )}
                      </Box>
                      <Box>
                        <Text fontWeight="medium">พนักงานขาย</Text>
                        <HStack>
                          <Avatar size="sm" name={selectedOrder.sales_rep} />
                          <Text>{selectedOrder.sales_rep}</Text>
                        </HStack>
                      </Box>
                    </SimpleGrid>

                    {selectedOrder.delivery_address && (
                      <Box mt={4}>
                        <Text fontWeight="medium">ที่อยู่จัดส่ง</Text>
                        <Text>{selectedOrder.delivery_address}</Text>
                      </Box>
                    )}

                    {selectedOrder.notes && (
                      <Box mt={4}>
                        <Text fontWeight="medium">หมายเหตุ</Text>
                        <Text>{selectedOrder.notes}</Text>
                      </Box>
                    )}

                    {selectedOrder.internal_notes && (
                      <Box mt={4}>
                        <Text fontWeight="medium">หมายเหตุภายใน</Text>
                        <Text color="red.600">
                          {selectedOrder.internal_notes}
                        </Text>
                      </Box>
                    )}
                  </CardBody>
                </Card>

                {/* Order Summary */}
                <Card>
                  <CardHeader>
                    <Heading size="md">สรุปยอดเงิน</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={2} align="stretch">
                      <HStack justify="space-between">
                        <Text>ยอดรวมสินค้า</Text>
                        <Text>฿{selectedOrder.subtotal.toLocaleString()}</Text>
                      </HStack>
                      {selectedOrder.discount_amount > 0 && (
                        <HStack justify="space-between">
                          <Text color="green.600">ส่วนลด</Text>
                          <Text color="green.600">
                            -฿{selectedOrder.discount_amount.toLocaleString()}
                          </Text>
                        </HStack>
                      )}
                      <HStack justify="space-between">
                        <Text>ภาษี</Text>
                        <Text>฿{selectedOrder.tax.toLocaleString()}</Text>
                      </HStack>
                      {selectedOrder.delivery_fee > 0 && (
                        <HStack justify="space-between">
                          <Text>ค่าจัดส่ง</Text>
                          <Text>
                            ฿{selectedOrder.delivery_fee.toLocaleString()}
                          </Text>
                        </HStack>
                      )}
                      <Divider />
                      <HStack justify="space-between">
                        <Text fontWeight="bold" fontSize="lg">
                          ยอดรวมทั้งหมด
                        </Text>
                        <Text fontWeight="bold" fontSize="lg" color="blue.600">
                          ฿{selectedOrder.total.toLocaleString()}
                        </Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDetailClose}>
              ปิด
            </Button>
            <Button colorScheme="blue">พิมพ์ใบสั่ง</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

OrdersPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="จัดการคำสั่งซื้อ">{page}</Layout>;
};

export default withAuth(OrdersPage) as NextPageWithLayout;
