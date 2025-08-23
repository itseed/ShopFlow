-- ShopFlow Database Migration Script
-- Version: 1.0 to 2.0
-- Purpose: Safely migrate existing database to enhanced schema
-- IMPORTANT: Backup your database before running this migration!

-- ==================================================
-- MIGRATION SAFETY CHECKS
-- ==================================================

-- Check if migration has already been run
DO $migration_check$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customers') THEN
        RAISE NOTICE 'Migration appears to have been run already. Customers table exists.';
        RAISE NOTICE 'Please review existing schema before proceeding.';
    END IF;
END $migration_check$;

-- ==================================================
-- STEP 1: CREATE NEW UTILITY FUNCTIONS
-- ==================================================

-- Enhanced SKU generation with category prefix
CREATE OR REPLACE FUNCTION generate_sku()
RETURNS TRIGGER AS $$
DECLARE
    category_prefix TEXT;
    sku_number INTEGER;
BEGIN
    IF NEW.sku IS NULL OR NEW.sku = '' THEN
        -- Get category prefix
        SELECT UPPER(LEFT(name, 3)) INTO category_prefix 
        FROM categories 
        WHERE id = NEW.category_id;
        
        -- Default prefix if no category
        IF category_prefix IS NULL THEN
            category_prefix := 'GEN';
        END IF;
        
        -- Get next sequence number
        SELECT COALESCE(MAX(CAST(SUBSTRING(sku FROM '[0-9]+$') AS INTEGER)), 0) + 1
        INTO sku_number
        FROM products 
        WHERE sku LIKE category_prefix || '-%';
        
        -- Generate SKU
        NEW.sku := category_prefix || '-' || LPAD(sku_number::TEXT, 6, '0');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Enhanced order number generation
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    branch_code TEXT;
    order_date TEXT;
    sequence_num INTEGER;
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        -- Get branch code
        SELECT UPPER(LEFT(name, 3)) INTO branch_code 
        FROM branches 
        WHERE id = NEW.branch_id;
        
        -- Default branch code
        IF branch_code IS NULL THEN
            branch_code := 'DEF';
        END IF;
        
        -- Format date
        order_date := TO_CHAR(NEW.created_at, 'YYYYMMDD');
        
        -- Get sequence for today
        SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
        INTO sequence_num
        FROM orders 
        WHERE order_number LIKE branch_code || '-' || order_date || '-%'
        AND DATE(created_at) = DATE(NEW.created_at);
        
        -- Generate order number: BRN-YYYYMMDD-0001
        NEW.order_number := branch_code || '-' || order_date || '-' || LPAD(sequence_num::TEXT, 4, '0');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
-- STEP 2: ENHANCE EXISTING TABLES
-- ==================================================

-- 2.1 Enhance Branches Table
ALTER TABLE branches ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS manager_name TEXT;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS business_hours JSONB;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS settings JSONB;

-- Update branch codes for existing branches
UPDATE branches 
SET code = UPPER(LEFT(name, 3)) || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 2, '0')
WHERE code IS NULL;

-- Add unique constraint after populating codes
ALTER TABLE branches ADD CONSTRAINT branches_code_key UNIQUE (code);

-- 2.2 Enhance Categories Table (Add hierarchy support)
ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS path TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 0;

-- Update existing categories to root level
UPDATE categories SET level = 0, path = '/' || LOWER(REPLACE(name, ' ', '_')) || '/' WHERE path IS NULL;

-- 2.3 Enhance User Profiles Table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS permissions JSONB;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS settings JSONB;

-- Update role constraint to include new roles
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check 
CHECK (role IN ('admin', 'manager', 'staff', 'cashier'));

