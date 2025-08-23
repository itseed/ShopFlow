// Core domain types
export * from "./Product";
export * from "./Order";
export * from "./Category";
export * from "./User";
export * from "./Customer";
export * from "./Branch";

// POS-specific types (excluding duplicates)
export type {
  UserSession,
  CartItem,
  POSOrder,
  POSOrderItem,
  OrderWithItems,
  Payment,
  PaymentRequest,
  Receipt,
  Shift,
  ShiftSummary,
} from "./pos";

// Authentication types (avoiding duplicates)
export type {
  POSUser,
  POSSession,
  POSLoginCredentials,
  POSPinCredentials,
  POSAuthContextType,
} from "./auth";

// Sales terminal types
export type {
  SalesTransaction,
  SalesProduct,
  SalesProductSearchFilters,
  SalesCart,
  SalesCartItem,
  SalesPayment,
  SalesContextType,
  PaymentResult,
  Receipt as SalesReceipt,
} from "./sales";

// API and utility types
export * from "./Api";

// Database types
export * from "./Database";
