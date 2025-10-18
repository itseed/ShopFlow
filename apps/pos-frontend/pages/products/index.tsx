import React, { useState, useEffect } from "react";
import {
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Card,
  CardBody,
  SimpleGrid,
  Box,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Textarea,
  Switch,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Divider,
  Alert,
  AlertIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Icon,
  Flex,
  Progress,
  Grid,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import {
  IoAdd,
  IoSearch,
  IoFilter,
  IoEye,
  IoTrash,
  IoEllipsisVertical,
  IoRefresh,
  IoDownload,
  IoPrint,
  IoBag,
  IoWarning,
  IoCheckmark,
  IoClose,
  IoGrid,
  IoList,
  IoStatsChart,
  IoTrendingUp,
  IoCube,
  IoPricetag,
  IoAlertCircle,
  IoCheckmarkCircle,
} from "react-icons/io5";
import { POSLayout, TouchButton, POSCard } from "../../components";
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from "../../lib/hooks/useSale";
import { Product, ProductStatus } from "@shopflow/types";

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category_id: string;
  stock: number;
  barcode: string;
  status: ProductStatus;
  cost_price: number;
  short_description: string;
  max_stock: number;
  unit: string;
  weight: number;
  dimensions: { length: number; width: number; height: number };
  supplier_id: string;
  brand: string;
  tags: string[];
  is_featured: boolean;
  is_trackable: boolean;
}

