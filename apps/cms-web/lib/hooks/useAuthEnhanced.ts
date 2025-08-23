import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import { userService, branchService } from "@shopflow/api";
import { useAuth as useCMSAuth } from "../auth";

// Enhanced authentication query keys
export const AUTH_QUERY_KEYS = {
  CURRENT_USER: "current-user",
  USER_PERMISSIONS: "user-permissions",
  BRANCH_ACCESS: "branch-access",
  ACTIVE_BRANCHES: "active-branches",
  BRANCH_USERS: "branch-users",
} as const;

// Permission types
export type Permission =
  | "products.view"
  | "products.create"
  | "products.edit"
  | "products.delete"
  | "orders.view"
  | "orders.create"
  | "orders.edit"
  | "orders.cancel"
  | "inventory.view"
  | "inventory.adjust"
  | "reports.view"
  | "reports.export"
  | "users.view"
  | "users.create"
  | "users.edit"
  | "users.delete"
  | "branches.view"
  | "branches.create"
  | "branches.edit"
  | "branches.delete"
  | "settings.view"
  | "settings.edit";

// Role-based permissions mapping
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    // All permissions for admin
    "products.view",
    "products.create",
    "products.edit",
    "products.delete",
    "orders.view",
    "orders.create",
    "orders.edit",
    "orders.cancel",
    "inventory.view",
    "inventory.adjust",
    "reports.view",
    "reports.export",
    "users.view",
    "users.create",
    "users.edit",
    "users.delete",
    "branches.view",
    "branches.create",
    "branches.edit",
    "branches.delete",
    "settings.view",
    "settings.edit",
  ],
  staff: [
    // Limited permissions for staff
    "products.view",
    "products.edit",
    "orders.view",
    "orders.create",
    "orders.edit",
    "inventory.view",
    "inventory.adjust",
    "reports.view",
  ],
};

