-- Add Sample Data for Reports Testing
-- Creates orders and transactions in the last 30 days

-- Get default branch and customer IDs
DO $$
DECLARE
    v_branch_id UUID;
    v_customer_id UUID;
    v_product_ids UUID[];
    v_order_id UUID;
    v_date_offset INTEGER;
BEGIN
    -- Get first branch
    SELECT id INTO v_branch_id FROM branches LIMIT 1;
    
    -- Get first customer
    SELECT id INTO v_customer_id FROM customers LIMIT 1;
    
    -- Get all product IDs
    SELECT ARRAY_AGG(id) INTO v_product_ids FROM products WHERE stock > 0 LIMIT 5;
    
    -- Create 30 orders over the last 30 days
    FOR v_date_offset IN 1..30 LOOP
        -- Create order
        INSERT INTO orders (
            order_number,
            customer_id,
            customer_name,
            customer_phone,
            subtotal,
            tax,
            discount_amount,
            total,
            payment_method,
            payment_status,
            status,
            branch_id,
            customer_type,
            delivery_method,
            priority,
            created_at,
            updated_at
        ) VALUES (
            'ORD-' || TO_CHAR(NOW() - (v_date_offset || ' days')::INTERVAL, 'YYYYMMDD') || '-' || LPAD(v_date_offset::TEXT, 4, '0'),
            v_customer_id,
            'ลูกค้าทดสอบ ' || v_date_offset,
            '081234567' || (v_date_offset % 10),
            ROUND((RANDOM() * 1000 + 500)::NUMERIC, 2), -- subtotal 500-1500
            ROUND((RANDOM() * 100 + 30)::NUMERIC, 2), -- tax 30-130
            ROUND((RANDOM() * 50)::NUMERIC, 2), -- discount 0-50
            ROUND((RANDOM() * 1000 + 500)::NUMERIC, 2), -- total 500-1500
            CASE (RANDOM() * 3)::INTEGER
                WHEN 0 THEN 'cash'
                WHEN 1 THEN 'card'
                WHEN 2 THEN 'bank_transfer'
                ELSE 'e_wallet'
            END,
            'paid',
            'completed',
            v_branch_id,
            CASE (RANDOM() * 2)::INTEGER
                WHEN 0 THEN 'registered'
                WHEN 1 THEN 'walk_in'
                ELSE 'phone_order'
            END,
            CASE (RANDOM() * 1)::INTEGER
                WHEN 0 THEN 'pickup'
                ELSE 'delivery'
            END,
            'normal',
            NOW() - (v_date_offset || ' days')::INTERVAL,
            NOW() - (v_date_offset || ' days')::INTERVAL
        ) RETURNING id INTO v_order_id;
        
        -- Add 1-3 items per order
        FOR i IN 1..(1 + (RANDOM() * 2)::INTEGER) LOOP
            IF v_product_ids IS NOT NULL AND array_length(v_product_ids, 1) > 0 THEN
                INSERT INTO order_items (
                    order_id,
                    product_id,
                    product_name,
                    quantity,
                    unit_price,
                    total_price
                ) SELECT
                    v_order_id,
                    v_product_ids[1 + (RANDOM() * (array_length(v_product_ids, 1) - 1))::INTEGER],
                    'Product ' || i,
                    (1 + RANDOM() * 5)::INTEGER, -- quantity 1-5
                    ROUND((RANDOM() * 200 + 50)::NUMERIC, 2), -- price 50-250
                    ROUND((RANDOM() * 500 + 100)::NUMERIC, 2) -- total 100-600
                WHERE array_length(v_product_ids, 1) > 0;
            END IF;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Created 30 sample orders for the last 30 days';
END $$;

-- Update order totals to match items
UPDATE orders o
SET total = COALESCE((
    SELECT SUM(total_price)
    FROM order_items oi
    WHERE oi.order_id = o.id
), 0),
subtotal = COALESCE((
    SELECT SUM(total_price)
    FROM order_items oi
    WHERE oi.order_id = o.id
), 0) * 0.93, -- Subtract 7% VAT
tax = COALESCE((
    SELECT SUM(total_price)
    FROM order_items oi
    WHERE oi.order_id = o.id
), 0) * 0.07,
updated_at = NOW()
WHERE EXISTS (
    SELECT 1 FROM order_items WHERE order_id = o.id
);

-- Verify data
SELECT 
    TO_CHAR(created_at, 'YYYY-MM-DD') as date,
    COUNT(*) as orders,
    ROUND(SUM(total)::NUMERIC, 2) as revenue
FROM orders
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
ORDER BY date DESC
LIMIT 10;

RAISE NOTICE 'Sample data added successfully!';

