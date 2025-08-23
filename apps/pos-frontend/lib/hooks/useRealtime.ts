import React, { useEffect, useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import {
  realtimeService,
  type RealtimeEvent,
  type RealtimeEventType,
} from "@shopflow/api";
import type { Product } from "@shopflow/api";

// Define Order and OrderItem types locally
interface Order {
  id: string;
  order_number: string;
  total: number;
  status: string;
  created_at: string;
  customer_name?: string;
  customer_phone?: string;
  branch_id?: string;
  source?: string;
  items?: OrderItem[];
}

interface OrderItem {
  id: string;
  order_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

// Mock auth hook for now
const useAuth = () => ({ user: { id: "mock-user-id" } });

// POS-specific notification types
export interface POSNotification {
  id: string;
  type: "inventory" | "system" | "alert" | "sync";
  title: string;
  message: string;
  timestamp: string;
  priority: "low" | "medium" | "high";
  data?: any;
}

// Real-time inventory sync for POS
export function usePOSInventorySync(branchId?: string) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "error">(
    "synced"
  );
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const handleInventorySync = useCallback(
    (event: RealtimeEvent<Product>) => {
      console.log("🔄 POS inventory sync:", event);

      const { eventType, new: newProduct, old: oldProduct } = event;

      setSyncStatus("syncing");

      // Update React Query cache immediately
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });

      // Update specific product in cache if possible
      if (newProduct) {
        queryClient.setQueryData(["products"], (oldData: any) => {
          if (!oldData) return oldData;

          const products = Array.isArray(oldData)
            ? oldData
            : oldData.data || [];

          if (eventType === "INSERT") {
            return [...products, newProduct];
          } else if (eventType === "UPDATE") {
            return products.map((p: Product) =>
              p.id === newProduct.id ? newProduct : p
            );
          } else if (eventType === "DELETE" && oldProduct) {
            return products.filter((p: Product) => p.id !== oldProduct.id);
          }

          return products;
        });
      }

      // Show appropriate notifications
      if (eventType === "UPDATE" && newProduct && oldProduct) {
        // Stock level changes
        if (
          (newProduct as any).current_stock !==
          (oldProduct as any).current_stock
        ) {
          const stockDiff =
            (newProduct as any).current_stock -
            (oldProduct as any).current_stock;

          // Only show if significant change (> 5 units or > 10% change)
          if (
            Math.abs(stockDiff) > 5 ||
            Math.abs(stockDiff / (oldProduct as any).current_stock) > 0.1
          ) {
            toast({
              title: "อัปเดตสต็อกสินค้า",
              description: `${newProduct.name}: ${
                (oldProduct as any).current_stock
              } → ${(newProduct as any).current_stock}`,
              status: "info",
              duration: 3000,
              isClosable: true,
            });
          }

          // Low stock warning for POS
          if ((newProduct as any).current_stock <= 5) {
            toast({
              title: "⚠️ สินค้าใกล้หมด",
              description: `${newProduct.name} เหลือ ${
                (newProduct as any).current_stock
              } ชิ้น`,
              status: "warning",
              duration: 5000,
              isClosable: true,
            });
          }

          // Out of stock alert
          if ((newProduct as any).current_stock === 0) {
            toast({
              title: "❌ สินค้าหมด",
              description: `${newProduct.name} หมดสต็อกแล้ว`,
              status: "error",
              duration: 5000,
              isClosable: true,
            });
          }
        }

        // Price changes
        if (newProduct.price !== oldProduct.price) {
          toast({
            title: "ราคาสินค้าเปลี่ยนแปลง",
            description: `${newProduct.name}: ฿${oldProduct.price} → ฿${newProduct.price}`,
            status: "warning",
            duration: 4000,
            isClosable: true,
          });
        }

        // Product status changes
        if ((newProduct as any).is_active !== (oldProduct as any).is_active) {
          toast({
            title: (newProduct as any).is_active
              ? "เปิดใช้งานสินค้า"
              : "ปิดใช้งานสินค้า",
            description: newProduct.name,
            status: (newProduct as any).is_active ? "success" : "warning",
            duration: 3000,
            isClosable: true,
          });
        }
      }

      // Mark sync as complete
      setTimeout(() => setSyncStatus("synced"), 1000);
    },
    [queryClient, toast]
  );

  useEffect(() => {
    if (branchId) {
      // Subscribe to inventory updates for the specific branch
      unsubscribeRef.current = realtimeService.subscribeToInventoryUpdates(
        handleInventorySync,
        branchId
      );

      console.log(
        `🔄 POS subscribed to inventory sync for branch: ${branchId}`
      );
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
        console.log("🔄 POS unsubscribed from inventory sync");
      }
    };
  }, [branchId, handleInventorySync]);

  return {
    syncStatus,
    isConnected: realtimeService.getConnectionStatus(),
  };
}