// Enhanced Current User Hook
export function useCurrentUser() {
  const { user } = useCMSAuth();

  return useQuery({
    queryKey: [AUTH_QUERY_KEYS.CURRENT_USER, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const response = await userService.getCurrentUser();
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch current user");
      }

      return response.data;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

// User Permissions Hook
export function useUserPermissions() {
  const { data: currentUser } = useCurrentUser();
  return useQuery({
    queryKey: [AUTH_QUERY_KEYS.USER_PERMISSIONS, currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];
      const role = currentUser.role;
      return ROLE_PERMISSIONS[role] || [];
    },
    enabled: !!currentUser,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Permission Check Hook
export function useHasPermission() {
  const { data: permissions = [] } = useUserPermissions();

  return (permission: Permission): boolean => {
    return permissions.includes(permission);
  };
}

// Multiple Permissions Check Hook
export function useHasPermissions() {
  const { data: permissions = [] } = useUserPermissions();
  return (requiredPermissions: Permission[], requireAll = true): boolean => {
    if (requireAll) {
      return requiredPermissions.every((permission) =>
        permissions.includes(permission)
      );
    } else {
      return requiredPermissions.some((permission) =>
        permissions.includes(permission)
      );
    }
  };
}

// Branch Access Hook
export function useBranchAccess() {
  const { data: currentUser } = useCurrentUser();
  const hasPermission = useHasPermission();
  return useQuery({
    queryKey: [AUTH_QUERY_KEYS.BRANCH_ACCESS, currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return { accessible: [], current: null };

      // Admin can access all branches
      if (currentUser.role === "admin") {
        const response = await branchService.getActiveBranches();
        if (!response.success) {
          throw new Error(response.error || "Failed to fetch branches");
        }
        return {
          accessible: response.data || [],
          current: currentUser.branch || response.data?.[0] || null,
          isAdmin: true,
        };
      }
      // Staff can only access their assigned branch
      if (currentUser.branch) {
        return {
          accessible: [currentUser.branch],
          current: currentUser.branch,
          isAdmin: false,
        };
      }
      return { accessible: [], current: null, isAdmin: false };
    },
    enabled: !!currentUser,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Active Branches Hook (for branch selection)
export function useActiveBranches() {
  return useQuery({
    queryKey: [AUTH_QUERY_KEYS.ACTIVE_BRANCHES],
    queryFn: async () => {
      const response = await branchService.getActiveBranches();
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch active branches");
      }
      return response.data || [];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Branch Users Hook (for user management per branch)
export function useBranchUsers(branchId?: string) {
  const hasPermission = useHasPermission();

  return useQuery({
    queryKey: [AUTH_QUERY_KEYS.BRANCH_USERS, branchId],
    queryFn: async () => {
      if (!branchId) return [];
      const response = await userService.getUsersByBranch(branchId);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch branch users");
      }
      return response.data || [];
    },
    enabled: !!branchId && hasPermission("users.view"),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Update User Profile Hook
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { refreshProfile } = useCMSAuth();

  return useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: string;
      data: {
        display_name?: string;
        role?: "admin" | "staff";
        branch_id?: string;
        is_active?: boolean;
      };
    }) => {
      const response = await userService.update(userId, data);
      if (!response.success) {
        throw new Error(response.error || "Failed to update user profile");
      }
      return response.data;
    },
    onSuccess: async () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: [AUTH_QUERY_KEYS.CURRENT_USER],
      });
      queryClient.invalidateQueries({
        queryKey: [AUTH_QUERY_KEYS.BRANCH_USERS],
      });
      queryClient.invalidateQueries({
        queryKey: [AUTH_QUERY_KEYS.USER_PERMISSIONS],
      });

      // Refresh the auth profile
      await refreshProfile();
      toast({
        title: "สำเร็จ",
        description: "อัพเดทข้อมูลผู้ใช้เรียบร้อยแล้ว",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });
}

// Create User Hook
export function useCreateUser() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (userData: {
      email: string;
      password: string;
      display_name: string;
      role: "admin" | "staff";
      branch_id?: string;
    }) => {
      const response = await userService.create(userData);
      if (!response.success) {
        throw new Error(response.error || "Failed to create user");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [AUTH_QUERY_KEYS.BRANCH_USERS],
      });
      toast({
        title: "สำเร็จ",
        description: "สร้างผู้ใช้ใหม่เรียบร้อยแล้ว",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });
}

// Change Password Hook
export function useChangePassword() {
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      userId,
      newPassword,
    }: {
      userId: string;
      newPassword: string;
    }) => {
      const response = await userService.changePassword(userId, newPassword);
      if (!response.success) {
        throw new Error(response.error || "Failed to change password");
      }
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "สำเร็จ",
        description: "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });
}

// Role Check Helpers
export function useIsAdmin() {
  const { data: currentUser } = useCurrentUser();
  return currentUser?.role === "admin";
}

export function useIsStaff() {
  const { data: currentUser } = useCurrentUser();
  return currentUser?.role === "staff" || currentUser?.role === "admin";
}

// Branch Context Helpers
export function useCurrentBranch() {
  const { data: branchAccess } = useBranchAccess();
  return branchAccess?.current || null;
}

export function useCanAccessBranch(branchId: string) {
  const { data: branchAccess } = useBranchAccess();

  if (!branchAccess) return false;
  if (branchAccess.isAdmin) return true;

  return branchAccess.accessible.some((branch) => branch.id === branchId);
}

// Permission-based Component Wrapper
export function usePermissionGuard() {
  const hasPermission = useHasPermission();
  const hasPermissions = useHasPermissions();

  return {
    canView: (permission: Permission) => hasPermission(permission),
    canPerform: (permissions: Permission[], requireAll = true) =>
      hasPermissions(permissions, requireAll),
    hasRole: (role: "admin" | "staff") => {
      if (role === "admin") return hasPermission("branches.view"); // Admin-only permission
      return hasPermission("products.view"); // Basic staff permission
    },
  };
}
