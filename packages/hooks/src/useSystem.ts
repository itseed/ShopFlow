/**
 * System Hooks - Settings, Users, and Branches
 * Consolidates: useUsers, useBranches, useSettings
 * Phase 1: Foundation Refactor
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { systemService } from "@shopflow/api";

/**
 * User Hooks
 */

// Get all users
export function useUsers(params?: { branchId?: string }) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => systemService.users.getAll(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Get user by ID
export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => systemService.users.getById(id!),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

// Get user by email
export function useUserByEmail(email: string | undefined) {
  return useQuery({
    queryKey: ["user", "email", email],
    queryFn: () => systemService.users.getByEmail(email!),
    enabled: !!email,
    staleTime: 10 * 60 * 1000,
  });
}

// Update user mutation
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      systemService.users.update(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", data.id] });
    },
  });
}

// Delete user mutation
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => systemService.users.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// Update user role mutation
export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      systemService.users.updateRole(userId, role),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", data.id] });
    },
  });
}

/**
 * Branch Hooks
 */

// Get all branches
export function useBranches() {
  return useQuery({
    queryKey: ["branches"],
    queryFn: () => systemService.branches.getAll(),
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000,
  });
}

// Get branch by ID
export function useBranch(id: string | undefined) {
  return useQuery({
    queryKey: ["branch", id],
    queryFn: () => systemService.branches.getById(id!),
    enabled: !!id,
    staleTime: 15 * 60 * 1000,
  });
}

// Create branch mutation
export function useCreateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (branch: {
      name: string;
      address?: string;
      phone?: string;
      email?: string;
      is_active?: boolean;
    }) => systemService.branches.create(branch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
  });
}

// Update branch mutation
export function useUpdateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      systemService.branches.update(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      queryClient.invalidateQueries({ queryKey: ["branch", data.id] });
    },
  });
}

// Delete branch mutation
export function useDeleteBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => systemService.branches.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
    },
  });
}

// Get branch statistics
export function useBranchStats(
  branchId: string | undefined,
  params?: { startDate?: string; endDate?: string }
) {
  return useQuery({
    queryKey: ["branch", branchId, "stats", params],
    queryFn: () => systemService.branches.getStats(branchId!, params),
    enabled: !!branchId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Branch Settings Hooks
 */

// Get branch settings
export function useBranchSettings(branchId: string | undefined) {
  return useQuery({
    queryKey: ["branch-settings", branchId],
    queryFn: () => systemService.branchSettings.get(branchId!),
    enabled: !!branchId,
    staleTime: 5 * 60 * 1000,
  });
}

// Update branch settings mutation
export function useUpdateBranchSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ branchId, updates }: { branchId: string; updates: any }) =>
      systemService.branchSettings.update(branchId, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["branch-settings", data.branch_id],
      });
    },
  });
}

// Update branch settings section mutation
export function useUpdateBranchSettingsSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      branchId,
      section,
      value,
    }: {
      branchId: string;
      section:
        | "business_info"
        | "pricing_config"
        | "inventory_config"
        | "printer_config"
        | "loyalty_config"
        | "payment_config"
        | "permissions"
        | "pos_display_settings";
      value: any;
    }) => systemService.branchSettings.updateSection(branchId, section, value),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["branch-settings", data.branch_id],
      });
    },
  });
}

// Get POS settings
export function usePOSSettings(branchId: string | undefined) {
  return useQuery({
    queryKey: ["pos-settings", branchId],
    queryFn: () => systemService.branchSettings.getPOSSettings(branchId!),
    enabled: !!branchId,
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
}

// Reset branch settings mutation
export function useResetBranchSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (branchId: string) =>
      systemService.branchSettings.reset(branchId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["branch-settings", data.branch_id],
      });
    },
  });
}

/**
 * System Settings Hooks
 */

// Get system settings
export function useSystemSettings() {
  return useQuery({
    queryKey: ["system-settings"],
    queryFn: () => systemService.systemSettings.get(),
    staleTime: 15 * 60 * 1000,
  });
}

// Update system settings mutation
export function useUpdateSystemSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: any) => systemService.systemSettings.update(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
    },
  });
}

// Get maintenance mode
export function useMaintenanceMode() {
  return useQuery({
    queryKey: ["system-settings", "maintenance-mode"],
    queryFn: () => systemService.systemSettings.getMaintenanceMode(),
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Check every 2 minutes
  });
}

// Set maintenance mode mutation
export function useSetMaintenanceMode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (enabled: boolean) =>
      systemService.systemSettings.setMaintenanceMode(enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
    },
  });
}

/**
 * Audit Log Hooks
 */

// Get audit logs
export function useAuditLogs(params?: {
  userId?: string;
  entityType?: string;
  entityId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["audit-logs", params],
    queryFn: () => systemService.auditLogs.get(params),
    staleTime: 5 * 60 * 1000,
  });
}

// Create audit log mutation
export function useCreateAuditLog() {
  return useMutation({
    mutationFn: (log: {
      user_id?: string;
      action: string;
      entity_type: string;
      entity_id?: string;
      details?: any;
    }) => systemService.auditLogs.create(log),
  });
}
