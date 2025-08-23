import { useState, useEffect, useCallback } from "react";
import {
  notificationService,
  Notification,
} from "../services/notificationService";

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.getNotifications(userId);
      setNotifications(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch notifications"
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const success = await notificationService.markAsRead(notificationId);
      if (success) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? {
                  ...notification,
                  read: true,
                  read_at: new Date().toISOString(),
                }
              : notification
          )
        );
      }
      return success;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to mark notification as read"
      );
      return false;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return false;

    try {
      const success = await notificationService.markAllAsRead(userId);
      if (success) {
        setNotifications((prev) =>
          prev.map((notification) => ({
            ...notification,
            read: true,
            read_at: new Date().toISOString(),
          }))
        );
      }
      return success;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to mark all notifications as read"
      );
      return false;
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    loading,
    error,
    refresh: fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
}

export function useNotificationSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const updateSettings = useCallback(async (newSettings: any) => {
    try {
      setSaving(true);
      setError(null);
      const success = await notificationService.updateNotificationSettings(
        newSettings
      );

      if (success) {
        setSettings(newSettings);
        return { success: true };
      } else {
        throw new Error("Failed to update notification settings");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update settings";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    settings,
    loading,
    error,
    saving,
    updateSettings,
  };
}
