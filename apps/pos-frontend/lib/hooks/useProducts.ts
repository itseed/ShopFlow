import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { productService } from "@shopflow/api/services/productService";
import type {
  ProductFilters,
  CreateProductData,
  UpdateProductData,
  StockUpdateData,
} from "@shopflow/api/services/productService";
import type { ApiResponse } from "@shopflow/api";
import { Product } from "@shopflow/types";

// Keys for React Query cache
export const QUERY_KEYS = {
  PRODUCTS: "products",
  PRODUCT: "product",
} as const;

interface ProductsPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: "name" | "price" | "created_at" | "updated_at";
  sortOrder?: "asc" | "desc";
}

// Get all products with filtering and pagination
export const useProducts = (
  filters: ProductFilters = {},
  pagination: ProductsPaginationOptions = {}
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, filters, pagination],
    queryFn: async () => {
      const response = await productService.getAll({
        ...filters,
        ...pagination,
      });

      return response.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (was cacheTime)
  });
};

// Get single product by ID
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCT, id],
    queryFn: async () => {
      const response = await productService.getById(id);
      if (!response.success) {
        throw new Error(response.error || "Product not found");
      }
      if (!response.data) {
        throw new Error("Product not found");
      }
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Create new product
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProductData) => {
      const response = await productService.create(data);
      if (!response.success) {
        throw new Error(response.error || "Failed to create product");
      }
      return response.data;
    },
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] });
      toast.success("Product created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create product");
    },
  });
};

// Update product
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateProductData;
    }) => {
      const response = await productService.update(id, data);
      if (!response.success) {
        throw new Error(response.error || "Failed to update product");
      }
      return response.data;
    },
    onSuccess: (product, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCT, id] });
      toast.success("Product updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update product");
    },
  });
};

// Delete product
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await productService.delete(id);
      if (!response.success) {
        throw new Error(response.error || "Failed to delete product");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] });
      toast.success("Product deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete product");
    },
  });
};

// Update product stock
export const useUpdateProductStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      stockData,
    }: {
      id: string;
      stockData: StockUpdateData;
    }) => {
      // Use updateStock method
      const response = await productService.updateStock(id, stockData);
      if (!response.success) {
        throw new Error(response.error || "Failed to update stock");
      }
      return response.data!;
    },
    onSuccess: (product, { id }) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCTS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PRODUCT, id] });
      toast.success("Stock updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update stock");
    },
  });
};

// Search products specifically for POS (optimized for sales)
export const useSearchProductsForSales = (
  searchTerm: string,
  options: {
    limit?: number;
    inStockOnly?: boolean;
    activeOnly?: boolean;
  } = {}
) => {
  const {
    limit = 50,
    inStockOnly = true,
    activeOnly = false, // Will use status filter instead
  } = options;

  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCTS, "search", searchTerm, options],
    queryFn: async () => {
      const response = await productService.getAll({
        search: searchTerm,
        inStock: inStockOnly,
        status: activeOnly ? "active" : undefined,
        limit,
        sortBy: "name",
        sortOrder: "asc",
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to search products");
      }

      return response.data;
    },
    enabled: searchTerm.length >= 2, // Only search after 2+ characters
    staleTime: 1000 * 30, // 30 seconds for search results
    gcTime: 1000 * 60 * 2, // 2 minutes cache
  });
};

// Get product by barcode for quick POS scanning
export const useProductByBarcode = (barcode: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PRODUCT, "barcode", barcode],
    queryFn: async () => {
      const response = await productService.getAll({
        search: barcode, // Search by barcode in search field
        limit: 1,
        status: "active",
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to find product");
      }

      if (!response.data?.length) {
        throw new Error("Product not found");
      }

      return response.data[0];
    },
    enabled: !!barcode && barcode.length >= 8, // Valid barcode length
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: false, // Don't retry for barcode lookups
  });
};
