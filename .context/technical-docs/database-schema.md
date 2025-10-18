# ShopFlow Database Schema Documentation

**Last Updated**: October 18, 2025  
**Version**: 3.0 with Loyalty Program  
**Database**: PostgreSQL 15+ (Supabase)

---

## Overview

ShopFlow uses a comprehensive PostgreSQL database with Row Level Security, triggers, and stored procedures for business logic automation. The schema supports:
- Point of Sale operations
- Content Management System
- Inventory management
- **Loyalty Program System** ⭐ NEW
- Multi-branch operations
- Advanced reporting

---

## Core Tables

### Products Table
**Primary table for product catalog**

```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku TEXT UNIQUE,
    barcode TEXT UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
    price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    cost_price NUMERIC(12,2) CHECK (cost_price >= 0),
    discount_price NUMERIC(12,2),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    min_stock INTEGER DEFAULT 5,
    max_stock INTEGER,
    unit TEXT DEFAULT 'pcs',
    category_id UUID REFERENCES categories(id),
    supplier_id UUID REFERENCES suppliers(id),
    brand TEXT,
    status TEXT DEFAULT 'active',
    images TEXT[],
    tags TEXT[],
    is_featured BOOLEAN DEFAULT false,
    is_trackable BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Indexes:**
- `idx_products_name_search` (GIN for full-text search)
- `idx_products_barcode` (Fast barcode lookup)
- `idx_products_category`
- `idx_products_stock_low`

### Categories Table
**Hierarchical product categories**

```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Orders Table
**Sales orders from POS and CMS**

