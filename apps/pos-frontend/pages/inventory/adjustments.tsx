import React, { useState, useMemo } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  useToast,
  useDisclosure,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Icon,
  Badge,
  useColorModeValue,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Flex,
  Input,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Textarea,
  FormControl,
  FormLabel,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Avatar,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import {
  IoSwapHorizontalOutline,
  IoArrowBackOutline,
  IoAddOutline,
  IoDocumentTextOutline,
  IoTimeOutline,
  IoPersonOutline,
  IoArrowUpOutline,
  IoArrowDownOutline,
  IoRefreshOutline,
  IoSearchOutline,
  IoFilterOutline,
  IoSaveOutline,
  IoWarningOutline,
} from "react-icons/io5";
import { Product, StockAdjustment } from "@shopflow/types";
import { POSLayout } from "../../components";
import { formatCurrency } from "../../lib/sales";

// Mock data
const mockProducts: Product[] = [
  {
    id: "1",
    sku: "DRINK001",
    name: "น้ำดื่ม",
    description: "น้ำดื่มขวด 600ml",
    price: 10,
    cost: 7,
    category: {
      id: "1",
      name: "เครื่องดื่ม",
      description: "เครื่องดื่มทุกชนิด",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    stockQuantity: 150,
    minStockLevel: 50,
    maxStockLevel: 500,
    isActive: true,
    barcode: "1234567890123",
    imageUrl: "",
    tags: ["เครื่องดื่ม", "น้ำ"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Add more products...
];

interface StockAdjustmentRecord {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  type: "increase" | "decrease" | "set";
  oldQuantity: number;
  newQuantity: number;
  adjustmentQuantity: number;
  reason: string;
  adjustedBy: string;
  adjustedByName: string;
  createdAt: Date;
  cost: number;
  totalValue: number;
}

const mockAdjustments: StockAdjustmentRecord[] = [
  {
    id: "ADJ001",
    productId: "1",
    productName: "น้ำดื่ม",
    productSku: "DRINK001",
    type: "increase",
    oldQuantity: 100,
    newQuantity: 150,
    adjustmentQuantity: 50,
    reason: "รับสินค้าเพิ่ม",
    adjustedBy: "user1",
    adjustedByName: "พนักงาน A",
    createdAt: new Date("2024-01-15T10:30:00"),
    cost: 7,
    totalValue: 350,
  },
  {
    id: "ADJ002",
    productId: "2",
    productName: "มาม่า",
    productSku: "SNACK001",
    type: "decrease",
    oldQuantity: 50,
    newQuantity: 25,
    adjustmentQuantity: -25,
    reason: "สินค้าเสียหาย",
    adjustedBy: "user2",
    adjustedByName: "ผู้จัดการ B",
    createdAt: new Date("2024-01-14T14:20:00"),
    cost: 5,
    totalValue: -125,
  },
  {
    id: "ADJ003",
    productId: "1",
    productName: "น้ำดื่ม",
    productSku: "DRINK001",
    type: "set",
    oldQuantity: 95,
    newQuantity: 150,
    adjustmentQuantity: 55,
    reason: "ตรวจนับสต็อกประจำเดือน",
    adjustedBy: "user1",
    adjustedByName: "พนักงาน A",
    createdAt: new Date("2024-01-10T09:00:00"),
    cost: 7,
    totalValue: 385,
  },
];

interface AdjustmentFormData {
  productId: string;
  type: "increase" | "decrease" | "set";
  quantity: number;
  reason: string;
}

const StockAdjustmentsPage: React.FC = () => {
  const [products] = useState<Product[]>(mockProducts);
  const [adjustments, setAdjustments] = useState<StockAdjustmentRecord[]>(mockAdjustments);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [formData, setFormData] = useState<AdjustmentFormData>({
    productId: "",
    type: "set",
    quantity: 0,
    reason: "",
  });

  const {
    isOpen: isAdjustmentOpen,
    onOpen: onAdjustmentOpen,
    onClose: onAdjustmentClose,
  } = useDisclosure();

  const toast = useToast();

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #2d3748 0%, #1a202c 100%)"
  );

  // Filter adjustments
  const filteredAdjustments = useMemo(() => {
    return adjustments.filter(adj => {
      const matchesSearch = adj.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          adj.productSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          adj.reason.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "all" || adj.type === typeFilter;
      const matchesDate = dateFilter === "all" || (() => {
        const adjDate = adj.createdAt;
        const now = new Date();
        switch (dateFilter) {
          case "today":
            return adjDate.toDateString() === now.toDateString();
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return adjDate >= weekAgo;
          case "month":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return adjDate >= monthAgo;
          default:
            return true;
        }
      })();
      
      return matchesSearch && matchesType && matchesDate;
    });
  }, [adjustments, searchTerm, typeFilter, dateFilter]);

  // Calculate statistics
  const adjustmentStats = useMemo(() => {
    const total = adjustments.length;
    const increases = adjustments.filter(a => a.type === "increase").length;
    const decreases = adjustments.filter(a => a.type === "decrease").length;
    const sets = adjustments.filter(a => a.type === "set").length;
    const totalValue = adjustments.reduce((sum, a) => sum + Math.abs(a.totalValue), 0);
    const netValue = adjustments.reduce((sum, a) => sum + a.totalValue, 0);

    return {
      total,
      increases,
      decreases,
      sets,
      totalValue,
      netValue,
    };
  }, [adjustments]);

  const getTypeText = (type: string) => {
    switch (type) {
      case "increase": return "เพิ่ม";
      case "decrease": return "ลด";
      case "set": return "กำหนด";
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "increase": return "green";
      case "decrease": return "red";
      case "set": return "blue";
      default: return "gray";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "increase": return IoArrowUpOutline;
      case "decrease": return IoArrowDownOutline;
      case "set": return IoSwapHorizontalOutline;
      default: return IoDocumentTextOutline;
    }
  };

  const handleNewAdjustment = () => {
    setFormData({
      productId: "",
      type: "set",
      quantity: 0,
      reason: "",
    });
    onAdjustmentOpen();
  };

  const handleSubmitAdjustment = () => {
    if (!formData.productId || !formData.reason.trim()) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        description: "เลือกสินค้าและระบุเหตุผล",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const product = products.find(p => p.id === formData.productId);
    if (!product) return;

    let newQuantity: number;
    let adjustmentQuantity: number;

    switch (formData.type) {
      case "increase":
        newQuantity = product.stockQuantity + formData.quantity;
        adjustmentQuantity = formData.quantity;
        break;
      case "decrease":
        newQuantity = Math.max(0, product.stockQuantity - formData.quantity);
        adjustmentQuantity = -(product.stockQuantity - newQuantity);
        break;
      case "set":
        newQuantity = formData.quantity;
        adjustmentQuantity = formData.quantity - product.stockQuantity;
        break;
      default:
        return;
    }

    const newAdjustment: StockAdjustmentRecord = {
      id: `ADJ${Date.now()}`,
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      type: formData.type,
      oldQuantity: product.stockQuantity,
      newQuantity,
      adjustmentQuantity,
      reason: formData.reason,
      adjustedBy: "current_user",
      adjustedByName: "ผู้ใช้ปัจจุบัน",
      createdAt: new Date(),
      cost: product.cost,
      totalValue: adjustmentQuantity * product.cost,
    };

    setAdjustments(prev => [newAdjustment, ...prev]);

    toast({
      title: "บันทึกการปรับปรุงสต็อกสำเร็จ",
      description: `ปรับปรุงสต็อก ${product.name} จาก ${product.stockQuantity} เป็น ${newQuantity}`,
      status: "success",
      duration: 5000,
      isClosable: true,
    });

    onAdjustmentClose();
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <POSLayout>
      <VStack spacing={8} align="stretch">
        {/* Header */}
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
                  <Icon as={IoSwapHorizontalOutline} boxSize={6} />
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm" fontWeight="medium">
                    บันทึกการปรับปรุงสต็อก
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    ปรับปรุงสต็อก
                  </Text>
                </VStack>
              </HStack>

              {/* Breadcrumb */}
              <Breadcrumb color="whiteAlpha.800" fontSize="sm">
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">หน้าแรก</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/inventory">คลังสินค้า</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem isCurrentPage>
                  <BreadcrumbLink>ปรับปรุงสต็อก</BreadcrumbLink>
                </BreadcrumbItem>
              </Breadcrumb>
            </VStack>

            <HStack spacing={3}>
              <Button
                leftIcon={<Icon as={IoArrowBackOutline} />}
                variant="ghost"
                colorScheme="whiteAlpha"
                onClick={() => window.history.back()}
              >
                กลับ
              </Button>
              <Button
                leftIcon={<Icon as={IoAddOutline} />}
                colorScheme="white"
                variant="solid"
                onClick={handleNewAdjustment}
              >
                ปรับปรุงสต็อกใหม่
              </Button>
            </HStack>
          </Flex>

          {/* Statistics */}
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 4 }}
            spacing={6}
            mt={8}
            position="relative"
            zIndex={1}
          >
            <Stat>
              <StatLabel color="whiteAlpha.800">รายการทั้งหมด</StatLabel>
              <StatNumber fontSize="3xl">
                {adjustmentStats.total}
              </StatNumber>
              <StatHelpText color="whiteAlpha.800">
                การปรับปรุง
              </StatHelpText>
            </Stat>

            <Stat>
              <StatLabel color="whiteAlpha.800">เพิ่มสต็อก</StatLabel>
              <StatNumber fontSize="3xl" color="green.200">
                {adjustmentStats.increases}
              </StatNumber>
              <StatHelpText color="whiteAlpha.800">
                รายการ
              </StatHelpText>
            </Stat>

            <Stat>
              <StatLabel color="whiteAlpha.800">ลดสต็อก</StatLabel>
              <StatNumber fontSize="3xl" color="red.200">
                {adjustmentStats.decreases}
              </StatNumber>
              <StatHelpText color="whiteAlpha.800">
                รายการ
              </StatHelpText>
            </Stat>

            <Stat>
              <StatLabel color="whiteAlpha.800">มูลค่าสุทธิ</StatLabel>
              <StatNumber 
                fontSize="3xl" 
                color={adjustmentStats.netValue >= 0 ? "green.200" : "red.200"}
              >
                {formatCurrency(adjustmentStats.netValue)}
              </StatNumber>
              <StatHelpText color="whiteAlpha.800">
                บาท
              </StatHelpText>
            </Stat>
          </SimpleGrid>
        </Box>

        {/* Filters */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <HStack w="full" spacing={4} flexWrap="wrap">
              <InputGroup maxW="300px">
                <InputLeftElement>
                  <Icon as={IoSearchOutline} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="ค้นหาสินค้า, เหตุผล..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>

              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                w="150px"
              >
                <option value="all">ทุกประเภท</option>
                <option value="increase">เพิ่มสต็อก</option>
                <option value="decrease">ลดสต็อก</option>
                <option value="set">กำหนดสต็อก</option>
              </Select>

              <Select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                w="150px"
              >
                <option value="all">ทุกช่วงเวลา</option>
                <option value="today">วันนี้</option>
                <option value="week">สัปดาห์นี้</option>
                <option value="month">เดือนนี้</option>
              </Select>

              <Button
                leftIcon={<IoRefreshOutline />}
                variant="ghost"
                onClick={() => {
                  setSearchTerm("");
                  setTypeFilter("all");
                  setDateFilter("all");
                }}
              >
                รีเซ็ต
              </Button>
            </HStack>
          </CardBody>
        </Card>

        {/* Adjustments Table */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardHeader>
            <Text fontSize="lg" fontWeight="bold">
              ประวัติการปรับปรุงสต็อก ({filteredAdjustments.length})
            </Text>
          </CardHeader>
          <CardBody>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>ประเภท</Th>
                    <Th>สินค้า</Th>
                    <Th>สต็อกเดิม</Th>
                    <Th>สต็อกใหม่</Th>
                    <Th>จำนวนที่ปรับ</Th>
                    <Th>มูลค่า</Th>
                    <Th>เหตุผล</Th>
                    <Th>โดย</Th>
                    <Th>วันที่</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredAdjustments.map((adjustment) => (
                    <Tr key={adjustment.id}>
                      <Td>
                        <HStack spacing={2}>
                          <Icon 
                            as={getTypeIcon(adjustment.type)} 
                            color={getTypeColor(adjustment.type) + ".500"}
                          />
                          <Badge 
                            colorScheme={getTypeColor(adjustment.type)} 
                            variant="solid"
                          >
                            {getTypeText(adjustment.type)}
                          </Badge>
                        </HStack>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={1}>
                          <Text fontWeight="bold">{adjustment.productName}</Text>
                          <Text fontSize="sm" color="gray.500">
                            SKU: {adjustment.productSku}
                          </Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Text fontWeight="medium">{adjustment.oldQuantity}</Text>
                      </Td>
                      <Td>
                        <Text fontWeight="medium" color="blue.600">
                          {adjustment.newQuantity}
                        </Text>
                      </Td>
                      <Td>
                        <Text 
                          fontWeight="bold"
                          color={adjustment.adjustmentQuantity >= 0 ? "green.600" : "red.600"}
                        >
                          {adjustment.adjustmentQuantity >= 0 ? "+" : ""}
                          {adjustment.adjustmentQuantity}
                        </Text>
                      </Td>
                      <Td>
                        <Text 
                          fontWeight="bold"
                          color={adjustment.totalValue >= 0 ? "green.600" : "red.600"}
                        >
                          {formatCurrency(adjustment.totalValue)}
                        </Text>
                      </Td>
                      <Td>
                        <Text fontSize="sm" maxW="200px" noOfLines={2}>
                          {adjustment.reason}
                        </Text>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Avatar size="xs" name={adjustment.adjustedByName} />
                          <Text fontSize="sm">{adjustment.adjustedByName}</Text>
                        </HStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm" color="gray.500">
                          {formatDateTime(adjustment.createdAt)}
                        </Text>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
            
            {filteredAdjustments.length === 0 && (
              <VStack spacing={4} py={8}>
                <Icon as={IoDocumentTextOutline} boxSize={12} color="gray.400" />
                <Text color="gray.500">ไม่มีประวัติการปรับปรุงสต็อก</Text>
              </VStack>
            )}
          </CardBody>
        </Card>

        {/* Adjustment Modal */}
        <Modal isOpen={isAdjustmentOpen} onClose={onAdjustmentClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack spacing={2}>
                <Icon as={IoSwapHorizontalOutline} />
                <Text>ปรับปรุงสต็อกสินค้า</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            
            <ModalBody>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>เลือกสินค้า</FormLabel>
                  <Select
                    placeholder="เลือกสินค้าที่ต้องการปรับปรุง"
                    value={formData.productId}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      productId: e.target.value
                    }))}
                  >
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} (SKU: {product.sku}) - สต็อก: {product.stockQuantity}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {formData.productId && (
                  <Box p={3} bg="gray.50" borderRadius="md">
                    {(() => {
                      const product = products.find(p => p.id === formData.productId);
                      if (!product) return null;
                      return (
                        <VStack align="stretch" spacing={2}>
                          <HStack justify="space-between">
                            <Text fontSize="sm" color="gray.600">สต็อกปัจจุบัน:</Text>
                            <Text fontSize="sm" fontWeight="bold">{product.stockQuantity}</Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text fontSize="sm" color="gray.600">ต้นทุนต่อหน่วย:</Text>
                            <Text fontSize="sm" fontWeight="bold">{formatCurrency(product.cost)}</Text>
                          </HStack>
                        </VStack>
                      );
                    })()}
                  </Box>
                )}

                <FormControl isRequired>
                  <FormLabel>ประเภทการปรับปรุง</FormLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      type: e.target.value as any
                    }))}
                  >
                    <option value="set">กำหนดจำนวนใหม่</option>
                    <option value="increase">เพิ่มจำนวน</option>
                    <option value="decrease">ลดจำนวน</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>
                    {formData.type === "set" ? "จำนวนใหม่" : 
                     formData.type === "increase" ? "จำนวนที่เพิ่ม" : "จำนวนที่ลด"}
                  </FormLabel>
                  <NumberInput
                    value={formData.quantity}
                    onChange={(_, value) => 
                      setFormData(prev => ({ ...prev, quantity: value }))
                    }
                    min={0}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>เหตุผลในการปรับปรุง</FormLabel>
                  <Textarea
                    placeholder="ระบุเหตุผลในการปรับปรุงสต็อก เช่น สินค้าเสียหาย, ตรวจนับสต็อก, รับสินค้าเพิ่ม"
                    value={formData.reason}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      reason: e.target.value
                    }))}
                    rows={3}
                  />
                </FormControl>

                {formData.productId && formData.quantity > 0 && (
                  <>
                    <Divider />
                    <Box p={3} bg="blue.50" borderRadius="md">
                      <Text fontSize="sm" fontWeight="bold" mb={2}>ตัวอย่างการปรับปรุง:</Text>
                      {(() => {
                        const product = products.find(p => p.id === formData.productId);
                        if (!product) return null;

                        let newQuantity: number;
                        let adjustmentQuantity: number;
                        
                        switch (formData.type) {
                          case "increase":
                            newQuantity = product.stockQuantity + formData.quantity;
                            adjustmentQuantity = formData.quantity;
                            break;
                          case "decrease":
                            newQuantity = Math.max(0, product.stockQuantity - formData.quantity);
                            adjustmentQuantity = -(product.stockQuantity - newQuantity);
                            break;
                          case "set":
                            newQuantity = formData.quantity;
                            adjustmentQuantity = formData.quantity - product.stockQuantity;
                            break;
                          default:
                            return null;
                        }

                        const totalValue = adjustmentQuantity * product.cost;

                        return (
                          <VStack spacing={2} fontSize="sm">
                            <HStack justify="space-between" w="full">
                              <Text>สต็อกเดิม:</Text>
                              <Text fontWeight="bold">{product.stockQuantity}</Text>
                            </HStack>
                            <HStack justify="space-between" w="full">
                              <Text>สต็อกใหม่:</Text>
                              <Text fontWeight="bold" color="blue.600">{newQuantity}</Text>
                            </HStack>
                            <HStack justify="space-between" w="full">
                              <Text>การเปลี่ยนแปลง:</Text>
                              <Text 
                                fontWeight="bold" 
                                color={adjustmentQuantity >= 0 ? "green.600" : "red.600"}
                              >
                                {adjustmentQuantity >= 0 ? "+" : ""}{adjustmentQuantity}
                              </Text>
                            </HStack>
                            <HStack justify="space-between" w="full">
                              <Text>มูลค่า:</Text>
                              <Text 
                                fontWeight="bold" 
                                color={totalValue >= 0 ? "green.600" : "red.600"}
                              >
                                {formatCurrency(totalValue)}
                              </Text>
                            </HStack>
                          </VStack>
                        );
                      })()}
                    </Box>
                  </>
                )}
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onAdjustmentClose}>
                ยกเลิก
              </Button>
              <Button 
                colorScheme="blue" 
                onClick={handleSubmitAdjustment}
                leftIcon={<IoSaveOutline />}
              >
                บันทึกการปรับปรุง
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </POSLayout>
  );
};

export default StockAdjustmentsPage;