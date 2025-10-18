/**
 * ShopFlow Hooks Package
 * Consolidated React Hooks - Phase 1 Refactor
 *
 * This package provides optimized React Query hooks for all ShopFlow operations.
 * All hooks are configured with appropriate caching, staleTime, and refetch strategies.
 */

// Core Data Hooks - Products, Categories, Inventory
export * from "./useCoreData";

// Order Hooks - Orders, Payments, Customers
export * from "./useOrders";

// Report Hooks - Analytics and Reporting
export * from "./useReports";

// System Hooks - Settings, Users, Branches
export * from "./useSystem";

// Auth Hooks - Authentication and Permissions
export * from "./useAuth";
