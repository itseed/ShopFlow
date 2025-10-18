import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  useToast,
  Badge,
  Divider,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
  useColorModeValue,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Textarea,
  FormControl,
  FormLabel,
  Input,
  Select,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import {
  IoArrowBack,
  IoReceipt,
  IoRefresh,
  IoPrint,
  IoMail,
  IoWarning,
  IoCheckmarkCircle,
  IoTime,
} from "react-icons/io5";
import { FaChevronRight } from "react-icons/fa";
import {
  POSLayout,
  TouchButton,
  POSCard,
  LoadingSpinner,
} from "../../components";
import { Order, OrderStatus, PaymentStatus, CustomerType, ShopType, DeliveryMethod, OrderPriority } from "@shopflow/types";
import { formatCurrency } from "../../lib/sales";
import { useOrder } from "../../lib/hooks/useSale";
import { orderService } from "@shopflow/api";

interface RefundItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  reason: string;
  amount: number;
}

const OrderDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();

  const { data: order, isLoading, error } = useOrder(id as string);

  const [refundItems, setRefundItems] = useState<RefundItem[]>([]);
  const [refundReason, setRefundReason] = useState("");
  const [refundNotes, setRefundNotes] = useState("");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    if (order) {
      // Initialize refund items based on order items
      setRefundItems(order.items.map(item => ({
        id: item.id,
        product_id: item.product_id || "",
        quantity: 0,
        unit_price: item.unit_price,
        reason: "",
        amount: 0,
      })));
    }
  }, [order]);

  const handleRefundToggle = (
    itemId: string,
    quantity: number,
    maxQuantity: number
  ) => {
    setRefundItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === itemId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: Math.min(quantity, maxQuantity),
          amount: updated[existingIndex].unit_price * Math.min(quantity, maxQuantity),
        };
        return updated;
      } else {
        const item = order?.items.find((i) => i.id === itemId);
        if (item) {
          return [
            ...prev,
            {
              id: itemId,
              product_id: item.product_id || "",
              quantity: Math.min(quantity, maxQuantity),
              unit_price: item.unit_price,
              reason: "",
              amount: item.unit_price * Math.min(quantity, maxQuantity),
            },
          ];
        }
        return prev;
      }
    });
  };

  const handleRefundSubmit = async () => {
    if (!order) return;

    const itemsToRefund = refundItems.filter(item => item.quantity > 0);

    if (itemsToRefund.length === 0) {
      toast({
        title: "กรุณาเลือกรายการที่ต้องการคืนเงิน",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!refundReason) {
      toast({
        title: "กรุณาระบุเหตุผลในการคืนเงิน",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Assuming a user ID is available, e.g., from an auth context
      const userId = "pos-user-id-placeholder"; // Replace with actual user ID

      const response = await orderService.refundOrder(
        order.id,
        itemsToRefund,
        refundReason,
        refundNotes,
        userId
      );

      if (response.success) {
        toast({
          title: "คืนเงินสำเร็จ",
          description: `คืนเงินจำนวน ${formatCurrency(response.data?.total || 0)} เรียบร้อยแล้ว`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        onClose();
        // Optionally refetch order details to show updated status
        // queryClient.invalidateQueries(['order', order.id]);
      } else {
        throw new Error(response.error || "ไม่สามารถดำเนินการคืนเงินได้");
      }
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถดำเนินการคืนเงินได้",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handlePrintReceipt = () => {
    toast({
      title: "พิมพ์ใบเสร็จ",
      description: "ส่งใบเสร็จไปยังเครื่องพิมพ์แล้ว",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleEmailReceipt = () => {
    toast({
      title: "ส่งอีเมล",
      description: "ส่งใบเสร็จทางอีเมลแล้ว",
      status: "success",
      duration: 3000,
      isClosable: true,
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
        return "purple";
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
        return status;
    }
  };

  const getPaymentMethodText = (paymentMethod: string) => {
    switch (paymentMethod) {
      case "cash":
        return "เงินสด";
      case "card":
        return "บัตรเครดิต/เดบิต";
      case "digital":
        return "ชำระดิจิทัล";
      case "bank_transfer":
        return "โอนเงิน";
      case "e_wallet":
        return "E-wallet";
      case "credit":
        return "เครดิต";
      default:
        return paymentMethod;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <POSLayout title="รายละเอียดคำสั่งซื้อ">
        <Box py={10}>
          <LoadingSpinner />
        </Box>
      </POSLayout>
    );
  }

  if (error) {
    return (
      <POSLayout title="รายละเอียดคำสั่งซื้อ">
        <Box textAlign="center" py={10}>
          <Alert status="error">
            <AlertIcon />
            <Text>{(error as any).message}</Text>
          </Alert>
        </Box>
      </POSLayout>
    );
  }

  if (!order) {
    return (
      <POSLayout title="รายละเอียดคำสั่งซื้อ">
        <Box textAlign="center" py={10}>
          <Text color="red.500">ไม่พบข้อมูลคำสั่งซื้อ</Text>
          <Button mt={4} onClick={() => router.push("/orders")}>
            กลับไปหน้าประวัติ
          </Button>
        </Box>
      </POSLayout>
    );
  }

  return (
    <POSLayout title="รายละเอียดคำสั่งซื้อ">
      <VStack spacing={6} align="stretch">
        {/* Breadcrumb */}
        <Breadcrumb
          spacing="8px"
          separator={<FaChevronRight color="gray.500" />}
        >
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => router.push("/orders")}>
              ประวัติการสั่งซื้อ
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>{order.order_number}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        {/* Header */}
        <HStack justify="space-between" align="center">
          <HStack spacing={4}>
            <IconButton
              aria-label="กลับ"
              icon={<IoArrowBack />}
              variant="ghost"
              onClick={() => router.push("/orders")}
            />
            <VStack align="start" spacing={0}>
              <Text fontSize="2xl" fontWeight="bold">
                {order.order_number}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {formatDate(order.created_at)}
              </Text>
            </VStack>
            <Badge colorScheme={getStatusColor(order.status)} size="lg">
              {getStatusText(order.status)}
            </Badge>
          </HStack>

          <HStack spacing={2}>
            <Button
              leftIcon={<IoPrint />}
              variant="outline"
              onClick={handlePrintReceipt}
            >
              พิมพ์ใบเสร็จ
            </Button>
            {order.customer_email && (
              <Button
                leftIcon={<IoMail />}
                variant="outline"
                onClick={handleEmailReceipt}
              >
                ส่งอีเมล
              </Button>
            )}
            {order.status === "completed" && (
              <Button
                leftIcon={<IoRefresh />}
                colorScheme="orange"
                onClick={onOpen}
              >
                คืนเงิน
              </Button>
            )}
          </HStack>
        </HStack>

        {/* Order Information */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Card>
            <CardHeader>
              <Text fontSize="lg" fontWeight="bold">
                ข้อมูลคำสั่งซื้อ
              </Text>
            </CardHeader>
            <CardBody>
              <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    เลขที่คำสั่ง:
                  </Text>
                  <Text fontSize="sm" fontWeight="medium">
                    {order.order_number}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    วันที่สร้าง:
                  </Text>
                  <Text fontSize="sm">{formatDate(order.created_at)}</Text>
                </HStack>
                {order.delivered_at && (
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">
                      วันที่เสร็จสิ้น:
                    </Text>
                    <Text fontSize="sm">{formatDate(order.delivered_at)}</Text>
                  </HStack>
                )}
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    พนักงาน:
                  </Text>
                  <Text fontSize="sm">{order.cashier_id}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    สาขา:
                  </Text>
                  <Text fontSize="sm">{order.branch?.name}</Text>
                </HStack>
                {order.notes && (
                  <Box>
                    <Text fontSize="sm" color="gray.600">
                      หมายเหตุ:
                    </Text>
                    <Text fontSize="sm" mt={1}>
                      {order.notes}
                    </Text>
                  </Box>
                )}
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Text fontSize="lg" fontWeight="bold">
                ข้อมูลลูกค้า
              </Text>
            </CardHeader>
            <CardBody>
              {order.customer_name ? (
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">
                      ชื่อ:
                    </Text>
                    <Text fontSize="sm" fontWeight="medium">
                      {order.customer_name}
                    </Text>
                  </HStack>
                  {order.customer_phone && (
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">
                        โทรศัพท์:
                      </Text>
                      <Text fontSize="sm">{order.customer_phone}</Text>
                    </HStack>
                  )}
                  {order.customer_email && (
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">
                        อีเมล:
                      </Text>
                      <Text fontSize="sm">{order.customer_email}</Text>
                    </HStack>
                  )}
                </VStack>
              ) : (
                <Text fontSize="sm" color="gray.500">
                  ไม่มีข้อมูลลูกค้า
                </Text>
              )}
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Items */}
        <Card>
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
                    <Th>ยอดรวม</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {order.items.map((item) => (
                    <Tr key={item.id}>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">{item.product_name}</Text>
                          <Text fontSize="xs" color="gray.500">
                            {item.product_description}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>{formatCurrency(item.unit_price)}</Td>
                      <Td>{item.quantity}</Td>
                      <Td>
                        {item.discount_amount > 0 ? (
                          <Text color="red.500">
                            -{formatCurrency(item.discount_amount)}
                          </Text>
                        ) : (
                          "-"
                        )}
                      </Td>
                      <Td fontWeight="medium">{formatCurrency(item.total_price)}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>

        {/* Payment Summary */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Card>
            <CardHeader>
              <Text fontSize="lg" fontWeight="bold">
                สรุปการชำระเงิน
              </Text>
            </CardHeader>
            <CardBody>
              <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    ยอดรวม:
                  </Text>
                  <Text fontSize="sm">
                    {formatCurrency(order.subtotal)}
                  </Text>
                </HStack>
                {order.discount_amount > 0 && (
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">
                      ส่วนลด:
                    </Text>
                    <Text fontSize="sm" color="red.500">
                      -{formatCurrency(order.discount_amount)}
                    </Text>
                  </HStack>
                )}
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    ภาษี:
                  </Text>
                  <Text fontSize="sm">
                    {formatCurrency(order.tax)}
                  </Text>
                </HStack>
                <Divider />
                <HStack justify="space-between">
                  <Text fontSize="md" fontWeight="bold">
                    ยอดสุทธิ:
                  </Text>
                  <Text fontSize="md" fontWeight="bold">
                    {formatCurrency(order.total)}
                  </Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <Text fontSize="lg" fontWeight="bold">
                วิธีการชำระเงิน
              </Text>
            </CardHeader>
            <CardBody>
              <VStack spacing={3} align="stretch">
                {/* Assuming order.payments is an array of payment transactions */}
                {/* This part needs actual data from payment_transactions table */}
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" color="gray.600">
                    วิธีการ:
                  </Text>
                  <Text fontSize="sm">{getPaymentMethodText(order.payment_method)}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    สถานะ:
                  </Text>
                  <Text fontSize="sm">
                    {getPaymentStatusText(order.payment_status)}
                  </Text>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Receipt Status */}
        <Card>
          <CardHeader>
            <Text fontSize="lg" fontWeight="bold">
              สถานะใบเสร็จ
            </Text>
          </CardHeader>
          <CardBody>
            <HStack spacing={6}>
              <HStack>
                <Box color={order.receipt?.printed ? "green.500" : "gray.400"}>
                  <IoCheckmarkCircle size={20} />
                </Box>
                <Text fontSize="sm">พิมพ์ใบเสร็จ</Text>
              </HStack>
              <HStack>
                <Box
                  color={order.receipt?.emailSent ? "green.500" : "gray.400"}
                >
                  <IoCheckmarkCircle size={20} />
                </Box>
                <Text fontSize="sm">ส่งอีเมล</Text>
              </HStack>
            </HStack>
          </CardBody>
        </Card>
      </VStack>

      {/* Refund Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <IoWarning color="orange" />
              <Text>คืนเงิน - {order.order_number}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              <Alert status="warning">
                <AlertIcon />
                <Box>
                  <AlertTitle>คำเตือน!</AlertTitle>
                  <AlertDescription>
                    การคืนเงินไม่สามารถยกเลิกได้ กรุณาตรวจสอบข้อมูลให้ถูกต้อง
                  </AlertDescription>
                </Box>
              </Alert>

              <FormControl isRequired>
                <FormLabel>เหตุผลในการคืนเงิน</FormLabel>
                <Select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="เลือกเหตุผล"
                >
                  <option value="damaged">สินค้าเสียหาย</option>
                  <option value="wrong_item">สินค้าไม่ตรงตามคำสั่ง</option>
                  <option value="customer_change_mind">ลูกค้าเปลี่ยนใจ</option>
                  <option value="quality_issue">คุณภาพไม่ตรงตามมาตรฐาน</option>
                  <option value="other">อื่นๆ</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>หมายเหตุเพิ่มเติม</FormLabel>
                <Textarea
                  value={refundNotes}
                  onChange={(e) => setRefundNotes(e.target.value)}
                  placeholder="รายละเอียดเพิ่มเติม (ถ้ามี)"
                  rows={3}
                />
              </FormControl>

              <Box>
                <Text fontWeight="medium" mb={4}>
                  เลือกรายการที่ต้องการคืนเงิน:
                </Text>
                <VStack spacing={3} align="stretch">
                  {order.items.map((item) => (
                    <Card key={item.id}>
                      <CardBody>
                        <HStack justify="space-between" align="start">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="medium">{item.product_name}</Text>
                            <Text fontSize="sm" color="gray.500">
                              {formatCurrency(item.unit_price)} x {item.quantity}{" "}
                              = {formatCurrency(item.total_price)}
                            </Text>
                          </VStack>
                          <VStack align="end" spacing={2}>
                            <Text fontSize="sm">จำนวนที่คืน:</Text>
                            <Input
                              type="number"
                              min="0"
                              max={item.quantity}
                              w="80px"
                              size="sm"
                              onChange={(e) => {
                                const quantity = parseInt(e.target.value) || 0;
                                if (quantity > 0) {
                                  handleRefundToggle(
                                    item.id,
                                    quantity,
                                    item.quantity
                                  );
                                }
                              }}
                            />
                          </VStack>
                        </HStack>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              </Box>

              {refundItems.length > 0 && (
                <Box>
                  <Text fontWeight="medium" mb={2}>
                    สรุปการคืนเงิน:
                  </Text>
                  <Card>
                    <CardBody>
                      <VStack spacing={2} align="stretch">
                        {refundItems.map((refundItem) => {
                          const item = order.items.find(
                            (i) => i.id === refundItem.id
                          );
                          return item ? (
                            <HStack
                              key={refundItem.id}
                              justify="space-between"
                            >
                              <Text fontSize="sm">
                                {item.product_name} x {refundItem.quantity}
                              </Text>
                              <Text fontSize="sm" fontWeight="medium">
                                {formatCurrency(refundItem.amount)}
                              </Text>
                            </HStack>
                          ) : null;
                        })}
                        <Divider />
                        <HStack justify="space-between">
                          <Text fontWeight="bold">ยอดคืนรวม:</Text>
                          <Text fontWeight="bold" color="red.500">
                            {formatCurrency(
                              refundItems.reduce(
                                (sum, item) => sum + item.amount,
                                0
                              )
                            )}
                          </Text>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="ghost" onClick={onClose}>
                ยกเลิก
              </Button>
              <Button
                colorScheme="red"
                onClick={handleRefundSubmit}
                isDisabled={refundItems.length === 0 || !refundReason}
              >
                ยืนยันคืนเงิน
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </POSLayout>
  );
};

export default OrderDetailsPage;