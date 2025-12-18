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
  Spinner,
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
import { Order, OrderStatus, PaymentStatus, CustomerType, ShopType, DeliveryMethod, OrderPriority } from "@shopflow/types";
import { formatCurrency } from "../../lib/sales";
import { useRouter } from "next/router";
import OrderTable from "../../components/orders/OrderTable";
import { useOrders, useOrderStats } from "../../lib/hooks/useOrderManagement";

interface OrderFilters {
  searchTerm?: string;
  status?: OrderStatus;
  dateRange?: string;
  paymentMethod?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

const OrdersPage = () => {
  const [filters, setFilters] = useState<OrderFilters>({
    searchTerm: "",
    status: undefined,
    dateRange: "all",
    paymentMethod: undefined,
    sortBy: "created_at",
    sortOrder: "desc",
  });

  const { data: orders = [], isLoading, refetch } = useOrders({
    search: filters.searchTerm,
    status: filters.status,
    paymentMethod: filters.paymentMethod,
    dateFrom: filters.dateRange === "today" ? new Date().toISOString().split("T")[0] : undefined,
    dateTo: filters.dateRange === "today" ? new Date().toISOString().split("T")[0] : undefined,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  });

  const { data: orderStats, isLoading: statsLoading } = useOrderStats();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
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

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    onOpen();
  };

  const handleViewReceipt = (order: Order) => {
    toast({
      title: "ดูใบเสร็จ",
      description: `กำลังเปิดใบเสร็จ ${order.order_number}`,
      status: "info",
      duration: 2000,
    });
  };

  const handleRefundOrder = (order: Order) => {
    toast({
      title: "คืนเงิน",
      description: `กำลังดำเนินการคืนเงินสำหรับ ${order.order_number}`,
      status: "warning",
      duration: 3000,
    });
  };

  const getStatusColor = (status: OrderStatus) => {
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

  const getStatusText = (status: OrderStatus) => {
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

  const getPaymentMethodText = (paymentMethod: string) => {
    switch (paymentMethod) {
      case "cash":
        return "เงินสด";
      case "card":
        return `บัตรเครดิต/เดบิต`;
      case "e_wallet":
        return "E-wallet";
      case "bank_transfer":
        return "โอนเงิน";
      case "credit":
        return "เครดิต";
      default:
        return "ไม่ทราบ";
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
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
                ออเดอร์ทั้งหมด {statsLoading ? <Spinner size="sm" /> : orderStats?.totalOrders} รายการ
              </Text>
            </VStack>
            <VStack align="end" spacing={2}>
              <HStack spacing={4}>
                <Stat color="white">
                  <StatLabel fontSize="sm">ยอดขายรวม</StatLabel>
                  <StatNumber fontSize="2xl">{statsLoading ? <Spinner size="sm" /> : formatCurrency(orderStats?.totalRevenue || 0)}</StatNumber>
                </Stat>
                <Stat color="white">
                  <StatLabel fontSize="sm">ออเดอร์สำเร็จ</StatLabel>
                  <StatNumber fontSize="2xl">{statsLoading ? <Spinner size="sm" /> : orderStats?.totalOrders}</StatNumber>
                </Stat>
              </HStack>
              <HStack spacing={2}>
                <Icon as={IoTrendingUp} color="yellow.300" />
                <Text fontSize="sm" opacity={0.9}>เฉลี่ย {statsLoading ? <Spinner size="sm" /> : formatCurrency(orderStats?.averageOrderValue || 0)} ต่อออเดอร์</Text>
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
                    <StatNumber fontSize="2xl" fontWeight="bold" color="blue.500">{statsLoading ? <Spinner size="sm" /> : orderStats?.totalOrders}</StatNumber>
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
                    <StatNumber fontSize="2xl" fontWeight="bold" color="green.500">{statsLoading ? <Spinner size="sm" /> : formatCurrency(orderStats?.totalRevenue || 0)}</StatNumber>
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
                    <StatNumber fontSize="2xl" fontWeight="bold" color="purple.500">{statsLoading ? <Spinner size="sm" /> : formatCurrency(orderStats?.averageOrderValue || 0)}</StatNumber>
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
                    <StatNumber fontSize="2xl" fontWeight="bold" color="orange.500">{statsLoading ? <Spinner size="sm" /> : orderStats?.totalOrders}</StatNumber>
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
                  setFilters((prev) => ({ ...prev, status: e.target.value as OrderStatus }))
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
                <option value="e_wallet">E-wallet</option>
                <option value="bank_transfer">โอนเงิน</option>
                <option value="credit">เครดิต</option>
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
                <option value="created_at">วันที่สร้าง</option>
                <option value="order_number">เลขที่คำสั่ง</option>
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
                onClick={() => refetch()}
                isLoading={isLoading}
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
            orders={paginatedOrders as any}
            loading={isLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            onView={handleViewOrder as any}
            onViewReceipt={handleViewReceipt as any}
            onRefund={handleRefundOrder as any}
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
                        {selectedOrder.order_number}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm">วันที่/เวลา:</Text>
                      <Text fontSize="sm">
                        {formatDate(selectedOrder.created_at || "")}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm">พนักงาน:</Text>
                      <Text fontSize="sm">{selectedOrder.created_by || "N/A"}</Text>
                    </HStack>
                    {selectedOrder.customer_name && (
                      <HStack justify="space-between">
                        <Text fontSize="sm">ลูกค้า:</Text>
                        <Text fontSize="sm">{selectedOrder.customer_name}</Text>
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
                     {(selectedOrder.items || []).map((item: any, index: number) => (
                      <HStack key={index} justify="space-between">
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" fontWeight="medium">
                            {item.product_name}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {formatCurrency(item.unit_price)} x {item.quantity}
                          </Text>
                        </VStack>
                        <Text fontSize="sm" fontWeight="medium">
                          {formatCurrency(item.total_price)}
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
                        {formatCurrency(selectedOrder.subtotal)}
                      </Text>
                    </HStack>
                    {selectedOrder.discount_amount > 0 && (
                      <HStack justify="space-between">
                        <Text fontSize="sm">ส่วนลด:</Text>
                        <Text fontSize="sm" color="red.500">
                          -{formatCurrency(selectedOrder.discount_amount)}
                        </Text>
                      </HStack>
                    )}
                    <HStack justify="space-between">
                      <Text fontSize="sm">ภาษี:</Text>
                      <Text fontSize="sm">
                        {formatCurrency(selectedOrder.tax)}
                      </Text>
                    </HStack>
                    <Divider />
                    <HStack justify="space-between">
                      <Text fontSize="md" fontWeight="bold">
                        ยอดสุทธิ:
                      </Text>
                      <Text fontSize="md" fontWeight="bold">
                        {formatCurrency(selectedOrder.total)}
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
                  <VStack spacing={2} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm">วิธีการ:</Text>
                      <Text fontSize="sm">
                        {getPaymentMethodText(selectedOrder.payment_method)}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm">สถานะ:</Text>
                      <Text fontSize="sm">
                        {selectedOrder.payment_status === "paid" ? "ชำระแล้ว" : selectedOrder.payment_status === "pending" ? "รอชำระ" : selectedOrder.payment_status === "refunded" ? "คืนเงิน" : selectedOrder.payment_status}
                      </Text>
                    </HStack>
                  </VStack>
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

// Disable static generation for pages that use React Query
export const getServerSideProps = async () => {
  return {
    props: {},
  };
};
