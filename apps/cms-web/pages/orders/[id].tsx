import React, { useState } from "react";
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
// import { useOrder } from "../../lib/hooks/useDatabase";

// Mock order data (replace with real API call using orderService.getById)
const mockOrder = {
  id: "ORD-001",
  order_number: "ORD-001",
  total: 3500,
  subtotal: 3200,
  tax: 224,
  discount: 0,
  status: "completed",
  payment_method: "cash",
  payment_status: "paid",
  created_at: "2024-01-18T14:20:00Z",
  updated_at: "2024-01-18T14:45:00Z",
  customer_name: "สมชาย ใจดี",
  customer_phone: "089-123-4567",
  customer_email: "somchai@example.com",
  notes: "ขอใส่น้ำแข็งเพิ่ม",
  branch: {
    id: "branch-1",
    name: "สาขาหลัก",
    address: "123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร",
    phone: "02-123-4567",
  },
  items: [
    {
      id: "item-1",
      product_id: "prod-1",
      product_name: "กาแฟอเมริกาโน",
      quantity: 2,
      unit_price: 65,
      total_price: 130,
      product: {
        id: "prod-1",
        name: "กาแฟอเมริกาโน",
        sku: "COFFEE-AMR-001",
        images: [
          "https://images.unsplash.com/photo-1551030173-122aabc4489c?w=150&h=150&fit=crop&crop=center",
        ],
      },
    },
    {
      id: "item-2",
      product_id: "prod-2",
      product_name: "เค้กช็อกโกแลต",
      quantity: 1,
      unit_price: 120,
      total_price: 120,
      product: {
        id: "prod-2",
        name: "เค้กช็อกโกแลต",
        sku: "CAKE-CHO-001",
        images: [
          "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=150&h=150&fit=crop&crop=center",
        ],
      },
    },
  ],
};

const OrderDetailPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();

  // Use real API call when ready - replace mock data
  // const { data: orderFromAPI, isLoading, error } = useOrder(id as string);
  const [order] = useState(mockOrder); // Replace with: const order = orderFromAPI || mockOrder;
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState(order.status);

  const {
    isOpen: isStatusOpen,
    onOpen: onStatusOpen,
    onClose: onStatusClose,
  } = useDisclosure();

  const handleStatusUpdate = async () => {
    setIsUpdatingStatus(true);
    // Simulate API call
    setTimeout(() => {
      setIsUpdatingStatus(false);
      onStatusClose();
      toast({
        title: "สำเร็จ",
        description: "อัปเดตสถานะออเดอร์เรียบร้อยแล้ว",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "green";
      case "processing":
        return "blue";
      case "pending":
        return "orange";
      case "cancelled":
        return "red";
      default:
        return "gray";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "สำเร็จ";
      case "processing":
        return "กำลังดำเนินการ";
      case "pending":
        return "รอดำเนินการ";
      case "cancelled":
        return "ยกเลิก";
      default:
        return status;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case "cash":
        return "เงินสด";
      case "credit_card":
        return "บัตรเครดิต";
      case "debit_card":
        return "บัตรเดบิต";
      case "digital_wallet":
        return "กระเป๋าเงินดิจิทัล";
      default:
        return method;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!order) {
    return (
      <Box p={8} textAlign="center">
        <Spinner size="xl" />
        <Text mt={4}>กำลังโหลดข้อมูลออเดอร์...</Text>
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
                  colorScheme={
                    order.payment_status === "paid" ? "green" : "red"
                  }
                >
                  {order.payment_status === "paid" ? "ชำระแล้ว" : "ยังไม่ชำระ"}
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
                <Text fontWeight="medium">{order.branch.name}</Text>
                <Text fontSize="sm" color="gray.600">
                  {order.branch.address}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  โทร: {order.branch.phone}
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
              {order.items.map((item) => (
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

            {order.discount > 0 && (
              <HStack justify="space-between" w={{ base: "100%", md: "300px" }}>
                <Text>ส่วนลด:</Text>
                <Text color="red.500">-฿{order.discount.toLocaleString()}</Text>
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
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="pending">รอดำเนินการ</option>
                  <option value="processing">กำลังดำเนินการ</option>
                  <option value="completed">สำเร็จ</option>
                  <option value="cancelled">ยกเลิก</option>
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
