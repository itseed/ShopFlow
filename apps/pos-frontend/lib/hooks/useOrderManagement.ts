import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import {
  orderService,
  productService,
  type CreateOrderData,
  type Order,
} from "@shopflow/api";
import type { CreateOrderItem } from "@shopflow/types";

// POS-specific types
export interface POSOrderItem {
  productId?: string;
  productName: string;
  sku?: string;
  price: number;
  quantity: number;
  total: number;
  discount?: number;
}

export interface POSOrder {
  items: POSOrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  customer?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  paymentMethod: "cash" | "card" | "bank_transfer" | "e_wallet";
  notes?: string;
}

export interface PaymentResult {
  success: boolean;
  method: "cash" | "card" | "bank_transfer" | "e_wallet";
  amount: number;
  change?: number;
  transactionId?: string;
  customer?: {
    name?: string;
    phone?: string;
  };
}

// Query keys
export const POS_ORDER_QUERY_KEYS = {
  RECENT: "pos-recent-orders",
  TODAY_SALES: "pos-today-sales",
  DAILY_STATS: "pos-daily-stats",
} as const;

// Convert cart items to order items
export function createOrderFromCart(
  cartItems: POSOrderItem[],
  paymentMethod: string,
  customer?: { name?: string; phone?: string }
): CreateOrderData {
  const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.07; // 7% VAT
  const total = subtotal + tax;

  const items: CreateOrderItem[] = cartItems.map((item) => ({
    product_id: item.productId || "",
    quantity: item.quantity,
    unit_price: item.price,
  }));

  return {
    customer_name: customer?.name,
    customer_phone: customer?.phone,
    payment_method: paymentMethod as any,
    items,
  };
}

