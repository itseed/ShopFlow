import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Textarea,
  Select,
  FormControl,
  FormLabel,
  FormHelperText,
  FormErrorMessage,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Badge,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  Icon,
  Flex,
  Card,
  CardBody,
  SimpleGrid,
  Tooltip,
  Progress,
} from "@chakra-ui/react";
import {
  IoAdd,
  IoRemove,
  IoSwapHorizontal,
  IoSave,
  IoWarning,
  IoCheckmarkCircle,
  IoCalculator,
  IoTrendingUp,
  IoTrendingDown,
  IoInformationCircle,
} from "react-icons/io5";
import { Product } from "@shopflow/types";
import { formatCurrency } from "../../lib/sales";
import { StockIndicator } from "./StockIndicator";

interface StockAdjustmentProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAdjustment: (adjustment: StockAdjustmentData) => void;
  currentUser?: {
    id: string;
    name: string;
  };
}

interface StockAdjustmentData {
  productId: string;
  type: "increase" | "decrease" | "set";
  oldQuantity: number;
  newQuantity: number;
  quantity: number;
  reason: string;
  note?: string;
  adjustedBy: string;
  adjustedByName: string;
  cost: number;
  totalValue: number;
}

const ADJUSTMENT_REASONS = {
  increase: [
    "รับสินค้าใหม่",
    "สินค้าคืนจากลูกค้า",
    "ปรับปรุงสต็อกจากการตรวจนับ",
    "โอนสินค้าจากสาขาอื่น",
    "ผลิตสินค้าเพิ่ม",
    "อื่นๆ",
  ],
  decrease: [
    "สินค้าเสียหาย",
    "สินค้าหมดอายุ",
    "สินค้าสูญหาย",
    "โอนสินค้าไปสาขาอื่น",
    "ใช้ในการผลิต",
    "ตัวอย่างสินค้า",
    "อื่นๆ",
  ],
  set: [
    "ตรวจนับสต็อกประจำเดือน",
    "ตรวจนับสต็อกประจำปี",
    "ปรับปรุงข้อมูลเริ่มต้น",
    "แก้ไขข้อผิดพลาดในระบบ",
    "ปรับปรุงหลังจากการตรวจสอบ",
    "อื่นๆ",
  ],
};

