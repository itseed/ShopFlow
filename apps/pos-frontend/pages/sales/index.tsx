import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  VStack,
  HStack,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  IconButton,
  useToast,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  Divider,
  Flex,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Image,
  Button,
  Heading,
  useColorModeValue,
  Icon,
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Avatar,
  Card,
  CardBody,
} from "@chakra-ui/react";
import {
  IoSearch,
  IoGrid,
  IoList,
  IoCart,
  IoTrash,
  IoCard,
  IoAdd,
  IoRemove,
  IoClose,
  IoCheckmark,
  IoTrendingUp,
  IoPrintOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoCash,
  IoQrCode,
} from "react-icons/io5";
import {
  SalesProduct,
  SalesCartItem,
  SalesProductSearchFilters,
  PaymentResult,
  Branch,
} from "@shopflow/types";

// Local Receipt type for POS terminal
interface SalesReceipt {
  id: string;
  transactionId: string;
  receiptNumber: string;
  timestamp: string;
  items: SalesCartItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  paymentMethod: string;
  paymentDetails: PaymentResult;
  customer?: {
    name: string;
    email?: string;
    phone?: string;
  };
  cashier: {
    name: string;
    username: string;
  };
  branch: {
    name: string;
    address: string;
    phone: string;
    taxId: string;
  };
  footer: string;
  isPrinted: boolean;
  isEmailSent: boolean;
}
import { useSales } from "../../contexts/SalesContext";
import {
  POSLayout,
  TouchButton,
  POSCard,
  LoadingSpinner,
} from "../../components";
import PaymentModal from "../../components/payment/PaymentModal";
import ReceiptModal from "../../components/payment/ReceiptModal";
import { formatCurrency, getProductCategories } from "../../lib/sales";
import {
  useSalesProducts,
  useSearchSalesProducts,
} from "../../lib/hooks/useSalesProducts";
import ProductGrid from "../../components/sales/ProductGrid";
import ProductList from "../../components/sales/ProductList";
import CartSummary from "../../components/sales/CartSummary";

