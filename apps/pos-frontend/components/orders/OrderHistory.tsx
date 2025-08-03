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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  Flex,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  IoSearch,
  IoEye,
  IoReceipt,
  IoRefresh,
  IoEllipsisVertical,
  IoCalendar,
  IoFilter,
} from "react-icons/io5";
import { SalesTransaction } from "@shopflow/types";
import { formatCurrency } from "../../lib/sales";

interface OrderHistoryProps {
  orders: SalesTransaction[];
  loading: boolean;
  onView: (order: SalesTransaction) => void;
  onViewReceipt: (order: SalesTransaction) => void;
  onRefund: (order: SalesTransaction) => void;
  searchFilters?: {
    searchTerm: string;
    status: string;
    dateRange: string;
    paymentMethod: string;
    sortBy: string;
    sortOrder: "asc" | "desc";
  };
  onFiltersChange?: (filters: any) => void;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({
  orders,
  loading,
  onView,
  onViewReceipt,
  onRefund,
  searchFilters,
  onFiltersChange,
}) => {
  const [localFilters, setLocalFilters] = useState({
    searchTerm: "",
    status: "all",
    dateRange: "today",
    paymentMethod: "all",
    sortBy: "createdAt",
    sortOrder: "desc" as "asc" | "desc",
  });

  const filters = searchFilters || localFilters;
  const updateFilters = onFiltersChange || setLocalFilters;

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const isMobile = useBreakpointValue({ base: true, md: false });

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

  const getPaymentMethodText = (type: string) => {
    switch (type) {
      case "cash":
        return "เงินสด";
      case "card":
        return "บัตร";
      case "digital":
        return "ดิจิทัล";
      case "qr":
        return "QR";
      default:
        return type;
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

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="lg" />
        <Text mt={4} color="gray.500">
          กำลังโหลดข้อมูล...
        </Text>
      </Box>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      {/* Search and Filters */}
      <Box bg={cardBg} p={4} borderRadius="xl" border="1px" borderColor={borderColor}>
        <VStack spacing={4}>
          {/* Search Bar */}
          <HStack w="full" spacing={4}>
            <InputGroup flex={2}>
              <InputLeftElement>
                <IoSearch color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="ค้นหาด้วยเลขที่คำสั่ง, ชื่อลูกค้า, หรือเลขใบเสร็จ"
                value={filters.searchTerm}
                onChange={(e) =>
                  updateFilters({ ...filters, searchTerm: e.target.value })
                }
                size="lg"
              />
            </InputGroup>
            <Button leftIcon={<IoRefresh />} variant="outline" size="lg">
              รีเฟรช
            </Button>
          </HStack>

          {/* Filter Controls */}
          <HStack w="full" spacing={4} flexWrap="wrap">
            <Select
              value={filters.status}
              onChange={(e) =>
                updateFilters({ ...filters, status: e.target.value })
              }
              w={{ base: "full", md: "200px" }}
              size="md"
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
                updateFilters({ ...filters, dateRange: e.target.value })
              }
              w={{ base: "full", md: "200px" }}
              size="md"
            >
              <option value="today">วันนี้</option>
              <option value="yesterday">เมื่อวาน</option>
              <option value="week">สัปดาห์นี้</option>
              <option value="month">เดือนนี้</option>
              <option value="all">ทั้งหมด</option>
            </Select>

            <Select
              value={filters.paymentMethod}
              onChange={(e) =>
                updateFilters({ ...filters, paymentMethod: e.target.value })
              }
              w={{ base: "full", md: "200px" }}
              size="md"
            >
              <option value="all">วิธีชำระทั้งหมด</option>
              <option value="cash">เงินสด</option>
              <option value="card">บัตรเครดิต/เดบิต</option>
              <option value="digital">ชำระดิจิทัล</option>
              <option value="qr">QR Payment</option>
            </Select>

            <Select
              value={filters.sortOrder}
              onChange={(e) =>
                updateFilters({
                  ...filters,
                  sortOrder: e.target.value as "asc" | "desc",
                })
              }
              w={{ base: "full", md: "150px" }}
              size="md"
            >
              <option value="desc">ใหม่ไปเก่า</option>
              <option value="asc">เก่าไปใหม่</option>
            </Select>
          </HStack>
        </VStack>
      </Box>

      {/* Orders Table */}
      <Box bg={cardBg} borderRadius="xl" border="1px" borderColor={borderColor}>
        {orders.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Alert status="info" justifyContent="center">
              <AlertIcon />
              ไม่พบข้อมูลคำสั่งซื้อที่ตรงกับเงื่อนไข
            </Alert>
          </Box>
        ) : (
          <Box overflowX="auto">
            <TableContainer>
              <Table variant="simple" size="md">
                <Thead>
                  <Tr>
                    <Th>เลขที่คำสั่ง</Th>
                    <Th>วันที่/เวลา</Th>
                    <Th>ลูกค้า</Th>
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
                          <Text fontWeight="medium" fontSize="sm">
                            {order.transactionNumber}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {order.receipt?.receiptNumber}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm">{formatDate(order.createdAt)}</Text>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontSize="sm">
                            {order.customer?.name || "ลูกค้าทั่วไป"}
                          </Text>
                          {order.customer?.phone && (
                            <Text fontSize="xs" color="gray.500">
                              {order.customer.phone}
                            </Text>
                          )}
                        </VStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm">
                          {getPaymentMethodText(order.payments[0]?.type || "")}
                        </Text>
                      </Td>
                      <Td>
                        <Text fontSize="sm" fontWeight="medium" color="blue.600">
                          {formatCurrency(order.cart.total)}
                        </Text>
                      </Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(order.status)} size="sm">
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
                            <MenuItem icon={<IoEye />} onClick={() => onView(order)}>
                              ดูรายละเอียด
                            </MenuItem>
                            <MenuItem
                              icon={<IoReceipt />}
                              onClick={() => onViewReceipt(order)}
                            >
                              ดูใบเสร็จ
                            </MenuItem>
                            {order.status === "completed" && (
                              <MenuItem
                                icon={<IoRefresh />}
                                onClick={() => onRefund(order)}
                                color="red.500"
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
          </Box>
        )}
      </Box>
    </VStack>
  );
};

export default OrderHistory;