export const StockAdjustment: React.FC<StockAdjustmentProps> = ({
  product,
  isOpen,
  onClose,
  onAdjustment,
  currentUser = { id: "user1", name: "ผู้ใช้ปัจจุบัน" },
}) => {
  const [adjustmentType, setAdjustmentType] = useState<"increase" | "decrease" | "set">("set");
  const [quantity, setQuantity] = useState<number>(product.stockQuantity);
  const [reason, setReason] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toast = useToast();
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setAdjustmentType("set");
      setQuantity(product.stockQuantity);
      setReason("");
      setCustomReason("");
      setNote("");
      setErrors({});
    }
  }, [isOpen, product.stockQuantity]);

  // Calculate adjustment values
  const calculateAdjustment = () => {
    let newQuantity: number;
    let adjustmentQuantity: number;

    switch (adjustmentType) {
      case "increase":
        newQuantity = product.stockQuantity + quantity;
        adjustmentQuantity = quantity;
        break;
      case "decrease":
        newQuantity = Math.max(0, product.stockQuantity - quantity);
        adjustmentQuantity = -(product.stockQuantity - newQuantity);
        break;
      case "set":
        newQuantity = quantity;
        adjustmentQuantity = quantity - product.stockQuantity;
        break;
      default:
        newQuantity = product.stockQuantity;
        adjustmentQuantity = 0;
    }

    const totalValue = adjustmentQuantity * product.cost;

    return {
      newQuantity,
      adjustmentQuantity,
      totalValue,
    };
  };

  const { newQuantity, adjustmentQuantity, totalValue } = calculateAdjustment();

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (adjustmentType === "increase" && quantity <= 0) {
      newErrors.quantity = "จำนวนที่เพิ่มต้องมากกว่า 0";
    }

    if (adjustmentType === "decrease" && quantity <= 0) {
      newErrors.quantity = "จำนวนที่ลดต้องมากกว่า 0";
    }

    if (adjustmentType === "decrease" && quantity > product.stockQuantity) {
      newErrors.quantity = `จำนวนที่ลดต้องไม่เกิน ${product.stockQuantity}`;
    }

    if (adjustmentType === "set" && quantity < 0) {
      newErrors.quantity = "จำนวนใหม่ต้องไม่ติดลบ";
    }

    if (!reason.trim()) {
      newErrors.reason = "กรุณาเลือกเหตุผล";
    }

    if (reason === "อื่นๆ" && !customReason.trim()) {
      newErrors.customReason = "กรุณาระบุเหตุผล";
    }

    if (adjustmentQuantity === 0) {
      newErrors.quantity = "ไม่มีการเปลี่ยนแปลงจำนวนสต็อก";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const adjustmentData: StockAdjustmentData = {
        productId: product.id,
        type: adjustmentType,
        oldQuantity: product.stockQuantity,
        newQuantity,
        quantity: Math.abs(adjustmentQuantity),
        reason: reason === "อื่นๆ" ? customReason : reason,
        note: note.trim() || undefined,
        adjustedBy: currentUser.id,
        adjustedByName: currentUser.name,
        cost: product.cost,
        totalValue,
      };

      await onAdjustment(adjustmentData);

      toast({
        title: "ปรับปรุงสต็อกสำเร็จ",
        description: `ปรับสต็อก ${product.name} จาก ${product.stockQuantity} เป็น ${newQuantity}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      onClose();
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถปรับปรุงสต็อกได้ กรุณาลองใหม่",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAdjustmentTypeInfo = () => {
    switch (adjustmentType) {
      case "increase":
        return {
          title: "เพิ่มสต็อก",
          description: "เพิ่มจำนวนสินค้าในคลัง",
          color: "green",
          icon: IoAdd,
          label: "จำนวนที่เพิ่ม",
        };
      case "decrease":
        return {
          title: "ลดสต็อก",
          description: "ลดจำนวนสินค้าในคลัง",
          color: "red",
          icon: IoRemove,
          label: "จำนวนที่ลด",
        };
      case "set":
        return {
          title: "กำหนดสต็อก",
          description: "กำหนดจำนวนสินค้าใหม่",
          color: "blue",
          icon: IoSwapHorizontal,
          label: "จำนวนใหม่",
        };
    }
  };

  const adjustmentInfo = getAdjustmentTypeInfo();
  const AdjustmentIcon = adjustmentInfo.icon;

  // Warning checks
  const getWarnings = () => {
    const warnings = [];

    if (newQuantity === 0) {
      warnings.push("สต็อกจะหมดหลังจากการปรับปรุง");
    } else if (newQuantity < product.minStockLevel) {
      warnings.push("สต็อกจะต่ำกว่าระดับขั้นต่ำหลังจากการปรับปรุง");
    }

    if (newQuantity > product.maxStockLevel) {
      warnings.push("สต็อกจะเกินระดับสูงสุดหลังจากการปรับปรุง");
    }

    if (Math.abs(totalValue) > 10000) {
      warnings.push("การปรับปรุงมีมูลค่าสูง กรุณาตรวจสอบอีกครั้ง");
    }

    return warnings;
  };

  const warnings = getWarnings();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <HStack spacing={2}>
            <Icon as={AdjustmentIcon} color={`${adjustmentInfo.color}.500`} />
            <Text>{adjustmentInfo.title}</Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Product Info */}
            <Card bg={cardBg} borderColor={borderColor}>
              <CardBody>
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold" fontSize="lg">
                        {product.name}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        SKU: {product.sku}
                      </Text>
                    </VStack>
                    <Badge colorScheme="blue" variant="outline">
                      {product.category.name}
                    </Badge>
                  </HStack>

                  <SimpleGrid columns={3} spacing={4} fontSize="sm">
                    <VStack align="start" spacing={0}>
                      <Text color="gray.500">สต็อกปัจจุบัน</Text>
                      <Text fontWeight="bold" fontSize="xl">
                        {product.stockQuantity}
                      </Text>
                    </VStack>
                    <VStack align="start" spacing={0}>
                      <Text color="gray.500">ขั้นต่ำ/สูงสุด</Text>
                      <Text fontWeight="bold">
                        {product.minStockLevel} / {product.maxStockLevel}
                      </Text>
                    </VStack>
                    <VStack align="start" spacing={0}>
                      <Text color="gray.500">ต้นทุนต่อหน่วย</Text>
                      <Text fontWeight="bold" color="green.600">
                        {formatCurrency(product.cost)}
                      </Text>
                    </VStack>
                  </SimpleGrid>

                  <StockIndicator
                    currentStock={product.stockQuantity}
                    minStockLevel={product.minStockLevel}
                    maxStockLevel={product.maxStockLevel}
                    size="sm"
                    variant="compact"
                  />
                </VStack>
              </CardBody>
            </Card>

            {/* Adjustment Type */}
            <FormControl>
              <FormLabel>ประเภทการปรับปรุง</FormLabel>
              <Select
                value={adjustmentType}
                onChange={(e) => {
                  setAdjustmentType(e.target.value as any);
                  if (e.target.value === "set") {
                    setQuantity(product.stockQuantity);
                  } else {
                    setQuantity(0);
                  }
                }}
              >
                <option value="set">กำหนดจำนวนใหม่</option>
                <option value="increase">เพิ่มจำนวน</option>
                <option value="decrease">ลดจำนวน</option>
              </Select>
              <FormHelperText>
                <HStack spacing={1}>
                  <Icon as={AdjustmentIcon} color={`${adjustmentInfo.color}.500`} />
                  <Text>{adjustmentInfo.description}</Text>
                </HStack>
              </FormHelperText>
            </FormControl>

            {/* Quantity Input */}
            <FormControl isInvalid={!!errors.quantity}>
              <FormLabel>{adjustmentInfo.label}</FormLabel>
              <NumberInput
                value={quantity}
                onChange={(_, value) => setQuantity(value)}
                min={0}
                max={adjustmentType === "decrease" ? product.stockQuantity : undefined}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              {errors.quantity && <FormErrorMessage>{errors.quantity}</FormErrorMessage>}
              <FormHelperText>
                {adjustmentType === "set" && "ระบุจำนวนสต็อกที่ต้องการให้เหลืออยู่"}
                {adjustmentType === "increase" && "ระบุจำนวนที่ต้องการเพิ่ม"}
                {adjustmentType === "decrease" && `ระบุจำนวนที่ต้องการลด (สูงสุด ${product.stockQuantity})`}
              </FormHelperText>
            </FormControl>

            {/* Reason */}
            <FormControl isInvalid={!!errors.reason}>
              <FormLabel>เหตุผลในการปรับปรุง</FormLabel>
              <Select
                placeholder="เลือกเหตุผล"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                {ADJUSTMENT_REASONS[adjustmentType].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
              {errors.reason && <FormErrorMessage>{errors.reason}</FormErrorMessage>}
            </FormControl>

            {/* Custom Reason */}
            {reason === "อื่นๆ" && (
              <FormControl isInvalid={!!errors.customReason}>
                <FormLabel>ระบุเหตุผล</FormLabel>
                <Textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="กรุณาระบุเหตุผลในการปรับปรุงสต็อก"
                  rows={2}
                />
                {errors.customReason && <FormErrorMessage>{errors.customReason}</FormErrorMessage>}
              </FormControl>
            )}

            {/* Additional Note */}
            <FormControl>
              <FormLabel>หมายเหตุเพิ่มเติม (ไม่บังคับ)</FormLabel>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="เพิ่มหมายเหตุหรือข้อมูลเพิ่มเติม"
                rows={2}
              />
            </FormControl>

            {/* Warnings */}
            {warnings.length > 0 && (
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>คำเตือน!</AlertTitle>
                  <AlertDescription>
                    <VStack align="start" spacing={1}>
                      {warnings.map((warning, index) => (
                        <Text key={index}>• {warning}</Text>
                      ))}
                    </VStack>
                  </AlertDescription>
                </Box>
              </Alert>
            )}

            {/* Preview */}
            <Card bg="blue.50" borderColor="blue.200">
              <CardBody>
                <VStack spacing={3} align="stretch">
                  <HStack spacing={2}>
                    <Icon as={IoCalculator} color="blue.500" />
                    <Text fontWeight="bold" color="blue.700">
                      ตัวอย่างการปรับปรุง
                    </Text>
                  </HStack>

                  <SimpleGrid columns={2} spacing={4} fontSize="sm">
                    <VStack align="start" spacing={1}>
                      <Text color="gray.600">สต็อกเดิม:</Text>
                      <Text fontWeight="bold" fontSize="lg">
                        {product.stockQuantity}
                      </Text>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text color="gray.600">สต็อกใหม่:</Text>
                      <Text fontWeight="bold" fontSize="lg" color="blue.600">
                        {newQuantity}
                      </Text>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text color="gray.600">การเปลี่ยนแปลง:</Text>
                      <HStack spacing={1}>
                        <Icon
                          as={adjustmentQuantity >= 0 ? IoTrendingUp : IoTrendingDown}
                          color={adjustmentQuantity >= 0 ? "green.500" : "red.500"}
                        />
                        <Text
                          fontWeight="bold"
                          color={adjustmentQuantity >= 0 ? "green.600" : "red.600"}
                        >
                          {adjustmentQuantity >= 0 ? "+" : ""}{adjustmentQuantity}
                        </Text>
                      </HStack>
                    </VStack>
                    <VStack align="start" spacing={1}>
                      <Text color="gray.600">มูลค่า:</Text>
                      <Text
                        fontWeight="bold"
                        color={totalValue >= 0 ? "green.600" : "red.600"}
                      >
                        {formatCurrency(totalValue)}
                      </Text>
                    </VStack>
                  </SimpleGrid>

                  <Divider />

                  <VStack spacing={2} align="stretch" fontSize="xs" color="gray.600">
                    <HStack justify="space-between">
                      <Text>ผู้ปรับปรุง:</Text>
                      <Text fontWeight="medium">{currentUser.name}</Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text>วันที่:</Text>
                      <Text fontWeight="medium">
                        {new Date().toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </HStack>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            ยกเลิก
          </Button>
          <Button
            colorScheme={adjustmentInfo.color}
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="กำลังบันทึก..."
            leftIcon={<IoSave />}
          >
            บันทึกการปรับปรุง
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};