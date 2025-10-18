# Loyalty Program System - Context Documentation

**Last Updated**: October 18, 2025  
**Version**: 3.0  
**Status**: ✅ Production Ready

---

## Overview

ShopFlow now includes a comprehensive **Loyalty Program System** with phone-based customer lookup, multi-tier membership, and automatic point accumulation at POS. This system seamlessly integrates with the existing POS and CMS infrastructure.

---

## Database Schema

### Core Tables

#### 1. `loyalty_programs`
Main program configuration table.

**Key Fields:**
- `points_per_baht` (NUMERIC): How many points per baht spent
- `minimum_points_to_redeem` (INTEGER): Minimum points needed to redeem
- `redemption_rate` (NUMERIC): Baht value per point
- `points_expiry_days` (INTEGER): Days until points expire (NULL = never)
- `welcome_bonus_points` (INTEGER): Bonus for new members
- `enable_tiers` (BOOLEAN): Enable tier system

**Default Program: "ShopFlow Rewards"**
```sql
points_per_baht: 1.0
minimum_points_to_redeem: 100
redemption_rate: 1.0
points_expiry_days: 365
welcome_bonus_points: 50
```

#### 2. `loyalty_tiers`
Multi-level membership tiers.

**Tiers Configured:**
- **Bronze**: Entry level (1.0x multiplier, 0% discount)
- **Silver**: 1,000 points, ฿5,000 spent (1.2x, 5%)
- **Gold**: 5,000 points, ฿20,000 spent (1.5x, 10%)
- **Platinum**: 15,000 points, ฿50,000 spent (2.0x, 15%)

**Key Fields:**
- `min_points_required` (INTEGER): Points needed for this tier
- `min_total_spent` (NUMERIC): Total spending needed
- `points_multiplier` (NUMERIC): Point earning multiplier
- `discount_percentage` (NUMERIC): Additional discount %
- `benefits` (JSONB): Array of benefit descriptions

#### 3. `customer_loyalty_memberships`
Links customers to programs.

**Key Fields:**
- `customer_id` (UUID): FK to customers
- `program_id` (UUID): FK to loyalty_programs
- `tier_id` (UUID): FK to loyalty_tiers
- `membership_number` (TEXT): Auto-generated unique ID
- `current_points` (INTEGER): Available points
- `lifetime_points` (INTEGER): Total earned ever
- `total_spent` (NUMERIC): Total spending
- `status` (TEXT): active/inactive/suspended/expired

#### 4. `points_transactions`
Complete audit trail of all point activities.

**Transaction Types:**
- `earn`: Points earned from purchases
- `redeem`: Points used for discounts
- `expire`: Points expired
- `adjustment`: Manual adjustment
- `bonus`: Bonus points (welcome, birthday, etc.)
- `refund`: Points refunded

**Key Fields:**
- `transaction_type` (TEXT): Type of transaction
- `points` (INTEGER): Positive for earn, negative for redeem
- `balance_before` (INTEGER): Balance before transaction
- `balance_after` (INTEGER): Balance after transaction
- `order_id` (UUID): Related order (if applicable)
- `expires_at` (DATE): When these points expire

#### 5. `customer_phone_index`
Optimized phone-based customer lookup.

**Purpose**: Fast POS customer search
**Key Fields:**
- `phone` (TEXT): Normalized phone number (UNIQUE)
- `customer_id` (UUID): FK to customers
- `is_primary` (BOOLEAN): Primary contact
- `is_verified` (BOOLEAN): Phone verified

---

## Database Functions

### `calculate_points_for_purchase(amount, program_id, tier_id)`
Calculates points earned for a purchase.

**Parameters:**
- `p_amount`: Purchase amount in baht
- `p_program_id`: Loyalty program ID
- `p_tier_id`: Customer's tier ID (optional)

**Returns**: INTEGER (points earned)

**Logic:**
```
points = FLOOR(amount * points_per_baht * tier_multiplier)
```

### `add_points_transaction(...)`
Records a point transaction atomically.

**Key Features:**
- Validates balance sufficiency for redemptions
- Updates membership balance
- Records transaction with before/after balance
- Updates customer total_orders and total_spent

