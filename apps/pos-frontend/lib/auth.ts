import {
  POSSession,
  POSUser,
  POSLoginCredentials,
  POSPinCredentials,
} from "@shopflow/types";

// Mock data for development - will be replaced with actual API calls
const mockUsers: POSUser[] = [
  {
    id: "1",
    username: "admin",
    email: "admin@shopflow.com",
    role: "admin",
    firstName: "Admin",
    lastName: "User",
    pin: "1234",
    branchId: "branch-1",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    username: "manager",
    email: "manager@shopflow.com",
    role: "manager",
    firstName: "Manager",
    lastName: "User",
    pin: "5678",
    branchId: "branch-1",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "3",
    username: "cashier",
    email: "cashier@shopflow.com",
    role: "cashier",
    firstName: "Cashier",
    lastName: "User",
    pin: "9999",
    branchId: "branch-1",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

const mockBranches = [
  {
    id: "branch-1",
    name: "Main Store",
    address: "123 Main St, City, Country",
    phone: "+1 (555) 123-4567",
    email: "main@shopflow.com",
    isActive: true,
    settings: {
      currency: "USD",
      taxRate: 0.1,
      receiptFooter: "Thank you for shopping with us!",
    },
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "branch-2",
    name: "Branch Store",
    address: "456 Branch Ave, City, Country",
    phone: "+1 (555) 987-6543",
    email: "branch@shopflow.com",
    isActive: true,
    settings: {
      currency: "USD",
      taxRate: 0.08,
      receiptFooter: "Come back soon!",
    },
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
];

// Storage keys
const SESSION_KEY = "pos_session";
const LAST_USERNAME_KEY = "pos_last_username";

// Session management
export const getStoredSession = (): POSSession | null => {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;

    const session = JSON.parse(stored);

    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }

    return session;
  } catch (error) {
    console.error("Failed to parse stored session:", error);
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
};

export const setStoredSession = (session: POSSession): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.setItem(LAST_USERNAME_KEY, session.user.username);
  } catch (error) {
    console.error("Failed to store session:", error);
  }
};

export const clearStoredSession = (): void => {
  if (typeof window === "undefined") return;

  localStorage.removeItem(SESSION_KEY);
  // Keep last username for convenience
};

export const getLastUsername = (): string | null => {
  if (typeof window === "undefined") return null;

  return localStorage.getItem(LAST_USERNAME_KEY);
};

// Authentication functions
export const authenticateUser = async (
  credentials: POSLoginCredentials
): Promise<POSSession | null> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const user = mockUsers.find(
    (u) => u.username === credentials.username && u.isActive
  );

  if (!user) {
    throw new Error("Invalid username or user is inactive");
  }

  // In real app, verify password with backend
  if (credentials.password !== "password") {
    throw new Error("Invalid password");
  }

  // Find user's branch
  const branch = mockBranches.find((b) => b.id === user.branchId);
  if (!branch) {
    throw new Error("User branch not found");
  }

  // If branchId is specified, verify user has access
  if (credentials.branchId && credentials.branchId !== user.branchId) {
    throw new Error("User does not have access to this branch");
  }

  // Create session
  const session: POSSession = {
    user: {
      ...user,
      lastLogin: new Date(),
    },
    branch,
    token: `token_${user.id}_${Date.now()}`,
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
    isAuthenticated: true,
  };

  return session;
};

export const authenticateWithPin = async (
  credentials: POSPinCredentials
): Promise<POSSession | null> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const user = mockUsers.find(
    (u) =>
      u.username === credentials.username &&
      u.pin === credentials.pin &&
      u.isActive
  );

  if (!user) {
    throw new Error("Invalid PIN or user not found");
  }

  // Find user's branch
  const branch = mockBranches.find((b) => b.id === user.branchId);
  if (!branch) {
    throw new Error("User branch not found");
  }

  // Create session
  const session: POSSession = {
    user: {
      ...user,
      lastLogin: new Date(),
    },
    branch,
    token: `pin_token_${user.id}_${Date.now()}`,
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
    isAuthenticated: true,
  };

  return session;
};

// Get available branches
export const getAvailableBranches = async () => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  return mockBranches.filter((b) => b.isActive);
};

// Session validation
export const validateSession = (session: POSSession | null): boolean => {
  if (!session) return false;

  // Check if session is expired
  if (new Date(session.expiresAt) < new Date()) {
    return false;
  }

  // Check if user is still active
  if (!session.user.isActive) {
    return false;
  }

  return true;
};

// Auto-logout timer
export const startAutoLogoutTimer = (
  onLogout: () => void,
  timeoutMinutes: number = 30
): (() => void) => {
  let timeoutId: NodeJS.Timeout;

  const resetTimer = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(onLogout, timeoutMinutes * 60 * 1000);
  };

  const activityEvents = [
    "mousedown",
    "mousemove",
    "keypress",
    "scroll",
    "touchstart",
  ];

  // Start timer
  resetTimer();

  // Add event listeners
  activityEvents.forEach((event) => {
    document.addEventListener(event, resetTimer, true);
  });

  // Return cleanup function
  return () => {
    clearTimeout(timeoutId);
    activityEvents.forEach((event) => {
      document.removeEventListener(event, resetTimer, true);
    });
  };
};
