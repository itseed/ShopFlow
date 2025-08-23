import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import {
  productService,
  orderService,
  reportService,
  branchService,
  userService,
  type ProductFilters,
  type CreateOrderData,
  type OrderFilters,
  type ReportFilters,
} from "@shopflow/api";
import {
  SalesProduct,
  SalesCartItem,
  Order,
  Product,
  ProductStatus,
} from "@shopflow/types";

// POS-specific query keys
export const POS_QUERY_KEYS = {
  POS_PRODUCTS: "pos-products",
  POS_INVENTORY: "pos-inventory",
  POS_ORDERS: "pos-orders",
  POS_DASHBOARD: "pos-dashboard",
  POS_BRANCH_STATS: "pos-branch-stats",
  LOW_STOCK: "pos-low-stock",
  RECENT_SALES: "pos-recent-sales",
  SALES_SUMMARY: "pos-sales-summary",
} as const;

// Convert Product to SalesProduct format for POS compatibility
function convertToSalesProduct(product: any): SalesProduct {
  return {
    id: product.id,
    name: product.name,
    description: product.description || "",
    price: product.price,
    discountPrice: product.discount_price || undefined,
    cost: product.cost || product.price * 0.7, // Estimate if not available
    stock: product.stock,
    lowStockThreshold: product.min_stock || 5,
    category: product.category?.name || "อื่นๆ",
    categoryId: product.category_id,
    barcode: product.sku, // Use SKU as barcode
    images: product.images || [],
    isActive: product.status === "active",
    unit: "ชิ้น", // Default unit
    tax: 0, // Default tax
    tags: [],
    variants: [], // TODO: Handle variants
    rating: 4.5, // Default rating
    reviewCount: 0,
    isFavorite: false,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
  };
}

// Enhanced Products Hook for POS
export function usePOSProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: [POS_QUERY_KEYS.POS_PRODUCTS, filters],
    queryFn: async () => {
      const response = await productService.getAll({
        ...filters,
        status: "active", // Only show active products in POS
        limit: 200, // Higher limit for POS
        sortBy: "name",
        sortOrder: "asc",
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch products for POS");
      }

      // Convert to SalesProduct format
      return (response.data || []).map(convertToSalesProduct);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - shorter for POS real-time needs
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });
}

