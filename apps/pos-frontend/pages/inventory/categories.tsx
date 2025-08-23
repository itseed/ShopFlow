import React, { useState } from "react";
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Input,
  Textarea,
  Switch,
  FormControl,
  FormLabel,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
} from "@chakra-ui/react";
import {
  IoAddOutline,
  IoFolderOutline,
  IoCreateOutline,
  IoTrashOutline,
  IoEllipsisVertical,
  IoStatsChartOutline,
  IoArrowBackOutline,
  IoPricetagsOutline,
  IoGridOutline,
} from "react-icons/io5";
import { Category, Product } from "@shopflow/types";
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
    stock: 150,
    status: "active",
  },
  // Add more mock products...
];

const mockCategories: Category[] = [
  {
    id: "1",
    name: "เครื่องดื่ม",
    description: "เครื่องดื่มทุกชนิด เช่น น้ำ น้ำหวาน กาแฟ ชา",
    display_order: 1,
    status: "active",
  },
  {
    id: "2",
    name: "ขนม",
    description: "ขนมและของหวาน เช่น บิสกิต ช็อกโกแลต ลูกอม",
    display_order: 2,
    status: "active",
  },
  {
    id: "3",
    name: "อาหารสด",
    description: "อาหารสดและผลไม้ เช่น ผลไม้ ผัก เนื้อสัตว์",
    display_order: 3,
    status: "active",
  },
  {
    id: "4",
    name: "เครื่องใช้",
    description: "เครื่องใช้ในครัวเรือน (ไม่ได้ใช้งาน)",
    display_order: 4,
    status: "inactive",
  },
  {
    id: "5",
    name: "ยาและสุขภาพ",
    description: "ยาและผลิตภัณฑ์เพื่อสุขภาพ",
    display_order: 5,
    status: "inactive",
  },
];

