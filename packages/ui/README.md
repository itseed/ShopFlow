# @shopflow/ui

Enhanced shared UI components for ShopFlow applications (Phase 1 Refactor)

## Overview

This package provides reusable, type-safe UI components built with Chakra UI v2. Components are designed to be shared between CMS Web and POS Frontend applications.

**Enhancement:** Added 10 new shared components for Phase 1

## Installation

```bash
# Internal package - automatically linked in monorepo
npm install
```

## Components

### Common Components (5)

#### Card
Flexible card component with header, body, and footer sections.

```typescript
import { Card, CardHeader, CardBody, CardFooter } from "@shopflow/ui";

<Card variant="elevated" size="md">
  <CardHeader title="Product Details" actions={<Button>Edit</Button>} />
  <CardBody>Content here</CardBody>
  <CardFooter>Footer actions</CardFooter>
</Card>
```

#### DataTable
Simplified data table with pagination.

```typescript
import { DataTable, Pagination } from "@shopflow/ui";

const columns = [
  { key: "name", label: "Name" },
  { key: "price", label: "Price", render: (item) => `฿${item.price}` },
];

<DataTable
  columns={columns}
  data={products}
  keyExtractor={(item) => item.id}
  isLoading={isLoading}
  onRowClick={(item) => console.log(item)}
/>
```

#### SearchBar
Universal search input with clear functionality.

```typescript
import { SearchBar } from "@shopflow/ui";

<SearchBar
  value={search}
  onChange={setSearch}
  placeholder="Search products..."
  onClear={() => setSearch("")}
/>
```

#### StatusBadge
Status indicators with 12 predefined status types.

```typescript
import { StatusBadge } from "@shopflow/ui";

<StatusBadge status="completed" />
<StatusBadge status="pending" />
<StatusBadge status="paid" text="Custom text" />
```

**Available statuses:** active, inactive, pending, completed, cancelled, paid, unpaid, refunded, success, error, warning, info

#### EmptyState
Empty state display with optional action button.

```typescript
import { EmptyState } from "@shopflow/ui";

<EmptyState
  title="No products found"
  description="Try adjusting your search or filters"
  actionLabel="Add Product"
  onAction={handleAddProduct}
/>
```

### Business Components (4)

#### ProductCard
Product display card for both CMS and POS.

```typescript
import { ProductCard } from "@shopflow/ui";

<ProductCard
  product={product}
  onSelect={(product) => console.log(product)}
  showStock={true}
  size="md"
/>
```

**Features:**
- Stock level indicators (low stock/out of stock alerts)
- Category badge
- Price display
- Touch-friendly hover effects
- Responsive sizing (sm, md, lg)

#### OrderCard
Order summary card with customer info.

```typescript
import { OrderCard } from "@shopflow/ui";

<OrderCard
  order={order}
  onSelect={(order) => navigate(`/orders/${order.id}`)}
  showCustomer={true}
/>
```

**Features:**
- Order status badge
- Customer information
- Total items and amount
- Payment status
- Formatted date/time

#### CustomerCard
Customer information card with loyalty info.

```typescript
import { CustomerCard } from "@shopflow/ui";

<CustomerCard
  customer={customer}
  onSelect={(customer) => console.log(customer)}
  showLoyalty={true}
/>
```

**Features:**
- Avatar with name
- Contact information (phone, email)
- Loyalty tier badge
- Points balance

#### StockIndicator
Stock level indicator with color-coded alerts.

```typescript
import { StockIndicator } from "@shopflow/ui";

<StockIndicator
  stock={product.stock_quantity}
  lowStockThreshold={10}
  showIcon={true}
  showText={true}
/>
```

**Features:**
- Color-coded alerts (green/orange/red)
- Configurable low stock threshold
- Icon and text display options
- Three states: In Stock, Low Stock, Out of Stock

### Layout Components (1)

#### PageHeader
Standard page header with breadcrumbs and actions.

```typescript
import { PageHeader } from "@shopflow/ui";

<PageHeader
  title="Products"
  breadcrumbs={[
    { label: "Home", href: "/" },
    { label: "Catalog", href: "/catalog" },
    { label: "Products" },
  ]}
  actions={<Button>Add Product</Button>}
/>
```

## Legacy Components

These components are kept for backward compatibility:

```typescript
import { Button, ChakraButton, ProductTable, ChakraProductTable } from "@shopflow/ui";
```

## Design Principles

### 1. Simplicity First
- Components focus on single responsibility
- Props are clear and minimal
- No unnecessary configuration options

### 2. Type Safety
- Full TypeScript support
- Type-safe props
- Generic support where needed

### 3. Responsive & Accessible
- Mobile-first design
- Touch-friendly (48px minimum touch targets)
- WCAG 2.1 AA compliant
- Keyboard navigation support

### 4. Theme-Aware
- Support light/dark mode
- Consistent with Chakra UI theme
- Brand colors configurable

### 5. Performance
- Minimal re-renders
- Lazy loading support
- Optimized bundle size

## Component Guidelines

### Size Targets
- **Small:** < 100 lines (Button, Badge, Input)
- **Medium:** 100-200 lines (Card, Modal, Form)
- **Large:** 200-300 lines (DataTable, ComplexForm)

### Props Design
```typescript
// ✅ Good: Clear, typed, minimal
interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
  showStock?: boolean;
  size?: "sm" | "md" | "lg";
}

// ❌ Bad: Unclear, too many options
interface ProductCardProps {
  data: any;
  onClick?: any;
  config?: any;
  options?: any;
  // ... 20 more props
}
```

## Shared with

- ✅ **CMS Web** (apps/cms-web)
- ✅ **POS Frontend** (apps/pos-frontend)

## Development

```bash
# Type checking
npm run type-check

# Used in both applications
```

## Migration Guide

### From App-Specific to Shared Components

```typescript
// Before (app-specific)
import ProductCard from "../../components/ProductCard";

// After (shared)
import { ProductCard } from "@shopflow/ui";
```

## Package Structure

```
packages/ui/src/
├── common/              # Common UI components
│   ├── Card.tsx
│   ├── DataTable.tsx
│   ├── SearchBar.tsx
│   ├── StatusBadge.tsx
│   └── EmptyState.tsx
├── business/            # Business logic components
│   ├── ProductCard.tsx
│   ├── OrderCard.tsx
│   ├── CustomerCard.tsx
│   └── StockIndicator.tsx
├── layout/              # Layout components
│   └── PageHeader.tsx
└── index.ts             # Main export
```

## Dependencies

- **@chakra-ui/react** ^2.8.2
- **@emotion/react** ^11.11.1
- **@emotion/styled** ^11.11.0
- **framer-motion** ^10.16.5
- **@shopflow/types** (internal)

---

**Package:** @shopflow/ui  
**Version:** 1.0.0 (Enhanced)  
**Phase:** Phase 1 Foundation Refactor  
**Updated:** January 18, 2025

