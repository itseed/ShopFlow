import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Button,
  useToast,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
  useColorModeValue,
  Flex,
  Spacer,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Divider,
  Card,
  CardBody,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  Heading,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import {
  IoSearch,
  IoFilter,
  IoEye,
  IoRefresh,
  IoReceipt,
  IoEllipsisVertical,
  IoCalendar,
  IoDocument,
  IoCard,
  IoTime,
  IoTrendingUp,
  IoStatsChart,
  IoCheckmarkCircle,
  IoWarning,
  IoCash,
  IoPrint,
} from "react-icons/io5";
import { FaChevronDown } from "react-icons/fa";
import {
  POSLayout,
  TouchButton,
  POSCard,
  LoadingSpinner,
} from "../../components";
import { SalesTransaction } from "@shopflow/types";
import { formatCurrency } from "../../lib/sales";
import { useRouter } from "next/router";
import OrderTable from "../../components/orders/OrderTable";

interface OrderFilters {
  searchTerm: string;
  status: string;
  dateRange: string;
  paymentMethod: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<SalesTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<OrderFilters>({
    searchTerm: "",
    status: "all",
    dateRange: "today",
    paymentMethod: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const [selectedOrder, setSelectedOrder] = useState<SalesTransaction | null>(
    null
  );
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalAmount: 0,
    averageOrderValue: 0,
    completedOrders: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const paginatedOrders = orders.slice((currentPage - 1) * perPage, currentPage * perPage);
  const totalPages = Math.ceil(orders.length / perPage);

  const toast = useToast();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Color mode values
  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #2d3748 0%, #1a202c 100%)"
  );
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  useEffect(() => {
    loadOrders();
  }, [filters]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      // Simulate API call with mock data
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockOrders: SalesTransaction[] = [
        {
          id: "tx_001",
          transactionNumber: "TXN-2024-001",
          cart: {
            id: "cart_001",
            items: [
              {
                id: "item_001",
                product: {
                  id: "prod_001",
                  name: "กาแฟอเมริกาโน่",
                  description: "กาแฟอเมริกาโน่ เข้มข้น",
                  price: 45,
                  barcode: "1234567890001",
                  category: "เครื่องดื่ม",
                  stock: 50,
                  isActive: true,
                  taxRate: 0.07,
                  discountEligible: true,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
                quantity: 2,
                unitPrice: 45,
                discountAmount: 0,
                discountPercentage: 0,
                taxAmount: 6.3,
                subtotal: 90,
                total: 90,
              },
            ],
            subtotal: 90,
            discountAmount: 0,
            taxAmount: 6.3,
            total: 96.3,
            itemCount: 2,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          payments: [
            {
              id: "pay_001",
              type: "cash",
              amount: 96.3,
              received: 100,
              change: 3.7,
              status: "completed",
              createdAt: new Date(),
            },
          ],
          customer: {
            id: "cust_001",
            name: "คุณสมชาย",
            phone: "081-234-5678",
          },
          cashier: {
            id: "cashier_001",
            name: "พนักงานเก็บเงิน",
            username: "cashier01",
          },
          branch: {
            id: "branch_001",
            name: "สาขาหลัก",
          },
          status: "completed",
          receipt: {
            printed: true,
            emailSent: false,
            receiptNumber: "R20241201001",
          },
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          id: "tx_002",
          transactionNumber: "TXN-2024-002",
          cart: {
            id: "cart_002",
            items: [
              {
                id: "item_002",
                product: {
                  id: "prod_002",
                  name: "ข้าวผัดกุ้ง",
                  description: "ข้าวผัดกุ้งสด",
                  price: 120,
                  barcode: "1234567890002",
                  category: "อาหาร",
                  stock: 20,
                  isActive: true,
                  taxRate: 0.07,
                  discountEligible: true,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
                quantity: 1,
                unitPrice: 120,
                discountAmount: 10,
                discountPercentage: 0,
                taxAmount: 7.7,
                subtotal: 120,
                total: 110,
              },
            ],
            subtotal: 120,
            discountAmount: 10,
            taxAmount: 7.7,
            total: 117.7,
            itemCount: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          payments: [
            {
              id: "pay_002",
              type: "card",
              amount: 117.7,
              cardType: "visa",
              cardLastFour: "1234",
              status: "completed",
              createdAt: new Date(),
            },
          ],
          cashier: {
            id: "cashier_001",
            name: "พนักงานเก็บเงิน",
            username: "cashier01",
          },
          branch: {
            id: "branch_001",
            name: "สาขาหลัก",
          },
          status: "completed",
          receipt: {
            printed: true,
            emailSent: false,
            receiptNumber: "R20241201002",
          },
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          completedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        },
        {
          id: "tx_003",
          transactionNumber: "TXN-2024-003",
          cart: {
            id: "cart_003",
            items: [
              {
                id: "item_003",
                product: {
                  id: "prod_003",
                  name: "น้ำส้มคั้น",
                  description: "น้ำส้มคั้นสด",
                  price: 35,
                  barcode: "1234567890003",
                  category: "เครื่องดื่ม",
                  stock: 30,
                  isActive: true,
                  taxRate: 0.07,
                  discountEligible: true,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
                quantity: 3,
                unitPrice: 35,
                discountAmount: 0,
                discountPercentage: 0,
                taxAmount: 7.35,
                subtotal: 105,
                total: 105,
              },
            ],
            subtotal: 105,
            discountAmount: 0,
            taxAmount: 7.35,
            total: 112.35,
            itemCount: 3,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          payments: [
            {
              id: "pay_003",
              type: "digital",
              amount: 112.35,
              status: "completed",
              createdAt: new Date(),
            },
          ],
          cashier: {
            id: "cashier_002",
            name: "พนักงานเก็บเงิน 2",
            username: "cashier02",
          },
          branch: {
            id: "branch_001",
            name: "สาขาหลัก",
          },
          status: "pending",
          receipt: {
            printed: false,
            emailSent: false,
            receiptNumber: "R20241201003",
          },
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        },
      ];

      setOrders(mockOrders);
      
      // Calculate stats
      const totalAmount = mockOrders.reduce((sum, order) => sum + order.cart.total, 0);
      const completedOrders = mockOrders.filter(order => order.status === "completed").length;
      
      setStats({
        totalOrders: mockOrders.length,
        totalAmount,
        averageOrderValue: mockOrders.length > 0 ? totalAmount / mockOrders.length : 0,
        completedOrders,
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลออเดอร์ได้",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = (order: SalesTransaction) => {
    setSelectedOrder(order);
    onOpen();
  };

  const handleViewReceipt = (order: SalesTransaction) => {
    toast({
      title: "ดูใบเสร็จ",
      description: `กำลังเปิดใบเสร็จ ${order.receipt?.receiptNumber}`,
      status: "info",
      duration: 2000,
    });
  };

  const handleRefundOrder = (order: SalesTransaction) => {
    toast({
      title: "คืนเงิน",
      description: `กำลังดำเนินการคืนเงินสำหรับ ${order.transactionNumber}`,
      status: "warning",
      duration: 3000,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "green";
      case "pending":
        return "yellow";
      case "cancelled":
        return "red";
      case "refunded":
        return "orange";
      default:
        return "gray";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "สำเร็จ";
      case "pending":
        return "รอดำเนินการ";
      case "cancelled":
        return "ยกเลิก";
      case "refunded":
        return "คืนเงิน";
      default:
        return "ไม่ทราบสถานะ";
    }
  };

  const getPaymentMethodText = (payment: any) => {
    switch (payment.type) {
      case "cash":
        return "เงินสด";
      case "card":
        return `บัตร${payment.cardType || ""} (${payment.cardLastFour || ""})`;
      case "qr":
        return "QR Payment";
      default:
        return "ไม่ทราบ";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <POSLayout>
      <VStack spacing={6} align="stretch" h="full" p={{ base: 2, md: 4 }}>
        {/* Header with Stats */}
        <Box
          bgGradient={bgGradient}
          borderRadius="2xl"
          p={6}
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
            <VStack align="start" spacing={2}>
              <Heading size="lg" fontWeight="bold">
                📋 ประวัติการสั่งซื้อ
              </Heading>
              <Text fontSize="lg" opacity={0.9}>
                ออเดอร์ทั้งหมด {stats.totalOrders} รายการ
              </Text>
            </VStack>
            <VStack align="end" spacing={2}>
              <HStack spacing={4}>
                <Stat color="white">
                  <StatLabel fontSize="sm">ยอดขายรวม</StatLabel>
                  <StatNumber fontSize="2xl">{formatCurrency(stats.totalAmount)}</StatNumber>
                </Stat>
                <Stat color="white">
                  <StatLabel fontSize="sm">ออเดอร์สำเร็จ</StatLabel>
                  <StatNumber fontSize="2xl">{stats.completedOrders}</StatNumber>
                </Stat>
              </HStack>
              <HStack spacing={2}>
                <Icon as={IoTrendingUp} color="yellow.300" />
                <Text fontSize="sm" opacity={0.9}>เฉลี่ย {formatCurrency(stats.averageOrderValue)} ต่อออเดอร์</Text>
              </HStack>
            </VStack>
          </Flex>
        </Box>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Card variant="elevated" bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <HStack spacing={3}>
                <Box
                  p={3}
                  borderRadius="lg"
                  bgGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  color="white"
                >
                  <Icon as={IoDocument} boxSize={6} />
                </Box>
                <VStack align="start" spacing={1}>
                  <Stat>
                    <StatLabel fontSize="sm" color="gray.600">ออเดอร์ทั้งหมด</StatLabel>
                    <StatNumber fontSize="2xl" fontWeight="bold" color="blue.500">{stats.totalOrders}</StatNumber>
                  </Stat>
                </VStack>
              </HStack>
            </CardBody>
          </Card>

          <Card variant="elevated" bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <HStack spacing={3}>
                <Box
                  p={3}
                  borderRadius="lg"
                  bgGradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                  color="white"
                >
                  <Icon as={IoCheckmarkCircle} boxSize={6} />
                </Box>
                <VStack align="start" spacing={1}>
                  <Stat>
                    <StatLabel fontSize="sm" color="gray.600">ยอดขายรวม</StatLabel>
                    <StatNumber fontSize="2xl" fontWeight="bold" color="green.500">{formatCurrency(stats.totalAmount)}</StatNumber>
                  </Stat>
                </VStack>
              </HStack>
            </CardBody>
          </Card>

          <Card variant="elevated" bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <HStack spacing={3}>
                <Box
                  p={3}
                  borderRadius="lg"
                  bgGradient="linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"
                  color="white"
                >
                  <Icon as={IoStatsChart} boxSize={6} />
                </Box>
                <VStack align="start" spacing={1}>
                  <Stat>
                    <StatLabel fontSize="sm" color="gray.600">เฉลี่ยต่อออเดอร์</StatLabel>
                    <StatNumber fontSize="2xl" fontWeight="bold" color="purple.500">{formatCurrency(stats.averageOrderValue)}</StatNumber>
                  </Stat>
                </VStack>
              </HStack>
            </CardBody>
          </Card>

          <Card variant="elevated" bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <HStack spacing={3}>
                <Box
                  p={3}
                  borderRadius="lg"
                  bgGradient="linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
                  color="white"
                >
                  <Icon as={IoCheckmarkCircle} boxSize={6} />
                </Box>
                <VStack align="start" spacing={1}>
                  <Stat>
                    <StatLabel fontSize="sm" color="gray.600">ออเดอร์สำเร็จ</StatLabel>
                    <StatNumber fontSize="2xl" fontWeight="bold" color="orange.500">{stats.completedOrders}</StatNumber>
                  </Stat>
                </VStack>
              </HStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Filters */}
        <POSCard variant="elevated" bg={cardBg} borderColor={borderColor}>
          <VStack spacing={4}>
            <HStack w="full" spacing={4}>
              <InputGroup flex={2}>
                <InputLeftElement>
                  <Icon as={IoSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="ค้นหาด้วยเลขที่คำสั่ง, ชื่อลูกค้า, หรือเลขใบเสร็จ"
                  value={filters.searchTerm}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      searchTerm: e.target.value,
                    }))
                  }
                  size="lg"
                  borderRadius="xl"
                />
              </InputGroup>

              <Select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
                w="200px"
                size="lg"
                borderRadius="xl"
              >
                <option value="all">สถานะทั้งหมด</option>
                <option value="completed">สำเร็จ</option>
                <option value="pending">รอดำเนินการ</option>
                <option value="cancelled">ยกเลิก</option>
                <option value="refunded">คืนเงิน</option>
              </Select>

              <Select
                value={filters.dateRange}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, dateRange: e.target.value }))
                }
                w="200px"
                size="lg"
                borderRadius="xl"
              >
                <option value="today">วันนี้</option>
                <option value="yesterday">เมื่อวาน</option>
                <option value="week">สัปดาห์นี้</option>
                <option value="month">เดือนนี้</option>
                <option value="all">ทั้งหมด</option>
              </Select>
            </HStack>

            <HStack spacing={4} w="full">
              <Select
                value={filters.paymentMethod}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    paymentMethod: e.target.value,
                  }))
                }
                w="200px"
                size="lg"
                borderRadius="xl"
              >
                <option value="all">วิธีชำระทั้งหมด</option>
                <option value="cash">เงินสด</option>
                <option value="card">บัตรเครดิต/เดบิต</option>
                <option value="digital">ชำระดิจิทัล</option>
              </Select>