-- 2.4 Enhance Products Table significantly
-- Add new columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS barcode TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price NUMERIC(12,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS max_stock INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'pcs';
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight NUMERIC(8,3);
ALTER TABLE products ADD COLUMN IF NOT EXISTS dimensions JSONB;
ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_id UUID;
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_data JSONB;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_trackable BOOLEAN DEFAULT true;

-- Add constraints
ALTER TABLE products ADD CONSTRAINT products_cost_price_check CHECK (cost_price >= 0);
ALTER TABLE products ADD CONSTRAINT products_max_stock_check CHECK (max_stock >= min_stock);
ALTER TABLE products ADD CONSTRAINT products_barcode_key UNIQUE (barcode);

-- Extend price precision
ALTER TABLE products ALTER COLUMN price TYPE NUMERIC(12,2);
ALTER TABLE products ALTER COLUMN discount_price TYPE NUMERIC(12,2);

-- Update status constraint
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_status_check;
ALTER TABLE products ADD CONSTRAINT products_status_check 
CHECK (status IN ('active', 'inactive', 'out_of_stock', 'discontinued'));

-- 2.5 Backup existing orders table structure
CREATE TABLE IF NOT EXISTS orders_backup AS SELECT * FROM orders;

-- 2.6 Enhance Orders Table (this requires careful handling)
-- Add new columns to existing orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_type TEXT DEFAULT 'walk_in';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shop_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shop_type TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC(12,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'paid';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_method TEXT DEFAULT 'pickup';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS sales_rep TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cashier_id UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS internal_notes TEXT;

-- Update constraints for orders
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'confirmed', 'processing', 'ready', 'delivering', 'completed', 'cancelled', 'refunded'));

ALTER TABLE orders ADD CONSTRAINT orders_customer_type_check 
CHECK (customer_type IN ('registered', 'walk_in', 'phone_order', 'repeat_customer'));

ALTER TABLE orders ADD CONSTRAINT orders_shop_type_check 
CHECK (shop_type IN ('convenience_store', 'grocery_store', 'mini_mart', 'supermarket', 'restaurant', 'other'));

ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check 
CHECK (payment_status IN ('pending', 'paid', 'partial', 'overdue', 'refunded'));

ALTER TABLE orders ADD CONSTRAINT orders_priority_check 
CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

ALTER TABLE orders ADD CONSTRAINT orders_delivery_method_check 
CHECK (delivery_method IN ('pickup', 'delivery', 'shipping'));

ALTER TABLE orders ADD CONSTRAINT orders_discount_amount_check CHECK (discount_amount >= 0);
ALTER TABLE orders ADD CONSTRAINT orders_delivery_fee_check CHECK (delivery_fee >= 0);

-- Extend price precision
ALTER TABLE orders ALTER COLUMN subtotal TYPE NUMERIC(12,2);
ALTER TABLE orders ALTER COLUMN tax TYPE NUMERIC(12,2);
ALTER TABLE orders ALTER COLUMN total TYPE NUMERIC(12,2);

-- 2.7 Enhance Order Items Table
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_sku TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_description TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS variant_info JSONB;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(12,2) DEFAULT 0;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS cost_price NUMERIC(12,2);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Extend price precision
ALTER TABLE order_items ALTER COLUMN unit_price TYPE NUMERIC(12,2);
ALTER TABLE order_items ALTER COLUMN total_price TYPE NUMERIC(12,2);

-- Add constraint
ALTER TABLE order_items ADD CONSTRAINT order_items_discount_amount_check CHECK (discount_amount >= 0);

-- Populate SKU for existing order items
UPDATE order_items 
SET product_sku = p.sku 
FROM products p 
WHERE order_items.product_id = p.id AND order_items.product_sku IS NULL;

-- ==================================================
-- STEP 3: CREATE NEW TABLES
-- ==================================================

