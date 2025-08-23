import React, { useState } from "react";
import { ReactElement } from "react";
import { NextPageWithLayout } from "../../_app";
import Layout from "../../../components/Layout";
import { withAuth } from "../../../lib/auth";
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
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  Textarea,
  useDisclosure,
  Flex,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Divider,
  Image,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Switch,
} from "@chakra-ui/react";
import {
  FiArrowLeft,
  FiEdit2,
  FiSave,
  FiPackage,
  FiDollarSign,
  FiBarChart,
  FiCalendar,
  FiTrendingUp,
  FiTrendingDown,
  FiAlertTriangle,
  FiCheck,
  FiX,
  FiPlus,
  FiMinus,
} from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
// import { useProduct } from "../../../lib/hooks/useDatabase";

// Mock product data (replace with real API call using productService.getById)
const mockProduct = {
  id: "prod-1",
  name: "กาแฟอเมริกาโน",
  description:
    "กาแฟอเมริกาโนคุณภาพพรีเมียม คั่วสดทุกวัน รสชาติเข้มข้น หอมกรุ่น เหมาะสำหรับผู้ที่ชื่นชอบรสกาแฟแท้",
  sku: "COFFEE-AMR-001",
  price: 65,
  cost: 25,
  stock: 150,
  min_stock: 20,
  status: "active",
  images: [
    "https://images.unsplash.com/photo-1551030173-122aabc4489c?w=400&h=400&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=400&fit=crop&crop=center",
    "https://images.unsplash.com/photo-1510707577719-ae7c14805e76?w=400&h=400&fit=crop&crop=center",
  ],
  barcode: "1234567890123",
  tags: ["กาแฟ", "เครื่องดื่มร้อน", "คาเฟอีน"],
  category_id: "cat-1",
  category: {
    id: "cat-1",
    name: "เครื่องดื่มร้อน",
  },
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-15T10:30:00Z",
};

// Mock sales data
const mockSalesData = [
  { period: "วันนี้", quantity: 15, revenue: 975 },
  { period: "เมื่อวาน", quantity: 18, revenue: 1170 },
  { period: "สัปดาห์นี้", quantity: 89, revenue: 5785 },
  { period: "สัปดาห์ที่แล้ว", quantity: 102, revenue: 6630 },
  { period: "เดือนนี้", quantity: 342, revenue: 22230 },
  { period: "เดือนที่แล้ว", quantity: 398, revenue: 25870 },
];

// Mock stock history
const mockStockHistory = [
  {
    id: "1",
    date: "2024-01-15",
    type: "sale",
    quantity: -5,
    remaining: 150,
    note: "ขายผ่านระบบ POS",
  },
  {
    id: "2",
    date: "2024-01-14",
    type: "restock",
    quantity: +50,
    remaining: 155,
    note: "เติมสต็อกจากคลัง",
  },
  {
    id: "3",
    date: "2024-01-13",
    type: "adjustment",
    quantity: -3,
    remaining: 105,
    note: "ปรับปรุงสต็อก - สินค้าเสียหาย",
  },
];

const ProductDetailPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { id } = router.query;
  const toast = useToast();

  // Use real API call when ready - replace mock data
  // const { data: productFromAPI, isLoading, error } = useProduct(id as string);
  const [product, setProduct] = useState(mockProduct); // Replace with: const product = productFromAPI || mockProduct;
  const [isEditing, setIsEditing] = useState(false);
  const [stockAdjustment, setStockAdjustment] = useState({
    quantity: 0,
    note: "",
  });
  const [editFormData, setEditFormData] = useState({
    name: product.name,
    description: product.description,
    price: product.price,
    cost: product.cost,
    stock: product.stock,
    min_stock: product.min_stock,
    status: product.status,
    barcode: product.barcode,
    tags: product.tags.join(", "),
  });

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const {
    isOpen: isStockOpen,
    onOpen: onStockOpen,
    onClose: onStockClose,
  } = useDisclosure();

  const handleEditSave = async () => {
    // Simulate API call
    setTimeout(() => {
      setProduct({
        ...product,
        ...editFormData,
        tags: editFormData.tags.split(",").map((tag) => tag.trim()),
      });
      onEditClose();
      toast({
        title: "สำเร็จ",
        description: "บันทึกข้อมูลสินค้าเรียบร้อยแล้ว",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }, 1000);
  };

  const handleStockAdjustment = async () => {
    // Simulate API call
    setTimeout(() => {
      const newStock = product.stock + stockAdjustment.quantity;
      setProduct({ ...product, stock: newStock });
      setStockAdjustment({ quantity: 0, note: "" });
      onStockClose();
      toast({
        title: "สำเร็จ",
        description: "ปรับปรุงสต็อกเรียบร้อยแล้ว",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }, 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "green";
      case "inactive":
        return "red";
      case "discontinued":
        return "gray";
      default:
        return "gray";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "ใช้งาน";
      case "inactive":
        return "ไม่ใช้งาน";
      case "discontinued":
        return "หยุดจำหน่าย";
      default:
        return status;
    }
  };

  const getStockStatus = () => {
    if (product.stock <= 0) return { color: "red", text: "หมด", icon: FiX };
    if (product.stock <= product.min_stock)
      return { color: "yellow", text: "ใกล้หมด", icon: FiAlertTriangle };
    return { color: "green", text: "พอเพียง", icon: FiCheck };
  };

  const stockStatus = getStockStatus();
  const profitMargin =
    product.price > 0
      ? ((product.price - product.cost) / product.price) * 100
      : 0;

  if (!product) {
    return (
      <Box p={8} textAlign="center">
        <Spinner size="xl" />
        <Text mt={4}>กำลังโหลดข้อมูลสินค้า...</Text>
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
            <Heading size="lg">{product.name}</Heading>
            <Text color="gray.500">รายละเอียดและสถิติสินค้า</Text>
          </VStack>
        </HStack>
        <HStack spacing={3}>
          <Button
            leftIcon={<FiPackage />}
            variant="outline"
            onClick={onStockOpen}
          >
            ปรับสต็อก
          </Button>
          <Button
            leftIcon={<FiEdit2 />}
            colorScheme="blue"
            onClick={onEditOpen}
          >
            แก้ไขข้อมูล
          </Button>
        </HStack>
      </HStack>

      <SimpleGrid columns={{ base: 1, xl: 3 }} spacing={6}>
        {/* Product Info */}
        <Box gridColumn={{ base: 1, xl: "1 / 3" }}>
          <Card>
            <CardHeader>
              <Heading size="md">ข้อมูลสินค้า</Heading>
            </CardHeader>
            <CardBody>
              <HStack align="start" spacing={6}>
                {/* Product Images */}
                <VStack spacing={4}>
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    boxSize="200px"
                    objectFit="cover"
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="gray.200"
                  />
                  {product.images.length > 1 && (
                    <HStack spacing={2}>
                      {product.images.slice(1).map((image, index) => (
                        <Image
                          key={index}
                          src={image}
                          alt={`${product.name} ${index + 2}`}
                          boxSize="60px"
                          objectFit="cover"
                          borderRadius="md"
                          border="1px solid"
                          borderColor="gray.200"
                          cursor="pointer"
                          _hover={{ borderColor: "blue.500" }}
                        />
                      ))}
                    </HStack>
                  )}
                </VStack>

                {/* Product Details */}
                <VStack align="start" spacing={4} flex={1}>
                  <HStack justify="space-between" w="100%">
                    <Badge
                      colorScheme={getStatusColor(product.status)}
                      size="lg"
                    >
                      {getStatusText(product.status)}
                    </Badge>
                    <Badge colorScheme={stockStatus.color}>
                      <HStack spacing={1}>
                        <stockStatus.icon size={12} />
                        <Text>{stockStatus.text}</Text>
                      </HStack>
                    </Badge>
                  </HStack>

                  <SimpleGrid columns={2} spacing={4} w="100%">
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="semibold" color="gray.600">
                        SKU:
                      </Text>
                      <Text>{product.sku}</Text>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="semibold" color="gray.600">
                        หมวดหมู่:
                      </Text>
                      <Text>{product.category.name}</Text>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="semibold" color="gray.600">
                        ราคาขาย:
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color="blue.600">
                        ฿{product.price.toLocaleString()}
                      </Text>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="semibold" color="gray.600">
                        ต้นทุน:
                      </Text>
                      <Text>฿{product.cost.toLocaleString()}</Text>
                    </VStack>
                  </SimpleGrid>

                  {product.description && (
                    <VStack align="start" spacing={2} w="100%">
                      <Text fontWeight="semibold" color="gray.600">
                        คำอธิบาย:
                      </Text>
                      <Text color="gray.700">{product.description}</Text>
                    </VStack>
                  )}

                  {product.tags && product.tags.length > 0 && (
                    <VStack align="start" spacing={2} w="100%">
                      <Text fontWeight="semibold" color="gray.600">
                        แท็ก:
                      </Text>
                      <HStack wrap="wrap">
                        {product.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            colorScheme="blue"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </HStack>
                    </VStack>
                  )}
                </VStack>
              </HStack>
            </CardBody>
          </Card>
        </Box>

        {/* Stats */}
        <VStack spacing={6}>
          <Card w="100%">
            <CardHeader>
              <Heading size="md">สถิติสินค้า</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Stat>
                  <StatLabel>สต็อกคงเหลือ</StatLabel>
                  <StatNumber>{product.stock}</StatNumber>
                  <StatHelpText>
                    ขั้นต่ำ: {product.min_stock} หน่วย
                  </StatHelpText>
                </Stat>

                <Divider />

                <Stat>
                  <StatLabel>อัตรากำไร</StatLabel>
                  <StatNumber>{profitMargin.toFixed(1)}%</StatNumber>
                  <StatHelpText>
                    กำไรต่อหน่วย: ฿
                    {(product.price - product.cost).toLocaleString()}
                  </StatHelpText>
                </Stat>

                <Divider />

                <VStack align="start" spacing={2}>
                  <Text fontWeight="semibold" color="gray.600">
                    วันที่สร้าง:
                  </Text>
                  <Text fontSize="sm">
                    {new Date(product.created_at).toLocaleDateString("th-TH")}
                  </Text>

                  <Text fontWeight="semibold" color="gray.600">
                    อัปเดตล่าสุด:
                  </Text>
                  <Text fontSize="sm">
                    {formatDistanceToNow(new Date(product.updated_at), {
                      addSuffix: true,
                      locale: th,
                    })}
                  </Text>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </SimpleGrid>

      {/* Tabs for Sales Data and Stock History */}
      <Card>
        <Tabs>
          <TabList>
            <Tab>สถิติการขาย</Tab>
            <Tab>ประวัติสต็อก</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {mockSalesData.map((data, index) => {
                  const prevData = index > 0 ? mockSalesData[index - 1] : null;
                  const quantityChange = prevData
                    ? data.quantity - prevData.quantity
                    : 0;
                  const revenueChange = prevData
                    ? data.revenue - prevData.revenue
                    : 0;

                  return (
                    <Card key={index}>
                      <CardBody>
                        <Stat>
                          <StatLabel>{data.period}</StatLabel>
                          <StatNumber>{data.quantity} หน่วย</StatNumber>
                          <StatHelpText>
                            <StatArrow
                              type={
                                quantityChange >= 0 ? "increase" : "decrease"
                              }
                            />
                            ฿{data.revenue.toLocaleString()}
                          </StatHelpText>
                        </Stat>
                      </CardBody>
                    </Card>
                  );
                })}
              </SimpleGrid>
            </TabPanel>

            <TabPanel>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>วันที่</Th>
                    <Th>ประเภท</Th>
                    <Th isNumeric>เปลี่ยนแปลง</Th>
                    <Th isNumeric>คงเหลือ</Th>
                    <Th>หมายเหตุ</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {mockStockHistory.map((history) => (
                    <Tr key={history.id}>
                      <Td>
                        {new Date(history.date).toLocaleDateString("th-TH")}
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={
                            history.type === "sale"
                              ? "red"
                              : history.type === "restock"
                              ? "green"
                              : "yellow"
                          }
                        >
                          {history.type === "sale"
                            ? "ขาย"
                            : history.type === "restock"
                            ? "เติมสต็อก"
                            : "ปรับปรุง"}
                        </Badge>
                      </Td>
                      <Td isNumeric>
                        <Text
                          color={history.quantity > 0 ? "green.500" : "red.500"}
                        >
                          {history.quantity > 0 ? "+" : ""}
                          {history.quantity}
                        </Text>
                      </Td>
                      <Td isNumeric>{history.remaining}</Td>
                      <Td>{history.note}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>

      {/* Edit Product Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>แก้ไขข้อมูลสินค้า</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <VStack spacing={4} align="stretch">
              <SimpleGrid columns={2} spacing={4}>
                <FormControl>
                  <FormLabel>ชื่อสินค้า</FormLabel>
                  <Input
                    value={editFormData.name}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        name: e.target.value,
                      })
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>สถานะ</FormLabel>
                  <Select
                    value={editFormData.status}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        status: e.target.value,
                      })
                    }
                  >
                    <option value="active">ใช้งาน</option>
                    <option value="inactive">ไม่ใช้งาน</option>
                    <option value="discontinued">หยุดจำหน่าย</option>
                  </Select>
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>คำอธิบาย</FormLabel>
                <Textarea
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </FormControl>

              <SimpleGrid columns={2} spacing={4}>
                <FormControl>
                  <FormLabel>ราคาขาย (฿)</FormLabel>
                  <NumberInput
                    value={editFormData.price}
                    onChange={(_, value) =>
                      setEditFormData({
                        ...editFormData,
                        price: value,
                      })
                    }
                    min={0}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>ต้นทุน (฿)</FormLabel>
                  <NumberInput
                    value={editFormData.cost}
                    onChange={(_, value) =>
                      setEditFormData({
                        ...editFormData,
                        cost: value,
                      })
                    }
                    min={0}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </SimpleGrid>

              <SimpleGrid columns={2} spacing={4}>
                <FormControl>
                  <FormLabel>สต็อก</FormLabel>
                  <NumberInput
                    value={editFormData.stock}
                    onChange={(_, value) =>
                      setEditFormData({
                        ...editFormData,
                        stock: value,
                      })
                    }
                    min={0}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl>
                  <FormLabel>สต็อกขั้นต่ำ</FormLabel>
                  <NumberInput
                    value={editFormData.min_stock}
                    onChange={(_, value) =>
                      setEditFormData({
                        ...editFormData,
                        min_stock: value,
                      })
                    }
                    min={0}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>บาร์โค้ด</FormLabel>
                <Input
                  value={editFormData.barcode}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      barcode: e.target.value,
                    })
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>แท็ก (คั่นด้วยจุลภาค)</FormLabel>
                <Input
                  value={editFormData.tags}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      tags: e.target.value,
                    })
                  }
                  placeholder="กาแฟ, เครื่องดื่มร้อน, คาเฟอีน"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onEditClose}>
              ยกเลิก
            </Button>
            <Button colorScheme="blue" onClick={handleEditSave}>
              บันทึก
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Stock Adjustment Modal */}
      <Modal isOpen={isStockOpen} onClose={onStockClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>ปรับปรุงสต็อก</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Text fontWeight="semibold">สต็อกปัจจุบัน:</Text>
                <Text fontSize="lg" fontWeight="bold">
                  {product.stock} หน่วย
                </Text>
              </HStack>

              <FormControl>
                <FormLabel>จำนวนที่ต้องการปรับ</FormLabel>
                <HStack>
                  <IconButton
                    aria-label="ลด"
                    icon={<FiMinus />}
                    onClick={() =>
                      setStockAdjustment({
                        ...stockAdjustment,
                        quantity: stockAdjustment.quantity - 1,
                      })
                    }
                  />
                  <NumberInput
                    value={stockAdjustment.quantity}
                    onChange={(_, value) =>
                      setStockAdjustment({
                        ...stockAdjustment,
                        quantity: value,
                      })
                    }
                    flex={1}
                  >
                    <NumberInputField textAlign="center" />
                  </NumberInput>
                  <IconButton
                    aria-label="เพิ่ม"
                    icon={<FiPlus />}
                    onClick={() =>
                      setStockAdjustment({
                        ...stockAdjustment,
                        quantity: stockAdjustment.quantity + 1,
                      })
                    }
                  />
                </HStack>
              </FormControl>

              <FormControl>
                <FormLabel>หมายเหตุ</FormLabel>
                <Textarea
                  value={stockAdjustment.note}
                  onChange={(e) =>
                    setStockAdjustment({
                      ...stockAdjustment,
                      note: e.target.value,
                    })
                  }
                  placeholder="เหตุผลในการปรับปรุงสต็อก..."
                  rows={3}
                />
              </FormControl>

              {stockAdjustment.quantity !== 0 && (
                <Alert
                  status={stockAdjustment.quantity > 0 ? "success" : "warning"}
                >
                  <AlertIcon />
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="semibold">
                      สต็อกหลังการปรับ:{" "}
                      {product.stock + stockAdjustment.quantity} หน่วย
                    </Text>
                    <Text fontSize="sm">
                      {stockAdjustment.quantity > 0 ? "เพิ่ม" : "ลด"}{" "}
                      {Math.abs(stockAdjustment.quantity)} หน่วย
                    </Text>
                  </VStack>
                </Alert>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onStockClose}>
              ยกเลิก
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleStockAdjustment}
              isDisabled={stockAdjustment.quantity === 0}
            >
              บันทึก
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

const ProductDetail: NextPageWithLayout = () => {
  return <ProductDetailPage />;
};

ProductDetail.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="รายละเอียดสินค้า">{page}</Layout>;
};

export default withAuth(ProductDetail);
