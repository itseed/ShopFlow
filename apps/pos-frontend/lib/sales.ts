import {
  SalesProduct,
  SalesCart,
  SalesCartItem,
  SalesTransaction,
  SalesPayment,
  SalesProductSearchFilters,
} from "@shopflow/types";
import { createMockSalesProducts } from "./productAdapter";

// Use mock products from adapter for development
export const mockProducts: SalesProduct[] = createMockSalesProducts();

const CART_KEY = "pos_cart";
const TRANSACTION_KEY = "pos_current_transaction";

// Cart management functions
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
    item.product.discountEligible && item.discountPercentage
      ? subtotal * (item.discountPercentage / 100)
      : 0;
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

// Product search and filtering (legacy function for compatibility)
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
  if (filters.category && filters.category !== "all") {
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
    if (filters.inStock) {
      results = results.filter((product) => product.stock > 0);
    } else {
      results = results.filter((product) => product.stock === 0);
    }
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

// Local Storage utilities
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

// Get unique product categories
export const getProductCategories = (): string[] => {
  const categories = mockProducts
    .map((product) => product.category)
    .filter((category, index, array) => array.indexOf(category) === index)
    .sort();

  return categories;
};
