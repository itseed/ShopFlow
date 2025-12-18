import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import { categoryService } from "@shopflow/api/services/categoryService";
import type {
  CategoryFilters,
  CreateCategoryData,
  UpdateCategoryData,
} from "@shopflow/api/services/categoryService";
import { QUERY_KEYS } from "./queryKeys";

// Category Hooks with real API and fallback
export function useCategories(filters?: CategoryFilters) {
  return useQuery({
    queryKey: [QUERY_KEYS.CATEGORIES, filters],
    queryFn: async () => {
      try {
        // Try to fetch real data first
        const response = await categoryService.getAll(filters);
        if (response.success && response.data && response.data.length > 0) {
          console.log("📂 Using real categories data");
          return response.data;
        }

        // If no real data, return fallback data
        console.log(
          "📂 Using fallback categories data - no real data available"
        );
        return [
          {
            id: "1",
            name: "เครื่องดื่ม",
            description: "เครื่องดื่มทุกประเภท เช่น กาแฟ ชา น้ำผลไม้",
            display_order: 1,
            is_active: true,
            created_at: "2025-10-18T10:00:00Z",
            updated_at: "2025-10-18T10:00:00Z",
          },
          {
            id: "2",
            name: "อาหาร",
            description: "อาหารคาว อาหารหวาน ขนมต่างๆ",
            display_order: 2,
            is_active: true,
            created_at: "2025-10-18T10:00:00Z",
            updated_at: "2025-10-18T10:00:00Z",
          },
          {
            id: "3",
            name: "ขนมปัง",
            description: "ขนมปังสด ขนมปังโฮลวีท ขนมปังหวาน",
            display_order: 3,
            is_active: true,
            created_at: "2025-10-18T10:00:00Z",
            updated_at: "2025-10-18T10:00:00Z",
          },
        ];
      } catch (error) {
        console.warn("📂 Categories API failed, using fallback data:", error);
        // Return fallback data on error
        return [
          {
            id: "1",
            name: "เครื่องดื่ม",
            description: "เครื่องดื่มทุกประเภท เช่น กาแฟ ชา น้ำผลไม้",
            display_order: 1,
            is_active: true,
            created_at: "2025-10-18T10:00:00Z",
            updated_at: "2025-10-18T10:00:00Z",
          },
          {
            id: "2",
            name: "อาหาร",
            description: "อาหารคาว อาหารหวาน ขนมต่างๆ",
            display_order: 2,
            is_active: true,
            created_at: "2025-10-18T10:00:00Z",
            updated_at: "2025-10-18T10:00:00Z",
          },
          {
            id: "3",
            name: "ขนมปัง",
            description: "ขนมปังสด ขนมปังโฮลวีท ขนมปังหวาน",
            display_order: 3,
            is_active: true,
            created_at: "2025-10-18T10:00:00Z",
            updated_at: "2025-10-18T10:00:00Z",
          },
        ];
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1, // Single retry
    retryDelay: 2000, // 2 second delay
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnMount: false, // Disable refetch on mount if data exists
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.CATEGORY, id],
    queryFn: async () => {
      const response = await categoryService.getById(id);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch category");
      }
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (data: CreateCategoryData) => {
      const response = await categoryService.create(data);
      if (!response.success) {
        throw new Error(response.error || "Failed to create category");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES] });
      toast({
        title: "สำเร็จ",
        description: "เพิ่มหมวดหมู่เรียบร้อยแล้ว",
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

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCategoryData;
    }) => {
      const response = await categoryService.update(id, data);
      if (!response.success) {
        throw new Error(response.error || "Failed to update category");
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES] });
      if (data?.id) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.CATEGORY, data.id],
        });
      }
      toast({
        title: "สำเร็จ",
        description: "แก้ไขหมวดหมู่เรียบร้อยแล้ว",
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

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await categoryService.delete(id);
      if (!response.success) {
        throw new Error(response.error || "Failed to delete category");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES] });
      toast({
        title: "สำเร็จ",
        description: "ลบหมวดหมู่เรียบร้อยแล้ว",
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