interface CategoryFormData {
  name: string;
  description: string;
  status: "active" | "inactive";
}

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    status: "active",
  });
  const [isEditing, setIsEditing] = useState(false);

  const {
    isOpen: isFormOpen,
    onOpen: onFormOpen,
    onClose: onFormClose,
  } = useDisclosure();

  const toast = useToast();

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #2d3748 0%, #1a202c 100%)"
  );

  // Calculate category statistics
  const categoryStats = {
    totalCategories: categories.length,
    activeCategories: categories.filter((c) => c.status === "active").length,
    inactiveCategories: categories.filter((c) => c.status === "inactive")
      .length,
    totalProducts: mockProducts.length,
  };

  const getCategoryProductCount = (categoryId: string) => {
    return mockProducts.filter((p) => p.category?.id === categoryId).length;
  };

  const getCategoryValue = (categoryId: string) => {
    return mockProducts
      .filter((p) => p.category?.id === categoryId)
      .reduce((sum, p) => sum + p.stock * p.price, 0);
  };

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setFormData({
      name: "",
      description: "",
      status: "active",
    });
    setIsEditing(false);
    onFormOpen();
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      status: category.status,
    });
    setIsEditing(true);
    onFormOpen();
  };

  const handleDeleteCategory = (categoryId: string) => {
    const categoryProductCount = getCategoryProductCount(categoryId);

    if (categoryProductCount > 0) {
      toast({
        title: "ไม่สามารถลบหมวดหมู่ได้",
        description: `หมวดหมู่นี้มีสินค้า ${categoryProductCount} รายการ กรุณาย้ายสินค้าไปหมวดหมู่อื่นก่อน`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (window.confirm("ต้องการลบหมวดหมู่นี้หรือไม่?")) {
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      toast({
        title: "ลบหมวดหมู่สำเร็จ",
        description: "ลบหมวดหมู่เรียบร้อยแล้ว",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSaveCategory = () => {
    if (!formData.name.trim()) {
      toast({
        title: "กรุณาระบุชื่อหมวดหมู่",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (isEditing && selectedCategory) {
      // Update existing category
      const updatedCategory: Category = {
        ...selectedCategory,
        name: formData.name,
        description: formData.description,
        status: formData.status,
      };

      setCategories((prev) =>
        prev.map((c) => (c.id === selectedCategory.id ? updatedCategory : c))
      );

      toast({
        title: "อัปเดตหมวดหมู่สำเร็จ",
        description: `อัปเดตหมวดหมู่ ${formData.name} เรียบร้อยแล้ว`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      // Create new category
      const newCategory: Category = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        display_order: categories.length + 1,
        status: formData.status,
      };

      setCategories((prev) => [newCategory, ...prev]);

      toast({
        title: "เพิ่มหมวดหมู่สำเร็จ",
        description: `เพิ่มหมวดหมู่ ${formData.name} เรียบร้อยแล้ว`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }

    onFormClose();
  };

  const handleToggleStatus = (categoryId: string) => {
    setCategories((prev) =>
      prev.map((c) =>
        c.id === categoryId
          ? { ...c, status: c.status === "active" ? "inactive" : "active" }
          : c
      )
    );

    const category = categories.find((c) => c.id === categoryId);
    const newStatus = category?.status === "inactive";

    toast({
      title: newStatus ? "เปิดใช้งานหมวดหมู่" : "ปิดใช้งานหมวดหมู่",
      description: `${category?.name} ${
        newStatus ? "เปิดใช้งาน" : "ปิดใช้งาน"
      }แล้ว`,
      status: "success",
      duration: 3000,
      isClosable: true,
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
                  <Icon as={IoFolderOutline} boxSize={6} />
                </Box>
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm" fontWeight="medium">
                    จัดการหมวดหมู่สินค้า
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    หมวดหมู่สินค้า
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
                  <BreadcrumbLink>หมวดหมู่สินค้า</BreadcrumbLink>
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
                onClick={handleAddCategory}
              >
                เพิ่มหมวดหมู่
              </Button>
            </HStack>
          </Flex>

          {/* Category Statistics */}
          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 4 }}
            spacing={6}
            mt={8}
            position="relative"
            zIndex={1}
          >
            <Stat>
              <StatLabel color="whiteAlpha.800">หมวดหมู่ทั้งหมด</StatLabel>
              <StatNumber fontSize="3xl">
                {categoryStats.totalCategories}
              </StatNumber>
              <StatHelpText color="whiteAlpha.800">หมวดหมู่</StatHelpText>
            </Stat>

            <Stat>
              <StatLabel color="whiteAlpha.800">ใช้งานอยู่</StatLabel>
              <StatNumber fontSize="3xl" color="green.200">
                {categoryStats.activeCategories}
              </StatNumber>
              <StatHelpText color="whiteAlpha.800">หมวดหมู่</StatHelpText>
            </Stat>

            <Stat>
              <StatLabel color="whiteAlpha.800">ปิดใช้งาน</StatLabel>
              <StatNumber fontSize="3xl" color="orange.200">
                {categoryStats.inactiveCategories}
              </StatNumber>
              <StatHelpText color="whiteAlpha.800">หมวดหมู่</StatHelpText>
            </Stat>

            <Stat>
              <StatLabel color="whiteAlpha.800">สินค้าทั้งหมด</StatLabel>
              <StatNumber fontSize="3xl">
                {categoryStats.totalProducts}
              </StatNumber>
              <StatHelpText color="whiteAlpha.800">รายการ</StatHelpText>
            </Stat>
          </SimpleGrid>
        </Box>

        {/* Categories Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {categories.map((category) => {
            const productCount = getCategoryProductCount(category.id);
            const categoryValue = getCategoryValue(category.id);

            return (
              <Card
                key={category.id}
                bg={cardBg}
                borderWidth="1px"
                borderColor={borderColor}
                overflow="hidden"
                _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
                transition="all 0.2s"
                opacity={category.status === "active" ? 1 : 0.7}
              >
                <CardHeader>
                  <Flex justify="space-between" align="center">
                    <HStack spacing={3}>
                      <Avatar
                        size="md"
                        name={category.name}
                        bg={
                          category.status === "active" ? "blue.500" : "gray.400"
                        }
                        icon={<Icon as={IoGridOutline} />}
                      />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="lg" fontWeight="bold">
                          {category.name}
                        </Text>
                        <Badge
                          colorScheme={
                            category.status === "active" ? "green" : "gray"
                          }
                          variant={
                            category.status === "active" ? "solid" : "outline"
                          }
                        >
                          {category.status === "active"
                            ? "ใช้งาน"
                            : "ปิดใช้งาน"}
                        </Badge>
                      </VStack>
                    </HStack>

                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<IoEllipsisVertical />}
                        variant="ghost"
                        size="sm"
                      />
                      <MenuList>
                        <MenuItem
                          icon={<IoCreateOutline />}
                          onClick={() => handleEditCategory(category)}
                        >
                          แก้ไข
                        </MenuItem>
                        <MenuItem
                          icon={<IoStatsChartOutline />}
                          onClick={() => handleToggleStatus(category.id)}
                        >
                          {category.status === "active"
                            ? "ปิดใช้งาน"
                            : "เปิดใช้งาน"}
                        </MenuItem>
                        <Divider />
                        <MenuItem
                          icon={<IoTrashOutline />}
                          color="red.500"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          ลบ
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </Flex>
                </CardHeader>

                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <Text fontSize="sm" color="gray.600" noOfLines={2}>
                      {category.description}
                    </Text>

                    <SimpleGrid columns={2} spacing={4}>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="xs" color="gray.500">
                          สินค้า
                        </Text>
                        <Text fontSize="lg" fontWeight="bold" color="blue.500">
                          {productCount}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          รายการ
                        </Text>
                      </VStack>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="xs" color="gray.500">
                          มูลค่า
                        </Text>
                        <Text fontSize="lg" fontWeight="bold" color="green.500">
                          {formatCurrency(categoryValue)}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          บาท
                        </Text>
                      </VStack>
                    </SimpleGrid>

                    <Divider />

                    <HStack
                      justify="space-between"
                      fontSize="xs"
                      color="gray.500"
                    >
                      <Text>
                        สร้างเมื่อ:{" "}
                        {category.created_at
                          ? new Date(category.created_at).toLocaleDateString(
                              "th-TH"
                            )
                          : "ไม่ระบุ"}
                      </Text>
                      <Text>
                        อัปเดต:{" "}
                        {category.updated_at
                          ? new Date(category.updated_at).toLocaleDateString(
                              "th-TH"
                            )
                          : "ไม่ระบุ"}
                      </Text>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            );
          })}
        </SimpleGrid>

        {/* Category Form Modal */}
        <Modal isOpen={isFormOpen} onClose={onFormClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <HStack spacing={2}>
                <Icon as={IoFolderOutline} />
                <Text>{isEditing ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />

            <ModalBody>
              <VStack spacing={4} align="stretch">
                <FormControl isRequired>
                  <FormLabel>ชื่อหมวดหมู่</FormLabel>
                  <Input
                    placeholder="ระบุชื่อหมวดหมู่"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>คำอธิบาย</FormLabel>
                  <Textarea
                    placeholder="ระบุคำอธิบายหมวดหมู่ (ไม่บังคับ)"
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </FormControl>

                <FormControl>
                  <HStack justify="space-between">
                    <FormLabel mb={0}>สถานะการใช้งาน</FormLabel>
                    <Switch
                      isChecked={formData.status === "active"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          status: e.target.checked ? "active" : "inactive",
                        }))
                      }
                      colorScheme="green"
                    />
                  </HStack>
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    {formData.status ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                  </Text>
                </FormControl>

                {isEditing && selectedCategory && (
                  <Box p={3} bg="gray.50" borderRadius="md">
                    <Text fontSize="sm" color="gray.600">
                      <strong>ข้อมูลเพิ่มเติม:</strong>
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      สินค้าในหมวดหมู่:{" "}
                      {getCategoryProductCount(selectedCategory.id)} รายการ
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      มูลค่ารวม:{" "}
                      {formatCurrency(getCategoryValue(selectedCategory.id))}
                    </Text>
                  </Box>
                )}
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onFormClose}>
                ยกเลิก
              </Button>
              <Button colorScheme="blue" onClick={handleSaveCategory}>
                {isEditing ? "บันทึกการแก้ไข" : "เพิ่มหมวดหมู่"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </POSLayout>
  );
};

export default CategoriesPage;
