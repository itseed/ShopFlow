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

  const toast = useToast();
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();

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
            emailSent: true,
            receiptNumber: "R20241201002",
          },
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
          completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        },
      ];

      // Apply filters
      let filteredOrders = [...mockOrders];

      if (filters.searchTerm) {
        filteredOrders = filteredOrders.filter(
          (order) =>
            order.transactionNumber
              .toLowerCase()
              .includes(filters.searchTerm.toLowerCase()) ||
            order.customer?.name
              .toLowerCase()
              .includes(filters.searchTerm.toLowerCase()) ||
            order.receipt?.receiptNumber
              .toLowerCase()
              .includes(filters.searchTerm.toLowerCase())
        );
      }

      if (filters.status !== "all") {
        filteredOrders = filteredOrders.filter(
          (order) => order.status === filters.status
        );
      }

      // Sort orders
      filteredOrders.sort((a, b) => {
        const aValue = a[filters.sortBy as keyof SalesTransaction];
        const bValue = b[filters.sortBy as keyof SalesTransaction];

        if (filters.sortOrder === "asc") {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });

      setOrders(filteredOrders);

      // Calculate stats
      const totalOrders = filteredOrders.length;
      const totalAmount = filteredOrders.reduce(
        (sum, order) => sum + order.cart.total,
        0
      );
      const completedOrders = filteredOrders.filter(
        (order) => order.status === "completed"
      ).length;
      const averageOrderValue = totalOrders > 0 ? totalAmount / totalOrders : 0;

      setStats({
        totalOrders,
        totalAmount,
        averageOrderValue,
        completedOrders,
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้",
        status: "error",
        duration: 3000,
        isClosable: true,
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
    // Navigate to receipt view
    router.push(`/orders/${order.id}/receipt`);
  };

  const handleRefundOrder = (order: SalesTransaction) => {
    // Navigate to refund page
    router.push(`/orders/${order.id}/refund`);
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
        return "purple";
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
        return status;
    }
  };

  const getPaymentMethodText = (payment: any) => {
    switch (payment.type) {
      case "cash":
        return "เงินสด";
      case "card":
        return "บัตรเครดิต/เดบิต";
      case "digital":
        return "ชำระดิจิทัล";
      default:
        return payment.type;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <POSLayout title="ประวัติการสั่งซื้อ">
      <VStack spacing={6} align="stretch">
        {/* Header with Stats */}
        <Box>
          <HStack justify="space-between" align="center" mb={4}>
            <Text fontSize="2xl" fontWeight="bold">
              ประวัติการสั่งซื้อ
            </Text>
            <TouchButton
              leftIcon={<IoRefresh />}
              onClick={loadOrders}
              isLoading={loading}
              variant="outline"
            >
              รีเฟรช
            </TouchButton>
          </HStack>

          {/* Stats Cards */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>คำสั่งซื้อทั้งหมด</StatLabel>
                  <StatNumber color="blue.500">{stats.totalOrders}</StatNumber>
                  <StatHelpText>รายการ</StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>ยอดขายรวม</StatLabel>
                  <StatNumber color="green.500">
                    {formatCurrency(stats.totalAmount)}
                  </StatNumber>
                  <StatHelpText>บาท</StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>ค่าเฉลี่ยต่อคำสั่ง</StatLabel>
                  <StatNumber color="purple.500">
                    {formatCurrency(stats.averageOrderValue)}
                  </StatNumber>
                  <StatHelpText>บาท</StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>คำสั่งที่สำเร็จ</StatLabel>
                  <StatNumber color="orange.500">
                    {stats.completedOrders}
                  </StatNumber>
                  <StatHelpText>รายการ</StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>
        </Box>

        {/* Filters */}
        <POSCard p={4}>
          <VStack spacing={4}>
            <HStack spacing={4} w="full">
              <InputGroup flex={2}>
                <InputLeftElement>
                  <IoSearch />
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
                />
              </InputGroup>

              <Select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
                w="200px"
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
              >
                <option value="desc">ใหม่ไปเก่า</option>
                <option value="asc">เก่าไปใหม่</option>
              </Select>
            </HStack>
          </VStack>
        </POSCard>

        {/* Orders Table */}
        <POSCard>
          {loading ? (
            <Box py={10}>
              <LoadingSpinner />
            </Box>
          ) : (
            <TableContainer>
              <Table variant="simple" size="md">
                <Thead>
                  <Tr>
                    <Th>เลขที่คำสั่ง</Th>
                    <Th>วันที่/เวลา</Th>
                    <Th>ลูกค้า</Th>
                    <Th>รายการ</Th>
                    <Th>วิธีชำระ</Th>
                    <Th>ยอดรวม</Th>
                    <Th>สถานะ</Th>
                    <Th>จัดการ</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {orders.map((order) => (
                    <Tr key={order.id} _hover={{ bg: hoverBg }}>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">
                            {order.transactionNumber}
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            {order.receipt?.receiptNumber}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm">
                            {formatDate(order.createdAt)}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {order.cashier.name}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm">
                          {order.customer?.name || "ไม่ระบุ"}
                        </Text>
                        {order.customer?.phone && (
                          <Text fontSize="xs" color="gray.500">
                            {order.customer.phone}
                          </Text>
                        )}
                      </Td>
                      <Td>
                        <Text fontSize="sm">{order.cart.itemCount} รายการ</Text>
                      </Td>
                      <Td>
                        <Text fontSize="sm">
                          {getPaymentMethodText(order.payments[0])}
                        </Text>
                      </Td>
                      <Td>
                        <Text fontSize="sm" fontWeight="medium">
                          {formatCurrency(order.cart.total)}
                        </Text>
                      </Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                      </Td>
                      <Td>
                        <Menu>
                          <MenuButton
                            as={IconButton}
                            icon={<IoEllipsisVertical />}
                            variant="ghost"
                            size="sm"
                          />
                          <MenuList>
                            <MenuItem
                              icon={<IoEye />}
                              onClick={() => handleViewOrder(order)}
                            >
                              ดูรายละเอียด
                            </MenuItem>
                            <MenuItem
                              icon={<IoReceipt />}
                              onClick={() => handleViewReceipt(order)}
                            >
                              ดูใบเสร็จ
                            </MenuItem>
                            {order.status === "completed" && (
                              <MenuItem
                                icon={<IoRefresh />}
                                onClick={() => handleRefundOrder(order)}
                              >
                                คืนเงิน
                              </MenuItem>
                            )}
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          )}

          {!loading && orders.length === 0 && (
            <Box textAlign="center" py={10}>
              <Text color="gray.500">ไม่พบคำสั่งซื้อที่ตรงกับเงื่อนไข</Text>
            </Box>
          )}
        </POSCard>
      </VStack>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
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
                <Button
                  leftIcon={<IoReceipt />}
                  colorScheme="blue"
                  variant="outline"
                  onClick={() => handleViewReceipt(selectedOrder)}
                >
                  ดูใบเสร็จ
                </Button>
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
