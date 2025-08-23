-- ShopFlow CMS Database Migration Script
-- Execute this in Supabase SQL Editor to set up the complete database schema
-- 
-- INSTRUCTIONS:
-- 1. Log into your Supabase Dashboard
-- 2. Go to SQL Editor
-- 3. Copy and paste this entire script
-- 4. Click "RUN" to execute
-- 
-- This script will create all tables, indexes, functions, triggers, and RLS policies
-- It also includes sample data to get you started.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- DROP EXISTING TABLES (if they exist) - CAUTION: This will delete all data!
-- ============================================================================
-- Uncomment the following lines if you want to reset the database completely:
-- DROP TABLE IF EXISTS order_items CASCADE;
-- DROP TABLE IF EXISTS orders CASCADE;
-- DROP TABLE IF EXISTS products CASCADE;
-- DROP TABLE IF EXISTS categories CASCADE;
-- DROP TABLE IF EXISTS user_profiles CASCADE;
-- DROP TABLE IF EXISTS branches CASCADE;
-- DROP SEQUENCE IF EXISTS sku_sequence CASCADE;
-- DROP SEQUENCE IF EXISTS order_sequence CASCADE;

-- ============================================================================
-- CREATE TABLES
-- ============================================================================

-- 1. Branches table
CREATE TABLE IF NOT EXISTS branches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. User profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'staff')),
  branch_id UUID REFERENCES branches(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Products table (core feature)
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sku TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  discount_price DECIMAL(10,2) CHECK (discount_price >= 0 AND discount_price <= price),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  min_stock INTEGER DEFAULT 5 CHECK (min_stock >= 0),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock')),
  images TEXT[], -- Array of image URLs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- 5. Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  tax DECIMAL(10,2) DEFAULT 0 CHECK (tax >= 0),
  total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
  payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'e_wallet')),
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  branch_id UUID REFERENCES branches(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL, -- Store at time of order
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0)
);

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_name ON products USING GIN (to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock) WHERE stock <= min_stock;

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_branch ON orders(branch_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_branch ON user_profiles(branch_id);

-- ============================================================================
-- CREATE SEQUENCES
-- ============================================================================

CREATE SEQUENCE IF NOT EXISTS sku_sequence START 1;
CREATE SEQUENCE IF NOT EXISTS order_sequence START 1;

-- ============================================================================
-- CREATE FUNCTIONS
-- ============================================================================

-- Auto-generate SKU if not provided
CREATE OR REPLACE FUNCTION generate_sku()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sku IS NULL OR NEW.sku = '' THEN
    NEW.sku := 'SKU-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(nextval('sku_sequence')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('order_sequence')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-update stock status based on stock level
CREATE OR REPLACE FUNCTION update_product_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stock = 0 AND NEW.status = 'active' THEN
    NEW.status := 'out_of_stock';
  ELSIF NEW.stock > 0 AND NEW.status = 'out_of_stock' THEN
    NEW.status := 'active';
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CREATE TRIGGERS
-- ============================================================================

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS products_generate_sku ON products;
DROP TRIGGER IF EXISTS products_update_status ON products;
DROP TRIGGER IF EXISTS orders_generate_number ON orders;
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
DROP TRIGGER IF EXISTS update_branches_updated_at ON branches;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;

-- Create triggers
CREATE TRIGGER products_generate_sku
  BEFORE INSERT ON products
  FOR EACH ROW EXECUTE FUNCTION generate_sku();

CREATE TRIGGER products_update_status
  BEFORE INSERT OR UPDATE OF stock ON products
  FOR EACH ROW EXECUTE FUNCTION update_product_status();

CREATE TRIGGER orders_generate_number
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Update timestamp triggers
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_branches_updated_at
  BEFORE UPDATE ON branches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE RLS POLICIES
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage profiles" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated users can view categories" ON categories;
DROP POLICY IF EXISTS "Staff and admins can manage categories" ON categories;
DROP POLICY IF EXISTS "Authenticated users can view active products" ON products;
DROP POLICY IF EXISTS "Staff and admins can manage products" ON products;
DROP POLICY IF EXISTS "Users can view orders" ON orders;
DROP POLICY IF EXISTS "Staff and admins can manage orders" ON orders;
DROP POLICY IF EXISTS "Users can view order items" ON order_items;
DROP POLICY IF EXISTS "Staff and admins can manage order items" ON order_items;
DROP POLICY IF EXISTS "Authenticated users can view branches" ON branches;
DROP POLICY IF EXISTS "Admins can manage branches" ON branches;

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage profiles" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Categories policies (read access for all authenticated users, write for admin/staff)
CREATE POLICY "Authenticated users can view categories" ON categories
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Staff and admins can manage categories" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'staff') AND is_active = true
    )
  );

-- Products policies
CREATE POLICY "Authenticated users can view active products" ON products
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Staff and admins can manage products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'staff') AND is_active = true
    )
  );

-- Orders policies
CREATE POLICY "Users can view orders" ON orders
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Staff and admins can manage orders" ON orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'staff') AND is_active = true
    )
  );

-- Order items policies
CREATE POLICY "Users can view order items" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE id = order_id)
  );

