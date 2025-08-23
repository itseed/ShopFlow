import { useEffect, useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@chakra-ui/react";
import {
  realtimeService,
  type RealtimeEvent,
  type Product,
  type Order,
} from "@shopflow/api";
import { useAuth } from "../auth";
import { useCurrentBranch } from "./useAuthEnhanced";

// Notification types
export interface RealtimeNotification {
  id: string;
  type: "order" | "inventory" | "system" | "alert";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: any;
}

// Real-time inventory hook
export function useRealtimeInventory(branchId?: string) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const currentBranch = useCurrentBranch();
  const effectiveBranchId = branchId || currentBranch?.id;
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const handleInventoryUpdate = useCallback(
    (event: RealtimeEvent<Product>) => {
      console.log("📦 Real-time inventory update:", event);

      const { eventType, new: newProduct, old: oldProduct } = event;

      // Update React Query cache
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });

      // Show notifications based on event type
      if (eventType === "UPDATE" && newProduct && oldProduct) {
        // Check for stock level changes
        if (
          (newProduct as any).current_stock !==
          (oldProduct as any).current_stock
        ) {
          const stockDiff =
            (newProduct as any).current_stock -
            (oldProduct as any).current_stock;
          const isStockIncrease = stockDiff > 0;

          toast({
            title: isStockIncrease ? "สินค้าเพิ่มขึ้น" : "สินค้าลดลง",
            description: `${newProduct.name}: ${
              isStockIncrease ? "+" : ""
            }${stockDiff} ชิ้น (คงเหลือ ${(newProduct as any).current_stock})`,
            status: isStockIncrease ? "success" : "warning",
            duration: 3000,
            isClosable: true,
          });

          // Check for low stock alert
          if (
            (newProduct as any).current_stock <=
            ((newProduct as any).min_stock || 10)
          ) {
            toast({
              title: "⚠️ สินค้าใกล้หมด",
              description: `${newProduct.name} เหลือเพียง ${
                (newProduct as any).current_stock
              } ชิ้น`,
              status: "error",
              duration: 5000,
              isClosable: true,
            });
          }
        }

        // Check for price changes
        if (newProduct.price !== oldProduct.price) {
          toast({
            title: "ราคาสินค้าเปลี่ยนแปลง",
            description: `${newProduct.name}: ฿${oldProduct.price} → ฿${newProduct.price}`,
            status: "info",
            duration: 3000,
            isClosable: true,
          });
        }
      } else if (eventType === "INSERT" && newProduct) {
        toast({
          title: "✅ เพิ่มสินค้าใหม่",
          description: `${newProduct.name} ถูกเพิ่มเข้าระบบแล้ว`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else if (eventType === "DELETE" && oldProduct) {
        toast({
          title: "🗑️ ลบสินค้า",
          description: `${oldProduct.name} ถูกลบออกจากระบบแล้ว`,
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
      }
    },
    [queryClient, toast]
  );

  useEffect(() => {
    if (effectiveBranchId) {
      // Subscribe to inventory updates
      unsubscribeRef.current = realtimeService.subscribeToInventoryUpdates(
        handleInventoryUpdate,
        effectiveBranchId
      );

      console.log(
        `📦 Subscribed to inventory updates for branch: ${effectiveBranchId}`
      );
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
        console.log("📦 Unsubscribed from inventory updates");
      }
    };
  }, [effectiveBranchId, handleInventoryUpdate]);

  return {
    isConnected: realtimeService.getConnectionStatus(),
  };
}

// Real-time orders hook
export function useRealtimeOrders(branchId?: string) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const currentBranch = useCurrentBranch();
  const effectiveBranchId = branchId || currentBranch?.id;
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const handleOrderUpdate = useCallback(
    (event: RealtimeEvent<Order>) => {
      console.log("🛒 Real-time order update:", event);

      const { eventType, new: newOrder, old: oldOrder } = event;

      // Update React Query cache
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });

      // Show notifications based on event type
      if (eventType === "INSERT" && newOrder) {
        toast({
          title: "🛒 ออเดอร์ใหม่",
          description: `ออเดอร์ ${
            newOrder.order_number
          } - ฿${newOrder.total.toLocaleString()}`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        // Play notification sound (if supported)
        if ("Audio" in window) {
          try {
            const audio = new Audio("/sounds/notification.mp3");
            audio.volume = 0.3;
            audio.play().catch(() => {
              // Ignore audio errors
            });
          } catch (error) {
            // Ignore audio errors
          }
        }
      } else if (eventType === "UPDATE" && newOrder && oldOrder) {
        // Check for status changes
        if (newOrder.status !== oldOrder.status) {
          const statusMessages: Record<string, string> = {
            pending: "รออนุมัติ",
            confirmed: "ยืนยันแล้ว",
            preparing: "กำลังเตรียม",
            ready: "พร้อมส่ง",
            completed: "เสร็จสิ้น",
            cancelled: "ยกเลิก",
          };

          toast({
            title: "สถานะออเดอร์เปลี่ยนแปลง",
            description: `ออเดอร์ ${newOrder.order_number}: ${
              statusMessages[newOrder.status] || newOrder.status
            }`,
            status:
              newOrder.status === "completed"
                ? "success"
                : newOrder.status === "cancelled"
                ? "error"
                : "info",
            duration: 4000,
            isClosable: true,
          });
        }
      }
    },
    [queryClient, toast]
  );

  useEffect(() => {
    if (effectiveBranchId) {
      // Subscribe to order updates
      unsubscribeRef.current = realtimeService.subscribeToOrderUpdates(
        handleOrderUpdate,
        effectiveBranchId
      );

      console.log(
        `🛒 Subscribed to order updates for branch: ${effectiveBranchId}`
      );
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
        console.log("🛒 Unsubscribed from order updates");
      }
    };
  }, [effectiveBranchId, handleOrderUpdate]);

  return {
    isConnected: realtimeService.getConnectionStatus(),
  };
}