// Search Products Hook for POS
export function usePOSProductSearch(searchTerm: string) {
  return useQuery({
    queryKey: [POS_QUERY_KEYS.POS_PRODUCTS, "search", searchTerm],
    queryFn: async () => {
      if (searchTerm.length < 2) return [];

      const response = await productService.getAll({
        search: searchTerm,
        status: "active",
        inStock: true,
        limit: 50,
        sortBy: "name",
        sortOrder: "asc",
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to search products");
      }

      return (response.data || []).map(convertToSalesProduct);
    },
    enabled: searchTerm.length >= 2,
    staleTime: 30 * 1000, // 30 seconds for search results
  });
}

// Barcode Scanner Hook for POS
export function usePOSBarcodeSearch(barcode: string) {
  return useQuery({
    queryKey: [POS_QUERY_KEYS.POS_PRODUCTS, "barcode", barcode],
    queryFn: async () => {
      if (barcode.length < 6) return null;

      // Search by SKU (barcode) first
      const response = await productService.getAll({
        search: barcode,
        status: "active",
        limit: 1,
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to search by barcode");
      }

      const products = response.data || [];
      if (products.length === 0) {
        throw new Error("Product not found");
      }

      return convertToSalesProduct(products[0]);
    },
    enabled: barcode.length >= 6,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Don't retry barcode searches
  });
}

// Inventory Management Hook for POS
export function usePOSInventory(
  filters: { categoryId?: string; search?: string; status?: string } = {}
) {
  return useQuery({
    queryKey: [POS_QUERY_KEYS.POS_INVENTORY, filters],
    queryFn: async () => {
      const response = await reportService.getInventoryReport({
        categoryId: filters.categoryId,
        searchTerm: filters.search,
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch inventory");
      }

      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Auto-refresh every 10 minutes
  });
}

// Low Stock Alert Hook for POS
export function usePOSLowStock() {
  return useQuery({
    queryKey: [POS_QUERY_KEYS.LOW_STOCK],
    queryFn: async () => {
      const response = await productService.getLowStock();

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch low stock items");
      }

      return (response.data || []).map(convertToSalesProduct);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });
}

// Create Order Hook for POS
export function usePOSCreateOrder() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (orderData: CreateOrderData) => {
      const response = await orderService.create(orderData);

      if (!response.success) {
        throw new Error(response.error || "Failed to create order");
      }

      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [POS_QUERY_KEYS.POS_ORDERS] });
      queryClient.invalidateQueries({
        queryKey: [POS_QUERY_KEYS.POS_PRODUCTS],
      });
      queryClient.invalidateQueries({
        queryKey: [POS_QUERY_KEYS.POS_DASHBOARD],
      });
      queryClient.invalidateQueries({
        queryKey: [POS_QUERY_KEYS.RECENT_SALES],
      });

      toast({
        title: "สำเร็จ",
        description: "บันทึกการขายเรียบร้อยแล้ว",
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

// Recent Orders Hook for POS
export function usePOSRecentOrders(limit: number = 10) {
  return useQuery({
    queryKey: [POS_QUERY_KEYS.POS_ORDERS, "recent", limit],
    queryFn: async () => {
      const response = await orderService.getAll({
        limit,
        sortBy: "created_at",
        sortOrder: "desc",
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch recent orders");
      }

      return response.data || [];
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Auto-refresh every 2 minutes
  });
}

// Sales Summary Hook for POS Dashboard
export function usePOSSalesSummary(branchId?: string) {
  return useQuery({
    queryKey: [POS_QUERY_KEYS.SALES_SUMMARY, branchId],
    queryFn: async () => {
      const response = await reportService.getDashboardSummary(branchId);

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch sales summary");
      }

      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
  });
}

// Today's Sales Report for POS
export function usePOSTodaySales() {
  return useQuery({
    queryKey: [POS_QUERY_KEYS.POS_DASHBOARD, "today"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const startDate = today + "T00:00:00.000Z";
      const endDate = today + "T23:59:59.999Z";

      const response = await reportService.getSalesReport({
        startDate,
        endDate,
        groupBy: "day",
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch today's sales");
      }

      const salesData = response.data || [];
      const todayData = salesData[0] || {
        date: today,
        totalSales: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        topPaymentMethod: "cash",
      };

      return todayData;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Auto-refresh every 2 minutes
  });
}

// Update Product Stock Hook (for inventory adjustments)
export function usePOSUpdateStock() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      productId,
      adjustment,
      reason,
    }: {
      productId: string;
      adjustment: number;
      reason: string;
    }) => {
      const response = await productService.updateStock(productId, {
        quantity: adjustment,
        type: adjustment > 0 ? "add" : "subtract",
        reason,
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to update stock");
      }

      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: [POS_QUERY_KEYS.POS_PRODUCTS],
      });
      queryClient.invalidateQueries({
        queryKey: [POS_QUERY_KEYS.POS_INVENTORY],
      });
      queryClient.invalidateQueries({ queryKey: [POS_QUERY_KEYS.LOW_STOCK] });

      toast({
        title: "สำเร็จ",
        description: "ปรับปรุงสต็อกเรียบร้อยแล้ว",
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

// POS Order History with Pagination
export function usePOSOrderHistory(
  filters: OrderFilters = {},
  options: { page?: number; limit?: number } = {}
) {
  const { page = 0, limit = 20 } = options;

  return useQuery({
    queryKey: [POS_QUERY_KEYS.POS_ORDERS, "history", filters, page, limit],
    queryFn: async () => {
      const response = await orderService.getAll({
        ...filters,
        page,
        limit,
        sortBy: "created_at",
        sortOrder: "desc",
      });

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch order history");
      }

      return response.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get Single Order Details for POS
export function usePOSOrderDetails(orderId: string) {
  return useQuery({
    queryKey: [POS_QUERY_KEYS.POS_ORDERS, "details", orderId],
    queryFn: async () => {
      const response = await orderService.getById(orderId);

      if (!response.success) {
        throw new Error(response.error || "Failed to fetch order details");
      }

      return response.data;
    },
    enabled: !!orderId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Convert Cart Items to Order Items for API
export function convertCartToOrderItems(cartItems: SalesCartItem[]) {
  return cartItems.map((item) => ({
    product_id: item.product.id,
    product_name: item.product.name,
    quantity: item.quantity,
    unit_price: item.product.price,
    total_price: item.total,
  }));
}

// Helper function to create order from cart
export function createOrderFromCart(
  cartItems: SalesCartItem[],
  paymentMethod: string = "cash",
  customerInfo?: { name?: string; phone?: string }
): CreateOrderData {
  const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.07; // 7% VAT
  const total = subtotal + tax;

  return {
    customer_name: customerInfo?.name,
    customer_phone: customerInfo?.phone,
    subtotal,
    tax,
    total,
    payment_method: paymentMethod as any,
    status: "completed",
    items: convertCartToOrderItems(cartItems),
  };
}