-- 3.1 Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_code TEXT UNIQUE,
    first_name TEXT,
    last_name TEXT,
    company_name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'Thailand',
    customer_type TEXT DEFAULT 'individual' CHECK (customer_type IN ('individual', 'business')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'vip')),
    credit_limit NUMERIC(12,2) DEFAULT 0,
    current_balance NUMERIC(12,2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_spent NUMERIC(12,2) DEFAULT 0,
    last_order_date TIMESTAMP WITH TIME ZONE,
    loyalty_points INTEGER DEFAULT 0,
    preferred_branch_id UUID REFERENCES branches(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 3.2 Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_code TEXT UNIQUE,
    name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'Thailand',
    tax_id TEXT,
    payment_terms TEXT,
    credit_limit NUMERIC(12,2) DEFAULT 0,
    current_balance NUMERIC(12,2) DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 3.3 Stock Movements Table
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    movement_type TEXT NOT NULL CHECK (movement_type IN ('sale', 'purchase', 'adjustment', 'return', 'transfer', 'waste', 'initial')),
    quantity_change INTEGER NOT NULL,
    quantity_before INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,
    unit_cost NUMERIC(12,2),
    total_value NUMERIC(12,2),
    reference_type TEXT CHECK (reference_type IN ('order', 'purchase_order', 'adjustment', 'transfer')),
    reference_id UUID,
    reference_number TEXT,
    reason TEXT,
    notes TEXT,
    branch_id UUID REFERENCES branches(id),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.4 Purchase Orders Table
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_number TEXT UNIQUE NOT NULL,
    supplier_id UUID NOT NULL REFERENCES suppliers(id),
    branch_id UUID REFERENCES branches(id),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'confirmed', 'partial', 'completed', 'cancelled')),
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax NUMERIC(12,2) DEFAULT 0,
    shipping_cost NUMERIC(12,2) DEFAULT 0,
    total NUMERIC(12,2) NOT NULL DEFAULT 0,
    order_date DATE DEFAULT CURRENT_DATE,
    expected_date DATE,
    received_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- 3.5 Purchase Order Items Table
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity_ordered INTEGER NOT NULL CHECK (quantity_ordered > 0),
    quantity_received INTEGER DEFAULT 0 CHECK (quantity_received >= 0),
    unit_cost NUMERIC(12,2) NOT NULL CHECK (unit_cost >= 0),
    total_cost NUMERIC(12,2) NOT NULL CHECK (total_cost >= 0),
    received_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.6 Product Variants Table
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku TEXT UNIQUE,
    barcode TEXT UNIQUE,
    variant_name TEXT NOT NULL,
    variant_options JSONB NOT NULL,
    price_adjustment NUMERIC(12,2) DEFAULT 0,
    cost_adjustment NUMERIC(12,2) DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    min_stock INTEGER DEFAULT 0,
    weight NUMERIC(8,3),
    dimensions JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.7 Promotions Table
CREATE TABLE IF NOT EXISTS promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    promo_code TEXT UNIQUE,
    promotion_type TEXT NOT NULL CHECK (promotion_type IN ('percentage', 'fixed_amount', 'buy_x_get_y', 'bulk_discount')),
    discount_value NUMERIC(12,2) NOT NULL,
    minimum_amount NUMERIC(12,2) DEFAULT 0,
    maximum_discount NUMERIC(12,2),
    applicable_categories UUID[],
    applicable_products UUID[],
    customer_types TEXT[],
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    usage_limit INTEGER,
    usage_count INTEGER DEFAULT 0,
    customer_usage_limit INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    applies_to TEXT DEFAULT 'all' CHECK (applies_to IN ('all', 'specific_categories', 'specific_products')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 3.8 Payment Transactions Table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('payment', 'refund', 'partial_refund')),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'e_wallet', 'credit', 'points')),
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    currency TEXT DEFAULT 'THB',
    reference_number TEXT,
    card_type TEXT,
    card_last_four TEXT,
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    exchange_rate NUMERIC(8,4),
    fee NUMERIC(12,2) DEFAULT 0,
    net_amount NUMERIC(12,2),
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_by UUID REFERENCES auth.users(id),
    notes TEXT,
    meta_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.9 System Tables
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    key TEXT NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category, key)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    user_id UUID REFERENCES auth.users(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================================================
-- STEP 4: ADD FOREIGN KEY CONSTRAINTS
-- ==================================================

-- Add supplier foreign key to products (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'products_supplier_id_fkey') THEN
        ALTER TABLE products ADD CONSTRAINT products_supplier_id_fkey 
        FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add customer foreign key to orders (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'orders_customer_id_fkey') THEN
        ALTER TABLE orders ADD CONSTRAINT orders_customer_id_fkey 
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add cashier foreign key to orders (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'orders_cashier_id_fkey') THEN
        ALTER TABLE orders ADD CONSTRAINT orders_cashier_id_fkey 
        FOREIGN KEY (cashier_id) REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ==================================================
-- STEP 5: CREATE ENHANCED INDEXES
-- ==================================================

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_total ON orders(total);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(DATE(created_at));
CREATE INDEX IF NOT EXISTS idx_orders_cashier ON orders(cashier_id);

-- Stock movements indexes
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stock_movements_branch ON stock_movements(branch_id);

-- Customers indexes
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_type ON customers(customer_type);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);

