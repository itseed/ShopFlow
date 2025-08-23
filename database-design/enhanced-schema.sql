-- ShopFlow Enhanced Database Schema
-- Version: 2.0
-- Purpose: Complete POS & CMS database structure with comprehensive business logic

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ==================================================
-- UTILITY FUNCTIONS
-- ==================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Generate SKU function (enhanced)
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

-- Generate order number function (enhanced)
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

-- Auto-update product status based on stock
CREATE OR REPLACE FUNCTION update_product_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-set status based on stock levels
    IF NEW.stock = 0 THEN
        NEW.status = 'out_of_stock';
    ELSIF NEW.stock <= COALESCE(NEW.min_stock, 5) AND OLD.status = 'out_of_stock' THEN
        NEW.status = 'active'; -- Restore to active when restocked
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
-- CORE TABLES (Enhanced)
-- ==================================================

-- Enhanced Branches Table
DROP TABLE IF EXISTS branches CASCADE;
CREATE TABLE branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL, -- Branch code for order numbering
    address TEXT,
    phone TEXT,
    email TEXT,
    manager_name TEXT,
    is_active BOOLEAN DEFAULT true,
    business_hours JSONB, -- Store opening hours
    settings JSONB, -- Branch-specific settings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Categories Table (Hierarchical)
DROP TABLE IF EXISTS categories CASCADE;
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    image_url TEXT,
    icon TEXT, -- Icon name for UI
    path TEXT, -- Materialized path for hierarchy (e.g., '/electronics/phones/')
    level INTEGER DEFAULT 0, -- Hierarchy level
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced User Profiles Table
DROP TABLE IF EXISTS user_profiles CASCADE;
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'staff', 'cashier')),
    branch_id UUID REFERENCES branches(id),
    permissions JSONB, -- Specific permissions
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    settings JSONB, -- User preferences
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Products Table
DROP TABLE IF EXISTS products CASCADE;
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT UNIQUE,
    barcode TEXT UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
    price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    cost_price NUMERIC(12,2) CHECK (cost_price >= 0),
    discount_price NUMERIC(12,2) CHECK (discount_price >= 0 AND discount_price <= price),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    min_stock INTEGER DEFAULT 5 CHECK (min_stock >= 0),
    max_stock INTEGER CHECK (max_stock >= min_stock),
    unit TEXT DEFAULT 'pcs', -- Unit of measurement
    weight NUMERIC(8,3), -- For shipping calculations
    dimensions JSONB, -- {length, width, height}
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    supplier_id UUID, -- Will reference suppliers table
    brand TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock', 'discontinued')),
    images TEXT[], -- Array of image URLs
    tags TEXT[], -- Searchable tags
    meta_data JSONB, -- Additional product data
    is_featured BOOLEAN DEFAULT false,
    is_trackable BOOLEAN DEFAULT true, -- Whether to track stock
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- ==================================================
-- CUSTOMER MANAGEMENT
-- ==================================================

-- Customers Table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_code TEXT UNIQUE, -- Auto-generated customer code
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

-- ==================================================
-- SUPPLIER MANAGEMENT
-- ==================================================

