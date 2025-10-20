# @shopflow/api

Consolidated API services for ShopFlow applications (Phase 1 Refactor)

## Overview

This package provides consolidated API services for all ShopFlow database operations. Services are organized by domain and built on Supabase.

**Consolidation:** Reduced from 15 services to 4 core services (-73%)

## Installation

```bash
# Internal package - automatically linked in monorepo
npm install
```

## Services

### 1. coreService - Products, Categories, Inventory

**Consolidates:** productService, categoryService, inventoryService

```typescript
import { coreService } from "@shopflow/api";

// Products
const products = await coreService.products.getAll({ branchId: "branch-id" });
const product = await coreService.products.getById("product-id");
const lowStock = await coreService.products.getLowStock("branch-id", 10);

// Categories
const categories = await coreService.categories.getAll();
const categoryTree = await coreService.categories.getTree();

// Inventory
const stockLevels = await coreService.inventory.getStockLevels({ branchId });
const updated = await coreService.inventory.updateStock({
  productId: "product-id",
  branchId: "branch-id",
  quantity: 10,
  movementType: "adjustment_in",
});
```

### 2. orderService - Orders, Payments, Customers

**Consolidates:** orderService, customerService, paymentService

```typescript
import { orderService } from "@shopflow/api";

// Orders
const orders = await orderService.orders.getAll({ branchId: "branch-id" });
const order = await orderService.orders.create({
  order: { branch_id: "branch-id", total_amount: 500 },
  items: [{ product_id: "p1", quantity: 2, unit_price: 250, subtotal: 500 }],
  payment: { amount: 500, payment_method: "cash" },
});

// Customers
const customer = await orderService.customers.getByPhone("0812345678");
const customers = await orderService.customers.search("john");
const stats = await orderService.customers.getStats("customer-id");

// Payments
const payment = await orderService.payments.process({
  order_id: "order-id",
  amount: 500,
  payment_method: "cash",
});
const refund = await orderService.payments.refund("payment-id", 500, "Customer request");
```

### 3. reportService - Analytics & Reports

**Consolidates:** reportService, analyticsService

```typescript
import { reportService } from "@shopflow/api";

// Sales Reports
const dailySales = await reportService.sales.daily({
  branchId: "branch-id",
  date: "2025-01-18",
});

const salesByProduct = await reportService.sales.byProduct({
  startDate: "2025-01-01",
  endDate: "2025-01-31",
});

// Inventory Reports
const lowStock = await reportService.inventory.lowStock({
  branchId: "branch-id",
  threshold: 10,
});

const inventoryValue = await reportService.inventory.value("branch-id");

// Dashboard
const overview = await reportService.dashboard.overview({
  branchId: "branch-id",
  startDate: "2025-01-01",
  endDate: "2025-01-31",
});

const trends = await reportService.dashboard.trends({ days: 7 });
```

### 4. systemService - Settings, Users, Branches

**Consolidates:** userService, branchService, settingsService

```typescript
import { systemService } from "@shopflow/api";

// Users
const users = await systemService.users.getAll();
const user = await systemService.users.getById("user-id");
const role = await systemService.users.getRole("user-id");

// Branches
const branches = await systemService.branches.getAll();
const branch = await systemService.branches.create({
  name: "New Branch",
  address: "123 Main St",
});

// Branch Settings (NEW in Phase 1)
const settings = await systemService.branchSettings.get("branch-id");
const updated = await systemService.branchSettings.update("branch-id", {
  pos_display_settings: { language: "th", theme: "dark" },
});

// System Settings
const systemSettings = await systemService.systemSettings.get();
const maintenanceMode = await systemService.systemSettings.getMaintenanceMode();

// Audit Logs
const logs = await systemService.auditLogs.get({ userId: "user-id" });
```

## Direct Service Imports

You can also import services directly:

```typescript
import { products, categories, inventory } from "@shopflow/api";
import { orders, customers, payments } from "@shopflow/api";
import { salesReports, inventoryReports, dashboard } from "@shopflow/api";
import { users, branches, branchSettings } from "@shopflow/api";
```

## Service Structure

```
packages/api/src/
├── services/
│   ├── coreService.ts       # Products, Categories, Inventory
│   ├── orderService.ts      # Orders, Payments, Customers
│   ├── reportService.ts     # Analytics & Reports
│   └── systemService.ts     # Settings, Users, Branches
├── types/
│   └── index.ts
├── supabase.ts              # Supabase client
└── index.ts                 # Main export
```

## API Methods

### coreService.products
- `getAll(params)` - Get all products with filters
- `getById(id)` - Get product by ID
- `getBySku(sku, branchId?)` - Get product by SKU
- `create(product)` - Create new product
- `update(id, updates)` - Update product
- `delete(id)` - Delete product
- `getLowStock(branchId?, threshold)` - Get low stock products
- `getOutOfStock(branchId?)` - Get out of stock products