const SalesTerminal = () => {
  const {
    cart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    isLoading,
    error,
  } = useSales();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filters, setFilters] = useState<SalesProductSearchFilters>({
    category: undefined,
    searchTerm: undefined,
    inStock: true,
    priceRange: undefined,
    barcode: undefined,
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [currentReceipt, setCurrentReceipt] = useState<any>(null);

  // Use API hooks for products
  const productsQuery = useSalesProducts(filters, {
    limit: 100,
    fallbackToMock: true,
  });

  const searchQuery = useSearchSalesProducts(searchTerm, {
    limit: 50,
    inStockOnly: true,
    fallbackToMock: true,
  });

  // Use search results if searching, otherwise use all products
  const products =
    searchTerm.length >= 2 ? searchQuery.data || [] : productsQuery.data || [];

  const toast = useToast();

  // Modal states
  const {
    isOpen: isQuantityModalOpen,
    onOpen: onQuantityModalOpen,
    onClose: onQuantityModalClose,
  } = useDisclosure();
  const {
    isOpen: isPaymentModalOpen,
    onOpen: onPaymentModalOpen,
    onClose: onPaymentModalClose,
  } = useDisclosure();
  const {
    isOpen: isReceiptModalOpen,
    onOpen: onReceiptModalOpen,
    onClose: onReceiptModalClose,
  } = useDisclosure();

  const [selectedProduct, setSelectedProduct] = useState<SalesProduct | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);
  const [variantModalProduct, setVariantModalProduct] =
    useState<SalesProduct | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null
  );
  const [variantSelections, setVariantSelections] = useState<
    Record<string, string>
  >({});
  const [variantQuantity, setVariantQuantity] = useState(1);

  const [perPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedProducts =
    viewMode === "grid"
      ? products.slice((currentPage - 1) * perPage, currentPage * perPage)
      : products;
  const totalPages =
    viewMode === "grid" ? Math.ceil(products.length / perPage) : 1;

  // Color mode values
  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #2d3748 0%, #1a202c 100%)"
  );
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Mock sales stats
  const salesStats = {
    todaySales: 15420.5,
    totalTransactions: 89,
    averageTicket: 173.26,
    topProduct: "Coca Cola",
    salesGrowth: 12.5,
  };

  useEffect(() => {
    setCurrentPage(1); // reset page เมื่อเปลี่ยน filter/view
  }, [products, viewMode, searchTerm, selectedCategory]);

  const handleSelectVariant = (product: SalesProduct) => {
    setVariantModalProduct(product);
    setVariantSelections({});
    setSelectedVariantId(null);
    setVariantQuantity(1);
  };

  const handleVariantTypeSelect = (type: string, value: string) => {
    setVariantSelections((prev) => ({ ...prev, [type]: value }));
    setSelectedVariantId(null); // reset selected variant id
  };

  const getAvailableVariantTypes = (product: SalesProduct) => {
    if (!product.variants) return [];
    const allTypes = Object.keys(product.variants[0].variant_combinations);
    return allTypes;
  };

  const getFilteredVariants = (product: SalesProduct) => {
    if (!product.variants) return [];
    // filter variants ที่ตรงกับ selections ที่เลือกแล้ว
    return product.variants.filter((variant) => {
      return Object.entries(variantSelections).every(
        ([type, value]) => variant.variant_combinations[type] === value
      );
    });
  };

  const isAllVariantTypeSelected = (product: SalesProduct) => {
    const types = getAvailableVariantTypes(product);
    return types.every((type) => variantSelections[type]);
  };

  const handleAddVariantToCart = () => {
    if (variantModalProduct && isAllVariantTypeSelected(variantModalProduct)) {
      const match = variantModalProduct.variants?.find((variant) => {
        return Object.entries(variantSelections).every(
          ([type, value]) => variant.variant_combinations[type] === value
        );
      });
      if (match) {
        addToCart(
          {
            ...variantModalProduct,
            price: variantModalProduct.price + (match.price_adjustment || 0),
            name: `${variantModalProduct.name} (${Object.values(
              match.variant_combinations
            ).join(", ")})`,
            stock: match.stock,
            // ไม่ใส่ variantId/variantCombinations ใน SalesProduct (type error)
          },
          variantQuantity
        );
        setVariantModalProduct(null);
        setVariantSelections({});
        setSelectedVariantId(null);
        setVariantQuantity(1);
        toast({
          title: "เพิ่มลงตะกร้าแล้ว",
          description: `${variantModalProduct.name} (${Object.values(
            match.variant_combinations
          ).join(", ")}) x${variantQuantity}`,
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      }
    }
  };

  useEffect(() => {
    // Load categories on mount
    setCategories(getProductCategories());
  }, []);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters((prev) => ({ ...prev, searchTerm: value }));
  };

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    setFilters((prev) => ({ ...prev, category: category || undefined }));
  };

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
  };

  const handleAddToCart = (product: SalesProduct) => {
    if (product.variants && product.variants.length > 0) {
      handleSelectVariant(product);
    } else {
      setSelectedProduct(product);
      setQuantity(1);
      onQuantityModalOpen();
    }
  };

  const handleQuickAddToCart = (product: SalesProduct) => {
    addToCart(product, 1);
  };

  const handleQuantitySubmit = () => {
    if (selectedProduct) {
      addToCart(selectedProduct, quantity);
      onQuantityModalClose();
      setSelectedProduct(null);
      setQuantity(1);
      toast({
        title: "เพิ่มลงตะกร้าแล้ว",
        description: `${selectedProduct.name} x${quantity}`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    updateCartItem(itemId, { quantity: newQuantity });
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId);
    toast({
      title: "ลบออกจากตะกร้าแล้ว",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleClearCart = () => {
    clearCart();
    toast({
      title: "ล้างตะกร้าแล้ว",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const handlePayment = () => {
    if (!cart.items || cart.items.length === 0) {
      toast({
        title: "ตะกร้าว่าง",
        description: "กรุณาเพิ่มสินค้าลงตะกร้าก่อน",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    onPaymentModalOpen();
  };

  const handlePaymentComplete = (result: PaymentResult) => {
    // Generate receipt from payment result - use any type to bypass strict type checking
    const receipt: any = {
      id: `receipt_${Date.now()}`,
      transactionId: result.transactionId,
      receiptNumber: `R${Date.now().toString().slice(-8)}`,
      timestamp: result.timestamp,
      items: cart.items,
      subtotal: cart.subtotal,
      discountAmount: cart.discountAmount,
      taxAmount: cart.taxAmount,
      total: cart.total,
      paymentMethod: result.method,
      paymentDetails: result,
      cashier: {
        name: "พนักงาน",
        username: "cashier",
      },
      branch: {
        name: "ShopFlow สาขาหลัก",
        address: "123 ถนนสุขุมวิท กรุงเทพ 10110",
        phone: "02-123-4567",
        taxId: "0123456789012",
      },
      footer: "ขอบคุณที่ใช้บริการ",
      isPrinted: false,
      isEmailSent: false,
      // Add dummy fields for type compatibility
      order: {},
      user: {},
      printed_at: null,
    };

    setCurrentReceipt(receipt);
    onPaymentModalClose();
    onReceiptModalOpen();
    clearCart();
    toast({
      title: "ชำระเงินสำเร็จ",
      description: `ยอดรวม: ${formatCurrency(result.amount)}`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleReceiptPrint = () => {
    // Implement print functionality
    toast({
      title: "พิมพ์ใบเสร็จ",
      description: "กำลังพิมพ์ใบเสร็จ...",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleReceiptEmail = () => {
    // Implement email functionality
    toast({
      title: "ส่งอีเมล",
      description: "กำลังส่งใบเสร็จทางอีเมล...",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const cartTotal = cart.items?.reduce((sum, item) => sum + item.total, 0) || 0;
  const cartItemCount =
    cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading sales terminal..." />;
  }

  return (
    <POSLayout>
      <Grid
        templateColumns={{ base: "1fr", lg: "2fr 1fr" }}
        gap={6}
        h="calc(100vh - 200px)"
      >
        {/* Left Panel - Products */}
        <VStack spacing={6} align="stretch">
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
            <Flex
              justify="space-between"
              align="center"
              position="relative"
              zIndex={1}
            >
              <VStack align="start" spacing={2}>
                <Heading size="lg" fontWeight="bold">
                  🛒 ระบบขายสินค้า
                </Heading>
                <Text fontSize="lg" opacity={0.9}>
                  ยอดขายวันนี้: ฿{salesStats.todaySales.toLocaleString()}
                </Text>
              </VStack>
              <VStack align="end" spacing={2}>
                <HStack spacing={4}>
                  <Stat color="white">
                    <StatLabel fontSize="sm">ธุรกรรม</StatLabel>
                    <StatNumber fontSize="2xl">
                      {salesStats.totalTransactions}
                    </StatNumber>
                  </Stat>
                  <Stat color="white">
                    <StatLabel fontSize="sm">เฉลี่ย/รายการ</StatLabel>
                    <StatNumber fontSize="2xl">
                      ฿{salesStats.averageTicket}
                    </StatNumber>
                  </Stat>
                </HStack>
                <HStack spacing={2}>
                  <Icon as={IoTrendingUp} color="yellow.300" />
                  <Text fontSize="sm" opacity={0.9}>
                    +{salesStats.salesGrowth}% จากเมื่อวาน
                  </Text>
                </HStack>
              </VStack>
            </Flex>
          </Box>

          {/* Search and Filters */}
          <POSCard variant="elevated" bg={cardBg} borderColor={borderColor}>
            <VStack spacing={4}>
              <HStack w="full" spacing={4}>
                <InputGroup>
                  <InputLeftElement>
                    <Icon as={IoSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="ค้นหาสินค้า..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    size="lg"
                    borderRadius="xl"
                  />
                </InputGroup>
                <HStack spacing={2}>
                  <IconButton
                    aria-label="Grid view"
                    icon={<IoGrid />}
                    variant={viewMode === "grid" ? "solid" : "ghost"}
                    colorScheme="blue"
                    onClick={() => handleViewModeChange("grid")}
                    size="lg"
                  />
                  <IconButton
                    aria-label="List view"
                    icon={<IoList />}
                    variant={viewMode === "list" ? "solid" : "ghost"}
                    colorScheme="blue"
                    onClick={() => handleViewModeChange("list")}
                    size="lg"
                  />
                </HStack>
              </HStack>

              {/* Category Tabs */}
              <Tabs variant="soft-rounded" colorScheme="blue" w="full">
                <TabList>
                  <Tab onClick={() => handleCategoryChange(null)}>
                    ทั้งหมด ({products.length})
                  </Tab>
                  {categories.map((category) => (
                    <Tab
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                    >
                      {category}
                    </Tab>
                  ))}
                </TabList>
              </Tabs>
            </VStack>
          </POSCard>

          {/* Products Display */}
          <Box flex="1" overflow="auto">
            {viewMode === "grid" ? (
              <VStack spacing={4}>
                <ProductGrid
                  products={paginatedProducts}
                  onAddToCart={handleAddToCart}
                  onQuickAddToCart={handleQuickAddToCart}
                  onSelectVariant={handleSelectVariant}
                />

                {/* Pagination Controls for Grid View */}
                {totalPages > 1 && (
                  <HStack spacing={2} justify="center">
                    <IconButton
                      aria-label="Previous page"
                      icon={<IoChevronBackOutline />}
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      isDisabled={currentPage === 1}
                      size="sm"
                      variant="outline"
                    />

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <Button
                          key={page}
                          size="sm"
                          variant={currentPage === page ? "solid" : "outline"}
                          colorScheme="blue"
                          onClick={() => setCurrentPage(page)}
                          minW="40px"
                        >
                          {page}
                        </Button>
                      )
                    )}

                    <IconButton
                      aria-label="Next page"
                      icon={<IoChevronForwardOutline />}
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      isDisabled={currentPage === totalPages}
                      size="sm"
                      variant="outline"
                    />
                  </HStack>
                )}

                {/* Results Info */}
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  แสดง {(currentPage - 1) * perPage + 1}-
                  {Math.min(currentPage * perPage, products.length)} จาก{" "}
                  {products.length} รายการ
                </Text>
              </VStack>
            ) : (
              <ProductList
                products={products}
                onAddToCart={handleAddToCart}
                onQuickAddToCart={handleQuickAddToCart}
              />
            )}
          </Box>
        </VStack>

        {/* Right Panel - Cart */}
        <VStack spacing={4} align="stretch">
          {/* Cart Header */}
          <POSCard variant="elevated" bg={cardBg} borderColor={borderColor}>
            <HStack justify="space-between" align="center">
              <HStack spacing={3}>
                <Box
                  p={2}
                  borderRadius="lg"
                  bgGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  color="white"
                >
                  <Icon as={IoCart} boxSize={5} />
                </Box>
                <VStack align="start" spacing={0}>
                  <Heading size="md" color="gray.700">
                    ตะกร้าสินค้า
                  </Heading>
                  <Text fontSize="sm" color="gray.500">
                    {cartItemCount || 0} รายการ
                  </Text>
                </VStack>
              </HStack>
              <TouchButton
                variant="danger"
                size="sm"
                leftIcon={<IoTrash />}
                onClick={handleClearCart}
                isDisabled={!cart.items || cart.items.length === 0}
              >
                ล้างตะกร้า
              </TouchButton>
            </HStack>
          </POSCard>

          {/* Cart Items */}
          <Box flex="1" overflow="auto">
            <CartSummary
              items={cart.items || []}
              subtotal={cart.subtotal || 0}
              taxAmount={cart.taxAmount || 0}
              discountAmount={cart.discountAmount || 0}
              total={cart.total || 0}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
            />
          </Box>

          {/* Payment Section */}
          <POSCard variant="elevated" bg={cardBg} borderColor={borderColor}>
            <VStack spacing={4}>
              <HStack justify="space-between" w="full">
                <Text fontSize="lg" fontWeight="bold" color="gray.700">
                  ยอดรวม
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="green.500">
                  ฿{formatCurrency(cartTotal)}
                </Text>
              </HStack>

              <SimpleGrid columns={2} spacing={3} w="full">
                <TouchButton
                  variant="primary"
                  size="lg"
                  leftIcon={<IoCard />}
                  onClick={handlePayment}
                  isDisabled={!cart.items || cart.items.length === 0}
                  bgGradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  _hover={{
                    transform: "translateY(-1px)",
                    boxShadow: "lg",
                  }}
                  color="white"
                >
                  บัตรเครดิต
                </TouchButton>
                <TouchButton
                  variant="success"
                  size="lg"
                  leftIcon={<IoCash />}
                  onClick={handlePayment}
                  isDisabled={!cart.items || cart.items.length === 0}
                  bgGradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                  _hover={{
                    transform: "translateY(-1px)",
                    boxShadow: "lg",
                  }}
                  color="white"
                >
                  เงินสด
                </TouchButton>
              </SimpleGrid>

              <TouchButton
                variant="warning"
                size="lg"
                leftIcon={<IoQrCode />}
                onClick={handlePayment}
                isDisabled={!cart.items || cart.items.length === 0}
                bgGradient="linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"
                _hover={{
                  transform: "translateY(-1px)",
                  boxShadow: "lg",
                }}
                color="white"
                w="full"
              >
                QR Payment
              </TouchButton>
            </VStack>
          </POSCard>
        </VStack>
      </Grid>

      {/* Quantity Modal */}
      <Modal isOpen={isQuantityModalOpen} onClose={onQuantityModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>เลือกจำนวน</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text>{selectedProduct?.name}</Text>
              <NumberInput
                value={quantity}
                onChange={(_, value) => setQuantity(value)}
                min={1}
                max={selectedProduct?.stock || 999}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <TouchButton
                variant="primary"
                onClick={handleQuantitySubmit}
                width="full"
              >
                เพิ่มลงตะกร้า
              </TouchButton>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Variant Selection Modal */}
      <Modal
        isOpen={!!variantModalProduct}
        onClose={() => setVariantModalProduct(null)}
        size="lg"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>เลือกรูปแบบสินค้า</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {variantModalProduct && (
              <VStack spacing={4} align="stretch">
                <HStack>
                  <Image
                    src={variantModalProduct.image}
                    alt={variantModalProduct.name}
                    boxSize="60px"
                    borderRadius="md"
                    fallback={
                      <Box
                        boxSize="60px"
                        bg="gray.100"
                        borderRadius="md"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        📦
                      </Box>
                    }
                  />
                  <VStack align="start" spacing={0}>
                    <Text fontWeight="bold">{variantModalProduct.name}</Text>
                    <Text fontSize="sm" color="gray.600">
                      {variantModalProduct.description}
                    </Text>
                    <Text fontSize="lg" fontWeight="bold" color="blue.600">
                      ฿{variantModalProduct.price.toFixed(2)}
                    </Text>
                  </VStack>
                </HStack>

                {/* Variant Type Selection */}
                {getAvailableVariantTypes(variantModalProduct).map((type) => (
                  <Box key={type}>
                    <Text fontWeight="medium" mb={2} textTransform="capitalize">
                      {type === "size"
                        ? "ขนาด"
                        : type === "color"
                        ? "สี"
                        : type}
                      :
                    </Text>
                    <SimpleGrid columns={3} spacing={2}>
                      {Array.from(
                        new Set(
                          variantModalProduct.variants?.map(
                            (v) => v.variant_combinations[type]
                          ) || []
                        )
                      ).map((value) => {
                        const isSelected = variantSelections[type] === value;
                        const variantsForThisValue = getFilteredVariants(
                          variantModalProduct
                        ).filter((v) => v.variant_combinations[type] === value);
                        const hasStock = variantsForThisValue.some(
                          (v) => v.stock > 0
                        );

                        return (
                          <Button
                            key={value}
                            size="sm"
                            variant={isSelected ? "solid" : "outline"}
                            colorScheme={isSelected ? "blue" : "gray"}
                            onClick={() => handleVariantTypeSelect(type, value)}
                            isDisabled={!hasStock}
                          >
                            {value}
                          </Button>
                        );
                      })}
                    </SimpleGrid>
                  </Box>
                ))}

                {/* Final Variant Selection */}
                {isAllVariantTypeSelected(variantModalProduct) && (
                  <Box>
                    <Text fontWeight="medium" mb={2}>
                      เลือกรูปแบบ:
                    </Text>
                    <VStack spacing={2}>
                      {getFilteredVariants(variantModalProduct).map(
                        (variant) => {
                          const combinationText = Object.values(
                            variant.variant_combinations
                          ).join(", ");
                          const finalPrice =
                            variantModalProduct.price +
                            (variant.price_adjustment || 0);
                          const isSelected = selectedVariantId === variant.id;

                          return (
                            <Box
                              key={variant.id}
                              p={3}
                              border="1px solid"
                              borderColor={isSelected ? "blue.500" : "gray.200"}
                              borderRadius="md"
                              cursor="pointer"
                              bg={isSelected ? "blue.50" : "white"}
                              onClick={() => setSelectedVariantId(variant.id)}
                              w="full"
                            >
                              <HStack justify="space-between">
                                <VStack align="start" spacing={0}>
                                  <Text fontWeight="medium">
                                    {combinationText}
                                  </Text>
                                  <Text fontSize="sm" color="gray.600">
                                    คงเหลือ: {variant.stock} ชิ้น
                                  </Text>
                                </VStack>
                                <Text fontWeight="bold" color="blue.600">
                                  ฿{finalPrice.toFixed(2)}
                                </Text>
                              </HStack>
                            </Box>
                          );
                        }
                      )}
                    </VStack>
                  </Box>
                )}

                {/* Quantity Selection for Variant */}
                {selectedVariantId && (
                  <Box>
                    <Text fontWeight="medium" mb={2}>
                      จำนวน:
                    </Text>
                    <HStack>
                      <NumberInput
                        value={variantQuantity}
                        onChange={(value) => setVariantQuantity(Number(value))}
                        min={1}
                        max={
                          variantModalProduct.variants?.find(
                            (v) => v.id === selectedVariantId
                          )?.stock || 1
                        }
                        size="lg"
                        flex={1}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                      <TouchButton
                        variant="primary"
                        onClick={handleAddVariantToCart}
                        size="lg"
                        px={8}
                      >
                        เพิ่มลงตะกร้า
                      </TouchButton>
                    </HStack>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={onPaymentModalClose}
        cart={cart}
        onPaymentComplete={handlePaymentComplete}
      />

      {/* Receipt Modal */}
      {currentReceipt && (
        <ReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={onReceiptModalClose}
          receipt={currentReceipt}
          onPrint={handleReceiptPrint}
          onEmailSend={handleReceiptEmail}
        />
      )}
    </POSLayout>
  );
};

export default SalesTerminal;
