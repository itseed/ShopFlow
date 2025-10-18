/**
 * Auth Hooks - Authentication and Permissions
 * Consolidates: useAuth, useUser, usePermissions
 * Phase 1: Foundation Refactor
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@shopflow/api";
import { systemService } from "@shopflow/api";

/**
 * Authentication Hooks
 */

// Get current user session
export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Get current user
export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Get current user profile
export function useCurrentUserProfile() {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: ["current-user-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      return await systemService.users.getById(user.id);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
}

// Sign in mutation
export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    },
  });
}

// Sign out mutation
export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.clear(); // Clear all queries on sign out
    },
  });
}

// Sign up mutation
export function useSignUp() {
  return useMutation({
    mutationFn: async ({
      email,
      password,
      metadata,
    }: {
      email: string;
      password: string;
      metadata?: any;
    }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      if (error) throw error;
      return data;
    },
  });
}

// Reset password mutation
export function useResetPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return data;
    },
  });
}

// Update password mutation
export function useUpdatePassword() {
  return useMutation({
    mutationFn: async (newPassword: string) => {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      return data;
    },
  });
}

/**
 * Permission Hooks
 */

// Get user role
export function useUserRole(userId: string | undefined) {
  return useQuery({
    queryKey: ["user-role", userId],
    queryFn: () => systemService.users.getRole(userId!),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
  });
}

// Get current user role
export function useCurrentUserRole() {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: ["current-user-role", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      return await systemService.users.getRole(user.id);
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
  });
}

// Check if user has permission
export function useHasPermission(permission: string) {
  const { data: role } = useCurrentUserRole();

  return useQuery({
    queryKey: ["has-permission", permission, role],
    queryFn: async () => {
      if (!role) return false;

      // Admin has all permissions
      if (role === "admin") return true;

      // Define role permissions
      const rolePermissions: Record<string, string[]> = {
        admin: ["*"], // All permissions
        manager: [
          "view_reports",
          "manage_products",
          "manage_orders",
          "manage_customers",
          "manage_inventory",
          "view_settings",
        ],
        staff: [
          "create_order",
          "view_products",
          "view_customers",
          "view_inventory",
        ],
        cashier: ["create_order", "view_products"],
      };

      const permissions = rolePermissions[role] || [];
      return permissions.includes("*") || permissions.includes(permission);
    },
    enabled: !!role,
    staleTime: 10 * 60 * 1000,
  });
}

// Check if user has any of the given roles
export function useHasRole(roles: string[]) {
  const { data: userRole } = useCurrentUserRole();

  return useQuery({
    queryKey: ["has-role", roles, userRole],
    queryFn: async () => {
      if (!userRole) return false;
      return roles.includes(userRole);
    },
    enabled: !!userRole,
    staleTime: 10 * 60 * 1000,
  });
}

// Check if user is admin
export function useIsAdmin() {
  const { data: role } = useCurrentUserRole();
  return role === "admin";
}

// Check if user is manager
export function useIsManager() {
  const { data: role } = useCurrentUserRole();
  return role === "manager" || role === "admin";
}

// Check if user is authenticated
export function useIsAuthenticated() {
  const { data: session } = useSession();
  return !!session;
}

