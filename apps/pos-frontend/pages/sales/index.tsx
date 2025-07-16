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
} from "@chakra-ui/react";
import {
  IoSearch,
  IoGrid,
  IoList,
  IoTrash,
  IoAdd,
  IoRemove,
} from "react-icons/io5";
import {
  SalesProduct,
  SalesCartItem,
  SalesProductSearchFilters,
  PaymentResult,
  Receipt,
} from "@shopflow/types";
import { useSales } from "../../contexts/SalesContext";
import { POSLayout, TouchButton, POSCard, LoadingSpinner } from "../../components";
import PaymentModal from "../../components/payment/PaymentModal";
import ReceiptModal from "../../components/payment/ReceiptModal";
import {
  searchProducts,
  formatCurrency,
  getProductCategories,
} from "../../lib/sales";
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
  const [products, setProducts] = useState<SalesProduct[]>([]);
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
  const [currentReceipt, setCurrentReceipt] = useState<Receipt | null>(null);
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
  const [variantModalProduct, setVariantModalProduct] = useState<SalesProduct | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [variantSelections, setVariantSelections] = useState<Record<string, string>>({});
  const [variantQuantity, setVariantQuantity] = useState(1);

  const [perPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedProducts = viewMode === "grid"
    ? products.slice((currentPage - 1) * perPage, currentPage * perPage)
    : products;
  const totalPages = viewMode === "grid" ? Math.ceil(products.length / perPage) : 1;

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
        addToCart({
          ...variantModalProduct,
          price: variantModalProduct.price + (match.price_adjustment || 0),
          name: `${variantModalProduct.name} (${Object.values(match.variant_combinations).join(", ")})`,
          stock: match.stock,
          // ไม่ใส่ variantId/variantCombinations ใน SalesProduct (type error)
        }, variantQuantity);
        setVariantModalProduct(null);
        setVariantSelections({});
        setSelectedVariantId(null);
        setVariantQuantity(1);
        toast({
          title: "เพิ่มลงตะกร้าแล้ว",
          description: `${variantModalProduct.name} (${Object.values(match.variant_combinations).join(", ")}) x${variantQuantity}`,
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      }
    }
  };

  useEffect(() => {
    // Load products on mount
    const loadProducts = async () => {
      try {
        const allProducts = await searchProducts(filters);
        setProducts(allProducts);
        setCategories(getProductCategories());
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load products",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    loadProducts();
  }, [filters, toast]);

  useEffect(() => {
    // Update filters when search term or category changes
    setFilters((prev) => ({
      ...prev,
      searchTerm: searchTerm || undefined,
      category: selectedCategory || undefined,
    }));
  }, [searchTerm, selectedCategory]);

  const handleAddToCart = (product: SalesProduct) => {
    addToCart(product, 1);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleQuickAddToCart = (product: SalesProduct) => {
    setSelectedProduct(product);
    setQuantity(1);
    onQuantityModalOpen();
  };

  const handleQuantitySubmit = () => {
    if (selectedProduct && quantity > 0) {
      addToCart(selectedProduct, quantity);
      toast({
        title: "Added to Cart",
        description: `${quantity}x ${selectedProduct.name} added to cart`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }
    onQuantityModalClose();
    setSelectedProduct(null);
    setQuantity(1);
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateCartItem(itemId, { quantity: newQuantity });
    }
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId);
    toast({
      title: "Item Removed",
      description: "Item has been removed from cart",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleClearCart = () => {
    clearCart();
    toast({
      title: "Cart Cleared",
      description: "All items have been removed from cart",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const handlePayment = () => {
    if (cart.items.length === 0) {
      toast({
        title: "ไม่มีสินค้าในตะกร้า",
        description: "กรุณาเพิ่มสินค้าในตะกร้าก่อนชำระเงิน",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    onPaymentModalOpen();
  };

  const handlePaymentComplete = (result: PaymentResult) => {
    // Generate receipt
    const receipt: Receipt = {
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
    };

    setCurrentReceipt(receipt);
    onPaymentModalClose();
    clearCart();
    onReceiptModalOpen();

    toast({
      title: "ชำระเงินสำเร็จ",
      description: `ธุรกรรมเสร็จสิ้น ${formatCurrency(result.amount)}`,
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  };

  const handleReceiptPrint = () => {
    if (currentReceipt) {
      setCurrentReceipt((prev) => (prev ? { ...prev, isPrinted: true } : null));
      toast({
        title: "พิมพ์ใบเสร็จ",
        description: "ใบเสร็จถูกส่งไปยังเครื่องพิมพ์แล้ว",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleReceiptEmail = () => {
    if (currentReceipt) {
      setCurrentReceipt((prev) =>
        prev ? { ...prev, isEmailSent: true } : null
      );
      toast({
        title: "ส่งอีเมล",
        description: "ใบเสร็จถูกส่งทางอีเมลแล้ว",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <POSLayout>
      <Grid templateColumns="1fr 350px" gap={6} h="full">
        {/* Products Section */}
        <VStack spacing={4} align="stretch">
          {/* Search and Filters */}
          <HStack spacing={4}>
            <InputGroup flex={1}>
              <InputLeftElement pointerEvents="none">
                <IoSearch color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="lg"
              />
            </InputGroup>
            <HStack>
              <IconButton
                icon={<IoGrid />}
                aria-label="Grid view"
                colorScheme={viewMode === "grid" ? "primary" : "gray"}
                onClick={() => setViewMode("grid")}
              />
              <IconButton
                icon={<IoList />}
                aria-label="List view"
                colorScheme={viewMode === "list" ? "primary" : "gray"}
                onClick={() => setViewMode("list")}
              />
            </HStack>
          </HStack>

          {/* Category Tabs */}
          <Tabs
            onChange={(index) => {
              if (index === 0) {
                setSelectedCategory(null);
              } else {
                setSelectedCategory(categories[index - 1]);
              }
            }}
          >
            <TabList>
              <Tab>All</Tab>
              {categories.map((category) => (
                <Tab key={category}>{category}</Tab>
              ))}
            </TabList>
            <TabPanels>
              <TabPanel p={0}>
                <Box py={4}>
                  {viewMode === "grid" ? (
                    <>
                      <ProductGrid
                        products={paginatedProducts}
                        onAddToCart={handleAddToCart}
                        onQuickAddToCart={handleQuickAddToCart}
                        onSelectVariant={handleSelectVariant}
                      />
                      {/* Pagination */}
                      {totalPages > 1 && (
                        <HStack justify="center" mt={4} spacing={2}>
                          <Button
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            isDisabled={currentPage === 1}
                          >
                            ก่อนหน้า
                          </Button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <Button
                              key={page}
                              size="sm"
                              variant={page === currentPage ? "solid" : "ghost"}
                              colorScheme={page === currentPage ? "blue" : undefined}
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </Button>
                          ))}
                          <Button
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            isDisabled={currentPage === totalPages}
                          >
                            ถัดไป
                          </Button>
                        </HStack>
                      )}
                    </>
                  ) : (
                    <ProductList
                      products={products}
                      onAddToCart={handleAddToCart}
                      onQuickAddToCart={handleQuickAddToCart}
                    />
                  )}
                </Box>
              </TabPanel>
              {categories.map((category) => (
                <TabPanel key={category} p={0}>
                  <Box py={4}>
                    {viewMode === "grid" ? (
                      <ProductGrid
                        products={products.filter((p) => p.category === category)}
                        onAddToCart={handleAddToCart}
                        onQuickAddToCart={handleQuickAddToCart}
                      />
                    ) : (
                      <ProductList
                        products={products.filter((p) => p.category === category)}
                        onAddToCart={handleAddToCart}
                        onQuickAddToCart={handleQuickAddToCart}
                      />
                    )}
                  </Box>
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </VStack>

        {/* Cart Section */}
        <VStack spacing={4} align="stretch" h="100vh" maxH="100vh" flex={1} minH={0}>
          <Box flex="1" minH={0} overflow="hidden" display="flex" flexDirection="column">
            <CartSummary
              cart={cart}
              onClearCart={handleClearCart}
              onUpdateQuantity={handleUpdateQuantity}
              scrollableItems
              p={5}
              shadow="lg"
              borderRadius="xl"
            />
          </Box>
          <Box>
            <TouchButton
              size="lg"
              colorScheme="primary"
              isDisabled={cart.items.length === 0}
              onClick={handlePayment}
              w="100%"
              py={6}
              fontSize="xl"
            >
              ชำระเงิน
            </TouchButton>
          </Box>
        </VStack>
      </Grid>

      {/* Quantity Modal */}
      <Modal
        isOpen={isQuantityModalOpen}
        onClose={onQuantityModalClose}
        size="sm"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add to Cart</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedProduct && (
              <VStack spacing={4}>
                <Text fontSize="lg" fontWeight="semibold">
                  {selectedProduct.name}
                </Text>
                <Text color="gray.600">
                  Price: {formatCurrency(selectedProduct.price)}
                </Text>
                <HStack>
                  <Text>Quantity:</Text>
                  <NumberInput
                    value={quantity}
                    onChange={(_, value) => setQuantity(value || 1)}
                    min={1}
                    max={99}
                    size="lg"
                    w="120px"
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </HStack>
                <HStack spacing={4} w="full">
                  <TouchButton
                    variant="secondary"
                    onClick={onQuantityModalClose}
                    flex={1}
                  >
                    Cancel
                  </TouchButton>
                  <TouchButton
                    colorScheme="primary"
                    onClick={handleQuantitySubmit}
                    flex={1}
                  >
                    Add to Cart
                  </TouchButton>
                </HStack>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Variant Modal */}
      {variantModalProduct && (
        <Modal isOpen={!!variantModalProduct} onClose={() => setVariantModalProduct(null)} size="sm">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>เลือกตัวเลือก</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <Text fontWeight="bold">{variantModalProduct.name}</Text>
                {getAvailableVariantTypes(variantModalProduct).map((type) => (
                  <Box key={type}>
                    <Text fontWeight="semibold" mb={1}>{type}</Text>
                    <HStack spacing={2} flexWrap="wrap">
                      {[...new Set(variantModalProduct.variants?.map(v => v.variant_combinations[type]))].map((value) => (
                        <Button
                          key={value}
                          variant={variantSelections[type] === value ? "solid" : "outline"}
                          colorScheme="blue"
                          onClick={() => handleVariantTypeSelect(type, value!)}
                          size="sm"
                        >
                          {value}
                        </Button>
                      ))}
                    </HStack>
                  </Box>
                ))}
                {/* เลือกจำนวน */}
                <Box>
                  <Text fontWeight="semibold" mb={1}>จำนวน</Text>
                  <HStack spacing={4}>
                    <TouchButton
                      size="lg"
                      onClick={() => setVariantQuantity((q) => Math.max(1, q - 1))}
                      aria-label="ลดจำนวน"
                      touchOptimized
                    >
                      -
                    </TouchButton>
                    <Text fontSize="2xl" minW="40px" textAlign="center">
                      {variantQuantity}
                    </Text>
                    <TouchButton
                      size="lg"
                      onClick={() => setVariantQuantity((q) => Math.min(99, q + 1))}
                      aria-label="เพิ่มจำนวน"
                      touchOptimized
                    >
                      +
                    </TouchButton>
                  </HStack>
                </Box>
                {/* แสดงรายการ variant ที่ตรงกับ selections */}
                {isAllVariantTypeSelected(variantModalProduct) && (
                  <Box mt={2}>
                    {getFilteredVariants(variantModalProduct).map((variant) => (
                      <Box key={variant.id} p={2} borderWidth={1} borderRadius="md" mb={2}>
                        <Text fontSize="sm">
                          {Object.entries(variant.variant_combinations).map(([type, value]) => `${type}: ${value}`).join(", ")}
                          {variant.price_adjustment !== 0 && (
                            <Text as="span" ml={2} color="gray.500" fontSize="sm">
                              ({variant.price_adjustment > 0 ? "+" : ""}{variant.price_adjustment} ฿)
                            </Text>
                          )}
                        </Text>
                      </Box>
                    ))}
                  </Box>
                )}
              </VStack>
            </ModalBody>
            <HStack p={4} justify="flex-end">
              <Button onClick={() => setVariantModalProduct(null)} variant="ghost">
                ยกเลิก
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleAddVariantToCart}
                isDisabled={!isAllVariantTypeSelected(variantModalProduct)}
              >
                เพิ่มลงตะกร้า
              </Button>
            </HStack>
          </ModalContent>
        </Modal>
      )}

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
