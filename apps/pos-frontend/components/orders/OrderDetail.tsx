import React, { useState, useRef } from "react";
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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useColorModeValue,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  useToast,
  Textarea,
  FormControl,
  FormLabel,
  Select,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Grid,
  GridItem,
  Icon,
  Flex,
  useReactToPrint,
} from "@chakra-ui/react";
import {
  IoReceipt,
  IoMail,
  IoArrowUndo,
  IoCheckmarkCircle,
  IoTimeOutline,
  IoPersonOutline,
  IoBusinessOutline,
  IoCardOutline,
  IoCashOutline,
  IoPrint,
  IoDownload,
  IoEye,
  IoAlertCircle,
} from "react-icons/io5";
import { SalesTransaction } from "@shopflow/types";
import { formatCurrency } from "../../lib/sales";

interface OrderDetailProps {
  order: SalesTransaction;
  onRefund?: (refundData: {
    transactionId: string;
    amount: number;
    reason: string;
    items: Array<{
      id: string;
      quantity: number;
      reason: string;
    }>;
  }) => void;
  showActions?: boolean;
  readonly?: boolean;
}

const OrderDetail: React.FC<OrderDetailProps> = ({
  order,
  onRefund,
  showActions = true,
  readonly = false,
}) => {
  const [refundAmount, setRefundAmount] = useState(0);
  const [refundReason, setRefundReason] = useState("");
  const [refundItems, setRefundItems] = useState<
    Array<{
      id: string;
      quantity: number;
      reason: string;
    }>
  >([]);
  const [loading, setLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isReceiptOpen,
    onOpen: onReceiptOpen,
    onClose: onReceiptClose,
  } = useDisclosure();

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const successColor = useColorModeValue("green.50", "green.900");
  const warningColor = useColorModeValue("yellow.50", "yellow.900");

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const handleRefund = async () => {
    if (!refundAmount || !refundReason) {
      toast({
        title: "ข้อมูลไม่ครบ",
        description: "กรุณาระบุจำนวนเงินและเหตุผลในการคืนเงิน",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (refundAmount > order.cart.total) {
      toast({
        title: "จำนวนเงินไม่ถูกต้อง",
        description: "จำนวนเงินคืนไม่สามารถเกินยอดรวมของคำสั่งซื้อ",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      if (onRefund) {
        await onRefund({
          transactionId: order.id,
          amount: refundAmount,
          reason: refundReason,
          items: refundItems,
        });
      }

      toast({
        title: "ดำเนินการสำเร็จ",
        description: "คำขอคืนเงินได้รับการบันทึกแล้ว",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onClose();
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดำเนินการคืนเงินได้",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    setLoading(true);
    try {
      // Simulate email sending
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "ส่งอีเมลสำเร็จ",
        description: "ใบเสร็จได้รับการส่งไปยังอีเมลของลูกค้าแล้ว",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถส่งอีเมลได้",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
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

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case "cash":
        return IoCashOutline;
      case "card":
        return IoCardOutline;
      default:
        return IoCardOutline;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString("th-TH", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <HStack justify="space-between" align="start">
              <VStack align="start" spacing={1}>
                <Text fontSize="xl" fontWeight="bold">
                  คำสั่งซื้อ #{order.transactionNumber}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {formatDate(order.createdAt)}
                </Text>
              </VStack>
              <Badge colorScheme={getStatusColor(order.status)} size="lg">
                {getStatusText(order.status)}
              </Badge>
            </HStack>
          </CardHeader>
        </Card>

        {/* Order Information */}
        <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={6}>
          <GridItem>
            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <CardHeader>
                <HStack>
                  <Icon as={IoPersonOutline} />
                  <Text fontSize="lg" fontWeight="medium">
                    ข้อมูลลูกค้า
                  </Text>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="sm">ชื่อ:</Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {order.customer?.name || "ไม่ระบุ"}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm">เบอร์โทร:</Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {order.customer?.phone || "ไม่ระบุ"}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm">อีเมล:</Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {order.customer?.email || "ไม่ระบุ"}
                    </Text>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>

          <GridItem>
            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <CardHeader>
                <HStack>
                  <Icon as={IoBusinessOutline} />
                  <Text fontSize="lg" fontWeight="medium">
                    ข้อมูลการขาย
                  </Text>
                </HStack>
              </CardHeader>
              <CardBody>
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="sm">เลขใบเสร็จ:</Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {order.receipt?.receiptNumber}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm">พนักงาน:</Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {order.cashier.name}
                    </Text>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm">สาขา:</Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {order.branch.name}
                    </Text>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* Items */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Text fontSize="lg" fontWeight="medium">
              รายการสินค้า ({order.cart.items.length} รายการ)
            </Text>
          </CardHeader>
          <CardBody>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>รายการ</Th>
                    <Th isNumeric>ราคา/หน่วย</Th>
                    <Th isNumeric>จำนวน</Th>
                    <Th isNumeric>ส่วนลด</Th>
                    <Th isNumeric>ยอดรวม</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {order.cart.items.map((item, index) => (
                    <Tr key={index}>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">{item.product.name}</Text>
                          <Text fontSize="sm" color="gray.500">
                            {item.product.description}
                          </Text>
                        </VStack>
                      </Td>
                      <Td isNumeric>{formatCurrency(item.unitPrice)}</Td>
                      <Td isNumeric>{item.quantity}</Td>
                      <Td isNumeric>
                        {item.discountAmount > 0 ? (
                          <Text color="red.500">
                            -{formatCurrency(item.discountAmount)}
                          </Text>
                        ) : (
                          "-"
                        )}
                      </Td>
                      <Td isNumeric fontWeight="medium">
                        {formatCurrency(item.total)}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>

        {/* Payment Summary */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Text fontSize="lg" fontWeight="medium">
              สรุปการชำระเงิน
            </Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {/* Summary */}
              <VStack spacing={2} align="stretch">
                <HStack justify="space-between">
                  <Text>ยอดรวม:</Text>
                  <Text>{formatCurrency(order.cart.subtotal)}</Text>
                </HStack>
                {order.cart.discountAmount > 0 && (
                  <HStack justify="space-between">
                    <Text>ส่วนลด:</Text>
                    <Text color="red.500">
                      -{formatCurrency(order.cart.discountAmount)}
                    </Text>
                  </HStack>
                )}
                <HStack justify="space-between">
                  <Text>ภาษี (7%):</Text>
                  <Text>{formatCurrency(order.cart.taxAmount)}</Text>
                </HStack>
                <Divider />
                <HStack justify="space-between">
                  <Text fontSize="lg" fontWeight="bold">
                    ยอดสุทธิ:
                  </Text>
                  <Text fontSize="lg" fontWeight="bold">
                    {formatCurrency(order.cart.total)}
                  </Text>
                </HStack>
              </VStack>

              <Divider />

              {/* Payment Methods */}
              <VStack spacing={3} align="stretch">
                <Text fontSize="md" fontWeight="medium">
                  วิธีการชำระเงิน
                </Text>
                {order.payments.map((payment, index) => (
                  <Box key={index} p={3} bg={successColor} borderRadius="md">
                    <HStack justify="space-between">
                      <HStack>
                        <Icon as={getPaymentIcon(payment.type)} />
                        <Text fontSize="sm">
                          {getPaymentMethodText(payment)}
                        </Text>
                      </HStack>
                      <Badge colorScheme="green" size="sm">
                        {payment.status === "completed"
                          ? "สำเร็จ"
                          : payment.status}
                      </Badge>
                    </HStack>
                    <VStack spacing={1} align="stretch" mt={2}>
                      <HStack justify="space-between">
                        <Text fontSize="sm">จำนวน:</Text>
                        <Text fontSize="sm" fontWeight="medium">
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
                  </Box>
                ))}
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Actions */}
        {showActions && !readonly && (
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardHeader>
              <Text fontSize="lg" fontWeight="medium">
                การดำเนินการ
              </Text>
            </CardHeader>
            <CardBody>
              <Flex wrap="wrap" gap={3}>
                <Button
                  leftIcon={<IoPrint />}
                  onClick={handlePrint}
                  variant="outline"
                >
                  พิมพ์ใบเสร็จ
                </Button>
                <Button
                  leftIcon={<IoMail />}
                  onClick={handleSendEmail}
                  variant="outline"
                  isLoading={loading}
                  loadingText="ส่ง..."
                >
                  ส่งอีเมล
                </Button>
                <Button
                  leftIcon={<IoEye />}
                  onClick={onReceiptOpen}
                  variant="outline"
                >
                  ดูใบเสร็จ
                </Button>
                {order.status === "completed" && (
                  <Button
                    leftIcon={<IoArrowUndo />}
                    onClick={onOpen}
                    colorScheme="orange"
                    variant="outline"
                  >
                    คืนเงิน
                  </Button>
                )}
              </Flex>
            </CardBody>
          </Card>
        )}
      </VStack>

      {/* Refund Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>คืนเงิน</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="warning">
                <AlertIcon />
                <AlertTitle>คำเตือน!</AlertTitle>
                <AlertDescription>
                  การคืนเงินไม่สามารถยกเลิกได้ กรุณาตรวจสอบข้อมูลให้ถูกต้อง
                </AlertDescription>
              </Alert>

              <FormControl>
                <FormLabel>จำนวนเงินคืน</FormLabel>
                <NumberInput
                  value={refundAmount}
                  onChange={(_, value) => setRefundAmount(value)}
                  min={0}
                  max={order.cart.total}
                  precision={2}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Text fontSize="sm" color="gray.500" mt={1}>
                  ยอดสูงสุด: {formatCurrency(order.cart.total)}
                </Text>
              </FormControl>

              <FormControl>
                <FormLabel>เหตุผล</FormLabel>
                <Select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="เลือกเหตุผล"
                >
                  <option value="defective">สินค้าชำรุด/ไม่ถูกต้อง</option>
                  <option value="customer_request">ลูกค้าขอคืน</option>
                  <option value="system_error">ข้อผิดพลาดระบบ</option>
                  <option value="duplicate">การขายซ้ำ</option>
                  <option value="other">อื่นๆ</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>หมายเหตุเพิ่มเติม</FormLabel>
                <Textarea placeholder="ระบุรายละเอียดเพิ่มเติม..." rows={3} />
              </FormControl>

              <Box p={3} bg={warningColor} borderRadius="md">
                <Text fontSize="sm" fontWeight="medium" mb={2}>
                  สรุปการคืนเงิน:
                </Text>
                <HStack justify="space-between">
                  <Text fontSize="sm">จำนวนเงินคืน:</Text>
                  <Text fontSize="sm" fontWeight="bold">
                    {formatCurrency(refundAmount)}
                  </Text>
                </HStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onClose}>
                ยกเลิก
              </Button>
              <Button
                colorScheme="orange"
                onClick={handleRefund}
                isLoading={loading}
                loadingText="กำลังดำเนินการ..."
                leftIcon={<IoArrowUndo />}
              >
                ดำเนินการคืนเงิน
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Receipt Preview Modal */}
      <Modal isOpen={isReceiptOpen} onClose={onReceiptClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>ใบเสร็จ</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box ref={printRef} p={4} bg="white" color="black">
              <VStack spacing={3} align="center">
                <Text fontSize="lg" fontWeight="bold">
                  {order.branch.name}
                </Text>
                <Text fontSize="sm">
                  เลขที่ใบเสร็จ: {order.receipt?.receiptNumber}
                </Text>
                <Text fontSize="sm">{formatDate(order.createdAt)}</Text>
              </VStack>

              <Divider my={4} />

              <VStack spacing={2} align="stretch">
                {order.cart.items.map((item, index) => (
                  <HStack key={index} justify="space-between">
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm">{item.product.name}</Text>
                      <Text fontSize="xs" color="gray.500">
                        {formatCurrency(item.unitPrice)} x {item.quantity}
                      </Text>
                    </VStack>
                    <Text fontSize="sm">{formatCurrency(item.total)}</Text>
                  </HStack>
                ))}
              </VStack>

              <Divider my={4} />

              <VStack spacing={1} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm">ยอดรวม:</Text>
                  <Text fontSize="sm">
                    {formatCurrency(order.cart.subtotal)}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm">ภาษี:</Text>
                  <Text fontSize="sm">
                    {formatCurrency(order.cart.taxAmount)}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" fontWeight="bold">
                    ยอดสุทธิ:
                  </Text>
                  <Text fontSize="sm" fontWeight="bold">
                    {formatCurrency(order.cart.total)}
                  </Text>
                </HStack>
              </VStack>

              <Divider my={4} />

              <VStack spacing={2} align="stretch">
                {order.payments.map((payment, index) => (
                  <HStack key={index} justify="space-between">
                    <Text fontSize="sm">{getPaymentMethodText(payment)}:</Text>
                    <Text fontSize="sm">{formatCurrency(payment.amount)}</Text>
                  </HStack>
                ))}
              </VStack>

              <Box textAlign="center" mt={4}>
                <Text fontSize="xs" color="gray.500">
                  ขอบคุณที่ใช้บริการ
                </Text>
              </Box>
            </Box>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button leftIcon={<IoPrint />} onClick={handlePrint}>
                พิมพ์
              </Button>
              <Button variant="ghost" onClick={onReceiptClose}>
                ปิด
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default OrderDetail;
