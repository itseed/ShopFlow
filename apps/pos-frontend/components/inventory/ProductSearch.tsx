import React, { useState, useCallback, useMemo } from "react";
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  VStack,
  HStack,
  Text,
  Badge,
  Flex,
  useColorModeValue,
  Spinner,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Select,
  Checkbox,
  Divider,
} from "@chakra-ui/react";
import {
  IoSearchOutline,
  IoClose,
  IoFilterOutline,
  IoScanOutline,
  IoGridOutline,
  IoListOutline,
} from "react-icons/io5";
import { Product } from "@shopflow/types";

interface ProductSearchProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
  onSearchChange?: (searchTerm: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  showFilters?: boolean;
  showViewToggle?: boolean;
  viewMode?: "grid" | "list";
  onViewModeChange?: (mode: "grid" | "list") => void;
}

interface SearchFilters {
  category: string;
  inStock: boolean;
  lowStock: boolean;
  outOfStock: boolean;
  priceRange: {
    min: number;
    max: number;
  };
}

export const ProductSearch: React.FC<ProductSearchProps> = ({
  products,
  onProductSelect,
  onSearchChange,
  placeholder = "ค้นหาสินค้า, SKU หรือบาร์โค้ด...",
  isLoading = false,
  showFilters = true,
  showViewToggle = false,
  viewMode = "list",
  onViewModeChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    category: "all",
    inStock: true,
    lowStock: true,
    outOfStock: true,
    priceRange: { min: 0, max: 10000 },
  });

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(products.map(p => p.category.name))];
    return uniqueCategories;
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Text search
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.sku.toLowerCase().includes(searchLower) ||
        product.barcode?.toLowerCase().includes(searchLower) ||
        product.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    // Category filter
    if (filters.category !== "all") {
      filtered = filtered.filter(product => product.category.name === filters.category);
    }

    // Stock status filters
    filtered = filtered.filter(product => {
      const isInStock = product.stockQuantity > product.minStockLevel;
      const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= product.minStockLevel;
      const isOutOfStock = product.stockQuantity === 0;

      return (
        (filters.inStock && isInStock) ||
        (filters.lowStock && isLowStock) ||
        (filters.outOfStock && isOutOfStock)
      );
    });

    // Price range filter
    filtered = filtered.filter(product =>
      product.price >= filters.priceRange.min &&
      product.price <= filters.priceRange.max
    );

    return filtered.slice(0, 10); // Limit results for performance
  }, [products, searchTerm, filters]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setShowResults(value.length > 0);
    onSearchChange?.(value);
  }, [onSearchChange]);

  const handleProductSelect = useCallback((product: Product) => {
    onProductSelect(product);
    setSearchTerm(product.name);
    setShowResults(false);
  }, [onProductSelect]);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setShowResults(false);
    onSearchChange?.("");
  }, [onSearchChange]);

  const getStockStatus = (product: Product) => {
    if (product.stockQuantity === 0) return { text: "หมด", color: "red" };
    if (product.stockQuantity <= product.minStockLevel) return { text: "ใกล้หมด", color: "orange" };
    return { text: "มีสินค้า", color: "green" };
  };

  const resetFilters = () => {
    setFilters({
      category: "all",
      inStock: true,
      lowStock: true,
      outOfStock: true,
      priceRange: { min: 0, max: 10000 },
    });
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.category !== "all") count++;
    if (!filters.inStock || !filters.lowStock || !filters.outOfStock) count++;
    if (filters.priceRange.min > 0 || filters.priceRange.max < 10000) count++;
    return count;
  }, [filters]);

  return (
    <Box position="relative" w="full">
      <HStack spacing={2} w="full">
        <InputGroup flex={1}>
          <InputLeftElement>
            <IoSearchOutline color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setShowResults(searchTerm.length > 0)}
            bg={cardBg}
            borderColor={borderColor}
          />
          <InputRightElement>
            {isLoading ? (
              <Spinner size="sm" />
            ) : searchTerm ? (
              <IconButton
                aria-label="Clear search"
                icon={<IoClose />}
                size="sm"
                variant="ghost"
                onClick={clearSearch}
              />
            ) : null}
          </InputRightElement>
        </InputGroup>

        {showFilters && (
          <Popover>
            <PopoverTrigger>
              <Box position="relative">
                <IconButton
                  aria-label="Filters"
                  icon={<IoFilterOutline />}
                  variant="outline"
                />
                {activeFiltersCount > 0 && (
                  <Badge
                    position="absolute"
                    top="-1"
                    right="-1"
                    colorScheme="red"
                    borderRadius="full"
                    fontSize="xs"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Box>
            </PopoverTrigger>
            <PopoverContent w="300px">
              <PopoverBody>
                <VStack spacing={4} align="stretch">
                  <Flex justify="space-between" align="center">
                    <Text fontWeight="bold">ตัวกรอง</Text>
                    <Button size="sm" variant="ghost" onClick={resetFilters}>
                      รีเซ็ต
                    </Button>
                  </Flex>

                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>หมวดหมู่</Text>
                    <Select
                      value={filters.category}
                      onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                      size="sm"
                    >
                      <option value="all">ทุกหมวดหมู่</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </Select>
                  </Box>

                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>สถานะสต็อก</Text>
                    <VStack align="start" spacing={1}>
                      <Checkbox
                        isChecked={filters.inStock}
                        onChange={(e) => setFilters(prev => ({ ...prev, inStock: e.target.checked }))}
                      >
                        มีสินค้า
                      </Checkbox>
                      <Checkbox
                        isChecked={filters.lowStock}
                        onChange={(e) => setFilters(prev => ({ ...prev, lowStock: e.target.checked }))}
                      >
                        ใกล้หมด
                      </Checkbox>
                      <Checkbox
                        isChecked={filters.outOfStock}
                        onChange={(e) => setFilters(prev => ({ ...prev, outOfStock: e.target.checked }))}
                      >
                        หมดสต็อก
                      </Checkbox>
                    </VStack>
                  </Box>

                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>ช่วงราคา</Text>
                    <HStack spacing={2}>
                      <Input
                        type="number"
                        placeholder="ต่ำสุด"
                        value={filters.priceRange.min}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          priceRange: { ...prev.priceRange, min: Number(e.target.value) }
                        }))}
                        size="sm"
                      />
                      <Text>-</Text>
                      <Input
                        type="number"
                        placeholder="สูงสุด"
                        value={filters.priceRange.max}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          priceRange: { ...prev.priceRange, max: Number(e.target.value) }
                        }))}
                        size="sm"
                      />
                    </HStack>
                  </Box>
                </VStack>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        )}

        <IconButton
          aria-label="Scan barcode"
          icon={<IoScanOutline />}
          variant="outline"
          onClick={() => {
            // TODO: Implement barcode scanning
            console.log("Barcode scanning not implemented yet");
          }}
        />

        {showViewToggle && (
          <HStack spacing={0} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
            <IconButton
              aria-label="Grid view"
              icon={<IoGridOutline />}
              size="sm"
              variant={viewMode === "grid" ? "solid" : "ghost"}
              borderRadius="none"
              borderRightRadius="0"
              onClick={() => onViewModeChange?.("grid")}
            />
            <IconButton
              aria-label="List view"
              icon={<IoListOutline />}
              size="sm"
              variant={viewMode === "list" ? "solid" : "ghost"}
              borderRadius="none"
              borderLeftRadius="0"
              onClick={() => onViewModeChange?.("list")}
            />
          </HStack>
        )}
      </HStack>

      {/* Search Results */}
      {showResults && filteredProducts.length > 0 && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          zIndex={1000}
          bg={cardBg}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="md"
          shadow="lg"
          maxH="400px"
          overflowY="auto"
          mt={1}
        >
          <VStack spacing={0} align="stretch">
            {filteredProducts.map((product, index) => {
              const stockStatus = getStockStatus(product);
              return (
                <Box
                  key={product.id}
                  p={3}
                  cursor="pointer"
                  borderBottomWidth={index < filteredProducts.length - 1 ? "1px" : "0"}
                  borderColor={borderColor}
                  _hover={{ bg: hoverBg }}
                  onClick={() => handleProductSelect(product)}
                >
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1} flex={1}>
                      <HStack spacing={2}>
                        <Text fontWeight="bold">{product.name}</Text>
                        <Badge colorScheme={stockStatus.color} size="sm">
                          {stockStatus.text}
                        </Badge>
                      </HStack>
                      <HStack spacing={4} fontSize="sm" color="gray.500">
                        <Text>SKU: {product.sku}</Text>
                        <Text>หมวด: {product.category.name}</Text>
                        <Text>สต็อก: {product.stockQuantity}</Text>
                      </HStack>
                      {product.tags && product.tags.length > 0 && (
                        <HStack spacing={1}>
                          {product.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} size="sm" variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </HStack>
                      )}
                    </VStack>
                    <VStack align="end" spacing={0}>
                      <Text fontWeight="bold" color="green.500">
                        ฿{product.price.toLocaleString()}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        ต้นทุน: ฿{product.cost}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              );
            })}
          </VStack>
        </Box>
      )}

      {/* No results */}
      {showResults && searchTerm && filteredProducts.length === 0 && !isLoading && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          zIndex={1000}
          bg={cardBg}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="md"
          shadow="lg"
          mt={1}
          p={4}
          textAlign="center"
        >
          <Text color="gray.500">ไม่พบสินค้าที่ค้นหา</Text>
        </Box>
      )}
    </Box>
  );
};