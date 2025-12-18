import React, { useState, useMemo } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  useToast,
  useDisclosure,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Icon,
  Badge,
  useColorModeValue,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
  Input,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Textarea,
  Checkbox,
  Divider,
} from "@chakra-ui/react";
import {
  IoWarningOutline,
  IoArrowBackOutline,
  IoRefreshOutline,
  IoDownloadOutline,
  IoBagAdd,
  IoAlertCircleOutline,
  IoCheckmarkCircleOutline,
  IoCartOutline,
  IoStatsChartOutline,
  IoFilterOutline,
  IoSearchOutline,
} from "react-icons/io5";
import { Product } from "@shopflow/types";
import { POSLayout } from "../../components";
import { formatCurrency } from "../../lib/sales";

// Mock data with low stock items
const mockLowStockProducts: Product[] = [
  {
    id: "1",
    sku: "DRINK002",
    name: "โค้ก",
    description: "โคคาโคลา 325ml",
    price: 15,
    cost_price: 10,
    category: {
      id: "1",
      name: "เครื่องดื่ม",
      description: "เครื่องดื่มทุกชนิด",
    },
    stock: 5, // Critical
    min_stock: 20,
    max_stock: 300,
    status: "active",
    barcode: "1234567890126",
    images: [],
    tags: ["เครื่องดื่ม", "น้ำอัดลม"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    sku: "SNACK001",
    name: "มาม่า",
    description: "บะหมี่กึ่งสำเร็จรูป",
    price: 8,
    cost_price: 5,
    category: {
      id: "2",
      name: "ขนม",
      description: "ขนมและของหวาน",
    },
    stock: 15, // Low
    min_stock: 30,
    max_stock: 200,
    status: "active",
    barcode: "1234567890124",
    images: [],
    tags: ["ขนม", "บะหมี่"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    sku: "FRESH002",
    name: "นม",
    description: "นมสด 1 ลิตร",
    price: 25,
    cost_price: 18,
    category: {
      id: "3",
      name: "อาหารสด",
      description: "อาหารสดและผลไม้",
    },
    stock: 0, // Out of stock
    min_stock: 10,
    max_stock: 50,
    status: "active",
    barcode: "1234567890127",
    images: [],
    tags: ["นม", "สด"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    sku: "SNACK002",
    name: "ลูกอม",
    description: "ลูกอมหลากรส",
    price: 5,
    cost_price: 3,
    category: {
      id: "2",
      name: "ขนม",
      description: "ขนมและของหวาน",
    },
    stock: 8, // Low
    min_stock: 25,
    max_stock: 100,
    status: "active",
    barcode: "1234567890128",
    images: [],
    tags: ["ขนม", "ลูกอม"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

interface RestockRequest {
  productId: string;
  quantity: number;
  urgency: "low" | "medium" | "high" | "critical";
  note: string;
}

const LowStockPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(mockLowStockProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [restockData, setRestockData] = useState<RestockRequest>({
    productId: "",
    quantity: 0,
    urgency: "medium",
    note: "",
  });

  const {
    isOpen: isRestockOpen,
    onOpen: onRestockOpen,
    onClose: onRestockClose,
  } = useDisclosure();

  const toast = useToast();

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #2d3748 0%, #1a202c 100%)"
  );

  // Filter and categorize products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.sku || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || product.category?.name === categoryFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "critical" && (product.stock || 0) === 0) ||
        (statusFilter === "low" &&
          (product.stock || 0) > 0 &&
          (product.stock || 0) <= (product.min_stock || 0)) ||
        (statusFilter === "normal" &&
          (product.stock || 0) > (product.min_stock || 0));

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, categoryFilter, statusFilter]);

  const stockStats = useMemo(() => {
    const outOfStock = products.filter((p) => (p.stock || 0) === 0);
    const critical = products.filter(
      (p) => (p.stock || 0) > 0 && (p.stock || 0) <= ((p.min_stock || 0) * 0.5)
    );
    const low = products.filter(
      (p) =>
        (p.stock || 0) > ((p.min_stock || 0) * 0.5) &&
        (p.stock || 0) <= (p.min_stock || 0)
    );
    const totalValue = products.reduce(
      (sum, p) => sum + (p.stock || 0) * (p.cost_price || 0),
      0
    );
    const potentialLoss = outOfStock.reduce(
      (sum, p) => sum + (p.min_stock || 0) * (p.cost_price || 0),
      0
    );

    return {
      total: products.length,
      outOfStock: outOfStock.length,
      critical: critical.length,
      low: low.length,
      totalValue,
      potentialLoss,
      categories: [...new Set(products.map((p) => p.category?.name).filter(Boolean))],
    };
  }, [products]);

  const getStockStatus = (product: Product) => {
    const stock = product.stock || 0;
    const minStock = product.min_stock || 0;
    if (stock === 0)
      return { status: "out", color: "red", text: "หมด", priority: 4 };
    if (stock <= minStock * 0.5)
      return { status: "critical", color: "red", text: "วิกฤต", priority: 3 };
    if (stock <= minStock)
      return { status: "low", color: "orange", text: "ต่ำ", priority: 2 };
    return { status: "normal", color: "green", text: "ปกติ", priority: 1 };
  };

  const getStockPercentage = (product: Product) => {
    const stock = product.stock || 0;
    const minStock = product.min_stock || 1;
    return Math.min((stock / minStock) * 100, 100);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "red";
      case "high":
        return "orange";
      case "medium":
        return "yellow";
      case "low":
        return "blue";
      default:
        return "gray";
    }
  };

  const calculateRestockQuantity = (product: Product) => {
    const stock = product.stock || 0;
    const maxStock = product.max_stock || 0;
    const minStock = product.min_stock || 0;
    return Math.max(
      maxStock - stock,
      minStock
    );
  };

  const calculateRestockCost = (product: Product, quantity: number) => {
    return quantity * (product.cost_price || 0);
  };

  const handleRestockProduct = (product: Product) => {
    const recommendedQuantity = calculateRestockQuantity(product);
    const stock = product.stock || 0;
    const minStock = product.min_stock || 0;
    const urgency =
      stock === 0
        ? "critical"
        : stock <= minStock * 0.5
        ? "high"
        : "medium";

    setRestockData({
      productId: product.id,
      quantity: recommendedQuantity,
      urgency: urgency as any,
      note: `เติมสต็อก ${product.name} จากสต็อกปัจจุบัน ${stock} ไปยังระดับแนะนำ`,
    });
    onRestockOpen();
  };

  const handleBulkRestock = () => {
    if (selectedProducts.length === 0) {
      toast({
        title: "กรุณาเลือกสินค้า",
        description: "เลือกสินค้าที่ต้องการเติมสต็อก",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    toast({
      title: "กำลังส่งคำขอเติมสต็อก",
      description: `ส่งคำขอเติมสต็อกสำหรับ ${selectedProducts.length} รายการ`,
      status: "info",
      duration: 3000,
      isClosable: true,
    });

    // Reset selection
    setSelectedProducts([]);
  };

  const handleSubmitRestock = () => {
    if (restockData.quantity <= 0) {
      toast({
        title: "กรุณาระบุจำนวน",
        description: "จำนวนที่เติมต้องมากกว่า 0",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const product = products.find((p) => p.id === restockData.productId);
    if (!product) return;

    // Simulate updating stock
    setProducts((prev) =>
      prev.map((p) =>
        p.id === restockData.productId
          ? { ...p, stock: (p.stock || 0) + restockData.quantity }
          : p
      )
    );

    toast({
      title: "ส่งคำขอเติมสต็อกสำเร็จ",
      description: `ส่งคำขอเติมสต็อก ${product.name} จำนวน ${restockData.quantity} รายการ`,
      status: "success",
      duration: 5000,
      isClosable: true,
    });

    onRestockClose();
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((p) => p.id));
    }
  };

  return (
    <POSLayout>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box
          bgGradient={bgGradient}
          borderRadius="2xl"
          p={8}
          color="white"
          position="relative"
          overflow="hidden"
          _before={{
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bg: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Flex
            justify="space-between"
            align="center"
            position="relative"
            zIndex={1}
          >
            <VStack align="start" spacing={3}>
              <HStack spacing={3}>
                <Box
                  p={3}
                  borderRadius="xl"
                  bg="rgba(255,255,255,0.2)"
                  color="white"
                >
                  <Icon as={IoWarningOutline} boxSize={6} />
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm" fontWeight="medium">
                    การแจ้งเตือนสต็อก
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    สินค้าสต็อกต่ำ
                  </Text>
                </VStack>
              </HStack>

              {/* Breadcrumb */}
              <Breadcrumb color="whiteAlpha.800" fontSize="sm">
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">หน้าแรก</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/inventory">คลังสินค้า</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem isCurrentPage>
                  <BreadcrumbLink>สินค้าสต็อกต่ำ</BreadcrumbLink>
                </BreadcrumbItem>
              </Breadcrumb>
            </VStack>

            <HStack spacing={3}>
              <Button
                leftIcon={<Icon as={IoDownloadOutline} />}
                variant="solid"
                colorScheme="whiteAlpha"
              >
                ส่งออกรายงาน
              </Button>
              <Button
                leftIcon={<Icon as={IoArrowBackOutline} />}
                variant="ghost"
                colorScheme="whiteAlpha"
                onClick={() => window.history.back()}
              >
                กลับ
              </Button>
            </HStack>
          </Flex>
        </Box>

        {/* Critical Alert */}
        {stockStats.outOfStock > 0 && (
          <Alert status="error" borderRadius="xl">
            <AlertIcon />
            <Box flex="1">
              <AlertTitle>สินค้าหมดสต็อก!</AlertTitle>
              <AlertDescription>
                มีสินค้าหมดสต็อก {stockStats.outOfStock} รายการ
                ควรเติมสต็อกทันที ขาดทุนโอกาสประมาณ{" "}
                {formatCurrency(stockStats.potentialLoss)}
              </AlertDescription>
            </Box>
            <Button colorScheme="red" size="sm" ml={4}>
              เติมสต็อกด่วน
            </Button>
          </Alert>
        )}

        {/* Statistics Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <VStack spacing={3}>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="gray.500">
                    สินค้าหมดสต็อก
                  </Text>
                  <Icon as={IoAlertCircleOutline} color="red.500" />
                </HStack>
                <Text fontSize="3xl" fontWeight="bold" color="red.500">
                  {stockStats.outOfStock}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  รายการ
                </Text>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <VStack spacing={3}>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="gray.500">
                    สต็อกวิกฤต
                  </Text>
                  <Icon as={IoWarningOutline} color="red.500" />
                </HStack>
                <Text fontSize="3xl" fontWeight="bold" color="red.500">
                  {stockStats.critical}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  รายการ
                </Text>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <VStack spacing={3}>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="gray.500">
                    สต็อกต่ำ
                  </Text>
                  <Icon as={IoWarningOutline} color="orange.500" />
                </HStack>
                <Text fontSize="3xl" fontWeight="bold" color="orange.500">
                  {stockStats.low}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  รายการ
                </Text>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <VStack spacing={3}>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="gray.500">
                    มูลค่าสต็อกคงเหลือ
                  </Text>
                  <Icon as={IoStatsChartOutline} color="blue.500" />
                </HStack>
                <Text fontSize="3xl" fontWeight="bold" color="blue.500">
                  {formatCurrency(stockStats.totalValue)}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  บาท
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Filters */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4}>
              <HStack w="full" spacing={4} flexWrap="wrap">
                <HStack spacing={2}>
                  <Icon as={IoSearchOutline} color="gray.500" />
                  <Input
                    placeholder="ค้นหาสินค้า..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    w="250px"
                  />
                </HStack>

                <HStack spacing={2}>
                  <Icon as={IoFilterOutline} color="gray.500" />
                  <Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    w="200px"
                  >
                    <option value="all">ทุกหมวดหมู่</option>
                    {stockStats.categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Select>
                </HStack>

                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  w="150px"
                >
                  <option value="all">ทุกสถานะ</option>
                  <option value="critical">หมดสต็อก</option>
                  <option value="low">สต็อกต่ำ</option>
                </Select>

                <Button
                  leftIcon={<IoRefreshOutline />}
                  variant="ghost"
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("all");
                    setStatusFilter("all");
                  }}
                >
                  รีเซ็ต
                </Button>
              </HStack>

              {selectedProducts.length > 0 && (
                <HStack
                  w="full"
                  justify="space-between"
                  p={3}
                  bg="blue.50"
                  borderRadius="md"
                >
                  <Text fontSize="sm">
                    เลือกแล้ว {selectedProducts.length} รายการ
                  </Text>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    leftIcon={<IoBagAdd />}
                    onClick={handleBulkRestock}
                  >
                    เติมสต็อกที่เลือก
                  </Button>
                </HStack>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Products Table */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="bold">
                รายการสินค้า ({filteredProducts.length})
              </Text>
              <Checkbox
                isChecked={
                  selectedProducts.length === filteredProducts.length &&
                  filteredProducts.length > 0
                }
                isIndeterminate={
                  selectedProducts.length > 0 &&
                  selectedProducts.length < filteredProducts.length
                }
                onChange={handleSelectAll}
              >
                เลือกทั้งหมด
              </Checkbox>
            </HStack>
          </CardHeader>
          <CardBody>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>เลือก</Th>
                    <Th>สินค้า</Th>
                    <Th>หมวดหมู่</Th>
                    <Th>สต็อกปัจจุบัน</Th>
                    <Th>สถานะ</Th>
                    <Th>แนะนำเติม</Th>
                    <Th>ค่าใช้จ่าย</Th>
                    <Th>การดำเนินการ</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product);
                    const recommendedQuantity =
                      calculateRestockQuantity(product);
                    const restockCost = calculateRestockCost(
                      product,
                      recommendedQuantity
                    );

                    return (
                      <Tr key={product.id}>
                        <Td>
                          <Checkbox
                            isChecked={selectedProducts.includes(product.id)}
                            onChange={() => handleSelectProduct(product.id)}
                          />
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold">{product.name}</Text>
                            <Text fontSize="sm" color="gray.500">
                              SKU: {product.sku || "N/A"}
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              {formatCurrency(product.price)}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Badge colorScheme="blue" variant="outline">
                            {product.category?.name || "ไม่ระบุ"}
                          </Badge>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={2}>
                            <HStack spacing={2}>
                              <Text
                                fontWeight="bold"
                                color={stockStatus.color + ".500"}
                              >
                                {product.stock || 0}
                              </Text>
                              <Text fontSize="sm" color="gray.500">
                                / {product.min_stock || 0}
                              </Text>
                            </HStack>
                            <Progress
                              value={getStockPercentage(product)}
                              colorScheme={stockStatus.color}
                              size="sm"
                              w="100px"
                            />
                          </VStack>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={stockStatus.color}
                            variant="solid"
                          >
                            {stockStatus.text}
                          </Badge>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold" color="blue.600">
                              {recommendedQuantity}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              รายการ
                            </Text>
                          </VStack>
                        </Td>
                        <Td>
                          <Text fontWeight="bold" color="green.600">
                            {formatCurrency(restockCost)}
                          </Text>
                        </Td>
                        <Td>
                          <Button
                            size="sm"
                            colorScheme={
                              stockStatus.status === "out" ? "red" : "orange"
                            }
                            leftIcon={<IoBagAdd />}
                            onClick={() => handleRestockProduct(product)}
                          >
                            เติมสต็อก
                          </Button>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </TableContainer>
          </CardBody>
        </Card>

        {/* Restock Modal */}
        <Modal isOpen={isRestockOpen} onClose={onRestockClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack spacing={2}>
                <Icon as={IoBagAdd} />
                <Text>เติมสต็อกสินค้า</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />

            <ModalBody>
              {restockData.productId && (
                <VStack spacing={4} align="stretch">
                  {(() => {
                    const product = products.find(
                      (p) => p.id === restockData.productId
                    );
                    if (!product) return null;

                    return (
                      <>
                        <Box p={4} bg="gray.50" borderRadius="md">
                          <VStack align="stretch" spacing={3}>
                            <HStack justify="space-between">
                              <Text fontWeight="bold">{product.name}</Text>
                              <Badge
                                colorScheme={getStockStatus(product).color}
                              >
                                {getStockStatus(product).text}
                              </Badge>
                            </HStack>
                            <SimpleGrid columns={3} spacing={4} fontSize="sm">
                              <VStack align="start" spacing={0}>
                                <Text color="gray.500">สต็อกปัจจุบัน</Text>
                                <Text fontWeight="bold">
                                  {product.stock || 0}
                                </Text>
                              </VStack>
                              <VStack align="start" spacing={0}>
                                <Text color="gray.500">ขั้นต่ำ</Text>
                                <Text fontWeight="bold">
                                  {product.min_stock || 0}
                                </Text>
                              </VStack>
                              <VStack align="start" spacing={0}>
                                <Text color="gray.500">สูงสุด</Text>
                                <Text fontWeight="bold">
                                  {product.max_stock || 0}
                                </Text>
                              </VStack>
                            </SimpleGrid>
                          </VStack>
                        </Box>

                        <VStack align="stretch" spacing={4}>
                          <Box>
                            <Text mb={2} fontWeight="medium">
                              จำนวนที่ต้องการเติม
                            </Text>
                            <NumberInput
                              value={restockData.quantity}
                              onChange={(_, value) =>
                                setRestockData((prev) => ({
                                  ...prev,
                                  quantity: value,
                                }))
                              }
                              min={1}
                              max={product.max_stock || 1000}
                            >
                              <NumberInputField />
                              <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper>
                            </NumberInput>
                            <Text fontSize="sm" color="gray.500" mt={1}>
                              แนะนำ: {calculateRestockQuantity(product)} รายการ
                            </Text>
                          </Box>

                          <Box>
                            <Text mb={2} fontWeight="medium">
                              ระดับความเร่งด่วน
                            </Text>
                            <Select
                              value={restockData.urgency}
                              onChange={(e) =>
                                setRestockData((prev) => ({
                                  ...prev,
                                  urgency: e.target.value as any,
                                }))
                              }
                            >
                              <option value="low">ต่ำ - ไม่เร่งด่วน</option>
                              <option value="medium">
                                ปานกลาง - เติมภายใน 1-2 วัน
                              </option>
                              <option value="high">
                                สูง - เติมภายในวันนี้
                              </option>
                              <option value="critical">
                                วิกฤต - เติมทันที
                              </option>
                            </Select>
                          </Box>

                          <Box>
                            <Text mb={2} fontWeight="medium">
                              หมายเหตุ
                            </Text>
                            <Textarea
                              value={restockData.note}
                              onChange={(e) =>
                                setRestockData((prev) => ({
                                  ...prev,
                                  note: e.target.value,
                                }))
                              }
                              placeholder="เพิ่มหมายเหตุ (ไม่บังคับ)"
                              rows={3}
                            />
                          </Box>

                          <Divider />

                          <Box p={3} bg="blue.50" borderRadius="md">
                            <VStack spacing={2}>
                              <HStack justify="space-between" w="full">
                                <Text fontSize="sm">จำนวนเติม:</Text>
                                <Text fontSize="sm" fontWeight="bold">
                                  {restockData.quantity} รายการ
                                </Text>
                              </HStack>
                              <HStack justify="space-between" w="full">
                                <Text fontSize="sm">ค่าใช้จ่าย:</Text>
                                <Text
                                  fontSize="sm"
                                  fontWeight="bold"
                                  color="green.600"
                                >
                                  {formatCurrency(
                                    calculateRestockCost(
                                      product,
                                      restockData.quantity
                                    )
                                  )}
                                </Text>
                              </HStack>
                              <HStack justify="space-between" w="full">
                                <Text fontSize="sm">สต็อกหลังเติม:</Text>
                                <Text
                                  fontSize="sm"
                                  fontWeight="bold"
                                  color="blue.600"
                                >
                                  {(product.stock || 0) + restockData.quantity}
                                </Text>
                              </HStack>
                            </VStack>
                          </Box>
                        </VStack>
                      </>
                    );
                  })()}
                </VStack>
              )}
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onRestockClose}>
                ยกเลิก
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleSubmitRestock}
                leftIcon={<IoCheckmarkCircleOutline />}
              >
                ส่งคำขอเติมสต็อก
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </POSLayout>
  );
};

export default LowStockPage;

// Disable static generation for pages that use React Query
export const getServerSideProps = async () => {
  return {
    props: {},
  };
};