### `award_loyalty_points_on_order()`
Trigger function that automatically awards points when orders complete.

**Trigger**: `AFTER INSERT OR UPDATE OF status ON orders`

**Logic:**
1. Check if order status changed to 'completed'
2. Find active membership for customer
3. Calculate points based on order total
4. Create earn transaction
5. Check for tier upgrade

### `check_and_upgrade_tier(membership_id)`
Evaluates and upgrades customer tier.

**Logic:**
1. Get current points and spending
2. Find highest qualifying tier
3. Update membership if tier changed

### `find_or_create_customer_by_phone(phone, first_name, program_id)`
POS helper for quick customer lookup/creation.

**Returns**: UUID (customer_id)

**Logic:**
1. Normalize phone number
2. Search in phone index
3. If not found, create customer
4. Create membership if program_id provided
5. Return customer_id

---

## API Endpoints

### Loyalty Service (`loyaltyService`)

**Location**: `packages/api/src/services/loyaltyService.ts`

#### Program Management
- `getAllPrograms(filters)` - Get all loyalty programs
- `getProgramById(id)` - Get program details
- `createProgram(data)` - Create new program
- `updateProgram(id, data)` - Update program
- `deleteProgram(id)` - Delete program

#### Tier Management
- `getProgramTiers(programId)` - Get all tiers for program
- `createTier(data)` - Create new tier
- `updateTier(id, data)` - Update tier
- `deleteTier(id)` - Delete tier

#### Membership Management
- `getMemberships(filters)` - Get memberships with filters
- `getCustomerMembership(customerId, programId?)` - Get customer's active membership
- `createMembership(data)` - Create new membership

#### Points Transactions
- `getPointsTransactions(filters)` - Get transaction history
- `addPoints(request)` - Add points (earn/bonus)
- `redeemPoints(request)` - Redeem points

#### POS Operations
- `findCustomerByPhone(request)` - Find/create customer by phone
- `getPOSCustomerLookup(phone)` - Quick POS lookup
- `previewPointsEarn(orderTotal, customerId?)` - Preview points for order
- `getRedemptionOptions(customerId, orderTotal)` - Get redemption options

#### Analytics
- `getLoyaltyStats()` - Overall loyalty statistics
- `getCustomerLoyaltyStats(customerId)` - Customer-specific stats
- `getProgramPerformance(programId?)` - Program performance metrics

---

## TypeScript Types

**Location**: `packages/types/src/LoyaltyProgram.ts`

### Core Interfaces

```typescript
interface LoyaltyProgram {
  id: string;
  name: string;
  points_per_baht: number;
  minimum_points_to_redeem: number;
  redemption_rate: number;
  points_expiry_days?: number | null;
  welcome_bonus_points: number;
  enable_tiers: boolean;
  is_active: boolean;
}

interface LoyaltyTier {
  id: string;
  program_id: string;
  name: string;
  min_points_required: number;
  min_total_spent: number;
  points_multiplier: number;
  discount_percentage: number;
  tier_level: number;
}

interface CustomerLoyaltyMembership {
  id: string;
  customer_id: string;
  program_id: string;
  tier_id?: string;
  membership_number: string;
  current_points: number;
  lifetime_points: number;
  total_spent: number;
  status: "active" | "inactive" | "suspended" | "expired";
}

interface PointsTransaction {
  id: string;
  membership_id: string;
  customer_id: string;
  transaction_type: "earn" | "redeem" | "expire" | "adjustment" | "bonus" | "refund";
  points: number;
  balance_before: number;
  balance_after: number;
  order_id?: string | null;
}
```

### POS-Specific Types

```typescript
interface POSCustomerLookup {
  phone: string;
  customer?: {
    id: string;
    name: string;
    email?: string;
    phone: string;
  };
  membership?: {
    id: string;
    membership_number: string;
    current_points: number;
    tier_name?: string;
    tier_color?: string;
    points_value_baht: number;
  };
  suggested_actions?: string[];
}

interface POSPointsEarnPreview {
  order_total: number;
  points_to_earn: number;
  tier_multiplier: number;
  new_balance: number;
  points_value_baht: number;
  will_upgrade_tier: boolean;
  next_tier_name?: string;
}

interface POSPointsRedemptionOption {
  points_to_redeem: number;
  discount_amount: number;
  description: string;
  recommended: boolean;
}
```

