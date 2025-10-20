# @shopflow/hooks

Shared React Query hooks for ShopFlow applications (Phase 1 Refactor)

## Overview

This package provides optimized React Query hooks for all ShopFlow operations. All hooks are configured with appropriate caching, staleTime, and refetch strategies.

**Consolidation:** Reduced from 27+ individual hooks to 5 core hook files (-81%)

## Installation

```bash
# Internal package - automatically linked in monorepo
npm install
```

## Usage

### 1. useCoreData - Products, Categories, Inventory

```typescript
import {
  useProducts,
  useProduct,
  useCategories,
  useCategory,
  useStockLevels,
  useUpdateStock,
} from "@shopflow/hooks";

// Get all products with filters
const { data, isLoading } = useProducts({
  branchId: "branch-id",
  categoryId: "category-id",
  search: "laptop",
  inStock: true,
  limit: 20,
});

// Get single product
const { data: product } = useProduct(productId);

// Create product
const createProduct = useCreateProduct();
createProduct.mutate({ name: "New Product", price: 100 });

// Update stock
const updateStock = useUpdateStock();
updateStock.mutate({
  productId: "product-id",
  branchId: "branch-id",
  quantity: 10,
  movementType: "adjustment_in",
});
```

### 2. useOrders - Orders, Payments, Customers

```typescript
import {
  useOrders,
  useOrder,
  useCreateOrder,
  useCustomers,
  useCustomerByPhone,
  useProcessPayment,
} from "@shopflow/hooks";

// Get all orders
const { data: orders } = useOrders({ branchId: "branch-id" });

// Create order with items and payment
const createOrder = useCreateOrder();
createOrder.mutate({
  order: { branch_id: "branch-id", total_amount: 500 },
  items: [
    { product_id: "p1", quantity: 2, unit_price: 250, subtotal: 500 },
  ],
  payment: { amount: 500, payment_method: "cash" },
});

// Search customer by phone
const { data: customer } = useCustomerByPhone("0812345678");

// Process payment
const processPayment = useProcessPayment();
processPayment.mutate({
  order_id: "order-id",
  amount: 500,
  payment_method: "cash",
});
```

### 3. useReports - Analytics & Reports

```typescript
import {
  useDailySalesReport,
  useSalesReportByDateRange,
  useLowStockReport,
  useDashboardOverview,
} from "@shopflow/hooks";

// Daily sales report
const { data: dailySales } = useDailySalesReport({
  branchId: "branch-id",
  date: "2025-01-18",
});

// Sales by date range
const { data: salesReport } = useSalesReportByDateRange({
  startDate: "2025-01-01",
  endDate: "2025-01-31",
});

// Dashboard overview (auto-refresh every 5 minutes)
const { data: dashboard } = useDashboardOverview({
  branchId: "branch-id",
});
```

### 4. useSystem - Settings, Users, Branches

```typescript
import {
  useBranches,
  useBranchSettings,
  useUpdateBranchSettings,
  usePOSSettings,
  useSystemSettings,
} from "@shopflow/hooks";

// Get all branches
const { data: branches } = useBranches();

// Get branch settings
const { data: settings } = useBranchSettings(branchId);

// Update POS display settings
const updateSettings = useUpdateBranchSettingsSection();
updateSettings.mutate({
  branchId: "branch-id",
  section: "pos_display_settings",
  value: { language: "th", theme: "dark" },
});

// Get POS settings (auto-refresh every 10 minutes)
const { data: posSettings } = usePOSSettings(branchId);
```

### 5. useAuth - Authentication & Permissions

```typescript
import {
  useSession,
  useCurrentUser,
  useSignIn,
  useSignOut,
  useHasPermission,
  useIsAdmin,
} from "@shopflow/hooks";

// Get current session
const { data: session } = useSession();

// Sign in
const signIn = useSignIn();
signIn.mutate({ email: "user@example.com", password: "password" });

// Check permission
const { data: canEdit } = useHasPermission("manage_products");

// Check role
const isAdmin = useIsAdmin();
```

## Hook Files

### useCoreData.ts
**Products:** useProducts, useProduct, useProductBySku, useCreateProduct, useUpdateProduct, useDeleteProduct, useLowStockProducts, useOutOfStockProducts

**Categories:** useCategories, useCategory, useCategoryTree, useCreateCategory, useUpdateCategory, useDeleteCategory

**Inventory:** useStockLevels, useUpdateStock, useInventoryMovements, useLowStockView

### useOrders.ts
**Orders:** useOrders, useOrder, useCreateOrder, useUpdateOrderStatus, useCancelOrder, useOrderStats

**Customers:** useCustomers, useCustomer, useCustomerByPhone, useSearchCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer, useCustomerPurchaseHistory, useCustomerStats

**Payments:** usePayment, usePaymentsByOrder, useProcessPayment, useRefundPayment, usePaymentHistory

### useReports.ts
**Sales:** useDailySalesReport, useSalesReportByDateRange, useSalesByProduct, useSalesByCustomer

**Inventory:** useStockLevelsReport, useLowStockReport, useOutOfStockReport, useInventoryMovementsReport, useInventoryValueReport

**Dashboard:** useDashboardOverview, useTrends

### useSystem.ts
**Users:** useUsers, useUser, useUserByEmail, useUpdateUser, useDeleteUser, useUpdateUserRole

**Branches:** useBranches, useBranch, useCreateBranch, useUpdateBranch, useDeleteBranch, useBranchStats

**Settings:** useBranchSettings, useUpdateBranchSettings, useUpdateBranchSettingsSection, usePOSSettings, useResetBranchSettings, useSystemSettings, useUpdateSystemSettings, useMaintenanceMode, useSetMaintenanceMode

**Audit:** useAuditLogs, useCreateAuditLog

### useAuth.ts
**Session:** useSession, useCurrentUser, useCurrentUserProfile, useSignIn, useSignOut, useSignUp, useResetPassword, useUpdatePassword

**Permissions:** useUserRole, useCurrentUserRole, useHasPermission, useHasRole, useIsAdmin, useIsManager, useIsAuthenticated

## Features

- ✅ **Optimized Caching** - Configured staleTime and gcTime for each hook
- ✅ **Auto-Refetch** - Real-time data for critical operations
- ✅ **Cache Invalidation** - Proper invalidation on mutations
- ✅ **Type-Safe** - Full TypeScript support with @shopflow/types
- ✅ **Error Handling** - Built-in error handling
- ✅ **Loading States** - isLoading, isFetching states

## Caching Strategy

| Data Type | staleTime | gcTime | Refetch Interval |
|-----------|-----------|--------|------------------|
| Products | 5 min | 10 min | - |
| Categories | 10 min | 15 min | - |
| Orders | 1 min | 5 min | - |
| Inventory | 2 min | 5 min | 5 min |
| Reports | 5 min | 10 min | - |
| Dashboard | 2 min | 5 min | 5 min |
| Settings | 5-15 min | 10-30 min | 10 min (POS) |
| Auth | 5 min | 10 min | - |

## Migration from Old Hooks

```typescript
// Before (multiple hook files)
import { useProducts } from "../hooks/useProducts";
import { useCategories } from "../hooks/useCategories";
import { useOrders } from "../hooks/useOrders";

// After (single import)
import { useProducts, useCategories, useOrders } from "@shopflow/hooks";
```

## Development

```bash
# Type checking
npm run type-check

# Used by both CMS and POS apps
```

---

**Package:** @shopflow/hooks  
**Version:** 1.0.0  
**Phase:** Phase 1 Foundation Refactor  
**Created:** January 18, 2025

