import {
  SalesProduct,
  SalesCart,
  SalesCartItem,
  SalesTransaction,
  SalesPayment,
  SalesProductSearchFilters,
} from "@shopflow/types";

// Mock Products for development
export const mockProducts: SalesProduct[] = [
  {
    id: "1",
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
    id: "9",
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
      { id: "9a", product_id: "9", variant_combinations: { size: "S" }, price_adjustment: -5, stock: 10, is_active: true },
      { id: "9b", product_id: "9", variant_combinations: { size: "M" }, price_adjustment: 0, stock: 20, is_active: true },
      { id: "9c", product_id: "9", variant_combinations: { size: "L" }, price_adjustment: 10, stock: 20, is_active: true },
    ],
  },
  {
    id: "2",
    name: "Fresh Bread - White",
    description: "Freshly baked white bread",
    price: 2.25,
    barcode: "2345678901234",
    category: "Bakery",
    stock: 50,
    isActive: true,
    taxRate: 0.0,
    discountEligible: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "3",
    name: "Milk - 1L",
    description: "Fresh whole milk",
    price: 3.0,
    barcode: "3456789012345",
    category: "Dairy",
    stock: 30,
    isActive: true,
    taxRate: 0.0,
    discountEligible: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "4",
    name: "Bananas - 1kg",
    description: "Fresh yellow bananas",
    price: 2.5,
    barcode: "4567890123456",
    category: "Fruits",
    stock: 75,
    isActive: true,
    taxRate: 0.0,
    discountEligible: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "5",
    name: "Chicken Breast - 500g",
    description: "Fresh chicken breast",
    price: 8.99,
    barcode: "5678901234567",
    category: "Meat",
    stock: 25,
    isActive: true,
    taxRate: 0.0,
    discountEligible: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "6",
    name: "Rice - 2kg",
    description: "Premium jasmine rice",
    price: 6.75,
    barcode: "6789012345678",
    category: "Pantry",
    stock: 40,
    isActive: true,
    taxRate: 0.0,
    discountEligible: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "7",
    name: "Chocolate Bar",
    description: "Milk chocolate bar",
    price: 2.99,
    barcode: "7890123456789",
    category: "Snacks",
    stock: 60,
    isActive: true,
    taxRate: 0.1,
    discountEligible: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "8",
    name: "Apples - 1kg",
    description: "Fresh red apples",
    price: 3.99,
    barcode: "8901234567890",
    category: "Fruits",
    stock: 45,
    isActive: true,
    taxRate: 0.1,
    discountEligible: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "10",
    name: "ชาเย็น",
    description: "ชาเย็นไทย เลือกขนาดและความหวานได้",
    price: 35,
    barcode: "8888888888888",
    category: "Drinks",
    stock: 40,
    isActive: true,
    taxRate: 0.07,
    discountEligible: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    hasVariants: true,
    variants: [
      { id: "10a", product_id: "10", variant_combinations: { size: "S", sweetness: "หวานน้อย" }, price_adjustment: 0, stock: 10, is_active: true },
      { id: "10b", product_id: "10", variant_combinations: { size: "S", sweetness: "ปกติ" }, price_adjustment: 0, stock: 10, is_active: true },
      { id: "10c", product_id: "10", variant_combinations: { size: "M", sweetness: "หวานน้อย" }, price_adjustment: 5, stock: 10, is_active: true },
      { id: "10d", product_id: "10", variant_combinations: { size: "M", sweetness: "ปกติ" }, price_adjustment: 5, stock: 10, is_active: true },
    ],
  },
];

// Storage keys
const CART_KEY = "pos_cart";
const TRANSACTION_KEY = "pos_current_transaction";

