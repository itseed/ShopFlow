/**
 * ProductCard Component - Product Display Card
 * Shared between CMS and POS
 * Phase 1: Component Simplification
 */

import React from "react";
import {
  Box,
  Image,
  Text,
  VStack,
  HStack,
  Badge,
  useColorModeValue,
} from "@chakra-ui/react";

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    sku?: string;
    price: number;
    stock_quantity?: number;
    image_url?: string;
    category?: {
      name: string;
    };
  };
  onSelect?: (product: any) => void;
  showStock?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ProductCard({
  product,
  onSelect,
  showStock = true,
  size = "md",
}: ProductCardProps) {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const isLowStock = (product.stock_quantity || 0) <= 10;
  const isOutOfStock = (product.stock_quantity || 0) === 0;

  const heights = {
    sm: "200px",
    md: "250px",
    lg: "300px",
  };

  return (
    <Box
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
      cursor={onSelect ? "pointer" : "default"}
      onClick={() => onSelect?.(product)}
      transition="all 0.2s"
      _hover={
        onSelect
          ? {
              transform: "translateY(-4px)",
              shadow: "lg",
              borderColor: "blue.400",
            }
          : {}
      }
      height={heights[size]}
      display="flex"
      flexDirection="column"
    >
      {/* Product Image */}
      <Box position="relative" height="60%" bg="gray.100">
        <Image
          src={product.image_url || "/placeholder-product.png"}
          alt={product.name}
          width="100%"
          height="100%"
          objectFit="cover"
          fallbackSrc="/placeholder-product.png"
        />

        {/* Stock Badge */}
        {showStock && (
          <Badge
            position="absolute"
            top={2}
            right={2}
            colorScheme={
              isOutOfStock ? "red" : isLowStock ? "orange" : "green"
            }
            fontSize="xs"
          >
            {isOutOfStock
              ? "Out of Stock"
              : isLowStock
              ? `Low Stock (${product.stock_quantity})`
              : `Stock: ${product.stock_quantity}`}
          </Badge>
        )}
      </Box>

      {/* Product Info */}
      <VStack
        align="stretch"
        spacing={1}
        p={3}
        flex={1}
        justify="space-between"
      >
        <Box>
          <Text
            fontWeight="semibold"
            fontSize={size === "sm" ? "sm" : "md"}
            noOfLines={2}
            mb={1}
          >
            {product.name}
          </Text>

          {product.sku && (
            <Text fontSize="xs" color="gray.500">
              SKU: {product.sku}
            </Text>
          )}

          {product.category && (
            <Badge colorScheme="blue" fontSize="xs" mt={1}>
              {product.category.name}
            </Badge>
          )}
        </Box>

        <HStack justify="space-between" mt={2}>
          <Text
            fontSize={size === "sm" ? "lg" : "xl"}
            fontWeight="bold"
            color="blue.600"
          >
            ฿{product.price.toLocaleString()}
          </Text>
        </HStack>
      </VStack>
    </Box>
  );
}

export default ProductCard;

