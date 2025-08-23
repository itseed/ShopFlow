// Main exports for @shopflow/api package
export {
  supabase,
  db,
  getCurrentUser,
  getCurrentSession,
  onAuthStateChange,
} from "./supabase";

// API Types
export * from "./types/api";

// Services
export {
  productService,
  type ProductFilters,
  type CreateProductData,
  type UpdateProductData,
  type StockUpdateData,
} from "./services/productService";
export {
  categoryService,
  type CategoryFilters,
  type CreateCategoryData,
  type UpdateCategoryData,
} from "./services/categoryService";
export {
  orderService,
  type OrderFilters,
  type CreateOrderData,
  type CreateOrderItemData,
  type UpdateOrderData,
  type OrderStats,
} from "./services/orderService";
export {
  userService,
  type UserFilters,
  type CreateUserData,
  type UpdateUserData,
  type UserProfile,
} from "./services/userService";
export {
  branchService,
  type BranchFilters,
  type CreateBranchData,
  type UpdateBranchData,
  type BranchStats,
  type BranchPerformance,
} from "./services/branchService";
export {
  reportService,
  type SalesReport,
  type ProductReport,
  type CustomerReport,
  type InventoryReport,
  type ProfitLossReport,
  type BranchComparisonReport,
  type ReportFilters,
} from "./services/reportService";
export {
  realtimeService,
  RealtimeService,
  type RealtimeEvent,
  type RealtimeEventType,
  type ProductRealtimeCallback,
  type OrderRealtimeCallback,
  type OrderItemRealtimeCallback,
  type InventoryRealtimeCallback,
} from "./services/realtimeService";

// Re-export types from @shopflow/types for convenience
export type {
  Product,
  Category,
  Order,
  OrderItem,
  ProductStatus,
  CategoryStatus,
} from "@shopflow/types";
