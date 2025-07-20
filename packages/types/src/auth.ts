// POS Authentication Types
export interface POSUser {
  id: string;
  username: string;
  email: string;
  role: "admin" | "manager" | "cashier";
  firstName: string;
  lastName: string;
  pin?: string;
  branchId: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface POSSession {
  user: POSUser;
  branch: {
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    isActive: boolean;
    settings: {
      currency: string;
      taxRate: number;
      receiptFooter: string;
    };
    createdAt: Date;
    updatedAt: Date;
  };
  token: string;
  expiresAt: Date;
  isAuthenticated: boolean;
}

export interface POSLoginCredentials {
  username: string;
  password: string;
  branchId?: string;
}

export interface POSPinCredentials {
  pin: string;
  username: string;
}

export interface POSAuthContextType {
  session: POSSession | null;
  login: (credentials: POSLoginCredentials) => Promise<boolean>;
  loginWithPin: (credentials: POSPinCredentials) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}
