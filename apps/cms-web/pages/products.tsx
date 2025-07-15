import React, { useEffect, useState } from "react";
import { ReactElement } from "react";
import { NextPageWithLayout } from "./_app";
import Layout from "../components/Layout";
import * as XLSX from "xlsx";
import {
  Product,
  ProductStatus,
  Category,
  ProductVariantType,
  ProductVariantOption,
  ProductVariant,
  ProductWithVariants,
} from "@shopflow/types";
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
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Switch,
  Divider,
  SimpleGrid,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Progress,
} from "@chakra-ui/react";
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiEdit2,
  FiTrash2,
  FiMoreVertical,
  FiUploadCloud,
  FiX,
  FiSettings,
  FiLayers,
  FiEye,
  FiEyeOff,
  FiDownload,
  FiFile,
  FiUpload,
} from "react-icons/fi";

const ProductsPage: NextPageWithLayout = () => {
  const [products, setProducts] = useState<ProductWithVariants[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [variantTypes, setVariantTypes] = useState<ProductVariantType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] =
    useState<ProductWithVariants | null>(null);
  const [productToDelete, setProductToDelete] =
    useState<ProductWithVariants | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    category_id: "",
    status: "active" as ProductStatus,
    images: [] as File[],
    has_variants: false,
    selected_variant_types: [] as string[], // IDs of selected variant types
    variants: [] as ProductVariant[],
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  // Variant Type Management States
  const [selectedVariantType, setSelectedVariantType] =
    useState<ProductVariantType | null>(null);
  const [variantTypeFormData, setVariantTypeFormData] = useState({
    name: "",
    display_name: "",
    options: [] as { name: string; value: string }[],
  });
  const [currentOption, setCurrentOption] = useState({ name: "", value: "" });

  // Bulk Upload States
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResults, setUploadResults] = useState<{
    success: number;
    errors: { row: number; message: string }[];
  } | null>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const {
    isOpen: isVariantTypeOpen,
    onOpen: onVariantTypeOpen,
    onClose: onVariantTypeClose,
  } = useDisclosure();
  const {
    isOpen: isBulkUploadOpen,
    onOpen: onBulkUploadOpen,
    onClose: onBulkUploadClose,
  } = useDisclosure();
  const toast = useToast();
  const cancelRef = React.useRef(null);

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadVariantTypes();
  }, []);

  const loadVariantTypes = async () => {
    try {
      // Sample variant types data
      const sampleVariantTypes: ProductVariantType[] = [
        {
          id: "1",
          name: "color",
          display_name: "สี",
          sort_order: 1,
          is_active: true,
          options: [
            {
              id: "1-1",
              name: "แดง",
              value: "red",
              sort_order: 1,
              is_active: true,
            },
            {
              id: "1-2",
              name: "น้ำเงิน",
              value: "blue",
              sort_order: 2,
              is_active: true,
            },
            {
              id: "1-3",
              name: "เขียว",
              value: "green",
              sort_order: 3,
              is_active: true,
            },
            {
              id: "1-4",
              name: "เหลือง",
              value: "yellow",
              sort_order: 4,
              is_active: true,
            },
          ],
        },
        {
          id: "2",
          name: "size",
          display_name: "ขนาด",
          sort_order: 2,
          is_active: true,
          options: [
            {
              id: "2-1",
              name: "เล็ก",
              value: "S",
              sort_order: 1,
              is_active: true,
            },
            {
              id: "2-2",
              name: "กลาง",
              value: "M",
              sort_order: 2,
              is_active: true,
            },
            {
              id: "2-3",
              name: "ใหญ่",
              value: "L",
              sort_order: 3,
              is_active: true,
            },
            {
              id: "2-4",
              name: "ใหญ่พิเศษ",
              value: "XL",
              sort_order: 4,
              is_active: true,
            },
          ],
        },
        {
          id: "3",
          name: "flavor",
          display_name: "รสชาติ",
          sort_order: 3,
          is_active: true,
          options: [
            {
              id: "3-1",
              name: "หวาน",
              value: "sweet",
              sort_order: 1,
              is_active: true,
            },
            {
              id: "3-2",
              name: "เปรี้ยว",
              value: "sour",
              sort_order: 2,
              is_active: true,
            },
            {
              id: "3-3",
              name: "เผ็ด",
              value: "spicy",
              sort_order: 3,
              is_active: true,
            },
            {
              id: "3-4",
              name: "เค็ม",
              value: "salty",
              sort_order: 4,
              is_active: true,
            },
          ],
        },
        {
          id: "4",
          name: "material",
          display_name: "วัสดุ",
          sort_order: 4,
          is_active: true,
          options: [
            {
              id: "4-1",
              name: "ผ้าฝ้าย",
              value: "cotton",
              sort_order: 1,
              is_active: true,
            },
            {
              id: "4-2",
              name: "โพลีเอสเตอร์",
              value: "polyester",
              sort_order: 2,
              is_active: true,
            },
            {
              id: "4-3",
              name: "ผ้าไหม",
              value: "silk",
              sort_order: 3,
              is_active: true,
            },
          ],
        },
        {
          id: "5",
          name: "weight",
          display_name: "น้ำหนัก",
          sort_order: 5,
          is_active: false,
          options: [
            {
              id: "5-1",
              name: "100 กรัม",
              value: "100g",
              sort_order: 1,
              is_active: true,
            },
            {
              id: "5-2",
              name: "250 กรัม",
              value: "250g",
              sort_order: 2,
              is_active: true,
            },
            {
              id: "5-3",
              name: "500 กรัม",
              value: "500g",
              sort_order: 3,
              is_active: true,
            },
          ],
        },
      ];
      setVariantTypes(sampleVariantTypes);
    } catch (err) {
      console.error("Error loading variant types:", err);
    }
  };

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
      const sampleProducts: ProductWithVariants[] = [
        {
          id: "1",
          name: "กาแฟลาเต้",
          description: "กาแฟลาเต้หอมกรุ่น ชงจากเมล็ดกาแฟคุณภาพเยี่ยม",
          price: 65,
          stock: 50,
          category_id: "1",
          status: "active",
          has_variants: false,
          images: [
            "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop",
          ],
        },
        {
          id: "2",
          name: "เสื้อยืดคุณภาพดี",
          description: "เสื้อยืดผ้าคุณภาพดี สีสันสวยงาม",
          price: 450,
          stock: 100,
          category_id: "2",
          status: "active",
          has_variants: true,
          variant_types: [
            {
              id: "1",
              name: "สี",
              display_name: "Color",
              sort_order: 1,
              is_active: true,
              options: [
                {
                  id: "1-1",
                  name: "แดง",
                  value: "red",
                  sort_order: 1,
                  is_active: true,
                },
                {
                  id: "1-2",
                  name: "น้ำเงิน",
                  value: "blue",
                  sort_order: 2,
                  is_active: true,
                },
              ],
            },
            {
              id: "2",
              name: "ขนาด",
              display_name: "Size",
              sort_order: 2,
              is_active: true,
              options: [
                {
                  id: "2-1",
                  name: "เล็ก",
                  value: "S",
                  sort_order: 1,
                  is_active: true,
                },
                {
                  id: "2-2",
                  name: "กลาง",
                  value: "M",
                  sort_order: 2,
                  is_active: true,
                },
              ],
            },
          ],
          variants: [
            {
              id: "v1",
              product_id: "2",
              variant_combinations: { "1": "1-1", "2": "2-1" }, // Red, Small
              sku: "SHIRT-RED-S",
              price_adjustment: 0,
              stock: 25,
              is_active: true,
            },
            {
              id: "v2",
              product_id: "2",
              variant_combinations: { "1": "1-1", "2": "2-2" }, // Red, Medium
              sku: "SHIRT-RED-M",
              price_adjustment: 0,
              stock: 25,
              is_active: true,
            },
            {
              id: "v3",
              product_id: "2",
              variant_combinations: { "1": "1-2", "2": "2-1" }, // Blue, Small
              sku: "SHIRT-BLUE-S",
              price_adjustment: 50,
              stock: 25,
              is_active: true,
            },
            {
              id: "v4",
              product_id: "2",
              variant_combinations: { "1": "1-2", "2": "2-2" }, // Blue, Medium
              sku: "SHIRT-BLUE-M",
              price_adjustment: 50,
              stock: 25,
              is_active: false, // Disabled variant
            },
          ],
          images: [
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop",
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
          has_variants: false,
          images: [
            "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop",
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
      has_variants: false,
      selected_variant_types: [],
      variants: [],
    });
    setCategorySearch("");
    setShowCategorySuggestions(false);
    setSelectedSuggestionIndex(-1);
    setIsDragOver(false);
    onOpen();
  };

  const handleEditProduct = (product: ProductWithVariants) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      stock: product.stock,
      category_id: product.category_id || "",
      status: product.status,
      images: [],
      has_variants: product.has_variants || false,
      selected_variant_types: product.variant_types?.map((vt) => vt.id) || [],
      variants: product.variants || [],
    });

    // Set category search text
    const category = categories.find((c) => c.id === product.category_id);
    setCategorySearch(category?.name || "");
    setShowCategorySuggestions(false);
    setSelectedSuggestionIndex(-1);
    setIsDragOver(false);
    onOpen();
  };

  const handleCloseModal = () => {
    setIsDragOver(false);
    setCategorySearch("");
    setShowCategorySuggestions(false);
    setSelectedSuggestionIndex(-1);
    onClose();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData((prev) => ({ ...prev, images: files }));
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

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (files.length > 0) {
      setFormData((prev) => ({ ...prev, images: files }));
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // Filter categories based on search
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const handleCategorySelect = (category: Category) => {
    setFormData((prev) => ({ ...prev, category_id: category.id }));
    setCategorySearch(category.name);
    setShowCategorySuggestions(false);
  };

  const handleCategoryInputChange = (value: string) => {
    setCategorySearch(value);
    setShowCategorySuggestions(true);
    setSelectedSuggestionIndex(-1);

    // If exact match found, set the category_id
    const exactMatch = categories.find(
      (cat) => cat.name.toLowerCase() === value.toLowerCase()
    );
    if (exactMatch) {
      setFormData((prev) => ({ ...prev, category_id: exactMatch.id }));
    } else {
      setFormData((prev) => ({ ...prev, category_id: "" }));
    }
  };

  const handleCategoryKeyDown = (e: React.KeyboardEvent) => {
    if (!showCategorySuggestions || filteredCategories.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < filteredCategories.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCategories.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          handleCategorySelect(filteredCategories[selectedSuggestionIndex]);
        }
        break;
      case "Escape":
        setShowCategorySuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  // Variant management functions
  const generateVariantCombinations = () => {
    if (formData.selected_variant_types.length === 0) return;

    const selectedTypes = variantTypes.filter(
      (vt) => formData.selected_variant_types.includes(vt.id) && vt.is_active
    );

    if (selectedTypes.length === 0) return;

    // Generate all combinations
    const combinations: ProductVariant[] = [];

    const generateCombinations = (
      typeIndex: number,
      currentCombination: { [key: string]: string }
    ) => {
      if (typeIndex >= selectedTypes.length) {
        // Create variant for this combination
        const variantId = `v-${Date.now()}-${Object.values(
          currentCombination
        ).join("-")}`;
        combinations.push({
          id: variantId,
          product_id: selectedProduct?.id || "new",
          variant_combinations: { ...currentCombination },
          sku: "",
          price_adjustment: 0,
          stock: 0,
          is_active: true,
        });
        return;
      }

      const currentType = selectedTypes[typeIndex];
      currentType.options
        .filter((option) => option.is_active)
        .forEach((option) => {
          generateCombinations(typeIndex + 1, {
            ...currentCombination,
            [currentType.id]: option.id,
          });
        });
    };

    generateCombinations(0, {});

    setFormData((prev) => ({
      ...prev,
      variants: combinations,
    }));
  };

  const updateVariant = (
    variantId: string,
    updates: Partial<ProductVariant>
  ) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((variant) =>
        variant.id === variantId ? { ...variant, ...updates } : variant
      ),
    }));
  };

  const getVariantDisplayName = (variant: ProductVariant) => {
    const names: string[] = [];
    Object.entries(variant.variant_combinations).forEach(
      ([typeId, optionId]) => {
        const variantType = variantTypes.find((vt) => vt.id === typeId);
        const option = variantType?.options.find((opt) => opt.id === optionId);
        if (option) {
          names.push(option.name);
        }
      }
    );
    return names.join(" / ");
  };

  // Variant Type Management Functions
  const handleAddVariantType = () => {
    setSelectedVariantType(null);
    setVariantTypeFormData({
      name: "",
      display_name: "",
      options: [],
    });
    setCurrentOption({ name: "", value: "" });
    onVariantTypeOpen();
  };

  const handleEditVariantType = (variantType: ProductVariantType) => {
    setSelectedVariantType(variantType);
    setVariantTypeFormData({
      name: variantType.name,
      display_name: variantType.display_name,
      options: variantType.options.map((opt) => ({
        name: opt.name,
        value: opt.value,
      })),
    });
    setCurrentOption({ name: "", value: "" });
    onVariantTypeOpen();
  };

  const addOption = () => {
    if (!currentOption.name.trim() || !currentOption.value.trim()) return;

    setVariantTypeFormData((prev) => ({
      ...prev,
      options: [...prev.options, { ...currentOption }],
    }));
    setCurrentOption({ name: "", value: "" });
  };

  const removeOption = (index: number) => {
    setVariantTypeFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const saveVariantType = () => {
    if (
      !variantTypeFormData.name.trim() ||
      variantTypeFormData.options.length === 0
    ) {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณากรอกชื่อและเพิ่มตัวเลือกอย่างน้อย 1 รายการ",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (selectedVariantType) {
      // Update existing variant type
      const updatedVariantType: ProductVariantType = {
        ...selectedVariantType,
        name: variantTypeFormData.name,
        display_name:
          variantTypeFormData.display_name || variantTypeFormData.name,
        options: variantTypeFormData.options.map((opt, index) => ({
          id: `${selectedVariantType.id}-${index + 1}`,
          name: opt.name,
          value: opt.value,
          sort_order: index + 1,
          is_active: true,
        })),
      };

      setVariantTypes((prev) =>
        prev.map((vt) =>
          vt.id === selectedVariantType.id ? updatedVariantType : vt
        )
      );

      toast({
        title: "อัปเดตประเภทตัวแปรสำเร็จ",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      // Add new variant type
      const newVariantType: ProductVariantType = {
        id: Date.now().toString(),
        name: variantTypeFormData.name,
        display_name:
          variantTypeFormData.display_name || variantTypeFormData.name,
        sort_order: variantTypes.length + 1,
        is_active: true,
        options: variantTypeFormData.options.map((opt, index) => ({
          id: `${Date.now()}-${index + 1}`,
          name: opt.name,
          value: opt.value,
          sort_order: index + 1,
          is_active: true,
        })),
      };

      setVariantTypes((prev) => [...prev, newVariantType]);

      toast({
        title: "เพิ่มประเภทตัวแปรสำเร็จ",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }

    onVariantTypeClose();
  };

  const toggleVariantType = (variantTypeId: string) => {
    setVariantTypes((prev) =>
      prev.map((vt) =>
        vt.id === variantTypeId ? { ...vt, is_active: !vt.is_active } : vt
      )
    );
  };

  // Bulk Upload Functions
  const downloadTemplate = () => {
    const headers = [
      "name",
      "description",
      "price",
      "stock",
      "category_name",
      "status",
      "has_variants",
      "sku",
    ];

    const sampleData = [
      [
        "กาแฟลาเต้",
        "กาแฟลาเต้หอมกรุ่น ชงจากเมล็ดกาแฟคุณภาพเยี่ยม",
        "65",
        "50",
        "เครื่องดื่ม",
        "active",
        "false",
        "COFFEE-LATTE-001",
      ],
      [
        "เสื้อยืดผ้าฝ้าย",
        "เสื้อยืดผ้าฝ้าย 100% คุณภาพดี",
        "450",
        "100",
        "เสื้อผ้า",
        "active",
        "false",
        "SHIRT-COTTON-001",
      ],
    ];

    const csvContent = [headers, ...sampleData]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "product_template.csv";
    link.click();
  };

  const handleBulkUpload = async () => {
    if (!uploadFile) return;

    try {
      setUploadProgress(0);
      let data: any[] = [];

      // Parse file based on type
      if (uploadFile.name.match(/\.(csv)$/i)) {
        // Handle CSV
        const text = await uploadFile.text();
        const lines = text.split("\n").filter((line) => line.trim());
        const headers = lines[0]
          .split(",")
          .map((h) => h.replace(/"/g, "").trim());

        data = lines.slice(1).map((line) => {
          const values = line.split(",").map((v) => v.replace(/"/g, "").trim());
          const row: any = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || "";
          });
          return row;
        });
      } else if (uploadFile.name.match(/\.(xlsx|xls)$/i)) {
        // Handle Excel
        const buffer = await uploadFile.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        data = XLSX.utils.sheet_to_json(worksheet);
      }

      const results = {
        success: 0,
        errors: [] as { row: number; message: string }[],
      };

      for (let i = 0; i < data.length; i++) {
        try {
          const productData = data[i];

          // Validate required fields
          if (!productData.name && !productData.Name) {
            results.errors.push({
              row: i + 2,
              message: "ชื่อสินค้าไม่ได้กรอก",
            });
            continue;
          }

          // Find category by name
          const categoryName =
            productData.category_name || productData["Category Name"] || "";
          const category = categories.find(
            (c) => c.name.toLowerCase() === categoryName.toLowerCase()
          );

          const newProduct: ProductWithVariants = {
            id: Date.now().toString() + i,
            name: productData.name || productData.Name || "",
            description:
              productData.description || productData.Description || "",
            price: parseFloat(productData.price || productData.Price || 0),
            stock: parseInt(productData.stock || productData.Stock || 0),
            category_id: category?.id,
            status: (productData.status ||
              productData.Status ||
              "active") as ProductStatus,
            has_variants:
              (
                productData.has_variants ||
                productData["Has Variants"] ||
                "false"
              )
                .toString()
                .toLowerCase() === "true",
            images: [],
          };

          setProducts((prev) => [newProduct, ...prev]);
          results.success++;
        } catch (error) {
          results.errors.push({
            row: i + 2,
            message: error instanceof Error ? error.message : "เกิดข้อผิดพลาด",
          });
        }

        setUploadProgress(((i + 1) / data.length) * 100);
      }

      setUploadResults(results);

      toast({
        title: "อัพโหลดสำเร็จ",
        description: `เพิ่มสินค้า ${results.success} รายการ${
          results.errors.length > 0
            ? ` มีข้อผิดพลาด ${results.errors.length} รายการ`
            : ""
        }`,
        status: results.errors.length === 0 ? "success" : "warning",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอ่านไฟล์ได้",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleUploadFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];

      if (
        !validTypes.includes(file.type) &&
        !file.name.match(/\.(csv|xlsx|xls)$/i)
      ) {
        toast({
          title: "ไฟล์ไม่ถูกต้อง",
          description: "กรุณาเลือกไฟล์ CSV หรือ Excel เท่านั้น",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setUploadFile(file);
      setUploadResults(null);
      setUploadProgress(0);
    }
  };

  const handleSaveProduct = async () => {
    try {
      // Convert File[] to string[] URLs (in real app, upload to server first)
      const imageUrls = formData.images.map((file) =>
        URL.createObjectURL(file)
      );

      if (selectedProduct) {
        // Update existing product
        const updatedProduct: ProductWithVariants = {
          ...selectedProduct,
          name: formData.name,
          description: formData.description,
          price: formData.price,
          stock: formData.stock,
          category_id: formData.category_id || undefined,
          status: formData.status,
          has_variants: formData.has_variants,
          variants: formData.has_variants ? formData.variants : undefined,
          variant_types: formData.has_variants
            ? variantTypes.filter((vt) =>
                formData.selected_variant_types.includes(vt.id)
              )
            : undefined,
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
        const newProduct: ProductWithVariants = {
          id: Date.now().toString(),
          name: formData.name,
          description: formData.description,
          price: formData.price,
          stock: formData.stock,
          category_id: formData.category_id || undefined,
          status: formData.status,
          has_variants: formData.has_variants,
          variants: formData.has_variants ? formData.variants : undefined,
          variant_types: formData.has_variants
            ? variantTypes.filter((vt) =>
                formData.selected_variant_types.includes(vt.id)
              )
            : undefined,
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

      setIsDragOver(false);
      handleCloseModal();
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

  const handleDeleteClick = (product: ProductWithVariants) => {
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
        <HStack spacing={3}>
          <Button
            leftIcon={<FiUpload />}
            colorScheme="green"
            variant="outline"
            onClick={onBulkUploadOpen}
          >
            อัพโหลดสินค้าจากไฟล์
          </Button>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="blue"
            onClick={handleAddProduct}
          >
            เพิ่มสินค้าใหม่
          </Button>
        </HStack>
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
                  <Th fontFamily="heading">ตัวแปร</Th>
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
                      {product.has_variants ? (
                        <VStack align="start" spacing={1}>
                          <Badge colorScheme="purple" variant="solid" size="sm">
                            <HStack spacing={1}>
                              <FiLayers size={12} />
                              <Text>
                                {product.variants?.length || 0} ตัวแปร
                              </Text>
                            </HStack>
                          </Badge>
                          {product.variants && product.variants.length > 0 && (
                            <Text
                              fontSize="xs"
                              color="gray.500"
                              fontFamily="body"
                            >
                              ใช้งาน:{" "}
                              {
                                product.variants.filter((v) => v.is_active)
                                  .length
                              }
                            </Text>
                          )}
                        </VStack>
                      ) : (
                        <Text fontSize="xs" color="gray.400" fontFamily="body">
                          ไม่มีตัวแปร
                        </Text>
                      )}
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
      <Modal isOpen={isOpen} onClose={handleCloseModal} size="2xl">
        <ModalOverlay />
        <ModalContent maxW="800px">
          <ModalHeader fontFamily="heading">
            {selectedProduct ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
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
                <Box position="relative">
                  <InputGroup>
                    <InputLeftElement>
                      <FiSearch color="gray.400" />
                    </InputLeftElement>
                    <Input
                      value={categorySearch}
                      onChange={(e) =>
                        handleCategoryInputChange(e.target.value)
                      }
                      onKeyDown={handleCategoryKeyDown}
                      onFocus={() => setShowCategorySuggestions(true)}
                      onBlur={() => {
                        // Delay hiding suggestions to allow for clicks
                        setTimeout(() => {
                          setShowCategorySuggestions(false);
                          setSelectedSuggestionIndex(-1);
                        }, 150);
                      }}
                      placeholder="ค้นหาหรือพิมพ์ชื่อหมวดหมู่..."
                      fontFamily="body"
                      autoComplete="off"
                      pl={10}
                      pr={categorySearch ? 10 : 4}
                    />
                    {categorySearch && (
                      <InputRightElement>
                        <IconButton
                          aria-label="Clear search"
                          icon={<FiX />}
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setCategorySearch("");
                            setFormData((prev) => ({
                              ...prev,
                              category_id: "",
                            }));
                            setShowCategorySuggestions(false);
                          }}
                        />
                      </InputRightElement>
                    )}
                  </InputGroup>

                  {/* Category Suggestions Dropdown */}
                  {showCategorySuggestions && filteredCategories.length > 0 && (
                    <Box
                      position="absolute"
                      top="100%"
                      left={0}
                      right={0}
                      bg="white"
                      border="1px solid"
                      borderColor="gray.200"
                      borderRadius="md"
                      shadow="lg"
                      maxH="200px"
                      overflowY="auto"
                      zIndex={1000}
                      mt={1}
                    >
                      {filteredCategories.map((category, index) => (
                        <Box
                          key={category.id}
                          p={3}
                          cursor="pointer"
                          bg={
                            index === selectedSuggestionIndex
                              ? "blue.50"
                              : "transparent"
                          }
                          _hover={{ bg: "gray.50" }}
                          onClick={() => handleCategorySelect(category)}
                          borderBottom="1px solid"
                          borderBottomColor="gray.100"
                          _last={{ borderBottom: "none" }}
                        >
                          <Text
                            fontFamily="body"
                            fontSize="sm"
                            color={
                              index === selectedSuggestionIndex
                                ? "blue.600"
                                : "gray.700"
                            }
                            fontWeight={
                              index === selectedSuggestionIndex
                                ? "medium"
                                : "normal"
                            }
                          >
                            {category.name}
                          </Text>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {/* No results message */}
                  {showCategorySuggestions &&
                    categorySearch &&
                    filteredCategories.length === 0 && (
                      <Box
                        position="absolute"
                        top="100%"
                        left={0}
                        right={0}
                        bg="white"
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="md"
                        shadow="lg"
                        zIndex={1000}
                        mt={1}
                        p={3}
                      >
                        <Text
                          fontFamily="body"
                          fontSize="sm"
                          color="gray.500"
                          textAlign="center"
                        >
                          ไม่พบหมวดหมู่ที่ตรงกับการค้นหา
                        </Text>
                      </Box>
                    )}
                </Box>

                {/* Selected category display */}
                {formData.category_id && (
                  <Text
                    fontSize="xs"
                    color="green.600"
                    mt={1}
                    fontFamily="body"
                  >
                    ✓ เลือกแล้ว: {getCategoryName(formData.category_id)}
                  </Text>
                )}
              </FormControl>

              <FormControl>
                <FormLabel fontFamily="heading">รูปภาพสินค้า</FormLabel>

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
                    document.getElementById("image-upload")?.click()
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
                        รองรับไฟล์ JPG, PNG, GIF ขนาดไม่เกิน 5MB ต่อไฟล์
                      </Text>
                    </VStack>
                  </VStack>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    display="none"
                  />
                </Box>

                {/* Image Previews */}
                {formData.images.length > 0 && (
                  <Box mt={4}>
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      mb={3}
                      color="gray.700"
                      fontFamily="heading"
                    >
                      รูปภาพที่เลือก ({formData.images.length} ไฟล์)
                    </Text>
                    <HStack spacing={3} flexWrap="wrap">
                      {formData.images.map((file, index) => (
                        <Box
                          key={index}
                          position="relative"
                          borderRadius="lg"
                          overflow="hidden"
                          border="1px solid"
                          borderColor="gray.200"
                          bg="white"
                          shadow="sm"
                        >
                          <Image
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            boxSize="120px"
                            objectFit="cover"
                          />
                          <Box
                            position="absolute"
                            top={1}
                            right={1}
                            bg="red.500"
                            borderRadius="full"
                            p={1}
                            cursor="pointer"
                            _hover={{ bg: "red.600" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(index);
                            }}
                          >
                            <FiX size={12} color="white" />
                          </Box>
                          <Box
                            position="absolute"
                            bottom={0}
                            left={0}
                            right={0}
                            bg="blackAlpha.700"
                            color="white"
                            p={2}
                            fontSize="xs"
                            fontFamily="body"
                          >
                            <Text noOfLines={1}>{file.name}</Text>
                            <Text color="gray.300">
                              {(file.size / 1024 / 1024).toFixed(1)} MB
                            </Text>
                          </Box>
                        </Box>
                      ))}
                    </HStack>
                  </Box>
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
                  placeholder="เลือกสถานะ"
                  bg="white"
                  borderColor="gray.200"
                  _hover={{ borderColor: "gray.300" }}
                  _focus={{
                    borderColor: "blue.500",
                    boxShadow: "0 0 0 1px blue.500",
                  }}
                >
                  <option value="active">ใช้งาน</option>
                  <option value="inactive">ปิดใช้งาน</option>
                  <option value="out_of_stock">หมด</option>
                </Select>
              </FormControl>

              {/* Product Variants Section */}
              <Divider />

              <FormControl>
                <HStack justify="space-between" align="center" mb={4}>
                  <VStack align="start" spacing={1}>
                    <FormLabel fontFamily="heading" mb={0}>
                      <HStack>
                        <FiLayers />
                        <Text>ตัวแปรสินค้า (Product Variants)</Text>
                      </HStack>
                    </FormLabel>
                    <Text fontSize="xs" color="gray.500" fontFamily="body">
                      เปิดใช้งานเพื่อสร้างตัวแปรสินค้า เช่น สี, ขนาด
                    </Text>
                  </VStack>
                  <Switch
                    isChecked={formData.has_variants}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        has_variants: e.target.checked,
                        selected_variant_types: e.target.checked
                          ? prev.selected_variant_types
                          : [],
                        variants: e.target.checked ? prev.variants : [],
                      }));
                    }}
                    colorScheme="blue"
                  />
                </HStack>

                {formData.has_variants && (
                  <VStack spacing={4} align="stretch">
                    {/* Variant Types Selection */}
                    <Box>
                      <Flex justify="space-between" align="center" mb={3}>
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          fontFamily="heading"
                        >
                          เลือกประเภทตัวแปร
                        </Text>
                        <Button
                          size="xs"
                          colorScheme="blue"
                          variant="outline"
                          onClick={handleAddVariantType}
                          leftIcon={<FiSettings />}
                        >
                          จัดการประเภทตัวแปร
                        </Button>
                      </Flex>
                      <SimpleGrid columns={2} spacing={3}>
                        {variantTypes
                          .filter((vt) => vt.is_active)
                          .map((variantType) => (
                            <Box
                              key={variantType.id}
                              p={3}
                              border="1px solid"
                              borderColor={
                                formData.selected_variant_types.includes(
                                  variantType.id
                                )
                                  ? "blue.300"
                                  : "gray.200"
                              }
                              borderRadius="md"
                              bg={
                                formData.selected_variant_types.includes(
                                  variantType.id
                                )
                                  ? "blue.50"
                                  : "white"
                              }
                              cursor="pointer"
                              _hover={{ borderColor: "blue.300" }}
                              onClick={() => {
                                const isSelected =
                                  formData.selected_variant_types.includes(
                                    variantType.id
                                  );
                                setFormData((prev) => ({
                                  ...prev,
                                  selected_variant_types: isSelected
                                    ? prev.selected_variant_types.filter(
                                        (id) => id !== variantType.id
                                      )
                                    : [
                                        ...prev.selected_variant_types,
                                        variantType.id,
                                      ],
                                  variants: [], // Reset variants when changing types
                                }));
                              }}
                            >
                              <HStack spacing={2}>
                                <Box
                                  w={4}
                                  h={4}
                                  borderRadius="sm"
                                  bg={
                                    formData.selected_variant_types.includes(
                                      variantType.id
                                    )
                                      ? "blue.500"
                                      : "gray.200"
                                  }
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="center"
                                >
                                  {formData.selected_variant_types.includes(
                                    variantType.id
                                  ) && (
                                    <Box
                                      w={2}
                                      h={2}
                                      bg="white"
                                      borderRadius="xs"
                                    />
                                  )}
                                </Box>
                                <VStack align="start" spacing={0} flex={1}>
                                  <Text
                                    fontSize="sm"
                                    fontWeight="medium"
                                    fontFamily="body"
                                  >
                                    {variantType.name}
                                  </Text>
                                  <Text
                                    fontSize="xs"
                                    color="gray.500"
                                    fontFamily="body"
                                  >
                                    {
                                      variantType.options.filter(
                                        (opt) => opt.is_active
                                      ).length
                                    }{" "}
                                    ตัวเลือก
                                  </Text>
                                </VStack>
                              </HStack>
                            </Box>
                          ))}
                      </SimpleGrid>
                    </Box>

                    {/* Generate Variants Button */}
                    {formData.selected_variant_types.length > 0 && (
                      <Button
                        leftIcon={<FiSettings />}
                        onClick={generateVariantCombinations}
                        variant="outline"
                        colorScheme="blue"
                        size="sm"
                      >
                        สร้างตัวแปรอัตโนมัติ (
                        {variantTypes
                          .filter((vt) =>
                            formData.selected_variant_types.includes(vt.id)
                          )
                          .reduce(
                            (acc, vt) =>
                              acc *
                              vt.options.filter((opt) => opt.is_active).length,
                            1
                          )}{" "}
                        ตัวแปร)
                      </Button>
                    )}

                    {/* Variants List */}
                    {formData.variants.length > 0 && (
                      <Accordion allowToggle>
                        <AccordionItem>
                          <AccordionButton>
                            <Box flex="1" textAlign="left">
                              <Text fontWeight="medium" fontFamily="heading">
                                ตัวแปรสินค้า ({formData.variants.length} รายการ)
                              </Text>
                            </Box>
                            <AccordionIcon />
                          </AccordionButton>
                          <AccordionPanel pb={4}>
                            <VStack spacing={3} align="stretch">
                              {formData.variants.map((variant, index) => (
                                <Box
                                  key={variant.id}
                                  p={4}
                                  border="1px solid"
                                  borderColor="gray.200"
                                  borderRadius="md"
                                  bg={variant.is_active ? "white" : "gray.50"}
                                >
                                  <VStack spacing={3} align="stretch">
                                    <HStack
                                      justify="space-between"
                                      align="center"
                                    >
                                      <VStack align="start" spacing={0}>
                                        <Text
                                          fontSize="sm"
                                          fontWeight="medium"
                                          fontFamily="body"
                                        >
                                          {getVariantDisplayName(variant)}
                                        </Text>
                                        <Text
                                          fontSize="xs"
                                          color="gray.500"
                                          fontFamily="body"
                                        >
                                          ตัวแปรที่ {index + 1}
                                        </Text>
                                      </VStack>
                                      <Switch
                                        isChecked={variant.is_active}
                                        onChange={(e) =>
                                          updateVariant(variant.id, {
                                            is_active: e.target.checked,
                                          })
                                        }
                                        size="sm"
                                        colorScheme="blue"
                                      />
                                    </HStack>

                                    <SimpleGrid columns={3} spacing={3}>
                                      <FormControl>
                                        <FormLabel
                                          fontSize="xs"
                                          fontFamily="heading"
                                        >
                                          SKU
                                        </FormLabel>
                                        <Input
                                          size="sm"
                                          value={variant.sku || ""}
                                          onChange={(e) =>
                                            updateVariant(variant.id, {
                                              sku: e.target.value,
                                            })
                                          }
                                          placeholder="SKU"
                                          fontFamily="body"
                                          bg="white"
                                        />
                                      </FormControl>

                                      <FormControl>
                                        <FormLabel
                                          fontSize="xs"
                                          fontFamily="heading"
                                        >
                                          ปรับราคา (±)
                                        </FormLabel>
                                        <NumberInput
                                          size="sm"
                                          value={variant.price_adjustment}
                                          onChange={(value) =>
                                            updateVariant(variant.id, {
                                              price_adjustment:
                                                Number(value) || 0,
                                            })
                                          }
                                        >
                                          <NumberInputField
                                            placeholder="0"
                                            fontFamily="body"
                                            bg="white"
                                          />
                                          <NumberInputStepper>
                                            <NumberIncrementStepper />
                                            <NumberDecrementStepper />
                                          </NumberInputStepper>
                                        </NumberInput>
                                      </FormControl>

                                      <FormControl>
                                        <FormLabel
                                          fontSize="xs"
                                          fontFamily="heading"
                                        >
                                          จำนวนสต็อก
                                        </FormLabel>
                                        <NumberInput
                                          size="sm"
                                          value={variant.stock}
                                          onChange={(value) =>
                                            updateVariant(variant.id, {
                                              stock: Number(value) || 0,
                                            })
                                          }
                                          min={0}
                                        >
                                          <NumberInputField
                                            placeholder="0"
                                            fontFamily="body"
                                            bg="white"
                                          />
                                          <NumberInputStepper>
                                            <NumberIncrementStepper />
                                            <NumberDecrementStepper />
                                          </NumberInputStepper>
                                        </NumberInput>
                                      </FormControl>
                                    </SimpleGrid>

                                    <Box>
                                      <Text
                                        fontSize="xs"
                                        color="blue.600"
                                        fontFamily="body"
                                      >
                                        ราคาขาย: ฿
                                        {(
                                          formData.price +
                                          variant.price_adjustment
                                        ).toLocaleString()}
                                      </Text>
                                    </Box>
                                  </VStack>
                                </Box>
                              ))}
                            </VStack>
                          </AccordionPanel>
                        </AccordionItem>
                      </Accordion>
                    )}
                  </VStack>
                )}
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleCloseModal}>
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

      {/* Variant Type Management Modal */}
      <Modal isOpen={isVariantTypeOpen} onClose={onVariantTypeClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontFamily="heading">
            {selectedVariantType
              ? "แก้ไขประเภทตัวแปร"
              : "เพิ่มประเภทตัวแปรใหม่"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel fontFamily="heading">
                  ชื่อประเภท (Internal Name)
                </FormLabel>
                <Input
                  value={variantTypeFormData.name}
                  onChange={(e) =>
                    setVariantTypeFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="เช่น flavor, size, material"
                  fontFamily="body"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontFamily="heading">
                  ชื่อที่แสดง (Display Name)
                </FormLabel>
                <Input
                  value={variantTypeFormData.display_name}
                  onChange={(e) =>
                    setVariantTypeFormData((prev) => ({
                      ...prev,
                      display_name: e.target.value,
                    }))
                  }
                  placeholder="เช่น รสชาติ, ขนาด, วัสดุ"
                  fontFamily="body"
                />
                <FormHelperText>หากไม่กรอก จะใช้ชื่อประเภทแทน</FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel fontFamily="heading">ตัวเลือก</FormLabel>
                <VStack spacing={2} align="stretch">
                  <HStack>
                    <Input
                      placeholder="ชื่อตัวเลือก (เช่น แดง, เล็ก)"
                      value={currentOption.name}
                      onChange={(e) =>
                        setCurrentOption((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      fontFamily="body"
                    />
                    <Input
                      placeholder="ค่า (เช่น red, small)"
                      value={currentOption.value}
                      onChange={(e) =>
                        setCurrentOption((prev) => ({
                          ...prev,
                          value: e.target.value,
                        }))
                      }
                      fontFamily="body"
                    />
                    <Button onClick={addOption} colorScheme="blue" size="sm">
                      เพิ่ม
                    </Button>
                  </HStack>

                  {variantTypeFormData.options.map((option, index) => (
                    <HStack key={index} p={2} bg="gray.50" borderRadius="md">
                      <Text fontFamily="body" flex={1}>
                        {option.name} ({option.value})
                      </Text>
                      <Button
                        size="xs"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => removeOption(index)}
                      >
                        ลบ
                      </Button>
                    </HStack>
                  ))}

                  {variantTypeFormData.options.length === 0 && (
                    <Text
                      fontSize="sm"
                      color="gray.500"
                      textAlign="center"
                      py={4}
                    >
                      ยังไม่มีตัวเลือก กรุณาเพิ่มตัวเลือกอย่างน้อย 1 รายการ
                    </Text>
                  )}
                </VStack>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onVariantTypeClose}>
              ยกเลิก
            </Button>
            <Button colorScheme="blue" onClick={saveVariantType}>
              {selectedVariantType ? "อัปเดต" : "เพิ่ม"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Bulk Upload Modal */}
      <Modal isOpen={isBulkUploadOpen} onClose={onBulkUploadClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontFamily="heading">อัพโหลดสินค้าจากไฟล์</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={6} align="stretch">
              {/* Template Download Section */}
              <Box>
                <Text fontWeight="medium" mb={3} fontFamily="heading">
                  1. ดาวน์โหลด Template
                </Text>
                <Text fontSize="sm" color="gray.600" mb={4} fontFamily="body">
                  ดาวน์โหลดไฟล์ตัวอย่างเพื่อใช้เป็นแนวทางในการจัดรูปแบบข้อมูล
                </Text>
                <Button
                  leftIcon={<FiDownload />}
                  colorScheme="blue"
                  variant="outline"
                  onClick={downloadTemplate}
                  size="sm"
                >
                  ดาวน์โหลด CSV Template
                </Button>
              </Box>

              <Divider />

              {/* File Upload Section */}
              <Box>
                <Text fontWeight="medium" mb={3} fontFamily="heading">
                  2. เลือกไฟล์เพื่ออัพโหลด
                </Text>
                <Text fontSize="sm" color="gray.600" mb={4} fontFamily="body">
                  รองรับไฟล์ CSV และ Excel (.xlsx, .xls)
                </Text>

                <Box
                  border="2px dashed"
                  borderColor="gray.300"
                  borderRadius="lg"
                  p={6}
                  textAlign="center"
                  bg="gray.50"
                  cursor="pointer"
                  _hover={{ borderColor: "blue.400", bg: "blue.50" }}
                  onClick={() =>
                    document.getElementById("bulk-upload")?.click()
                  }
                >
                  <VStack spacing={3}>
                    <Box
                      p={3}
                      borderRadius="full"
                      bg="gray.100"
                      color="gray.500"
                    >
                      <FiUpload size={24} />
                    </Box>
                    <VStack spacing={1}>
                      <Text
                        fontWeight="medium"
                        color="gray.700"
                        fontFamily="body"
                      >
                        {uploadFile ? uploadFile.name : "คลิกเพื่อเลือกไฟล์"}
                      </Text>
                      <Text fontSize="sm" color="gray.500" fontFamily="body">
                        รองรับไฟล์ CSV, Excel (.xlsx, .xls)
                      </Text>
                    </VStack>
                  </VStack>
                  <Input
                    id="bulk-upload"
                    type="file"
                    accept=".csv,.xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={handleUploadFileChange}
                    display="none"
                  />
                </Box>

                {uploadFile && (
                  <HStack mt={3} p={3} bg="blue.50" borderRadius="md">
                    <FiFile color="blue" />
                    <VStack align="start" spacing={0} flex={1}>
                      <Text fontSize="sm" fontWeight="medium" fontFamily="body">
                        {uploadFile.name}
                      </Text>
                      <Text fontSize="xs" color="gray.600" fontFamily="body">
                        {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                      </Text>
                    </VStack>
                    <IconButton
                      aria-label="Remove file"
                      icon={<FiX />}
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setUploadFile(null);
                        setUploadResults(null);
                        setUploadProgress(0);
                      }}
                    />
                  </HStack>
                )}
              </Box>

              {/* Upload Progress */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <Box>
                  <Text fontSize="sm" mb={2} fontFamily="body">
                    กำลังประมวลผล... {uploadProgress.toFixed(0)}%
                  </Text>
                  <Progress
                    value={uploadProgress}
                    colorScheme="blue"
                    size="sm"
                  />
                </Box>
              )}

              {/* Upload Results */}
              {uploadResults && (
                <Box>
                  <Text fontWeight="medium" mb={3} fontFamily="heading">
                    ผลลัพธ์การอัพโหลด
                  </Text>
                  <VStack spacing={3} align="stretch">
                    <HStack>
                      <Badge colorScheme="green" px={3} py={1}>
                        สำเร็จ: {uploadResults.success} รายการ
                      </Badge>
                      {uploadResults.errors.length > 0 && (
                        <Badge colorScheme="red" px={3} py={1}>
                          ข้อผิดพลาด: {uploadResults.errors.length} รายการ
                        </Badge>
                      )}
                    </HStack>

                    {uploadResults.errors.length > 0 && (
                      <Box>
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          mb={2}
                          color="red.600"
                          fontFamily="heading"
                        >
                          รายการที่มีข้อผิดพลาด:
                        </Text>
                        <Box maxH="200px" overflowY="auto">
                          <VStack spacing={1} align="stretch">
                            {uploadResults.errors.map((error, index) => (
                              <Box
                                key={index}
                                p={2}
                                bg="red.50"
                                borderRadius="md"
                                border="1px solid"
                                borderColor="red.200"
                              >
                                <Text
                                  fontSize="xs"
                                  color="red.700"
                                  fontFamily="body"
                                >
                                  แถว {error.row}: {error.message}
                                </Text>
                              </Box>
                            ))}
                          </VStack>
                        </Box>
                      </Box>
                    )}
                  </VStack>
                </Box>
              )}

              {/* Template Format Info */}
              <Box>
                <Text fontWeight="medium" mb={3} fontFamily="heading">
                  รูปแบบไฟล์ Template
                </Text>
                <Box bg="gray.50" p={4} borderRadius="md">
                  <VStack spacing={2} align="start">
                    <Text fontSize="sm" fontFamily="body">
                      <strong>name</strong> - ชื่อสินค้า (จำเป็น)
                    </Text>
                    <Text fontSize="sm" fontFamily="body">
                      <strong>description</strong> - คำอธิบายสินค้า
                    </Text>
                    <Text fontSize="sm" fontFamily="body">
                      <strong>price</strong> - ราคา (ตัวเลข)
                    </Text>
                    <Text fontSize="sm" fontFamily="body">
                      <strong>stock</strong> - จำนวนคงคลัง (ตัวเลข)
                    </Text>
                    <Text fontSize="sm" fontFamily="body">
                      <strong>category_name</strong> - ชื่อหมวดหมู่
                    </Text>
                    <Text fontSize="sm" fontFamily="body">
                      <strong>status</strong> - สถานะ (active, inactive,
                      out_of_stock)
                    </Text>
                    <Text fontSize="sm" fontFamily="body">
                      <strong>has_variants</strong> - มีตัวแปรหรือไม่ (true,
                      false)
                    </Text>
                    <Text fontSize="sm" fontFamily="body">
                      <strong>sku</strong> - รหัสสินค้า
                    </Text>
                  </VStack>
                </Box>
              </Box>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onBulkUploadClose}>
              ยกเลิก
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleBulkUpload}
              isDisabled={!uploadFile}
              leftIcon={<FiUpload />}
            >
              อัพโหลด
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

// Use layout
ProductsPage.getLayout = function getLayout(page: ReactElement) {
  return <Layout title="จัดการสินค้า">{page}</Layout>;
};

export default withAuth(ProductsPage, "staff");
