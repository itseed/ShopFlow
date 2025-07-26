// Customer Management Types
export interface Customer {
  id: string;
  customerNumber: string; // รหัสลูกค้า เช่น CU001
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  dateOfBirth?: Date;
  gender?: "male" | "female" | "other";
  membership?: CustomerMembership;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
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

export interface CustomerStats {
  customerId: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastPurchaseDate?: Date;
  firstPurchaseDate?: Date;
  favoriteProducts: Array<{
    productId: string;
    productName: string;
    purchaseCount: number;
    totalAmount: number;
  }>;
  monthlySpending: Array<{
    month: string;
    amount: number;
    orders: number;
  }>;
  pointsBalance: number;
  membershipStatus?: {
    currentType: string;
    nextType?: string;
    progressToNext?: number;
  };
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

export interface CustomerFormData {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  dateOfBirth?: Date;
  gender?: "male" | "female" | "other";
  membershipType?: string;
  notes?: string;
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
