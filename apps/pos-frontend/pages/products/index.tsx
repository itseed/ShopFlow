import React, { useState } from "react";
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
  IoChevronBack,
  IoChevronForward,
} from "react-icons/io5";
import { POSLayout, TouchButton, POSCard } from "../../components";
import { mockProducts } from "../../lib/sales";

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  barcode: string;
  isActive: boolean;
  taxRate: number;
  discountEligible: boolean;
}

const ProductsPage = () => {
  const [products, setProducts] = useState(mockProducts);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  const { isOpen: isAddProductOpen, onOpen: onAddProductOpen, onClose: onAddProductClose } = useDisclosure();
  const { isOpen: isEditProductOpen, onOpen: onEditProductOpen, onClose: onEditProductClose } = useDisclosure();
  const { isOpen: isViewProductOpen, onOpen: onViewProductOpen, onClose: onViewProductClose } = useDisclosure();
  
  const [productForm, setProductForm] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    category: "",
    stock: 0,
    barcode: "",
    isActive: true,
    taxRate: 7,
    discountEligible: true,
  });
  
  const toast = useToast();

  // Color mode values
  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #2d3748 0%, #1a202c 100%)"
  );
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const categories = ["Beverages", "Bakery", "Dairy", "Snacks", "Drinks"];
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(search.toLowerCase()) &&
    (filter === "all" || product.category === filter)
  );

  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.isActive).length;
  const lowStockProducts = products.filter(p => p.stock <= 10).length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
  const outOfStockProducts = products.filter(p => p.stock === 0).length;

  const [currentGridSlide, setCurrentGridSlide] = useState(1);
  const [currentTablePage, setCurrentTablePage] = useState(1);
  const gridPerSlide = 8;
  const tablePerPage = 10;
  const totalGridSlides = Math.ceil(filteredProducts.length / gridPerSlide);
  const totalTablePages = Math.ceil(filteredProducts.length / tablePerPage);
  const paginatedGridProducts = filteredProducts.slice((currentGridSlide - 1) * gridPerSlide, currentGridSlide * gridPerSlide);
  const paginatedTableProducts = filteredProducts.slice((currentTablePage - 1) * tablePerPage, currentTablePage * tablePerPage);

  // Reset slide/page when filter/search/viewMode changes
  React.useEffect(() => {
    setCurrentGridSlide(1);
    setCurrentTablePage(1);
  }, [filter, search, viewMode]);

  const handleAddProduct = () => {
    if (!productForm.name || productForm.price <= 0) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบ",
        status: "error",
        duration: 3000,
      });
      return;
    }
    
    const newProduct = {
      id: `P${Date.now()}`,
      name: productForm.name,
      description: productForm.description,
      price: productForm.price,
      barcode: productForm.barcode,
      category: productForm.category,
      stock: productForm.stock,
      isActive: productForm.isActive,
      taxRate: productForm.taxRate / 100,
      discountEligible: productForm.discountEligible,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setProducts([newProduct, ...products]);
    
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
      category: "",
      stock: 0,
      barcode: "",
      isActive: true,
      taxRate: 7,
      discountEligible: true,
    });
  };

  const handleEditProduct = () => {
    if (!selectedProduct || !productForm.name || productForm.price <= 0) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบ",
        status: "error",
        duration: 3000,
      });
      return;
    }
    
    const updatedProducts = products.map(p => 
      p.id === selectedProduct.id 
        ? { ...p, ...productForm, taxRate: productForm.taxRate / 100, updatedAt: new Date() }
        : p
    );
    
    setProducts(updatedProducts);
    
    toast({
      title: "แก้ไขสินค้าเรียบร้อย",
      status: "success",
      duration: 3000,
    });
    
    onEditProductClose();
    setSelectedProduct(null);
  };

  const handleDeleteProduct = (productId: string) => {
    const updatedProducts = products.filter(p => p.id !== productId);
    setProducts(updatedProducts);
    
    toast({
      title: "ลบสินค้าเรียบร้อย",
      status: "success",
      duration: 3000,
    });
  };

  const getStatusColor = (stock: number) => {
    if (stock === 0) return "red";
    if (stock <= 10) return "orange";
    return "green";
  };

  const getStatusText = (stock: number) => {
    if (stock === 0) return "หมด";
    if (stock <= 10) return "ใกล้หมด";
    return "มีสินค้า";
  };

  const formatCurrency = (amount: number) => {
    return `฿${amount.toFixed(2)}`;
  };

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
                  แสดง {filteredProducts.length} จาก {totalProducts} รายการ
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
                  {paginatedTableProducts.map((product) => (
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
                        <Badge colorScheme="blue">{product.category}</Badge>
                      </Td>
                      <Td isNumeric>
                        <Text fontWeight="bold">{formatCurrency(product.price)}</Text>
                      </Td>
                      <Td isNumeric>
                        <VStack align="end" spacing={1}>
                          <Text>{product.stock}</Text>
                          <Progress 
                            value={(product.stock / 100) * 100} 
                            size="sm" 
                            colorScheme={getStatusColor(product.stock)}
                            borderRadius="full"
                            w="60px"
                          />
                        </VStack>
                      </Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(product.stock)}>
                          {getStatusText(product.stock)}
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
                                category: product.category,
                                stock: product.stock,
                                barcode: product.barcode || "",
                                isActive: product.isActive,
                                taxRate: product.taxRate * 100,
                                discountEligible: product.discountEligible,
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
              <HStack justify="center" mt={4} spacing={1}>
                <IconButton icon={<IoChevronBack />} aria-label="ย้อนกลับ" onClick={() => setCurrentTablePage(p => Math.max(1, p - 1))} isDisabled={currentTablePage === 1} />
                {Array.from({ length: totalTablePages }, (_, i) => (
                  <Button
                    key={i+1}
                    size="sm"
                    borderRadius="full"
                    variant={currentTablePage === i+1 ? "solid" : "ghost"}
                    colorScheme={currentTablePage === i+1 ? "blue" : undefined}
                    onClick={() => setCurrentTablePage(i+1)}
                  >
                    {i+1}
                  </Button>
                ))}
                <IconButton icon={<IoChevronForward />} aria-label="ถัดไป" onClick={() => setCurrentTablePage(p => Math.min(totalTablePages, p + 1))} isDisabled={currentTablePage === totalTablePages} />
              </HStack>
            </CardBody>
          </Card>
        ) : (
          <Box>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
              {paginatedGridProducts.map((product) => (
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
                        <Badge colorScheme={getStatusColor(product.stock)}>
                          {getStatusText(product.stock)}
                        </Badge>
                      </HStack>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold" fontSize="lg">{product.name}</Text>
                        <Text fontSize="sm" color="gray.500" noOfLines={2}>
                          {product.description}
                        </Text>
                        <Badge colorScheme="blue">{product.category}</Badge>
                      </VStack>
                      <Divider />
                      <VStack spacing={2} align="stretch">
                        <HStack justify="space-between">
                          <Text fontWeight="bold" color="green.500">{formatCurrency(product.price)}</Text>
                          <Text fontSize="sm">สต็อก: {product.stock}</Text>
                        </HStack>
                        <Progress 
                          value={(product.stock / 100) * 100} 
                          size="sm" 
                          colorScheme={getStatusColor(product.stock)}
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
                              category: product.category,
                              stock: product.stock,
                              barcode: product.barcode || "",
                              isActive: product.isActive,
                              taxRate: product.taxRate * 100,
                              discountEligible: product.discountEligible,
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
            <HStack justify="center" mt={4} spacing={1}>
              <IconButton icon={<IoChevronBack />} aria-label="ก่อนหน้า" onClick={() => setCurrentGridSlide(s => Math.max(1, s - 1))} isDisabled={currentGridSlide === 1} />
              {Array.from({ length: totalGridSlides }, (_, i) => (
                <Button
                  key={i+1}
                  size="sm"
                  borderRadius="full"
                  variant={currentGridSlide === i+1 ? "solid" : "ghost"}
                  colorScheme={currentGridSlide === i+1 ? "blue" : undefined}
                  onClick={() => setCurrentGridSlide(i+1)}
                >
                  {i+1}
                </Button>
              ))}
              <IconButton icon={<IoChevronForward />} aria-label="ถัดไป" onClick={() => setCurrentGridSlide(s => Math.min(totalGridSlides, s + 1))} isDisabled={currentGridSlide === totalGridSlides} />
            </HStack>
          </Box>
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
                      value={productForm.category}
                      onChange={e => setProductForm({...productForm, category: e.target.value})}
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
                    <FormLabel>อัตราภาษี (%)</FormLabel>
                    <NumberInput 
                      value={productForm.taxRate}
                      onChange={(_, value) => setProductForm({...productForm, taxRate: value})}
                      min={0}
                      max={100}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>
                <HStack w="full">
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">สินค้าที่ใช้งาน</FormLabel>
                    <Switch 
                      isChecked={productForm.isActive}
                      onChange={e => setProductForm({...productForm, isActive: e.target.checked})}
                    />
                  </FormControl>
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">สามารถลดราคาได้</FormLabel>
                    <Switch 
                      isChecked={productForm.discountEligible}
                      onChange={e => setProductForm({...productForm, discountEligible: e.target.checked})}
                    />
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
                      value={productForm.category}
                      onChange={e => setProductForm({...productForm, category: e.target.value})}
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
                    <FormLabel>อัตราภาษี (%)</FormLabel>
                    <NumberInput 
                      value={productForm.taxRate}
                      onChange={(_, value) => setProductForm({...productForm, taxRate: value})}
                      min={0}
                      max={100}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>
                <HStack w="full">
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">สินค้าที่ใช้งาน</FormLabel>
                    <Switch 
                      isChecked={productForm.isActive}
                      onChange={e => setProductForm({...productForm, isActive: e.target.checked})}
                    />
                  </FormControl>
                  <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">สามารถลดราคาได้</FormLabel>
                    <Switch 
                      isChecked={productForm.discountEligible}
                      onChange={e => setProductForm({...productForm, discountEligible: e.target.checked})}
                    />
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
                      <Badge colorScheme="blue">{selectedProduct.category}</Badge>
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
                      <Badge colorScheme={getStatusColor(selectedProduct.stock)}>
                        {getStatusText(selectedProduct.stock)}
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
                  category: selectedProduct.category,
                  stock: selectedProduct.stock,
                  barcode: selectedProduct.barcode || "",
                  isActive: selectedProduct.isActive,
                  taxRate: selectedProduct.taxRate * 100,
                  discountEligible: selectedProduct.discountEligible,
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
