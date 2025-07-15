import React, { useEffect, useState } from "react";
import { ReactElement } from "react";
import { NextPageWithLayout } from "./_app";
import Layout from "../components/Layout";
import { Category, CategoryStatus } from "@shopflow/types";
import { withAuth } from "../lib/auth";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Input,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Textarea,
  useDisclosure,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Flex,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Image,
  FormHelperText,
} from "@chakra-ui/react";
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiEdit2,
  FiTrash2,
  FiMoreVertical,
  FiUpload,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";

const CategoriesPage: NextPageWithLayout = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );
  const [isDragOver, setIsDragOver] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parent_id: "",
    display_order: 0,
    status: "active" as CategoryStatus,
    image: null as File | null,
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const toast = useToast();
  const cancelRef = React.useRef(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      // Sample data for now
      const sampleCategories: Category[] = [
        {
          id: "1",
          name: "เครื่องดื่ม",
          description: "เครื่องดื่มทุกประเภท เช่น กาแฟ ชา น้ำผลไม้",
          display_order: 1,
          status: "active",
          image:
            "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop",
        },
        {
          id: "2",
          name: "อาหาร",
          description: "อาหารคาว อาหารหวาน ขนมต่างๆ",
          display_order: 2,
          status: "active",
          image:
            "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
        },
        {
          id: "3",
          name: "ขนมปัง",
          description: "ขนมปังสด ขนมปังโฮลวีท ขนมปังหวาน",
          display_order: 3,
          status: "active",
          image:
            "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop",
        },
        {
          id: "4",
          name: "สลัด",
          description: "สลัดผลไม้ สลัดผัก อาหารเพื่อสุขภาพ",
          display_order: 4,
          status: "active",
          image:
            "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
        },
      ];

      setCategories(sampleCategories);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadCategories();
      return;
    }

    try {
      setLoading(true);
      setError("");

      const filteredCategories = categories.filter((category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setCategories(filteredCategories);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการค้นหา");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setFormData({
      name: "",
      description: "",
      parent_id: "",
      display_order: categories.length + 1,
      status: "active",
      image: null,
    });
    onOpen();
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      parent_id: category.parent_id || "",
      display_order: category.display_order,
      status: category.status,
      image: null,
    });
    onOpen();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setFormData((prev) => ({ ...prev, image: file }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setFormData((prev) => ({ ...prev, image: file }));
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
  };

  const handleSaveCategory = async () => {
    try {
      if (selectedCategory) {
        // Update existing category
        const updatedCategory = {
          ...selectedCategory,
          name: formData.name,
          description: formData.description,
          parent_id: formData.parent_id || undefined,
          display_order: formData.display_order,
          status: formData.status,
          // In real app, upload image and get URL here
          image: formData.image
            ? URL.createObjectURL(formData.image)
            : selectedCategory.image,
        };
        setCategories((prev) =>
          prev.map((c) => (c.id === selectedCategory.id ? updatedCategory : c))
        );

        toast({
          title: "อัปเดตหมวดหมู่สำเร็จ",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Add new category
        const newCategory: Category = {
          id: Date.now().toString(),
          name: formData.name,
          description: formData.description,
          parent_id: formData.parent_id || undefined,
          display_order: formData.display_order,
          status: formData.status,
          image: formData.image
            ? URL.createObjectURL(formData.image)
            : undefined,
        };
        setCategories((prev) => [...prev, newCategory]);

        toast({
          title: "เพิ่มหมวดหมู่สำเร็จ",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }

      onClose();
    } catch (err) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกหมวดหมู่ได้",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    onDeleteOpen();
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    try {
      setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));

      toast({
        title: "ลบหมวดหมู่สำเร็จ",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onDeleteClose();
      setCategoryToDelete(null);
    } catch (err) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบหมวดหมู่ได้",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <HStack justify="space-between" align="start" wrap="wrap" gap={4}>
        <VStack align="start" spacing={2}>
          <Heading size="lg" color="gray.900" fontFamily="heading">
            จัดการหมวดหมู่สินค้า
          </Heading>
          <Text color="gray.600" fontFamily="body">
            จัดการหมวดหมู่และการจัดกลุ่มสินค้า
          </Text>
        </VStack>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="blue"
          onClick={handleAddCategory}
        >
          เพิ่มหมวดหมู่ใหม่
        </Button>
      </HStack>

      {/* Search */}
      <Card>
        <CardBody>
          <HStack spacing={4}>
            <Input
              placeholder="ค้นหาหมวดหมู่..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              flex={1}
              fontFamily="body"
            />
            <Button
              leftIcon={<FiSearch />}
              onClick={handleSearch}
              colorScheme="gray"
            >
              ค้นหา
            </Button>
            <Button
              leftIcon={<FiFilter />}
              onClick={loadCategories}
              variant="outline"
            >
              รีเซ็ต
            </Button>
          </HStack>
        </CardBody>
      </Card>

      {/* Error */}
      {error && (
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <Heading size="md" fontFamily="heading">
            รายการหมวดหมู่ ({categories.length} รายการ)
          </Heading>
        </CardHeader>
        <CardBody p={0}>
          {loading ? (
            <Flex justify="center" p={8}>
              <Spinner size="lg" color="blue.500" />
            </Flex>
          ) : (
            <Table variant="simple">
              <Thead bg="gray.50">
                <Tr>
                  <Th fontFamily="heading">รูปภาพ</Th>
                  <Th fontFamily="heading">ชื่อหมวดหมู่</Th>
                  <Th fontFamily="heading">คำอธิบาย</Th>
                  <Th fontFamily="heading">ลำดับ</Th>
                  <Th fontFamily="heading">สถานะ</Th>
                  <Th fontFamily="heading">จัดการ</Th>
                </Tr>
              </Thead>
              <Tbody>
                {categories.map((category) => (
                  <Tr key={category.id}>
                    <Td>
                      {category.image ? (
                        <Image
                          src={category.image}
                          alt={category.name}
                          boxSize="50px"
                          objectFit="cover"
                          borderRadius="md"
                        />
                      ) : (
                        <Box
                          boxSize="50px"
                          bg="gray.100"
                          borderRadius="md"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Text fontSize="xs" color="gray.500">
                            ไม่มีรูป
                          </Text>
                        </Box>
                      )}
                    </Td>
                    <Td>
                      <Text fontWeight="medium" fontFamily="body">
                        {category.name}
                      </Text>
                    </Td>
                    <Td>
                      <Text
                        fontSize="sm"
                        color="gray.600"
                        fontFamily="body"
                        noOfLines={2}
                      >
                        {category.description || "-"}
                      </Text>
                    </Td>
                    <Td>
                      <Badge variant="outline" colorScheme="blue">
                        {category.display_order}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={
                          category.status === "active" ? "green" : "gray"
                        }
                      >
                        {category.status === "active" ? "ใช้งาน" : "ปิดใช้งาน"}
                      </Badge>
                    </Td>
                    <Td>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<FiMoreVertical />}
                          variant="ghost"
                          size="sm"
                        />
                        <MenuList>
                          <MenuItem
                            icon={<FiEdit2 />}
                            onClick={() => handleEditCategory(category)}
                          >
                            แก้ไข
                          </MenuItem>
                          <MenuItem
                            icon={<FiTrash2 />}
                            color="red.500"
                            onClick={() => handleDeleteClick(category)}
                          >
                            ลบ
                          </MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Add/Edit Category Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontFamily="heading">
            {selectedCategory ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontFamily="heading">ชื่อหมวดหมู่</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="กรอกชื่อหมวดหมู่"
                  fontFamily="body"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontFamily="heading">คำอธิบาย</FormLabel>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="กรอกคำอธิบายหมวดหมู่"
                  fontFamily="body"
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontFamily="heading">รูปภาพหมวดหมู่</FormLabel>

                {/* Drag & Drop Upload Area */}
                <Box
                  border="2px dashed"
                  borderColor={isDragOver ? "blue.500" : "gray.300"}
                  borderRadius="lg"
                  p={6}
                  textAlign="center"
                  bg={isDragOver ? "blue.50" : "gray.50"}
                  transition="all 0.2s"
                  cursor="pointer"
                  _hover={{ borderColor: "blue.400", bg: "blue.50" }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() =>
                    document.getElementById("category-image-upload")?.click()
                  }
                >
                  <VStack spacing={3}>
                    <Box
                      p={3}
                      borderRadius="full"
                      bg={isDragOver ? "blue.100" : "gray.100"}
                      color={isDragOver ? "blue.500" : "gray.500"}
                    >
                      <FiUploadCloud size={24} />
                    </Box>
                    <VStack spacing={1}>
                      <Text
                        fontWeight="medium"
                        color="gray.700"
                        fontFamily="body"
                      >
                        {isDragOver
                          ? "วางไฟล์รูปภาพที่นี่"
                          : "ลากและวางไฟล์รูปภาพ หรือคลิกเพื่อเลือก"}
                      </Text>
                      <Text fontSize="sm" color="gray.500" fontFamily="body">
                        รองรับไฟล์ JPG, PNG, GIF ขนาดไม่เกิน 5MB
                      </Text>
                    </VStack>
                  </VStack>
                  <Input
                    id="category-image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    display="none"
                  />
                </Box>

                {/* Image Preview */}
                {formData.image && (
                  <Box mt={4}>
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      mb={3}
                      color="gray.700"
                      fontFamily="heading"
                    >
                      รูปภาพที่เลือก
                    </Text>
                    <Box
                      position="relative"
                      borderRadius="lg"
                      overflow="hidden"
                      border="1px solid"
                      borderColor="gray.200"
                      bg="white"
                      shadow="sm"
                      maxW="300px"
                    >
                      <Image
                        src={URL.createObjectURL(formData.image)}
                        alt="Category Preview"
                        w="full"
                        h="200px"
                        objectFit="cover"
                      />
                      <Box
                        position="absolute"
                        top={2}
                        right={2}
                        bg="red.500"
                        borderRadius="full"
                        p={2}
                        cursor="pointer"
                        _hover={{ bg: "red.600" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage();
                        }}
                      >
                        <FiX size={14} color="white" />
                      </Box>
                      <Box
                        position="absolute"
                        bottom={0}
                        left={0}
                        right={0}
                        bg="blackAlpha.700"
                        color="white"
                        p={3}
                        fontSize="sm"
                        fontFamily="body"
                      >
                        <Text noOfLines={1} fontWeight="medium">
                          {formData.image.name}
                        </Text>
                        <Text color="gray.300" fontSize="xs">
                          {(formData.image.size / 1024 / 1024).toFixed(1)} MB
                        </Text>
                      </Box>
                    </Box>
                  </Box>
                )}
              </FormControl>

              <HStack spacing={4} w="full">
                <FormControl>
                  <FormLabel fontFamily="heading">หมวดหมู่หลัก</FormLabel>
                  <Select
                    value={formData.parent_id}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        parent_id: e.target.value,
                      }))
                    }
                    fontFamily="body"
                  >
                    <option value="">ไม่มีหมวดหมู่หลัก</option>
                    {categories
                      .filter((c) => c.id !== selectedCategory?.id)
                      .map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontFamily="heading">ลำดับการแสดง</FormLabel>
                  <NumberInput
                    value={formData.display_order}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        display_order: Number(value),
                      }))
                    }
                    min={0}
                  >
                    <NumberInputField placeholder="0" fontFamily="body" />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>
              </HStack>

              <FormControl isRequired>
                <FormLabel fontFamily="heading">สถานะ</FormLabel>
                <Select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value as CategoryStatus,
                    }))
                  }
                  fontFamily="body"
                >
                  <option value="active">ใช้งาน</option>
                  <option value="inactive">ปิดใช้งาน</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              ยกเลิก
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSaveCategory}
              isDisabled={!formData.name.trim()}
            >
              {selectedCategory ? "อัปเดต" : "เพิ่ม"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader
              fontSize="lg"
              fontWeight="bold"
              fontFamily="heading"
            >
              ยืนยันการลบหมวดหมู่
            </AlertDialogHeader>

            <AlertDialogBody fontFamily="body">
              คุณต้องการลบหมวดหมู่ <strong>"{categoryToDelete?.name}"</strong>{" "}
              หรือไม่?
              <br />
              การกระทำนี้ไม่สามารถยกเลิกได้
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                ยกเลิก
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                ลบ
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </VStack>
  );
};

// Use layout
CategoriesPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="จัดการหมวดหมู่สินค้า">{page}</Layout>;
};

export default withAuth(CategoriesPage, "staff");
