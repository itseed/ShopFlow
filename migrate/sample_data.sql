-- Sample Data for ShopFlow Testing
-- Run this in Supabase SQL Editor AFTER running database_schema.sql

-- Insert sample branch
INSERT INTO branches (name, address, phone, email) VALUES 
('สาขาหลัก', '123 ถนนสุขุมวิท เขตวัฒนา กรุงเทพฯ 10110', '02-123-4567', 'main@shopflow.com'),
('สาขาเซ็นทรัล', '456 ห้างเซ็นทรัล ชั้น 3 กรุงเทพฯ', '02-234-5678', 'central@shopflow.com')
ON CONFLICT (id) DO NOTHING;

-- Insert sample categories
INSERT INTO categories (name, description, display_order) VALUES 
('เครื่องดื่ม', 'เครื่องดื่มร้อน เย็น และน้ำผลไม้', 1),
('อาหาร', 'อาหารจานเดียว และอาหารจานเด็ด', 2),
('ขนมปัง', 'ขนมปัง เค้ก และเบเกอรี่', 3),
('สลัด', 'สลัดผัก สลัดผลไม้ และอาหารเพื่อสุขภาพ', 4),
('ของหวาน', 'ไอศกรีม คุกกี้ และขนมหวานต่างๆ', 5)
ON CONFLICT (name) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, description, price, stock, min_stock, category_id, status, images) VALUES 
(
  'กาแฟลาเต้', 
  'กาแฟลาเต้หอมกรุ่น ชงจากเมล็ดกาแฟคุณภาพเยี่ยม พร้อมนมสดเนื้อละเอียด',
  65.00, 
  50, 
  10,
  (SELECT id FROM categories WHERE name = 'เครื่องดื่ม'),
  'active',
  ARRAY['https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop']
),
(
  'ขนมปังโฮลวีท', 
  'ขนมปังโฮลวีทอบสด เหมาะสำหรับมื้อเช้า อุดมไปด้วยใยอาหาร',
  45.00, 
  30, 
  5,
  (SELECT id FROM categories WHERE name = 'ขนมปัง'),
  'active',
  ARRAY['https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop']
),
(
  'สลัดผลไม้', 
  'สลัดผลไม้สดใหม่ ดีต่อสุขภาพ มีวิตามินและเกลือแร่สูง',
  85.00, 
  20, 
  3,
  (SELECT id FROM categories WHERE name = 'สลัด'),
  'active',
  ARRAY['https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop']
),
(
  'ชาเขียวมัทฉะ', 
  'ชาเขียวมัทฉะแท้จากญี่ปุ่น รสชาติเข้มข้น มีสารต้านอนุมูลอิสระ',
  55.00, 
  25, 
  5,
  (SELECT id FROM categories WHERE name = 'เครื่องดื่ม'),
  'active',
  ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop']
),
(
  'แซนด์วิชทูน่า', 
  'แซนด์วิชทูน่าสด ผักกรอบ อิ่มอร่อย เหมาะสำหรับมื้อกลางวัน',
  75.00, 
  15, 
  3,
  (SELECT id FROM categories WHERE name = 'อาหาร'),
  'active',
  ARRAY['https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop']
),
(
  'เค้กช็อกโกแลต', 
  'เค้กช็อกโกแลตเข้มข้น หวานมัน เนื้อนุ่ม',
  95.00, 
  12, 
  2,
  (SELECT id FROM categories WHERE name = 'ของหวาน'),
  'active',
  ARRAY['https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop']
),
(
  'น้ำส้มคั้นสด', 
  'น้ำส้มคั้นสด 100% ไม่ใส่น้ำตาล วิตามินซีสูง',
  40.00, 
  35, 
  8,
  (SELECT id FROM categories WHERE name = 'เครื่องดื่ม'),
  'active',
  ARRAY['https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=300&fit=crop']
),
(
  'ข้าวผัดกุ้ง', 
  'ข้าวผัดกุ้งสด เครื่องเทศหอม กุ้งใหญ่สะอาด',
  120.00, 
  8, 
  2,
  (SELECT id FROM categories WHERE name = 'อาหาร'),
  'active',
  ARRAY['https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop']
),
(
  'สลัดไก่ย่าง', 
  'สลัดไก่ย่างเนื้อนุ่ม ผักสดกรอบ เหมาะกับคนลดน้ำหนัก',
  95.00, 
  18, 
  3,
  (SELECT id FROM categories WHERE name = 'สลัด'),
  'active',
  ARRAY['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop']
),
(
  'โดนัทช็อกโกแลต', 
  'โดนัทหน้าช็อกโกแลต เนื้อนุ่ม หวานกำลังดี',
  35.00, 
  5, 
  2,
  (SELECT id FROM categories WHERE name = 'ของหวาน'),
  'out_of_stock',
  ARRAY['https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop']
)
ON CONFLICT (name) DO NOTHING;