-- Categories hierarchy indexes
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_path ON categories(path);
CREATE INDEX IF NOT EXISTS idx_categories_level ON categories(level);

-- Performance indexes for reporting
CREATE INDEX IF NOT EXISTS idx_orders_branch_date ON orders(branch_id, DATE(created_at));
CREATE INDEX IF NOT EXISTS idx_payment_transactions_order ON payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_promotions_dates ON promotions(start_date, end_date) WHERE is_active = true;

-- ==================================================
-- STEP 6: CREATE TRIGGERS
-- ==================================================

-- Update timestamp triggers for new tables
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON promotions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ==================================================
-- STEP 7: CREATE VIEWS
-- ==================================================

-- Enhanced low stock products view
CREATE OR REPLACE VIEW low_stock_products AS
SELECT 
    p.*,
    c.name as category_name,
    s.name as supplier_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN suppliers s ON p.supplier_id = s.id
WHERE p.stock <= COALESCE(p.min_stock, 5) 
AND p.is_trackable = true 
AND p.status = 'active';

-- Daily sales summary view
CREATE OR REPLACE VIEW daily_sales_summary AS
SELECT 
    DATE(o.created_at) as sale_date,
    o.branch_id,
    b.name as branch_name,
    COUNT(o.id) as order_count,
    SUM(o.total) as total_sales,
    SUM(o.subtotal) as subtotal,
    SUM(o.tax) as total_tax,
    SUM(o.discount_amount) as total_discounts,
    AVG(o.total) as average_order_value
FROM orders o
LEFT JOIN branches b ON o.branch_id = b.id
WHERE o.status IN ('completed', 'delivered')
GROUP BY DATE(o.created_at), o.branch_id, b.name;

-- Inventory value view
CREATE OR REPLACE VIEW inventory_value AS
SELECT 
    p.id,
    p.name,
    p.sku,
    p.stock,
    p.cost_price,
    p.price,
    (p.stock * COALESCE(p.cost_price, 0)) as inventory_value,
    (p.stock * p.price) as retail_value,
    c.name as category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_trackable = true 
AND p.status != 'discontinued';

-- ==================================================
-- STEP 8: MIGRATE EXISTING DATA
-- ==================================================

-- Create initial stock movements for existing products
INSERT INTO stock_movements (
    product_id,
    movement_type,
    quantity_change,
    quantity_before,
    quantity_after,
    reason,
    created_by,
    created_at
)
SELECT 
    id,
    'initial',
    stock,
    0,
    stock,
    'Initial stock from migration',
    created_by,
    created_at
FROM products
WHERE stock > 0 
AND NOT EXISTS (
    SELECT 1 FROM stock_movements 
    WHERE product_id = products.id 
    AND movement_type = 'initial'
);