---

## UI Components

### POS Components

#### CustomerLookup Component
**Location**: `apps/pos-frontend/components/loyalty/CustomerLookup.tsx`

**Purpose**: Phone-based customer search modal for POS

**Props:**
```typescript
interface CustomerLookupProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerSelected: (customerData: POSCustomerLookup) => void;
}
```

**Features:**
- Phone number input with validation (10 digits)
- Real-time customer search
- Auto-create new customers
- Display customer info, points, tier
- Beautiful gradient UI
- Touch-friendly for POS terminals

**Usage in POS:**
```typescript
const [isCustomerLookupOpen, onCustomerLookupOpen, onCustomerLookupClose] = useDisclosure();
const [customerData, setCustomerData] = useState<POSCustomerLookup | null>(null);

<CustomerLookup
  isOpen={isCustomerLookupOpen}
  onClose={onCustomerLookupClose}
  onCustomerSelected={(data) => setCustomerData(data)}
/>
```

#### PointsPreview Component
**Location**: `apps/pos-frontend/components/loyalty/PointsPreview.tsx`

**Purpose**: Shows points to be earned for current order

**Props:**
```typescript
interface PointsPreviewProps {
  orderTotal: number;
  customerId?: string;
  onPointsCalculated?: (points: number) => void;
}
```

**Features:**
- Real-time points calculation
- Shows tier multiplier
- Displays new balance
- Tier upgrade notification
- Points value in baht
- Auto-updates on total change

**Display:**
- Large points badge
- Tier multiplier indicator
- New balance preview
- Upgrade alert (if applicable)

---

## POS Workflow Integration

### Complete Sales Flow with Loyalty

```
1. START SALE
   ↓
2. ADD PRODUCTS TO CART
   ↓
3. [OPTIONAL] CUSTOMER LOOKUP
   - Click "📞 ค้นหาลูกค้า (สะสมแต้ม)"
   - Enter phone number
   - System finds/creates customer
   - Display: Points, Tier, Benefits
   ↓
4. POINTS PREVIEW (if customer selected)
   - Shows points to earn
   - Tier multiplier applied
   - New balance calculated
   - Upgrade notification
   ↓
5. COMPLETE PAYMENT
   - Process payment normally
   - Points auto-awarded (trigger)
   - Tier auto-upgraded (if eligible)
   ↓
6. RECEIPT
   - Shows earned points
   - New point balance
   - Tier status
```

### Customer Data Flow

```
Phone Input
    ↓
find_or_create_customer_by_phone()
    ↓
Check customer_phone_index
    ↓
Found? → Return customer_id
    ↓
Not Found? → Create customer
    ↓
Create membership (if program exists)
    ↓
Return customer_id + membership
```

### Points Awarding Flow

```
Order Created (status='pending')
    ↓
Order Completed (status='completed')
    ↓
TRIGGER: award_loyalty_points_on_order()
    ↓
Get customer membership
    ↓
calculate_points_for_purchase()
    ↓
add_points_transaction()
    - Record transaction
    - Update balance
    - Update customer stats
    ↓
check_and_upgrade_tier()
    - Check qualifications
    - Upgrade if eligible
    ↓
DONE
```

---

## Key Implementation Details

### Phone Number Normalization
```sql
-- Remove all non-numeric characters except +
p_phone := REGEXP_REPLACE(p_phone, '[^0-9+]', '', 'g');
```

### Points Calculation
```typescript
// Base calculation
const basePoints = orderTotal * program.points_per_baht;

// Apply tier multiplier
const tierMultiplier = tier?.points_multiplier || 1.0;
const pointsToEarn = Math.floor(basePoints * tierMultiplier);

// Calculate value in baht
const pointsValueBaht = Math.floor(pointsToEarn * program.redemption_rate);
```

