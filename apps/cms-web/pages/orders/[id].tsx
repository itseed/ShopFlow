import React, { useState, useEffect } from "react";
import { ReactElement } from "react";
import { NextPageWithLayout } from "../_app";
import Layout from "../../components/Layout";
import { withAuth } from "../../lib/auth";
import { useRouter } from "next/router";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Alert,
  AlertIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  useDisclosure,
  Flex,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
  Image,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import {
  FiArrowLeft,
  FiEdit2,
  FiDownload,
  FiMail,
  FiPhone,
  FiMapPin,
  FiClock,
  FiDollarSign,
  FiPackage,
  FiUser,
  FiCalendar,
  FiCheck,
  FiX,
  FiRefreshCw,
} from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import { useOrder, useUpdateOrder } from "../../lib/hooks";
import { Order, OrderStatus, PaymentStatus, CustomerType, OrderCustomerType, ShopType, DeliveryMethod, OrderPriority } from "@shopflow/types";

const getStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case "pending":
      return "yellow";
    case "confirmed":
      return "blue";
    case "processing":
      return "purple";
    case "ready":
      return "cyan";
    case "delivering":
      return "orange";
    case "completed":
      return "green";
    case "cancelled":
      return "red";
    case "refunded":
      return "gray";
    default:
      return "gray";
  }
};

const getStatusText = (status: OrderStatus): string => {
  switch (status) {
    case "pending":
      return "รอยืนยัน";
    case "confirmed":
      return "ยืนยันแล้ว";
    case "processing":
      return "กำลังจัดเตรียม";
    case "ready":
      return "พร้อมส่ง";
    case "delivering":
      return "กำลังจัดส่ง";
    case "completed":
      return "สำเร็จ";
    case "cancelled":
      return "ยกเลิก";
    case "refunded":
      return "คืนเงิน";
    default:
      return status;
  }
};

const getPriorityColor = (priority: OrderPriority): string => {
  switch (priority) {
    case "low":
      return "gray";
    case "normal":
      return "blue";
    case "high":
      return "orange";
    case "urgent":
      return "red";
    default:
      return "gray";
  }
};

const getPriorityText = (priority: OrderPriority): string => {
  switch (priority) {
    case "low":
      return "ต่ำ";
    case "normal":
      return "ปกติ";
    case "high":
      return "สูง";
    case "urgent":
      return "ด่วน";
    default:
      return priority;
  }
};

const getPaymentStatusColor = (status: PaymentStatus): string => {
  switch (status) {
    case "pending":
      return "yellow";
    case "paid":
      return "green";
    case "partial":
      return "orange";
    case "overdue":
      return "red";
    case "refunded":
      return "gray";
    default:
      return "gray";
  }
};

const getPaymentStatusText = (status: PaymentStatus): string => {
  switch (status) {
    case "pending":
      return "รอชำระ";
    case "paid":
      return "ชำระแล้ว";
    case "partial":
      return "ชำระบางส่วน";
    case "overdue":
      return "เกินกำหนด";
    case "refunded":
      return "คืนเงิน";
    default:
      return status;
  }
};

const getCustomerTypeText = (type: OrderCustomerType | CustomerType): string => {
  switch (type) {
    case "registered":
      return "ลูกค้าประจำ";
    case "walk_in":
      return "ลูกค้าหน้าร้าน";
    case "phone_order":
      return "สั่งทางโทรศัพท์";
    case "repeat_customer":
      return "ลูกค้าเก่า";
    case "individual":
      return "บุคคลทั่วไป";
    case "business":
      return "ธุรกิจ";
    case "regular":
      return "ลูกค้าทั่วไป";
    case "vip":
      return "VIP";
    case "wholesale":
      return "ขายส่ง";
    default:
      return type;
  }
};

