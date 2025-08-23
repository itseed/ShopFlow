-- ShopFlow Enhanced Schema Sample Data (Essential)
-- Run this AFTER the migration script

-- ==================================================
-- SAMPLE SUPPLIERS
-- ==================================================
INSERT INTO suppliers (supplier_code, name, contact_person, email, phone, payment_terms, status, rating) VALUES
('SUPP-0001', 'บริษัท ยูนิลีเวอร์ ไทย จำกัด', 'คุณสมชาย การตลาด', 'procurement@unilever.co.th', '02-123-4567', 'Net 30', 'active', 5),
('SUPP-0002', 'บริษัท เนสท์เล่ ไทย จำกัด', 'คุณมาลี ขายดี', 'sales@nestle.co.th', '02-234-5678', 'Net 45', 'active', 5),
('SUPP-0003', 'ห้างหุ้นส่วนจำกัด ผลไม้สวนไทย', 'คุณสมปอง เกษตรกร', 'fruit@thai-garden.com', '081-234-5678', 'Net 7', 'active', 4)
ON CONFLICT (supplier_code) DO NOTHING;

-- ==================================================
-- SAMPLE CUSTOMERS
-- ==================================================
INSERT INTO customers (customer_code, first_name, last_name, company_name, email, phone, customer_type, status, total_orders, total_spent, loyalty_points) VALUES
('CUST-000001', 'สมชาย', 'ใจดี', NULL, 'somchai@email.com', '081-234-5678', 'individual', 'vip', 15, 12500.00, 1250),
('CUST-000002', 'มาลี', 'รักงาน', 'ร้านสะดวกซื้อมาลี', 'malee.shop@gmail.com', '089-876-5432', 'business', 'active', 25, 85000.00, 850),
('CUST-000003', 'วิชัย', 'ทำดี', NULL, 'wichai.good@hotmail.com', '092-345-6789', 'individual', 'active', 8, 4200.00, 420)
ON CONFLICT (customer_code) DO NOTHING;

-- ==================================================
-- ENHANCED PRODUCTS
-- ==================================================
-- Update existing products with new fields
UPDATE products SET 
    barcode = '8851234567890',
    cost_price = 35.00,
    short_description = 'กาแฟลาเต้เข้มข้น หอมกรุ่น',
    unit = 'แก้ว',
    brand = 'Coffee House',
    tags = ARRAY['coffee', 'hot', 'latte', 'premium'],
    is_featured = true,
    supplier_id = (SELECT id FROM suppliers WHERE supplier_code = 'SUPP-0002')
WHERE name = 'กาแฟลาเต้';

-- Add new products
INSERT INTO products (sku, barcode, name, short_description, price, cost_price, stock, min_stock, unit, category_id, supplier_id, brand, tags, is_featured) VALUES
('COF-000002', '8851234567892', 'เอสเปรสโซ่ดับเบิล', 'เอสเปรสโซ่เข้มข้นพิเศษ', 55.00, 30.00, 40, 8, 'shot',
 (SELECT id FROM categories WHERE name = 'เครื่องดื่ม'), 
 (SELECT id FROM suppliers WHERE supplier_code = 'SUPP-0002'), 
 'Coffee House', ARRAY['coffee', 'espresso', 'strong'], true),

('DRK-000001', '8851234567893', 'โค้กกระป๋อง 325ml', 'โค้กรสชาติต้นตำรับ', 18.00, 12.00, 200, 50, 'กระป๋อง',
 (SELECT id FROM categories WHERE name = 'เครื่องดื่ม'),
 (SELECT id FROM suppliers WHERE supplier_code = 'SUPP-0001'),
 'Coca-Cola', ARRAY['cola', 'soft-drink'], false)
ON CONFLICT (sku) DO NOTHING;

-- ==================================================
-- SAMPLE PROMOTIONS
-- ==================================================
INSERT INTO promotions (name, promo_code, promotion_type, discount_value, minimum_amount, start_date, end_date, is_active) VALUES
('ลด 10% สำหรับเครื่องดื่ม', 'DRINK10', 'percentage', 10.00, 100.00, NOW(), NOW() + INTERVAL '30 days', true),
('ซื้อครบ 1000 ลด 100', 'SAVE100', 'fixed_amount', 100.00, 1000.00, NOW(), NOW() + INTERVAL '45 days', true)
ON CONFLICT (promo_code) DO NOTHING;

