import React from "react";
import { POSCard } from "../ui/POSCard";
import { VStack, HStack, Text, Box, Divider, IconButton, BoxProps } from "@chakra-ui/react";
import { IoTrash, IoRemove, IoAdd } from "react-icons/io5";
import { SalesCartItem } from "@shopflow/types";

interface CartSummaryProps extends BoxProps {
  items: SalesCartItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  scrollableItems?: boolean;
}

const CartSummary: React.FC<CartSummaryProps> = ({ items, subtotal, taxAmount, discountAmount, total, onUpdateQuantity, onRemoveItem, scrollableItems, ...boxProps }) => (
  <POSCard borderRadius={boxProps.borderRadius || "xl"} shadow={boxProps.shadow || "md"} h="full" display="flex" flexDirection="column" p={boxProps.p || 5} {...boxProps}>
    <VStack spacing={5} align="stretch" h="full">
      <HStack justify="space-between">
        <Text fontSize="lg" fontWeight="bold">
          ตะกร้าสินค้า ({items?.length || 0})
        </Text>
      </HStack>
      {scrollableItems ? (
        <>
          <Box flex="1" minH={0} maxH="32vh" overflowY="auto">
            <VStack spacing={3} align="stretch">
              {!items || items.length === 0 ? (
                <Text textAlign="center" color="gray.500">
                  ไม่มีสินค้าในตะกร้า
                </Text>
              ) : (
                <>
                  {items.map((item: SalesCartItem) => (
                    <Box key={item.id} p={3} bg="gray.50" borderRadius="md">
                      <HStack justify="space-between" align="start">
                        <VStack align="start" spacing={1} flex={1}>
                          <Text fontSize="sm" fontWeight="semibold">
                            {item.product.name}
                          </Text>
                          {/* แสดง variant ถ้ามี (เช่น กาแฟเย็น (Size M, หวานน้อย)) */}
                          {item.product.name.match(/\((.*?)\)/) && (
                            <Text fontSize="xs" color="gray.500">
                              {item.product.name.match(/\((.*?)\)/)?.[1]}
                            </Text>
                          )}
                          <Text fontSize="xs" color="gray.500">
                            {item.unitPrice.toFixed(2)} ฿/ชิ้น
                          </Text>
                        </VStack>
                        <VStack align="end" spacing={2}>
                          <HStack>
                            <IconButton
                              size="sm"
                              icon={<IoRemove />}
                              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                              aria-label="ลดจำนวน"
                              borderRadius="full"
                            />
                            <Text fontSize="md" minW="30px" textAlign="center">
                              {item.quantity}
                            </Text>
                            <IconButton
                              size="sm"
                              icon={<IoAdd />}
                              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                              aria-label="เพิ่มจำนวน"
                              borderRadius="full"
                            />
                          </HStack>
                          <Text fontSize="md" fontWeight="bold">
                            {item.total.toFixed(2)} ฿
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                  ))}
                </>
              )}
            </VStack>
          </Box>
          <Divider my={2} />
          {/* ยอดรวมอยู่ด้านล่างนอก scroll */}
          <VStack spacing={2} align="stretch">
            <HStack justify="space-between">
              <Text fontSize="sm">ยอดรวม:</Text>
              <Text fontSize="sm" fontWeight="semibold">
                {subtotal.toFixed(2)} ฿
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="sm">ภาษี:</Text>
              <Text fontSize="sm" fontWeight="semibold">
                {taxAmount.toFixed(2)} ฿
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="sm">ส่วนลด:</Text>
              <Text fontSize="sm" fontWeight="semibold" color="green.600">
                -{discountAmount.toFixed(2)} ฿
              </Text>
            </HStack>
            <Divider />
            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="bold">
                รวมสุทธิ:
              </Text>
              <Text fontSize="lg" fontWeight="bold" color="blue.600">
                {total.toFixed(2)} ฿
              </Text>
            </HStack>
          </VStack>
        </>
      ) : (
        <VStack spacing={3} align="stretch">
          {!items || items.length === 0 ? (
            <Text textAlign="center" color="gray.500">
              ไม่มีสินค้าในตะกร้า
            </Text>
          ) : (
            <>
              {items.map((item: SalesCartItem) => (
                <Box key={item.id} p={3} bg="gray.50" borderRadius="md">
                  <HStack justify="space-between" align="start">
                    <VStack align="start" spacing={1} flex={1}>
                      <Text fontSize="sm" fontWeight="semibold">
                        {item.product.name}
                      </Text>
                      {/* แสดง variant ถ้ามี (เช่น กาแฟเย็น (Size M, หวานน้อย)) */}
                      {item.product.name.match(/\((.*?)\)/) && (
                        <Text fontSize="xs" color="gray.500">
                          {item.product.name.match(/\((.*?)\)/)?.[1]}
                        </Text>
                      )}
                      <Text fontSize="xs" color="gray.500">
                        {item.unitPrice.toFixed(2)} ฿/ชิ้น
                      </Text>
                    </VStack>
                    <VStack align="end" spacing={2}>
                      <HStack>
                        <IconButton
                          size="sm"
                          icon={<IoRemove />}
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          aria-label="ลดจำนวน"
                          borderRadius="full"
                        />
                        <Text fontSize="md" minW="30px" textAlign="center">
                          {item.quantity}
                        </Text>
                        <IconButton
                          size="sm"
                          icon={<IoAdd />}
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          aria-label="เพิ่มจำนวน"
                          borderRadius="full"
                        />
                      </HStack>
                      <Text fontSize="md" fontWeight="bold">
                        {item.total.toFixed(2)} ฿
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              ))}
              <Divider />
              <VStack spacing={2} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm">ยอดรวม:</Text>
                  <Text fontSize="sm" fontWeight="semibold">
                    {subtotal.toFixed(2)} ฿
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm">ภาษี:</Text>
                  <Text fontSize="sm" fontWeight="semibold">
                    {taxAmount.toFixed(2)} ฿
                  </Text>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm">ส่วนลด:</Text>
                  <Text fontSize="sm" fontWeight="semibold" color="green.600">
                    -{discountAmount.toFixed(2)} ฿
                  </Text>
                </HStack>
                <Divider />
                <HStack justify="space-between">
                  <Text fontSize="lg" fontWeight="bold">
                    รวมสุทธิ:
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="blue.600">
                    {total.toFixed(2)} ฿
                  </Text>
                </HStack>
              </VStack>
            </>
          )}
        </VStack>
      )}
    </VStack>
  </POSCard>
);

export default CartSummary; 