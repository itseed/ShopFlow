import React, { useState } from "react";
import {
  SimpleGrid,
  Box,
  VStack,
  HStack,
  Text,
  Image,
  Badge,
  Button,
  IconButton,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader,
  Progress,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Flex,
  Tooltip,
  Skeleton,
} from "@chakra-ui/react";
import {
  IoAddOutline,
  IoRemoveOutline,
  IoEllipsisVertical,
  IoEyeOutline,
  IoCreateOutline,
  IoTrashOutline,
  IoWarning,
  IoCheckmarkCircle,
  IoAlertCircle,
  IoCopyOutline,
  IoShareOutline,
  IoPricetagOutline,
} from "react-icons/io5";
import { Product } from "@shopflow/types";
import { formatCurrency } from "../../lib/sales";

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  onProductClick?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (product: Product) => void;
  onViewDetails?: (product: Product) => void;
  showActions?: boolean;
  showStockInfo?: boolean;
  cardSize?: "sm" | "md" | "lg";
  columns?: number;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  onProductClick,
  onAddToCart,
  onEditProduct,
  onDeleteProduct,
  onViewDetails,
  showActions = true,
  showStockInfo = true,
  cardSize = "md",
  columns,
}) => {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const toast = useToast();

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) {
      return {
        text: "หมดสต็อก",
        color: "red",
        icon: IoAlertCircle,
        percentage: 0,
      };
    } else if (product.stock <= 10) {
      return {
        text: "ใกล้หมด",
        color: "orange",
        icon: IoWarning,
        percentage: (product.stock / 20) * 100,
      };
    } else if (product.stock <= 20) {
      return {
        text: "สต็อกต่ำ",
        color: "yellow",
        icon: IoWarning,
        percentage: (product.stock / 50) * 100,
      };
    } else {
      return {
        text: "พร้อมขาย",
        color: "green",
        icon: IoCheckmarkCircle,
        percentage: Math.min((product.stock / 100) * 100, 100),
      };
    }
  };

  const handleImageError = (productId: string) => {
    setImageErrors((prev) => new Set([...prev, productId]));
  };

  const handleCopySKU = (sku: string) => {
    navigator.clipboard.writeText(sku);
    toast({
      title: "คัดลอก SKU สำเร็จ",
      description: `คัดลอก ${sku} แล้ว`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleShareProduct = async (product: Product) => {
    const shareData = {
      title: product.name,
      text: `${product.name}\nราคา: ${formatCurrency(product.price)}\nสต็อก: ${product.stock} ชิ้น\nSKU: ${product.sku || "N/A"}`,
      url: window.location.href,
    };

    try {
      // Check if Web Share API is supported
      if (navigator.share) {
        await navigator.share(shareData);
        toast({
          title: "แชร์สำเร็จ",
          description: "แชร์ข้อมูลสินค้าเรียบร้อยแล้ว",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      } else {
        // Fallback: Copy to clipboard
        const textToShare = `${shareData.title}\n${shareData.text}\n\nดูเพิ่มเติม: ${shareData.url}`;
        await navigator.clipboard.writeText(textToShare);
        toast({
          title: "คัดลอกข้อมูลแล้ว",
          description: "คัดลอกข้อมูลสินค้าไปยังคลิปบอร์ดแล้ว",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      // If sharing fails, try copying to clipboard as fallback
      try {
        const textToShare = `${shareData.title}\n${shareData.text}`;
        await navigator.clipboard.writeText(textToShare);
        toast({
          title: "คัดลอกข้อมูลแล้ว",
          description: "คัดลอกข้อมูลสินค้าไปยังคลิปบอร์ดแล้ว",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      } catch (clipboardError) {
        toast({
          title: "ไม่สามารถแชร์ได้",
          description: "เบราว์เซอร์ของคุณไม่รองรับการแชร์หรือคัดลอก",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const getGridColumns = () => {
    if (columns) return columns;
    switch (cardSize) {
      case "sm":
        return { base: 3, md: 4, lg: 6 };
      case "md":
        return { base: 2, md: 3, lg: 4 };
      case "lg":
        return { base: 1, md: 2, lg: 3 };
      default:
        return { base: 2, md: 3, lg: 4 };
    }
  };

  const getCardHeight = () => {
    switch (cardSize) {
      case "sm":
        return "280px";
      case "md":
        return "320px";
      case "lg":
        return "360px";
      default:
        return "320px";
    }
  };

  if (isLoading) {
    return (
      <SimpleGrid columns={getGridColumns()} spacing={4}>
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} bg={cardBg} borderColor={borderColor}>
            <CardBody>
              <VStack spacing={3}>
                <Skeleton height="120px" width="100%" borderRadius="md" />
                <Skeleton height="20px" width="80%" />
                <Skeleton height="16px" width="60%" />
                <Skeleton height="24px" width="40%" />
              </VStack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>
    );
  }

  return (
    <SimpleGrid columns={getGridColumns()} spacing={4}>
      {products.map((product) => {
        const stockStatus = getStockStatus(product);
        const StatusIcon = stockStatus.icon;
        const hasImage =
          product.images &&
          product.images.length > 0 &&
          !imageErrors.has(product.id);
        const profit = product.price - 0; // cost property not available in shared type
        const profitMargin = ((profit / product.price) * 100).toFixed(1);

        return (
          <Card
            key={product.id}
            bg={cardBg}
            borderWidth="1px"
            borderColor={borderColor}
            cursor={onProductClick ? "pointer" : "default"}
            onClick={() => onProductClick?.(product)}
            _hover={
              onProductClick
                ? {
                    shadow: "lg",
                    transform: "translateY(-2px)",
                    bg: hoverBg,
                  }
                : {}
            }
            transition="all 0.2s"
            height={getCardHeight()}
            overflow="hidden"
            opacity={product.status === "active" ? 1 : 0.7}
          >
            <CardHeader p={0} position="relative">
              {/* Product Image */}
              <Box
                height="120px"
                bg="gray.100"
                borderRadius="md"
                overflow="hidden"
                position="relative"
                m={3}
                mb={0}
              >
                {hasImage ? (
                  <Image
                    src={product.images?.[0] || "/placeholder.jpg"}
                    alt={product.name}
                    width="100%"
                    height="100%"
                    objectFit="cover"
                    onError={() => handleImageError(product.id)}
                  />
                ) : (
                  <Flex
                    align="center"
                    justify="center"
                    height="100%"
                    bg="gray.200"
                    color="gray.400"
                  >
                    <Avatar
                      name={product.name}
                      src={product.images?.[0] || "/placeholder.jpg"}
                      size="lg"
                      bg="gray.300"
                    />
                  </Flex>
                )}

                {/* Status Badge */}
                <Badge
                  position="absolute"
                  top={2}
                  left={2}
                  colorScheme={stockStatus.color}
                  variant="solid"
                  fontSize="xs"
                >
                  <HStack spacing={1}>
                    <StatusIcon size={10} />
                    <Text>{stockStatus.text}</Text>
                  </HStack>
                </Badge>

                {/* Actions Menu */}
                {showActions && (
                  <Box position="absolute" top={2} right={2}>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<IoEllipsisVertical />}
                        size="sm"
                        variant="solid"
                        bg="whiteAlpha.900"
                        color="gray.600"
                        _hover={{ bg: "white" }}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <MenuList>
                        {onViewDetails && (
                          <MenuItem
                            icon={<IoEyeOutline />}
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewDetails(product);
                            }}
                          >
                            ดูรายละเอียด
                          </MenuItem>
                        )}
                        {onAddToCart && (
                          <MenuItem
                            icon={<IoAddOutline />}
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToCart(product);
                            }}
                            isDisabled={product.stock === 0}
                          >
                            เพิ่มในตะกร้า
                          </MenuItem>
                        )}
                        <MenuItem
                          icon={<IoCopyOutline />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopySKU(product.sku || "");
                          }}
                        >
                          คัดลอก SKU
                        </MenuItem>
                        <MenuItem
                          icon={<IoShareOutline />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareProduct(product);
                          }}
                        >
                          แชร์
                        </MenuItem>
                        {onEditProduct && (
                          <MenuItem
                            icon={<IoCreateOutline />}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditProduct(product);
                            }}
                          >
                            แก้ไข
                          </MenuItem>
                        )}
                        {onDeleteProduct && (
                          <MenuItem
                            icon={<IoTrashOutline />}
                            color="red.500"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteProduct(product);
                            }}
                          >
                            ลบ
                          </MenuItem>
                        )}
                      </MenuList>
                    </Menu>
                  </Box>
                )}
              </Box>
            </CardHeader>

            <CardBody pt={2}>
              <VStack spacing={2} align="stretch" height="100%">
                {/* Product Info */}
                <VStack align="start" spacing={1} flex={1}>
                  <Tooltip label={product.name} placement="top">
                    <Text
                      fontWeight="bold"
                      fontSize="sm"
                      noOfLines={2}
                      lineHeight="1.2"
                    >
                      {product.name}
                    </Text>
                  </Tooltip>

                  <HStack spacing={2} fontSize="xs" color="gray.500">
                    <Text>SKU: {product.sku}</Text>
                    <Badge size="xs" colorScheme="blue" variant="outline">
                      {product.category?.name || "ไม่ระบุหมวดหมู่"}
                    </Badge>
                  </HStack>

                  {/* Price Info */}
                  <VStack align="start" spacing={0} width="100%">
                    <HStack justify="space-between" width="100%">
                      <Text fontSize="lg" fontWeight="bold" color="green.500">
                        {formatCurrency(product.price)}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        กำไร {profitMargin}%
                      </Text>
                    </HStack>
                    <Text fontSize="xs" color="gray.500">
                      ต้นทุน: {formatCurrency(0)}{" "}
                      {/* cost not available in shared type */}
                    </Text>
                  </VStack>
                </VStack>

                {/* Stock Info */}
                {showStockInfo && (
                  <VStack spacing={1} width="100%">
                    <HStack justify="space-between" width="100%" fontSize="xs">
                      <Text color="gray.500">สต็อก:</Text>
                      <Text fontWeight="medium">
                        {product.stock} / {100}{" "}
                        {/* maxStockLevel not available */}
                      </Text>
                    </HStack>
                    <Progress
                      value={stockStatus.percentage}
                      colorScheme={stockStatus.color}
                      size="sm"
                      width="100%"
                      borderRadius="full"
                    />
                  </VStack>
                )}

                {/* Action Buttons */}
                {showActions && (onAddToCart || onEditProduct) && (
                  <HStack spacing={2} width="100%">
                    {onAddToCart && (
                      <Button
                        size="sm"
                        colorScheme="blue"
                        flex={1}
                        leftIcon={<IoAddOutline />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(product);
                        }}
                        isDisabled={product.stock === 0}
                      >
                        เพิ่ม
                      </Button>
                    )}
                    {onEditProduct && (
                      <IconButton
                        aria-label="Edit product"
                        icon={<IoCreateOutline />}
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditProduct(product);
                        }}
                      />
                    )}
                  </HStack>
                )}

                {/* Tags - Removed since not available in shared Product type */}
              </VStack>
            </CardBody>
          </Card>
        );
      })}
    </SimpleGrid>
  );
};
