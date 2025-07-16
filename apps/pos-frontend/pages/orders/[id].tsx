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
import { SalesTransaction } from "@shopflow/types";
import { formatCurrency } from "../../lib/sales";

interface RefundItem {
  itemId: string;
  quantity: number;
  reason: string;
  amount: number;
}

const OrderDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState<SalesTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [refundItems, setRefundItems] = useState<RefundItem[]>([]);
  const [refundReason, setRefundReason] = useState("");
  const [refundNotes, setRefundNotes] = useState("");
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    if (id) {
      loadOrderDetails();
    }
  }, [id]);

  const loadOrderDetails = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock order data
      const mockOrder: SalesTransaction = {
        id: id as string,
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
            {
              id: "item_002",
              product: {
                id: "prod_002",
                name: "ขนมปังโฮลวีท",
                description: "ขนมปังโฮลวีท 100%",
                price: 25,
                barcode: "1234567890002",
                category: "ขนมปัง",
                stock: 30,
                isActive: true,
                taxRate: 0.07,
                discountEligible: true,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
              quantity: 1,
              unitPrice: 25,
              discountAmount: 2.5,
              discountPercentage: 10,
              taxAmount: 1.75,
              subtotal: 25,
              total: 22.5,
            },
          ],
          subtotal: 115,
          discountAmount: 2.5,
          taxAmount: 8.05,
          total: 112.5,
          itemCount: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        payments: [
          {
            id: "pay_001",
            type: "cash",
            amount: 112.5,
            received: 120,
            change: 7.5,
            status: "completed",
            createdAt: new Date(),
          },
        ],
        customer: {
          id: "cust_001",
          name: "คุณสมชาย ใจดี",
          phone: "081-234-5678",
          email: "somchai@example.com",
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
          emailSent: true,
          receiptNumber: "R20241201001",
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        notes: "ลูกค้าขอให้กาแฟร้อนพิเศษ",
      };

      setOrder(mockOrder);
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดรายละเอียดคำสั่งซื้อได้",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
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

  const handleRefundToggle = (
    itemId: string,
    quantity: number,
    maxQuantity: number
  ) => {
    setRefundItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.itemId === itemId);
      if (existingIndex >= 0) {
        // Update existing refund item
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: Math.min(quantity, maxQuantity),
        };
        return updated;
      } else {
        // Add new refund item
        const item = order?.cart.items.find((i) => i.id === itemId);
        if (item) {
          return [
            ...prev,
            {
              itemId,
              quantity: Math.min(quantity, maxQuantity),
              reason: "",
              amount: item.unitPrice * Math.min(quantity, maxQuantity),
            },
          ];
        }
        return prev;
      }
    });
  };

  const handleRefundSubmit = async () => {
    if (refundItems.length === 0) {
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
      // Simulate refund processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const totalRefund = refundItems.reduce(
        (sum, item) => sum + item.amount,
        0
      );

      toast({
        title: "คืนเงินสำเร็จ",
        description: `คืนเงินจำนวน ${formatCurrency(
          totalRefund
        )} เรียบร้อยแล้ว`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      onClose();
      setRefundItems([]);
      setRefundReason("");
      setRefundNotes("");

      // Update order status
      if (order) {
        setOrder((prev) => (prev ? { ...prev, status: "refunded" } : null));
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถดำเนินการคืนเงินได้",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
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

  const formatDate = (date: Date) => {
    return date.toLocaleString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <POSLayout title="รายละเอียดคำสั่งซื้อ">
        <Box py={10}>
          <LoadingSpinner />
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
            <BreadcrumbLink>{order.transactionNumber}</BreadcrumbLink>
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
                {order.transactionNumber}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {formatDate(order.createdAt)}
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
            {order.customer?.email && (
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
                    {order.transactionNumber}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    เลขที่ใบเสร็จ:
                  </Text>
                  <Text fontSize="sm" fontWeight="medium">
                    {order.receipt?.receiptNumber}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    วันที่สร้าง:
                  </Text>
                  <Text fontSize="sm">{formatDate(order.createdAt)}</Text>
                </HStack>
                {order.completedAt && (
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">
                      วันที่เสร็จสิ้น:
                    </Text>
                    <Text fontSize="sm">{formatDate(order.completedAt)}</Text>
                  </HStack>
                )}
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    พนักงาน:
                  </Text>
                  <Text fontSize="sm">{order.cashier.name}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    สาขา:
                  </Text>
                  <Text fontSize="sm">{order.branch.name}</Text>
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
                  {order.cart.items.map((item) => (
                    <Tr key={item.id}>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="medium">{item.product.name}</Text>
                          <Text fontSize="xs" color="gray.500">
                            {item.product.description}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>{formatCurrency(item.unitPrice)}</Td>
                      <Td>{item.quantity}</Td>
                      <Td>
                        {item.discountAmount > 0 ? (
                          <Text color="red.500">
                            -{formatCurrency(item.discountAmount)}
                          </Text>
                        ) : (
                          "-"
                        )}
                      </Td>
                      <Td fontWeight="medium">{formatCurrency(item.total)}</Td>
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
                    {formatCurrency(order.cart.subtotal)}
                  </Text>
                </HStack>
                {order.cart.discountAmount > 0 && (
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.600">
                      ส่วนลด:
                    </Text>
                    <Text fontSize="sm" color="red.500">
                      -{formatCurrency(order.cart.discountAmount)}
                    </Text>
                  </HStack>
                )}
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    ภาษี:
                  </Text>
                  <Text fontSize="sm">
                    {formatCurrency(order.cart.taxAmount)}
                  </Text>
                </HStack>
                <Divider />
                <HStack justify="space-between">
                  <Text fontSize="md" fontWeight="bold">
                    ยอดสุทธิ:
                  </Text>
                  <Text fontSize="md" fontWeight="bold">
                    {formatCurrency(order.cart.total)}
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
                {order.payments.map((payment, index) => (
                  <Box key={index}>
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="sm" color="gray.600">
                        วิธีการ:
                      </Text>
                      <Text fontSize="sm">{getPaymentMethodText(payment)}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">
                        จำนวน:
                      </Text>
                      <Text fontSize="sm" fontWeight="medium">
                        {formatCurrency(payment.amount)}
                      </Text>
                    </HStack>
                    {payment.type === "cash" && payment.received && (
                      <>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">
                            เงินที่รับ:
                          </Text>
                          <Text fontSize="sm">
                            {formatCurrency(payment.received)}
                          </Text>
                        </HStack>
                        <HStack justify="space-between">
                          <Text fontSize="sm" color="gray.600">
                            เงินทอน:
                          </Text>
                          <Text fontSize="sm">
                            {formatCurrency(payment.change || 0)}
                          </Text>
                        </HStack>
                      </>
                    )}
                    {payment.type === "card" && payment.cardLastFour && (
                      <HStack justify="space-between">
                        <Text fontSize="sm" color="gray.600">
                          บัตรเลขที่:
                        </Text>
                        <Text fontSize="sm">****{payment.cardLastFour}</Text>
                      </HStack>
                    )}
                  </Box>
                ))}
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
              <Text>คืนเงิน - {order.transactionNumber}</Text>
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
                  {order.cart.items.map((item) => (
                    <Card key={item.id}>
                      <CardBody>
                        <HStack justify="space-between" align="start">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="medium">{item.product.name}</Text>
                            <Text fontSize="sm" color="gray.500">
                              {formatCurrency(item.unitPrice)} x {item.quantity}{" "}
                              = {formatCurrency(item.total)}
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
                          const item = order.cart.items.find(
                            (i) => i.id === refundItem.itemId
                          );
                          return item ? (
                            <HStack
                              key={refundItem.itemId}
                              justify="space-between"
                            >
                              <Text fontSize="sm">
                                {item.product.name} x {refundItem.quantity}
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
