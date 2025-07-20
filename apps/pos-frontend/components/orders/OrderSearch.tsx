import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  useToast,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { IoSearch, IoEye, IoReceipt, IoTime } from "react-icons/io5";
import { SalesTransaction } from "@shopflow/types";
import { formatCurrency } from "../../lib/sales";

interface OrderSearchProps {
  onOrderSelect?: (order: SalesTransaction) => void;
  showSelectButton?: boolean;
  title?: string;
}

const OrderSearch: React.FC<OrderSearchProps> = ({
  onOrderSelect,
  showSelectButton = false,
  title = "ค้นหาคำสั่งซื้อ",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SalesTransaction[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SalesTransaction | null>(
    null
  );
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "กรุณาใส่คำค้นหา",
        description: "กรุณาใส่เลขที่คำสั่ง, เลขใบเสร็จ, หรือชื่อลูกค้า",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setSearching(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock search results
      const mockResults: SalesTransaction[] = [
        {
          id: "tx_001",
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
            ],
            subtotal: 90,
            discountAmount: 0,
            taxAmount: 6.3,
            total: 96.3,
            itemCount: 2,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          payments: [
            {
              id: "pay_001",
              type: "cash",
              amount: 96.3,
              received: 100,
              change: 3.7,
              status: "completed",
              createdAt: new Date(),
            },
          ],
          customer: {
            id: "cust_001",
            name: "คุณสมชาย ใจดี",
            phone: "081-234-5678",
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
            emailSent: false,
            receiptNumber: "R20241201001",
          },
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
      ];

      // Filter based on search term
      const filteredResults = mockResults.filter(
        (order) =>
          order.transactionNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.receipt?.receiptNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.customer?.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.customer?.phone.includes(searchTerm)
      );

      setSearchResults(filteredResults);

      if (filteredResults.length === 0) {
        toast({
          title: "ไม่พบข้อมูล",
          description: "ไม่พบคำสั่งซื้อที่ตรงกับคำค้นหา",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถค้นหาข้อมูลได้",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setSearching(false);
    }
  };

  const handleViewDetails = (order: SalesTransaction) => {
    setSelectedOrder(order);
    onOpen();
  };

  const handleSelectOrder = (order: SalesTransaction) => {
    if (onOrderSelect) {
      onOrderSelect(order);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
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

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        <Text fontSize="lg" fontWeight="bold">
          {title}
        </Text>

        {/* Search Input */}
        <HStack spacing={3}>
          <InputGroup>
            <InputLeftElement>
              <IoSearch />
            </InputLeftElement>
            <Input
              placeholder="ค้นหาด้วยเลขที่คำสั่ง, เลขใบเสร็จ, ชื่อลูกค้า, หรือเบอร์โทร"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </InputGroup>
          <Button
            leftIcon={<IoSearch />}
            onClick={handleSearch}
            isLoading={searching}
            loadingText="ค้นหา..."
            colorScheme="blue"
          >
            ค้นหา
          </Button>
        </HStack>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Box
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="md"
            bg={cardBg}
            p={4}
          >
            <Text fontSize="md" fontWeight="medium" mb={3}>
              ผลการค้นหา ({searchResults.length} รายการ)
            </Text>
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>เลขที่คำสั่ง</Th>
                    <Th>วันที่/เวลา</Th>
                    <Th>ลูกค้า</Th>
                    <Th>ยอดรวม</Th>
                    <Th>สถานะ</Th>
                    <Th>จัดการ</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {searchResults.map((order) => (
                    <Tr key={order.id} _hover={{ bg: hoverBg }}>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" fontWeight="medium">
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
                        <Text fontSize="sm">
                          {order.customer?.name || "ไม่ระบุ"}
                        </Text>
                        {order.customer?.phone && (
                          <Text fontSize="xs" color="gray.500">
                            {order.customer.phone}
                          </Text>
                        )}
                      </Td>
                      <Td>
                        <Text fontSize="sm" fontWeight="medium">
                          {formatCurrency(order.cart.total)}
                        </Text>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={getStatusColor(order.status)}
                          size="sm"
                        >
                          {getStatusText(order.status)}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Button
                            size="xs"
                            leftIcon={<IoEye />}
                            onClick={() => handleViewDetails(order)}
                            variant="ghost"
                          >
                            ดู
                          </Button>
                          {showSelectButton && (
                            <Button
                              size="xs"
                              colorScheme="blue"
                              onClick={() => handleSelectOrder(order)}
                            >
                              เลือก
                            </Button>
                          )}
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {/* No Results Message */}
        {searchResults.length === 0 && searchTerm && !searching && (
          <Alert status="info">
            <AlertIcon />
            <AlertTitle>ไม่พบข้อมูล</AlertTitle>
            <AlertDescription>
              ไม่พบคำสั่งซื้อที่ตรงกับคำค้นหา "{searchTerm}"
            </AlertDescription>
          </Alert>
        )}

        {/* Loading */}
        {searching && (
          <Center py={6}>
            <VStack spacing={2}>
              <Spinner />
              <Text fontSize="sm" color="gray.500">
                กำลังค้นหา...
              </Text>
            </VStack>
          </Center>
        )}
      </VStack>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack justify="space-between">
                <Text>รายละเอียดคำสั่งซื้อ</Text>
                <Badge colorScheme={getStatusColor(selectedOrder.status)}>
                  {getStatusText(selectedOrder.status)}
                </Badge>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                {/* Order Info */}
                <Box>
                  <Text fontSize="md" fontWeight="medium" mb={2}>
                    ข้อมูลคำสั่งซื้อ
                  </Text>
                  <VStack spacing={2} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm">เลขที่คำสั่ง:</Text>
                      <Text fontSize="sm" fontWeight="medium">
                        {selectedOrder.transactionNumber}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm">เลขใบเสร็จ:</Text>
                      <Text fontSize="sm" fontWeight="medium">
                        {selectedOrder.receipt?.receiptNumber}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm">วันที่/เวลา:</Text>
                      <Text fontSize="sm">
                        {formatDate(selectedOrder.createdAt)}
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text fontSize="sm">พนักงาน:</Text>
                      <Text fontSize="sm">{selectedOrder.cashier.name}</Text>
                    </HStack>
                    {selectedOrder.customer && (
                      <HStack justify="space-between">
                        <Text fontSize="sm">ลูกค้า:</Text>
                        <Text fontSize="sm">{selectedOrder.customer.name}</Text>
                      </HStack>
                    )}
                  </VStack>
                </Box>

                <Divider />

                {/* Items */}
                <Box>
                  <Text fontSize="md" fontWeight="medium" mb={2}>
                    รายการสินค้า
                  </Text>
                  <VStack spacing={2} align="stretch">
                    {selectedOrder.cart.items.map((item, index) => (
                      <HStack key={index} justify="space-between">
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" fontWeight="medium">
                            {item.product.name}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {formatCurrency(item.unitPrice)} x {item.quantity}
                          </Text>
                        </VStack>
                        <Text fontSize="sm" fontWeight="medium">
                          {formatCurrency(item.total)}
                        </Text>
                      </HStack>
                    ))}
                  </VStack>
                </Box>

                <Divider />

                {/* Summary */}
                <Box>
                  <Text fontSize="md" fontWeight="medium" mb={2}>
                    สรุปการชำระเงิน
                  </Text>
                  <VStack spacing={2} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm">ยอดรวม:</Text>
                      <Text fontSize="sm">
                        {formatCurrency(selectedOrder.cart.subtotal)}
                      </Text>
                    </HStack>
                    {selectedOrder.cart.discountAmount > 0 && (
                      <HStack justify="space-between">
                        <Text fontSize="sm">ส่วนลด:</Text>
                        <Text fontSize="sm" color="red.500">
                          -{formatCurrency(selectedOrder.cart.discountAmount)}
                        </Text>
                      </HStack>
                    )}
                    <HStack justify="space-between">
                      <Text fontSize="sm">ภาษี:</Text>
                      <Text fontSize="sm">
                        {formatCurrency(selectedOrder.cart.taxAmount)}
                      </Text>
                    </HStack>
                    <Divider />
                    <HStack justify="space-between">
                      <Text fontSize="md" fontWeight="bold">
                        ยอดสุทธิ:
                      </Text>
                      <Text fontSize="md" fontWeight="bold">
                        {formatCurrency(selectedOrder.cart.total)}
                      </Text>
                    </HStack>
                  </VStack>
                </Box>

                <Divider />

                {/* Payment Info */}
                <Box>
                  <Text fontSize="md" fontWeight="medium" mb={2}>
                    วิธีการชำระเงิน
                  </Text>
                  {selectedOrder.payments.map((payment, index) => (
                    <VStack key={index} spacing={2} align="stretch">
                      <HStack justify="space-between">
                        <Text fontSize="sm">วิธีการ:</Text>
                        <Text fontSize="sm">
                          {getPaymentMethodText(payment)}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm">จำนวน:</Text>
                        <Text fontSize="sm">
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
                  ))}
                </Box>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <HStack spacing={3}>
                {showSelectButton && (
                  <Button
                    colorScheme="blue"
                    onClick={() => {
                      handleSelectOrder(selectedOrder);
                      onClose();
                    }}
                  >
                    เลือกคำสั่งนี้
                  </Button>
                )}
                <Button onClick={onClose}>ปิด</Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default OrderSearch;
