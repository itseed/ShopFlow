import { Product } from "@shopflow/types";
import { SalesProduct } from "@shopflow/types";

/**
 * Converts a Product from the shared API to a SalesProduct for POS use
 */
export const convertProductToSalesProduct = (
  product: Product
): SalesProduct => {
  return {
    id: product.id,
    name: product.name,
    description: product.description || "",
    price: product.price,
    barcode: product.sku || "", // Use SKU as barcode for now
    category: product.category?.name || "Uncategorized",
    stock: product.stock,
    isActive: product.status === "active",
    taxRate: 0.07, // Default tax rate, can be made configurable
    discountEligible: true, // Default to true, can be made configurable
    createdAt: product.created_at ? new Date(product.created_at) : new Date(),
    updatedAt: product.updated_at ? new Date(product.updated_at) : new Date(),
    // For now, we'll handle variants as false until we implement variant support
    hasVariants: false,
    variants: undefined,
  };
};

/**
 * Converts an array of Products to SalesProducts
 */
export const convertProductsToSalesProducts = (
  products: Product[]
): SalesProduct[] => {
  return products.map(convertProductToSalesProduct);
};

/**
 * Mock products fallback when API is not available
 */
export const createMockSalesProducts = (): SalesProduct[] => {
  return [
    {
      id: "mock-1",
      name: "Coca Cola - 330ml",
      description: "Refreshing cola drink",
      price: 1.5,
      barcode: "1234567890123",
      category: "Beverages",
      stock: 100,
      isActive: true,
      taxRate: 0.1,
      discountEligible: true,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: "mock-2",
      name: "กาแฟเย็น",
      description: "กาแฟเย็นสดชื่น เลือกขนาดได้",
      price: 40,
      barcode: "9999999999999",
      category: "Drinks",
      stock: 50,
      isActive: true,
      taxRate: 0.07,
      discountEligible: true,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      hasVariants: true,
      variants: [
        {
          id: "mock-2a",
          product_id: "mock-2",
          variant_combinations: { size: "S" },
          price_adjustment: -5,
          stock: 10,
          is_active: true,
        },
        {
          id: "mock-2b",
          product_id: "mock-2",
          variant_combinations: { size: "M" },
          price_adjustment: 0,
          stock: 15,
          is_active: true,
        },
        {
          id: "mock-2c",
          product_id: "mock-2",
          variant_combinations: { size: "L" },
          price_adjustment: 10,
          stock: 8,
          is_active: true,
        },
      ],
    },
    {
      id: "mock-3",
      name: "เสื้อยืด",
      description: "เสื้อยืดผ้าคอตตอน หลายสีหลายไซส์",
      price: 200,
      barcode: "8888888888888",
      category: "Clothing",
      stock: 30,
      isActive: true,
      taxRate: 0.07,
      discountEligible: true,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
      hasVariants: true,
      variants: [
        {
          id: "mock-3a",
          product_id: "mock-3",
          variant_combinations: { size: "S", color: "แดง" },
          price_adjustment: 0,
          stock: 5,
          is_active: true,
        },
        {
          id: "mock-3b",
          product_id: "mock-3",
          variant_combinations: { size: "M", color: "แดง" },
          price_adjustment: 0,
          stock: 10,
          is_active: true,
        },
        {
          id: "mock-3c",
          product_id: "mock-3",
          variant_combinations: { size: "L", color: "แดง" },
          price_adjustment: 20,
          stock: 8,
          is_active: true,
        },
      ],
    },
  ];
};
