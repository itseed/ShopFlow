-- Sample data for reports testing
-- This script adds sample data to make reports functional

-- Insert sample categories
INSERT INTO categories (id, name, description, display_order, status, created_at, updated_at) VALUES
('cat-1', 'เครื่องดื่ม', 'เครื่องดื่มทุกประเภท เช่น กาแฟ ชา น้ำผลไม้', 1, 'active', NOW(), NOW()),
('cat-2', 'อาหาร', 'อาหารคาว อาหารหวาน ขนมต่างๆ', 2, 'active', NOW(), NOW()),
('cat-3', 'ขนมปัง', 'ขนมปังสด ขนมปังโฮลวีท ขนมปังหวาน', 3, 'active', NOW(), NOW()),
('cat-4', 'สลัด', 'สลัดผลไม้ สลัดผัก อาหารเพื่อสุขภาพ', 4, 'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample products
INSERT INTO products (id, name, description, sku, price, cost_price, stock_quantity, min_stock_level, category_id, status, created_at, updated_at) VALUES
('prod-1', 'น้ำปลา ตราเรือเขา', 'น้ำปลาแท้ 100%', 'NP001', 85.00, 60.00, 50, 10, 'cat-2', 'active', NOW(), NOW()),
('prod-2', 'เป๊ปซี่ 325ml', 'เครื่องดื่มน้ำอัดลม', 'PEPSI001', 15.00, 10.00, 100, 20, 'cat-1', 'active', NOW(), NOW()),
('prod-3', 'ลูกชิ้นปลา', 'ลูกชิ้นปลาแท้', 'LC001', 120.00, 80.00, 30, 5, 'cat-2', 'active', NOW(), NOW()),
('prod-4', 'ขนมปังโฮลวีท', 'ขนมปังโฮลวีทสด', 'BP001', 25.00, 15.00, 40, 10, 'cat-3', 'active', NOW(), NOW()),
('prod-5', 'สลัดผัก', 'สลัดผักสด', 'SALAD001', 45.00, 25.00, 20, 5, 'cat-4', 'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample customers
INSERT INTO customers (id, name, phone, email, address, customer_type, status, created_at, updated_at) VALUES
('cust-1', 'สมชาย ใจดี', '0812345678', 'somchai@email.com', '123 ถนนสุขุมวิท กรุงเทพฯ', 'registered', 'active', NOW(), NOW()),
('cust-2', 'สมหญิง รักดี', '0823456789', 'somying@email.com', '456 ถนนพหลโยธิน กรุงเทพฯ', 'registered', 'active', NOW(), NOW()),
('cust-3', 'ลูกค้าทั่วไป', NULL, NULL, NULL, 'walk_in', 'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample orders for the last 30 days
INSERT INTO orders (id, order_number, customer_id, customer_phone, total, subtotal, tax_amount, discount_amount, payment_method, payment_status, status, customer_type, shop_type, delivery_method, priority, sales_rep, branch_id, created_at, updated_at) VALUES
-- Today's orders
('order-1', 'ORD001', 'cust-1', '0812345678', 719.00, 700.00, 19.00, 0.00, 'cash', 'paid', 'completed', 'registered', 'retail', 'pickup', 'normal', 'staff1', '03589c8f-bec3-4275-8307-c7b9018443ec', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
('order-2', 'ORD002', 'cust-2', '0823456789', 563.00, 550.00, 13.00, 0.00, 'credit_card', 'paid', 'completed', 'registered', 'retail', 'delivery', 'normal', 'staff2', '03589c8f-bec3-4275-8307-c7b9018443ec', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours'),
('order-3', 'ORD003', NULL, NULL, 425.00, 425.00, 0.00, 0.00, 'cash', 'paid', 'completed', 'walk_in', 'retail', 'pickup', 'normal', 'staff1', '03589c8f-bec3-4275-8307-c7b9018443ec', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),

-- Yesterday's orders
('order-4', 'ORD004', 'cust-1', '0812345678', 850.00, 850.00, 0.00, 0.00, 'cash', 'paid', 'completed', 'registered', 'retail', 'pickup', 'normal', 'staff1', '03589c8f-bec3-4275-8307-c7b9018443ec', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('order-5', 'ORD005', 'cust-2', '0823456789', 1200.00, 1200.00, 0.00, 0.00, 'credit_card', 'paid', 'completed', 'registered', 'retail', 'delivery', 'high', 'staff2', '03589c8f-bec3-4275-8307-c7b9018443ec', NOW() - INTERVAL '1 day 2 hours', NOW() - INTERVAL '1 day 2 hours'),
('order-6', 'ORD006', NULL, NULL, 680.00, 680.00, 0.00, 0.00, 'cash', 'paid', 'completed', 'walk_in', 'retail', 'pickup', 'normal', 'staff1', '03589c8f-bec3-4275-8307-c7b9018443ec', NOW() - INTERVAL '1 day 4 hours', NOW() - INTERVAL '1 day 4 hours'),

-- 2 days ago orders
('order-7', 'ORD007', 'cust-1', '0812345678', 950.00, 950.00, 0.00, 0.00, 'cash', 'paid', 'completed', 'registered', 'retail', 'pickup', 'normal', 'staff1', '03589c8f-bec3-4275-8307-c7b9018443ec', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('order-8', 'ORD008', 'cust-2', '0823456789', 750.00, 750.00, 0.00, 0.00, 'credit_card', 'paid', 'completed', 'registered', 'retail', 'delivery', 'normal', 'staff2', '03589c8f-bec3-4275-8307-c7b9018443ec', NOW() - INTERVAL '2 days 2 hours', NOW() - INTERVAL '2 days 2 hours'),
('order-9', 'ORD009', NULL, NULL, 520.00, 520.00, 0.00, 0.00, 'cash', 'paid', 'completed', 'walk_in', 'retail', 'pickup', 'normal', 'staff1', '03589c8f-bec3-4275-8307-c7b9018443ec', NOW() - INTERVAL '2 days 4 hours', NOW() - INTERVAL '2 days 4 hours'),

-- 3 days ago orders
('order-10', 'ORD010', 'cust-1', '0812345678', 1100.00, 1100.00, 0.00, 0.00, 'cash', 'paid', 'completed', 'registered', 'retail', 'pickup', 'normal', 'staff1', '03589c8f-bec3-4275-8307-c7b9018443ec', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
('order-11', 'ORD011', 'cust-2', '0823456789', 890.00, 890.00, 0.00, 0.00, 'credit_card', 'paid', 'completed', 'registered', 'retail', 'delivery', 'normal', 'staff2', '03589c8f-bec3-4275-8307-c7b9018443ec', NOW() - INTERVAL '3 days 2 hours', NOW() - INTERVAL '3 days 2 hours'),
('order-12', 'ORD012', NULL, NULL, 650.00, 650.00, 0.00, 0.00, 'cash', 'paid', 'completed', 'walk_in', 'retail', 'pickup', 'normal', 'staff1', '03589c8f-bec3-4275-8307-c7b9018443ec', NOW() - INTERVAL '3 days 4 hours', NOW() - INTERVAL '3 days 4 hours'),

-- 4 days ago orders
('order-13', 'ORD013', 'cust-1', '0812345678', 780.00, 780.00, 0.00, 0.00, 'cash', 'paid', 'completed', 'registered', 'retail', 'pickup', 'normal', 'staff1', '03589c8f-bec3-4275-8307-c7b9018443ec', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
('order-14', 'ORD014', 'cust-2', '0823456789', 1200.00, 1200.00, 0.00, 0.00, 'credit_card', 'paid', 'completed', 'registered', 'retail', 'delivery', 'high', 'staff2', '03589c8f-bec3-4275-8307-c7b9018443ec', NOW() - INTERVAL '4 days 2 hours', NOW() - INTERVAL '4 days 2 hours'),
('order-15', 'ORD015', NULL, NULL, 450.00, 450.00, 0.00, 0.00, 'cash', 'paid', 'completed', 'walk_in', 'retail', 'pickup', 'normal', 'staff1', '03589c8f-bec3-4275-8307-c7b9018443ec', NOW() - INTERVAL '4 days 4 hours', NOW() - INTERVAL '4 days 4 hours'),

-- 5 days ago orders
('order-16', 'ORD016', 'cust-1', '0812345678', 920.00, 920.00, 0.00, 0.00, 'cash', 'paid', 'completed', 'registered', 'retail', 'pickup', 'normal', 'staff1', '03589c8f-bec3-4275-8307-c7b9018443ec', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
('order-17', 'ORD017', 'cust-2', '0823456789', 1050.00, 1050.00, 0.00, 0.00, 'credit_card', 'paid', 'completed', 'registered', 'retail', 'delivery', 'normal', 'staff2', '03589c8f-bec3-4275-8307-c7b9018443ec', NOW() - INTERVAL '5 days 2 hours', NOW() - INTERVAL '5 days 2 hours'),
('order-18', 'ORD018', NULL, NULL, 580.00, 580.00, 0.00, 0.00, 'cash', 'paid', 'completed', 'walk_in', 'retail', 'pickup', 'normal', 'staff1', '03589c8f-bec3-4275-8307-c7b9018443ec', NOW() - INTERVAL '5 days 4 hours', NOW() - INTERVAL '5 days 4 hours'),

-- 6 days ago orders
('order-19', 'ORD019', 'cust-1', '0812345678', 1150.00, 1150.00, 0.00, 0.00, 'cash', 'paid', 'completed', 'registered', 'retail', 'pickup', 'normal', 'staff1', '03589c8f-bec3-4275-8307-c7b9018443ec', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
('order-20', 'ORD020', 'cust-2', '0823456789', 820.00, 820.00, 0.00, 0.00, 'credit_card', 'paid', 'completed', 'registered', 'retail', 'delivery', 'normal', 'staff2', '03589c8f-bec3-4275-8307-c7b9018443ec', NOW() - INTERVAL '6 days 2 hours', NOW() - INTERVAL '6 days 2 hours'),
('order-21', 'ORD021', NULL, NULL, 720.00, 720.00, 0.00, 0.00, 'cash', 'paid', 'completed', 'walk_in', 'retail', 'pickup', 'normal', 'staff1', '03589c8f-bec3-4275-8307-c7b9018443ec', NOW() - INTERVAL '6 days 4 hours', NOW() - INTERVAL '6 days 4 hours'),

-- 7 days ago orders
('order-22', 'ORD022', 'cust-1', '0812345678', 980.00, 980.00, 0.00, 0.00, 'cash', 'paid', 'completed', 'registered', 'retail', 'pickup', 'normal', 'staff1', '03589c8f-bec3-4275-8307-c7b9018443ec', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
('order-23', 'ORD023', 'cust-2', '0823456789', 1350.00, 1350.00, 0.00, 0.00, 'credit_card', 'paid', 'completed', 'registered', 'retail', 'delivery', 'high', 'staff2', '03589c8f-bec3-4275-8307-c7b9018443ec', NOW() - INTERVAL '7 days 2 hours', NOW() - INTERVAL '7 days 2 hours'),
('order-24', 'ORD024', NULL, NULL, 650.00, 650.00, 0.00, 0.00, 'cash', 'paid', 'completed', 'walk_in', 'retail', 'pickup', 'normal', 'staff1', '03589c8f-bec3-4275-8307-c7b9018443ec', NOW() - INTERVAL '7 days 4 hours', NOW() - INTERVAL '7 days 4 hours'),

-- 8 days ago orders
('order-25', 'ORD025', 'cust-1', '0812345678', 1100.00, 1100.00, 0.00, 0.00, 'cash', 'paid', 'completed', 'registered', 'retail', 'pickup', 'normal', 'staff1', '03589c8f-bec3-4275-8307-c7b9018443ec', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
('order-26', 'ORD026', 'cust-2', '0823456789', 950.00, 950.00, 0.00, 0.00, 'credit_card', 'paid', 'completed', 'registered', 'retail', 'delivery', 'normal', 'staff2', '03589c8f-bec3-4275-8307-c7b9018443ec', NOW() - INTERVAL '8 days 2 hours', NOW() - INTERVAL '8 days 2 hours'),
('order-27', 'ORD027', NULL, NULL, 480.00, 480.00, 0.00, 0.00, 'cash', 'paid', 'completed', 'walk_in', 'retail', 'pickup', 'normal', 'staff1', '03589c8f-bec3-4275-8307-c7b9018443ec', NOW() - INTERVAL '8 days 4 hours', NOW() - INTERVAL '8 days 4 hours'),

-- 9 days ago orders
('order-28', 'ORD028', 'cust-1', '0812345678', 1250.00, 1250.00, 0.00, 0.00, 'cash', 'paid', 'completed', 'registered', 'retail', 'pickup', 'normal', 'staff1', '03589c8f-bec3-4275-8307-c7b9018443ec', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'),
('order-29', 'ORD029', 'cust-2', '0823456789', 880.00, 880.00, 0.00, 0.00, 'credit_card', 'paid', 'completed', 'registered', 'retail', 'delivery', 'normal', 'staff2', '03589c8f-bec3-4275-8307-c7b9018443ec', NOW() - INTERVAL '9 days 2 hours', NOW() - INTERVAL '9 days 2 hours'),
('order-30', 'ORD030', NULL, NULL, 620.00, 620.00, 0.00, 0.00, 'cash', 'paid', 'completed', 'walk_in', 'retail', 'pickup', 'normal', 'staff1', '03589c8f-bec3-4275-8307-c7b9018443ec', NOW() - INTERVAL '9 days 4 hours', NOW() - INTERVAL '9 days 4 hours')
ON CONFLICT (id) DO NOTHING;

-- Insert sample order items
INSERT INTO order_items (id, order_id, product_id, product_name, quantity, unit_price, total_price, cost_price, created_at, updated_at) VALUES
-- Order 1 items
('item-1', 'order-1', 'prod-1', 'น้ำปลา ตราเรือเขา', 5, 85.00, 425.00, 60.00, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
('item-2', 'order-1', 'prod-2', 'เป๊ปซี่ 325ml', 10, 15.00, 150.00, 10.00, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
('item-3', 'order-1', 'prod-3', 'ลูกชิ้นปลา', 2, 120.00, 240.00, 80.00, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),

-- Order 2 items
('item-4', 'order-2', 'prod-2', 'เป๊ปซี่ 325ml', 15, 15.00, 225.00, 10.00, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours'),
('item-5', 'order-2', 'prod-4', 'ขนมปังโฮลวีท', 8, 25.00, 200.00, 15.00, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours'),
('item-6', 'order-2', 'prod-5', 'สลัดผัก', 3, 45.00, 135.00, 25.00, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours'),

-- Order 3 items
('item-7', 'order-3', 'prod-1', 'น้ำปลา ตราเรือเขา', 3, 85.00, 255.00, 60.00, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),
('item-8', 'order-3', 'prod-3', 'ลูกชิ้นปลา', 1, 120.00, 120.00, 80.00, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),
('item-9', 'order-3', 'prod-5', 'สลัดผัก', 1, 45.00, 45.00, 25.00, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'),

-- Order 4 items
('item-10', 'order-4', 'prod-1', 'น้ำปลา ตราเรือเขา', 6, 85.00, 510.00, 60.00, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('item-11', 'order-4', 'prod-2', 'เป๊ปซี่ 325ml', 12, 15.00, 180.00, 10.00, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('item-12', 'order-4', 'prod-4', 'ขนมปังโฮลวีท', 6, 25.00, 150.00, 15.00, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

-- Order 5 items
('item-13', 'order-5', 'prod-3', 'ลูกชิ้นปลา', 8, 120.00, 960.00, 80.00, NOW() - INTERVAL '1 day 2 hours', NOW() - INTERVAL '1 day 2 hours'),
('item-14', 'order-5', 'prod-5', 'สลัดผัก', 5, 45.00, 225.00, 25.00, NOW() - INTERVAL '1 day 2 hours', NOW() - INTERVAL '1 day 2 hours'),

-- Order 6 items
('item-15', 'order-6', 'prod-1', 'น้ำปลา ตราเรือเขา', 4, 85.00, 340.00, 60.00, NOW() - INTERVAL '1 day 4 hours', NOW() - INTERVAL '1 day 4 hours'),
('item-16', 'order-6', 'prod-2', 'เป๊ปซี่ 325ml', 8, 15.00, 120.00, 10.00, NOW() - INTERVAL '1 day 4 hours', NOW() - INTERVAL '1 day 4 hours'),
('item-17', 'order-6', 'prod-4', 'ขนมปังโฮลวีท', 8, 25.00, 200.00, 15.00, NOW() - INTERVAL '1 day 4 hours', NOW() - INTERVAL '1 day 4 hours'),

-- Order 7 items
('item-18', 'order-7', 'prod-2', 'เป๊ปซี่ 325ml', 20, 15.00, 300.00, 10.00, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('item-19', 'order-7', 'prod-3', 'ลูกชิ้นปลา', 4, 120.00, 480.00, 80.00, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('item-20', 'order-7', 'prod-5', 'สลัดผัก', 3, 45.00, 135.00, 25.00, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

-- Order 8 items
('item-21', 'order-8', 'prod-1', 'น้ำปลา ตราเรือเขา', 5, 85.00, 425.00, 60.00, NOW() - INTERVAL '2 days 2 hours', NOW() - INTERVAL '2 days 2 hours'),
('item-22', 'order-8', 'prod-4', 'ขนมปังโฮลวีท', 10, 25.00, 250.00, 15.00, NOW() - INTERVAL '2 days 2 hours', NOW() - INTERVAL '2 days 2 hours'),
('item-23', 'order-8', 'prod-5', 'สลัดผัก', 1, 45.00, 45.00, 25.00, NOW() - INTERVAL '2 days 2 hours', NOW() - INTERVAL '2 days 2 hours'),

-- Order 9 items
('item-24', 'order-9', 'prod-2', 'เป๊ปซี่ 325ml', 15, 15.00, 225.00, 10.00, NOW() - INTERVAL '2 days 4 hours', NOW() - INTERVAL '2 days 4 hours'),
('item-25', 'order-9', 'prod-3', 'ลูกชิ้นปลา', 2, 120.00, 240.00, 80.00, NOW() - INTERVAL '2 days 4 hours', NOW() - INTERVAL '2 days 4 hours'),
('item-26', 'order-9', 'prod-4', 'ขนมปังโฮลวีท', 2, 25.00, 50.00, 15.00, NOW() - INTERVAL '2 days 4 hours', NOW() - INTERVAL '2 days 4 hours'),

-- Order 10 items
('item-27', 'order-10', 'prod-1', 'น้ำปลา ตราเรือเขา', 8, 85.00, 680.00, 60.00, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
('item-28', 'order-10', 'prod-2', 'เป๊ปซี่ 325ml', 18, 15.00, 270.00, 10.00, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
('item-29', 'order-10', 'prod-5', 'สลัดผัก', 3, 45.00, 135.00, 25.00, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

-- Order 11 items
('item-30', 'order-11', 'prod-3', 'ลูกชิ้นปลา', 6, 120.00, 720.00, 80.00, NOW() - INTERVAL '3 days 2 hours', NOW() - INTERVAL '3 days 2 hours'),
('item-31', 'order-11', 'prod-4', 'ขนมปังโฮลวีท', 6, 25.00, 150.00, 15.00, NOW() - INTERVAL '3 days 2 hours', NOW() - INTERVAL '3 days 2 hours'),

-- Order 12 items
('item-32', 'order-12', 'prod-1', 'น้ำปลา ตราเรือเขา', 3, 85.00, 255.00, 60.00, NOW() - INTERVAL '3 days 4 hours', NOW() - INTERVAL '3 days 4 hours'),
('item-33', 'order-12', 'prod-2', 'เป๊ปซี่ 325ml', 12, 15.00, 180.00, 10.00, NOW() - INTERVAL '3 days 4 hours', NOW() - INTERVAL '3 days 4 hours'),
('item-34', 'order-12', 'prod-3', 'ลูกชิ้นปลา', 1, 120.00, 120.00, 80.00, NOW() - INTERVAL '3 days 4 hours', NOW() - INTERVAL '3 days 4 hours'),

-- Order 13 items
('item-35', 'order-13', 'prod-2', 'เป๊ปซี่ 325ml', 16, 15.00, 240.00, 10.00, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
('item-36', 'order-13', 'prod-4', 'ขนมปังโฮลวีท', 12, 25.00, 300.00, 15.00, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
('item-37', 'order-13', 'prod-5', 'สลัดผัก', 5, 45.00, 225.00, 25.00, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),

-- Order 14 items
('item-38', 'order-14', 'prod-1', 'น้ำปลา ตราเรือเขา', 7, 85.00, 595.00, 60.00, NOW() - INTERVAL '4 days 2 hours', NOW() - INTERVAL '4 days 2 hours'),
('item-39', 'order-14', 'prod-3', 'ลูกชิ้นปลา', 5, 120.00, 600.00, 80.00, NOW() - INTERVAL '4 days 2 hours', NOW() - INTERVAL '4 days 2 hours'),

-- Order 15 items
('item-40', 'order-15', 'prod-2', 'เป๊ปซี่ 325ml', 10, 15.00, 150.00, 10.00, NOW() - INTERVAL '4 days 4 hours', NOW() - INTERVAL '4 days 4 hours'),
('item-41', 'order-15', 'prod-4', 'ขนมปังโฮลวีท', 8, 25.00, 200.00, 15.00, NOW() - INTERVAL '4 days 4 hours', NOW() - INTERVAL '4 days 4 hours'),
('item-42', 'order-15', 'prod-5', 'สลัดผัก', 2, 45.00, 90.00, 25.00, NOW() - INTERVAL '4 days 4 hours', NOW() - INTERVAL '4 days 4 hours'),

-- Order 16 items
('item-43', 'order-16', 'prod-1', 'น้ำปลา ตราเรือเขา', 6, 85.00, 510.00, 60.00, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
('item-44', 'order-16', 'prod-2', 'เป๊ปซี่ 325ml', 14, 15.00, 210.00, 10.00, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
('item-45', 'order-16', 'prod-3', 'ลูกชิ้นปลา', 1, 120.00, 120.00, 80.00, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),

-- Order 17 items
('item-46', 'order-17', 'prod-3', 'ลูกชิ้นปลา', 7, 120.00, 840.00, 80.00, NOW() - INTERVAL '5 days 2 hours', NOW() - INTERVAL '5 days 2 hours'),
('item-47', 'order-17', 'prod-5', 'สลัดผัก', 4, 45.00, 180.00, 25.00, NOW() - INTERVAL '5 days 2 hours', NOW() - INTERVAL '5 days 2 hours'),

-- Order 18 items
('item-48', 'order-18', 'prod-1', 'น้ำปลา ตราเรือเขา', 2, 85.00, 170.00, 60.00, NOW() - INTERVAL '5 days 4 hours', NOW() - INTERVAL '5 days 4 hours'),
('item-49', 'order-18', 'prod-2', 'เป๊ปซี่ 325ml', 8, 15.00, 120.00, 10.00, NOW() - INTERVAL '5 days 4 hours', NOW() - INTERVAL '5 days 4 hours'),
('item-50', 'order-18', 'prod-4', 'ขนมปังโฮลวีท', 7, 25.00, 175.00, 15.00, NOW() - INTERVAL '5 days 4 hours', NOW() - INTERVAL '5 days 4 hours'),

-- Order 19 items
('item-51', 'order-19', 'prod-1', 'น้ำปลา ตราเรือเขา', 9, 85.00, 765.00, 60.00, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
('item-52', 'order-19', 'prod-2', 'เป๊ปซี่ 325ml', 16, 15.00, 240.00, 10.00, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
('item-53', 'order-19', 'prod-5', 'สลัดผัก', 3, 45.00, 135.00, 25.00, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),

-- Order 20 items
('item-54', 'order-20', 'prod-3', 'ลูกชิ้นปลา', 5, 120.00, 600.00, 80.00, NOW() - INTERVAL '6 days 2 hours', NOW() - INTERVAL '6 days 2 hours'),
('item-55', 'order-20', 'prod-4', 'ขนมปังโฮลวีท', 8, 25.00, 200.00, 15.00, NOW() - INTERVAL '6 days 2 hours', NOW() - INTERVAL '6 days 2 hours'),

-- Order 21 items
('item-56', 'order-21', 'prod-1', 'น้ำปลา ตราเรือเขา', 4, 85.00, 340.00, 60.00, NOW() - INTERVAL '6 days 4 hours', NOW() - INTERVAL '6 days 4 hours'),
('item-57', 'order-21', 'prod-2', 'เป๊ปซี่ 325ml', 12, 15.00, 180.00, 10.00, NOW() - INTERVAL '6 days 4 hours', NOW() - INTERVAL '6 days 4 hours'),
('item-58', 'order-21', 'prod-3', 'ลูกชิ้นปลา', 1, 120.00, 120.00, 80.00, NOW() - INTERVAL '6 days 4 hours', NOW() - INTERVAL '6 days 4 hours'),

-- Order 22 items
('item-59', 'order-22', 'prod-2', 'เป๊ปซี่ 325ml', 18, 15.00, 270.00, 10.00, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
('item-60', 'order-22', 'prod-3', 'ลูกชิ้นปลา', 4, 120.00, 480.00, 80.00, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
('item-61', 'order-22', 'prod-4', 'ขนมปังโฮลวีท', 7, 25.00, 175.00, 15.00, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),

-- Order 23 items
('item-62', 'order-23', 'prod-1', 'น้ำปลา ตราเรือเขา', 8, 85.00, 680.00, 60.00, NOW() - INTERVAL '7 days 2 hours', NOW() - INTERVAL '7 days 2 hours'),
('item-63', 'order-23', 'prod-3', 'ลูกชิ้นปลา', 5, 120.00, 600.00, 80.00, NOW() - INTERVAL '7 days 2 hours', NOW() - INTERVAL '7 days 2 hours'),

-- Order 24 items
('item-64', 'order-24', 'prod-2', 'เป๊ปซี่ 325ml', 13, 15.00, 195.00, 10.00, NOW() - INTERVAL '7 days 4 hours', NOW() - INTERVAL '7 days 4 hours'),
('item-65', 'order-24', 'prod-4', 'ขนมปังโฮลวีท', 9, 25.00, 225.00, 15.00, NOW() - INTERVAL '7 days 4 hours', NOW() - INTERVAL '7 days 4 hours'),
('item-66', 'order-24', 'prod-5', 'สลัดผัก', 5, 45.00, 225.00, 25.00, NOW() - INTERVAL '7 days 4 hours', NOW() - INTERVAL '7 days 4 hours'),

-- Order 25 items
('item-67', 'order-25', 'prod-1', 'น้ำปลา ตราเรือเขา', 7, 85.00, 595.00, 60.00, NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
('item-68', 'order-25', 'prod-2', 'เป๊ปซี่ 325ml', 15, 15.00, 225.00, 10.00, NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
('item-69', 'order-25', 'prod-5', 'สลัดผัก', 3, 45.00, 135.00, 25.00, NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),

-- Order 26 items
('item-70', 'order-26', 'prod-3', 'ลูกชิ้นปลา', 6, 120.00, 720.00, 80.00, NOW() - INTERVAL '8 days 2 hours', NOW() - INTERVAL '8 days 2 hours'),
('item-71', 'order-26', 'prod-4', 'ขนมปังโฮลวีท', 8, 25.00, 200.00, 15.00, NOW() - INTERVAL '8 days 2 hours', NOW() - INTERVAL '8 days 2 hours'),

-- Order 27 items
('item-72', 'order-27', 'prod-1', 'น้ำปลา ตราเรือเขา', 2, 85.00, 170.00, 60.00, NOW() - INTERVAL '8 days 4 hours', NOW() - INTERVAL '8 days 4 hours'),
('item-73', 'order-27', 'prod-2', 'เป๊ปซี่ 325ml', 10, 15.00, 150.00, 10.00, NOW() - INTERVAL '8 days 4 hours', NOW() - INTERVAL '8 days 4 hours'),
('item-74', 'order-27', 'prod-4', 'ขนมปังโฮลวีท', 6, 25.00, 150.00, 15.00, NOW() - INTERVAL '8 days 4 hours', NOW() - INTERVAL '8 days 4 hours'),

-- Order 28 items
('item-75', 'order-28', 'prod-1', 'น้ำปลา ตราเรือเขา', 9, 85.00, 765.00, 60.00, NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'),
('item-76', 'order-28', 'prod-2', 'เป๊ปซี่ 325ml', 17, 15.00, 255.00, 10.00, NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'),
('item-77', 'order-28', 'prod-5', 'สลัดผัก', 4, 45.00, 180.00, 25.00, NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'),

-- Order 29 items
('item-78', 'order-29', 'prod-3', 'ลูกชิ้นปลา', 5, 120.00, 600.00, 80.00, NOW() - INTERVAL '9 days 2 hours', NOW() - INTERVAL '9 days 2 hours'),
('item-79', 'order-29', 'prod-4', 'ขนมปังโฮลวีท', 10, 25.00, 250.00, 15.00, NOW() - INTERVAL '9 days 2 hours', NOW() - INTERVAL '9 days 2 hours'),

-- Order 30 items
('item-80', 'order-30', 'prod-1', 'น้ำปลา ตราเรือเขา', 3, 85.00, 255.00, 60.00, NOW() - INTERVAL '9 days 4 hours', NOW() - INTERVAL '9 days 4 hours'),
('item-81', 'order-30', 'prod-2', 'เป๊ปซี่ 325ml', 11, 15.00, 165.00, 10.00, NOW() - INTERVAL '9 days 4 hours', NOW() - INTERVAL '9 days 4 hours'),
('item-82', 'order-30', 'prod-3', 'ลูกชิ้นปลา', 1, 120.00, 120.00, 80.00, NOW() - INTERVAL '9 days 4 hours', NOW() - INTERVAL '9 days 4 hours')
ON CONFLICT (id) DO NOTHING;
