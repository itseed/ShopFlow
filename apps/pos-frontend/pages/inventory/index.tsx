import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  Badge,
  Alert,
  AlertIcon,
  SimpleGrid,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Textarea,
  useToast,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Icon,
  Progress,
  Flex,
  Avatar,
  Divider,
  AlertTitle,
  AlertDescription,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import {
  IoAdd,
  IoRemove,
  IoEye,
  IoRefresh,
  IoWarning,
  IoCheckmark,
  IoClose,
  IoEllipsisVertical,
  IoDownload,
  IoPrint,
  IoLayers,
  IoTrendingUp,
  IoTrendingDown,
  IoTime,
  IoCheckmarkCircle,
  IoAlertCircle,
  IoBag,
  IoCash,
  IoFilter,
  IoSearch,
  IoArrowUp,
  IoArrowDown,
  IoSwapHorizontal,
  IoDocumentText,
} from "react-icons/io5";
import { POSLayout } from "../../components";
import { useProducts, useUpdateProductStock } from "../../lib/hooks/useProducts";
import { productService } from "@shopflow/api";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  cost: number;
  price: number;
  lastUpdated: Date;
  status: "in-stock" | "low-stock" | "out-of-stock";
}

interface StockTransaction {
  id: string;
  itemId: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  reason: string;
  date: Date;
  userId: string;
}

const mockInventory: InventoryItem[] = [
  {
    id: "INV001",
    name: "กาแฟเย็น",
    category: "เครื่องดื่ม",
    currentStock: 15,
    minStock: 20,
    maxStock: 100,
    unit: "แก้ว",
    cost: 25,
    price: 40,
    lastUpdated: new Date(),
    status: "low-stock",
  },
  {
    id: "INV002",
    name: "ขนมปัง",
    category: "เบเกอรี่",
    currentStock: 50,
    minStock: 10,
    maxStock: 200,
    unit: "ชิ้น",
    cost: 15,
    price: 25,
    lastUpdated: new Date(),
    status: "in-stock",
  },
  {
    id: "INV003",
    name: "น้ำส้ม",
    category: "เครื่องดื่ม",
    currentStock: 0,
    minStock: 5,
    maxStock: 50,
    unit: "ขวด",
    cost: 30,
    price: 45,
    lastUpdated: new Date(),
    status: "out-of-stock",
  },
];

const mockTransactions: StockTransaction[] = [
  {
    id: "TXN001",
    itemId: "INV001",
    type: "in",
    quantity: 50,
    reason: "รับสินค้าใหม่",
    date: new Date(),
    userId: "user1",
  },
  {
    id: "TXN002",
    itemId: "INV002",
    type: "out",
    quantity: 10,
    reason: "ขาย",
    date: new Date(),
    userId: "user1",
  },
];