const getShopTypeText = (type: ShopType): string => {
  switch (type) {
    case "convenience_store":
      return "ร้านสะดวกซื้อ";
    case "grocery_store":
      return "ร้านชำ";
    case "mini_mart":
      return "มินิมาร์ท";
    case "supermarket":
      return "ซูเปอร์มาร์เก็ต";
    case "restaurant":
      return "ร้านอาหาร";
    case "other":
      return "อื่นๆ";
    default:
      return type;
  }
};

const getPaymentMethodText = (method: string): string => {
  switch (method) {
    case "cash":
      return "เงินสด";
    case "card":
      return "บัตรเครดิต/เดบิต";
    case "bank_transfer":
      return "โอนเงิน";
    case "e_wallet":
      return "กระเป๋าเงินอิเล็กทรอนิกส์";
    case "credit":
      return "เครดิต";
    case "cheque":
      return "เช็ค";
    default:
      return method;
  }
};

const OrderDetailPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();

  const { data: order, isLoading, error } = useOrder(id as string);
  const updateOrderMutation = useUpdateOrder();

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>(order?.status || "pending");

  const {
    isOpen: isStatusOpen,
    onOpen: onStatusOpen,
    onClose: onStatusClose,
  } = useDisclosure();

  useEffect(() => {
    if (order) {
      setNewStatus(order.status);
    }
  }, [order]);

  const handleStatusUpdate = async () => {
    if (!order) return;
    setIsUpdatingStatus(true);
    try {
      await updateOrderMutation.mutateAsync({
        id: order.id,
        data: { status: newStatus },
      });
      onStatusClose();
      toast({
        title: "สำเร็จ",
        description: "อัปเดตสถานะออเดอร์เรียบร้อยแล้ว",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: err.message || "ไม่สามารถอัปเดตสถานะได้",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <Box p={8} textAlign="center">
        <Spinner size="xl" />
        <Text mt={4}>กำลังโหลดข้อมูลออเดอร์...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={8} textAlign="center">
        <Alert status="error">
          <AlertIcon />
          <Text>{(error as any).message}</Text>
        </Alert>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box p={8} textAlign="center">
        <Alert status="warning">
          <AlertIcon />
          <Text>ไม่พบข้อมูลออเดอร์</Text>
        </Alert>
      </Box>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <HStack justify="space-between" align="center">
        <HStack spacing={4}>
          <IconButton
            aria-label="กลับ"
            icon={<FiArrowLeft />}
            onClick={() => router.back()}
            variant="ghost"
          />
          <VStack align="start" spacing={0}>
            <Heading size="lg">ออเดอร์ {order.order_number}</Heading>
            <Text color="gray.500">รายละเอียดและสถานะออเดอร์</Text>
          </VStack>
        </HStack>
        <HStack spacing={3}>
          <Button
            leftIcon={<FiDownload />}
            variant="outline"
            onClick={handlePrint}
          >
            พิมพ์
          </Button>
          <Button
            leftIcon={<FiEdit2 />}
            colorScheme="blue"
            onClick={onStatusOpen}
          >
            เปลี่ยนสถานะ
          </Button>
        </HStack>
      </HStack>

      {/* Order Status & Info */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        <Card>
          <CardHeader>
            <Heading size="md">ข้อมูลออเดอร์</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Text fontWeight="semibold">สถานะ:</Text>
                <Badge colorScheme={getStatusColor(order.status)} size="lg">
                  {getStatusText(order.status)}
                </Badge>
              </HStack>

              <HStack justify="space-between">
                <Text fontWeight="semibold">วิธีการชำระเงิน:</Text>
                <Text>{getPaymentMethodText(order.payment_method)}</Text>
              </HStack>

              <HStack justify="space-between">
                <Text fontWeight="semibold">สถานะการชำระเงิน:</Text>
                <Badge
                  colorScheme={getPaymentStatusColor(order.payment_status)}
                >
                  {getPaymentStatusText(order.payment_status)}
                </Badge>
              </HStack>

              <Divider />

              <HStack spacing={1}>
                <FiCalendar />
                <Text fontWeight="semibold">วันที่สั่งซื้อ:</Text>
                <Text>
                  {order.created_at
                    ? new Date(order.created_at).toLocaleDateString("th-TH")
                    : "-"}
                </Text>
              </HStack>

              <HStack spacing={1}>
                <FiClock />
                <Text fontWeight="semibold">เวลา:</Text>
                <Text>
                  {order.created_at
                    ? new Date(order.created_at).toLocaleTimeString("th-TH")
                    : "-"}
                </Text>
              </HStack>

              <HStack spacing={1}>
                <FiPackage />
                <Text fontWeight="semibold">ประเภทลูกค้า:</Text>
                <Text>{getCustomerTypeText(order.customer_type)}</Text>
              </HStack>

              {order.shop_name && (
                <HStack spacing={1}>
                  <Text fontWeight="semibold">ชื่อร้านค้า:</Text>
                  <Text>{order.shop_name}</Text>
                </HStack>
              )}

              {order.shop_type && (
                <HStack spacing={1}>
                  <Text fontWeight="semibold">ประเภทร้านค้า:</Text>
                  <Text>{getShopTypeText(order.shop_type)}</Text>
                </HStack>
              )}

              {order.delivery_method && (
                <HStack spacing={1}>
                  <Text fontWeight="semibold">วิธีการจัดส่ง:</Text>
                  <Text>{order.delivery_method}</Text>
                </HStack>
              )}

              {order.delivery_date && (
                <HStack spacing={1}>
                  <Text fontWeight="semibold">วันที่จัดส่ง:</Text>
                  <Text>{new Date(order.delivery_date).toLocaleDateString("th-TH")}</Text>
                </HStack>
              )}

              {order.priority && (
                <HStack spacing={1}>
                  <Text fontWeight="semibold">ความสำคัญ:</Text>
                  <Badge colorScheme={getPriorityColor(order.priority)}>
                    {getPriorityText(order.priority)}
                  </Badge>
                </HStack>
              )}

              {order.sales_rep && (
                <HStack spacing={1}>
                  <Text fontWeight="semibold">พนักงานขาย:</Text>
                  <Text>{order.sales_rep}</Text>
                </HStack>
              )}

              {order.notes && (
                <>
                  <Divider />
                  <VStack align="stretch" spacing={2}>
                    <Text fontWeight="semibold">หมายเหตุ:</Text>
                    <Text color="gray.600" fontSize="sm">
                      {order.notes}
                    </Text>
                  </VStack>
                </>
              )}

              {order.internal_notes && (
                <>
                  <Divider />
                  <VStack align="stretch" spacing={2}>
                    <Text fontWeight="semibold">หมายเหตุภายใน:</Text>
                    <Text color="red.600" fontSize="sm">
                      {order.internal_notes}
                    </Text>
                  </VStack>
                </>
              )}
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">ข้อมูลลูกค้า</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack spacing={1}>
                <FiUser />
                <Text fontWeight="semibold">ชื่อ:</Text>
                <Text>{order.customer_name}</Text>
              </HStack>

              <HStack spacing={1}>
                <FiPhone />
                <Text fontWeight="semibold">โทรศัพท์:</Text>
                <Text>{order.customer_phone}</Text>
              </HStack>

              {order.customer_email && (
                <HStack spacing={1}>
                  <FiMail />
                  <Text fontWeight="semibold">อีเมล:</Text>
                  <Text>{order.customer_email}</Text>
                </HStack>
              )}

              <Divider />

              <VStack align="stretch" spacing={2}>
                <HStack spacing={1}>
                  <FiMapPin />
                  <Text fontWeight="semibold">สาขา:</Text>
                </HStack>
                 <Text fontWeight="medium">{(order as any).branch?.name || "N/A"}</Text>
                 <Text fontSize="sm" color="gray.600">
                   {(order as any).branch?.address || ""}
                 </Text>
                <Text fontSize="sm" color="gray.600">
                   โทร: {(order as any).branch?.phone || ""}
                </Text>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <Heading size="md">รายการสินค้า</Heading>
        </CardHeader>
        <CardBody>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>สินค้า</Th>
                <Th>SKU</Th>
                <Th isNumeric>ราคาต่อหน่วย</Th>
                <Th isNumeric>จำนวน</Th>
                <Th isNumeric>รวม</Th>
              </Tr>
            </Thead>
            <Tbody>
               {((order as any).items || []).map((item: any) => (
                <Tr key={item.id}>
                  <Td>
                    <HStack spacing={3}>
                      {item.product?.images?.[0] && (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product_name}
                          boxSize="50px"
                          objectFit="cover"
                          borderRadius="md"
                        />
                      )}
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="semibold">{item.product_name}</Text>
                      </VStack>
                    </HStack>
                  </Td>
                  <Td>
                    <Text fontSize="sm" color="gray.600">
                      {item.product?.sku || "-"}
                    </Text>
                  </Td>
                  <Td isNumeric>
                    <Text>฿{item.unit_price.toLocaleString()}</Text>
                  </Td>
                  <Td isNumeric>
                    <Text>{item.quantity}</Text>
                  </Td>
                  <Td isNumeric>
                    <Text fontWeight="semibold">
                      ฿{item.total_price.toLocaleString()}
                    </Text>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>

          <Divider my={6} />

          {/* Order Summary */}
          <VStack align="end" spacing={2}>
            <HStack justify="space-between" w={{ base: "100%", md: "300px" }}>
              <Text>ยอดรวมย่อย:</Text>
              <Text>฿{order.subtotal.toLocaleString()}</Text>
            </HStack>

            <HStack justify="space-between" w={{ base: "100%", md: "300px" }}>
              <Text>ภาษี (7%):</Text>
              <Text>฿{order.tax.toLocaleString()}</Text>
            </HStack>

            {order.discount_amount > 0 && (
              <HStack justify="space-between" w={{ base: "100%", md: "300px" }}>
                <Text>ส่วนลด:</Text>
                <Text color="red.500">-฿{order.discount_amount.toLocaleString()}</Text>
              </HStack>
            )}

            <Divider w={{ base: "100%", md: "300px" }} />

            <HStack justify="space-between" w={{ base: "100%", md: "300px" }}>
              <Text fontSize="lg" fontWeight="bold">
                ยอดรวมทั้งหมด:
              </Text>
              <Text fontSize="lg" fontWeight="bold" color="blue.600">
                ฿{order.total.toLocaleString()}
              </Text>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Update Status Modal */}
      <Modal isOpen={isStatusOpen} onClose={onStatusClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>เปลี่ยนสถานะออเดอร์</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>สถานะปัจจุบัน</FormLabel>
                <HStack>
                  <Badge colorScheme={getStatusColor(order.status)}>
                    {getStatusText(order.status)}
                  </Badge>
                </HStack>
              </FormControl>

              <FormControl>
                <FormLabel>สถานะใหม่</FormLabel>
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                >
                  <option value="pending">รอดำเนินการ</option>
                  <option value="confirmed">ยืนยันแล้ว</option>
                  <option value="processing">กำลังจัดเตรียม</option>
                  <option value="ready">พร้อมส่ง</option>
                  <option value="delivering">กำลังจัดส่ง</option>
                  <option value="completed">สำเร็จ</option>
                  <option value="cancelled">ยกเลิก</option>
                  <option value="refunded">คืนเงิน</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onStatusClose}>
              ยกเลิก
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleStatusUpdate}
              isLoading={isUpdatingStatus}
              loadingText="กำลังอัปเดต"
            >
              บันทึก
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

const OrderDetail: NextPageWithLayout = () => {
  return <OrderDetailPage />;
};

OrderDetail.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="รายละเอียดออเดอร์">{page}</Layout>;
};

export default withAuth(OrderDetail);