CREATE POLICY "Staff and admins can manage order items" ON order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'staff') AND is_active = true
    )
  );

-- Branches policies
CREATE POLICY "Authenticated users can view branches" ON branches
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage branches" ON branches
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- INSERT SAMPLE DATA
-- ============================================================================

-- Insert default branches (only if none exist)
INSERT INTO branches (name, address, is_active) 
SELECT 'สาขาหลัก', 'ที่อยู่สาขาหลัก', true
WHERE NOT EXISTS (SELECT 1 FROM branches);

INSERT INTO branches (name, address, is_active) 
SELECT 'สาขาสุขุมวิท', '123 ถนนสุขุมวิท แขวงคลองตัน กรุงเทพฯ', true
WHERE NOT EXISTS (SELECT 1 FROM branches WHERE name = 'สาขาสุขุมวิท');

INSERT INTO branches (name, address, is_active) 
SELECT 'สาขาซีคอน', '904 ศูนย์การค้าซีคอนสแควร์ ศรีนครินทร์', true
WHERE NOT EXISTS (SELECT 1 FROM branches WHERE name = 'สาขาซีคอน');

-- Insert default categories (only if none exist)
INSERT INTO categories (name, description, display_order) 
SELECT 'เครื่องดื่ม', 'เครื่องดื่มต่างๆ', 1
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'เครื่องดื่ม');

INSERT INTO categories (name, description, display_order) 
SELECT 'ขนมขบเคี้ยว', 'ขนมและของว่าง', 2
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'ขนมขบเคี้ยว');

INSERT INTO categories (name, description, display_order) 
SELECT 'ของใช้ส่วนตัว', 'สบู่ ยาสีฟัน แชมพู', 3
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'ของใช้ส่วนตัว');

INSERT INTO categories (name, description, display_order) 
SELECT 'อาหารแห้ง', 'บะหมี่กึ่งสำเร็จรูป เส้น', 4
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'อาหารแห้ง');

INSERT INTO categories (name, description, display_order) 
SELECT 'เครื่องปรุงรส', 'น้ำปลา ซอสต่างๆ', 5
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'เครื่องปรุงรส');

-- Insert sample products (only if none exist)
INSERT INTO products (name, price, stock, category_id, description) 
SELECT 'โค้ก 325ml', 15.00, 100, categories.id, 'โค้กกระป๋อง 325 มิลลิลิตร'
FROM categories 
WHERE categories.name = 'เครื่องดื่ม'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'โค้ก 325ml');

INSERT INTO products (name, price, stock, category_id, description) 
SELECT 'เป๊ปซี่ 325ml', 15.00, 80, categories.id, 'เป๊ปซี่กระป๋อง 325 มิลลิลิตร'
FROM categories 
WHERE categories.name = 'เครื่องดื่ม'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'เป๊ปซี่ 325ml');

INSERT INTO products (name, price, stock, category_id, description) 
SELECT 'มาม่าต้มยำกุ้ง', 8.00, 200, categories.id, 'บะหมี่กึ่งสำเร็จรูปรสต้มยำกุ้ง'
FROM categories 
WHERE categories.name = 'อาหารแห้ง'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'มาม่าต้มยำกุ้ง');

INSERT INTO products (name, price, stock, category_id, description) 
SELECT 'ลูกชิ้นปลา', 25.00, 50, categories.id, 'ลูกชิ้นปลาแช่แข็ง'
FROM categories 
WHERE categories.name = 'อาหารแห้ง'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'ลูกชิ้นปลา');

INSERT INTO products (name, price, stock, category_id, description) 
SELECT 'น้ำปลา ตราเรือเขา', 35.00, 30, categories.id, 'น้ำปลาขวด 300ml'
FROM categories 
WHERE categories.name = 'เครื่องปรุงรส'
AND NOT EXISTS (SELECT 1 FROM products WHERE name = 'น้ำปลา ตราเรือเขา');

-- ============================================================================
-- ADD COMMENTS
-- ============================================================================

COMMENT ON TABLE products IS 'สินค้าในระบบ POS';
COMMENT ON TABLE categories IS 'หมวดหมู่สินค้า';
COMMENT ON TABLE orders IS 'คำสั่งซื้อจาก POS';
COMMENT ON TABLE user_profiles IS 'โปรไฟล์ผู้ใช้งาน';
COMMENT ON TABLE branches IS 'ข้อมูลสาขา';

-- ============================================================================
-- MIGRATION COMPLETE MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'ShopFlow Database Migration Completed Successfully!';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Tables created: branches, user_profiles, categories, products, orders, order_items';
  RAISE NOTICE 'Indexes created for optimal performance';
  RAISE NOTICE 'Business logic functions and triggers activated';
  RAISE NOTICE 'Row Level Security (RLS) policies enabled';
  RAISE NOTICE 'Sample data inserted (branches, categories, products)';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Create your first admin user through Supabase Auth';
  RAISE NOTICE '2. Insert their profile in user_profiles table with role="admin"';
  RAISE NOTICE '3. Test the ShopFlow application with real database';
  RAISE NOTICE '============================================';
END $$;