-- Suppliers Table
CREATE TABLE suppliers (
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
    payment_terms TEXT, -- e.g., "Net 30"
    credit_limit NUMERIC(12,2) DEFAULT 0,
    current_balance NUMERIC(12,2) DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Add supplier reference to products
ALTER TABLE products ADD CONSTRAINT products_supplier_id_fkey 
FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL;

-- ==================================================
-- ENHANCED ORDER MANAGEMENT
-- ==================================================

-- Enhanced Orders Table
DROP TABLE IF EXISTS orders CASCADE;
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    
    -- Customer Information
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_name TEXT,
    customer_phone TEXT,
    customer_email TEXT,
    customer_type TEXT DEFAULT 'walk_in' CHECK (customer_type IN ('registered', 'walk_in', 'phone_order', 'repeat_customer')),
    
    -- Shop Information (for B2B)
    shop_name TEXT,
    shop_type TEXT CHECK (shop_type IN ('convenience_store', 'grocery_store', 'mini_mart', 'supermarket', 'restaurant', 'other')),
    
    -- Order Details
    subtotal NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
    discount_amount NUMERIC(12,2) DEFAULT 0 CHECK (discount_amount >= 0),
    tax NUMERIC(12,2) DEFAULT 0 CHECK (tax >= 0),
    delivery_fee NUMERIC(12,2) DEFAULT 0 CHECK (delivery_fee >= 0),
    total NUMERIC(12,2) NOT NULL CHECK (total >= 0),
    
    -- Payment & Status
    payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'e_wallet', 'credit')),
    payment_status TEXT DEFAULT 'paid' CHECK (payment_status IN ('pending', 'paid', 'partial', 'overdue', 'refunded')),
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'confirmed', 'processing', 'ready', 'delivering', 'completed', 'cancelled', 'refunded')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Delivery Information
    delivery_method TEXT DEFAULT 'pickup' CHECK (delivery_method IN ('pickup', 'delivery', 'shipping')),
    delivery_address TEXT,
    delivery_date TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    
    -- Staff & Branch
    branch_id UUID REFERENCES branches(id),
    sales_rep TEXT, -- Staff name who handled the order
    cashier_id UUID REFERENCES auth.users(id),
    
    -- Notes
    notes TEXT, -- Customer-visible notes
    internal_notes TEXT, -- Internal staff notes
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Enhanced Order Items Table
DROP TABLE IF EXISTS order_items CASCADE;
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    
    -- Product snapshot (for historical accuracy)
    product_sku TEXT,
    product_name TEXT NOT NULL,
    product_description TEXT,
    variant_info JSONB, -- Product variant details if applicable
    
    -- Pricing & Quantity
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    discount_amount NUMERIC(12,2) DEFAULT 0 CHECK (discount_amount >= 0),
    total_price NUMERIC(12,2) NOT NULL CHECK (total_price >= 0),
    
    -- Cost for profit calculation
    cost_price NUMERIC(12,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================================================
-- INVENTORY MANAGEMENT
-- ==================================================

-- Stock Movements Table (Critical for audit trail)
CREATE TABLE stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    movement_type TEXT NOT NULL CHECK (movement_type IN ('sale', 'purchase', 'adjustment', 'return', 'transfer', 'waste', 'initial')),
    quantity_change INTEGER NOT NULL, -- Positive for increase, negative for decrease
    quantity_before INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,
    unit_cost NUMERIC(12,2),
    total_value NUMERIC(12,2),
    
    -- Reference information
    reference_type TEXT CHECK (reference_type IN ('order', 'purchase_order', 'adjustment', 'transfer')),
    reference_id UUID, -- Can reference orders, purchase_orders, etc.
    reference_number TEXT, -- Human-readable reference
    
    -- Additional details
    reason TEXT,
    notes TEXT,
    
    -- Location & Staff
    branch_id UUID REFERENCES branches(id),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase Orders Table
CREATE TABLE purchase_orders (
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

-- Purchase Order Items Table
CREATE TABLE purchase_order_items (
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

-- Inventory Adjustments Table
CREATE TABLE inventory_adjustments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adjustment_number TEXT UNIQUE NOT NULL,
    branch_id UUID REFERENCES branches(id),
    
    adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('count', 'damage', 'theft', 'expiry', 'correction', 'other')),
    reason TEXT NOT NULL,
    
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'applied')),
    
    total_items INTEGER DEFAULT 0,
    total_value_change NUMERIC(12,2) DEFAULT 0,
    
    adjustment_date DATE DEFAULT CURRENT_DATE,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Inventory Adjustment Items Table
