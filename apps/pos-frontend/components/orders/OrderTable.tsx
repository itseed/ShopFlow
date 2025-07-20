import React from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  HStack,
  Button,
  Badge,
  IconButton,
  Input,
  Select,
  Text,
  Spinner,
} from "@chakra-ui/react";
import { IoEye, IoReceipt, IoRefresh } from "react-icons/io5";
import { SalesTransaction } from "@shopflow/types";

interface OrderTableProps {
  orders: SalesTransaction[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onView: (order: SalesTransaction) => void;
  onViewReceipt: (order: SalesTransaction) => void;
  onRefund: (order: SalesTransaction) => void;
  filters: any;
  onFilterChange: (filters: any) => void;
}

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

const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  loading,
  currentPage,
  totalPages,
  onPageChange,
  onView,
  onViewReceipt,
  onRefund,
  filters,
  onFilterChange,
}) => (
  <Box bg="white" borderRadius="xl" shadow="md" p={4}>
    {/* Filter/Search */}
    <HStack mb={4} spacing={3} flexWrap="wrap">
      <Input
        placeholder="ค้นหาเลขออเดอร์/ลูกค้า..."
        value={filters.searchTerm}
        onChange={e => onFilterChange({ ...filters, searchTerm: e.target.value })}
        maxW="220px"
        size="md"
      />
      <Select
        value={filters.status}
        onChange={e => onFilterChange({ ...filters, status: e.target.value })}
        maxW="140px"
        size="md"
      >
        <option value="all">ทุกสถานะ</option>
        <option value="completed">สำเร็จ</option>
        <option value="pending">รอดำเนินการ</option>
        <option value="cancelled">ยกเลิก</option>
        <option value="refunded">คืนเงิน</option>
      </Select>
      <Select
        value={filters.paymentMethod}
        onChange={e => onFilterChange({ ...filters, paymentMethod: e.target.value })}
        maxW="140px"
        size="md"
      >
        <option value="all">ทุกช่องทาง</option>
        <option value="cash">เงินสด</option>
        <option value="card">บัตร</option>
        <option value="digital">ดิจิทัล</option>
      </Select>
      <Button leftIcon={<IoRefresh />} onClick={() => onFilterChange({ ...filters })} variant="ghost" size="md">
        รีเซ็ต
      </Button>
    </HStack>
    <TableContainer>
      <Table size="md" variant="simple">
        <Thead>
          <Tr>
            <Th>เลขออเดอร์</Th>
            <Th>ลูกค้า</Th>
            <Th>ยอดสุทธิ</Th>
            <Th>สถานะ</Th>
            <Th>วันที่</Th>
            <Th>Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {loading ? (
            <Tr>
              <Td colSpan={6} textAlign="center">
                <Spinner size="lg" />
              </Td>
            </Tr>
          ) : orders.length === 0 ? (
            <Tr>
              <Td colSpan={6} textAlign="center">
                <Text color="gray.400">ไม่พบข้อมูลออเดอร์</Text>
              </Td>
            </Tr>
          ) : (
            orders.map(order => (
              <Tr key={order.id} _hover={{ bg: "gray.50" }}>
                <Td fontWeight="bold">{order.transactionNumber}</Td>
                <Td>{order.customer?.name || "-"}</Td>
                <Td color="blue.600" fontWeight="bold">{order.cart.total.toFixed(2)} ฿</Td>
                <Td>
                  <Badge colorScheme={getStatusColor(order.status)}>{order.status}</Badge>
                </Td>
                <Td>{order.createdAt instanceof Date ? order.createdAt.toLocaleString() : order.createdAt}</Td>
                <Td>
                  <HStack spacing={1}>
                    <IconButton aria-label="ดูรายละเอียด" icon={<IoEye />} size="sm" onClick={() => onView(order)} />
                    <IconButton aria-label="ดูใบเสร็จ" icon={<IoReceipt />} size="sm" onClick={() => onViewReceipt(order)} />
                    <Button size="sm" colorScheme="red" variant="outline" onClick={() => onRefund(order)}>
                      คืนเงิน
                    </Button>
                  </HStack>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </TableContainer>
    {/* Pagination */}
    {totalPages > 1 && (
      <HStack justify="center" mt={4} spacing={2}>
        <Button size="sm" onClick={() => onPageChange(currentPage - 1)} isDisabled={currentPage === 1}>ก่อนหน้า</Button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <Button
            key={page}
            size="sm"
            variant={page === currentPage ? "solid" : "ghost"}
            colorScheme={page === currentPage ? "blue" : undefined}
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        ))}
        <Button size="sm" onClick={() => onPageChange(currentPage + 1)} isDisabled={currentPage === totalPages}>ถัดไป</Button>
      </HStack>
    )}
  </Box>
);

export default OrderTable; 