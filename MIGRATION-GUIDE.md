# Phase 1 Migration Guide

Guide for migrating to the new consolidated architecture

## Overview

Phase 1 has significantly simplified the codebase:
- Database: 18 → 13 tables (-27%)
- Pages: 70 → 37 pages (-47%)
- API Services: 15 → 4 services (-73%)
- React Hooks: 27+ → 5 files (-81%)

## Migration Steps

### 1. Database Migration

#### Backup First
```bash
# Backup current database
pg_dump -U postgres -d shopflow > backup_before_phase1_$(date +%Y%m%d).sql
```

#### Run Migration
```bash
# Run Phase 1 migration
psql -U postgres -d shopflow -f migrate/phase1-schema-simplification.sql

# Verify migration
psql -U postgres -d shopflow -c "SELECT COUNT(*) FROM branch_settings;"
```

#### Rollback (if needed)
```bash
# Restore from backup
psql -U postgres -d shopflow < backup_before_phase1_YYYYMMDD.sql
```

### 2. Update Package Dependencies

```bash
# Update root package.json
cd ShopFlow
npm install

# Rebuild all packages
npm run build
```

### 3. Update Imports - API Services

#### Before (Old Services)
```typescript
// Multiple service imports
import { productService } from "@shopflow/api";
import { categoryService } from "@shopflow/api";
import { orderService } from "@shopflow/api";
import { customerService } from "@shopflow/api";

const products = await productService.getAll();
const categories = await categoryService.getAll();
const orders = await orderService.getAll();
const customers = await customerService.getAll();
```

#### After (New Consolidated Services)
```typescript
// Single consolidated import
import { coreService, orderService } from "@shopflow/api";

const products = await coreService.products.getAll();
const categories = await coreService.categories.getAll();
const orders = await orderService.orders.getAll();
const customers = await orderService.customers.getAll();

// Or import directly
import { products, categories, orders, customers } from "@shopflow/api";
```

### 4. Update Imports - React Hooks

#### Before (Old Hooks)
```typescript
// Multiple hook file imports
import { useProducts } from "../lib/hooks/useProducts";
import { useCategories } from "../lib/hooks/useCategories";
import { useOrders } from "../lib/hooks/useOrders";
import { useCustomers } from "../lib/hooks/useCustomers";
```

#### After (New Consolidated Hooks)
```typescript
// Single package import
import {
  useProducts,
  useCategories,
  useOrders,
  useCustomers,
} from "@shopflow/hooks";
```

### 5. Update Imports - UI Components

#### Before (App-Specific Components)
```typescript
// App-specific imports
import ProductCard from "../../components/ProductCard";
import { DataTable } from "../../components/DataTable";
```

#### After (Shared Components)
```typescript
// Shared package import
import { ProductCard, DataTable } from "@shopflow/ui";
```

### 6. Replace React Query Configuration

#### Before (Old Config)
```typescript
useQuery({
  queryKey: ["products"],
  queryFn: () => productService.getAll(),
  cacheTime: 10000, // Old API
  // ... manual configuration
});
```

#### After (New Optimized Hooks)
```typescript
// Pre-configured with optimal settings
const { data, isLoading } = useProducts();

// With params
const { data } = useProducts({
  branchId: "branch-id",
  categoryId: "category-id",
  search: "laptop",
});
```

---

## Component Updates

### Using New Shared Components

#### ProductCard
```typescript
// Old: Custom implementation
<Box onClick={() => handleSelect(product)}>
  <Image src={product.image_url} />
  <Text>{product.name}</Text>
  <Text>฿{product.price}</Text>
  {/* ... many lines of custom code */}
</Box>

// New: Shared component
<ProductCard
  product={product}
  onSelect={handleSelect}
  showStock={true}
  size="md"
/>
```

#### DataTable with Pagination
```typescript
// Old: Custom table implementation
<Table>
  <Thead>
    {/* ... custom header */}
  </Thead>
  <Tbody>
    {data.map(item => /* ... */)}
  </Tbody>
</Table>
{/* ... custom pagination */}

// New: Shared components
<DataTable
  columns={columns}
  data={data}
  keyExtractor={(item) => item.id}
  isLoading={isLoading}
  onRowClick={handleRowClick}
/>
<Pagination
  currentPage={page}
  totalPages={totalPages}
  pageSize={pageSize}
  totalItems={total}
  onPageChange={setPage}
/>
```

#### StatusBadge
```typescript
// Old: Manual badge creation
<Badge colorScheme={
  status === 'completed' ? 'green' :
  status === 'pending' ? 'yellow' :
  status === 'cancelled' ? 'red' : 'gray'
}>
  {status}
</Badge>

// New: StatusBadge component
<StatusBadge status={status} />
```

