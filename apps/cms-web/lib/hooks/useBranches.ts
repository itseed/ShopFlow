import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import { branchService } from "@shopflow/api";
import { Branch } from "@shopflow/types";

// Enhanced Branch interface to match the database schema
export interface EnhancedBranch extends Branch {
  manager_name?: string;
  business_hours?: any;
  settings?: any;
}

// Branch creation/update data
export interface BranchFormData {
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
  manager_name?: string;
  is_active?: boolean;
  business_hours?: any;
}

export function useBranches() {
  const {
    data: branches = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const result = await branchService.getAll();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch branches");
      }
      return result.data;
    },
  });

  return {
    branches,
    loading,
    error,
    refetch,
  };
}

export function useBranchById(id: string) {
  return useQuery({
    queryKey: ["branch", id],
    queryFn: async () => {
      const result = await branchService.getById(id);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch branch");
      }
      return result.data;
    },
    enabled: !!id,
  });
}

export function useBranchMutations() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const createMutation = useMutation({
    mutationFn: async (data: BranchFormData) => {
      const result = await branchService.create(data);
      if (!result.success) {
        throw new Error(result.error || "Failed to create branch");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast({
        title: "เพิ่มสาขาใหม่สำเร็จ",
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

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<BranchFormData>;
    }) => {
      const result = await branchService.update(id, data);
      if (!result.success) {
        throw new Error(result.error || "Failed to update branch");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast({
        title: "แก้ไขสาขาสำเร็จ",
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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await branchService.delete(id);
      if (!result.success) {
        throw new Error(result.error || "Failed to delete branch");
      }
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast({
        title: "ปิดใช้งานสาขาสำเร็จ",
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

  return {
    createBranch: createMutation.mutate,
    updateBranch: updateMutation.mutate,
    deleteBranch: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useBranchStats() {
  return useQuery({
    queryKey: ["branch-stats"],
    queryFn: async () => {
      const result = await branchService.getStats();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch branch stats");
      }
      return result.data;
    },
  });
}

export function useBranchSearch(searchTerm: string) {
  const [filteredBranches, setFilteredBranches] = useState<Branch[]>([]);
  const { branches, loading } = useBranches();

  useEffect(() => {
    if (!searchTerm) {
      setFilteredBranches(branches || []);
      return;
    }

    const filtered = (branches || []).filter(
      (branch) =>
        branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredBranches(filtered);
  }, [branches, searchTerm]);

  return {
    branches: filteredBranches,
    loading,
  };
}