CREATE TABLE inventory_adjustment_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adjustment_id UUID NOT NULL REFERENCES inventory_adjustments(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    
    expected_quantity INTEGER NOT NULL,
    actual_quantity INTEGER NOT NULL,
    quantity_difference INTEGER NOT NULL, -- actual - expected
    unit_cost NUMERIC(12,2),
    value_difference NUMERIC(12,2),
    
    reason TEXT,
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================================================
-- PRODUCT VARIANTS & OPTIONS
-- ==================================================

-- Product Variants Table (for products with multiple options)
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku TEXT UNIQUE,
    barcode TEXT UNIQUE,
    
    variant_name TEXT NOT NULL, -- e.g., "Large - Red"
    variant_options JSONB NOT NULL, -- {"size": "Large", "color": "Red"}
    
    price_adjustment NUMERIC(12,2) DEFAULT 0, -- Added to base price
    cost_adjustment NUMERIC(12,2) DEFAULT 0, -- Added to base cost
    
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    min_stock INTEGER DEFAULT 0,
    
    weight NUMERIC(8,3),
    dimensions JSONB,
    
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================================================
-- PROMOTIONS & DISCOUNTS
-- ==================================================

-- Promotions Table
CREATE TABLE promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    promo_code TEXT UNIQUE,
    
    promotion_type TEXT NOT NULL CHECK (promotion_type IN ('percentage', 'fixed_amount', 'buy_x_get_y', 'bulk_discount')),
    discount_value NUMERIC(12,2) NOT NULL,
    
    -- Conditions
    minimum_amount NUMERIC(12,2) DEFAULT 0,
    maximum_discount NUMERIC(12,2),
    applicable_categories UUID[], -- Array of category IDs
    applicable_products UUID[], -- Array of product IDs
    customer_types TEXT[], -- Array of customer types
    
    -- Validity
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    usage_limit INTEGER, -- Total usage limit
    usage_count INTEGER DEFAULT 0,
    customer_usage_limit INTEGER DEFAULT 1, -- Per customer limit
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    applies_to TEXT DEFAULT 'all' CHECK (applies_to IN ('all', 'specific_categories', 'specific_products')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- ==================================================
-- PAYMENT TRANSACTIONS
-- ==================================================

-- Payment Transactions Table (for complex payment scenarios)
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('payment', 'refund', 'partial_refund')),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'e_wallet', 'credit', 'points')),
    
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    currency TEXT DEFAULT 'THB',
    
    -- Payment details
    reference_number TEXT, -- Bank reference, card transaction ID, etc.
    card_type TEXT, -- Visa, Mastercard, etc.
    card_last_four TEXT,
    
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    
    -- Additional info
    exchange_rate NUMERIC(8,4),
    fee NUMERIC(12,2) DEFAULT 0,
    net_amount NUMERIC(12,2),
    
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_by UUID REFERENCES auth.users(id),
    
    notes TEXT,
    meta_data JSONB, -- Additional payment gateway data
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================================================
-- SYSTEM TABLES
-- ==================================================

-- System Settings Table
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL, -- 'general', 'pos', 'inventory', 'accounting'
    key TEXT NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false, -- Whether setting can be accessed by frontend
    
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(category, key)
);

-- Audit Log Table
CREATE TABLE audit_logs (
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

-- Reports Cache Table (for performance)
CREATE TABLE reports_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type TEXT NOT NULL,
    parameters JSONB NOT NULL,
    data JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- ==================================================
-- INDEXES FOR PERFORMANCE
-- ==================================================

-- Products indexes
CREATE INDEX idx_products_name_search ON products USING gin(to_tsvector('english', name));
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_stock_low ON products(stock) WHERE stock <= min_stock;
CREATE INDEX idx_products_supplier ON products(supplier_id);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;

-- Orders indexes
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_branch ON orders(branch_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_date ON orders(DATE(created_at));
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_total ON orders(total);

-- Order items indexes
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- Stock movements indexes
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX idx_stock_movements_date ON stock_movements(created_at DESC);
CREATE INDEX idx_stock_movements_branch ON stock_movements(branch_id);

-- Customers indexes
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_type ON customers(customer_type);
CREATE INDEX idx_customers_status ON customers(status);

-- Categories hierarchy
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_path ON categories(path);
CREATE INDEX idx_categories_level ON categories(level);

-- Performance indexes for reporting
CREATE INDEX idx_orders_branch_date ON orders(branch_id, DATE(created_at));
CREATE INDEX idx_payment_transactions_order ON payment_transactions(order_id);
CREATE INDEX idx_promotions_dates ON promotions(start_date, end_date) WHERE is_active = true;

-- ==================================================
-- TRIGGERS
-- ==================================================

-- Update timestamp triggers
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON branches FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_inventory_adjustments_updated_at BEFORE UPDATE ON inventory_adjustments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON promotions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-generation triggers
CREATE TRIGGER products_generate_sku BEFORE INSERT ON products FOR EACH ROW EXECUTE FUNCTION generate_sku();
CREATE TRIGGER orders_generate_number BEFORE INSERT ON orders FOR EACH ROW EXECUTE FUNCTION generate_order_number();
CREATE TRIGGER products_update_status BEFORE INSERT OR UPDATE OF stock ON products FOR EACH ROW EXECUTE FUNCTION update_product_status();

-- ==================================================
-- VIEWS FOR COMMON QUERIES
-- ==================================================

-- Low stock products view
CREATE OR REPLACE VIEW low_stock_products AS
SELECT 
    p.*,
    c.name as category_name,
    s.name as supplier_name,
    b.name as branch_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN suppliers s ON p.supplier_id = s.id
LEFT JOIN branches b ON TRUE -- All branches for now
WHERE p.stock <= COALESCE(p.min_stock, 5) 
AND p.is_trackable = true 
AND p.status = 'active';

-- Sales summary view
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

-- This completes the enhanced schema design
-- Next step: Create migration script to update existing database