              <Select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, sortBy: e.target.value }))
                }
                w="200px"
                size="lg"
                borderRadius="xl"
              >
                <option value="createdAt">วันที่สร้าง</option>
                <option value="transactionNumber">เลขที่คำสั่ง</option>
                <option value="total">ยอดรวม</option>
              </Select>

              <Select
                value={filters.sortOrder}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    sortOrder: e.target.value as "asc" | "desc",
                  }))
                }
                w="150px"
                size="lg"
                borderRadius="xl"
              >
                <option value="desc">ใหม่ไปเก่า</option>
                <option value="asc">เก่าไปใหม่</option>
              </Select>

              <TouchButton
                leftIcon={<IoRefresh />}
                onClick={loadOrders}
                isLoading={loading}
                variant="secondary"
                size="lg"
                borderRadius="xl"
              >
                รีเฟรช
              </TouchButton>
            </HStack>

            <HStack justify="space-between" w="full">
              <Text fontSize="sm" color="gray.600">
                แสดง {paginatedOrders.length} จาก {orders.length} รายการ
              </Text>
              <HStack spacing={2}>
                <Badge colorScheme="blue" fontSize="sm">
                  หน้า {currentPage} จาก {totalPages}
                </Badge>
              </HStack>
            </HStack>
          </VStack>
        </POSCard>

        {/* Orders Table */}
        <POSCard variant="elevated" bg={cardBg} borderColor={borderColor}>
          <OrderTable
            orders={paginatedOrders}
            loading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onView={handleViewOrder}
            onViewReceipt={handleViewReceipt}
            onRefund={handleRefundOrder}
            filters={filters}
            onFilterChange={setFilters}
          />
        </POSCard>
      </VStack>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Modal isOpen={isOpen} onClose={onClose} size={{ base: 'md', md: 'lg' }}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack justify="space-between">
                <Text>รายละเอียดคำสั่งซื้อ</Text>
                <Badge colorScheme={getStatusColor(selectedOrder.status)}>
                  {getStatusText(selectedOrder.status)}
                </Badge>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                {/* Order Info */}
                <Box>
                  <Text fontSize="md" fontWeight="medium" mb={2}>
                    ข้อมูลคำสั่งซื้อ
                  </Text>
                  <VStack spacing={2} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm">เลขที่คำสั่ง:</Text>
                      <Text fontSize="sm" fontWeight="medium">
                        {selectedOrder.transactionNumber}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm">วันที่/เวลา:</Text>
                      <Text fontSize="sm">
                        {formatDate(selectedOrder.createdAt)}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm">พนักงาน:</Text>
                      <Text fontSize="sm">{selectedOrder.cashier.name}</Text>
                    </HStack>
                    {selectedOrder.customer && (
                      <HStack justify="space-between">
                        <Text fontSize="sm">ลูกค้า:</Text>
                        <Text fontSize="sm">{selectedOrder.customer.name}</Text>
                      </HStack>
                    )}
                  </VStack>
                </Box>

                <Divider />

                {/* Items */}
                <Box>
                  <Text fontSize="md" fontWeight="medium" mb={2}>
                    รายการสินค้า
                  </Text>
                  <VStack spacing={2} align="stretch">
                    {selectedOrder.cart.items.map((item, index) => (
                      <HStack key={index} justify="space-between">
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" fontWeight="medium">
                            {item.product.name}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {formatCurrency(item.unitPrice)} x {item.quantity}
                          </Text>
                        </VStack>
                        <Text fontSize="sm" fontWeight="medium">
                          {formatCurrency(item.total)}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>

                <Divider />

                {/* Summary */}
                <Box>
                  <Text fontSize="md" fontWeight="medium" mb={2}>
                    สรุปการชำระเงิน
                  </Text>
                  <VStack spacing={2} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm">ยอดรวม:</Text>
                      <Text fontSize="sm">
                        {formatCurrency(selectedOrder.cart.subtotal)}
                      </Text>
                    </HStack>
                    {selectedOrder.cart.discountAmount > 0 && (
                      <HStack justify="space-between">
                        <Text fontSize="sm">ส่วนลด:</Text>
                        <Text fontSize="sm" color="red.500">
                          -{formatCurrency(selectedOrder.cart.discountAmount)}
                        </Text>
                      </HStack>
                    )}
                    <HStack justify="space-between">
                      <Text fontSize="sm">ภาษี:</Text>
                      <Text fontSize="sm">
                        {formatCurrency(selectedOrder.cart.taxAmount)}
                      </Text>
                    </HStack>
                    <Divider />
                    <HStack justify="space-between">
                      <Text fontSize="md" fontWeight="bold">
                        ยอดสุทธิ:
                      </Text>
                      <Text fontSize="md" fontWeight="bold">
                        {formatCurrency(selectedOrder.cart.total)}
                      </Text>
                    </HStack>
                  </VStack>
                </Box>

                <Divider />

                {/* Payment Info */}
                <Box>
                  <Text fontSize="md" fontWeight="medium" mb={2}>
                    วิธีการชำระเงิน
                  </Text>
                  {selectedOrder.payments.map((payment, index) => (
                    <VStack key={index} spacing={2} align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="sm">วิธีการ:</Text>
                        <Text fontSize="sm">
                          {getPaymentMethodText(payment)}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm">จำนวน:</Text>
                        <Text fontSize="sm">
                          {formatCurrency(payment.amount)}
                        </Text>
                      </HStack>
                      {payment.type === "cash" && payment.received && (
                        <>
                          <HStack justify="space-between">
                            <Text fontSize="sm">เงินที่รับ:</Text>
                            <Text fontSize="sm">
                              {formatCurrency(payment.received)}
                            </Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text fontSize="sm">เงินทอน:</Text>
                            <Text fontSize="sm">
                              {formatCurrency(payment.change || 0)}
                            </Text>
                          </HStack>
                        </>
                      )}
                    </VStack>
                  ))}
                </Box>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <HStack spacing={3}>
                <TouchButton
                  leftIcon={<IoReceipt />}
                  variant="primary"
                  onClick={() => handleViewReceipt(selectedOrder)}
                  bgGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  _hover={{
                    transform: "translateY(-1px)",
                    boxShadow: "lg",
                  }}
                  color="white"
                >
                  ดูใบเสร็จ
                </TouchButton>
                <Button onClick={onClose}>ปิด</Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </POSLayout>
  );
};

export default OrdersPage;