---

## Pages Removed

### CMS Web (20 pages removed)

If your code references these pages, update navigation:

```typescript
// Before
<Link href="/reports/branch-comparison">Branch Comparison</Link>
<Link href="/settings/employees">Employees</Link>
<Link href="/settings/integrations">Integrations</Link>

// After - Remove these links or redirect to alternatives
// These features moved to Phase 2-4
```

### POS Frontend (13 pages removed)

```typescript
// Before
<Link href="/shifts">Shifts</Link>
<Link href="/orders/returns">Returns</Link>
<Link href="/reports/financial">Financial</Link>

// After - Remove these links
// These features moved to Phase 2
```

---

## Branch Settings Migration

### New Feature: Branch Settings

Phase 1 introduces centralized branch configuration:

```typescript
import { useBranchSettings, useUpdateBranchSettings } from "@shopflow/hooks";

// Get branch settings
const { data: settings } = useBranchSettings(branchId);

// Update POS display settings
const updateSettings = useUpdateBranchSettingsSection();
updateSettings.mutate({
  branchId,
  section: "pos_display_settings",
  value: {
    language: "th",
    theme: "dark",
    show_stock: true,
    grid_columns: 4,
  },
});

// Access settings
console.log(settings.pos_display_settings);
console.log(settings.printer_config);
console.log(settings.payment_config);
```

---

## Testing Your Migration

### 1. Test Database Migration
```bash
# Run migration on development
psql -d shopflow_dev -f migrate/phase1-schema-simplification.sql

# Verify tables
psql -d shopflow_dev -c "\dt"

# Check branch_settings
psql -d shopflow_dev -c "SELECT * FROM branch_settings;"
```

### 2. Test API Services
```typescript
// Test each service
import { coreService, orderService, reportService, systemService } from "@shopflow/api";

// Test products
const products = await coreService.products.getAll();
console.log("Products loaded:", products.data?.length);

// Test orders
const orders = await orderService.orders.getAll();
console.log("Orders loaded:", orders.data?.length);
```

### 3. Test Hooks
```typescript
import { useProducts, useOrders, useDashboardOverview } from "@shopflow/hooks";

function TestComponent() {
  const { data: products } = useProducts();
  const { data: orders } = useOrders();
  const { data: dashboard } = useDashboardOverview({});
  
  console.log("Hooks working:", { products, orders, dashboard });
}
```

### 4. Test UI Components
```typescript
import { ProductCard, OrderCard, DataTable } from "@shopflow/ui";

function TestComponents() {
  return (
    <>
      <ProductCard product={mockProduct} />
      <OrderCard order={mockOrder} />
      <DataTable columns={columns} data={data} keyExtractor={(i) => i.id} />
    </>
  );
}
```

---

## Troubleshooting

### Issue: Import errors after migration

**Solution:** Update package.json and rebuild
```bash
npm install
npm run build
```

### Issue: TypeScript errors

**Solution:** Clear TypeScript cache
```bash
rm -rf apps/*/tsconfig.tsbuildinfo
rm -rf packages/*/tsconfig.tsbuildinfo
npm run type-check
```

### Issue: Database migration fails

**Solution:** Check prerequisites
```bash
# Verify tables exist
psql -d shopflow -c "\dt"

# Check for foreign key constraints
psql -d shopflow -c "SELECT conname FROM pg_constraint WHERE conrelid = 'products'::regclass;"
```

### Issue: Old service files conflicting

**Solution:** Remove old service files (after migrating imports)
```bash
# Only after updating all imports!
# rm -rf packages/api/src/services/productService.ts
# rm -rf packages/api/src/services/categoryService.ts
# etc.
```

---

## Rollback Procedure

If you need to rollback Phase 1 changes:

### 1. Rollback Git
```bash
git checkout main
git branch -D phase1-foundation-refactor
```

### 2. Rollback Database
```bash
psql -d shopflow < backup_before_phase1_YYYYMMDD.sql
```

### 3. Rebuild
```bash
npm install
npm run build
```

---

## Next Steps After Migration

1. ✅ Verify all pages still work
2. ✅ Test critical user flows
3. ✅ Run performance tests
4. ✅ Update documentation
5. ✅ Deploy to staging
6. ✅ User acceptance testing
7. ✅ Deploy to production

---

## Support

For issues or questions:
1. Check [PHASE1-SUMMARY.md](./PHASE1-SUMMARY.md)
2. Review [PHASE1-CHANGES.md](./PHASE1-CHANGES.md)
3. See [.context/planning-and-strategy/](./context/planning-and-strategy/)
4. Create GitHub issue

---

**Guide Version:** 1.0  
**Phase:** Phase 1 Foundation Refactor  
**Created:** January 18, 2025