// Real-time order processing for POS
export function usePOSOrderProcessing(branchId?: string) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [processingOrders, setProcessingOrders] = useState<string[]>([]);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const handleOrderProcessing = useCallback(
    (event: RealtimeEvent<Order>) => {
      console.log("🛒 POS order processing:", event);

      const { eventType, new: newOrder, old: oldOrder } = event;

      // Update React Query cache
      queryClient.invalidateQueries({ queryKey: ["orders"] });

      if (eventType === "INSERT" && newOrder) {
        // New order notification (typically from online channels)
        if (newOrder.source !== "pos") {
          toast({
            title: "🛒 ออเดอร์ใหม่",
            description: `ออเดอร์ออนไลน์ ${
              newOrder.order_number
            } - ฿${newOrder.total.toLocaleString()}`,
            status: "info",
            duration: 5000,
            isClosable: true,
          });
        }

        // Add to processing list if status is pending/confirmed
        if (["pending", "confirmed"].includes(newOrder.status)) {
          setProcessingOrders((prev) => [...prev, newOrder.id]);
        }
      } else if (eventType === "UPDATE" && newOrder && oldOrder) {
        // Status changes
        if (newOrder.status !== oldOrder.status) {
          // Remove from processing list if completed or cancelled
          if (["completed", "cancelled"].includes(newOrder.status)) {
            setProcessingOrders((prev) =>
              prev.filter((id) => id !== newOrder.id)
            );
          }

          // Only show notifications for significant status changes
          if (
            oldOrder.status === "pending" &&
            newOrder.status === "confirmed"
          ) {
            toast({
              title: "✅ ออเดอร์ยืนยันแล้ว",
              description: `ออเดอร์ ${newOrder.order_number}`,
              status: "success",
              duration: 3000,
              isClosable: true,
            });
          } else if (newOrder.status === "cancelled") {
            toast({
              title: "❌ ออเดอร์ถูกยกเลิก",
              description: `ออเดอร์ ${newOrder.order_number}`,
              status: "error",
              duration: 4000,
              isClosable: true,
            });
          }
        }
      }
    },
    [queryClient, toast]
  );

  useEffect(() => {
    if (branchId) {
      // Subscribe to order updates for the specific branch
      unsubscribeRef.current = realtimeService.subscribeToOrderUpdates(
        handleOrderProcessing,
        branchId
      );

      console.log(
        `🛒 POS subscribed to order processing for branch: ${branchId}`
      );
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
        console.log("🛒 POS unsubscribed from order processing");
      }
    };
  }, [branchId, handleOrderProcessing]);

  return {
    processingOrders,
    processingCount: processingOrders.length,
    isConnected: realtimeService.getConnectionStatus(),
  };
}

