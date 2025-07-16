import React, { useEffect, useState } from "react";
import { ReactElement } from "react";
import { NextPageWithLayout } from "../_app";
import Layout from "../../components/Layout";
import { Product, ProductStatus, Category } from "@shopflow/types";
import { withAuth } from "../../lib/auth";
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
} from "react-icons/fi";

const ProductsPage: NextPageWithLayout = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    category_id: "",
    status: "active" as ProductStatus,
    images: [] as File[],
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
    loadProducts();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      // Sample categories data
      const sampleCategories: Category[] = [
        { id: "1", name: "เครื่องดื่ม", display_order: 1, status: "active" },
        { id: "2", name: "อาหาร", display_order: 2, status: "active" },
        { id: "3", name: "ขนมปัง", display_order: 3, status: "active" },
        { id: "4", name: "สลัด", display_order: 4, status: "active" },
      ];
      setCategories(sampleCategories);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      // Sample data for now
      const sampleProducts: Product[] = [
        {
          id: "1",
          name: "กาแฟลาเต้",
          description: "กาแฟลาเต้หอมกรุ่น ชงจากเมล็ดกาแฟคุณภาพเยี่ยม",
          price: 65,
          stock: 50,
          category_id: "1",
          status: "active",
          images: [
            "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop",
          ],
        },
        {
          id: "2",
          name: "ขนมปังโฮลวีท",
          description: "ขนมปังโฮลวีทอบสด เหมาะสำหรับมื้อเช้า",
          price: 45,
          stock: 30,
          category_id: "3",
          status: "active",
          images: [
            "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop",
          ],
        },
        {
          id: "3",
          name: "สลัดผลไม้",
          description: "สลัดผลไม้สดใหม่ ดีต่อสุขภาพ",
          price: 85,
          stock: 20,
          category_id: "4",
          status: "active",
          images: [
            "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
          ],
        },
        {
          id: "4",
          name: "ชาเขียวมัทฉะ",
          description: "ชาเขียวมัทฉะแท้จากญี่ปุ่น รสชาติเข้มข้น",
          price: 55,
          stock: 25,
          category_id: "1",
          status: "active",
          images: [
            "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
          ],
        },
        {
          id: "5",
          name: "แซนด์วิชทูน่า",
          description: "แซนด์วิชทูน่าสด ผักกรอบ อิ่มอร่อย",
          price: 75,
          stock: 15,
          category_id: "2",
          status: "active",
          images: [
            "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
          ],
        },
      ];

      setProducts(sampleProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadProducts();
      return;
    }

    try {
      setLoading(true);
      setError("");

      const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setProducts(filteredProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการค้นหา");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setFormData({
      name: "",
      description: "",
      price: 0,
      stock: 0,
      category_id: "",
      status: "active",
      images: [],
    });
    onOpen();
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      stock: product.stock,
      category_id: product.category_id || "",
      status: product.status,
      images: [],
    });
    onOpen();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData((prev) => ({ ...prev, images: files }));
  };

  const handleSaveProduct = async () => {
    try {
      // Convert File[] to string[] URLs (in real app, upload to server first)
      const imageUrls = formData.images.map((file) =>
        URL.createObjectURL(file)
      );

      if (selectedProduct) {
        // Update existing product
        const updatedProduct: Product = {
          ...selectedProduct,
          name: formData.name,
          description: formData.description,
          price: formData.price,
          stock: formData.stock,
          category_id: formData.category_id || undefined,
          status: formData.status,
          images:
            formData.images.length > 0 ? imageUrls : selectedProduct.images,
        };
        setProducts((prev) =>
          prev.map((p) => (p.id === selectedProduct.id ? updatedProduct : p))
        );

        toast({
          title: "อัปเดตสินค้าสำเร็จ",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Add new product
        const newProduct: Product = {
          id: Date.now().toString(),
          name: formData.name,
          description: formData.description,
          price: formData.price,
          stock: formData.stock,
          category_id: formData.category_id || undefined,
          status: formData.status,
          images: imageUrls,
        };
        setProducts((prev) => [newProduct, ...prev]);

        toast({
          title: "เพิ่มสินค้าสำเร็จ",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }

      onClose();
    } catch (err) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกสินค้าได้",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    onDeleteOpen();
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));

      toast({
        title: "ลบสินค้าสำเร็จ",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onDeleteClose();
      setProductToDelete(null);
    } catch (err) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบสินค้าได้",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return "-";
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || "-";
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <HStack justify="space-between" align="start" wrap="wrap" gap={4}>
        <VStack align="start" spacing={2}>
          <Heading size="lg" color="gray.900" fontFamily="heading">
            จัดการสินค้า
          </Heading>
          <Text color="gray.600" fontFamily="body">
            จัดการข้อมูลสินค้าในระบบ
          </Text>
        </VStack>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="blue"
          onClick={handleAddProduct}
        >
          เพิ่มสินค้าใหม่
        </Button>
      </HStack>

      {/* Search */}
      <Card>
        <CardBody>
          <HStack spacing={4}>
            <Input
              placeholder="ค้นหาสินค้า..."
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
              onClick={loadProducts}
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

      {/* Products Table */}
      <Card>
        <CardHeader>
          <Heading size="md" fontFamily="heading">
            รายการสินค้า ({products.length} รายการ)
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
                  <Th fontFamily="heading">ชื่อสินค้า</Th>
                  <Th fontFamily="heading">หมวดหมู่</Th>
                  <Th fontFamily="heading">ราคา</Th>
                  <Th fontFamily="heading">จำนวน</Th>
                  <Th fontFamily="heading">สถานะ</Th>
                  <Th fontFamily="heading">จัดการ</Th>
                </Tr>
              </Thead>
              <Tbody>
                {products.map((product) => (
                  <Tr key={product.id}>
                    <Td>
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
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
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium" fontFamily="body">
                          {product.name}
                        </Text>
                        <Text
                          fontSize="sm"
                          color="gray.500"
                          fontFamily="body"
                          noOfLines={2}
                        >
                          {product.description}
                        </Text>
                      </VStack>
                    </Td>
                    <Td>
                      <Badge variant="outline" colorScheme="purple">
                        {getCategoryName(product.category_id)}
                      </Badge>
                    </Td>
                    <Td>
                      <Text fontFamily="body">
                        ฿{product.price.toLocaleString()}
                      </Text>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={product.stock <= 10 ? "red" : "green"}
                        variant="subtle"
                      >
                        {product.stock} ชิ้น
                      </Badge>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={
                          product.status === "active"
                            ? "green"
                            : product.status === "inactive"
                            ? "gray"
                            : "red"
                        }
                      >
                        {product.status === "active"
                          ? "ใช้งาน"
                          : product.status === "inactive"
                          ? "ปิดใช้งาน"
                          : "หมด"}
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
                            onClick={() => handleEditProduct(product)}
                          >
                            แก้ไข
                          </MenuItem>
                          <MenuItem
                            icon={<FiTrash2 />}
                            color="red.500"
                            onClick={() => handleDeleteClick(product)}
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

      {/* Add/Edit Product Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontFamily="heading">
            {selectedProduct ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontFamily="heading">ชื่อสินค้า</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="กรอกชื่อสินค้า"
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
                  placeholder="กรอกคำอธิบายสินค้า"
                  fontFamily="body"
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontFamily="heading">หมวดหมู่</FormLabel>
                <Select
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category_id: e.target.value,
                    }))
                  }
                  fontFamily="body"
                >
                  <option value="">เลือกหมวดหมู่</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel fontFamily="heading">รูปภาพสินค้า</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  fontFamily="body"
                />
                <FormHelperText>
                  รองรับไฟล์ .jpg, .png, .gif ขนาดไม่เกิน 5MB ต่อไฟล์
                  (เลือกได้หลายไฟล์)
                </FormHelperText>
                {formData.images.length > 0 && (
                  <HStack mt={2} spacing={2} flexWrap="wrap">
                    {formData.images.map((file, index) => (
                      <Image
                        key={index}
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        boxSize="100px"
                        objectFit="cover"
                        borderRadius="md"
                      />
                    ))}
                  </HStack>
                )}
              </FormControl>

              <HStack spacing={4} w="full">
                <FormControl isRequired>
                  <FormLabel fontFamily="heading">ราคา (บาท)</FormLabel>
                  <NumberInput
                    value={formData.price}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, price: Number(value) }))
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

                <FormControl isRequired>
                  <FormLabel fontFamily="heading">จำนวน (ชิ้น)</FormLabel>
                  <NumberInput
                    value={formData.stock}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, stock: Number(value) }))
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
                      status: e.target.value as ProductStatus,
                    }))
                  }
                  fontFamily="body"
                >
                  <option value="active">ใช้งาน</option>
                  <option value="inactive">ปิดใช้งาน</option>
                  <option value="out_of_stock">หมด</option>
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
              onClick={handleSaveProduct}
              isDisabled={!formData.name.trim()}
            >
              {selectedProduct ? "อัปเดต" : "เพิ่ม"}
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
              ยืนยันการลบสินค้า
            </AlertDialogHeader>

            <AlertDialogBody fontFamily="body">
              คุณต้องการลบสินค้า <strong>"{productToDelete?.name}"</strong>{" "}
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
ProductsPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="จัดการสินค้า">{page}</Layout>;
};

export default withAuth(ProductsPage, "staff");
