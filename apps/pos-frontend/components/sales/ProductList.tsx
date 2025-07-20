import React from "react";
import { VStack, HStack, Image, Text, IconButton, Box } from "@chakra-ui/react";
import { IoAdd } from "react-icons/io5";
import { POSCard } from "../ui/POSCard";
import { SalesProduct } from "@shopflow/types";

// ตัวอย่าง mock data สำหรับ dev:
// const mockProducts = [
//   { id: '1', name: 'Coca Cola', price: 25, category: 'Drinks', image: '/images/coke.png' },
//   { id: '2', name: 'Pepsi', price: 25, category: 'Drinks', image: '' },
//   { id: '3', name: 'น้ำเปล่า', price: 10, category: 'Drinks' },
//   { id: '4', name: 'ขนมปัง', price: 20, category: 'Bakery', image: undefined },
// ];

interface ProductListProps {
  products: SalesProduct[];
  onAddToCart: (product: SalesProduct) => void;
  onQuickAddToCart: (product: SalesProduct) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onAddToCart, onQuickAddToCart }) => (
  <VStack spacing={3} align="stretch">
    {products.map((product) => (
      <POSCard
        key={product.id}
        p={4}
        w="100%"
        cursor="pointer"
        onClick={() => onAddToCart(product)}
        _hover={{ bg: "blue.50", shadow: "md" }}
        borderRadius="xl"
        shadow="sm"
        transition="all 0.2s"
      >
        <HStack spacing={4} align="center">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              height="56px"
              width="56px"
              objectFit="cover"
              borderRadius="lg"
            />
          ) : (
            <Box
              height="56px"
              width="56px"
              bg="gray.100"
              borderRadius="lg"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize="xl" color="gray.400">📦</Text>
            </Box>
          )}
          <VStack align="start" spacing={1} flex={1}>
            <Text fontSize="md" fontWeight="bold" color="gray.800">
              {product.name}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {product.category}
            </Text>
          </VStack>
          <VStack align="end" spacing={1}>
            <Text fontSize="lg" fontWeight="bold" color="blue.600">
              {product.price.toFixed(2)} ฿
            </Text>
            <IconButton
              size="md"
              icon={<IoAdd />}
              aria-label="Add to cart"
              colorScheme="blue"
              borderRadius="full"
              onClick={(e) => {
                e.stopPropagation();
                onQuickAddToCart(product);
              }}
            />
          </VStack>
          <Text fontSize="xs" color="gray.500">
            คงเหลือ: {product.stock}
          </Text>
        </HStack>
      </POSCard>
    ))}
  </VStack>
);

export default ProductList; 