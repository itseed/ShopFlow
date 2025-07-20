import React from "react";
import { SimpleGrid, Image, VStack, Text, HStack, IconButton, Box } from "@chakra-ui/react";
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

interface ProductGridProps {
  products: SalesProduct[];
  onAddToCart: (product: SalesProduct) => void;
  onQuickAddToCart: (product: SalesProduct) => void;
  onSelectVariant?: (product: SalesProduct) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onAddToCart, onQuickAddToCart, onSelectVariant }) => (
  <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={{ base: 4, md: 6 }}>
    {products.map((product) => (
      <POSCard
        key={product.id}
        p={3}
        cursor="pointer"
        onClick={() => {
          if (product.hasVariants && onSelectVariant) {
            onSelectVariant(product);
          } else {
            onAddToCart(product);
          }
        }}
        _hover={{ transform: "translateY(-4px)", shadow: "lg", bg: "blue.50" }}
        transition="all 0.2s"
        borderRadius="xl"
        shadow="md"
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            height="90px"
            width="100%"
            objectFit="cover"
            borderRadius="lg"
            mb={2}
          />
        ) : (
          <Box
            height="90px"
            width="100%"
            bg="gray.100"
            borderRadius="lg"
            mb={2}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize="2xl" color="gray.400">📦</Text>
          </Box>
        )}
        <VStack spacing={2} align="stretch">
          <Text fontSize="md" fontWeight="bold" noOfLines={2} color="gray.800">
            {product.name}
          </Text>
          <Text fontSize="xs" color="gray.500" noOfLines={1}>
            {product.category}
          </Text>
          <HStack justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="bold" color="blue.600">
              {product.price.toFixed(2)} ฿
            </Text>
            <IconButton
              size="lg"
              fontSize="2xl"
              px={6}
              py={4}
              icon={<IoAdd />}
              aria-label="Add to cart"
              colorScheme="blue"
              borderRadius="full"
              onClick={(e) => {
                e.stopPropagation();
                if (product.hasVariants && onSelectVariant) {
                  onSelectVariant(product);
                } else {
                  onQuickAddToCart(product);
                }
              }}
            />
          </HStack>
        </VStack>
        <Text fontSize="xs" color="gray.500">
          คงเหลือ: {product.stock}
        </Text>
      </POSCard>
    ))}
  </SimpleGrid>
);

export default ProductGrid; 