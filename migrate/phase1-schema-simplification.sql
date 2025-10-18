-- =========================================
-- Phase 1: Database Schema Simplification
-- From 18 tables → 13 core tables
-- Created: 2025-01-18
-- Status: READY FOR REVIEW
-- =========================================

-- =========================================
-- PART 1: CREATE NEW TABLES
-- =========================================

-- 1. Create branch_settings table (NEW)
CREATE TABLE IF NOT EXISTS branch_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  
  -- Business settings (JSONB for flexibility)
  business_info JSONB DEFAULT '{
    "business_name": "",
    "tax_id": "",
    "address": "",
    "phone": "",
    "email": ""
  }'::jsonb,
  
  pricing_config JSONB DEFAULT '{
    "currency": "THB",
    "tax_rate": 0.07,
    "tax_inclusive": false,
    "decimal_places": 2
  }'::jsonb,
  
  inventory_config JSONB DEFAULT '{
    "low_stock_threshold": 10,
    "allow_negative_stock": false,
    "track_serial_numbers": false
  }'::jsonb,
  
  printer_config JSONB DEFAULT '{
    "printer_type": "thermal",
    "paper_size": "80mm",
    "auto_print": false,
    "print_logo": true
  }'::jsonb,
  
  loyalty_config JSONB DEFAULT '{
    "enabled": true,
    "points_per_baht": 1,
    "points_expiry_days": 365
  }'::jsonb,
  
  payment_config JSONB DEFAULT '{
    "cash_enabled": true,
    "card_enabled": true,
    "qr_enabled": true,
    "payment_gateway": ""
  }'::jsonb,
  
  permissions JSONB DEFAULT '{
    "allow_discount": true,
    "allow_refund": false,
    "allow_void": false,
    "require_approval": true
  }'::jsonb,
  
  pos_display_settings JSONB DEFAULT '{
    "language": "th",
    "theme": "light",
    "show_stock": true,
    "show_cost": false,
    "grid_columns": 4
  }'::jsonb,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id),
  
  UNIQUE(branch_id)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_branch_settings_branch_id ON branch_settings(branch_id);
CREATE INDEX IF NOT EXISTS idx_branch_settings_active ON branch_settings(is_active);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_branch_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER branch_settings_updated_at
  BEFORE UPDATE ON branch_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_branch_settings_updated_at();

-- =========================================
-- PART 2: DATA MIGRATION & CONSOLIDATION
-- =========================================

-- 2. Migrate payment_transactions into payments (if separate tables exist)
-- Note: This assumes you want to consolidate payment tracking
-- Uncomment if you have separate payment_transactions table

/*
-- Insert payment_transactions into payments
INSERT INTO payments (
  id, order_id, amount, payment_method, status, 
  transaction_id, created_at
)
SELECT 
  id, order_id, amount, payment_method, 
  CASE 
    WHEN status = 'completed' THEN 'completed'
    WHEN status = 'pending' THEN 'pending'
    ELSE 'failed'
  END as status,
  transaction_id, created_at
FROM payment_transactions
WHERE NOT EXISTS (
  SELECT 1 FROM payments p WHERE p.id = payment_transactions.id
);
*/

-- 3. Consolidate inventory tracking
-- Merge inventory_adjustments into inventory_movements
-- Uncomment if you have separate inventory_adjustments table

/*
INSERT INTO inventory_movements (
  id, product_id, branch_id, quantity, movement_type,
  reference_type, reference_id, notes, created_at, created_by
)
SELECT 
  id, product_id, branch_id, quantity,
  CASE 
    WHEN adjustment_type = 'increase' THEN 'adjustment_in'
    WHEN adjustment_type = 'decrease' THEN 'adjustment_out'
    ELSE 'adjustment'
  END as movement_type,
  'adjustment' as reference_type,
  id as reference_id,
  notes, created_at, created_by
FROM inventory_adjustments
WHERE NOT EXISTS (
  SELECT 1 FROM inventory_movements im 
  WHERE im.reference_type = 'adjustment' 
  AND im.reference_id = inventory_adjustments.id
);
*/

-- =========================================
-- PART 3: INSERT DEFAULT SETTINGS
-- =========================================

-- Insert default branch_settings for existing branches
INSERT INTO branch_settings (branch_id, created_at, updated_at)
SELECT 
  id as branch_id,
  NOW() as created_at,
  NOW() as updated_at
FROM branches
WHERE NOT EXISTS (
  SELECT 1 FROM branch_settings bs WHERE bs.branch_id = branches.id
);

-- =========================================
-- PART 4: DROP UNUSED TABLES (Phase 1)
-- =========================================