// Get recent orders for POS
export function usePOSRecentOrders(limit = 20) {
  return useQuery({
    queryKey: [POS_ORDER_QUERY_KEYS.RECENT, limit],
    queryFn: async () => {
      const response = await orderService.getAll({
        limit,
      });

      return (response.data || []).slice(0, limit);
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes
  });
}

// Get single order by ID
export function useOrder(id: string) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      return await orderService.getById(id);
    },
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Get orders with filters
export function useOrders(filters?: {
  search?: string;
  status?: string;
  paymentMethod?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  return useQuery({
    queryKey: ["orders", filters],
    queryFn: async () => {
      const response = await orderService.getAll({
        status: filters?.status,
        startDate: filters?.dateFrom,
        endDate: filters?.dateTo,
        limit: 100,
      });
      // Filter by search term if provided
      let orders = response.data || [];
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        const searchTerm = filters.search;
        orders = orders.filter((order: any) => {
          const orderNumber = (order.order_number || "").toLowerCase();
          const customerName = (order.customer_name || "").toLowerCase();
          const customerPhone = order.customer_phone || "";
          return orderNumber.includes(searchLower) ||
            customerName.includes(searchLower) ||
            customerPhone.includes(searchTerm);
        });
      }
      return orders;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// Get order statistics
export function useOrderStats() {
  return useQuery({
    queryKey: ["orderStats"],
    queryFn: async () => {
      return await orderService.getStats();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get today's sales summary
export function useTodaySales() {
  return useQuery({
    queryKey: [POS_ORDER_QUERY_KEYS.TODAY_SALES],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const response = await orderService.getAll({
        startDate: today,
        endDate: today,
        status: "completed",
      });

      const orders = response.data || [];
      const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
      const totalOrders = orders.length;
      const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

      // Payment method breakdown
      const paymentMethods = orders.reduce((acc, order) => {
        acc[order.payment_method] = (acc[order.payment_method] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalSales,
        totalOrders,
        averageOrderValue,
        paymentMethods,
        orders,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
}

// Get daily statistics
export function useDailyStats() {
  return useQuery({
    queryKey: [POS_ORDER_QUERY_KEYS.DAILY_STATS],
    queryFn: async () => {
      const stats = await orderService.getStats();
      return stats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
  });
}

// Create order from POS
export function usePOSCreateOrder() {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (orderData: CreateOrderData) => {
      // Validate stock before creating order
      for (const item of orderData.items) {
        if (item.product_id) {
          const productResponse = await productService.getById(item.product_id) as any;
          if (!productResponse?.success || !productResponse?.data) {
            throw new Error(`ไม่พบสินค้า ${item.product_id}`);
          }
          const product = productResponse.data;
          if ((product.stock || 0) < item.quantity) {
            throw new Error(
              `ไม่มีสินค้า ${product.name} เพียงพอ (คงเหลือ ${product.stock || 0} ชิ้น)`
            );
          }
        }
      }

      // Convert CreateOrderData to orderService.create format
      // Calculate totals
      const subtotal = orderData.items.reduce((sum, item) => sum + ((item.unit_price || 0) * item.quantity), 0);
      const tax = subtotal * 0.07; // 7% VAT
      const total = subtotal + tax;

      const response = await orderService.create({
        order: {
          customer_name: orderData.customer_name,
          customer_phone: orderData.customer_phone,
          payment_method: orderData.payment_method,
          branch_id: orderData.branch_id,
          subtotal,
          tax,
          total,
          status: "completed",
        } as any,
        items: orderData.items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price || 0,
          subtotal: (item.unit_price || 0) * item.quantity,
        })),
      });

      return response.order;
    },
    onSuccess: async (order) => {
      // Update stock for sold items
      // Note: order.items may not be populated, need to fetch order with items
      const orderWithItems = await orderService.getById(order.id);
      // orderService.getById returns Order with order_items, but TypeScript doesn't know this
      const items = (orderWithItems as any)?.order_items || [];
      for (const item of items) {
        if (item.product_id) {
          try {
            const productResponse = await productService.getById(item.product_id) as any;
            if (productResponse?.success && productResponse?.data) {
              const product = productResponse.data;
              const newStock = Math.max(0, (product.stock || 0) - item.quantity);
              await productService.update(item.product_id, {
                stock: newStock,
              } as any);
            }
          } catch (error) {
            console.error(
              `Failed to update stock for product ${item.product_id}:`,
              error
            );
          }
        }
      }

      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: [POS_ORDER_QUERY_KEYS.RECENT],
      });
      queryClient.invalidateQueries({
        queryKey: [POS_ORDER_QUERY_KEYS.TODAY_SALES],
      });
      queryClient.invalidateQueries({
        queryKey: [POS_ORDER_QUERY_KEYS.DAILY_STATS],
      });
      queryClient.invalidateQueries({ queryKey: ["products"] });

      toast({
        title: "สำเร็จ",
        description: `บันทึกคำสั่งซื้อ ${order?.order_number} เรียบร้อยแล้ว`,
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

// Process payment and create order
export function useProcessPayment() {
  const createOrder = usePOSCreateOrder();
  // Note: useCart hook may not exist, removing dependency
  // const { clearCart } = useCart();

  return useMutation({
    mutationFn: async ({
      order,
      paymentResult,
    }: {
      order: POSOrder;
      paymentResult: PaymentResult;
    }) => {
      if (!paymentResult.success) {
        throw new Error("การชำระเงินไม่สำเร็จ");
      }

      const orderData = createOrderFromCart(
        order.items,
        paymentResult.method,
        paymentResult.customer
      );

      return await createOrder.mutateAsync(orderData);
    },
    onSuccess: (order) => {
      // Clear cart after successful order
      // Note: Cart clearing should be handled by the calling component
      // clearCart();

      return order;
    },
  });
}

// Receipt generation
export function useGenerateReceipt() {
  return useMutation({
    mutationFn: async (order: Order) => {
      // Generate receipt data
      const receiptData = {
        orderNumber: order.order_number,
        date: order.created_at ? new Date(order.created_at).toLocaleDateString("th-TH") : new Date().toLocaleDateString("th-TH"),
        time: order.created_at ? new Date(order.created_at).toLocaleTimeString("th-TH") : new Date().toLocaleTimeString("th-TH"),
        items:
          order.items?.map((item) => ({
            name: item.product_name,
            quantity: item.quantity,
            price: item.unit_price,
            total: item.total_price,
          })) || [],
        subtotal: order.subtotal,
        tax: order.tax || 0,
        total: order.total,
        paymentMethod: order.payment_method,
        customer: {
          name: order.customer_name,
          phone: order.customer_phone,
        },
      };

      return receiptData;
    },
  });
}

// Print receipt
export function usePrintReceipt() {
  const toast = useToast();

  return useMutation({
    mutationFn: async (receiptData: any) => {
      // Create print content
      const printContent = `
        <div style="font-family: monospace; max-width: 300px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2>ใบเสร็จรับเงิน</h2>
            <p>ShopFlow POS System</p>
            <p>เลขที่: ${receiptData.orderNumber}</p>
            <p>${receiptData.date} ${receiptData.time}</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            ${receiptData.items
              .map(
                (item: any) => `
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>${item.name}</span>
                <span>${item.quantity} x ${item.price.toFixed(2)}</span>
                <span>${item.total.toFixed(2)}</span>
              </div>
            `
              )
              .join("")}
          </div>
          
          <div style="border-top: 1px dashed #000; padding-top: 10px;">
            <div style="display: flex; justify-content: space-between;">
              <span>ยอดรวม:</span>
              <span>${receiptData.subtotal.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>ภาษี:</span>
              <span>${receiptData.tax.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: bold;">
              <span>รวมทั้งสิ้น:</span>
              <span>${receiptData.total.toFixed(2)}</span>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <p>วิธีการชำระเงิน: ${receiptData.paymentMethod}</p>
            ${
              receiptData.customer.name
                ? `<p>ลูกค้า: ${receiptData.customer.name}</p>`
                : ""
            }
            ${
              receiptData.customer.phone
                ? `<p>โทร: ${receiptData.customer.phone}</p>`
                : ""
            }
            <p>ขอบคุณที่ใช้บริการ</p>
          </div>
        </div>
      `;

      // Open print window
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>ใบเสร็จ - ${receiptData.orderNumber}</title>
              <style>
                body { margin: 0; padding: 20px; }
                @media print {
                  body { margin: 0; }
                }
              </style>
            </head>
            <body>
              ${printContent}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
      } else {
        throw new Error("ไม่สามารถเปิดหน้าต่างสำหรับพิมพ์ได้");
      }

      return receiptData;
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

// Order lookup by order number
export function useOrderLookup() {
  return useMutation({
    mutationFn: async (orderNumber: string) => {
      const response = await orderService.getAll({
        limit: 1,
      });

      const orders = (response.data || []).filter(
        (order) => order.order_number === orderNumber
      );
      if (orders.length === 0) {
        throw new Error("ไม่พบคำสั่งซื้อที่ระบุ");
      }

      return orders[0];
    },
  });
}

// Quick sale (direct sale without cart)
export function useQuickSale() {
  const createOrder = usePOSCreateOrder();

  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
      paymentMethod,
      customer,
    }: {
      productId: string;
      quantity: number;
      paymentMethod: string;
      customer?: { name?: string; phone?: string };
    }) => {
      // Get product details
      const productResponse = await productService.getById(productId) as any;
      if (!productResponse?.success || !productResponse?.data) {
        throw new Error("ไม่พบสินค้าที่ระบุ");
      }
      const product = productResponse.data;
      if ((product.stock || 0) < quantity) {
        throw new Error(`สินค้าไม่เพียงพอ (คงเหลือ ${product.stock || 0} ชิ้น)`);
      }

      const subtotal = product.price * quantity;
      const tax = subtotal * 0.07;
      const total = subtotal + tax;

      const orderData = {
        order: {
          customer_name: customer?.name,
          customer_phone: customer?.phone,
          payment_method: paymentMethod as any,
        },
        items: [
          {
            product_id: productId,
            quantity,
            unit_price: product.price,
            subtotal: product.price * quantity,
          },
        ],
      };

      const response = await orderService.create(orderData);
      return response.order;
    },
  });
}
