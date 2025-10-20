/**
 * ShopFlow UI Package
 * Enhanced Shared UI Components - Phase 1 Refactor
 */

// Common Components
export * from "./common/Card";
export * from "./common/DataTable";
export * from "./common/SearchBar";
export * from "./common/StatusBadge";
export * from "./common/EmptyState";

// Business Components
export * from "./business/ProductCard";
export * from "./business/OrderCard";
export * from "./business/CustomerCard";
export * from "./business/StockIndicator";

// Layout Components
export * from "./layout/PageHeader";

// Legacy exports (keep for backward compatibility)
export { default as Button } from "./Button";
export { default as ChakraButton } from "./ChakraButton";
export { default as ProductTable } from "./ProductTable";
export { default as ChakraProductTable } from "./ChakraProductTable";