-- Insert sample orders (optional)
INSERT INTO orders (order_number, customer_name, customer_phone, subtotal, tax, total, payment_method, status, branch_id) VALUES
(
  'ORD-20250817-0001',
  'นายสมชาย ใจดี',
  '081-234-5678',
  160.00,
  11.20,
  171.20,
  'cash',
  'completed',
  (SELECT id FROM branches WHERE name = 'สาขาหลัก')
),
(
  'ORD-20250817-0002', 
  'นางสาวมารี สวยงาม',
  '089-876-5432',
  95.00,
  6.65,
  101.65,
  'card',
  'completed',
  (SELECT id FROM branches WHERE name = 'สาขาหลัก')
)
ON CONFLICT (order_number) DO NOTHING;

-- Insert order items
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price) VALUES
(
  (SELECT id FROM orders WHERE order_number = 'ORD-20250817-0001'),
  (SELECT id FROM products WHERE name = 'กาแฟลาเต้'),
  'กาแฟลาเต้',
  2,
  65.00,
  130.00
),
(
  (SELECT id FROM orders WHERE order_number = 'ORD-20250817-0001'),
  (SELECT id FROM products WHERE name = 'ขนมปังโฮลวีท'),
  'ขนมปังโฮลวีท',
  1,
  30.00,
  30.00
),
(
  (SELECT id FROM orders WHERE order_number = 'ORD-20250817-0002'),
  (SELECT id FROM products WHERE name = 'สลัดไก่ย่าง'),
  'สลัดไก่ย่าง',
  1,
  95.00,
  95.00
)
ON CONFLICT DO NOTHING;

-- Verify data insertion
SELECT 'Categories' as table_name, count(*) as count FROM categories
UNION ALL
SELECT 'Products', count(*) FROM products  
UNION ALL
SELECT 'Branches', count(*) FROM branches
UNION ALL
SELECT 'Orders', count(*) FROM orders
UNION ALL
SELECT 'Order Items', count(*) FROM order_items;

-- Show sample products with category names
SELECT 
  p.name as product_name,
  p.price,
  p.stock,
  p.status,
  c.name as category_name
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
ORDER BY c.name, p.name;

-- Sample data for ShopFlow CMS testing
-- Insert this data after the schema has been created

-- Insert sample branches
INSERT INTO branches (id, name, address, phone, email) VALUES
('123e4567-e89b-12d3-a456-426614174000', 'Main Store', '123 Main Street, Bangkok', '+66-2-123-4567', 'main@shopflow.com'),
('123e4567-e89b-12d3-a456-426614174001', 'Branch 2', '456 Side Street, Bangkok', '+66-2-234-5678', 'branch2@shopflow.com');

-- Insert sample categories
INSERT INTO categories (id, name, description, display_order) VALUES
('a1b2c3d4-e5f6-7890-1234-567890abcdef', 'Electronics', 'Electronic devices and gadgets', 1),
('b2c3d4e5-f6g7-8901-2345-678901bcdefg', 'Clothing', 'Fashion and apparel', 2),
('c3d4e5f6-g7h8-9012-3456-789012cdefgh', 'Food & Beverages', 'Food and drink items', 3);