-- WARNING: These tables will be dropped!
-- Make sure to backup data before running this section
-- Uncomment each DROP statement only after verifying data migration

-- Tables to remove in Phase 1:
-- ❌ suppliers (Move to Phase 2)
-- ❌ purchase_orders (Move to Phase 2)
-- ❌ inventory_adjustments (Merged into inventory_movements)
-- ❌ product_variants (Simplified in Phase 1, add back in Phase 2)
-- ❌ promotions (Add in Phase 3)
-- ❌ payment_transactions (Merged into payments)
-- ❌ notifications (Add in Phase 2)
-- ❌ api_keys (Add in Phase 4)
-- ❌ reports_cache (Not needed with proper caching)

-- DO NOT RUN THESE DROPS UNTIL DATA IS BACKED UP!
-- Uncomment one by one after verification:

-- DROP TABLE IF EXISTS reports_cache CASCADE;
-- DROP TABLE IF EXISTS api_keys CASCADE;
-- DROP TABLE IF EXISTS notifications CASCADE;
-- DROP TABLE IF EXISTS payment_transactions CASCADE;
-- DROP TABLE IF EXISTS promotions CASCADE;
-- DROP TABLE IF EXISTS product_variants CASCADE;
-- DROP TABLE IF EXISTS inventory_adjustments CASCADE;
-- DROP TABLE IF EXISTS purchase_orders CASCADE;
-- DROP TABLE IF EXISTS suppliers CASCADE;

-- =========================================
-- PART 5: CLEANUP & OPTIMIZATION
-- =========================================

-- Vacuum analyze to reclaim space and update statistics
-- VACUUM ANALYZE branch_settings;
-- VACUUM ANALYZE payments;
-- VACUUM ANALYZE inventory_movements;

-- =========================================
-- VERIFICATION QUERIES
-- =========================================

-- Verify branch_settings created correctly
-- SELECT COUNT(*) as branch_settings_count FROM branch_settings;

-- Verify all branches have settings
-- SELECT 
--   b.id, b.name, 
--   CASE WHEN bs.id IS NULL THEN 'Missing' ELSE 'OK' END as settings_status
-- FROM branches b
-- LEFT JOIN branch_settings bs ON b.id = bs.branch_id;

-- Check table counts after migration
-- SELECT 
--   'branches' as table_name, COUNT(*) as count FROM branches
-- UNION ALL SELECT 'branch_settings', COUNT(*) FROM branch_settings
-- UNION ALL SELECT 'products', COUNT(*) FROM products
-- UNION ALL SELECT 'categories', COUNT(*) FROM categories
-- UNION ALL SELECT 'customers', COUNT(*) FROM customers
-- UNION ALL SELECT 'orders', COUNT(*) FROM orders
-- UNION ALL SELECT 'order_items', COUNT(*) FROM order_items
-- UNION ALL SELECT 'payments', COUNT(*) FROM payments
-- UNION ALL SELECT 'inventory_movements', COUNT(*) FROM inventory_movements
-- UNION ALL SELECT 'system_settings', COUNT(*) FROM system_settings
-- UNION ALL SELECT 'audit_logs', COUNT(*) FROM audit_logs;

-- =========================================
-- ROLLBACK SCRIPT (In case of issues)
-- =========================================

-- Save this rollback script separately
/*
-- Rollback: Drop new tables and restore old ones
DROP TABLE IF EXISTS branch_settings CASCADE;

-- Restore from backup if needed
-- pg_restore -d shopflow backup_before_phase1.sql
*/

-- =========================================
-- NOTES
-- =========================================

/*
TARGET SCHEMA (13 Core Tables):
✅ users                        -- Authentication & profiles
✅ branches                     -- Multi-branch support
✅ branch_settings (NEW)        -- Branch-specific configurations
✅ products                     -- Product catalog
✅ categories                   -- Product categories
✅ customers                    -- Customer data
✅ customer_loyalty_memberships -- Loyalty program (optional)
✅ orders                       -- Sales transactions
✅ order_items                  -- Order line items
✅ payments                     -- Payment tracking
✅ inventory_movements          -- Stock tracking
✅ system_settings              -- Global settings
✅ audit_logs                   -- Security & compliance

OPTIONAL (Keep if actively using):
- loyalty_programs
- loyalty_tiers
- points_transactions

REMOVED (Move to later phases):
- suppliers, purchase_orders (Phase 2)
- product_variants (Phase 2)
- promotions (Phase 3)
- notifications (Phase 2)
- api_keys (Phase 4)
- reports_cache (not needed)
- inventory_adjustments (merged)
- payment_transactions (merged)
*/

-- =========================================
-- END OF MIGRATION SCRIPT
-- =========================================

