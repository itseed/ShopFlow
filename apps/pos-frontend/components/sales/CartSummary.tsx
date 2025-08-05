import React, { useState } from "react";
import { POSCard } from "../ui/POSCard";
import {
  VStack,
  HStack,
  Text,
  Box,
  Divider,
  IconButton,
  BoxProps,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
  useDisclosure,
} from "@chakra-ui/react";
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

const CartSummary: React.FC<CartSummaryProps> = ({
  items,
  subtotal,
  taxAmount,
  discountAmount,
  total,
  onUpdateQuantity,
  onRemoveItem,
  scrollableItems,
  ...boxProps
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [itemToDelete, setItemToDelete] = useState<SalesCartItem | null>(null);
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  const handleDeleteClick = (item: SalesCartItem) => {
    setItemToDelete(item);
    onOpen();
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      onRemoveItem(itemToDelete.id);
      setItemToDelete(null);
      onClose();
    }
  };

  const renderCartItem = (item: SalesCartItem) => (
    <Box key={item.id} p={3} bg="gray.50" borderRadius="md">
      <HStack justify="space-between" align="start">
        <VStack align="start" spacing={1} flex={1}>
          <Text fontSize="sm" fontWeight="semibold">
            {item.product.name}
          </Text>
          {/* แสดง variant ถ้ามี */}
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
          <HStack spacing={1}>
            <IconButton
              size="sm"
              icon={<IoRemove />}
              onClick={() => {
                if (item.quantity === 1) {
                  handleDeleteClick(item);
                } else {
                  onUpdateQuantity(item.id, item.quantity - 1);
                }
              }}
              aria-label="ลดจำนวน"
              borderRadius="full"
              colorScheme={item.quantity === 1 ? "red" : "gray"}
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
              colorScheme="blue"
            />
            <IconButton
              size="sm"
              icon={<IoTrash />}
              onClick={() => handleDeleteClick(item)}
              aria-label="ลบสินค้า"
              borderRadius="full"
              colorScheme="red"
              variant="ghost"
              ml={2}
            />
          </HStack>
          <Text fontSize="md" fontWeight="bold">
            {item.total.toFixed(2)} ฿
          </Text>
        </VStack>
      </HStack>
    </Box>
  );

  const renderSummary = () => (
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
  );

  return (
    <>
      <POSCard
        borderRadius={boxProps.borderRadius || "xl"}
        shadow={boxProps.shadow || "md"}
        h="full"
        display="flex"
        flexDirection="column"
        p={boxProps.p || 5}
        {...boxProps}
      >
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
                    items.map(renderCartItem)
                  )}
                </VStack>
              </Box>
              <Divider my={2} />
              {renderSummary()}
            </>
          ) : (
            <VStack spacing={3} align="stretch">
              {!items || items.length === 0 ? (
                <Text textAlign="center" color="gray.500">
                  ไม่มีสินค้าในตะกร้า
                </Text>
              ) : (
                <>
                  {items.map(renderCartItem)}
                  <Divider />
                  {renderSummary()}
                </>
              )}
            </VStack>
          )}
        </VStack>
      </POSCard>

      {/* Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              ยืนยันการลบสินค้า
            </AlertDialogHeader>

            <AlertDialogBody>
              คุณต้องการลบ <strong>{itemToDelete?.product.name}</strong>{" "}
              ออกจากตะกร้าหรือไม่?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                ยกเลิก
              </Button>
              <Button colorScheme="red" onClick={handleConfirmDelete} ml={3}>
                ลบ
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default CartSummary;