// Cart utilities
export const createEmptyCart = (): SalesCart => ({
  id: `cart_${Date.now()}`,
  items: [],
  subtotal: 0,
  discountAmount: 0,
  taxAmount: 0,
  total: 0,
  itemCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const calculateCartItemTotal = (item: SalesCartItem): SalesCartItem => {
  const subtotal = item.unitPrice * item.quantity;
  const discountAmount =
    item.discountPercentage > 0
      ? subtotal * (item.discountPercentage / 100)
      : item.discountAmount;
  const discountedSubtotal = subtotal - discountAmount;
  const taxAmount = discountedSubtotal * item.product.taxRate;
  const total = discountedSubtotal + taxAmount;

  return {
    ...item,
    subtotal,
    discountAmount,
    taxAmount,
    total,
  };
};

export const calculateCartTotals = (cart: SalesCart): SalesCart => {
  const updatedItems = cart.items.map(calculateCartItemTotal);

  const subtotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const discountAmount = updatedItems.reduce(
    (sum, item) => sum + item.discountAmount,
    0
  );
  const taxAmount = updatedItems.reduce((sum, item) => sum + item.taxAmount, 0);
  const total = updatedItems.reduce((sum, item) => sum + item.total, 0);
  const itemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    ...cart,
    items: updatedItems,
    subtotal,
    discountAmount,
    taxAmount,
    total,
    itemCount,
    updatedAt: new Date(),
  };
};

// Product search and filtering
export const searchProducts = async (
  filters: SalesProductSearchFilters,
  sortBy: "name" | "price" | "category" = "name"
): Promise<SalesProduct[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  let results = [...mockProducts];

  // Filter by search term
  if (filters.searchTerm) {
    const searchLower = filters.searchTerm.toLowerCase();
    results = results.filter(
      (product) =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower) ||
        product.barcode?.toLowerCase().includes(searchLower)
    );
  }

  // Filter by category
  if (filters.category) {
    results = results.filter(
      (product) => product.category === filters.category
    );
  }

  // Filter by barcode
  if (filters.barcode) {
    results = results.filter((product) => product.barcode === filters.barcode);
  }

  // Filter by stock status
  if (filters.inStock !== undefined) {
    results = results.filter((product) =>
      filters.inStock ? product.stock > 0 : product.stock <= 0
    );
  }

  // Filter by price range
  if (filters.priceRange) {
    const { min, max } = filters.priceRange;
    results = results.filter(
      (product) => product.price >= min && product.price <= max
    );
  }

  // Sort results
  results.sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "price":
        return a.price - b.price;
      case "category":
        return a.category.localeCompare(b.category);
      default:
        return 0;
    }
  });

  return results;
};

export const getProductCategories = (): string[] => {
  const categories = [
    ...new Set(mockProducts.map((product) => product.category)),
  ];
  return categories.sort();
};

export const findProductByBarcode = (barcode: string): SalesProduct | null => {
  return mockProducts.find((product) => product.barcode === barcode) || null;
};

// Cart storage utilities
export const getStoredCart = (): SalesCart | null => {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(CART_KEY);
    if (!stored) return null;

    const cart = JSON.parse(stored);
    return calculateCartTotals(cart);
  } catch (error) {
    console.error("Failed to parse stored cart:", error);
    localStorage.removeItem(CART_KEY);
    return null;
  }
};

export const setStoredCart = (cart: SalesCart): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error("Failed to store cart:", error);
  }
};

export const clearStoredCart = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_KEY);
};

// Transaction utilities
export const generateTransactionNumber = (): string => {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const time =
    now.getHours().toString().padStart(2, "0") +
    now.getMinutes().toString().padStart(2, "0");
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();

  return `TXN-${date}-${time}-${random}`;
};

export const generateReceiptNumber = (): string => {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const sequence = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, "0");

  return `RCP-${date}-${sequence}`;
};

// Payment processing
export const processPayment = async (
  payment: Omit<SalesPayment, "id" | "createdAt">
): Promise<SalesPayment> => {
  // Simulate payment processing delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // For demo purposes, randomly simulate payment success/failure
  const isSuccess = Math.random() > 0.1; // 90% success rate

  const processedPayment: SalesPayment = {
    ...payment,
    id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: isSuccess ? "completed" : "failed",
    createdAt: new Date(),
  };

  return processedPayment;
};

// Utility functions
export const formatCurrency = (
  amount: number,
  currency: string = "USD"
): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const calculateTax = (amount: number, taxRate: number): number => {
  return amount * taxRate;
};

export const applyDiscount = (
  amount: number,
  discountPercentage: number
): number => {
  return amount * (1 - discountPercentage / 100);
};