// Real-time POS notifications
export function usePOSNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<POSNotification[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<POSNotification[]>([]);
  const userUnsubscribeRef = useRef<(() => void) | null>(null);
  const toast = useToast();

  const addNotification = useCallback(
    (notification: Omit<POSNotification, "id">) => {
      const newNotification: POSNotification = {
        ...notification,
        id: `${Date.now()}-${Math.random()}`,
      };

      setNotifications((prev) => [newNotification, ...prev.slice(0, 19)]); // Keep last 20

      // Add to active alerts if high priority
      if (notification.priority === "high") {
        setActiveAlerts((prev) => [newNotification, ...prev]);
      }

      // Show toast notification
      const toastStatus =
        notification.priority === "high"
          ? "error"
          : notification.priority === "medium"
          ? "warning"
          : "info";

      toast({
        title: notification.title,
        description: notification.message,
        status: toastStatus,
        duration:
          notification.priority === "high"
            ? 8000
            : notification.priority === "medium"
            ? 5000
            : 3000,
        isClosable: true,
      });
    },
    [toast]
  );

  const dismissAlert = useCallback((notificationId: string) => {
    setActiveAlerts((prev) =>
      prev.filter((alert) => alert.id !== notificationId)
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setActiveAlerts([]);
  }, []);

  useEffect(() => {
    if (user?.id) {
      // Subscribe to POS-specific notifications
      userUnsubscribeRef.current = realtimeService.subscribeToNotifications(
        user.id,
        (payload: any) => {
          addNotification(payload.payload);
        }
      );

      console.log(`🔔 POS subscribed to notifications for user: ${user.id}`);
    }

    return () => {
      if (userUnsubscribeRef.current) {
        userUnsubscribeRef.current();
        userUnsubscribeRef.current = null;
        console.log("🔔 POS unsubscribed from notifications");
      }
    };
  }, [user?.id, addNotification]);

  return {
    notifications,
    activeAlerts,
    alertCount: activeAlerts.length,
    dismissAlert,
    clearNotifications,
    isConnected: realtimeService.getConnectionStatus(),
  };
}

// POS connection monitoring
export function usePOSConnection() {
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "connecting" | "disconnected"
  >("disconnected");
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const toast = useToast();

  useEffect(() => {
    const checkConnection = () => {
      const isConnected = realtimeService.getConnectionStatus();
      const newStatus = isConnected ? "connected" : "disconnected";

      if (newStatus !== connectionStatus) {
        setConnectionStatus(newStatus);

        if (newStatus === "connected") {
          setLastSync(new Date().toISOString());
          setRetryCount(0);

          toast({
            title: "✅ เชื่อมต่อสำเร็จ",
            description: "ระบบ POS เชื่อมต่อกับเซิร์ฟเวอร์แล้ว",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        } else {
          toast({
            title: "❌ การเชื่อมต่อขาดหาย",
            description: "กำลังพยายามเชื่อมต่อใหม่...",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      }
    };

    const interval = setInterval(checkConnection, 2000);
    return () => clearInterval(interval);
  }, [connectionStatus, toast]);

  const reconnect = useCallback(async () => {
    setConnectionStatus("connecting");
    setRetryCount((prev) => prev + 1);

    try {
      await realtimeService.reconnect();

      // Check if reconnection was successful
      setTimeout(() => {
        const isConnected = realtimeService.getConnectionStatus();
        if (isConnected) {
          setConnectionStatus("connected");
          setLastSync(new Date().toISOString());

          toast({
            title: "✅ เชื่อมต่อใหม่สำเร็จ",
            description: "ระบบ POS กลับมาออนไลน์แล้ว",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        } else {
          setConnectionStatus("disconnected");
        }
      }, 2000);
    } catch (error) {
      setConnectionStatus("disconnected");
      console.error("Failed to reconnect:", error);
    }
  }, [toast]);

  return {
    connectionStatus,
    lastSync,
    retryCount,
    reconnect,
    isOnline: connectionStatus === "connected",
  };
}

// Combined POS real-time hook
export function usePOSRealtime(branchId?: string) {
  const inventory = usePOSInventorySync(branchId);
  const orders = usePOSOrderProcessing(branchId);
  const notifications = usePOSNotifications();
  const connection = usePOSConnection();

  return {
    inventory,
    orders,
    notifications,
    connection,
    isConnected: connection.isOnline,
  };
}