const ProductsPage = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const { data: products = [], isLoading, error, refetch } = useProducts({
    search: search,
    categoryId: filter === "all" ? undefined : filter,
  });

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  const { isOpen: isAddProductOpen, onOpen: onAddProductOpen, onClose: onAddProductClose } = useDisclosure();
  const { isOpen: isEditProductOpen, onOpen: onEditProductOpen, onClose: onEditProductClose } = useDisclosure();
  const { isOpen: isViewProductOpen, onOpen: onViewProductOpen, onClose: onViewProductClose } = useDisclosure();
  
  const [productForm, setProductForm] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    category_id: "",
    stock: 0,
    barcode: "",
    status: "active",
    cost_price: 0,
    short_description: "",
    max_stock: 0,
    unit: "",
    weight: 0,
    dimensions: { length: 0, width: 0, height: 0 },
    supplier_id: "",
    brand: "",
    tags: [],
    is_featured: false,
    is_trackable: true,
  });
  
  const toast = useToast();

  // Color mode values
  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #2d3748 0%, #1a202c 100%)"
  );
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const categories = ["Beverages", "Bakery", "Dairy", "Snacks", "Drinks"]; // This should come from API
  
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === "active").length;
  const lowStockProducts = products.filter(p => p.stock <= (p.min_stock || 10)).length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const outOfStockProducts = products.filter(p => p.stock === 0).length;

  const handleAddProduct = async () => {
    if (!productForm.name || productForm.price <= 0) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบ",
        status: "error",
        duration: 3000,
      });
      return;
    }
    
    await createProductMutation.mutateAsync(productForm);
    
    toast({
      title: "เพิ่มสินค้าเรียบร้อย",
      status: "success",
      duration: 3000,
    });
    
    onAddProductClose();
    setProductForm({
      name: "",
      description: "",
      price: 0,
      category_id: "",
      stock: 0,
      barcode: "",
      status: "active",
      cost_price: 0,
      short_description: "",
      max_stock: 0,
      unit: "",
      weight: 0,
      dimensions: { length: 0, width: 0, height: 0 },
      supplier_id: "",
      brand: "",
      tags: [],
      is_featured: false,
      is_trackable: true,
    });
  };

  const handleEditProduct = async () => {
    if (!selectedProduct || !productForm.name || productForm.price <= 0) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบ",
        status: "error",
        duration: 3000,
      });
      return;
    }
    
    await updateProductMutation.mutateAsync({
      id: selectedProduct.id,
      data: productForm,
    });
    
    toast({
      title: "แก้ไขสินค้าเรียบร้อย",
      status: "success",
      duration: 3000,
    });
    
    onEditProductClose();
    setSelectedProduct(null);
  };

  const handleDeleteProduct = async (productId: string) => {
    await deleteProductMutation.mutateAsync(productId);
    
    toast({
      title: "ลบสินค้าเรียบร้อย",
      status: "success",
      duration: 3000,
    });
  };

  const getStatusColor = (status: ProductStatus) => {
    if (status === "out_of_stock") return "red";
    if (status === "inactive") return "gray";
    if (status === "active" && products.find(p => p.id === selectedProduct?.id)?.stock <= (products.find(p => p.id === selectedProduct?.id)?.min_stock || 10)) return "orange";
    return "green";
  };

  const getStatusText = (status: ProductStatus) => {
    if (status === "out_of_stock") return "หมด";
    if (status === "inactive") return "ไม่ใช้งาน";
    return "มีสินค้า";
  };

  const formatCurrency = (amount: number) => {
    return `฿${amount.toFixed(2)}`;
  };

  useEffect(() => {
    if (selectedProduct) {
      setProductForm({
        name: selectedProduct.name,
        description: selectedProduct.description || "",
        price: selectedProduct.price,
        category_id: selectedProduct.category_id || "",
        stock: selectedProduct.stock,
        barcode: selectedProduct.barcode || "",
        status: selectedProduct.status,
        cost_price: selectedProduct.cost_price || 0,
        short_description: selectedProduct.short_description || "",
        max_stock: selectedProduct.max_stock || 0,
        unit: selectedProduct.unit || "",
        weight: selectedProduct.weight || 0,
        dimensions: selectedProduct.dimensions || { length: 0, width: 0, height: 0 },
        supplier_id: selectedProduct.supplier_id || "",
        brand: selectedProduct.brand || "",
        tags: selectedProduct.tags || [],
        is_featured: selectedProduct.is_featured || false,
        is_trackable: selectedProduct.is_trackable || true,
      });
    }
  }, [selectedProduct]);

  return (
    <POSLayout>
      <VStack spacing={6} align="stretch" h="full" p={{ base: 2, md: 4 }}>
        {/* Header with Stats */}
        <Box
          bgGradient={bgGradient}
          borderRadius="2xl"
          p={6}
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
          <Flex justify="space-between" align="center" position="relative" zIndex={1}>
            <VStack align="start" spacing={2}>
              <Heading size="lg" fontWeight="bold">
                📦 จัดการสินค้า
              </Heading>
              <Text fontSize="lg" opacity={0.9}>
                สินค้าทั้งหมด {totalProducts} รายการ
              </Text>
            </VStack>
            <VStack align="end" spacing={2}>
              <HStack spacing={4}>
                <Stat color="white">
                  <StatLabel fontSize="sm">มูลค่าสต็อก</StatLabel>
                  <StatNumber fontSize="2xl">{formatCurrency(totalValue)}</StatNumber>
                </Stat>
                <Stat color="white">
                  <StatLabel fontSize="sm">สินค้าที่ใช้งาน</StatLabel>
                  <StatNumber fontSize="2xl" fontWeight="bold" color="green.500">{activeProducts}</StatNumber>
                </Stat>
              </HStack>
              <HStack spacing={2}>
                <Icon as={IoTrendingUp} color="yellow.300" />
                <Text fontSize="sm" opacity={0.9}>สินค้าที่ใช้งาน {((activeProducts / totalProducts) * 100).toFixed(1)}%</Text>
              </HStack>
            </VStack>
          </Flex>
        </Box>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Card variant="elevated" bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <HStack spacing={3}>
                <Box
                  p={3}
                  borderRadius="lg"
                  bgGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  color="white"
                >
                  <Icon as={IoCube} boxSize={6} />
                </Box>
                <VStack align="start" spacing={1}>
                  <Stat>
                    <StatLabel fontSize="sm" color="gray.600">สินค้าทั้งหมด</StatLabel>
                    <StatNumber fontSize="2xl" fontWeight="bold">{totalProducts}</StatNumber>
                  </Stat>
                </VStack>
              </HStack>
            </CardBody>
          </Card>

          <Card variant="elevated" bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <HStack spacing={3}>
                <Box
                  p={3}
                  borderRadius="lg"
                  bgGradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                  color="white"
                >
                  <Icon as={IoCheckmarkCircle} boxSize={6} />
                </Box>
                <VStack align="start" spacing={1}>
                  <Stat>
                    <StatLabel fontSize="sm" color="gray.600">สินค้าที่ใช้งาน</StatLabel>
                    <StatNumber fontSize="2xl" fontWeight="bold" color="green.500">{activeProducts}</StatNumber>
                  </Stat>
                </VStack>
              </HStack>
            </CardBody>
          </Card>

          <Card variant="elevated" bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <HStack spacing={3}>
                <Box
                  p={3}
                  borderRadius="lg"
                  bgGradient="linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"
                  color="white"
                >
                  <Icon as={IoWarning} boxSize={6} />
                </Box>
                <VStack align="start" spacing={1}>
                  <Stat>
                    <StatLabel fontSize="sm" color="gray.600">ใกล้หมด</StatLabel>
                    <StatNumber fontSize="2xl" fontWeight="bold" color="orange.500">{lowStockProducts}</StatNumber>
                  </Stat>
                </VStack>
              </HStack>
            </CardBody>
          </Card>

          <Card variant="elevated" bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <HStack spacing={3}>
                <Box
                  p={3}
                  borderRadius="lg"
                  bgGradient="linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
                  color="white"
                >
                  <Icon as={IoPricetag} boxSize={6} />
                </Box>
                <VStack align="start" spacing={1}>
                  <Stat>
                    <StatLabel fontSize="sm" color="gray.600">มูลค่าสต็อก</StatLabel>
                    <StatNumber fontSize="2xl" fontWeight="bold" color="purple.500">{formatCurrency(totalValue)}</StatNumber>
                  </Stat>
                </VStack>
              </HStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Alerts */}
        {lowStockProducts > 0 && (
          <Alert status="warning" borderRadius="lg">
            <AlertIcon />
            <Box>
              <AlertTitle>สินค้าใกล้หมด!</AlertTitle>
              <AlertDescription>
                มีสินค้าใกล้หมด {lowStockProducts} รายการ และสินค้าหมด {outOfStockProducts} รายการ
              </AlertDescription>
            </Box>
          </Alert>
        )}

        {/* Search and Filter */}
        <Card variant="elevated" bg={cardBg} borderColor={borderColor}>
          <CardBody>
            <VStack spacing={4}>
              <HStack w="full" spacing={4}>
                <InputGroup>
                  <InputLeftElement>
                    <Icon as={IoSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input 
                    placeholder="ค้นหาสินค้า..." 
                    value={search} 
                    onChange={e => setSearch(e.target.value)}
                    size="lg"
                    borderRadius="xl"
                  />
                </InputGroup>
                <Select 
                  value={filter} 
                  onChange={e => setFilter(e.target.value)} 
                  maxW="200px"
                  size="lg"
                  borderRadius="xl"
                >
                  <option value="all">ทุกหมวดหมู่</option>
                  {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                </Select>
                <HStack spacing={2}>
                  <IconButton
                    aria-label="Grid view"
                    icon={<IoGrid />}
                    variant={viewMode === "grid" ? "solid" : "ghost"}
                    colorScheme="blue"
                    onClick={() => setViewMode("grid")}
                    size="lg"
                  />
                  <IconButton
                    aria-label="Table view"
                    icon={<IoList />}
                    variant={viewMode === "table" ? "solid" : "ghost"}
                    colorScheme="blue"
                    onClick={() => setViewMode("table")}
                    size="lg"
                  />
                </HStack>
              </HStack>
              
              <HStack justify="space-between" w="full">
                <Text fontSize="sm" color="gray.600">
                  แสดง {products.length} จาก {totalProducts} รายการ
                </Text>
                <TouchButton
                  variant="primary"
                  size="lg"
                  leftIcon={<IoAdd />}
                  onClick={onAddProductOpen}
                  bgGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  _hover={{
                    transform: "translateY(-1px)",
                    boxShadow: "lg",
                  }}
                  color="white"
                >
                  เพิ่มสินค้า
                </TouchButton>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Products Display */}
        {viewMode === "table" ? (
          <Card variant="elevated" bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <Table variant="simple" size="lg">
                <Thead>
                  <Tr>
                    <Th>สินค้า</Th>
                    <Th>หมวดหมู่</Th>
                    <Th isNumeric>ราคา</Th>
                    <Th isNumeric>สต็อก</Th>
                    <Th>สถานะ</Th>
                    <Th>การดำเนินการ</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {products.map((product) => (
                    <Tr key={product.id} _hover={{ bg: "gray.50" }} cursor="pointer" onClick={() => { setSelectedProduct(product); onViewProductOpen(); }}>
                      <Td>
                        <HStack>
                          <Avatar size="sm" name={product.name} />
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="bold">{product.name}</Text>
                            <Text fontSize="sm" color="gray.500" noOfLines={1}>
                              {product.description}
                            </Text>
                          </VStack>
                        </HStack>
                      </Td>
                      <Td>
                        <Badge colorScheme="blue">{product.category_id}</Badge>
                      </Td>
                      <Td isNumeric>
                        <Text fontWeight="bold">{formatCurrency(product.price)}</Text>
                      </Td>
                      <Td isNumeric>
                        <VStack align="end" spacing={1}>
                          <Text>{product.stock}</Text>
                          <Progress 
                            value={(product.stock / (product.max_stock || 100)) * 100} 
                            size="sm" 
                            colorScheme={getStatusColor(product.status)}
                            borderRadius="full"
                            w="60px"
                          />
                        </VStack>
                      </Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(product.status)}>
                          {getStatusText(product.status)}
                        </Badge>
                      </Td>
                      <Td>
                        <Menu>
                          <MenuButton as={IconButton} icon={<IoEllipsisVertical />} variant="ghost" onClick={(e) => e.stopPropagation()} />
                          <MenuList>
                            <MenuItem icon={<IoEye />} onClick={() => { setSelectedProduct(product); onViewProductOpen(); }}>
                              ดูรายละเอียด
                            </MenuItem>
                            <MenuItem icon={<IoEye />} onClick={() => { 
                              setSelectedProduct(product); 
                              setProductForm({
                                name: product.name,
                                description: product.description || "",
                                price: product.price,
                                category_id: product.category_id || "",
                                stock: product.stock,
                                barcode: product.barcode || "",
                                status: product.status,
                                cost_price: product.cost_price || 0,
                                short_description: product.short_description || "",
                                max_stock: product.max_stock || 0,
                                unit: product.unit || "",
                                weight: product.weight || 0,
                                dimensions: product.dimensions || { length: 0, width: 0, height: 0 },
                                supplier_id: product.supplier_id || "",
                                brand: product.brand || "",
                                tags: product.tags || [],
                                is_featured: product.is_featured || false,
                                is_trackable: product.is_trackable || true,
                              });
                              onEditProductOpen(); 
                            }}>
                              แก้ไข
                            </MenuItem>
                            <MenuItem icon={<IoTrash />} color="red.500" onClick={() => handleDeleteProduct(product.id)}>
                              ลบ
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </CardBody>
          </Card>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {products.map((product) => (
              <Card
                key={product.id}
                cursor="pointer"
                _hover={{ transform: "translateY(-4px)", shadow: "lg", bg: "blue.50" }}
                transition="all 0.2s"
                borderRadius="xl"
                shadow="md"
                onClick={() => { setSelectedProduct(product); onViewProductOpen(); }}
              >
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <Avatar size="md" name={product.name} />
                      <Badge colorScheme={getStatusColor(product.status)}>
                        {getStatusText(product.status)}
                      </Badge>
                    </HStack>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold" fontSize="lg">{product.name}</Text>
                      <Text fontSize="sm" color="gray.500" noOfLines={2}>
                        {product.description}
                      </Text>
                      <Badge colorScheme="blue">{product.category_id}</Badge>
                    </VStack>
                    <Divider />
                    <VStack spacing={2} align="stretch">
                      <HStack justify="space-between">
                        <Text fontWeight="bold" color="green.500">{formatCurrency(product.price)}</Text>
                        <Text fontSize="sm">สต็อก: {product.stock}</Text>
                      </HStack>
                      <Progress 
                        value={(product.stock / (product.max_stock || 100)) * 100} 
                        size="sm" 
                        colorScheme={getStatusColor(product.status)}
                        borderRadius="full"
                      />
                    </VStack>
                    <HStack justify="end">
                      <IconButton
                        size="sm"
                        icon={<IoEye />}
                        variant="ghost"
                        aria-label="แก้ไขสินค้า"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProduct(product);
                          setProductForm({
                            name: product.name,
                            description: product.description || "",
                            price: product.price,
                            category_id: product.category_id || "",
                            stock: product.stock,
                            barcode: product.barcode || "",
                            status: product.status,
                            cost_price: product.cost_price || 0,
                            short_description: product.short_description || "",
                            max_stock: product.max_stock || 0,
                            unit: product.unit || "",
                            weight: product.weight || 0,
                            dimensions: product.dimensions || { length: 0, width: 0, height: 0 },
                            supplier_id: product.supplier_id || "",
                            brand: product.brand || "",
                            tags: product.tags || [],
                            is_featured: product.is_featured || false,
                            is_trackable: product.is_trackable || true,
                          });
                          onEditProductOpen();
                        }}
                      />
                      <IconButton
                        size="sm"
                        icon={<IoTrash />}
                        variant="ghost"
                        colorScheme="red"
                        aria-label="ลบสินค้า"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProduct(product.id);
                        }}
                      />
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        )}

        {/* Add Product Modal */}
        <Modal isOpen={isAddProductOpen} onClose={onAddProductClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>เพิ่มสินค้าใหม่</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <HStack w="full">
                  <FormControl>
                    <FormLabel>ชื่อสินค้า</FormLabel>
                    <Input 
                      placeholder="ชื่อสินค้า" 
                      value={productForm.name}
                      onChange={e => setProductForm({...productForm, name: e.target.value})}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>หมวดหมู่</FormLabel>
                    <Select 
                      placeholder="เลือกหมวดหมู่"
                      value={productForm.category_id}
                      onChange={e => setProductForm({...productForm, category_id: e.target.value})}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </Select>
                  </FormControl>
                </HStack>
                <FormControl>
                  <FormLabel>รายละเอียด</FormLabel>
                  <Textarea 
                    placeholder="รายละเอียดสินค้า" 
                    value={productForm.description}
                    onChange={e => setProductForm({...productForm, description: e.target.value})}
                  />
                </FormControl>
                <HStack w="full">
                  <FormControl>
                    <FormLabel>ราคา</FormLabel>
                    <NumberInput 
                      value={productForm.price}
                      onChange={(_, value) => setProductForm({...productForm, price: value})}
                      min={0}
                    >
                      <NumberInputField placeholder="0.00" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  <FormControl>
                    <FormLabel>สต็อก</FormLabel>
                    <NumberInput 
                      value={productForm.stock}
                      onChange={(_, value) => setProductForm({...productForm, stock: value})}
                      min={0}
                    >
                      <NumberInputField placeholder="0" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>
                <HStack w="full">
                  <FormControl>
                    <FormLabel>บาร์โค้ด</FormLabel>
                    <Input 
                      placeholder="บาร์โค้ด" 
                      value={productForm.barcode}
                      onChange={e => setProductForm({...productForm, barcode: e.target.value})}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>ต้นทุน</FormLabel>
                    <NumberInput 
                      value={productForm.cost_price}
                      onChange={(_, value) => setProductForm({...productForm, cost_price: value})}
                      min={0}
                    >
                      <NumberInputField placeholder="0.00" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>
                <HStack w="full">
                  <FormControl>
                    <FormLabel>คำอธิบายสั้นๆ</FormLabel>
                    <Input 
                      placeholder="คำอธิบายสั้นๆ" 
                      value={productForm.short_description}
                      onChange={e => setProductForm({...productForm, short_description: e.target.value})}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>สต็อกสูงสุด</FormLabel>
                    <NumberInput 
                      value={productForm.max_stock}
                      onChange={(_, value) => setProductForm({...productForm, max_stock: value})}
                      min={0}
                    >
                      <NumberInputField placeholder="0" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>
                <HStack w="full">
                  <FormControl>
                    <FormLabel>หน่วย</FormLabel>
                    <Input 
                      placeholder="หน่วย" 
                      value={productForm.unit}
                      onChange={e => setProductForm({...productForm, unit: e.target.value})}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>น้ำหนัก</FormLabel>
                    <NumberInput 
                      value={productForm.weight}
                      onChange={(_, value) => setProductForm({...productForm, weight: value})}
                      min={0}
                    >
                      <NumberInputField placeholder="0.00" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>
                <HStack w="full">
                  <FormControl>
                    <FormLabel>ความยาว</FormLabel>
                    <NumberInput 
                      value={productForm.dimensions.length}
                      onChange={(_, value) => setProductForm({...productForm, dimensions: {...productForm.dimensions, length: value}})}
                      min={0}
                    >
                      <NumberInputField placeholder="0.00" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  <FormControl>
                    <FormLabel>ความกว้าง</FormLabel>
                    <NumberInput 
                      value={productForm.dimensions.width}
                      onChange={(_, value) => setProductForm({...productForm, dimensions: {...productForm.dimensions, width: value}})}
                      min={0}
                    >
                      <NumberInputField placeholder="0.00" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  <FormControl>
                    <FormLabel>ความสูง</FormLabel>
                    <NumberInput 
                      value={productForm.dimensions.height}
                      onChange={(_, value) => setProductForm({...productForm, dimensions: {...productForm.dimensions, height: value}})}
                      min={0}
                    >
                      <NumberInputField placeholder="0.00" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>
                <HStack w="full">
                  <FormControl>
                    <FormLabel>ซัพพลายเออร์ ID</FormLabel>
                    <Input 
                      placeholder="ซัพพลายเออร์ ID" 
                      value={productForm.supplier_id}
                      onChange={e => setProductForm({...productForm, supplier_id: e.target.value})}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>แบรนด์</FormLabel>
                    <Input 
                      placeholder="แบรนด์" 
                      value={productForm.brand}
                      onChange={e => setProductForm({...productForm, brand: e.target.value})}
                    />
                  </FormControl>
                </HStack>
                <HStack w="full">
                  <FormControl>
                    <FormLabel>แท็ก (คั่นด้วยจุลภาค)</FormLabel>
                    <Input 
                      placeholder="แท็ก" 
                      value={productForm.tags.join(", ")}
                      onChange={e => setProductForm({...productForm, tags: e.target.value.split(",").map(tag => tag.trim())})}
                    />
                  </FormControl>
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">สินค้าแนะนำ</FormLabel>
                    <Switch 
                      isChecked={productForm.is_featured}
                      onChange={e => setProductForm({...productForm, is_featured: e.target.checked})}
                    />
                  </FormControl>
                </HStack>
                <HStack w="full">
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">ติดตามสต็อก</FormLabel>
                    <Switch 
                      isChecked={productForm.is_trackable}
                      onChange={e => setProductForm({...productForm, is_trackable: e.target.checked})}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>สถานะ</FormLabel>
                    <Select 
                      value={productForm.status}
                      onChange={e => setProductForm({...productForm, status: e.target.value as ProductStatus})}
                    >
                      <option value="active">ใช้งาน</option>
                      <option value="inactive">ไม่ใช้งาน</option>
                      <option value="out_of_stock">หมด</option>
                      <option value="discontinued">เลิกผลิต</option>
                    </Select>
                  </FormControl>
                </HStack>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onAddProductClose}>
                ยกเลิก
              </Button>
              <Button colorScheme="blue" onClick={handleAddProduct}>
                เพิ่มสินค้า
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Edit Product Modal */}
        <Modal isOpen={isEditProductOpen} onClose={onEditProductClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>แก้ไขสินค้า</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <HStack w="full">
                  <FormControl>
                    <FormLabel>ชื่อสินค้า</FormLabel>
                    <Input 
                      placeholder="ชื่อสินค้า" 
                      value={productForm.name}
                      onChange={e => setProductForm({...productForm, name: e.target.value})}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>หมวดหมู่</FormLabel>
                    <Select 
                      placeholder="เลือกหมวดหมู่"
                      value={productForm.category_id}
                      onChange={e => setProductForm({...productForm, category_id: e.target.value})}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </Select>
                  </FormControl>
                </HStack>
                <FormControl>
                  <FormLabel>รายละเอียด</FormLabel>
                  <Textarea 
                    placeholder="รายละเอียดสินค้า" 
                    value={productForm.description}
                    onChange={e => setProductForm({...productForm, description: e.target.value})}
                  />
                </FormControl>
                <HStack w="full">
                  <FormControl>
                    <FormLabel>ราคา</FormLabel>
                    <NumberInput 
                      value={productForm.price}
                      onChange={(_, value) => setProductForm({...productForm, price: value})}
                      min={0}
                    >
                      <NumberInputField placeholder="0.00" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  <FormControl>
                    <FormLabel>สต็อก</FormLabel>
                    <NumberInput 
                      value={productForm.stock}
                      onChange={(_, value) => setProductForm({...productForm, stock: value})}
                      min={0}
                    >
                      <NumberInputField placeholder="0" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>
                <HStack w="full">
                  <FormControl>
                    <FormLabel>บาร์โค้ด</FormLabel>
                    <Input 
                      placeholder="บาร์โค้ด" 
                      value={productForm.barcode}
                      onChange={e => setProductForm({...productForm, barcode: e.target.value})}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>ต้นทุน</FormLabel>
                    <NumberInput 
                      value={productForm.cost_price}
                      onChange={(_, value) => setProductForm({...productForm, cost_price: value})}
                      min={0}
                    >
                      <NumberInputField placeholder="0.00" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>
                <HStack w="full">
                  <FormControl>
                    <FormLabel>คำอธิบายสั้นๆ</FormLabel>
                    <Input 
                      placeholder="คำอธิบายสั้นๆ" 
                      value={productForm.short_description}
                      onChange={e => setProductForm({...productForm, short_description: e.target.value})}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>สต็อกสูงสุด</FormLabel>
                    <NumberInput 
                      value={productForm.max_stock}
                      onChange={(_, value) => setProductForm({...productForm, max_stock: value})}
                      min={0}
                    >
                      <NumberInputField placeholder="0" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>
                <HStack w="full">
                  <FormControl>
                    <FormLabel>หน่วย</FormLabel>
                    <Input 
                      placeholder="หน่วย" 
                      value={productForm.unit}
                      onChange={e => setProductForm({...productForm, unit: e.target.value})}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>น้ำหนัก</FormLabel>
                    <NumberInput 
                      value={productForm.weight}
                      onChange={(_, value) => setProductForm({...productForm, weight: value})}
                      min={0}
                    >
                      <NumberInputField placeholder="0.00" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>
                <HStack w="full">
                  <FormControl>
                    <FormLabel>ความยาว</FormLabel>
                    <NumberInput 
                      value={productForm.dimensions.length}
                      onChange={(_, value) => setProductForm({...productForm, dimensions: {...productForm.dimensions, length: value}})}
                      min={0}
                    >
                      <NumberInputField placeholder="0.00" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  <FormControl>
                    <FormLabel>ความกว้าง</FormLabel>
                    <NumberInput 
                      value={productForm.dimensions.width}
                      onChange={(_, value) => setProductForm({...productForm, dimensions: {...productForm.dimensions, width: value}})}
                      min={0}
                    >
                      <NumberInputField placeholder="0.00" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  <FormControl>
                    <FormLabel>ความสูง</FormLabel>
                    <NumberInput 
                      value={productForm.dimensions.height}
                      onChange={(_, value) => setProductForm({...productForm, dimensions: {...productForm.dimensions, height: value}})}
                      min={0}
                    >
                      <NumberInputField placeholder="0.00" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>
                <HStack w="full">
                  <FormControl>
                    <FormLabel>ซัพพลายเออร์ ID</FormLabel>
                    <Input 
                      placeholder="ซัพพลายเออร์ ID" 
                      value={productForm.supplier_id}
                      onChange={e => setProductForm({...productForm, supplier_id: e.target.value})}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>แบรนด์</FormLabel>
                    <Input 
                      placeholder="แบรนด์" 
                      value={productForm.brand}
                      onChange={e => setProductForm({...productForm, brand: e.target.value})}
                    />
                  </FormControl>
                </HStack>
                <HStack w="full">
                  <FormControl>
                    <FormLabel>แท็ก (คั่นด้วยจุลภาค)</FormLabel>
                    <Input 
                      placeholder="แท็ก" 
                      value={productForm.tags.join(", ")}
                      onChange={e => setProductForm({...productForm, tags: e.target.value.split(",").map(tag => tag.trim())})}
                    />
                  </FormControl>
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">สินค้าแนะนำ</FormLabel>
                    <Switch 
                      isChecked={productForm.is_featured}
                      onChange={e => setProductForm({...productForm, is_featured: e.target.checked})}
                    />
                  </FormControl>
                </HStack>
                <HStack w="full">
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">ติดตามสต็อก</FormLabel>
                    <Switch 
                      isChecked={productForm.is_trackable}
                      onChange={e => setProductForm({...productForm, is_trackable: e.target.checked})}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>สถานะ</FormLabel>
                    <Select 
                      value={productForm.status}
                      onChange={e => setProductForm({...productForm, status: e.target.value as ProductStatus})}
                    >
                      <option value="active">ใช้งาน</option>
                      <option value="inactive">ไม่ใช้งาน</option>
                      <option value="out_of_stock">หมด</option>
                      <option value="discontinued">เลิกผลิต</option>
                    </Select>
                  </FormControl>
                </HStack>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onEditProductClose}>
                ยกเลิก
              </Button>
              <Button colorScheme="blue" onClick={handleEditProduct}>
                บันทึก
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* View Product Modal */}
        <Modal isOpen={isViewProductOpen} onClose={onViewProductClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>รายละเอียดสินค้า</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedProduct && (
                <VStack spacing={4} align="stretch">
                  <HStack>
                    <Avatar size="lg" name={selectedProduct.name} />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold" fontSize="lg">{selectedProduct.name}</Text>
                      <Badge colorScheme="blue">{selectedProduct.category_id}</Badge>
                    </VStack>
                  </HStack>
                  <Divider />
                  <SimpleGrid columns={2} spacing={4}>
                    <Box>
                      <Text fontWeight="bold" color="gray.500">ราคา</Text>
                      <Text fontSize="lg" fontWeight="bold">{formatCurrency(selectedProduct.price)}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color="gray.500">สต็อก</Text>
                      <Text fontSize="lg" fontWeight="bold">{selectedProduct.stock}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color="gray.500">สถานะ</Text>
                      <Badge colorScheme={getStatusColor(selectedProduct.status)}>
                        {getStatusText(selectedProduct.status)}
                      </Badge>
                    </Box>
                    <Box>
                      <Text fontWeight="bold" color="gray.500">อัตราภาษี</Text>
                      <Text>{(selectedProduct.taxRate * 100).toFixed(1)}%</Text>
                    </Box>
                  </SimpleGrid>
                  {selectedProduct.description && (
                    <>
                      <Divider />
                      <Box>
                        <Text fontWeight="bold" color="gray.500">รายละเอียด</Text>
                        <Text>{selectedProduct.description}</Text>
                      </Box>
                    </>
                  )}
                  {selectedProduct.barcode && (
                    <>
                      <Divider />
                      <Box>
                        <Text fontWeight="bold" color="gray.500">บาร์โค้ด</Text>
                        <Text>{selectedProduct.barcode}</Text>
                      </Box>
                    </>
                  )}
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onViewProductClose}>
                ปิด
              </Button>
              <Button colorScheme="blue" onClick={() => {
                onViewProductClose();
                setProductForm({
                  name: selectedProduct.name,
                  description: selectedProduct.description || "",
                  price: selectedProduct.price,
                  category_id: selectedProduct.category_id || "",
                  stock: selectedProduct.stock,
                  barcode: selectedProduct.barcode || "",
                  status: selectedProduct.status,
                  cost_price: selectedProduct.cost_price || 0,
                  short_description: selectedProduct.short_description || "",
                  max_stock: selectedProduct.max_stock || 0,
                  unit: selectedProduct.unit || "",
                  weight: selectedProduct.weight || 0,
                  dimensions: selectedProduct.dimensions || { length: 0, width: 0, height: 0 },
                  supplier_id: selectedProduct.supplier_id || "",
                  brand: selectedProduct.brand || "",
                  tags: selectedProduct.tags || [],
                  is_featured: selectedProduct.is_featured || false,
                  is_trackable: selectedProduct.is_trackable || true,
                });
                onEditProductOpen();
              }}>
                แก้ไข
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </POSLayout>
  );
};

export default ProductsPage;