// Real-time notifications hook
export function useRealtimeNotifications() {
  const { user } = useAuth();
  const currentBranch = useCurrentBranch();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>(
    []
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const userUnsubscribeRef = useRef<(() => void) | null>(null);
  const branchUnsubscribeRef = useRef<(() => void) | null>(null);
  const toast = useToast();

  const addNotification = useCallback(
    (notification: Omit<RealtimeNotification, "id" | "read">) => {
      const newNotification: RealtimeNotification = {
        ...notification,
        id: `${Date.now()}-${Math.random()}`,
        read: false,
      };

      setNotifications((prev) => [newNotification, ...prev.slice(0, 49)]); // Keep last 50
      setUnreadCount((prev) => prev + 1);

      // Show toast notification
      toast({
        title: notification.title,
        description: notification.message,
        status:
          notification.type === "alert"
            ? "error"
            : notification.type === "order"
            ? "success"
            : notification.type === "inventory"
            ? "warning"
            : "info",
        duration: 4000,
        isClosable: true,
      });
    },
    [toast]
  );

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    if (user?.id) {
      // Subscribe to personal notifications
      userUnsubscribeRef.current = realtimeService.subscribeToNotifications(
        user.id,
        (payload: any) => {
          addNotification(payload.payload);
        }
      );

      console.log(`🔔 Subscribed to notifications for user: ${user.id}`);
    }

    return () => {
      if (userUnsubscribeRef.current) {
        userUnsubscribeRef.current();
        userUnsubscribeRef.current = null;
        console.log("🔔 Unsubscribed from user notifications");
      }
    };
  }, [user?.id, addNotification]);

  useEffect(() => {
    if (currentBranch?.id) {
      // Subscribe to branch notifications
      branchUnsubscribeRef.current =
        realtimeService.subscribeToBranchNotifications(
          currentBranch.id,
          (payload: any) => {
            addNotification(payload.payload);
          }
        );

      console.log(
        `🏢 Subscribed to branch notifications for: ${currentBranch.id}`
      );
    }

    return () => {
      if (branchUnsubscribeRef.current) {
        branchUnsubscribeRef.current();
        branchUnsubscribeRef.current = null;
        console.log("🏢 Unsubscribed from branch notifications");
      }
    };
  }, [currentBranch?.id, addNotification]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    isConnected: realtimeService.getConnectionStatus(),
  };
}

// Low stock alerts hook
export function useLowStockAlerts(branchId?: string) {
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const toast = useToast();
  const currentBranch = useCurrentBranch();
  const effectiveBranchId = branchId || currentBranch?.id;
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const handleLowStockUpdate = useCallback(
    (products: Product[]) => {
      setLowStockProducts(products);

      // Show alert if there are new low stock products
      if (products.length > 0) {
        toast({
          title: "⚠️ สินค้าใกล้หมด",
          description: `มีสินค้า ${products.length} รายการที่ใกล้หมด`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    },
    [toast]
  );

  useEffect(() => {
    if (effectiveBranchId) {
      // Subscribe to low stock alerts
      unsubscribeRef.current = realtimeService.subscribeToLowStockAlerts(
        handleLowStockUpdate,
        effectiveBranchId
      );

      console.log(
        `⚠️ Subscribed to low stock alerts for branch: ${effectiveBranchId}`
      );
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
        console.log("⚠️ Unsubscribed from low stock alerts");
      }
    };
  }, [effectiveBranchId, handleLowStockUpdate]);

  return {
    lowStockProducts,
    hasLowStock: lowStockProducts.length > 0,
    lowStockCount: lowStockProducts.length,
    isConnected: realtimeService.getConnectionStatus(),
  };
}

// Real-time connection status hook
export function useRealtimeConnection() {
  const [isConnected, setIsConnected] = useState(
    realtimeService.getConnectionStatus()
  );
  const [connectionHistory, setConnectionHistory] = useState<
    Array<{
      timestamp: string;
      status: "connected" | "disconnected";
    }>
  >([]);

  useEffect(() => {
    const checkConnection = () => {
      const connected = realtimeService.getConnectionStatus();
      if (connected !== isConnected) {
        setIsConnected(connected);
        setConnectionHistory((prev) => [
          {
            timestamp: new Date().toISOString(),
            status: connected ? "connected" : "disconnected",
          },
          ...prev.slice(0, 9),
        ]); // Keep last 10 entries
      }
    };

    const interval = setInterval(checkConnection, 1000);
    return () => clearInterval(interval);
  }, [isConnected]);

  const reconnect = useCallback(async () => {
    await realtimeService.reconnect();
  }, []);

  const getHealthCheck = useCallback(async () => {
    return await realtimeService.healthCheck();
  }, []);

  return {
    isConnected,
    connectionHistory,
    reconnect,
    getHealthCheck,
    activeChannels: realtimeService.getActiveChannels(),
  };
}

// Combined real-time hook for complete functionality
export function useRealtime(branchId?: string) {
  const inventory = useRealtimeInventory(branchId);
  const orders = useRealtimeOrders(branchId);
  const notifications = useRealtimeNotifications();
  const lowStock = useLowStockAlerts(branchId);
  const connection = useRealtimeConnection();

  return {
    inventory,
    orders,
    notifications,
    lowStock,
    connection,
    isConnected: connection.isConnected,
  };
}