-- Insert sample products
INSERT INTO products (id, name, description, price, discount_price, stock, min_stock, category_id) VALUES
('p1a2b3c4-d5e6-7890-1234-567890abcdef', 'iPhone 15', 'Latest Apple smartphone', 35000.00, 32000.00, 10, 3, 'a1b2c3d4-e5f6-7890-1234-567890abcdef'),
('p2b3c4d5-e6f7-8901-2345-678901bcdefg', 'Samsung Galaxy S24', 'Latest Samsung smartphone', 28000.00, NULL, 15, 5, 'a1b2c3d4-e5f6-7890-1234-567890abcdef'),
('p3c4d5e6-f7g8-9012-3456-789012cdefgh', 'MacBook Pro 14"', 'Professional laptop for developers', 65000.00, 60000.00, 5, 2, 'a1b2c3d4-e5f6-7890-1234-567890abcdef'),
('p4d5e6f7-g8h9-0123-4567-890123defghi', 'T-Shirt Basic', 'Comfortable cotton t-shirt', 299.00, NULL, 50, 10, 'b2c3d4e5-f6g7-8901-2345-678901bcdefg'),
('p5e6f7g8-h9i0-1234-5678-901234efghij', 'Jeans Regular', 'Classic blue jeans', 899.00, 699.00, 25, 8, 'b2c3d4e5-f6g7-8901-2345-678901bcdefg'),
('p6f7g8h9-i0j1-2345-6789-012345fghijk', 'Coffee Premium', 'Premium arabica coffee beans', 450.00, NULL, 30, 10, 'c3d4e5f6-g7h8-9012-3456-789012cdefgh');

-- Insert sample orders (need auth.users first, so these will be inserted when users are created)
-- For now, create orders without user references
INSERT INTO orders (id, order_number, customer_name, customer_phone, subtotal, tax, total, payment_method, status, branch_id) VALUES
('o1a2b3c4-d5e6-7890-1234-567890abcdef', 'ORD-20240823-0001', 'John Doe', '+66-81-123-4567', 35000.00, 2450.00, 37450.00, 'card', 'completed', '123e4567-e89b-12d3-a456-426614174000'),
('o2b3c4d5-e6f7-8901-2345-678901bcdefg', 'ORD-20240823-0002', 'Jane Smith', '+66-82-234-5678', 1198.00, 83.86, 1281.86, 'cash', 'completed', '123e4567-e89b-12d3-a456-426614174000'),
('o3c4d5e6-f7g8-9012-3456-789012cdefgh', 'ORD-20240823-0003', 'Bob Wilson', '+66-83-345-6789', 28000.00, 1960.00, 29960.00, 'bank_transfer', 'pending', '123e4567-e89b-12d3-a456-426614174001');

-- Insert sample order items
INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, total_price) VALUES
('o1a2b3c4-d5e6-7890-1234-567890abcdef', 'p1a2b3c4-d5e6-7890-1234-567890abcdef', 'iPhone 15', 1, 35000.00, 35000.00),
('o2b3c4d5-e6f7-8901-2345-678901bcdefg', 'p4d5e6f7-g8h9-0123-4567-890123defghi', 'T-Shirt Basic', 2, 299.00, 598.00),
('o2b3c4d5-e6f7-8901-2345-678901bcdefg', 'p6f7g8h9-i0j1-2345-6789-012345fghijk', 'Coffee Premium', 1, 450.00, 450.00),
('o2b3c4d5-e6f7-8901-2345-678901bcdefg', 'p5e6f7g8-h9i0-1234-5678-901234efghij', 'Jeans Regular', 1, 699.00, 699.00),
('o3c4d5e6-f7g8-9012-3456-789012cdefgh', 'p2b3c4d5-e6f7-8901-2345-678901bcdefg', 'Samsung Galaxy S24', 1, 28000.00, 28000.00);
