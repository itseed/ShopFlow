// Loyalty Program Types for ShopFlow
// Enhanced loyalty program with tier system and phone-based lookup

export interface LoyaltyProgram {
  id: string;
  name: string;
  description?: string;

  // Points Configuration (matches DB snake_case)
  points_per_baht: number; // How many points earned per baht spent
  minimum_points_to_redeem: number;
  redemption_rate: number; // How many baht per point when redeeming

  // Program Settings
  points_expiry_days?: number | null; // NULL = never expire
  welcome_bonus_points: number;
  birthday_bonus_points: number;

  // Program Status
  is_active: boolean;
  start_date: string;
  end_date?: string | null; // NULL = no end date

  // Tier System
  enable_tiers: boolean;

  // Metadata
  terms_and_conditions?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}

export interface LoyaltyTier {
  id: string;
  program_id: string;

  // Tier Information
  name: string; // e.g., "Bronze", "Silver", "Gold", "Platinum"
  description?: string;
  color_code?: string; // Hex color for UI display
  icon?: string; // Icon name or emoji

  // Requirements
  min_points_required: number;
  min_total_spent: number;

  // Benefits
  points_multiplier: number; // e.g., 1.5x points
  discount_percentage: number; // Additional discount %

  // Privileges
  benefits: string[]; // Array of benefit descriptions

  // Order
  tier_level: number; // 1=lowest, higher=better

  // Status
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerLoyaltyMembership {
  id: string;
  customer_id: string;
  program_id: string;
  tier_id?: string;

  // Membership Details
  membership_number: string; // Auto-generated membership ID
  current_points: number;
  lifetime_points: number; // Total points ever earned
  total_spent: number;

  // Status
  status: "active" | "inactive" | "suspended" | "expired";
  joined_date: string;
  last_activity_date?: string;
  expires_at?: string;

  // Metadata
  notes?: string;
  created_at: string;
  updated_at: string;

  // Populated fields
  program?: LoyaltyProgram;
  tier?: LoyaltyTier;
}

export interface PointsTransaction {
  id: string;
  membership_id: string;
  customer_id: string;

  // Transaction Details
  transaction_type:
    | "earn"
    | "redeem"
    | "expire"
    | "adjustment"
    | "bonus"
    | "refund";
  points: number; // Positive for earn, negative for redeem/expire
  balance_before: number;
  balance_after: number;

  // Reference Information
  order_id?: string | null;
  reference_type?:
    | "purchase"
    | "redemption"
    | "manual"
    | "welcome"
    | "birthday"
    | "promotion"
    | "refund"
    | null;
  reference_id?: string | null;

  // Amount Info
  amount_spent?: number | null; // For earn transactions
  amount_redeemed?: number | null; // For redeem transactions

  // Details
  description: string;
  notes?: string | null;

  // Expiry
  expires_at?: string | null; // When these points will expire
  expired_at?: string | null; // When points actually expired

