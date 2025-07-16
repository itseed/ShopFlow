import React, { useState } from "react";
import { ReactElement } from "react";
import { NextPageWithLayout } from "../_app";
import Layout from "../../components/Layout";
import { withAuth } from "../../lib/auth";
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
  FormControl,
  FormLabel,
  Input,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useToast,
  Flex,
  Badge,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  FiPlus,
  FiTrash2,
  FiArrowLeft,
  FiSave,
  FiUser,
  FiPackage,
  FiDollarSign,
} from "react-icons/fi";
import Link from "next/link";

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  total: number;
}

const CreateOrderPage: NextPageWithLayout = () => {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const toast = useToast();

  // Mock products data
  const products = [
    { id: "1", name: "กาแฟลาเต้", price: 65 },
    { id: "2", name: "ขนมปังโฮลวีท", price: 45 },
    { id: "3", name: "สลัดผลไม้", price: 85 },
    { id: "4", name: "ชาเขียวมัทฉะ", price: 55 },
    { id: "5", name: "แซนด์วิชทูน่า", price: 75 },
  ];

  const addItem = () => {
    if (!selectedProduct) {
      toast({
        title: "กรุณาเลือกสินค้า",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    const existingItem = items.find(
      (item) => item.productId === selectedProduct
    );
    if (existingItem) {
      setItems(
        items.map((item) =>
          item.productId === selectedProduct
            ? {
                ...item,
                quantity: item.quantity + quantity,
                total: (item.quantity + quantity) * item.price,
              }
            : item
        )
      );
    } else {
      const newItem: OrderItem = {
        id: Date.now().toString(),
        productId: selectedProduct,
        productName: product.name,
        price: product.price,
        quantity: quantity,
        total: product.price * quantity,
      };
      setItems([...items, newItem]);
    }

    setSelectedProduct("");
    setQuantity(1);
  };

  const removeItem = (itemId: string) => {
    setItems(items.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems(
      items.map((item) =>
        item.id === itemId
          ? { ...item, quantity: newQuantity, total: item.price * newQuantity }
          : item
      )
    );
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.07; // 7% VAT
  const total = subtotal + tax;

  const handleSaveOrder = () => {
    if (!customerName.trim()) {
      toast({
        title: "กรุณากรอกชื่อลูกค้า",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "กรุณาเพิ่มสินค้าอย่างน้อย 1 รายการ",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Save order logic here
    toast({
      title: "บันทึกคำสั่งซื้อสำเร็จ",
      description: "คำสั่งซื้อได้บันทึกแล้ว",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <HStack justify="space-between" align="start">
        <Box>
          <HStack spacing={4} mb={2}>
            <Link href="/orders">
              <Button leftIcon={<FiArrowLeft />} variant="ghost" size="sm">
                กลับ
              </Button>
            </Link>
            <Heading size="lg" fontFamily="heading">
              สร้างคำสั่งซื้อใหม่
            </Heading>
          </HStack>
          <Text color="gray.600">เพิ่มคำสั่งซื้อใหม่เข้าสู่ระบบ</Text>
        </Box>
        <HStack spacing={4}>
          <Button variant="outline" colorScheme="gray">
            ยกเลิก
          </Button>
          <Button
            leftIcon={<FiSave />}
            colorScheme="blue"
            onClick={handleSaveOrder}
          >
            บันทึกคำสั่งซื้อ
          </Button>
        </HStack>
      </HStack>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
        {/* Customer Info */}
        <Card
          borderRadius="2xl"
          border="1px"
          borderColor="gray.100"
          shadow="lg"
        >
          <CardHeader>
            <HStack spacing={3}>
              <Box p={2} bg="blue.100" borderRadius="md" color="blue.600">
                <FiUser size={20} />
              </Box>
              <Box>
                <Heading size="md" fontFamily="heading">
                  ข้อมูลลูกค้า
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  กรอกข้อมูลของลูกค้า
                </Text>
              </Box>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>ชื่อลูกค้า</FormLabel>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="กรอกชื่อลูกค้า"
                />
              </FormControl>
              <FormControl>
                <FormLabel>เบอร์โทร</FormLabel>
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="กรอกเบอร์โทร"
                />
              </FormControl>
              <FormControl>
                <FormLabel>อีเมล</FormLabel>
                <Input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="กรอกอีเมล"
                />
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        {/* Add Product */}
        <Card
          borderRadius="2xl"
          border="1px"
          borderColor="gray.100"
          shadow="lg"
        >
          <CardHeader>
            <HStack spacing={3}>
              <Box p={2} bg="green.100" borderRadius="md" color="green.600">
                <FiPackage size={20} />
              </Box>
              <Box>
                <Heading size="md" fontFamily="heading">
                  เพิ่มสินค้า
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  เลือกสินค้าที่ต้องการเพิ่ม
                </Text>
              </Box>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>สินค้า</FormLabel>
                <Select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  placeholder="เลือกสินค้า"
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ฿{product.price}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>จำนวน</FormLabel>
                <NumberInput
                  value={quantity}
                  onChange={(value) => setQuantity(Number(value))}
                  min={1}
                  max={100}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              <Button
                leftIcon={<FiPlus />}
                colorScheme="green"
                onClick={addItem}
                width="full"
              >
                เพิ่มสินค้า
              </Button>
            </VStack>
          </CardBody>
        </Card>

        {/* Order Summary */}
        <Card
          borderRadius="2xl"
          border="1px"
          borderColor="gray.100"
          shadow="lg"
        >
          <CardHeader>
            <HStack spacing={3}>
              <Box p={2} bg="purple.100" borderRadius="md" color="purple.600">
                <FiDollarSign size={20} />
              </Box>
              <Box>
                <Heading size="md" fontFamily="heading">
                  สรุปคำสั่งซื้อ
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  ข้อมูลสรุปยอดรวม
                </Text>
              </Box>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <Stat>
                <StatLabel>ยอดรวม (ไม่รวม VAT)</StatLabel>
                <StatNumber>฿{subtotal.toFixed(2)}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>VAT 7%</StatLabel>
                <StatNumber>฿{tax.toFixed(2)}</StatNumber>
              </Stat>
              <Divider />
              <Stat>
                <StatLabel>ยอดรวมทั้งสิ้น</StatLabel>
                <StatNumber fontSize="2xl" color="blue.600">
                  ฿{total.toFixed(2)}
                </StatNumber>
              </Stat>
              <Badge
                colorScheme="blue"
                variant="subtle"
                p={2}
                w="full"
                textAlign="center"
              >
                รายการสินค้า: {items.length} รายการ
              </Badge>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Order Items */}
      <Card borderRadius="2xl" border="1px" borderColor="gray.100" shadow="lg">
        <CardHeader>
          <Heading size="md" fontFamily="heading">
            รายการสินค้า ({items.length} รายการ)
          </Heading>
        </CardHeader>
        <CardBody>
          {items.length === 0 ? (
            <Flex justify="center" align="center" py={12}>
              <VStack spacing={3}>
                <FiPackage size={48} color="gray.300" />
                <Text color="gray.500">ยังไม่มีสินค้าในคำสั่งซื้อ</Text>
                <Text fontSize="sm" color="gray.400">
                  เลือกสินค้าจากด้านขวาเพื่อเพิ่มลงในคำสั่งซื้อ
                </Text>
              </VStack>
            </Flex>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>สินค้า</Th>
                  <Th>ราคา</Th>
                  <Th>จำนวน</Th>
                  <Th>ยอดรวม</Th>
                  <Th>จัดการ</Th>
                </Tr>
              </Thead>
              <Tbody>
                {items.map((item) => (
                  <Tr key={item.id}>
                    <Td>
                      <Text fontWeight="medium">{item.productName}</Text>
                    </Td>
                    <Td>฿{item.price.toFixed(2)}</Td>
                    <Td>
                      <NumberInput
                        value={item.quantity}
                        onChange={(value) =>
                          updateQuantity(item.id, Number(value))
                        }
                        min={1}
                        max={100}
                        size="sm"
                        width="80px"
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </Td>
                    <Td>
                      <Text fontWeight="bold">฿{item.total.toFixed(2)}</Text>
                    </Td>
                    <Td>
                      <IconButton
                        aria-label="ลบรายการ"
                        icon={<FiTrash2 />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => removeItem(item.id)}
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>
    </VStack>
  );
};

// Use layout
CreateOrderPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="สร้างคำสั่งซื้อใหม่">{page}</Layout>;
};

export default withAuth(CreateOrderPage, "staff");
