import { useQuery } from "@tanstack/react-query";
import { SalesProduct } from "@shopflow/types";
import { SalesProductSearchFilters } from "@shopflow/types";
import {
  useProducts,
  useSearchProductsForSales,
  useProductByBarcode,
} from "./useProducts";
import {
  convertProductsToSalesProducts,
  convertProductToSalesProduct,
  createMockSalesProducts,
} from "../productAdapter";

// Enhanced hooks that return SalesProduct format for POS compatibility

/**
 * Get all products as SalesProducts for POS use
 */
export const useSalesProducts = (
  filters: SalesProductSearchFilters = {},
  options: {
    limit?: number;
    fallbackToMock?: boolean;
  } = {}
) => {
  const { limit = 100, fallbackToMock = true } = options;

  // Convert SalesProductSearchFilters to API ProductFilters
  const apiFilters = {
    search: filters.searchTerm,
    categoryId: filters.category === "all" ? undefined : filters.category,
    inStock: filters.inStock,
    status: "active" as const,
  };

  const productsQuery = useProducts(apiFilters, {
    limit,
    sortBy: "name",
    sortOrder: "asc",
  });

  return useQuery({
    queryKey: ["sales-products", filters, options],
    queryFn: async () => {
      if (productsQuery.data) {
        return convertProductsToSalesProducts(productsQuery.data);
      }

      if (fallbackToMock) {
        return createMockSalesProducts();
      }

      return [];
    },
    enabled: productsQuery.isSuccess || fallbackToMock,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Search products for POS sales with SalesProduct format
 */
export const useSearchSalesProducts = (
  searchTerm: string,
  options: {
    limit?: number;
    inStockOnly?: boolean;
    fallbackToMock?: boolean;
  } = {}
) => {
  const { limit = 50, inStockOnly = true, fallbackToMock = true } = options;

  const searchQuery = useSearchProductsForSales(searchTerm, {
    limit,
    inStockOnly,
    activeOnly: true,
  });

  return useQuery({
    queryKey: ["search-sales-products", searchTerm, options],
    queryFn: async () => {
      if (searchQuery.data) {
        return convertProductsToSalesProducts(searchQuery.data);
      }

      if (fallbackToMock && searchTerm.length >= 2) {
        // Filter mock products by search term
        const mockProducts = createMockSalesProducts();
        const searchLower = searchTerm.toLowerCase();
        return mockProducts.filter(
          (product) =>
            product.name.toLowerCase().includes(searchLower) ||
            product.description.toLowerCase().includes(searchLower) ||
            product.category.toLowerCase().includes(searchLower) ||
            product.barcode?.toLowerCase().includes(searchLower)
        );
      }

      return [];
    },
    enabled:
      searchQuery.isSuccess || (fallbackToMock && searchTerm.length >= 2),
    staleTime: 1000 * 30, // 30 seconds for search results
    gcTime: 1000 * 60 * 2, // 2 minutes cache
  });
};

/**
 * Get product by barcode for POS scanning
 */
export const useSalesProductByBarcode = (
  barcode: string,
  options: {
    fallbackToMock?: boolean;
  } = {}
) => {
  const { fallbackToMock = true } = options;

  const barcodeQuery = useProductByBarcode(barcode);

  return useQuery({
    queryKey: ["sales-product-barcode", barcode, options],
    queryFn: async () => {
      if (barcodeQuery.data) {
        return convertProductToSalesProduct(barcodeQuery.data);
      }

      if (fallbackToMock && barcode.length >= 8) {
        // Search mock products by barcode
        const mockProducts = createMockSalesProducts();
        const found = mockProducts.find(
          (product) => product.barcode === barcode
        );
        if (found) {
          return found;
        }
        throw new Error("Product not found");
      }

      throw new Error("Product not found");
    },
    enabled: barcodeQuery.isSuccess || (fallbackToMock && barcode.length >= 8),
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: false, // Don't retry for barcode lookups
  });
};

/**
 * Legacy function for compatibility with existing POS code
 * @deprecated Use useSalesProducts or useSearchSalesProducts instead
 */
export const searchProducts = async (
  filters: SalesProductSearchFilters,
  sortBy: "name" | "price" | "category" = "name"
): Promise<SalesProduct[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  let results = createMockSalesProducts();

  // Filter by search term
  if (filters.searchTerm) {
    const searchLower = filters.searchTerm.toLowerCase();
    results = results.filter(
      (product) =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower) ||
        product.barcode?.toLowerCase().includes(searchLower)
    );
  }

  // Filter by category
  if (filters.category && filters.category !== "all") {
    results = results.filter(
      (product) => product.category === filters.category
    );
  }

  // Filter by barcode
  if (filters.barcode) {
    results = results.filter((product) => product.barcode === filters.barcode);
  }

  // Filter by stock status
  if (filters.inStock !== undefined) {
    if (filters.inStock) {
      results = results.filter((product) => product.stock > 0);
    } else {
      results = results.filter((product) => product.stock === 0);
    }
  }

  // Sort results
  results.sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "price":
        return a.price - b.price;
      case "category":
        return a.category.localeCompare(b.category);
      default:
        return 0;
    }
  });

  return results;
};
