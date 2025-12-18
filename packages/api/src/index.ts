/**
 * ShopFlow API Package
 * Consolidated API Services - Phase 1 Refactor
 */

// Core Services (Phase 1)
export {
  coreService,
  products,
  categories,
  inventory,
} from "./services/coreService";
export {
  orderService,
  orders,
  customers,
  payments,
} from "./services/orderService";
export {
  reportService,
  sales as salesReports,
  inventory as inventoryReports,
  dashboard,
} from "./services/reportService";
export {
  systemService,
  users,
  branches,
  branchSettings,
  systemSettings,
  auditLogs,
} from "./services/systemService";

// Supabase client
export { supabase } from "./supabase";

// Types
export * from "./types/api";

// Default export
export { coreService as default } from "./services/coreService";
export { supplierService } from "./services/supplierService";
export type {
  SupplierFilters,
  CreateSupplierData,
  UpdateSupplierData,
} from "./services/supplierService";

export { products as productService } from "./services/coreService";
export { inventory as stockMovementService } from "./services/coreService";

// Product service types (from productService.ts)
// Note: These types are exported from productService.ts, not duplicated here
// Import directly from "@shopflow/api/services/productService" if needed

// Legacy service exports (for backward compatibility)
export { categoryService } from "./services/categoryService";
export { userService } from "./services/userService";
export { branchService } from "./services/branchService";

// Category types
export type {
  CategoryFilters,
  CreateCategoryData,
  UpdateCategoryData,
} from "./services/categoryService";

// Customer service and types
export { customerService } from "./services/customerService";
export type {
  CustomerFilters,
  CreateCustomerData,
  UpdateCustomerData,
} from "./services/customerService";

// Loyalty service and types
export { loyaltyService } from "./services/loyaltyService";
export type {
  POSCustomerLookup,
  POSPointsEarnPreview,
} from "./services/loyaltyService";

// Realtime service
export { realtimeService } from "./services/realtimeService";
export type { RealtimeEvent } from "./services/realtimeService";

// Order types
export type { Order, CreateOrderData, CreateOrderItem } from "@shopflow/types";

// Product service types
export type {
  ProductFilters,
  CreateProductData,
  UpdateProductData,
  StockUpdateData,
} from "./services/productService";
