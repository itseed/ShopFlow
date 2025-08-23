import React, { useState } from "react";
import { ReactElement } from "react";
import { NextPageWithLayout } from "../_app";
import Layout from "../../components/Layout";
import ImageUpload from "../../components/ImageUpload";
import { Product, ProductStatus } from "@shopflow/types";
import { withAuth } from "../../lib/auth";
import {
  useProducts,
  useCategories,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "../../lib/hooks/useDatabase";
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
  Checkbox,
  Tag,
  TagLabel,
  TagCloseButton,
} from "@chakra-ui/react";
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiEdit2,
  FiTrash2,
  FiMoreVertical,
  FiX,
} from "react-icons/fi";
import { IoAdd } from "react-icons/io5";

const ProductsPage: NextPageWithLayout = () => {
  // React Query hooks
  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
  } = useProducts();

  const { data: categories = [], isLoading: categoriesLoading } = useCategories(
    { status: "active" }
  );

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  // Extract products data
  const products = productsData || [];
  const loading = productsLoading || categoriesLoading;
  const error = productsError?.message || "";

  // Local state
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
    images: [] as string[], // Changed from File[] to string[]
    hasVariants: false,
    variants: [] as {
      id: string;
      variant_combinations: Record<string, string>;
      price_adjustment: number;
      stock: number;
      is_active: boolean;
    }[],
  });
  const [variantTypes, setVariantTypes] = useState<string[]>([]);
  const [newVariantType, setNewVariantType] = useState("");
  const [variantOptions, setVariantOptions] = useState<
    Record<string, string[]>
  >({});
  const [newVariantOption, setNewVariantOption] = useState<
    Record<string, string>
  >({});

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const cancelRef = React.useRef(null);

  // Variant Management Functions
  const addVariantType = () => {
    if (
      newVariantType.trim() &&
      !variantTypes.includes(newVariantType.trim())
    ) {
      setVariantTypes([...variantTypes, newVariantType.trim()]);
      setVariantOptions({ ...variantOptions, [newVariantType.trim()]: [] });
      setNewVariantType("");
    }
  };

  const removeVariantType = (type: string) => {
    setVariantTypes(variantTypes.filter((t) => t !== type));
    const newOptions = { ...variantOptions };
    delete newOptions[type];
    setVariantOptions(newOptions);
    const newOption = { ...newVariantOption };
    delete newOption[type];
    setNewVariantOption(newOption);
  };

  const addVariantOption = (type: string) => {
    const option = newVariantOption[type];
    if (
      option &&
      option.trim() &&
      !variantOptions[type]?.includes(option.trim())
    ) {
      setVariantOptions({
        ...variantOptions,
        [type]: [...(variantOptions[type] || []), option.trim()],
      });
      setNewVariantOption({ ...newVariantOption, [type]: "" });
    }
  };

  const removeVariantOption = (type: string, option: string) => {
    setVariantOptions({
      ...variantOptions,
      [type]: variantOptions[type]?.filter((o) => o !== option) || [],
    });
  };

  const generateVariants = () => {
    if (variantTypes.length === 0) return;

    const combinations: Record<string, string>[] = [];

    const generate = (index: number, current: Record<string, string>) => {
      if (index === variantTypes.length) {
        combinations.push({ ...current });
        return;
      }

      const type = variantTypes[index];
      const options = variantOptions[type] || [];

      for (const option of options) {
        current[type] = option;
        generate(index + 1, current);
      }
    };

    generate(0, {});

    const variants = combinations.map((combo, index) => ({
      id: `variant-${Date.now()}-${index}`,
      variant_combinations: combo,
      price_adjustment: 0,
      stock: 0,
      is_active: true,
    }));

    setFormData((prev) => ({ ...prev, variants }));
  };

  const resetVariantForm = () => {
    setVariantTypes([]);
    setVariantOptions({});
    setNewVariantType("");
    setNewVariantOption({});
  };

  const handleSearch = () => {
    // Search functionality will be handled by the useProducts hook
    // Trigger refetch with search parameters
    // queryClient.invalidateQueries(['products']);
  };

  const handleReset = () => {
    setSearchQuery("");
    // This will trigger a refetch with no search parameters
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
      hasVariants: false,
      variants: [],
    });
    resetVariantForm();
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
      images: product.images || [],
      hasVariants:
        (product as Product & { hasVariants?: boolean }).hasVariants || false,
      variants:
        (
          product as Product & {
            variants?: {
              id: string;
              variant_combinations: Record<string, string>;
              price_adjustment: number;
              stock: number;
              is_active: boolean;
            }[];
          }
        ).variants || [],
    });
    resetVariantForm();
    onOpen();
  };

  const handleImagesChange = (imageUrls: string[]) => {
    setFormData((prev) => ({ ...prev, images: imageUrls }));
  };

  const handleSaveProduct = async () => {
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stock: formData.stock,
        category_id: formData.category_id || undefined,
        status: formData.status as "active" | "inactive" | "out_of_stock",
        images:
          formData.images.length > 0
            ? formData.images
            : selectedProduct?.images || undefined,
      };

      if (selectedProduct) {
        // Update existing product
        await updateProductMutation.mutateAsync({
          id: selectedProduct.id,
          data: productData,
        });
      } else {
        // Add new product
        await createProductMutation.mutateAsync(productData);
      }

      onClose();
    } catch (error) {
      // Error toast is handled by the mutation hook
    }
  };

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    onDeleteOpen();
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      await deleteProductMutation.mutateAsync(productToDelete.id);
      onDeleteClose();
      setProductToDelete(null);
    } catch (error) {
      // Error toast is handled by the mutation hook
    }
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return "-";
    const category = categories.find(
      (c: { id: string; name: string }) => c.id === categoryId
    );
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
              onClick={handleReset}
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
                        <HStack>
                          <Text fontWeight="medium" fontFamily="body">
                            {product.name}
                          </Text>
                          {(product as Product & { hasVariants?: boolean })
                            .hasVariants && (
                            <Badge
                              size="sm"
                              colorScheme="orange"
                              variant="subtle"
                            >
                              หลายรูปแบบ
                            </Badge>
                          )}
                        </HStack>
                        <Text
                          fontSize="sm"
                          color="gray.500"
                          fontFamily="body"
                          noOfLines={2}
                        >
                          {product.description}
                        </Text>
                        {(
                          product as Product & {
                            variants?: {
                              id: string;
                              variant_combinations: Record<string, string>;
                              price_adjustment: number;
                              stock: number;
                              is_active: boolean;
                            }[];
                          }
                        ).variants &&
                          (
                            product as Product & {
                              variants?: {
                                id: string;
                                variant_combinations: Record<string, string>;
                                price_adjustment: number;
                                stock: number;
                                is_active: boolean;
                              }[];
                            }
                          ).variants!.length > 0 && (
                            <Text
                              fontSize="xs"
                              color="blue.600"
                              fontFamily="body"
                            >
                              {
                                (
                                  product as Product & {
                                    variants?: {
                                      id: string;
                                      variant_combinations: Record<
                                        string,
                                        string
                                      >;
                                      price_adjustment: number;
                                      stock: number;
                                      is_active: boolean;
                                    }[];
                                  }
                                ).variants!.length
                              }{" "}
                              รูปแบบ
                            </Text>
                          )}
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
                <ImageUpload
                  images={formData.images}
                  onImagesChange={handleImagesChange}
                  maxImages={5}
                />
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

              {/* Variant Management Section */}
              <FormControl>
                <HStack justify="space-between" align="center" mb={3}>
                  <FormLabel fontFamily="heading" mb={0}>
                    รูปแบบสินค้า (Variants)
                  </FormLabel>
                  <Checkbox
                    isChecked={formData.hasVariants}
                    onChange={(e) => {
                      const hasVariants = e.target.checked;
                      setFormData((prev) => ({ ...prev, hasVariants }));
                      if (!hasVariants) {
                        resetVariantForm();
                        setFormData((prev) => ({ ...prev, variants: [] }));
                      }
                    }}
                    colorScheme="blue"
                  >
                    มีหลายรูปแบบ
                  </Checkbox>
                </HStack>
                <FormHelperText fontSize="xs" mt={-2} mb={2}>
                  เปิดใช้งานสำหรับสินค้าที่มีหลายตัวเลือก เช่น เสื้อผ้าหลายขนาด,
                  เครื่องดื่มหลายรสชาติ
                </FormHelperText>

                {formData.hasVariants && (
                  <VStack
                    spacing={4}
                    align="stretch"
                    p={4}
                    bg="gray.50"
                    borderRadius="md"
                  >
                    {/* Add Variant Type */}
                    <FormControl>
                      <FormLabel
                        fontSize="sm"
                        fontWeight="medium"
                        mb={2}
                        fontFamily="heading"
                      >
                        ประเภทรูปแบบ (เช่น ขนาด, สี, รสชาติ)
                      </FormLabel>
                      <FormHelperText fontSize="xs" mt={-1} mb={2}>
                        กำหนดประเภทรูปแบบของสินค้า เช่น ขนาด, สี, รสชาติ, วัสดุ
                      </FormHelperText>
                      <HStack>
                        <Input
                          placeholder="พิมพ์ชื่อประเภท เช่น ขนาด, สี, รสชาติ"
                          value={newVariantType}
                          onChange={(e) => setNewVariantType(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" && addVariantType()
                          }
                          size="sm"
                          fontFamily="body"
                        />
                        <IconButton
                          aria-label="เพิ่มประเภท"
                          icon={<IoAdd />}
                          onClick={addVariantType}
                          size="sm"
                          colorScheme="blue"
                        />
                      </HStack>

                      {variantTypes.length > 0 && (
                        <HStack spacing={2} mt={2} wrap="wrap">
                          {variantTypes.map((type) => (
                            <Tag key={type} size="md" colorScheme="blue">
                              <TagLabel>{type}</TagLabel>
                              <TagCloseButton
                                onClick={() => removeVariantType(type)}
                              />
                            </Tag>
                          ))}
                        </HStack>
                      )}
                    </FormControl>

                    {/* Add Options for Each Type */}
                    {variantTypes.map((type) => (
                      <FormControl key={type}>
                        <FormLabel
                          fontSize="sm"
                          fontWeight="medium"
                          mb={2}
                          fontFamily="heading"
                        >
                          ตัวเลือกสำหรับ "{type}"
                        </FormLabel>
                        <FormHelperText fontSize="xs" mt={-1} mb={2}>
                          เพิ่มตัวเลือกทีละรายการ กดปุ่ม + หรือ Enter เพื่อเพิ่ม
                        </FormHelperText>
                        <HStack>
                          <Input
                            placeholder={`พิมพ์ตัวเลือก เช่น ${
                              type === "ขนาด"
                                ? "S, M, L"
                                : type === "สี"
                                ? "แดง, น้ำเงิน"
                                : "ตัวเลือกต่างๆ"
                            }`}
                            value={newVariantOption[type] || ""}
                            onChange={(e) =>
                              setNewVariantOption((prev) => ({
                                ...prev,
                                [type]: e.target.value,
                              }))
                            }
                            onKeyPress={(e) =>
                              e.key === "Enter" && addVariantOption(type)
                            }
                            size="sm"
                          />
                          <IconButton
                            aria-label="เพิ่มตัวเลือก"
                            icon={<IoAdd />}
                            onClick={() => addVariantOption(type)}
                            size="sm"
                            colorScheme="green"
                          />
                        </HStack>

                        {variantOptions[type] &&
                          variantOptions[type].length > 0 && (
                            <HStack spacing={2} mt={2} wrap="wrap">
                              {variantOptions[type].map((option) => (
                                <Tag key={option} size="sm" colorScheme="green">
                                  <TagLabel>{option}</TagLabel>
                                  <TagCloseButton
                                    onClick={() =>
                                      removeVariantOption(type, option)
                                    }
                                  />
                                </Tag>
                              ))}
                            </HStack>
                          )}
                      </FormControl>
                    ))}

                    {/* Generate Variants Button */}
                    {variantTypes.length > 0 &&
                      Object.values(variantOptions).some(
                        (opts) => opts.length > 0
                      ) && (
                        <Button
                          onClick={generateVariants}
                          colorScheme="purple"
                          size="sm"
                          leftIcon={<IoAdd />}
                        >
                          สร้างรูปแบบสินค้าทั้งหมด
                        </Button>
                      )}

                    {/* Display Generated Variants */}
                    {formData.variants.length > 0 && (
                      <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={1}>
                          รูปแบบสินค้าที่สร้างแล้ว ({formData.variants.length}{" "}
                          รูปแบบ)
                        </Text>
                        <FormHelperText fontSize="xs" mb={3}>
                          ปรับราคาและสต็อกสำหรับแต่ละรูปแบบ (ราคาจะเป็น ราคาหลัก
                          + ปรับราคา)
                        </FormHelperText>
                        <VStack
                          spacing={2}
                          align="stretch"
                          maxH="200px"
                          overflowY="auto"
                        >
                          {formData.variants.map((variant, index) => (
                            <Box
                              key={variant.id}
                              p={3}
                              bg="white"
                              borderRadius="md"
                              border="1px solid"
                              borderColor="gray.200"
                            >
                              <HStack justify="space-between" align="start">
                                <VStack align="start" spacing={1} flex={1}>
                                  <Text fontSize="sm" fontWeight="medium">
                                    {Object.entries(
                                      variant.variant_combinations
                                    )
                                      .map(
                                        ([type, value]) => `${type}: ${value}`
                                      )
                                      .join(", ")}
                                  </Text>
                                  <HStack spacing={4}>
                                    <VStack spacing={1} align="start">
                                      <Text
                                        fontSize="xs"
                                        fontWeight="medium"
                                        color="gray.600"
                                      >
                                        ปรับราคา (บาท)
                                      </Text>
                                      <NumberInput
                                        size="sm"
                                        value={variant.price_adjustment}
                                        onChange={(value) => {
                                          const newVariants = [
                                            ...formData.variants,
                                          ];
                                          newVariants[index].price_adjustment =
                                            Number(value);
                                          setFormData((prev) => ({
                                            ...prev,
                                            variants: newVariants,
                                          }));
                                        }}
                                        w="100px"
                                      >
                                        <NumberInputField placeholder="0" />
                                      </NumberInput>
                                    </VStack>
                                    <VStack spacing={1} align="start">
                                      <Text
                                        fontSize="xs"
                                        fontWeight="medium"
                                        color="gray.600"
                                      >
                                        สต็อก (ชิ้น)
                                      </Text>
                                      <NumberInput
                                        size="sm"
                                        value={variant.stock}
                                        onChange={(value) => {
                                          const newVariants = [
                                            ...formData.variants,
                                          ];
                                          newVariants[index].stock =
                                            Number(value);
                                          setFormData((prev) => ({
                                            ...prev,
                                            variants: newVariants,
                                          }));
                                        }}
                                        w="80px"
                                      >
                                        <NumberInputField placeholder="0" />
                                      </NumberInput>
                                    </VStack>
                                  </HStack>
                                </VStack>
                                <IconButton
                                  aria-label="ลบรูปแบบ"
                                  icon={<FiX />}
                                  size="sm"
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => {
                                    const newVariants =
                                      formData.variants.filter(
                                        (_, i) => i !== index
                                      );
                                    setFormData((prev) => ({
                                      ...prev,
                                      variants: newVariants,
                                    }));
                                  }}
                                />
                              </HStack>
                            </Box>
                          ))}
                        </VStack>
                      </Box>
                    )}
                  </VStack>
                )}
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
