// Customer Management Types
export interface Customer {
  id: string;
  customer_code?: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country: string;
  customer_type: CustomerType;
  status: CustomerStatus;
  credit_limit: number;
  current_balance: number;
  total_orders: number;
  total_spent: number;
  last_order_date?: string;
  loyalty_points: number;
  preferred_branch_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export type CustomerType = "individual" | "business";
export type CustomerStatus = "active" | "inactive" | "vip";

export interface CustomerFormData {
  first_name?: string;
  last_name?: string;
  company_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  customer_type: CustomerType;
  status?: CustomerStatus;
  credit_limit?: number;
  notes?: string;
  preferred_branch_id?: string;
}

export interface CustomerStats {
  total_orders: number;
  total_spent: number;
  avg_order_value: number;
  last_order_date?: string;
  loyalty_points: number;
  status: CustomerStatus;
}

export interface CustomerWithStats extends Customer {
  order_count?: number;
  last_order_amount?: number;
  avg_order_value?: number;
}

// Customer search and filter types
export interface CustomerFilters {
  customer_type?: CustomerType;
  status?: CustomerStatus;
  city?: string;
  preferred_branch_id?: string;
  min_total_spent?: number;
  max_total_spent?: number;
  min_orders?: number;
  max_orders?: number;
  search?: string; // Search in name, email, phone, company
}

export interface CustomerSummary {
  total_customers: number;
  new_customers_this_month: number;
  vip_customers: number;
  business_customers: number;
  individual_customers: number;
  total_loyalty_points: number;
  avg_order_value: number;
  top_spending_customers: TopCustomer[];
}

export interface TopCustomer {
  id: string;
  name: string;
  total_spent: number;
  order_count: number;
  customer_type: CustomerType;
  last_order_date?: string;
}

export interface CustomerMembership {
  id: string;
  customerId: string;
  membershipType: MembershipType;
  membershipNumber: string; // หมายเลขสมาชิก
  points: number; // แต้มสะสม
  totalSpent: number; // ยอดซื้อสะสม
  discountPercentage: number; // ส่วนลดที่ได้รับ (%)
  joinedAt: Date;
  expiresAt?: Date;
  status: "active" | "inactive" | "suspended";
}

export interface MembershipType {
  id: string;
  name: string; // เช่น Bronze, Silver, Gold, Platinum
  description: string;
  minSpent: number; // ยอดซื้อขั้นต่ำ
  discountPercentage: number; // ส่วนลดที่ได้รับ (%)
  pointsMultiplier: number; // ตัวคูณแต้ม
  benefits: string[]; // สิทธิประโยชน์
  color: string; // สีสำหรับแสดงผล
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerTransaction {
  id: string;
  customerId: string;
  orderId?: string;
  type: "purchase" | "return" | "points_redeem" | "points_earn";
  amount: number;
  pointsEarned?: number;
  pointsRedeemed?: number;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface CustomerFilter {
  searchTerm?: string;
  membershipType?: string;
  isActive?: boolean;
  joinedAfter?: Date;
  joinedBefore?: Date;
  minTotalSpent?: number;
  maxTotalSpent?: number;
  hasPhone?: boolean;
  hasEmail?: boolean;
  sortBy: "name" | "joinedAt" | "totalSpent" | "lastPurchase";
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
}

// Customer Activity Types
export interface CustomerActivity {
  id: string;
  customerId: string;
  type:
    | "registration"
    | "purchase"
    | "return"
    | "membership_upgrade"
    | "points_activity"
    | "profile_update";
  title: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  createdBy?: string; // userId ของผู้ที่ทำรายการ
}

export interface CustomerContact {
  id: string;
  customerId: string;
  type: "phone" | "email" | "line" | "facebook" | "other";
  value: string;
  isPrimary: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Loyalty Program Types
export interface LoyaltyProgram {
  id: string;
  name: string;
  description: string;
  pointsPerBaht: number; // แต้มต่อบาท
  minimumPointsToRedeem: number;
  redemptionRate: number; // บาทต่อแต้ม
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PointsTransaction {
  id: string;
  customerId: string;
  type: "earn" | "redeem" | "expire" | "adjustment";
  points: number;
  orderId?: string;
  description: string;
  expiresAt?: Date;
  createdAt: Date;
  createdBy?: string;
}
