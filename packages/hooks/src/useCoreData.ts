/**
 * Core Data Hooks - Products, Categories, and Inventory
 * Consolidates: useProducts, useCategories, useInventory
 * Phase 1: Foundation Refactor
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coreService } from "@shopflow/api";
import type { Database } from "@shopflow/types";

type Product = Database["public"]["Tables"]["products"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];

/**
 * Products Hooks
 */

// Get all products with filters
export function useProducts(params?: {
  branchId?: string;
  categoryId?: string;
  search?: string;
  inStock?: boolean;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => coreService.products.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

// Get product by ID
export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => coreService.products.getById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Get product by SKU
export function useProductBySku(sku: string | undefined, branchId?: string) {
  return useQuery({
    queryKey: ["product-sku", sku, branchId],
    queryFn: () => coreService.products.getBySku(sku!, branchId),
    enabled: !!sku,
    staleTime: 5 * 60 * 1000,
  });
}

// Create product mutation
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (product: any) => coreService.products.create(product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// Update product mutation
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      coreService.products.update(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", data.id] });
    },
  });
}

// Delete product mutation
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => coreService.products.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// Get low stock products
export function useLowStockProducts(branchId?: string, threshold?: number) {
  return useQuery({
    queryKey: ["products", "low-stock", branchId, threshold],
    queryFn: () => coreService.products.getLowStock(branchId, threshold),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

// Get out of stock products
export function useOutOfStockProducts(branchId?: string) {
  return useQuery({
    queryKey: ["products", "out-of-stock", branchId],
    queryFn: () => coreService.products.getOutOfStock(branchId),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Categories Hooks
 */

// Get all categories
export function useCategories(params?: {
  branchId?: string;
  parentId?: string | null;
}) {
  return useQuery({
    queryKey: ["categories", params],
    queryFn: () => coreService.categories.getAll(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000,
  });
}

// Get category by ID
export function useCategory(id: string | undefined) {
  return useQuery({
    queryKey: ["category", id],
    queryFn: () => coreService.categories.getById(id!),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

// Get category tree
export function useCategoryTree(branchId?: string) {
  return useQuery({
    queryKey: ["categories", "tree", branchId],
    queryFn: () => coreService.categories.getTree(branchId),
    staleTime: 10 * 60 * 1000,
  });
}

// Create category mutation
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (category: any) => coreService.categories.create(category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

// Update category mutation
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) =>
      coreService.categories.update(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["category", data.id] });
    },
  });
}

// Delete category mutation
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => coreService.categories.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

/**
 * Inventory Hooks
 */

// Get stock levels
export function useStockLevels(params?: {
  branchId?: string;
  productIds?: string[];
}) {
  return useQuery({
    queryKey: ["inventory", "stock-levels", params],
    queryFn: () => coreService.inventory.getStockLevels(params),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

// Update stock mutation
export function useUpdateStock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      productId: string;
      branchId: string;
      quantity: number;
      movementType:
        | "sale"
        | "purchase"
        | "adjustment_in"
        | "adjustment_out"
        | "transfer_in"
        | "transfer_out"
        | "return";
      referenceType?: string;
      referenceId?: string;
      notes?: string;
      userId?: string;
    }) => coreService.inventory.updateStock(params),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({
        queryKey: ["product", data.movement.product_id],
      });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// Get inventory movements
export function useInventoryMovements(params?: {
  productId?: string;
  branchId?: string;
  movementType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["inventory", "movements", params],
    queryFn: () => coreService.inventory.getMovements(params),
    staleTime: 5 * 60 * 1000,
  });
}

// Get low stock view
export function useLowStockView(branchId?: string) {
  return useQuery({
    queryKey: ["inventory", "low-stock-view", branchId],
    queryFn: () => coreService.inventory.getLowStockView(branchId),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}

