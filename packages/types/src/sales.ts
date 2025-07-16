// Sales Terminal Types
export interface SalesProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  barcode: string;
  category: string;
  image?: string;
  stock: number;
  isActive: boolean;
  taxRate: number;
  discountEligible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SalesCartItem {
  id: string; // Cart item ID
  product: SalesProduct;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  discountPercentage: number;
  taxAmount: number;
  subtotal: number;
  total: number;
  notes?: string;
}

export interface SalesCart {
  id: string;
  items: SalesCartItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SalesPayment {
  id: string;
  type: "cash" | "card" | "digital" | "mixed";
  amount: number;
  received?: number; // For cash payments
  change?: number; // For cash payments
  cardType?: "visa" | "mastercard" | "amex" | "other";
  cardLastFour?: string;
  digitalProvider?: "paypal" | "stripe" | "square" | "other";
  transactionId?: string;
  status: "pending" | "completed" | "failed";
  createdAt: Date;
}

export interface SalesTransaction {
  id: string;
  transactionNumber: string;
  cart: SalesCart;
  payments: SalesPayment[];
  customer?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  cashier: {
    id: string;
    name: string;
    username: string;
  };
  branch: {
    id: string;
    name: string;
  };
  status: "pending" | "completed" | "cancelled" | "refunded";
  notes?: string;
  receipt?: {
    printed: boolean;
    emailSent: boolean;
    receiptNumber: string;
  };
  createdAt: Date;
  completedAt?: Date;
}

export interface SalesContextType {
  cart: SalesCart;
  currentTransaction: SalesTransaction | null;
  addToCart: (product: SalesProduct, quantity?: number) => void;
  updateCartItem: (itemId: string, updates: Partial<SalesCartItem>) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  applyDiscount: (
    itemId: string,
    discount: number,
    isPercentage: boolean
  ) => void;
  processPayment: (
    payment: Omit<SalesPayment, "id" | "createdAt">
  ) => Promise<boolean>;
  completeTransaction: (
    customer?: SalesTransaction["customer"]
  ) => Promise<SalesTransaction | null>;
  cancelTransaction: () => void;
  isLoading: boolean;
  error: string | null;
}

export interface SalesProductSearchFilters {
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  inStock?: boolean;
  searchTerm?: string;
  barcode?: string;
}

export interface SalesSettings {
  taxRate: number;
  currency: string;
  allowDiscounts: boolean;
  maxDiscountPercentage: number;
  requireCustomerInfo: boolean;
  printReceiptByDefault: boolean;
  emailReceiptByDefault: boolean;
  allowNegativeStock: boolean;
}

// Payment System Types
export type SalesPaymentMethod = "cash" | "card" | "qr" | "wallet";

export interface PaymentResult {
  success: boolean;
  method: SalesPaymentMethod;
  amount: number;
  receivedAmount?: number; // For cash payments
  change?: number; // For cash payments
  cardType?: "credit" | "debit";
  cardNumber?: string; // Last 4 digits
  transactionId: string;
  timestamp: string;
  approvalCode?: string; // For card payments
  qrCode?: string; // For QR payments
  walletType?: "truemoney" | "shopeepay" | "rabbit" | "other";
  errorMessage?: string;
}

export interface Receipt {
  id: string;
  transactionId: string;
  receiptNumber: string;
  timestamp: string;
  items: SalesCartItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  paymentMethod: SalesPaymentMethod;
  paymentDetails: PaymentResult;
  customer?: {
    name: string;
    email?: string;
    phone?: string;
  };
  cashier: {
    name: string;
    username: string;
  };
  branch: {
    name: string;
    address: string;
    phone: string;
    taxId: string;
  };
  footer?: string;
  isPrinted: boolean;
  isEmailSent: boolean;
}
