import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  useColorModeValue,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from "@chakra-ui/react";
import {
  IoReceipt,
  IoTime,
  IoPerson,
  IoCard,
  IoCash,
  IoCheckmarkCircle,
  IoWarning,
} from "react-icons/io5";
import { SalesTransaction } from "@shopflow/types";
import { formatCurrency } from "../../lib/sales";

interface OrderDetailsProps {
  order: SalesTransaction;
  showActions?: boolean;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order, showActions = true }) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

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
        return `บัตร${payment.cardType || ""} (${payment.cardLastFour || ""})`;
      case "digital":
        return "ชำระดิจิทัล";
      case "qr":
        return "QR Payment";
      default:
        return payment.type;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Order Header */}
      <Card variant="elevated" bg={cardBg}>
        <CardHeader>
          <HStack justify="space-between" align="start">
            <VStack align="start" spacing={2}>
              <HStack spacing={3}>
                <Icon as={IoReceipt} boxSize={6} color="blue.500" />
                <Text fontSize="2xl" fontWeight="bold">
                  {order.transactionNumber}
                </Text>
                <Badge colorScheme={getStatusColor(order.status)} size="lg">
                  {getStatusText(order.status)}
                </Badge>
              </HStack>
              <Text color="gray.600">
                เลขที่ใบเสร็จ: {order.receipt?.receiptNumber}
              </Text>
              <HStack spacing={4}>
                <HStack spacing={2}>
                  <Icon as={IoTime} color="gray.500" />
                  <Text fontSize="sm" color="gray.600">
                    {formatDate(order.createdAt)}
                  </Text>
                </HStack>
                {order.completedAt && (
                  <HStack spacing={2}>
                    <Icon as={IoCheckmarkCircle} color="green.500" />
                    <Text fontSize="sm" color="gray.600">
                      เสร็จสิ้น: {formatDate(order.completedAt)}
                    </Text>
                  </HStack>
                )}
              </HStack>
            </VStack>
            <VStack align="end" spacing={2}>
              <Text fontSize="3xl" fontWeight="bold" color="blue.600">
                {formatCurrency(order.cart.total)}
              </Text>
              <Text fontSize="sm" color="gray.500">
                จำนวน {order.cart.itemCount} รายการ
              </Text>
            </VStack>
          </HStack>
        </CardHeader>
      </Card>

      {/* Order Information Grid */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {/* Customer Information */}
        <Card variant="elevated" bg={cardBg}>
          <CardHeader>
            <HStack spacing={3}>
              <Icon as={IoPerson} boxSize={5} color="blue.500" />
              <Text fontSize="lg" fontWeight="bold">
                ข้อมูลลูกค้า
              </Text>
            </HStack>
          </CardHeader>
          <CardBody>
            {order.customer ? (
              <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    ชื่อ:
                  </Text>
                  <Text fontSize="sm" fontWeight="medium">
                    {order.customer.name}
                  </Text>
                </HStack>
                {order.customer.phone && (
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">
                      โทรศัพท์:
                    </Text>
                    <Text fontSize="sm">{order.customer.phone}</Text>
                  </HStack>
                )}
                {order.customer.email && (
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">
                      อีเมล:
                    </Text>
                    <Text fontSize="sm">{order.customer.email}</Text>
                  </HStack>
                )}
              </VStack>
            ) : (
              <Text fontSize="sm" color="gray.500">
                ลูกค้าทั่วไป
              </Text>
            )}
          </CardBody>
        </Card>

        {/* Transaction Information */}
        <Card variant="elevated" bg={cardBg}>
          <CardHeader>
            <HStack spacing={3}>
              <Icon as={IoCard} boxSize={5} color="green.500" />
              <Text fontSize="lg" fontWeight="bold">
                ข้อมูลการชำระเงิน
              </Text>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">
                  พนักงาน:
                </Text>
                <Text fontSize="sm" fontWeight="medium">
                  {order.cashier.name}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">
                  สาขา:
                </Text>
                <Text fontSize="sm">{order.branch.name}</Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">
                  วิธีการชำระ:
                </Text>
                <Text fontSize="sm">
                  {getPaymentMethodText(order.payments[0])}
                </Text>
              </HStack>
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.600">
                  จำนวนเงิน:
                </Text>
                <Text fontSize="sm" fontWeight="medium">
                  {formatCurrency(order.payments[0]?.amount || 0)}
                </Text>
              </HStack>
              {order.payments[0]?.type === "cash" && order.payments[0].received && (
                <>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">
                      เงินที่รับ:
                    </Text>
                    <Text fontSize="sm">
                      {formatCurrency(order.payments[0].received)}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">
                      เงินทอน:
                    </Text>
                    <Text fontSize="sm" color="green.600">
                      {formatCurrency(order.payments[0].change || 0)}
                    </Text>
                  </HStack>
                </>
              )}
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Order Items */}
      <Card variant="elevated" bg={cardBg}>
        <CardHeader>
          <Text fontSize="lg" fontWeight="bold">
            รายการสินค้า
          </Text>
        </CardHeader>
        <CardBody>
          <TableContainer>
            <Table variant="simple" size="md">
              <Thead>
                <Tr>
                  <Th>สินค้า</Th>
                  <Th>ราคาต่อหน่วย</Th>
                  <Th>จำนวน</Th>
                  <Th>ส่วนลด</Th>
                  <Th>ภาษี</Th>
                  <Th>ยอดรวม</Th>
                </Tr>
              </Thead>
              <Tbody>
                {order.cart.items.map((item) => (
                  <Tr key={item.id}>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">{item.product.name}</Text>
                        <Text fontSize="xs" color="gray.500">
                          {item.product.description}
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          SKU: {item.product.barcode}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>{formatCurrency(item.unitPrice)}</Td>
                    <Td>
                      <Text fontWeight="medium">{item.quantity}</Text>
                    </Td>
                    <Td>
                      {item.discountAmount > 0 ? (
                        <VStack align="start" spacing={0}>
                          <Text color="red.500">
                            -{formatCurrency(item.discountAmount)}
                          </Text>
                          {item.discountPercentage > 0 && (
                            <Text fontSize="xs" color="gray.500">
                              ({item.discountPercentage}%)
                            </Text>
                          )}
                        </VStack>
                      ) : (
                        "-"
                      )}
                    </Td>
                    <Td>{formatCurrency(item.taxAmount)}</Td>
                    <Td>
                      <Text fontWeight="medium" color="blue.600">
                        {formatCurrency(item.total)}
                      </Text>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>

      {/* Order Summary */}
      <Card variant="elevated" bg={cardBg}>
        <CardHeader>
          <Text fontSize="lg" fontWeight="bold">
            สรุปคำสั่งซื้อ
          </Text>
        </CardHeader>
        <CardBody>
          <VStack spacing={3} align="stretch">
            <HStack justify="space-between">
              <Text fontSize="md" color="gray.600">
                ยอดรวมก่อนภาษี:
              </Text>
              <Text fontSize="md">{formatCurrency(order.cart.subtotal)}</Text>
            </HStack>
            {order.cart.discountAmount > 0 && (
              <HStack justify="space-between">
                <Text fontSize="md" color="gray.600">
                  ส่วนลดรวม:
                </Text>
                <Text fontSize="md" color="red.500">
                  -{formatCurrency(order.cart.discountAmount)}
                </Text>
              </HStack>
            )}
            <HStack justify="space-between">
              <Text fontSize="md" color="gray.600">
                ภาษีรวม:
              </Text>
              <Text fontSize="md">{formatCurrency(order.cart.taxAmount)}</Text>
            </HStack>
            <Divider />
            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="bold">
                ยอดสุทธิ:
              </Text>
              <Text fontSize="lg" fontWeight="bold" color="blue.600">
                {formatCurrency(order.cart.total)}
              </Text>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Receipt Status */}
      <Card variant="elevated" bg={cardBg}>
        <CardHeader>
          <Text fontSize="lg" fontWeight="bold">
            สถานะใบเสร็จ
          </Text>
        </CardHeader>
        <CardBody>
          <HStack spacing={8}>
            <HStack spacing={3}>
              <Icon
                as={order.receipt?.printed ? IoCheckmarkCircle : IoWarning}
                color={order.receipt?.printed ? "green.500" : "orange.500"}
                boxSize={5}
              />
              <VStack align="start" spacing={0}>
                <Text fontSize="sm" fontWeight="medium">
                  พิมพ์ใบเสร็จ
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {order.receipt?.printed ? "พิมพ์แล้ว" : "ยังไม่ได้พิมพ์"}
                </Text>
              </VStack>
            </HStack>
            <HStack spacing={3}>
              <Icon
                as={order.receipt?.emailSent ? IoCheckmarkCircle : IoWarning}
                color={order.receipt?.emailSent ? "green.500" : "orange.500"}
                boxSize={5}
              />
              <VStack align="start" spacing={0}>
                <Text fontSize="sm" fontWeight="medium">
                  ส่งอีเมล
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {order.receipt?.emailSent ? "ส่งแล้ว" : "ยังไม่ได้ส่ง"}
                </Text>
              </VStack>
            </HStack>
          </HStack>
        </CardBody>
      </Card>

      {/* Notes */}
      {order.notes && (
        <Card variant="elevated" bg={cardBg}>
          <CardHeader>
            <Text fontSize="lg" fontWeight="bold">
              หมายเหตุ
            </Text>
          </CardHeader>
          <CardBody>
            <Text fontSize="sm" color="gray.700">
              {order.notes}
            </Text>
          </CardBody>
        </Card>
      )}
    </VStack>
  );
};

export default OrderDetails;