const InventoryPage = () => {
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [filter, setFilter] = useState("all");

  // Use real data hooks
  const {
    data: productsData = [],
    isLoading: inventoryLoading,
    error: inventoryError,
    refetch: refetchInventory,
  } = useProducts({
    search: search || undefined,
    status: filter === "all" ? undefined : filter === "in-stock" ? "active" : undefined,
  });

  // Get low stock products
  const { data: lowStockProducts = [] } = useProducts({
    lowStock: true,
  });

  const updateStockMutation = useUpdateProductStock();

  // Convert products data to inventory format
  const inventory: InventoryItem[] = productsData.map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category?.name || "ไม่ระบุ",
    currentStock: product.stock || 0,
    minStock: product.min_stock || 0,
    maxStock: product.max_stock || (product.min_stock || 0) * 10,
    unit: product.unit || "ชิ้น",
    cost: product.cost_price || 0,
    price: product.price,
    lastUpdated: product.updated_at ? new Date(product.updated_at) : new Date(),
    status: (product.stock || 0) <= (product.min_stock || 0) ? "low-stock" : (product.stock || 0) > 0 ? "in-stock" : "out-of-stock",
  }));

  const lowStockData = lowStockProducts.map((product) => ({
    productId: product.id,
    productName: product.name,
    category: product.category?.name || "ไม่ระบุ",
    currentStock: product.stock || 0,
    minStock: product.min_stock || 0,
    stockValue: (product.stock || 0) * (product.cost_price || 0),
    stockStatus: "low-stock" as const,
    lastRestocked: product.updated_at || new Date().toISOString(),
  }));
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);

  const {
    isOpen: isStockInOpen,
    onOpen: onStockInOpen,
    onClose: onStockInClose,
  } = useDisclosure();
  const {
    isOpen: isStockOutOpen,
    onOpen: onStockOutOpen,
    onClose: onStockOutClose,
  } = useDisclosure();
  const {
    isOpen: isAdjustmentOpen,
    onOpen: onAdjustmentOpen,
    onClose: onAdjustmentClose,
  } = useDisclosure();
  const {
    isOpen: isHistoryOpen,
    onOpen: onHistoryOpen,
    onClose: onHistoryClose,
  } = useDisclosure();

  const [stockInQuantity, setStockInQuantity] = useState(0);
  const [stockInReason, setStockInReason] = useState("");
  const [stockOutQuantity, setStockOutQuantity] = useState(0);
  const [stockOutReason, setStockOutReason] = useState("");
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState("");

  const toast = useToast();

  // Color mode values
  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #2d3748 0%, #1a202c 100%)"
  );
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Mock inventory stats
  const inventoryStats = {
    totalItems: inventory.length,
    inStock: inventory.filter((item) => item.status === "in-stock").length,
    lowStock: inventory.filter((item) => item.status === "low-stock").length,
    outOfStock: inventory.filter((item) => item.status === "out-of-stock")
      .length,
    totalValue: inventory.reduce(
      (sum, item) => sum + item.currentStock * item.cost,
      0
    ),
    totalRevenue: inventory.reduce(
      (sum, item) => sum + item.currentStock * item.price,
      0
    ),
    stockInToday: 150,
    stockOutToday: 89,
  };

  const filteredInventory = inventory.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) &&
      (filter === "all" || item.status === filter)
  );

  const lowStockItems = inventory.filter((item) => item.status === "low-stock");
  const outOfStockItems = inventory.filter(
    (item) => item.status === "out-of-stock"
  );

  const handleStockIn = async () => {
    if (!selectedItem || stockInQuantity <= 0) return;

    try {
      await updateStockMutation.mutateAsync({
        id: selectedItem.id,
        stockData: {
          quantity: stockInQuantity,
          type: "add",
          reason: stockInReason || "เพิ่มสต็อก",
          user_id: "current-user-id", // TODO: Get from auth context
        },
      });

      // Refresh inventory data
      refetchInventory();

      onStockInClose();
      setStockInQuantity(0);
      setStockInReason("");
      setSelectedItem(null);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleStockOut = async () => {
    if (
      !selectedItem ||
      stockOutQuantity <= 0 ||
      stockOutQuantity > selectedItem.currentStock
    )
      return;

    try {
      await updateStockMutation.mutateAsync({
        id: selectedItem.id,
        stockData: {
          quantity: stockOutQuantity,
          type: "subtract",
          reason: stockOutReason || "ลดสต็อก",
          user_id: "current-user-id", // TODO: Get from auth context
        },
      });

      // Refresh inventory data
      refetchInventory();

      onStockOutClose();
      setStockOutQuantity(0);
      setStockOutReason("");
      setSelectedItem(null);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleAdjustment = async () => {
    if (!selectedItem) return;

    try {
      const adjustment = adjustmentQuantity - selectedItem.currentStock;

      await updateStockMutation.mutateAsync({
        id: selectedItem.id,
        stockData: {
          quantity: Math.abs(adjustment),
          type: adjustment > 0 ? "add" : "subtract",
          reason: adjustmentReason || "ปรับสต็อก",
          user_id: "current-user-id", // TODO: Get from auth context
        },
      });

      // Refresh inventory data
      refetchInventory();

      onAdjustmentClose();
      setAdjustmentQuantity(0);
      setAdjustmentReason("");
      setSelectedItem(null);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-stock":
        return "green";
      case "low-stock":
        return "orange";
      case "out-of-stock":
        return "red";
      default:
        return "gray";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "in-stock":
        return "มีสินค้า";
      case "low-stock":
        return "ใกล้หมด";
      case "out-of-stock":
        return "หมด";
      default:
        return "ไม่ทราบ";
    }
  };

  const getStockPercentage = (item: InventoryItem) => {
    return (item.currentStock / item.maxStock) * 100;
  };

  return (
    <POSLayout>
      <VStack spacing={8} align="stretch">
        {/* Header with Stats */}
        <Box
          bgGradient={bgGradient}
          borderRadius="2xl"
          p={8}
          color="white"
          position="relative"
          overflow="hidden"
          _before={{
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bg: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Flex
            justify="space-between"
            align="center"
            position="relative"
            zIndex={1}
          >
            <VStack align="start" spacing={3}>
              <HStack spacing={3}>
                <Box
                  p={3}
                  borderRadius="xl"
                  bg="rgba(255,255,255,0.2)"
                  color="white"
                >
                  <Icon as={IoLayers} boxSize={6} />
                </Box>
                <VStack align="start" spacing={1}>
                  <Heading size="lg" fontWeight="bold">
                    📦 จัดการสต็อกสินค้า
                  </Heading>
                  <Text fontSize="lg" opacity={0.9}>
                    ติดตามและจัดการสินค้าคงคลัง
                  </Text>
                </VStack>
              </HStack>
              <HStack spacing={4}>
                <Badge colorScheme="green" variant="solid" px={3} py={1}>
                  <HStack spacing={1}>
                    <Icon as={IoCheckmarkCircle} />
                    <Text>{inventoryStats.inStock} รายการมีสินค้า</Text>
                  </HStack>
                </Badge>
                <Badge colorScheme="orange" variant="solid" px={3} py={1}>
                  <HStack spacing={1}>
                    <Icon as={IoWarning} />
                    <Text>{inventoryStats.lowStock} รายการใกล้หมด</Text>
                  </HStack>
                </Badge>
              </HStack>
            </VStack>
            <VStack spacing={3}>
              <HStack spacing={2}>
                <Button
                  variant="secondary"
                  size="lg"
                  leftIcon={<IoDownload />}
                  bg="rgba(255,255,255,0.2)"
                  _hover={{ bg: "rgba(255,255,255,0.3)" }}
                  color="white"
                >
                  Export
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  leftIcon={<IoPrint />}
                  bg="rgba(255,255,255,0.2)"
                  _hover={{ bg: "rgba(255,255,255,0.3)" }}
                  color="white"
                >
                  Print
                </Button>
              </HStack>
            </VStack>
          </Flex>
        </Box>

        {/* Quick Stats */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
          <Card bg={cardBg} borderColor={borderColor} shadow="lg">
            <CardBody>
              <VStack spacing={3}>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="gray.500">
                    สินค้าทั้งหมด
                  </Text>
                  <Icon as={IoBag} color="blue.500" />
                </HStack>
                <Text fontSize="3xl" fontWeight="bold" color="blue.500">
                  {inventoryStats.totalItems}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  รายการ
                </Text>
                <Progress value={80} colorScheme="blue" size="sm" w="full" />
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor} shadow="lg">
            <CardBody>
              <VStack spacing={3}>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="gray.500">
                    มูลค่าสต็อก
                  </Text>
                  <Icon as={IoCash} color="green.500" />
                </HStack>
                <Text fontSize="3xl" fontWeight="bold" color="green.500">
                  ฿{inventoryStats.totalValue.toLocaleString()}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  บาท
                </Text>
                <Progress value={65} colorScheme="green" size="sm" w="full" />
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor} shadow="lg">
            <CardBody>
              <VStack spacing={3}>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="gray.500">
                    สินค้าใกล้หมด
                  </Text>
                  <Icon as={IoWarning} color="orange.500" />
                </HStack>
                <Text fontSize="3xl" fontWeight="bold" color="orange.500">
                  {inventoryStats.lowStock}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  รายการ
                </Text>
                <Progress value={40} colorScheme="orange" size="sm" w="full" />
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor} shadow="lg">
            <CardBody>
              <VStack spacing={3}>
                <HStack justify="space-between" w="full">
                  <Text fontSize="sm" color="gray.500">
                    สินค้าหมด
                  </Text>
                  <Icon as={IoAlertCircle} color="red.500" />
                </HStack>
                <Text fontSize="3xl" fontWeight="bold" color="red.500">
                  {inventoryStats.outOfStock}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  รายการ
                </Text>
                <Progress value={20} colorScheme="red" size="sm" w="full" />
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Alerts */}
        {(lowStockItems.length > 0 || outOfStockItems.length > 0) && (
          <Box>
            <Heading size="md" mb={4} color="gray.700">
              ⚠️ การแจ้งเตือน
            </Heading>
            <VStack spacing={3}>
              {outOfStockItems.length > 0 && (
                <Alert status="error" borderRadius="lg">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>สินค้าหมด!</AlertTitle>
                    <AlertDescription>
                      มีสินค้า {outOfStockItems.length} รายการที่หมดสต็อก
                      กรุณาเพิ่มสต็อกด่วน
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
              {lowStockItems.length > 0 && (
                <Alert status="warning" borderRadius="lg">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>สินค้าใกล้หมด!</AlertTitle>
                    <AlertDescription>
                      มีสินค้า {lowStockItems.length} รายการที่ใกล้หมดสต็อก
                      กรุณาตรวจสอบและเพิ่มสต็อก
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
            </VStack>
          </Box>
        )}

        {/* Search and Filters */}
        <Card bg={cardBg} borderColor={borderColor} shadow="lg">
          <CardBody>
            <VStack spacing={4}>
              <HStack w="full" spacing={4}>
                <InputGroup>
                  <InputLeftElement>
                    <Icon as={IoSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="ค้นหาสินค้า..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    size="lg"
                    borderRadius="xl"
                  />
                </InputGroup>
                <Select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  size="lg"
                  w="200px"
                >
                  <option value="all">ทั้งหมด</option>
                  <option value="in-stock">มีสินค้า</option>
                  <option value="low-stock">ใกล้หมด</option>
                  <option value="out-of-stock">หมด</option>
                </Select>
                <Button variant="secondary" size="lg" leftIcon={<IoRefresh />}>
                  รีเฟรช
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Inventory Table */}
        <Card bg={cardBg} borderColor={borderColor} shadow="lg">
          <CardBody>
            <VStack spacing={4}>
              <HStack justify="space-between" w="full">
                <Heading size="md" color="gray.700">
                  รายการสินค้า ({filteredInventory.length})
                </Heading>
                <HStack spacing={2}>
                  <Button
                    colorScheme="green"
                    leftIcon={<IoArrowUp />}
                    onClick={() => {
                      if (filteredInventory.length > 0) {
                        setSelectedItem(filteredInventory[0]);
                        onStockInOpen();
                      }
                    }}
                  >
                    เพิ่มสต็อก
                  </Button>
                  <Button
                    colorScheme="red"
                    leftIcon={<IoArrowDown />}
                    onClick={() => {
                      if (filteredInventory.length > 0) {
                        setSelectedItem(filteredInventory[0]);
                        onStockOutOpen();
                      }
                    }}
                  >
                    ลดสต็อก
                  </Button>
                </HStack>
              </HStack>

              <Box overflowX="auto" w="full">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>สินค้า</Th>
                      <Th>หมวดหมู่</Th>
                      <Th>สต็อกปัจจุบัน</Th>
                      <Th>สถานะ</Th>
                      <Th>มูลค่า</Th>
                      <Th>อัพเดทล่าสุด</Th>
                      <Th>การดำเนินการ</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredInventory.map((item) => (
                      <Tr key={item.id}>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold">{item.name}</Text>
                            <Text fontSize="sm" color="gray.500">
                              ฿{item.price} / {item.unit}
                            </Text>
                          </VStack>
                        </Td>
                        <Td>{item.category}</Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="bold">
                              {item.currentStock} {item.unit}
                            </Text>
                            <Progress
                              value={getStockPercentage(item)}
                              colorScheme={getStatusColor(item.status)}
                              size="sm"
                              w="100px"
                            />
                          </VStack>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={getStatusColor(item.status)}
                            variant="subtle"
                          >
                            {getStatusText(item.status)}
                          </Badge>
                        </Td>
                        <Td>
                          <Text fontWeight="bold" color="green.500">
                            ฿{(item.currentStock * item.cost).toLocaleString()}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm" color="gray.500">
                            {item.lastUpdated.toLocaleDateString()}
                          </Text>
                        </Td>
                        <Td>
                          <Menu>
                            <MenuButton
                              as={IconButton}
                              icon={<IoEllipsisVertical />}
                              variant="ghost"
                              size="sm"
                            />
                            <MenuList>
                              <MenuItem
                                icon={<IoArrowUp />}
                                onClick={() => {
                                  setSelectedItem(item);
                                  onStockInOpen();
                                }}
                              >
                                เพิ่มสต็อก
                              </MenuItem>
                              <MenuItem
                                icon={<IoArrowDown />}
                                onClick={() => {
                                  setSelectedItem(item);
                                  onStockOutOpen();
                                }}
                              >
                                ลดสต็อก
                              </MenuItem>
                              <MenuItem
                                icon={<IoSwapHorizontal />}
                                onClick={() => {
                                  setSelectedItem(item);
                                  setAdjustmentQuantity(item.currentStock);
                                  onAdjustmentOpen();
                                }}
                              >
                                ปรับสต็อก
                              </MenuItem>
                              <MenuItem
                                icon={<IoDocumentText />}
                                onClick={() => {
                                  setSelectedItem(item);
                                  onHistoryOpen();
                                }}
                              >
                                ประวัติ
                              </MenuItem>
                            </MenuList>
                          </Menu>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </VStack>
          </CardBody>
        </Card>

        {/* Stock In Modal */}
        <Modal isOpen={isStockInOpen} onClose={onStockInClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>เพิ่มสต็อก</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <Text fontWeight="bold">{selectedItem?.name}</Text>
                <NumberInput
                  value={stockInQuantity}
                  onChange={(_, value) => setStockInQuantity(value)}
                  min={1}
                >
                  <NumberInputField placeholder="จำนวน" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Textarea
                  placeholder="เหตุผล"
                  value={stockInReason}
                  onChange={(e) => setStockInReason(e.target.value)}
                />
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onStockInClose}>
                ยกเลิก
              </Button>
              <Button colorScheme="green" onClick={handleStockIn}>
                เพิ่มสต็อก
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Stock Out Modal */}
        <Modal isOpen={isStockOutOpen} onClose={onStockOutClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>ลดสต็อก</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <Text fontWeight="bold">{selectedItem?.name}</Text>
                <NumberInput
                  value={stockOutQuantity}
                  onChange={(_, value) => setStockOutQuantity(value)}
                  min={1}
                  max={selectedItem?.currentStock}
                >
                  <NumberInputField placeholder="จำนวน" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Textarea
                  placeholder="เหตุผล"
                  value={stockOutReason}
                  onChange={(e) => setStockOutReason(e.target.value)}
                />
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onStockOutClose}>
                ยกเลิก
              </Button>
              <Button colorScheme="red" onClick={handleStockOut}>
                ลดสต็อก
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Adjustment Modal */}
        <Modal isOpen={isAdjustmentOpen} onClose={onAdjustmentClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>ปรับสต็อก</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <Text fontWeight="bold">{selectedItem?.name}</Text>
                <NumberInput
                  value={adjustmentQuantity}
                  onChange={(_, value) => setAdjustmentQuantity(value)}
                  min={0}
                >
                  <NumberInputField placeholder="จำนวนใหม่" />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <Textarea
                  placeholder="เหตุผล"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                />
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onAdjustmentClose}>
                ยกเลิก
              </Button>
              <Button colorScheme="blue" onClick={handleAdjustment}>
                ปรับสต็อก
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* History Modal */}
        <Modal isOpen={isHistoryOpen} onClose={onHistoryClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>ประวัติสต็อก - {selectedItem?.name}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4} align="stretch">
                {transactions
                  .filter((txn) => txn.itemId === selectedItem?.id)
                  .map((txn) => (
                    <Box key={txn.id} p={4} borderWidth={1} borderRadius="md">
                      <HStack justify="space-between">
                        <VStack align="start" spacing={1}>
                          <HStack>
                            <Icon
                              as={
                                txn.type === "in"
                                  ? IoArrowUp
                                  : txn.type === "out"
                                  ? IoArrowDown
                                  : IoSwapHorizontal
                              }
                              color={
                                txn.type === "in"
                                  ? "green.500"
                                  : txn.type === "out"
                                  ? "red.500"
                                  : "blue.500"
                              }
                            />
                            <Text fontWeight="bold">
                              {txn.type === "in"
                                ? "เพิ่ม"
                                : txn.type === "out"
                                ? "ลด"
                                : "ปรับ"}{" "}
                              {txn.quantity} {selectedItem?.unit}
                            </Text>
                          </HStack>
                          <Text fontSize="sm" color="gray.500">
                            {txn.reason}
                          </Text>
                        </VStack>
                        <Text fontSize="sm" color="gray.500">
                          {txn.date.toLocaleDateString()}
                        </Text>
                      </HStack>
                    </Box>
                  ))}
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </POSLayout>
  );
};

export default InventoryPage;

// Disable static generation for pages that use React Query
export const getServerSideProps = async () => {
  return {
    props: {},
  };
};