  // Tracking
  processed_by?: string | null;
  branch_id?: string | null;
  created_at: string;
}

export interface CustomerPhoneIndex {
  id: string;
  phone: string;
  customer_id: string;
  is_primary: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

// ===== VIEW TYPES =====

export interface CustomerLoyaltySummary {
  customer_id: string;
  customer_code?: string;
  customer_name: string;
  phone?: string;
  email?: string;
  membership_id: string;
  membership_number: string;
  program_name: string;
  tier_name?: string;
  tier_color?: string;
  current_points: number;
  lifetime_points: number;
  total_spent: number;
  joined_date: string;
  last_activity_date?: string;
  membership_status: string;
  points_value_baht: number; // Current points value in baht
  points_to_next_tier?: number;
  next_tier_name?: string;
}

export interface PointsTransactionSummary {
  id: string;
  customer_id: string;
  customer_phone?: string;
  customer_name?: string;
  transaction_type: string;
  points: number;
  current_balance: number;
  description: string;
  amount_spent?: number;
  amount_redeemed?: number;
  order_id?: string;
  order_number?: string;
  reference_type?: string;
  expires_at?: string;
  transaction_date: string;
  branch_name?: string;
  processed_by_name?: string;
}

export interface LoyaltyProgramPerformance {
  program_id: string;
  program_name: string;
  is_active: boolean;
  total_members: number;
  active_members: number;
  total_points_issued: number;
  total_lifetime_points: number;
  total_member_spending: number;
  avg_points_per_member: number;
  avg_spending_per_member: number;
  total_transactions: number;
  total_points_earned: number;
  total_points_redeemed: number;
  total_redemption_value: number;
}

// ===== REQUEST/RESPONSE TYPES =====

export interface CreateLoyaltyProgramData {
  name: string;
  description?: string;
  points_per_baht: number;
  minimum_points_to_redeem: number;
  redemption_rate: number;
  points_expiry_days?: number;
  welcome_bonus_points?: number;
  birthday_bonus_points?: number;
  enable_tiers?: boolean;
  terms_and_conditions?: string;
}

export interface UpdateLoyaltyProgramData {
  name?: string;
  description?: string;
  points_per_baht?: number;
  minimum_points_to_redeem?: number;
  redemption_rate?: number;
  points_expiry_days?: number;
  welcome_bonus_points?: number;
  birthday_bonus_points?: number;
  is_active?: boolean;
  enable_tiers?: boolean;
  terms_and_conditions?: string;
}

export interface CreateLoyaltyTierData {
  program_id: string;
  name: string;
  description?: string;
  color_code?: string;
  icon?: string;
  min_points_required: number;
  min_total_spent: number;
  points_multiplier: number;
  discount_percentage?: number;
  benefits?: string[];
  tier_level: number;
}

export interface UpdateLoyaltyTierData {
  name?: string;
  description?: string;
  color_code?: string;
  icon?: string;
  min_points_required?: number;
  min_total_spent?: number;
  points_multiplier?: number;
  discount_percentage?: number;
  benefits?: string[];
  tier_level?: number;
  is_active?: boolean;
}

export interface CreateMembershipData {
  customer_id: string;
  program_id: string;
  initial_points?: number;
}

export interface AddPointsRequest {
  membership_id: string;
  customer_id: string;
  points: number;
  description: string;
  transaction_type: "earn" | "bonus" | "adjustment";
  order_id?: string;
  reference_type?: string;
  amount_spent?: number;
  branch_id?: string;
  processed_by?: string;
}

export interface RedeemPointsRequest {
  membership_id: string;
  customer_id: string;
  points: number;
  description: string;
  amount_redeemed: number;
  order_id?: string;
  branch_id?: string;
  processed_by?: string;
}

export interface FindCustomerByPhoneRequest {
  phone: string;
  create_if_not_exists?: boolean;
  first_name?: string;
  default_program_id?: string;
}

export interface FindCustomerByPhoneResponse {
  customer_id: string;
  customer_name?: string;
  phone: string;
  email?: string;
  is_new_customer: boolean;
  membership?: CustomerLoyaltyMembership;
  current_points: number;
  tier_name?: string;
  points_value_baht: number;
}

export interface LoyaltyFilters {
  program_id?: string;
  tier_id?: string;
  status?: "active" | "inactive" | "suspended" | "expired";
  min_points?: number;
  max_points?: number;
  min_spent?: number;
  max_spent?: number;
  search?: string;
}

export interface PointsTransactionFilters {
  customer_id?: string;
  membership_id?: string;
  transaction_type?:
    | "earn"
    | "redeem"
    | "expire"
    | "adjustment"
    | "bonus"
    | "refund";
  date_from?: string;
  date_to?: string;
  branch_id?: string;
}

// ===== STATISTICS TYPES =====

export interface LoyaltyStats {
  total_programs: number;
  active_programs: number;
  total_members: number;
  active_members: number;
  total_points_issued: number;
  total_points_redeemed: number;
  total_transactions: number;
  points_liability_baht: number; // Total value of outstanding points
}

export interface CustomerLoyaltyStats {
  customer_id: string;
  total_points_earned: number;
  total_points_redeemed: number;
  current_points: number;
  points_value_baht: number;
  tier_name?: string;
  next_tier_name?: string;
  points_to_next_tier?: number;
  total_transactions: number;
  last_transaction_date?: string;
}

// ===== POS TYPES =====

export interface POSCustomerLookup {
  phone: string;
  customer?: {
    id: string;
    first_name?: string;
    last_name?: string;
    company_name?: string;
    email?: string;
    phone: string;
    customer_type: string;
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

export interface POSPointsEarnPreview {
  order_total: number;
  points_to_earn: number;
  tier_multiplier: number;
  new_balance: number;
  points_value_baht: number;
  will_upgrade_tier: boolean;
  next_tier_name?: string;
}

export interface POSPointsRedemptionOption {
  points_to_redeem: number;
  discount_amount: number;
  description: string;
  recommended: boolean;
}