```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    customer_name TEXT,
    customer_phone TEXT,
    subtotal NUMERIC(12,2) NOT NULL,
    discount_amount NUMERIC(12,2) DEFAULT 0,
    tax NUMERIC(12,2) DEFAULT 0,
    total NUMERIC(12,2) NOT NULL,
    payment_method TEXT DEFAULT 'cash',
    payment_status TEXT DEFAULT 'paid',
    status TEXT DEFAULT 'completed',
    branch_id UUID REFERENCES branches(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Indexes:**
- `idx_orders_customer` (Loyalty program lookups)
- `idx_orders_created_at` (Date range queries)
- `idx_orders_status`

### Order Items Table
**Line items for orders**

```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    product_sku TEXT,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL,
    discount_amount NUMERIC(12,2) DEFAULT 0,
    total_price NUMERIC(12,2) NOT NULL,
    cost_price NUMERIC(12,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Customers Table
**Customer information for loyalty and CRM**

```sql
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_code TEXT UNIQUE,
    first_name TEXT,
    last_name TEXT,
    company_name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    address TEXT,
    customer_type TEXT DEFAULT 'individual',
    status TEXT DEFAULT 'active',
    total_orders INTEGER DEFAULT 0,
    total_spent NUMERIC(12,2) DEFAULT 0,
    loyalty_points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Indexes:**
- `idx_customers_phone` ⭐ Critical for POS lookup
- `idx_customers_email`

---

## Loyalty Program Tables ⭐ NEW

### Loyalty Programs Table
**Program configuration and rules**

```sql
CREATE TABLE loyalty_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    points_per_baht NUMERIC(8,4) NOT NULL DEFAULT 1.0,
    minimum_points_to_redeem INTEGER NOT NULL DEFAULT 100,
    redemption_rate NUMERIC(8,4) NOT NULL DEFAULT 1.0,
    points_expiry_days INTEGER,
    welcome_bonus_points INTEGER DEFAULT 0,
    birthday_bonus_points INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    enable_tiers BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Default Program:**
```sql
INSERT INTO loyalty_programs (
    name, points_per_baht, minimum_points_to_redeem, 
    redemption_rate, points_expiry_days, enable_tiers
) VALUES (
    'ShopFlow Rewards', 1.0, 100, 1.0, 365, true
);
```

### Loyalty Tiers Table
**Membership levels with benefits**

```sql
CREATE TABLE loyalty_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES loyalty_programs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color_code TEXT,
    icon TEXT,
    min_points_required INTEGER NOT NULL DEFAULT 0,
    min_total_spent NUMERIC(12,2) NOT NULL DEFAULT 0,
    points_multiplier NUMERIC(4,2) NOT NULL DEFAULT 1.0,
    discount_percentage NUMERIC(5,2) DEFAULT 0,
    benefits JSONB DEFAULT '[]'::jsonb,
    tier_level INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Default Tiers:**
- Bronze: Level 1, 1.0x multiplier, 0% discount
- Silver: Level 2, 1.2x multiplier, 5% discount (1K points, ฿5K spent)
- Gold: Level 3, 1.5x multiplier, 10% discount (5K points, ฿20K spent)
- Platinum: Level 4, 2.0x multiplier, 15% discount (15K points, ฿50K spent)

### Customer Loyalty Memberships Table
**Links customers to programs**

```sql
CREATE TABLE customer_loyalty_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES loyalty_programs(id) ON DELETE CASCADE,
    tier_id UUID REFERENCES loyalty_tiers(id),
    membership_number TEXT UNIQUE NOT NULL,
    current_points INTEGER NOT NULL DEFAULT 0,
    lifetime_points INTEGER NOT NULL DEFAULT 0,
    total_spent NUMERIC(12,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active',
    joined_date DATE NOT NULL DEFAULT CURRENT_DATE,
    last_activity_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(customer_id, program_id)
);
```

**Key Indexes:**
- `idx_customer_memberships_customer` (Quick lookup)
- `idx_customer_memberships_status`
- `idx_customer_memberships_points`

### Points Transactions Table
**Complete audit trail of points**

```sql
CREATE TABLE points_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membership_id UUID NOT NULL REFERENCES customer_loyalty_memberships(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    transaction_type TEXT NOT NULL CHECK (
        transaction_type IN ('earn', 'redeem', 'expire', 'adjustment', 'bonus', 'refund')
    ),
    points INTEGER NOT NULL,
    balance_before INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    order_id UUID REFERENCES orders(id),
    reference_type TEXT,
    amount_spent NUMERIC(12,2),
    amount_redeemed NUMERIC(12,2),
    description TEXT NOT NULL,
    expires_at DATE,
    expired_at TIMESTAMPTZ,
    branch_id UUID REFERENCES branches(id),
    processed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Key Indexes:**
- `idx_points_transactions_membership`
- `idx_points_transactions_customer`
- `idx_points_transactions_order`
- `idx_points_transactions_date`

### Customer Phone Index Table
**Fast phone-based lookup for POS**

```sql
CREATE TABLE customer_phone_index (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Critical Index:**
- `idx_customer_phone_index_phone` ⭐ Makes POS lookup < 50ms

---

## Database Functions

### generate_membership_number()
**Auto-generates membership IDs**

```sql
CREATE OR REPLACE FUNCTION generate_membership_number()
RETURNS TRIGGER AS $$
DECLARE
    program_code TEXT;
    sequence_num INTEGER;
BEGIN
    SELECT LEFT(UPPER(name), 3) INTO program_code 
    FROM loyalty_programs WHERE id = NEW.program_id;
    
    SELECT COUNT(*) + 1 INTO sequence_num
    FROM customer_loyalty_memberships
    WHERE program_id = NEW.program_id;
    
    NEW.membership_number := program_code || '-' || 
                            TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                            LPAD(sequence_num::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### calculate_points_for_purchase()
**Calculates points with tier multiplier**

```sql
CREATE OR REPLACE FUNCTION calculate_points_for_purchase(
    p_amount NUMERIC(12,2),
    p_program_id UUID,
    p_tier_id UUID DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    v_points_per_baht NUMERIC(8,4);
    v_tier_multiplier NUMERIC(4,2) := 1.0;
    v_calculated_points INTEGER;
BEGIN
    SELECT points_per_baht INTO v_points_per_baht
    FROM loyalty_programs WHERE id = p_program_id;
    
    IF p_tier_id IS NOT NULL THEN
        SELECT points_multiplier INTO v_tier_multiplier
        FROM loyalty_tiers WHERE id = p_tier_id;
    END IF;
    
    v_calculated_points := FLOOR(p_amount * v_points_per_baht * v_tier_multiplier);
    RETURN GREATEST(v_calculated_points, 0);
END;
$$ LANGUAGE plpgsql;
```

**Usage:**
```sql
SELECT calculate_points_for_purchase(1000.00, '<program_id>', '<tier_id>');
-- Returns: 1200 (if tier multiplier is 1.2x)
```

### add_points_transaction()
**Records transaction and updates balance**

```sql
CREATE OR REPLACE FUNCTION add_points_transaction(
    p_membership_id UUID,
    p_customer_id UUID,
    p_transaction_type TEXT,
    p_points INTEGER,
    p_description TEXT,
    p_order_id UUID DEFAULT NULL,
    -- ... more parameters
) RETURNS UUID AS $$
DECLARE
    v_transaction_id UUID;
    v_current_balance INTEGER;
    v_new_balance INTEGER;
BEGIN
    -- Get current balance
    SELECT current_points INTO v_current_balance
    FROM customer_loyalty_memberships
    WHERE id = p_membership_id;
    
    -- Calculate new balance
    v_new_balance := v_current_balance + p_points;
    
    -- Validate
    IF v_new_balance < 0 THEN
        RAISE EXCEPTION 'Insufficient points balance';
    END IF;
    
    -- Insert transaction
    INSERT INTO points_transactions (...)
    VALUES (...) RETURNING id INTO v_transaction_id;
    
    -- Update membership
    UPDATE customer_loyalty_memberships
    SET current_points = v_new_balance,
        lifetime_points = lifetime_points + CASE WHEN p_points > 0 THEN p_points ELSE 0 END,
        last_activity_date = NOW()
    WHERE id = p_membership_id;
    
    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;
```

### award_loyalty_points_on_order()
**Trigger to auto-award points**

```sql
CREATE OR REPLACE FUNCTION award_loyalty_points_on_order()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND 
       (OLD.status IS NULL OR OLD.status != 'completed') AND
       NEW.customer_id IS NOT NULL THEN
        
        -- Find membership
        -- Calculate points
        -- Award points
        PERFORM add_points_transaction(...);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger
CREATE TRIGGER orders_award_loyalty_points
    AFTER INSERT OR UPDATE OF status ON orders
    FOR EACH ROW EXECUTE FUNCTION award_loyalty_points_on_order();
```

### check_and_upgrade_tier()
**Evaluates and upgrades tier**

```sql
CREATE OR REPLACE FUNCTION check_and_upgrade_tier(p_membership_id UUID)
RETURNS VOID AS $$
DECLARE
    v_new_tier_id UUID;
BEGIN
    SELECT id INTO v_new_tier_id
    FROM loyalty_tiers t
    JOIN customer_loyalty_memberships m ON t.program_id = m.program_id
    WHERE m.id = p_membership_id
        AND t.is_active = true
        AND t.min_points_required <= m.current_points
        AND t.min_total_spent <= m.total_spent
    ORDER BY t.tier_level DESC
    LIMIT 1;
    
    IF v_new_tier_id IS NOT NULL THEN
        UPDATE customer_loyalty_memberships
        SET tier_id = v_new_tier_id
        WHERE id = p_membership_id;
    END IF;
END;
$$ LANGUAGE plpgsql;
```

### find_or_create_customer_by_phone()
**POS helper for quick lookup/create**

```sql
CREATE OR REPLACE FUNCTION find_or_create_customer_by_phone(
    p_phone TEXT,
    p_first_name TEXT DEFAULT NULL,
    p_default_program_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_customer_id UUID;
BEGIN
    -- Normalize phone
    p_phone := REGEXP_REPLACE(p_phone, '[^0-9+]', '', 'g');
    
    -- Try to find
    SELECT customer_id INTO v_customer_id
    FROM customer_phone_index
    WHERE phone = p_phone LIMIT 1;
    
    -- Create if not found
    IF v_customer_id IS NULL THEN
        INSERT INTO customers (first_name, phone, ...)
        VALUES (...) RETURNING id INTO v_customer_id;
        
        -- Add to phone index
        INSERT INTO customer_phone_index (phone, customer_id)
        VALUES (p_phone, v_customer_id);
        
        -- Create membership if program provided
        IF p_default_program_id IS NOT NULL THEN
            INSERT INTO customer_loyalty_memberships (customer_id, program_id)
            VALUES (v_customer_id, p_default_program_id);
        END IF;
    END IF;
    
    RETURN v_customer_id;
END;
$$ LANGUAGE plpgsql;
```

**Usage at POS:**
```sql
SELECT * FROM find_or_create_customer_by_phone('0812345678', 'John', NULL);
-- Returns customer_id (creates if new)
```

---

## Database Views

### customer_loyalty_summary
**Comprehensive customer loyalty overview**

```sql
CREATE OR REPLACE VIEW customer_loyalty_summary AS
SELECT 
    c.id as customer_id,
    c.phone,
    m.membership_number,
    lp.name as program_name,
    lt.name as tier_name,
    lt.color_code as tier_color,
    m.current_points,
    m.lifetime_points,
    m.total_spent,
    FLOOR(m.current_points * lp.redemption_rate) as points_value_baht,
    -- Points to next tier
    (SELECT MIN(min_points_required) - m.current_points
     FROM loyalty_tiers
     WHERE program_id = m.program_id AND tier_level > COALESCE(lt.tier_level, 0)
    ) as points_to_next_tier
FROM customers c
JOIN customer_loyalty_memberships m ON c.id = m.customer_id
JOIN loyalty_programs lp ON m.program_id = lp.id
LEFT JOIN loyalty_tiers lt ON m.tier_id = lt.id
WHERE m.status = 'active';
```

**Usage:**
```sql
SELECT * FROM customer_loyalty_summary WHERE phone = '0812345678';
```

### points_transaction_summary
**Transaction history with details**

```sql
CREATE OR REPLACE VIEW points_transaction_summary AS
SELECT 
    pt.id,
    pt.customer_id,
    c.phone as customer_phone,
    pt.transaction_type,
    pt.points,
    pt.balance_after as current_balance,
    pt.description,
    o.order_number,
    pt.created_at as transaction_date,
    b.name as branch_name
FROM points_transactions pt
JOIN customers c ON pt.customer_id = c.id
LEFT JOIN orders o ON pt.order_id = o.id
LEFT JOIN branches b ON pt.branch_id = b.id;
```

### loyalty_program_performance
**Program analytics and KPIs**

```sql
CREATE OR REPLACE VIEW loyalty_program_performance AS
SELECT 
    lp.id as program_id,
    lp.name as program_name,
    COUNT(DISTINCT m.id) as total_members,
    COUNT(DISTINCT CASE WHEN m.status = 'active' THEN m.id END) as active_members,
    SUM(m.current_points) as total_points_issued,
    SUM(m.lifetime_points) as total_lifetime_points,
    SUM(m.total_spent) as total_member_spending,
    AVG(m.current_points) as avg_points_per_member
FROM loyalty_programs lp
LEFT JOIN customer_loyalty_memberships m ON lp.id = m.program_id
GROUP BY lp.id, lp.name;
```

---

## Row Level Security (RLS)

### Policies for Loyalty Tables

```sql
-- Enable RLS
ALTER TABLE loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_loyalty_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;

-- View active programs
CREATE POLICY "Users can view active programs" ON loyalty_programs
    FOR SELECT USING (is_active = true OR auth.uid() IS NOT NULL);

-- Staff can manage memberships
CREATE POLICY "Staff can update memberships" ON customer_loyalty_memberships
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Staff can create transactions
CREATE POLICY "Staff can create transactions" ON points_transactions
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
```

---

## Performance Notes

### Critical Indexes for POS Performance

1. **Phone Lookup**: `idx_customer_phone_index_phone`
   - Makes customer lookup < 50ms
   - UNIQUE constraint prevents duplicates

2. **Membership Lookup**: `idx_customer_memberships_customer`
   - Quick membership retrieval
   - Used in every POS transaction

3. **Transaction History**: `idx_points_transactions_customer`
   - Fast transaction list
   - Supports reporting queries

### Query Optimization Tips

```sql
-- GOOD: Use phone index
SELECT customer_id FROM customer_phone_index WHERE phone = '0812345678';

-- BAD: Scan customers table
SELECT id FROM customers WHERE phone = '0812345678';

-- GOOD: Use view for reporting
SELECT * FROM customer_loyalty_summary WHERE customer_id = '<uuid>';

-- BAD: Manual joins
SELECT c.*, m.*, lp.* FROM customers c JOIN ...
```

---

## Backup and Maintenance

### Regular Maintenance Tasks

```sql
-- Analyze tables for query planning
ANALYZE customer_phone_index;
ANALYZE customer_loyalty_memberships;
ANALYZE points_transactions;

-- Vacuum to reclaim space
VACUUM ANALYZE points_transactions;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0 AND schemaname = 'public';
```

### Backup Important Tables

```bash
# Backup loyalty data
pg_dump -t loyalty_programs > loyalty_programs.sql
pg_dump -t loyalty_tiers > loyalty_tiers.sql
pg_dump -t customer_loyalty_memberships > memberships.sql
pg_dump -t points_transactions > transactions.sql
```

---

*This schema documentation is maintained as part of the ShopFlow context engineering system.*
