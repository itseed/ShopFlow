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
import { useSales } from "../contexts/SalesContext";
import { POSLayout, TouchButton, POSCard, LoadingSpinner } from "../components";
import PaymentModal from "../components/payment/PaymentModal";
import ReceiptModal from "../components/payment/ReceiptModal";
import {
  searchProducts,
  formatCurrency,
  getProductCategories,
} from "../lib/sales";

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

  const ProductGrid = ({ products }: { products: SalesProduct[] }) => (
    <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4}>
      {products.map((product) => (
        <POSCard
          key={product.id}
          p={3}
          cursor="pointer"
          onClick={() => handleAddToCart(product)}
          _hover={{ transform: "translateY(-2px)", shadow: "md" }}
          transition="all 0.2s"
        >
          {product.image && (
            <Image
              src={product.image}
              alt={product.name}
              height="80px"
              width="100%"
              objectFit="cover"
              borderRadius="md"
              mb={2}
            />
          )}
          <VStack spacing={2} align="stretch">
            <Text fontSize="sm" fontWeight="semibold" noOfLines={2}>
              {product.name}
            </Text>
            <Text fontSize="xs" color="gray.500" noOfLines={1}>
              {product.category}
            </Text>
            <HStack justify="space-between" align="center">
              <Text fontSize="md" fontWeight="bold" color="primary.600">
                {formatCurrency(product.price)}
              </Text>
              <IconButton
                size="sm"
                icon={<IoAdd />}
                aria-label="Add to cart"
                colorScheme="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickAddToCart(product);
                }}
              />
            </HStack>
          </VStack>
        </POSCard>
      ))}
    </SimpleGrid>
  );

  const ProductList = ({ products }: { products: SalesProduct[] }) => (
    <VStack spacing={3}>
      {products.map((product) => (
        <POSCard
          key={product.id}
          p={4}
          w="100%"
          cursor="pointer"
          onClick={() => handleAddToCart(product)}
          _hover={{ bg: "gray.50" }}
        >
          <HStack spacing={4} align="center">
            {product.image && (
              <Image
                src={product.image}
                alt={product.name}
                height="50px"
                width="50px"
                objectFit="cover"
                borderRadius="md"
              />
            )}
            <VStack align="start" spacing={1} flex={1}>
              <Text fontSize="sm" fontWeight="semibold">
                {product.name}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {product.category}
              </Text>
            </VStack>
            <VStack align="end" spacing={1}>
              <Text fontSize="md" fontWeight="bold" color="primary.600">
                {formatCurrency(product.price)}
              </Text>
              <IconButton
                size="sm"
                icon={<IoAdd />}
                aria-label="Add to cart"
                colorScheme="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickAddToCart(product);
                }}
              />
            </VStack>
          </HStack>
        </POSCard>
      ))}
    </VStack>
  );

  const CartSummary = () => (
    <POSCard>
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="lg" fontWeight="bold">
            Cart ({cart.items.length})
          </Text>
          <TouchButton
            size="sm"
            colorScheme="red"
            variant="secondary"
            leftIcon={<IoTrash />}
            onClick={handleClearCart}
            isDisabled={cart.items.length === 0}
          >
            Clear
          </TouchButton>
        </HStack>
        <VStack spacing={3} align="stretch">
          {cart.items.length === 0 ? (
            <Text textAlign="center" color="gray.500">
              No items in cart
            </Text>
          ) : (
            <>
              {cart.items.map((item: SalesCartItem) => (
                <Box key={item.id} p={3} bg="gray.50" borderRadius="md">
                  <HStack justify="space-between" align="start">
                    <VStack align="start" spacing={1} flex={1}>
                      <Text fontSize="sm" fontWeight="semibold">
                        {item.product.name}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {formatCurrency(item.unitPrice)} each
                      </Text>
                    </VStack>
                    <VStack align="end" spacing={2}>
                      <HStack>
                        <IconButton
                          size="xs"
                          icon={<IoRemove />}
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity - 1)
                          }
                          aria-label="Decrease quantity"
                        />
                        <Text fontSize="sm" minW="30px" textAlign="center">
                          {item.quantity}
                        </Text>
                        <IconButton
                          size="xs"
                          icon={<IoAdd />}
                          onClick={() =>
                            handleUpdateQuantity(item.id, item.quantity + 1)
                          }
                          aria-label="Increase quantity"
                        />
                      </HStack>
                      <Text fontSize="sm" fontWeight="bold">
                        {formatCurrency(item.total)}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              ))}
              <Divider />
              <VStack spacing={2} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm">Subtotal:</Text>
                  <Text fontSize="sm" fontWeight="semibold">
                    {formatCurrency(cart.subtotal)}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm">Tax:</Text>
                  <Text fontSize="sm" fontWeight="semibold">
                    {formatCurrency(cart.taxAmount)}
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm">Discount:</Text>
                  <Text fontSize="sm" fontWeight="semibold" color="green.600">
                    -{formatCurrency(cart.discountAmount)}
                  </Text>
                </HStack>
                <Divider />
                <HStack justify="space-between">
                  <Text fontSize="lg" fontWeight="bold">
                    Total:
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="primary.600">
                    {formatCurrency(cart.total)}
                  </Text>
                </HStack>
              </VStack>
            </>
          )}
        </VStack>
      </VStack>
    </POSCard>
  );

  if (isLoading) {
    return (
      <POSLayout>
        <LoadingSpinner />
      </POSLayout>
    );
  }

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
                    <ProductGrid products={products} />
                  ) : (
                    <ProductList products={products} />
                  )}
                </Box>
              </TabPanel>
              {categories.map((category) => (
                <TabPanel key={category} p={0}>
                  <Box py={4}>
                    {viewMode === "grid" ? (
                      <ProductGrid
                        products={products.filter(
                          (p) => p.category === category
                        )}
                      />
                    ) : (
                      <ProductList
                        products={products.filter(
                          (p) => p.category === category
                        )}
                      />
                    )}
                  </Box>
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
        </VStack>

        {/* Cart Section */}
        <VStack spacing={4} align="stretch">
          <CartSummary />
          <TouchButton
            size="lg"
            colorScheme="primary"
            isDisabled={cart.items.length === 0}
            onClick={handlePayment}
          >
            ชำระเงิน
          </TouchButton>
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
