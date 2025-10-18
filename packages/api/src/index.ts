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
export * from "./types";

// Default export
export { coreService as default } from "./services/coreService";
