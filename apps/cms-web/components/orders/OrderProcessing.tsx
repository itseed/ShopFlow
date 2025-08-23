import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
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
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Flex,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Divider,
} from "@chakra-ui/react";
import {
  FiEye,
  FiEdit3,
  FiTrash2,
  FiMoreHorizontal,
  FiClock,
  FiCheck,
  FiX,
  FiPackage,
  FiRefreshCw,
  FiPrinter,
  FiFilter,
} from "react-icons/fi";
import {
  useOrders,
  useOrderSummary,
  usePendingOrders,
  useUpdateOrder,
  useCancelOrder,
  useProcessOrder,
  useCompleteOrder,
  useBulkUpdateOrders,
  type EnhancedOrderFilters,
} from "../../lib/hooks/useOrderManagement";
import { PermissionGuard } from "../auth/PermissionGuard";

interface OrderProcessingProps {
  initialFilters?: EnhancedOrderFilters;
}

export default function OrderProcessing({
  initialFilters = {},
}: OrderProcessingProps) {
  const [filters, setFilters] = useState<EnhancedOrderFilters>(initialFilters);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [bulkAction, setBulkAction] = useState<string>("");

  const {
    isOpen: isDetailOpen,
    onOpen: onDetailOpen,
    onClose: onDetailClose,
  } = useDisclosure();
  const {
    isOpen: isBulkOpen,
    onOpen: onBulkOpen,
    onClose: onBulkClose,
  } = useDisclosure();

  const toast = useToast();

  // Data hooks
  const { data: orders = [], isLoading, refetch } = useOrders(filters);
  const { data: orderSummary } = useOrderSummary();
  const { data: pendingOrders = [] } = usePendingOrders();

  // Mutation hooks
  const updateOrder = useUpdateOrder();
  const cancelOrder = useCancelOrder();
  const processOrder = useProcessOrder();
  const completeOrder = useCompleteOrder();
  const bulkUpdate = useBulkUpdateOrders();

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "orange";
      case "processing":
        return "blue";
      case "completed":
        return "green";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  // Status text mapping
  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "รอดำเนินการ";
      case "processing":
        return "กำลังดำเนินการ";
      case "completed":
        return "เสร็จสิ้น";
      case "cancelled":
        return "ยกเลิก";
      default:
        return status;
    }
  };

  // Payment method text mapping
  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case "cash":
        return "เงินสด";
      case "card":
        return "บัตรเครดิต";
      case "bank_transfer":
        return "โอนเงิน";
      case "e_wallet":
        return "กระเป๋าเงินอิเล็กทรอนิกส์";
      default:
        return method;
    }
  };

  // Handle order detail view
  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    onDetailOpen();
  };

  // Handle status change
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrder.mutateAsync({
        orderId,
        updateData: { status: newStatus as any },
      });
    } catch (error) {
      console.error("Failed to update order status:", error);
    }
  };

  // Handle quick actions
  const handleQuickAction = async (orderId: string, action: string) => {
    try {
      switch (action) {
        case "process":
          await processOrder.mutateAsync(orderId);
          break;
        case "complete":
          await completeOrder.mutateAsync(orderId);
          break;
        case "cancel":
          await cancelOrder.mutateAsync(orderId);
          break;
      }
    } catch (error) {
      console.error("Failed to perform quick action:", error);
    }
  };

  // Handle bulk operations
  const handleBulkAction = async () => {
    if (!bulkAction || selectedOrders.length === 0) return;

    try {
      await bulkUpdate.mutateAsync({
        orderIds: selectedOrders,
        updateData: { status: bulkAction as any },
      });
      setSelectedOrders([]);
      setBulkAction("");
      onBulkClose();
    } catch (error) {
      console.error("Failed to perform bulk action:", error);
    }
  };

  // Toggle order selection
  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  // Select all orders
  const selectAllOrders = () => {
    setSelectedOrders(orders.map((order) => order.id));
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedOrders([]);
  };

  return (
    <Box>
      {/* Order Summary Stats */}
      {orderSummary && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>คำสั่งซื้อวันนี้</StatLabel>
                <StatNumber>{orderSummary.todayOrders}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  ยอดขายวันนี้: ฿{orderSummary.todayRevenue.toLocaleString()}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>รอดำเนินการ</StatLabel>
                <StatNumber color="orange.500">
                  {orderSummary.pendingOrders}
                </StatNumber>
                <StatHelpText>คำสั่งซื้อที่ต้องดำเนินการ</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>ยอดขายรวม</StatLabel>
                <StatNumber>
                  ฿{orderSummary.totalRevenue.toLocaleString()}
                </StatNumber>
                <StatHelpText>
                  จากคำสั่งซื้อ {orderSummary.totalOrders} รายการ
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <Stat>
                <StatLabel>ค่าเฉลี่ยต่อออเดอร์</StatLabel>
                <StatNumber>
                  ฿{orderSummary.averageOrderValue.toLocaleString()}
                </StatNumber>
                <StatHelpText>
                  วิธีการชำระหลัก: {orderSummary.topPaymentMethod}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>
      )}

      {/* Filters and Actions */}
      <Card mb={6}>
        <CardHeader>
          <HStack justify="space-between">
            <Heading size="md">จัดการคำสั่งซื้อ</Heading>
            <HStack>
              <Button
                leftIcon={<FiRefreshCw />}
                onClick={() => refetch()}
                size="sm"
              >
                รีเฟรช
              </Button>
              <PermissionGuard permission="orders.edit">
                <Button
                  leftIcon={<FiFilter />}
                  variant="outline"
                  size="sm"
                  onClick={onBulkOpen}
                  isDisabled={selectedOrders.length === 0}
                >
                  จัดการแบบกลุ่ม ({selectedOrders.length})
                </Button>
              </PermissionGuard>
            </HStack>
          </HStack>
        </CardHeader>

        <CardBody>
          <HStack spacing={4} mb={4}>
            <FormControl maxW="200px">
              <FormLabel size="sm">สถานะ</FormLabel>
              <Select
                size="sm"
                value={filters.status || ""}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value as any })
                }
              >
                <option value="">ทั้งหมด</option>
                <option value="pending">รอดำเนินการ</option>
                <option value="processing">กำลังดำเนินการ</option>
                <option value="completed">เสร็จสิ้น</option>
                <option value="cancelled">ยกเลิก</option>
              </Select>
            </FormControl>

            <FormControl maxW="200px">
              <FormLabel size="sm">วิธีการชำระ</FormLabel>
              <Select
                size="sm"
                value={filters.paymentMethod || ""}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    paymentMethod: e.target.value as any,
                  })
                }
              >
                <option value="">ทั้งหมด</option>
                <option value="cash">เงินสด</option>
                <option value="card">บัตรเครดิต</option>
                <option value="bank_transfer">โอนเงิน</option>
                <option value="e_wallet">กระเป๋าเงินอิเล็กทรอนิกส์</option>
              </Select>
            </FormControl>

            <FormControl maxW="150px">
              <FormLabel size="sm">ช่วงเวลา</FormLabel>
              <Select
                size="sm"
                onChange={(e) => {
                  const value = e.target.value;
                  setFilters({
                    ...filters,
                    today: value === "today",
                    thisWeek: value === "week",
                    thisMonth: value === "month",
                  });
                }}
              >
                <option value="">ทั้งหมด</option>
                <option value="today">วันนี้</option>
                <option value="week">สัปดาห์นี้</option>
                <option value="month">เดือนนี้</option>
              </Select>
            </FormControl>
          </HStack>

          {selectedOrders.length > 0 && (
            <Alert status="info" borderRadius="md" mb={4}>
              <AlertIcon />
              <Box>
                <Text fontWeight="medium">
                  เลือกแล้ว {selectedOrders.length} รายการ
                </Text>
                <HStack spacing={2} mt={2}>
                  <Button size="xs" onClick={clearSelection}>
                    ยกเลิกการเลือก
                  </Button>
                  <Button size="xs" onClick={selectAllOrders}>
                    เลือกทั้งหมด
                  </Button>
                </HStack>
              </Box>
            </Alert>
          )}
        </CardBody>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardBody>
          {isLoading ? (
            <Flex justify="center" py={8}>
              <Spinner size="lg" />
            </Flex>
          ) : orders.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Text color="gray.500">ไม่พบคำสั่งซื้อ</Text>
            </Box>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>
                    <input
                      type="checkbox"
                      checked={
                        selectedOrders.length === orders.length &&
                        orders.length > 0
                      }
                      onChange={() => {
                        if (selectedOrders.length === orders.length) {
                          clearSelection();
                        } else {
                          selectAllOrders();
                        }
                      }}
                    />
                  </Th>
                  <Th>เลขที่ออเดอร์</Th>
                  <Th>ลูกค้า</Th>
                  <Th>ยอดรวม</Th>
                  <Th>การชำระเงิน</Th>
                  <Th>สถานะ</Th>
                  <Th>วันที่สั่ง</Th>
                  <Th>การจัดการ</Th>
                </Tr>
              </Thead>
              <Tbody>
                {orders.map((order) => (
                  <Tr key={order.id}>
                    <Td>
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => toggleOrderSelection(order.id)}
                      />
                    </Td>
                    <Td>
                      <Text fontWeight="medium">{order.order_number}</Text>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={0}>
                        <Text>{order.customer_name || "ลูกค้าทั่วไป"}</Text>
                        {order.customer_phone && (
                          <Text fontSize="sm" color="gray.500">
                            {order.customer_phone}
                          </Text>
                        )}
                      </VStack>
                    </Td>
                    <Td>
                      <Text fontWeight="medium">
                        ฿{order.total.toLocaleString()}
                      </Text>
                    </Td>
                    <Td>{getPaymentMethodText(order.payment_method)}</Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </Td>
                    <Td>
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString("th-TH")
                        : "-"}
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <IconButton
                          icon={<FiEye />}
                          size="sm"
                          variant="ghost"
                          aria-label="ดูรายละเอียด"
                          onClick={() => handleViewOrder(order)}
                        />

                        <PermissionGuard permission="orders.edit">
                          <Menu>
                            <MenuButton
                              as={IconButton}
                              icon={<FiMoreHorizontal />}
                              size="sm"
                              variant="ghost"
                              aria-label="เมนูเพิ่มเติม"
                            />
                            <MenuList>
                              {order.status === "pending" && (
                                <MenuItem
                                  icon={<FiClock />}
                                  onClick={() =>
                                    handleQuickAction(order.id, "process")
                                  }
                                >
                                  เริ่มดำเนินการ
                                </MenuItem>
                              )}
                              {order.status === "processing" && (
                                <MenuItem
                                  icon={<FiCheck />}
                                  onClick={() =>
                                    handleQuickAction(order.id, "complete")
                                  }
                                >
                                  ทำเสร็จแล้ว
                                </MenuItem>
                              )}
                              {order.status !== "cancelled" &&
                                order.status !== "completed" && (
                                  <MenuItem
                                    icon={<FiX />}
                                    onClick={() =>
                                      handleQuickAction(order.id, "cancel")
                                    }
                                    color="red.500"
                                  >
                                    ยกเลิกออเดอร์
                                  </MenuItem>
                                )}
                              <MenuItem icon={<FiPrinter />}>
                                พิมพ์ใบเสร็จ
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </PermissionGuard>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Order Detail Modal */}
      <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            รายละเอียดคำสั่งซื้อ {selectedOrder?.order_number}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedOrder && (
              <VStack align="stretch" spacing={4}>
                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontWeight="medium" mb={2}>
                      ข้อมูลลูกค้า
                    </Text>
                    <Text>
                      ชื่อ: {selectedOrder.customer_name || "ลูกค้าทั่วไป"}
                    </Text>
                    {selectedOrder.customer_phone && (
                      <Text>โทร: {selectedOrder.customer_phone}</Text>
                    )}
                  </Box>
                  <Box>
                    <Text fontWeight="medium" mb={2}>
                      ข้อมูลออเดอร์
                    </Text>
                    <Text>
                      สถานะ:{" "}
                      <Badge colorScheme={getStatusColor(selectedOrder.status)}>
                        {getStatusText(selectedOrder.status)}
                      </Badge>
                    </Text>
                    <Text>
                      การชำระเงิน:{" "}
                      {getPaymentMethodText(selectedOrder.payment_method)}
                    </Text>
                    <Text>
                      วันที่:{" "}
                      {selectedOrder.created_at
                        ? new Date(selectedOrder.created_at).toLocaleDateString(
                            "th-TH"
                          )
                        : "-"}
                    </Text>
                  </Box>
                </SimpleGrid>

                <Divider />

                <Box>
                  <Text fontWeight="medium" mb={3}>
                    รายการสินค้า
                  </Text>
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>สินค้า</Th>
                        <Th isNumeric>จำนวน</Th>
                        <Th isNumeric>ราคา</Th>
                        <Th isNumeric>รวม</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {selectedOrder.items?.map((item: any, index: number) => (
                        <Tr key={index}>
                          <Td>{item.product_name}</Td>
                          <Td isNumeric>{item.quantity}</Td>
                          <Td isNumeric>฿{item.unit_price.toLocaleString()}</Td>
                          <Td isNumeric>
                            ฿{item.total_price.toLocaleString()}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>

                <Divider />

                <HStack justify="space-between">
                  <Text>ยอดรวม:</Text>
                  <Text fontWeight="bold" fontSize="lg">
                    ฿{selectedOrder.total.toLocaleString()}
                  </Text>
                </HStack>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onDetailClose}>ปิด</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Bulk Action Modal */}
      <Modal isOpen={isBulkOpen} onClose={onBulkClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>จัดการคำสั่งซื้อแบบกลุ่ม</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <Text>เลือกแล้ว {selectedOrders.length} รายการ</Text>

              <FormControl>
                <FormLabel>เปลี่ยนสถานะเป็น</FormLabel>
                <Select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  placeholder="เลือกสถานะ"
                >
                  <option value="pending">รอดำเนินการ</option>
                  <option value="processing">กำลังดำเนินการ</option>
                  <option value="completed">เสร็จสิ้น</option>
                  <option value="cancelled">ยกเลิก</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onBulkClose}>
              ยกเลิก
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleBulkAction}
              isLoading={bulkUpdate.isPending}
              isDisabled={!bulkAction}
            >
              ดำเนินการ
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
