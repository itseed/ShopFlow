-- ============================================================
-- ShopFlow Loyalty Program Enhancement Migration
-- Version: 3.0
-- Purpose: Complete Loyalty Program System with Phone-based Point Accumulation
-- ============================================================

-- Enable necessary extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- STEP 1: CREATE LOYALTY PROGRAM TABLES
-- ============================================================

-- 1.1 Loyalty Programs Table (Multiple programs can be active)
CREATE TABLE IF NOT EXISTS loyalty_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    
    -- Points Configuration
    points_per_baht NUMERIC(8,4) NOT NULL DEFAULT 1.0, -- How many points earned per baht spent
    minimum_points_to_redeem INTEGER NOT NULL DEFAULT 100,
    redemption_rate NUMERIC(8,4) NOT NULL DEFAULT 1.0, -- How many baht per point when redeeming
    
    -- Program Settings
    points_expiry_days INTEGER, -- NULL = never expire
    welcome_bonus_points INTEGER DEFAULT 0,
    birthday_bonus_points INTEGER DEFAULT 0,
    
    -- Program Status
    is_active BOOLEAN DEFAULT true,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE, -- NULL = no end date
    
    -- Tier System
    enable_tiers BOOLEAN DEFAULT false,
    
    -- Metadata
    terms_and_conditions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 1.2 Loyalty Tiers Table (Bronze, Silver, Gold, Platinum, etc.)
CREATE TABLE IF NOT EXISTS loyalty_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES loyalty_programs(id) ON DELETE CASCADE,
    
    -- Tier Information
    name TEXT NOT NULL, -- e.g., "Bronze", "Silver", "Gold", "Platinum"
    description TEXT,
    color_code TEXT, -- Hex color for UI display
    icon TEXT, -- Icon name or emoji
    
    -- Requirements
    min_points_required INTEGER NOT NULL DEFAULT 0,
    min_total_spent NUMERIC(12,2) NOT NULL DEFAULT 0,
    
    -- Benefits
    points_multiplier NUMERIC(4,2) NOT NULL DEFAULT 1.0, -- e.g., 1.5x points
    discount_percentage NUMERIC(5,2) DEFAULT 0, -- Additional discount %
    
    -- Privileges (JSON array of benefits)
    benefits JSONB DEFAULT '[]'::jsonb,
    
    -- Order
    tier_level INTEGER NOT NULL DEFAULT 1, -- 1=lowest, higher=better
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(program_id, tier_level)
);

-- 1.3 Customer Loyalty Memberships (Links customers to programs)
CREATE TABLE IF NOT EXISTS customer_loyalty_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES loyalty_programs(id) ON DELETE CASCADE,
    tier_id UUID REFERENCES loyalty_tiers(id) ON DELETE SET NULL,
    
    -- Membership Details
    membership_number TEXT UNIQUE NOT NULL, -- Auto-generated membership ID
    current_points INTEGER NOT NULL DEFAULT 0,
    lifetime_points INTEGER NOT NULL DEFAULT 0, -- Total points ever earned
    total_spent NUMERIC(12,2) NOT NULL DEFAULT 0,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'expired')),
    joined_date DATE NOT NULL DEFAULT CURRENT_DATE,
    last_activity_date TIMESTAMP WITH TIME ZONE,
    expires_at DATE,
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(customer_id, program_id)
);