### Tier Upgrade Logic
```sql
-- Find highest qualifying tier
SELECT id, name 
FROM loyalty_tiers
WHERE program_id = p_program_id
  AND is_active = true
  AND min_points_required <= current_points
  AND min_total_spent <= total_spent
ORDER BY tier_level DESC
LIMIT 1;
```

---

## Performance Considerations

### Database Indexes
- `idx_customer_phone_index_phone` - Fast phone lookup (CRITICAL for POS)
- `idx_customer_memberships_customer` - Quick membership retrieval
- `idx_points_transactions_customer` - Transaction history queries
- `idx_loyalty_tiers_level` - Tier lookup by level

### Query Optimization
- Phone lookup: < 50ms (indexed)
- Points calculation: < 10ms (function)
- Transaction recording: < 100ms (atomic)
- Tier upgrade: < 200ms (single query)

### Caching Strategy
- Program settings: Cache in memory (rarely change)
- Customer data: Always fetch fresh (real-time points)
- Tier thresholds: Cache in memory

---

## Testing Guide

### Database Testing
```sql
-- Test phone lookup
SELECT * FROM find_or_create_customer_by_phone('0812345678', 'Test', NULL);

-- Test points calculation  
SELECT calculate_points_for_purchase(1000, '<program_id>', '<tier_id>');

-- View customer loyalty
SELECT * FROM customer_loyalty_summary WHERE phone = '0812345678';
```

### API Testing
```typescript
// Test customer lookup
const result = await loyaltyService.findCustomerByPhone({
  phone: '0812345678',
  create_if_not_exists: true
});

// Test points preview
const preview = await loyaltyService.previewPointsEarn(1000, customerId);
```

### POS Testing Checklist
- [ ] Phone lookup with valid number
- [ ] Phone lookup with new number (auto-create)
- [ ] Points preview calculation
- [ ] Order with customer (points awarded)
- [ ] Tier upgrade on qualifying order
- [ ] Multiple orders accumulation
- [ ] Points redemption flow

---

## Migration Script

**File**: `migrate/loyalty_program_enhancement.sql`

**What it does:**
1. Creates 5 new tables
2. Creates 6 database functions
3. Creates 3 reporting views
4. Sets up indexes for performance
5. Creates triggers for automation
6. Inserts default program and tiers
7. Migrates existing customers

**To apply:**
```bash
docker exec -i supabase-db psql -U postgres -d postgres \
  < migrate/loyalty_program_enhancement.sql
```

---

## Security & Permissions

### Row Level Security (RLS)

```sql
-- All tables have RLS enabled
ALTER TABLE loyalty_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_loyalty_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_phone_index ENABLE ROW LEVEL SECURITY;
```

### Access Policies

**View Access**: All authenticated users can view active programs
**Create/Update**: Admin and Manager roles only
**POS Operations**: All authenticated users (staff, cashier)

---

## Future Enhancements

### Phase 2 (Planned)
- CMS pages for loyalty management
- Points expiry notifications
- Birthday bonus automation
- Referral program
- Special promotions

### Phase 3 (Future)
- Mobile app for customers
- QR code point collection
- Push notifications
- Digital membership card

---

## Troubleshooting

### Common Issues

**Issue**: Customer not found by phone
**Solution**: Check phone normalization, verify customer_phone_index

**Issue**: Points not awarded
**Solution**: Check order status = 'completed', verify trigger enabled

**Issue**: Tier not upgrading
**Solution**: Verify both points AND spending requirements met

**Issue**: Slow phone lookup
**Solution**: Verify index on customer_phone_index.phone exists

---

## Related Documentation

- Main Development Plan: `/COMPREHENSIVE_DEVELOPMENT_PLAN.md`
- Database Schema: `/database-design/enhanced-schema.sql`
- Migration Script: `/migrate/loyalty_program_enhancement.sql`
- API Services: `/packages/api/src/services/loyaltyService.ts`
- Type Definitions: `/packages/types/src/LoyaltyProgram.ts`

---

*This document is maintained as part of the ShopFlow context engineering system to help AI understand and work with the loyalty program implementation.*