### coreService.categories
- `getAll(params)` - Get all categories
- `getById(id)` - Get category by ID
- `create(category)` - Create new category
- `update(id, updates)` - Update category
- `delete(id)` - Delete category
- `getTree(branchId?)` - Get category tree structure

### coreService.inventory
- `getStockLevels(params)` - Get stock levels
- `updateStock(params)` - Update stock with movement tracking
- `getMovements(params)` - Get inventory movement history
- `getLowStockView(branchId?)` - Get low stock view

### orderService.orders
- `getAll(params)` - Get all orders with filters
- `getById(id)` - Get order by ID with full details
- `create(orderData)` - Create order with items and payment
- `updateStatus(id, status)` - Update order status
- `cancel(id, reason?)` - Cancel order
- `getStats(params)` - Get order statistics

### orderService.customers
- `getAll(params)` - Get all customers
- `getById(id)` - Get customer by ID
- `getByPhone(phone)` - Get customer by phone number
- `search(query)` - Search customers by name/phone
- `create(customer)` - Create new customer
- `update(id, updates)` - Update customer
- `delete(id)` - Delete customer
- `getPurchaseHistory(customerId, params)` - Get purchase history
- `getStats(customerId)` - Get customer statistics

### orderService.payments
- `process(paymentData)` - Process payment for order
- `getById(id)` - Get payment by ID
- `getByOrder(orderId)` - Get all payments for order
- `refund(paymentId, amount?, reason?)` - Refund payment
- `getHistory(params)` - Get payment history

### reportService.sales
- `daily(params)` - Get daily sales report
- `byDateRange(params)` - Get sales by date range
- `byProduct(params)` - Get sales by product
- `byCustomer(params)` - Get sales by customer

### reportService.inventory
- `stockLevels(branchId?)` - Get current stock levels
- `lowStock(params)` - Get low stock report
- `outOfStock(branchId?)` - Get out of stock report
- `movements(params)` - Get inventory movements
- `value(branchId?)` - Get inventory value report

### reportService.dashboard
- `overview(params)` - Get dashboard overview
- `trends(params)` - Get trends analysis

### systemService.users
- `getAll(params)` - Get all users
- `getById(id)` - Get user by ID
- `getByEmail(email)` - Get user by email
- `update(id, updates)` - Update user
- `delete(id)` - Delete user
- `getRole(userId)` - Get user role
- `updateRole(userId, role)` - Update user role

### systemService.branches
- `getAll()` - Get all branches
- `getById(id)` - Get branch by ID
- `create(branch)` - Create new branch (auto-creates settings)
- `update(id, updates)` - Update branch
- `delete(id)` - Delete branch
- `getStats(branchId, params)` - Get branch statistics

### systemService.branchSettings (NEW)
- `get(branchId)` - Get branch settings (auto-creates if missing)
- `update(branchId, updates)` - Update branch settings
- `updateSection(branchId, section, value)` - Update specific section
- `getPOSSettings(branchId)` - Get POS display settings
- `reset(branchId)` - Reset to default settings

**Settings Sections:**
- business_info - Business information
- pricing_config - Pricing and tax configuration
- inventory_config - Inventory thresholds
- printer_config - Receipt printer settings
- loyalty_config - Loyalty program settings
- payment_config - Payment method configuration
- permissions - User permissions
- pos_display_settings - POS terminal display settings

### systemService.systemSettings
- `get()` - Get system settings
- `update(updates)` - Update system settings
- `getMaintenanceMode()` - Get maintenance mode status
- `setMaintenanceMode(enabled)` - Set maintenance mode

### systemService.auditLogs
- `create(log)` - Create audit log entry
- `get(params)` - Get audit logs with filters

## Error Handling

All service methods throw errors on failure. Use try-catch or React Query's error handling:

```typescript
try {
  const product = await coreService.products.getById(id);
} catch (error) {
  console.error("Failed to get product:", error);
}

// Or with React Query
const { data, error } = useProduct(id);
if (error) {
  console.error("Failed to load product:", error);
}
```

## TypeScript Support

All services are fully typed using @shopflow/types:

```typescript
import type { Database } from "@shopflow/types";

type Product = Database["public"]["Tables"]["products"]["Row"];
type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];
```

## Development

```bash
# Build
npm run build

# Type checking
npm run type-check

# Testing
npm test
```

---

**Package:** @shopflow/api  
**Version:** 2.0.0 (Consolidated)  
**Phase:** Phase 1 Foundation Refactor  
**Updated:** January 18, 2025
