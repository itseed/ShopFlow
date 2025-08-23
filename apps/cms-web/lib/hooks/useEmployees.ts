import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  userService,
  UserFilters,
  CreateUserData,
  UpdateUserData,
} from "@shopflow/api";
import { UserProfile } from "@shopflow/api/dist/services/userService";

// Hook for getting all employees
export function useEmployees(filters: UserFilters = {}) {
  const {
    data: employees = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["employees", filters],
    queryFn: async () => {
      const result = await userService.getAll(filters);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });

  return {
    employees,
    loading,
    error: error?.message || null,
    refetch,
  };
}

// Hook for getting employee count
export function useEmployeeCount(filters: UserFilters = {}) {
  const {
    data: count = 0,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["employees", "count", filters],
    queryFn: async () => {
      const result = await userService.count(filters);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });

  return {
    count,
    loading,
    error: error?.message || null,
  };
}

// Hook for getting employee by ID
export function useEmployee(id: string) {
  const {
    data: employee,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["employees", id],
    queryFn: async () => {
      const result = await userService.getById(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!id,
  });

  return {
    employee,
    loading,
    error: error?.message || null,
    refetch,
  };
}

// Hook for creating employees
export function useCreateEmployee() {
  const queryClient = useQueryClient();

  const { mutateAsync: createEmployee, isPending: isCreating } = useMutation({
    mutationFn: async (employeeData: CreateUserData) => {
      const result = await userService.create(employeeData);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate and refetch employees queries
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });

  return {
    createEmployee,
    isCreating,
  };
}

// Hook for updating employees
export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  const { mutateAsync: updateEmployee, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserData }) => {
      const result = await userService.update(id, data);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch employees queries
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      // Update the specific employee in cache
      queryClient.setQueryData(["employees", data.id], data);
    },
  });

  return {
    updateEmployee,
    isUpdating,
  };
}

// Hook for deleting/deactivating employees
export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  const { mutateAsync: deleteEmployee, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      const result = await userService.delete(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    onSuccess: () => {
      // Invalidate and refetch employees queries
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });

  return {
    deleteEmployee,
    isDeleting,
  };
}

// Hook for getting employees by branch
export function useEmployeesByBranch(branchId: string) {
  const {
    data: employees = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["employees", "branch", branchId],
    queryFn: async () => {
      const result = await userService.getUsersByBranch(branchId);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
    enabled: !!branchId,
  });

  return {
    employees,
    loading,
    error: error?.message || null,
    refetch,
  };
}

// Hook for getting active staff
export function useActiveStaff() {
  const {
    data: staff = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["employees", "active"],
    queryFn: async () => {
      const result = await userService.getActiveStaff();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });

  return {
    staff,
    loading,
    error: error?.message || null,
    refetch,
  };
}

// Hook for employee statistics
export function useEmployeeStats() {
  const {
    data: stats,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["employees", "stats"],
    queryFn: async () => {
      // Get total count
      const totalResult = await userService.count();
      if (!totalResult.success) {
        throw new Error(totalResult.error);
      }

      // Get active count
      const activeResult = await userService.count({ isActive: true });
      if (!activeResult.success) {
        throw new Error(activeResult.error);
      }

      // Get inactive count
      const inactiveResult = await userService.count({ isActive: false });
      if (!inactiveResult.success) {
        throw new Error(inactiveResult.error);
      }

      // Get admin count
      const adminResult = await userService.count({ role: "admin" });
      if (!adminResult.success) {
        throw new Error(adminResult.error);
      }

      // Get staff count
      const staffResult = await userService.count({ role: "staff" });
      if (!staffResult.success) {
        throw new Error(staffResult.error);
      }

      return {
        total: totalResult.data,
        active: activeResult.data,
        inactive: inactiveResult.data,
        admin: adminResult.data,
        staff: staffResult.data,
      };
    },
  });

  return {
    stats: stats || { total: 0, active: 0, inactive: 0, admin: 0, staff: 0 },
    loading,
    error: error?.message || null,
  };
}

// Hook for password management
export function usePasswordManagement() {
  const { mutateAsync: changePassword, isPending: isChangingPassword } =
    useMutation({
      mutationFn: async ({
        userId,
        newPassword,
      }: {
        userId: string;
        newPassword: string;
      }) => {
        const result = await userService.changePassword(userId, newPassword);
        if (!result.success) {
          throw new Error(result.error);
        }
        return result.data;
      },
    });

  const { mutateAsync: resetPassword, isPending: isResettingPassword } =
    useMutation({
      mutationFn: async (email: string) => {
        const result = await userService.resetPassword(email);
        if (!result.success) {
          throw new Error(result.error);
        }
        return result.data;
      },
    });

  return {
    changePassword,
    isChangingPassword,
    resetPassword,
    isResettingPassword,
  };
}
