# @shopflow/api

Shared API services for ShopFlow POS and CMS applications.

## Features

- 🔄 **Unified API Layer** - Single source of truth for all data operations
- 🗄️ **Supabase Integration** - Built-in PostgreSQL database operations
- 📝 **TypeScript Support** - Full type safety throughout
- 🔄 **Real-time Ready** - Prepared for real-time subscriptions
- 🛡️ **Error Handling** - Consistent error handling patterns
- 📊 **Pagination Support** - Built-in pagination for large datasets

## Installation

```bash
npm install @shopflow/api
```

## Usage

### Products

```typescript
import { productService, CreateProductData } from '@shopflow/api';

// Get all products
const products = await productService.getAll({
  search: 'coffee',
  categoryId: 'cat-1',
  inStock: true,
  page: 0,
  limit: 20
});

// Create new product
const newProduct: CreateProductData = {
  name: 'Coffee Beans',
  price: 25.99,
  stock: 100,
  category_id: 'cat-1'
};

const result = await productService.create(newProduct);

// Update stock
await productService.updateStock('prod-1', {
  type: 'subtract',
  quantity: 5,
  reason: 'Sale'
});
```

### Categories

```typescript
import { categoryService, CreateCategoryData } from '@shopflow/api';

// Get category tree
const tree = await categoryService.getCategoryTree();

// Create new category
const newCategory: CreateCategoryData = {
  name: 'Beverages',
  description: 'Hot and cold drinks',
  display_order: 1
};

const result = await categoryService.create(newCategory);
```

### Error Handling

All service methods return a consistent `ApiResponse<T>` format:

```typescript
interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
  message?: string;
}

// Usage
const response = await productService.getById('prod-1');

if (response.success && response.data) {
  console.log('Product:', response.data);
} else {
  console.error('Error:', response.error);
}
```

### Filtering and Pagination

```typescript
// Advanced filtering
const products = await productService.getAll({
  search: 'coffee',           // Search in name, description, SKU
  categoryId: 'cat-1',        // Filter by category
  status: 'active',           // Filter by status
  minPrice: 10,               // Price range
  maxPrice: 50,
  inStock: true,              // Only in-stock products
  lowStock: false,            // Exclude low-stock items
  sortBy: 'name',             // Sort field
  sortOrder: 'asc',           // Sort direction
  page: 0,                    // Pagination
  limit: 20
});

// Get total count
const count = await productService.count({
  categoryId: 'cat-1',
  inStock: true
});
```

## Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Schema

The package expects the following Supabase tables:

### Products Table
```sql
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2),
  sku TEXT UNIQUE,
  stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER DEFAULT 5,
  category_id UUID REFERENCES categories(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock')),
  images TEXT[],
  barcode TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Categories Table
```sql
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id),
  display_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Watch for changes
npm run dev

# Type checking
npm run type-check
```

## Integration

This package is designed to be used by both:
- **CMS Web Application** - Product and category management
- **POS Frontend** - Real-time product data for sales

Both applications will share the same data source and API layer for consistency.
