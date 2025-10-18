import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import {
  customerService,
  type CustomerFilters,
  type CreateCustomerData,
  type UpdateCustomerData,
} from "@shopflow/api";
import { QUERY_KEYS } from "./queryKeys";

// Customer Hooks
export function useCustomers(filters?: CustomerFilters) {
  return useQuery({
    queryKey: [QUERY_KEYS.CUSTOMERS, filters],
    queryFn: async () => {
      const response = await customerService.getAll(filters);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch customers");
      }
      return response.data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.CUSTOMER, id],
    queryFn: async () => {
      const response = await customerService.getById(id);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch customer");
      }
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (data: CreateCustomerData) => {
      const response = await customerService.create(data);
      if (!response.success) {
        throw new Error(response.error || "Failed to create customer");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMERS] });
      toast({
        title: "สำเร็จ",
        description: "เพิ่มลูกค้าเรียบร้อยแล้ว",
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

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCustomerData;
    }) => {
      const response = await customerService.update(id, data);
      if (!response.success) {
        throw new Error(response.error || "Failed to update customer");
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMERS] });
      if (data?.id) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.CUSTOMER, data.id],
        });
      }
      toast({
        title: "สำเร็จ",
        description: "แก้ไขลูกค้าเรียบร้อยแล้ว",
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

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await customerService.delete(id);
      if (!response.success) {
        throw new Error(response.error || "Failed to delete customer");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMERS] });
      toast({
        title: "สำเร็จ",
        description: "ลบลูกค้าเรียบร้อยแล้ว",
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
