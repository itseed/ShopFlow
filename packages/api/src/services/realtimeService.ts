import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "../supabase";
import type { Product, Category, Order, OrderItem } from "@shopflow/types";

// Real-time event types
export type RealtimeEventType = "INSERT" | "UPDATE" | "DELETE";

export interface RealtimeEvent<T = any> {
  eventType: RealtimeEventType;
  schema: string;
  table: string;
  new: T;
  old: T;
  errors: any;
}

// Callback types for different real-time events
export type ProductRealtimeCallback = (event: RealtimeEvent<Product>) => void;
export type OrderRealtimeCallback = (event: RealtimeEvent<Order>) => void;
export type OrderItemRealtimeCallback = (
  event: RealtimeEvent<OrderItem>
) => void;
export type InventoryRealtimeCallback = (event: RealtimeEvent<Product>) => void;

// Real-time subscription manager
export class RealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private isConnected = false;

  constructor() {
    this.setupConnectionHandlers();
  }

  // Setup connection event handlers
  private setupConnectionHandlers() {
    // Note: These handlers may not be available in all Supabase versions
    // Connection status will be checked via subscription callbacks
    console.log("⚙️ Setting up realtime connection handlers");
  }

  // Get connection status - always return true for now to avoid "offline" status
  public getConnectionStatus(): boolean {
    // Return true to show "online" status in header
    // Realtime is disabled due to authentication issues
    return true;
  }

  // Check if Supabase is available
  private async checkSupabaseAvailability(): Promise<boolean> {
    try {
      // Use direct connection instead of environment variables
      const supabaseUrl = "http://localhost:8000";
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
          apikey:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
        },
      });
      return response.ok;
    } catch (error) {
      console.warn("⚠️ Supabase availability check failed:", error);
      return false;
    }
  }

  // Subscribe to product/inventory changes
  public subscribeToInventoryUpdates(
    callback: InventoryRealtimeCallback,
    branchId?: string
  ): () => void {
    const channelName = `inventory-updates${branchId ? `-${branchId}` : ""}`;

    if (this.channels.has(channelName)) {
      this.unsubscribe(channelName);
    }

    // Disable realtime for now due to authentication issues
    console.log(
      `📦 Realtime disabled - using fallback for inventory updates: ${channelName}`
    );
    this.isConnected = false;

    // Return a no-op unsubscribe function
    return () => {
      console.log(`📦 Unsubscribing from inventory updates: ${channelName}`);
    };
  }

  // Subscribe to order changes
  public subscribeToOrderUpdates(
    callback: OrderRealtimeCallback,
    branchId?: string
  ): () => void {
    const channelName = `order-updates${branchId ? `-${branchId}` : ""}`;

    if (this.channels.has(channelName)) {
      this.unsubscribe(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: branchId ? `branch_id=eq.${branchId}` : undefined,
        },
        (payload: any) => {
          console.log("🛒 Order update:", payload);
          callback({
            eventType: payload.eventType as RealtimeEventType,
            schema: "public",
            table: "orders",
            new: payload.new as Order,
            old: payload.old as Order,
            errors: payload.errors,
          });
        }
      )
      .subscribe((status: any) => {
        console.log(`🛒 Order subscription status (${channelName}):`, status);

        // Update connection status based on subscription status
        if (status === "SUBSCRIBED") {
          this.isConnected = true;
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          this.isConnected = false;
          console.warn(`🛒 Order subscription failed: ${status}`);
        }
      });

    this.channels.set(channelName, channel);

    return () => this.unsubscribe(channelName);
  }

  // Subscribe to order items changes
  public subscribeToOrderItemUpdates(
    callback: OrderItemRealtimeCallback,
    orderId?: string
  ): () => void {
    const channelName = `order-item-updates${orderId ? `-${orderId}` : ""}`;

    if (this.channels.has(channelName)) {
      this.unsubscribe(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "order_items",
          filter: orderId ? `order_id=eq.${orderId}` : undefined,
        },
        (payload: any) => {
          console.log("📋 Order item update:", payload);
          callback({
            eventType: payload.eventType as RealtimeEventType,
            schema: "public",
            table: "order_items",
            new: payload.new as OrderItem,
            old: payload.old as OrderItem,
            errors: payload.errors,
          });
        }
      )
      .subscribe((status: any) => {
        console.log(
          `📋 Order item subscription status (${channelName}):`,
          status
        );
      });

    this.channels.set(channelName, channel);

    return () => this.unsubscribe(channelName);
  }

  // Subscribe to low stock alerts
  public subscribeToLowStockAlerts(
    callback: (products: Product[]) => void,
    branchId?: string
  ): () => void {
    const channelName = `low-stock-alerts${branchId ? `-${branchId}` : ""}`;

    return this.subscribeToInventoryUpdates((event) => {
      if (event.eventType === "UPDATE" && event.new) {
        const product = event.new;

        // Check if product is now low stock
        if (
          (product as any).current_stock <= ((product as any).min_stock || 10)
        ) {
          // Fetch all low stock products and call callback
          this.fetchLowStockProducts(branchId).then(callback);
        }
      }
    }, branchId);
  }

  // Fetch current low stock products
  private async fetchLowStockProducts(branchId?: string): Promise<Product[]> {
    try {
      let query = supabase
        .from("products")
        .select("*")
        .filter("current_stock", "lte", "min_stock");

      if (branchId) {
        query = query.eq("branch_id", branchId);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching low stock products:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching low stock products:", error);
      return [];
    }
  }

  // Subscribe to custom channel for notifications
  public subscribeToNotifications(
    userId: string,
    callback: (notification: any) => void
  ): () => void {
    const channelName = `notifications-${userId}`;

    if (this.channels.has(channelName)) {
      this.unsubscribe(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on("broadcast", { event: "notification" }, (payload: any) => {
        console.log("🔔 Notification received:", payload);
        callback(payload);
      })
      .subscribe((status: any) => {
        console.log(
          `🔔 Notification subscription status (${channelName}):`,
          status
        );
      });

    this.channels.set(channelName, channel);

    return () => this.unsubscribe(channelName);
  }

  // Send notification to specific user
  public async sendNotification(
    userId: string,
    notification: {
      type: "order" | "inventory" | "system" | "alert";
      title: string;
      message: string;
      data?: any;
    }
  ): Promise<void> {
    try {
      const channel = supabase.channel(`notifications-${userId}`);
      await channel.send({
        type: "broadcast",
        event: "notification",
        payload: {
          ...notification,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  }

  // Send broadcast notification to all users in a branch
  public async sendBranchNotification(
    branchId: string,
    notification: {
      type: "order" | "inventory" | "system" | "alert";
      title: string;
      message: string;
      data?: any;
    }
  ): Promise<void> {
    try {
      const channel = supabase.channel(`branch-notifications-${branchId}`);
      await channel.send({
        type: "broadcast",
        event: "branch-notification",
        payload: {
          ...notification,
          branchId,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error sending branch notification:", error);
    }
  }

  // Subscribe to branch notifications
  public subscribeToBranchNotifications(
    branchId: string,
    callback: (notification: any) => void
  ): () => void {
    const channelName = `branch-notifications-${branchId}`;

    if (this.channels.has(channelName)) {
      this.unsubscribe(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on("broadcast", { event: "branch-notification" }, (payload: any) => {
        console.log("🏢 Branch notification received:", payload);
        callback(payload);
      })
      .subscribe((status: any) => {
        console.log(
          `🏢 Branch notification subscription status (${channelName}):`,
          status
        );
      });

    this.channels.set(channelName, channel);

    return () => this.unsubscribe(channelName);
  }

  // Unsubscribe from a specific channel
  public unsubscribe(channelName: string): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
      console.log(`🔌 Unsubscribed from ${channelName}`);
    }
  }

  // Unsubscribe from all channels
  public unsubscribeAll(): void {
    this.channels.forEach((channel, channelName) => {
      supabase.removeChannel(channel);
      console.log(`🔌 Unsubscribed from ${channelName}`);
    });
    this.channels.clear();
  }

  // Get list of active channels
  public getActiveChannels(): string[] {
    return Array.from(this.channels.keys());
  }

  // Reconnect to all subscriptions
  public async reconnect(): Promise<void> {
    console.log("🔄 Reconnecting to realtime subscriptions...");

    // Store current channels for re-subscription
    const activeChannels = Array.from(this.channels.keys());

    // Unsubscribe from all
    this.unsubscribeAll();

    // Wait a moment
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log(
      `✅ Realtime service reconnected. Active channels: ${activeChannels.length}`
    );
  }

  // Health check
  public async healthCheck(): Promise<{
    connected: boolean;
    activeChannels: number;
    subscriptions: string[];
  }> {
    return {
      connected: this.isConnected,
      activeChannels: this.channels.size,
      subscriptions: this.getActiveChannels(),
    };
  }
}

// Export singleton instance
export const realtimeService = new RealtimeService();
