import React from "react";
import {
  SimpleGrid,
  Image,
  VStack,
  Text,
  HStack,
  IconButton,
  Box,
} from "@chakra-ui/react";
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

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onAddToCart,
  onQuickAddToCart,
  onSelectVariant,
}) => (
  <SimpleGrid
    columns={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }}
    spacing={{ base: 3, md: 4 }}
    w="full"
  >
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
        _hover={{ transform: "translateY(-2px)", shadow: "lg", bg: "blue.50" }}
        transition="all 0.2s"
        borderRadius="xl"
        shadow="md"
        minH="240px"
        maxW="200px"
        w="full"
        position="relative"
      >
        {/* Product Image with improved aspect ratio */}
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            height="100px"
            width="100%"
            objectFit="cover"
            borderRadius="lg"
            mb={2}
          />
        ) : (
          <Box
            height="100px"
            width="100%"
            bg="gray.100"
            borderRadius="lg"
            mb={2}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize="2xl" color="gray.400">
              📦
            </Text>
          </Box>
        )}

        <VStack spacing={1} align="stretch" flex={1}>
          <Text
            fontSize="sm"
            fontWeight="bold"
            noOfLines={2}
            color="gray.800"
            minH="32px"
            lineHeight="1.2"
          >
            {product.name}
            {product.hasVariants && (
              <Text as="span" fontSize="xs" color="orange.500" ml={1}>
                (หลายรูปแบบ)
              </Text>
            )}
          </Text>
          <Text fontSize="xs" color="gray.500" noOfLines={1}>
            {product.category}
          </Text>

          {/* Price and Add Button */}
          <HStack justify="space-between" align="center" mt="auto">
            <VStack align="start" spacing={0}>
              <Text fontSize="lg" fontWeight="bold" color="blue.600">
                {product.price.toFixed(2)} ฿
              </Text>
              <Text fontSize="xs" color="gray.500">
                คงเหลือ: {product.stock}
              </Text>
            </VStack>

            {/* Improved circular add button */}
            <IconButton
              size="md"
              fontSize="xl"
              icon={<IoAdd />}
              aria-label="Add to cart"
              colorScheme="blue"
              borderRadius="full"
              width="40px"
              height="40px"
              minWidth="40px"
              onClick={(e) => {
                e.stopPropagation();
                if (product.hasVariants && onSelectVariant) {
                  onSelectVariant(product);
                } else {
                  onQuickAddToCart(product);
                }
              }}
              _hover={{
                transform: "scale(1.1)",
                shadow: "lg",
              }}
              transition="all 0.2s"
              isDisabled={product.stock === 0}
            />
          </HStack>
        </VStack>

        {/* Stock indicator */}
        {product.stock === 0 && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="blackAlpha.600"
            borderRadius="xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text color="white" fontWeight="bold" fontSize="lg">
              สินค้าหมด
            </Text>
          </Box>
        )}
      </POSCard>
    ))}
  </SimpleGrid>
);

export default ProductGrid;
