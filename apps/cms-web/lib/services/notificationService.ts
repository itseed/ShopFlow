import { supabase } from "../supabase";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  read: boolean;
  created_at: string;
  read_at: string | null;
}

export interface NotificationRule {
  id: number;
  name: string;
  event: string;
  channels: string[];
  enabled: boolean;
  conditions: string;
}

class NotificationService {
  async getNotifications(userId: string): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true, read_at: new Date().toISOString() })
        .eq("id", notificationId);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true, read_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("read", false);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return false;
    }
  }

  async createNotification(
    notification: Omit<Notification, "id" | "created_at" | "read_at">
  ): Promise<Notification | null> {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .insert([notification])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error("Error creating notification:", error);
      return null;
    }
  }

  async updateNotificationSettings(settings: any): Promise<boolean> {
    try {
      // In a real implementation, this would update user notification preferences
      // For now, we'll just simulate success
      return true;
    } catch (error) {
      console.error("Error updating notification settings:", error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();
