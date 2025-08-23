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

// Re-export types from @shopflow/types for convenience
export type {
  Product,
  Category,
  ProductStatus,
  CategoryStatus,
} from "@shopflow/types";
