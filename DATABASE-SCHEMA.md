# ShopFlow Database Schema

เอกสารอธิบายโครงสร้างฐานข้อมูลของ ShopFlow

## 📋 สารบัญ

1. [Overview](#overview)
2. [Core Tables](#core-tables)
3. [Relationships](#relationships)
4. [Indexes](#indexes)
5. [Views](#views)
6. [Functions](#functions)

## Overview

ShopFlow ใช้ PostgreSQL (ผ่าน Supabase) เป็นฐานข้อมูลหลัก

### Schema Version

- **Current Version**: 1.0.0
- **Migration File**: `migrate/init.sql`

## Core Tables

### 1. branches

สาขาของร้าน

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | ชื่อสาขา |
| code | TEXT | รหัสสาขา (unique) |
| address | TEXT | ที่อยู่ |
| phone | TEXT | เบอร์โทร |
| email | TEXT | อีเมล |
| is_active | BOOLEAN | สถานะการใช้งาน |
| created_at | TIMESTAMPTZ | วันที่สร้าง |
| updated_at | TIMESTAMPTZ | วันที่อัพเดท |

### 2. user_profiles

ข้อมูลผู้ใช้ (extends auth.users)

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (references auth.users) |
| display_name | TEXT | ชื่อที่แสดง |
| role | TEXT | บทบาท (admin, manager, staff, cashier) |
| branch_id | UUID | สาขาที่สังกัด |
| is_active | BOOLEAN | สถานะการใช้งาน |
| created_at | TIMESTAMPTZ | วันที่สร้าง |
| updated_at | TIMESTAMPTZ | วันที่อัพเดท |

### 3. categories

หมวดหมู่สินค้า

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | ชื่อหมวดหมู่ (unique) |
| description | TEXT | คำอธิบาย |
| display_order | INTEGER | ลำดับการแสดง |
| is_active | BOOLEAN | สถานะการใช้งาน |
| created_at | TIMESTAMPTZ | วันที่สร้าง |
| updated_at | TIMESTAMPTZ | วันที่อัพเดท |

### 4. products

สินค้า

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| sku | TEXT | รหัสสินค้า (unique) |
| name | TEXT | ชื่อสินค้า |
| description | TEXT | คำอธิบาย |
| price | DECIMAL(10,2) | ราคา |
| discount_price | DECIMAL(10,2) | ราคาลด |
| stock | INTEGER | จำนวนคงเหลือ |
| min_stock | INTEGER | จำนวนขั้นต่ำ |
| category_id | UUID | หมวดหมู่ (FK) |
| image_url | TEXT | URL รูปภาพ |
| is_active | BOOLEAN | สถานะการใช้งาน |
| created_at | TIMESTAMPTZ | วันที่สร้าง |
| updated_at | TIMESTAMPTZ | วันที่อัพเดท |

### 5. customers

ลูกค้า

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | ชื่อลูกค้า |
| phone | TEXT | เบอร์โทร |
| email | TEXT | อีเมล |
| address | TEXT | ที่อยู่ |
| loyalty_points | INTEGER | แต้มสะสม |
| total_spent | DECIMAL(10,2) | ยอดซื้อรวม |
| last_order_date | TIMESTAMPTZ | วันที่ซื้อล่าสุด |
| is_active | BOOLEAN | สถานะการใช้งาน |
| created_at | TIMESTAMPTZ | วันที่สร้าง |
| updated_at | TIMESTAMPTZ | วันที่อัพเดท |

### 6. orders

คำสั่งซื้อ

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| order_number | TEXT | เลขที่คำสั่งซื้อ (unique) |
| branch_id | UUID | สาขา (FK) |
| customer_id | UUID | ลูกค้า (FK) |
| status | TEXT | สถานะ (pending, confirmed, processing, ready, completed, cancelled) |
| total_amount | DECIMAL(10,2) | ยอดรวม |
| payment_status | TEXT | สถานะการชำระเงิน (pending, paid, partial, refunded) |
| created_by | UUID | ผู้สร้าง (FK) |
| created_at | TIMESTAMPTZ | วันที่สร้าง |
| updated_at | TIMESTAMPTZ | วันที่อัพเดท |

### 7. order_items

รายการสินค้าในคำสั่งซื้อ

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| order_id | UUID | คำสั่งซื้อ (FK) |
| product_id | UUID | สินค้า (FK) |
| quantity | INTEGER | จำนวน |
| price | DECIMAL(10,2) | ราคาต่อหน่วย |
| subtotal | DECIMAL(10,2) | ยอดรวม |
| created_at | TIMESTAMPTZ | วันที่สร้าง |

### 8. payments

การชำระเงิน

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| order_id | UUID | คำสั่งซื้อ (FK) |
| amount | DECIMAL(10,2) | จำนวนเงิน |
| method | TEXT | วิธีการชำระ (cash, card, qr, wallet) |
| status | TEXT | สถานะ (pending, completed, failed, refunded) |
| transaction_id | TEXT | เลขที่ transaction |
| created_at | TIMESTAMPTZ | วันที่สร้าง |

### 9. inventory_movements

การเคลื่อนไหวของสต็อก

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| product_id | UUID | สินค้า (FK) |
| branch_id | UUID | สาขา (FK) |
| movement_type | TEXT | ประเภท (sale, purchase, adjustment, transfer, waste) |
| quantity | INTEGER | จำนวน |
| previous_stock | INTEGER | สต็อกเดิม |
| new_stock | INTEGER | สต็อกใหม่ |
| reference_id | UUID | อ้างอิง (เช่น order_id) |
| notes | TEXT | หมายเหตุ |
| created_by | UUID | ผู้สร้าง (FK) |
| created_at | TIMESTAMPTZ | วันที่สร้าง |

### 10. system_settings

การตั้งค่าระบบ

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| key | TEXT | คีย์ (unique) |
| value | JSONB | ค่า (JSON) |
| description | TEXT | คำอธิบาย |
| updated_at | TIMESTAMPTZ | วันที่อัพเดท |
| updated_by | UUID | ผู้อัพเดท (FK) |

### 11. branch_settings

การตั้งค่าสาขา

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| branch_id | UUID | สาขา (FK, unique) |
| business_info | JSONB | ข้อมูลธุรกิจ |
| pricing_config | JSONB | การตั้งค่าราคา |
| inventory_config | JSONB | การตั้งค่าสต็อก |
| printer_config | JSONB | การตั้งค่าเครื่องพิมพ์ |
| loyalty_config | JSONB | การตั้งค่าโปรแกรมสะสมแต้ม |
| payment_config | JSONB | การตั้งค่าการชำระเงิน |
| permissions | JSONB | สิทธิ์การใช้งาน |
| pos_display_settings | JSONB | การตั้งค่าการแสดงผล POS |
| is_active | BOOLEAN | สถานะการใช้งาน |
| created_at | TIMESTAMP | วันที่สร้าง |
| updated_at | TIMESTAMP | วันที่อัพเดท |

### 12. audit_logs

บันทึกการเปลี่ยนแปลง

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| table_name | TEXT | ชื่อตาราง |
| record_id | UUID | ID ของ record |
| action | TEXT | การกระทำ (INSERT, UPDATE, DELETE) |
| old_data | JSONB | ข้อมูลเดิม |
| new_data | JSONB | ข้อมูลใหม่ |
| user_id | UUID | ผู้ทำการ (FK) |
| created_at | TIMESTAMPTZ | วันที่สร้าง |

## Relationships

```
branches (1) ──< (N) user_profiles
branches (1) ──< (N) orders
branches (1) ──< (1) branch_settings
branches (1) ──< (N) inventory_movements

categories (1) ──< (N) products

products (1) ──< (N) order_items
products (1) ──< (N) inventory_movements

customers (1) ──< (N) orders

orders (1) ──< (N) order_items
orders (1) ──< (N) payments

user_profiles (1) ──< (N) orders
user_profiles (1) ──< (N) inventory_movements
```

## Indexes

Indexes ที่สร้างไว้เพื่อเพิ่มประสิทธิภาพ:

- `idx_products_category` - products(category_id)
- `idx_products_sku` - products(sku)
- `idx_orders_branch` - orders(branch_id)
- `idx_orders_customer` - orders(customer_id)
- `idx_orders_status` - orders(status)
- `idx_order_items_order` - order_items(order_id)
- `idx_order_items_product` - order_items(product_id)
- `idx_payments_order` - payments(order_id)
- `idx_inventory_movements_product` - inventory_movements(product_id)
- `idx_inventory_movements_branch` - inventory_movements(branch_id)
- `idx_branch_settings_branch` - branch_settings(branch_id)

## Views

### low_stock_products

แสดงสินค้าที่สต็อกต่ำ

```sql
SELECT 
  p.id,
  p.sku,
  p.name,
  p.stock,
  p.min_stock,
  p.category_id,
  c.name as category_name,
  (p.min_stock - p.stock) as shortage
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.stock <= p.min_stock AND p.is_active = true;
```

## Functions

### update_updated_at_column()

Trigger function สำหรับอัพเดท `updated_at` อัตโนมัติ

ใช้กับ tables:
- branches
- user_profiles
- categories
- products
- customers
- orders
- branch_settings

## Migration

### Running Migrations

```bash
# ใช้ script
./scripts/init-db.sh

# หรือ manual
psql -h localhost -U postgres -d shopflow -f migrate/init.sql
```

### Migration Files

- `migrate/init.sql` - Initial schema (consolidated)
- `migrate/phase1-schema-simplification.sql` - Phase 1 enhancements
- `migrate/database_schema.sql` - Original schema

## Best Practices

1. **Always use UUIDs** สำหรับ primary keys
2. **Use timestamps** สำหรับ created_at และ updated_at
3. **Use JSONB** สำหรับ flexible configuration
4. **Create indexes** สำหรับ foreign keys และ frequently queried columns
5. **Use constraints** เพื่อ ensure data integrity

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [Migration Guide](./.context/historical-docs/MIGRATION-GUIDE.md) (Phase 1 historical document)

---

**Last Updated**: 2025-01-18

