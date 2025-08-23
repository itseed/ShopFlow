# ShopFlow Database Schema Analysis & Redesign

## Current Schema Analysis

### Existing Tables Overview

#### 1. **Products Table** ✅ Well Designed
```sql
- id (uuid, PK)
- sku (text, unique) - Auto-generated
- name (text, not null)
- description (text)
- price (numeric(10,2), not null)
- discount_price (numeric(10,2))
- stock (integer, not null, default 0)
- min_stock (integer, default 5) ✅ Correct column name
- category_id (uuid, FK to categories)
- status (text, check: active/inactive/out_of_stock)
- images (text[])
- created_at, updated_at (timestamp)
- created_by (uuid, FK to auth.users)
```

**Strengths:**
- Good indexing strategy (name search, category, status, stock)
- Proper constraints and checks
- Auto SKU generation
- Audit trail with created_by
- Text search index on name

**Areas for Improvement:**
- Missing barcode field
- No cost price tracking
- No supplier information
- No product variants support
- No unit of measurement

#### 2. **Categories Table** ✅ Good
```sql
- id (uuid, PK)
- name (text, not null, unique)
- description (text)
- display_order (integer, default 0)
- is_active (boolean, default true)
- created_at, updated_at (timestamp)
```

**Needs Enhancement:**
- Missing parent_id for hierarchical categories
- No category image support

#### 3. **Orders Table** ⚠️ Needs Enhancement
```sql
- id (uuid, PK)
- order_number (text, unique, auto-generated)
- customer_name, customer_phone (text)
- subtotal, tax, total (numeric(10,2))
- payment_method (text, check: cash/card/bank_transfer/e_wallet)
- status (text, check: pending/processing/completed/cancelled)
- branch_id (uuid, FK to branches)
- created_by, created_at, updated_at
```

**Missing Critical Fields:**
- customer_email
- delivery_address
- delivery_date
- delivery_method
- notes, internal_notes
- discount_amount
- priority level
- sales_rep
- customer_type
- shop information for B2B

#### 4. **Order Items Table** ✅ Basic Structure Good
```sql
- id (uuid, PK)
- order_id (uuid, FK to orders)
- product_id (uuid, FK to products)
- product_name (text, not null) - Good for historical data
- quantity (integer, not null)
- unit_price, total_price (numeric(10,2))
```

#### 5. **Branches Table** ✅ Good
```sql
- id (uuid, PK)
- name, address, phone, email (text)
- is_active (boolean)
- created_at, updated_at
```

#### 6. **User Profiles Table** ⚠️ Basic
```sql
- id (uuid, PK, FK to auth.users)
- display_name (text, not null)
- role (text, check: admin/staff)
- branch_id (uuid, FK to branches)
- is_active (boolean)
- created_at, updated_at
```

**Missing:**
- More role types (manager, cashier)
- User preferences
- Phone, email fields

---

## Missing Tables Analysis

Based on ShopFlow requirements, we need these additional tables:

### 1. **Customers Table** - Critical Missing
For customer relationship management and repeat customer tracking.

### 2. **Suppliers Table** - Important for Inventory
For product sourcing and purchase management.

### 3. **Purchase Orders Table** - Inventory Management
For tracking inventory purchases and stock replenishment.

### 4. **Purchase Order Items Table**
Items within purchase orders.

### 5. **Stock Movements Table** - Critical for Audit
For tracking all stock changes (sales, purchases, adjustments, waste).

### 6. **Promotions/Discounts Table**
For managing promotional campaigns and discount rules.

### 7. **Payment Transactions Table**
For detailed payment tracking, especially for split payments.

### 8. **Product Variants Table**
For products with multiple options (size, color, etc.).

### 9. **Inventory Adjustments Table**
For stock corrections and audit trail.

### 10. **Reports Cache Table**
For storing generated report data to improve performance.

---

## Identified Issues & Improvements

### Critical Issues:
1. **Order Management**: Missing essential fields for POS and CMS operations
2. **Customer Management**: No customer data persistence
3. **Inventory Tracking**: No stock movement audit trail
4. **Supplier Management**: No supplier relationship tracking
5. **Product Variants**: No support for product options
6. **Promotional Pricing**: No structured discount management

### Performance Issues:
1. **Missing Indexes**: Need more strategic indexing
2. **No Partitioning**: Large tables like orders/stock_movements need partitioning
3. **No Materialized Views**: For complex reporting queries

### Security Issues:
1. **RLS Policies**: Some policies too restrictive or missing
2. **Audit Trail**: Incomplete tracking of data changes

---

## Recommended Schema Improvements

### Phase 1: Core Enhancements (Immediate)
1. Enhance Orders table with missing fields
2. Add Customers table
3. Add Stock Movements table
4. Improve Product table with cost/barcode fields

### Phase 2: Business Logic (Short-term)
1. Add Suppliers table
2. Add Purchase Orders system
3. Add Product Variants
4. Add Promotions system

### Phase 3: Advanced Features (Long-term)
1. Add Payment Transactions for complex payment scenarios
2. Add Reports caching system
3. Add Notification system
4. Add Advanced analytics tables

---

## Next Steps

1. **Create enhanced schema migration scripts**
2. **Design new table structures with proper relationships**
3. **Implement improved indexing strategy**
4. **Update RLS policies for new tables**
5. **Create database functions for business logic**
6. **Design seed data for testing**