-- Generate customer codes for any customers that might exist
UPDATE customers 
SET customer_code = 'CUST-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 6, '0')
WHERE customer_code IS NULL;

-- Generate supplier codes for any suppliers that might exist
UPDATE suppliers 
SET supplier_code = 'SUPP-' || LPAD(ROW_NUMBER() OVER (ORDER BY created_at)::TEXT, 4, '0')
WHERE supplier_code IS NULL;

-- ==================================================
-- STEP 9: INSERT DEFAULT SYSTEM SETTINGS
-- ==================================================

INSERT INTO system_settings (category, key, value, description, is_public) VALUES
('general', 'company_name', '"ShopFlow POS"', 'Company name displayed in the system', true),
('general', 'currency', '"THB"', 'Default currency', true),
('general', 'tax_rate', '7', 'Default tax rate percentage', true),
('pos', 'auto_print_receipt', 'true', 'Automatically print receipt after order completion', false),
('pos', 'allow_negative_stock', 'false', 'Allow selling products with negative stock', false),
('inventory', 'auto_update_cost', 'true', 'Automatically update product cost from latest purchase', false),
('inventory', 'low_stock_alert_days', '7', 'Days before stock runs out to trigger alert', false)
ON CONFLICT (category, key) DO NOTHING;

-- ==================================================
-- STEP 10: UPDATE ROW LEVEL SECURITY POLICIES
-- ==================================================

-- Grant permissions on new tables
GRANT ALL ON customers TO authenticated;
GRANT ALL ON suppliers TO authenticated;
GRANT ALL ON stock_movements TO authenticated;
GRANT ALL ON purchase_orders TO authenticated;
GRANT ALL ON purchase_order_items TO authenticated;
GRANT ALL ON product_variants TO authenticated;
GRANT ALL ON promotions TO authenticated;
GRANT ALL ON payment_transactions TO authenticated;
GRANT ALL ON system_settings TO authenticated;
GRANT ALL ON audit_logs TO authenticated;

-- Grant select on views
GRANT SELECT ON low_stock_products TO authenticated;
GRANT SELECT ON daily_sales_summary TO authenticated;
GRANT SELECT ON inventory_value TO authenticated;

-- ==================================================
-- MIGRATION COMPLETION
-- ==================================================

-- Log migration completion
DO $migration_log$
BEGIN
    RAISE NOTICE 'Database migration to version 2.0 completed successfully!';
    RAISE NOTICE 'New tables created: customers, suppliers, stock_movements, purchase_orders, etc.';
    RAISE NOTICE 'Existing tables enhanced with new columns and constraints.';
    RAISE NOTICE 'Please review the changes and test thoroughly before using in production.';
END $migration_log$;

-- Create a migration record
INSERT INTO system_settings (category, key, value, description) VALUES
('system', 'schema_version', '"2.0"', 'Current database schema version')
ON CONFLICT (category, key) DO UPDATE SET 
value = '"2.0"',
updated_at = NOW();

-- ==================================================
-- POST-MIGRATION RECOMMENDATIONS
-- ==================================================

/*
POST-MIGRATION CHECKLIST:

1. ✅ Verify all existing data is intact
2. ✅ Test basic operations (create/read/update/delete)
3. ✅ Check that all foreign key relationships work
4. ✅ Verify indexes are created and working
5. ✅ Test the low_stock_products view
6. ✅ Verify triggers are working (SKU generation, timestamps)
7. ✅ Check RLS policies are applied correctly
8. ✅ Test with your application to ensure compatibility

NEXT STEPS:
1. Update your TypeScript types to match new schema
2. Update API services to use new tables and columns
3. Create seed data for testing
4. Update frontend components to use new features
5. Implement proper error handling for new constraints

NEW FEATURES AVAILABLE:
- Customer management and loyalty tracking
- Supplier management and purchase orders
- Complete inventory audit trail
- Product variants support
- Promotional pricing system
- Enhanced order management
- Hierarchical categories
- Comprehensive reporting views
*/