-- 1.4 Points Transactions Table (Complete audit trail)
CREATE TABLE IF NOT EXISTS points_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    membership_id UUID NOT NULL REFERENCES customer_loyalty_memberships(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Transaction Details
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earn', 'redeem', 'expire', 'adjustment', 'bonus', 'refund')),
    points INTEGER NOT NULL, -- Positive for earn, negative for redeem/expire
    balance_before INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    
    -- Reference Information
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    reference_type TEXT CHECK (reference_type IN ('purchase', 'redemption', 'manual', 'welcome', 'birthday', 'promotion', 'refund')),
    reference_id TEXT, -- Generic reference ID
    
    -- Amount Info (for earn/redeem)
    amount_spent NUMERIC(12,2), -- For earn transactions
    amount_redeemed NUMERIC(12,2), -- For redeem transactions
    
    -- Details
    description TEXT NOT NULL,
    notes TEXT,
    
    -- Expiry
    expires_at DATE, -- When these points will expire
    expired_at TIMESTAMP WITH TIME ZONE, -- When points actually expired
    
    -- Tracking
    processed_by UUID REFERENCES auth.users(id),
    branch_id UUID REFERENCES branches(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.5 Customer Quick Lookup (for POS phone-based search)
CREATE TABLE IF NOT EXISTS customer_phone_index (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- STEP 2: CREATE INDEXES FOR PERFORMANCE
-- ============================================================

-- Loyalty Programs
CREATE INDEX IF NOT EXISTS idx_loyalty_programs_active ON loyalty_programs(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_loyalty_programs_dates ON loyalty_programs(start_date, end_date);

-- Loyalty Tiers
CREATE INDEX IF NOT EXISTS idx_loyalty_tiers_program ON loyalty_tiers(program_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_tiers_level ON loyalty_tiers(program_id, tier_level);

-- Customer Memberships
CREATE INDEX IF NOT EXISTS idx_customer_memberships_customer ON customer_loyalty_memberships(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_memberships_program ON customer_loyalty_memberships(program_id);
CREATE INDEX IF NOT EXISTS idx_customer_memberships_tier ON customer_loyalty_memberships(tier_id);
CREATE INDEX IF NOT EXISTS idx_customer_memberships_status ON customer_loyalty_memberships(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_customer_memberships_points ON customer_loyalty_memberships(current_points);
CREATE INDEX IF NOT EXISTS idx_customer_memberships_number ON customer_loyalty_memberships(membership_number);

-- Points Transactions
CREATE INDEX IF NOT EXISTS idx_points_transactions_membership ON points_transactions(membership_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_customer ON points_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_order ON points_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_type ON points_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_points_transactions_date ON points_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_points_transactions_expiry ON points_transactions(expires_at) WHERE expires_at IS NOT NULL;

-- Phone Index
CREATE INDEX IF NOT EXISTS idx_customer_phone_index_phone ON customer_phone_index(phone);
CREATE INDEX IF NOT EXISTS idx_customer_phone_index_customer ON customer_phone_index(customer_id);

-- Enhanced customer indexes
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone) WHERE phone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_loyalty_points ON customers(loyalty_points DESC);

-- ============================================================
-- STEP 3: CREATE UTILITY FUNCTIONS
-- ============================================================

-- 3.1 Generate Membership Number
CREATE OR REPLACE FUNCTION generate_membership_number()
RETURNS TRIGGER AS $$
DECLARE
    program_code TEXT;
    sequence_num INTEGER;
BEGIN
    IF NEW.membership_number IS NULL OR NEW.membership_number = '' THEN
        -- Get program first letter
        SELECT LEFT(UPPER(name), 3) INTO program_code 
        FROM loyalty_programs 
        WHERE id = NEW.program_id;
        
        IF program_code IS NULL THEN
            program_code := 'LOY';
        END IF;
        
        -- Get next sequence
        SELECT COUNT(*) + 1 INTO sequence_num
        FROM customer_loyalty_memberships
        WHERE program_id = NEW.program_id;
        
        -- Generate: LOY-20240101-000001
        NEW.membership_number := program_code || '-' || 
                                TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                                LPAD(sequence_num::TEXT, 6, '0');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3.2 Calculate Points for Purchase
CREATE OR REPLACE FUNCTION calculate_points_for_purchase(
    p_amount NUMERIC(12,2),
    p_program_id UUID,
    p_tier_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_points_per_baht NUMERIC(8,4);
    v_tier_multiplier NUMERIC(4,2) := 1.0;
    v_calculated_points INTEGER;
BEGIN
    -- Get base points per baht from program
    SELECT points_per_baht INTO v_points_per_baht
    FROM loyalty_programs
    WHERE id = p_program_id AND is_active = true;
    
    IF v_points_per_baht IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Get tier multiplier if applicable
    IF p_tier_id IS NOT NULL THEN
        SELECT points_multiplier INTO v_tier_multiplier
        FROM loyalty_tiers
        WHERE id = p_tier_id AND is_active = true;
    END IF;
    
    -- Calculate points
    v_calculated_points := FLOOR(p_amount * v_points_per_baht * v_tier_multiplier);
    
    RETURN GREATEST(v_calculated_points, 0);
END;
$$ LANGUAGE plpgsql;

-- 3.3 Add Points Transaction
CREATE OR REPLACE FUNCTION add_points_transaction(
    p_membership_id UUID,
    p_customer_id UUID,
    p_transaction_type TEXT,
    p_points INTEGER,
    p_description TEXT,
    p_order_id UUID DEFAULT NULL,
    p_reference_type TEXT DEFAULT NULL,
    p_amount_spent NUMERIC(12,2) DEFAULT NULL,
    p_branch_id UUID DEFAULT NULL,
    p_processed_by UUID DEFAULT NULL,
    p_expires_days INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_transaction_id UUID;
    v_current_balance INTEGER;
    v_new_balance INTEGER;
    v_expires_at DATE;
BEGIN
    -- Get current balance
    SELECT current_points INTO v_current_balance
    FROM customer_loyalty_memberships
    WHERE id = p_membership_id;
    
    IF v_current_balance IS NULL THEN
        RAISE EXCEPTION 'Membership not found';
    END IF;
    
    -- Calculate new balance
    v_new_balance := v_current_balance + p_points;
    
    IF v_new_balance < 0 THEN
        RAISE EXCEPTION 'Insufficient points balance';
    END IF;
    
    -- Calculate expiry date
    IF p_expires_days IS NOT NULL AND p_points > 0 THEN
        v_expires_at := CURRENT_DATE + (p_expires_days || ' days')::INTERVAL;
    END IF;
    
    -- Insert transaction
    INSERT INTO points_transactions (
        membership_id,
        customer_id,
        transaction_type,
        points,
        balance_before,
        balance_after,
        order_id,
        reference_type,
        amount_spent,
        description,
        expires_at,
        branch_id,
        processed_by
    ) VALUES (
        p_membership_id,
        p_customer_id,
        p_transaction_type,
        p_points,
        v_current_balance,
        v_new_balance,
        p_order_id,
        p_reference_type,
        p_amount_spent,
        p_description,
        v_expires_at,
        p_branch_id,
        p_processed_by
    ) RETURNING id INTO v_transaction_id;
    
    -- Update membership balance
    UPDATE customer_loyalty_memberships
    SET 
        current_points = v_new_balance,
        lifetime_points = CASE 
            WHEN p_points > 0 THEN lifetime_points + p_points 
            ELSE lifetime_points 
        END,
        total_spent = CASE 
            WHEN p_amount_spent IS NOT NULL THEN total_spent + p_amount_spent 
            ELSE total_spent 
        END,
        last_activity_date = NOW(),
        updated_at = NOW()
    WHERE id = p_membership_id;
    
    -- Update customer loyalty points
    UPDATE customers
    SET 
        loyalty_points = v_new_balance,
        total_spent = CASE 
            WHEN p_amount_spent IS NOT NULL THEN total_spent + p_amount_spent 
            ELSE total_spent 
        END,
        total_orders = CASE 
            WHEN p_order_id IS NOT NULL THEN total_orders + 1 
            ELSE total_orders 
        END,
        last_order_date = CASE 
            WHEN p_order_id IS NOT NULL THEN NOW() 
            ELSE last_order_date 
        END,
        updated_at = NOW()
    WHERE id = p_customer_id;
    
    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- 3.4 Auto-award Points on Order Completion
CREATE OR REPLACE FUNCTION award_loyalty_points_on_order()
RETURNS TRIGGER AS $$
DECLARE
    v_membership_id UUID;
    v_program_id UUID;
    v_tier_id UUID;
    v_points INTEGER;
    v_points_expiry_days INTEGER;
BEGIN
    -- Only process if order status changed to completed
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        -- Check if customer has loyalty membership
        IF NEW.customer_id IS NOT NULL THEN
            SELECT m.id, m.program_id, m.tier_id, lp.points_expiry_days
            INTO v_membership_id, v_program_id, v_tier_id, v_points_expiry_days
            FROM customer_loyalty_memberships m
            JOIN loyalty_programs lp ON m.program_id = lp.id
            WHERE m.customer_id = NEW.customer_id
                AND m.status = 'active'
                AND lp.is_active = true
            ORDER BY m.joined_date ASC
            LIMIT 1;
            
            IF v_membership_id IS NOT NULL THEN
                -- Calculate points
                v_points := calculate_points_for_purchase(
                    NEW.total,
                    v_program_id,
                    v_tier_id
                );
                
                IF v_points > 0 THEN
                    -- Add points transaction
                    PERFORM add_points_transaction(
                        v_membership_id,
                        NEW.customer_id,
                        'earn',
                        v_points,
                        'Points earned from order ' || NEW.order_number,
                        NEW.id,
                        'purchase',
                        NEW.total,
                        NEW.branch_id,
                        NEW.created_by,
                        v_points_expiry_days
                    );
                END IF;
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3.5 Check and Auto-upgrade Tier
CREATE OR REPLACE FUNCTION check_and_upgrade_tier(p_membership_id UUID)
RETURNS VOID AS $$
DECLARE
    v_program_id UUID;
    v_current_tier_id UUID;
    v_current_points INTEGER;
    v_total_spent NUMERIC(12,2);
    v_new_tier_id UUID;
    v_new_tier_name TEXT;
BEGIN
    -- Get membership details
    SELECT program_id, tier_id, current_points, total_spent
    INTO v_program_id, v_current_tier_id, v_current_points, v_total_spent
    FROM customer_loyalty_memberships
    WHERE id = p_membership_id;
    
    -- Find the highest tier the customer qualifies for
    SELECT id, name INTO v_new_tier_id, v_new_tier_name
    FROM loyalty_tiers
    WHERE program_id = v_program_id
        AND is_active = true
        AND min_points_required <= v_current_points
        AND min_total_spent <= v_total_spent
    ORDER BY tier_level DESC
    LIMIT 1;
    
    -- Update if tier changed
    IF v_new_tier_id IS NOT NULL AND v_new_tier_id != COALESCE(v_current_tier_id, '00000000-0000-0000-0000-000000000000'::UUID) THEN
        UPDATE customer_loyalty_memberships
        SET tier_id = v_new_tier_id,
            updated_at = NOW()
        WHERE id = p_membership_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 3.6 Find or Create Customer by Phone
CREATE OR REPLACE FUNCTION find_or_create_customer_by_phone(
    p_phone TEXT,
    p_first_name TEXT DEFAULT NULL,
    p_default_program_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_customer_id UUID;
    v_membership_id UUID;
BEGIN
    -- Normalize phone number (remove spaces, dashes)
    p_phone := REGEXP_REPLACE(p_phone, '[^0-9+]', '', 'g');
    
    -- Try to find existing customer
    SELECT customer_id INTO v_customer_id
    FROM customer_phone_index
    WHERE phone = p_phone
    LIMIT 1;
    
    -- If not found, check customers table directly
    IF v_customer_id IS NULL THEN
        SELECT id INTO v_customer_id
        FROM customers
        WHERE phone = p_phone
        LIMIT 1;
    END IF;
    
    -- Create new customer if not found
    IF v_customer_id IS NULL THEN
        INSERT INTO customers (
            first_name,
            phone,
            customer_type,
            status,
            country
        ) VALUES (
            COALESCE(p_first_name, 'Customer'),
            p_phone,
            'individual',
            'active',
            'Thailand'
        ) RETURNING id INTO v_customer_id;
        
        -- Add to phone index
        INSERT INTO customer_phone_index (phone, customer_id)
        VALUES (p_phone, v_customer_id);
        
        -- Create loyalty membership if default program exists
        IF p_default_program_id IS NOT NULL THEN
            INSERT INTO customer_loyalty_memberships (
                customer_id,
                program_id,
                status
            ) VALUES (
                v_customer_id,
                p_default_program_id,
                'active'
            );
        END IF;
    ELSE
        -- Update phone index if needed
        INSERT INTO customer_phone_index (phone, customer_id)
        VALUES (p_phone, v_customer_id)
        ON CONFLICT (phone) DO NOTHING;
    END IF;
    
    RETURN v_customer_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- STEP 4: CREATE TRIGGERS
-- ============================================================

-- Trigger to auto-generate membership number
DROP TRIGGER IF EXISTS customer_loyalty_memberships_generate_number ON customer_loyalty_memberships;
CREATE TRIGGER customer_loyalty_memberships_generate_number
    BEFORE INSERT ON customer_loyalty_memberships
    FOR EACH ROW
    EXECUTE FUNCTION generate_membership_number();

-- Trigger to award points on order completion
DROP TRIGGER IF EXISTS orders_award_loyalty_points ON orders;
CREATE TRIGGER orders_award_loyalty_points
    AFTER INSERT OR UPDATE OF status ON orders
    FOR EACH ROW
    EXECUTE FUNCTION award_loyalty_points_on_order();

-- Update timestamp triggers
DROP TRIGGER IF EXISTS update_loyalty_programs_updated_at ON loyalty_programs;
CREATE TRIGGER update_loyalty_programs_updated_at
    BEFORE UPDATE ON loyalty_programs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_loyalty_tiers_updated_at ON loyalty_tiers;
CREATE TRIGGER update_loyalty_tiers_updated_at
    BEFORE UPDATE ON loyalty_tiers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_customer_loyalty_memberships_updated_at ON customer_loyalty_memberships;
CREATE TRIGGER update_customer_loyalty_memberships_updated_at
    BEFORE UPDATE ON customer_loyalty_memberships
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_customer_phone_index_updated_at ON customer_phone_index;
CREATE TRIGGER update_customer_phone_index_updated_at
    BEFORE UPDATE ON customer_phone_index
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- STEP 5: CREATE VIEWS FOR REPORTING
-- ============================================================

-- Customer Loyalty Summary View
CREATE OR REPLACE VIEW customer_loyalty_summary AS
SELECT 
    c.id as customer_id,
    c.customer_code,
    COALESCE(c.first_name || ' ' || c.last_name, c.company_name, c.phone) as customer_name,
    c.phone,
    c.email,
    m.id as membership_id,
    m.membership_number,
    lp.name as program_name,
    lt.name as tier_name,
    lt.color_code as tier_color,
    m.current_points,
    m.lifetime_points,
    m.total_spent,
    m.joined_date,
    m.last_activity_date,
    m.status as membership_status,
    -- Calculate points value
    FLOOR(m.current_points * lp.redemption_rate) as points_value_baht,
    -- Calculate next tier requirements
    (
        SELECT MIN(min_points_required) - m.current_points
        FROM loyalty_tiers
        WHERE program_id = m.program_id
            AND is_active = true
            AND min_points_required > m.current_points
    ) as points_to_next_tier,
    (
        SELECT name
        FROM loyalty_tiers
        WHERE program_id = m.program_id
            AND is_active = true
            AND min_points_required > m.current_points
        ORDER BY tier_level ASC
        LIMIT 1
    ) as next_tier_name
FROM customers c
JOIN customer_loyalty_memberships m ON c.id = m.customer_id
JOIN loyalty_programs lp ON m.program_id = lp.id
LEFT JOIN loyalty_tiers lt ON m.tier_id = lt.id
WHERE m.status = 'active' AND lp.is_active = true;

-- Points Transaction Summary View
CREATE OR REPLACE VIEW points_transaction_summary AS
SELECT 
    pt.id,
    pt.customer_id,
    c.phone as customer_phone,
    COALESCE(c.first_name || ' ' || c.last_name, c.company_name) as customer_name,
    pt.transaction_type,
    pt.points,
    pt.balance_after as current_balance,
    pt.description,
    pt.amount_spent,
    pt.amount_redeemed,
    pt.order_id,
    o.order_number,
    pt.reference_type,
    pt.expires_at,
    pt.created_at as transaction_date,
    b.name as branch_name,
    u.display_name as processed_by_name
FROM points_transactions pt
JOIN customers c ON pt.customer_id = c.id
LEFT JOIN orders o ON pt.order_id = o.id
LEFT JOIN branches b ON pt.branch_id = b.id
LEFT JOIN user_profiles u ON pt.processed_by = u.id;

-- Loyalty Program Performance View
CREATE OR REPLACE VIEW loyalty_program_performance AS
SELECT 
    lp.id as program_id,
    lp.name as program_name,
    lp.is_active,
    COUNT(DISTINCT m.id) as total_members,
    COUNT(DISTINCT CASE WHEN m.status = 'active' THEN m.id END) as active_members,
    SUM(m.current_points) as total_points_issued,
    SUM(m.lifetime_points) as total_lifetime_points,
    SUM(m.total_spent) as total_member_spending,
    AVG(m.current_points) as avg_points_per_member,
    AVG(m.total_spent) as avg_spending_per_member,
    COUNT(DISTINCT pt.id) as total_transactions,
    SUM(CASE WHEN pt.transaction_type = 'earn' THEN pt.points ELSE 0 END) as total_points_earned,
    SUM(CASE WHEN pt.transaction_type = 'redeem' THEN ABS(pt.points) ELSE 0 END) as total_points_redeemed,
    SUM(CASE WHEN pt.transaction_type = 'redeem' THEN pt.amount_redeemed ELSE 0 END) as total_redemption_value
FROM loyalty_programs lp
LEFT JOIN customer_loyalty_memberships m ON lp.id = m.program_id
LEFT JOIN points_transactions pt ON m.id = pt.membership_id
GROUP BY lp.id, lp.name, lp.is_active;

-- ============================================================
-- STEP 6: INSERT DEFAULT LOYALTY PROGRAM
-- ============================================================

-- Insert default loyalty program (if not exists)
INSERT INTO loyalty_programs (
    name,
    description,
    points_per_baht,
    minimum_points_to_redeem,
    redemption_rate,
    points_expiry_days,
    welcome_bonus_points,
    birthday_bonus_points,
    is_active,
    enable_tiers
) VALUES (
    'ShopFlow Rewards',
    'สะสมแต้มรับส่วนลด ช้อปได้คุ้มกว่าทุกครั้ง',
    1.0, -- 1 point per 1 baht
    100, -- Minimum 100 points to redeem
    1.0, -- 1 point = 1 baht
    365, -- Points expire in 1 year
    50, -- Welcome bonus
    100, -- Birthday bonus
    true,
    true
) ON CONFLICT DO NOTHING;

-- Get the program ID
DO $$
DECLARE
    v_program_id UUID;
BEGIN
    SELECT id INTO v_program_id
    FROM loyalty_programs
    WHERE name = 'ShopFlow Rewards'
    LIMIT 1;
    
    IF v_program_id IS NOT NULL THEN
        -- Insert default tiers
        INSERT INTO loyalty_tiers (program_id, name, description, color_code, icon, min_points_required, min_total_spent, points_multiplier, discount_percentage, tier_level, benefits)
        VALUES 
            (v_program_id, 'Bronze', 'สมาชิกทั่วไป', '#CD7F32', '🥉', 0, 0, 1.0, 0, 1, '["สะสมแต้มทุกการซื้อ"]'::jsonb),
            (v_program_id, 'Silver', 'สมาชิกเงิน', '#C0C0C0', '🥈', 1000, 5000, 1.2, 5, 2, '["สะสมแต้ม 1.2 เท่า", "ส่วนลด 5%"]'::jsonb),
            (v_program_id, 'Gold', 'สมาชิกทอง', '#FFD700', '🥇', 5000, 20000, 1.5, 10, 3, '["สะสมแต้ม 1.5 เท่า", "ส่วนลด 10%", "ของขวัญวันเกิด"]'::jsonb),
            (v_program_id, 'Platinum', 'สมาชิกแพลตตินั่ม', '#E5E4E2', '💎', 15000, 50000, 2.0, 15, 4, '["สะสมแต้ม 2 เท่า", "ส่วนลด 15%", "ของขวัญพิเศษ", "บริการจัดส่งฟรี"]'::jsonb)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- ============================================================
-- STEP 7: MIGRATE EXISTING CUSTOMERS TO LOYALTY PROGRAM
-- ============================================================

-- Migrate existing customers with phone numbers to the default program
DO $$
DECLARE
    v_program_id UUID;
    v_customer_record RECORD;
BEGIN
    -- Get default program
    SELECT id INTO v_program_id
    FROM loyalty_programs
    WHERE name = 'ShopFlow Rewards' AND is_active = true
    LIMIT 1;
    
    IF v_program_id IS NOT NULL THEN
        -- Create memberships for existing customers
        FOR v_customer_record IN 
            SELECT c.id, c.phone, c.loyalty_points, c.total_spent
            FROM customers c
            WHERE c.phone IS NOT NULL
                AND NOT EXISTS (
                    SELECT 1 FROM customer_loyalty_memberships m 
                    WHERE m.customer_id = c.id AND m.program_id = v_program_id
                )
        LOOP
            -- Create membership
            INSERT INTO customer_loyalty_memberships (
                customer_id,
                program_id,
                current_points,
                lifetime_points,
                total_spent,
                status
            ) VALUES (
                v_customer_record.id,
                v_program_id,
                COALESCE(v_customer_record.loyalty_points, 0),
                COALESCE(v_customer_record.loyalty_points, 0),
                COALESCE(v_customer_record.total_spent, 0),
                'active'
            );
            
            -- Add to phone index
            IF v_customer_record.phone IS NOT NULL THEN
                INSERT INTO customer_phone_index (phone, customer_id)
                VALUES (v_customer_record.phone, v_customer_record.id)
                ON CONFLICT (phone) DO NOTHING;
            END IF;
        END LOOP;
    END IF;
END $$;

-- ============================================================
-- STEP 8: GRANT PERMISSIONS (RLS)
-- ============================================================

-- Enable RLS on new tables
ALTER TABLE loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_loyalty_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_phone_index ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users
CREATE POLICY "Users can view active loyalty programs" ON loyalty_programs
    FOR SELECT USING (is_active = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can view loyalty tiers" ON loyalty_tiers
    FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view all memberships" ON customer_loyalty_memberships
    FOR SELECT USING (true);

CREATE POLICY "Users can view points transactions" ON points_transactions
    FOR SELECT USING (true);

CREATE POLICY "Users can search phone index" ON customer_phone_index
    FOR SELECT USING (true);

-- Admin policies (full access)
CREATE POLICY "Admins can manage loyalty programs" ON loyalty_programs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Admins can manage loyalty tiers" ON loyalty_tiers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

CREATE POLICY "Staff can update memberships" ON customer_loyalty_memberships
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can create points transactions" ON points_transactions
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can update phone index" ON customer_phone_index
    FOR ALL USING (auth.uid() IS NOT NULL);

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================

-- Add helpful comments
COMMENT ON TABLE loyalty_programs IS 'Loyalty program definitions with points configuration';
COMMENT ON TABLE loyalty_tiers IS 'Tier levels for loyalty programs (Bronze, Silver, Gold, etc.)';
COMMENT ON TABLE customer_loyalty_memberships IS 'Customer memberships in loyalty programs';
COMMENT ON TABLE points_transactions IS 'Complete audit trail of all points transactions';
COMMENT ON TABLE customer_phone_index IS 'Fast phone-based customer lookup for POS';

COMMENT ON FUNCTION find_or_create_customer_by_phone IS 'POS helper: Find or create customer by phone number';
COMMENT ON FUNCTION calculate_points_for_purchase IS 'Calculate loyalty points earned for a purchase amount';
COMMENT ON FUNCTION add_points_transaction IS 'Add a points transaction and update balances';
COMMENT ON FUNCTION check_and_upgrade_tier IS 'Check and auto-upgrade customer tier based on points and spending';

-- Print success message
DO $$
BEGIN
    RAISE NOTICE 'Loyalty Program Enhancement Migration Completed Successfully!';
    RAISE NOTICE 'Tables created: 5 (loyalty_programs, loyalty_tiers, customer_loyalty_memberships, points_transactions, customer_phone_index)';
    RAISE NOTICE 'Functions created: 6';
    RAISE NOTICE 'Views created: 3';
    RAISE NOTICE 'Default program: ShopFlow Rewards with 4 tiers (Bronze, Silver, Gold, Platinum)';
END $$;

