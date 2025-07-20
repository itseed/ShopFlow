import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  VStack,
  HStack,
  Text,
  Box,
  Divider,
  Button,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useBreakpointValue,
} from "@chakra-ui/react";
import { SalesTransaction } from "@shopflow/types";

interface OrderDetailModalProps {
  order: SalesTransaction | null;
  isOpen: boolean;
  onClose: () => void;
  onRefund: (order: SalesTransaction) => void;
  onPrintReceipt?: (order: SalesTransaction) => void;
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

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, isOpen, onClose, onRefund, onPrintReceipt }) => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  if (!order) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} size={isMobile ? "full" : "lg"}>
      <ModalOverlay />
      <ModalContent borderRadius="xl" p={2}>
        <ModalHeader>รายละเอียดออเดอร์</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="stretch" spacing={4}>
            <HStack justify="space-between">
              <Text fontWeight="bold">เลขออเดอร์: {order.transactionNumber}</Text>
              <Badge colorScheme={getStatusColor(order.status)}>{order.status}</Badge>
            </HStack>
            <Text color="gray.500" fontSize="sm">วันที่: {order.createdAt instanceof Date ? order.createdAt.toLocaleString() : order.createdAt}</Text>
            <Divider />
            <Box>
              <Text fontWeight="semibold" mb={2}>รายการสินค้า</Text>
              <Table size="sm" variant="simple">
                <Thead>
                  <Tr>
                    <Th>สินค้า</Th>
                    <Th isNumeric>จำนวน</Th>
                    <Th isNumeric>ราคา/ชิ้น</Th>
                    <Th isNumeric>รวม</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {order.cart.items.map(item => (
                    <Tr key={item.id}>
                      <Td>{item.product.name}</Td>
                      <Td isNumeric>{item.quantity}</Td>
                      <Td isNumeric>{item.unitPrice.toFixed(2)}</Td>
                      <Td isNumeric>{item.total.toFixed(2)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
            <Divider />
            <VStack align="stretch" spacing={1}>
              <HStack justify="space-between">
                <Text>ยอดรวม:</Text>
                <Text>{order.cart.subtotal.toFixed(2)} ฿</Text>
              </HStack>
              <HStack justify="space-between">
                <Text>ภาษี:</Text>
                <Text>{order.cart.taxAmount.toFixed(2)} ฿</Text>
              </HStack>
              <HStack justify="space-between">
                <Text>ส่วนลด:</Text>
                <Text color="green.600">-{order.cart.discountAmount.toFixed(2)} ฿</Text>
              </HStack>
              <Divider />
              <HStack justify="space-between">
                <Text fontWeight="bold">รวมสุทธิ:</Text>
                <Text fontWeight="bold" color="blue.600">{order.cart.total.toFixed(2)} ฿</Text>
              </HStack>
            </VStack>
            <Divider />
            <VStack align="stretch" spacing={1}>
              <Text fontWeight="semibold">ลูกค้า: {order.customer?.name || "-"}</Text>
              {order.customer?.phone && <Text color="gray.500">{order.customer.phone}</Text>}
              <Text fontWeight="semibold">พนักงาน: {order.cashier.name}</Text>
              <Text fontWeight="semibold">สาขา: {order.branch.name}</Text>
            </VStack>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack w="full" justify="space-between">
            <Button onClick={onClose} variant="ghost">ปิด</Button>
            <HStack spacing={2}>
              <Button colorScheme="blue" variant="outline" onClick={() => onPrintReceipt && onPrintReceipt(order)}>
                พิมพ์ใบเสร็จ
              </Button>
              {order.status === "completed" && (
                <Button colorScheme="red" onClick={() => onRefund(order)}>
                  คืนเงิน
                </Button>
              )}
            </HStack>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default OrderDetailModal; 