-- ==================================================
-- SAMPLE ENHANCED ORDER
-- ==================================================
DO $$
DECLARE
    sample_order_id UUID;
    customer_id UUID;
    branch_id UUID;
    product_id UUID;
BEGIN
    SELECT id INTO customer_id FROM customers WHERE customer_code = 'CUST-000001';
    SELECT id INTO branch_id FROM branches LIMIT 1;
    
    -- Create enhanced order
    INSERT INTO orders (
        customer_id, customer_name, customer_phone, customer_type,
        subtotal, discount_amount, tax, total, 
        payment_method, payment_status, status, priority,
        delivery_method, sales_rep, branch_id
    ) VALUES (
        customer_id, 'สมชาย ใจดี', '081-234-5678', 'registered',
        200.00, 20.00, 12.60, 192.60,
        'card', 'paid', 'completed', 'normal',
        'pickup', 'พนักงานขาย A', branch_id
    ) RETURNING id INTO sample_order_id;
    
    -- Add order items with cost tracking
    SELECT id INTO product_id FROM products WHERE name = 'กาแฟลาเต้';
    INSERT INTO order_items (order_id, product_id, product_sku, product_name, quantity, unit_price, total_price, cost_price)
    VALUES (sample_order_id, product_id, 'COF-000001', 'กาแฟลาเต้', 2, 65.00, 130.00, 35.00);
    
    SELECT id INTO product_id FROM products WHERE name = 'เอสเปรสโซ่ดับเบิล';
    INSERT INTO order_items (order_id, product_id, product_sku, product_name, quantity, unit_price, total_price, cost_price)
    VALUES (sample_order_id, product_id, 'COF-000002', 'เอสเปรสโซ่ดับเบิล', 1, 55.00, 55.00, 30.00);
    
    -- Create payment transaction
    INSERT INTO payment_transactions (order_id, transaction_type, payment_method, amount, status)
    VALUES (sample_order_id, 'payment', 'card', 192.60, 'completed');
    
END $$;

-- ==================================================
-- SAMPLE PURCHASE ORDER
-- ==================================================
DO $$
DECLARE
    po_id UUID;
    supplier_id UUID;
    branch_id UUID;
BEGIN
    SELECT id INTO supplier_id FROM suppliers WHERE supplier_code = 'SUPP-0002';
    SELECT id INTO branch_id FROM branches LIMIT 1;
    
    INSERT INTO purchase_orders (po_number, supplier_id, branch_id, status, subtotal, tax, total, order_date)
    VALUES ('PO-20250823-001', supplier_id, branch_id, 'completed', 5000.00, 350.00, 5350.00, CURRENT_DATE - 5)
    RETURNING id INTO po_id;
    
    -- Add PO items
    INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity_ordered, quantity_received, unit_cost, total_cost)
    SELECT po_id, id, 50, 50, cost_price, cost_price * 50
    FROM products WHERE sku = 'COF-000001';
    
END $$;

-- ==================================================
-- STOCK MOVEMENTS FOR AUDIT TRAIL
-- ==================================================
INSERT INTO stock_movements (product_id, movement_type, quantity_change, quantity_before, quantity_after, reference_type, reason, created_by)
SELECT 
    p.id, 'initial', p.stock, 0, p.stock, 'adjustment', 'Initial stock migration', p.created_by
FROM products p
WHERE NOT EXISTS (SELECT 1 FROM stock_movements WHERE product_id = p.id AND movement_type = 'initial');

-- ==================================================
-- SYSTEM SETTINGS
-- ==================================================
INSERT INTO system_settings (category, key, value, description, is_public) VALUES
('general', 'company_name', '"ShopFlow POS"', 'Company name', true),
('general', 'currency', '"THB"', 'Default currency', true),
('general', 'tax_rate', '7', 'Default tax rate %', true),
('pos', 'auto_print_receipt', 'true', 'Auto print receipt', false),
('inventory', 'low_stock_alert_days', '7', 'Low stock alert threshold', false)
ON CONFLICT (category, key) DO NOTHING;

-- Update schema version
INSERT INTO system_settings (category, key, value, description) VALUES
('system', 'schema_version', '"2.0"', 'Database schema version')
ON CONFLICT (category, key) DO UPDATE SET value = '"2.0"', updated_at = NOW();

-- Success message
SELECT 'Enhanced sample data inserted successfully!' as status;