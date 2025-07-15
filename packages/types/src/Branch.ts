// Branch management types
export interface Branch {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BranchFormData {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active?: boolean;
}

export interface BranchWithStats extends Branch {
  user_count: number;
  order_count: number;
  total_revenue: number;
}

export interface BranchSelectOption {
  value: string;
  label: string;
  isDisabled?: boolean;
}
