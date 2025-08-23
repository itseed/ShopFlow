import { supabase } from "../supabase";

export interface SystemStatus {
  database: {
    connected: boolean;
    lastCheck: Date;
    responseTime?: number;
    error?: string;
  };
  auth: {
    working: boolean;
    lastCheck: Date;
    error?: string;
  };
  storage: {
    working: boolean;
    lastCheck: Date;
    error?: string;
  };
  realtime: {
    connected: boolean;
    lastCheck: Date;
    error?: string;
  };
}

export interface DatabaseInfo {
  schemaVersion?: string;
  tableCount?: number;
  totalProducts?: number;
  totalOrders?: number;
  totalCustomers?: number;
  totalBranches?: number;
  lastBackup?: Date;
}

export interface SystemSettings {
  companyName: string;
  taxId: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  language: string;
  developmentMode: boolean;
  autoLogging: boolean;
  autoBackup: boolean;
  emailNotifications: boolean;
  maintenanceMode?: boolean;
}

class SystemService {
  async checkDatabaseConnection(): Promise<{
    connected: boolean;
    responseTime?: number;
    error?: string;
  }> {
    const startTime = Date.now();
    try {
      const { data, error } = await supabase
        .from("system_settings")
        .select("id")
        .limit(1);

      if (error) {
        return { connected: false, error: error.message };
      }

      const responseTime = Date.now() - startTime;
      return { connected: true, responseTime };
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async checkAuthService(): Promise<{ working: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        return { working: false, error: error.message };
      }
      return { working: true };
    } catch (error) {
      return {
        working: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async checkStorageService(): Promise<{ working: boolean; error?: string }> {
    try {
      const { data, error } = await supabase.storage.listBuckets();
      if (error) {
        return { working: false, error: error.message };
      }
      return { working: true };
    } catch (error) {
      return {
        working: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async checkRealtimeConnection(): Promise<{
    connected: boolean;
    error?: string;
  }> {
    try {
      // Create a test subscription to check realtime
      const subscription = supabase
        .channel("test-connection")
        .on("system", () => {})
        .subscribe();

      // Check if subscription is successful
      if (subscription.state === "subscribed") {
        subscription.unsubscribe();
        return { connected: true };
      } else {
        subscription.unsubscribe();
        return {
          connected: false,
          error: "Failed to establish realtime connection",
        };
      }
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getSystemStatus(): Promise<SystemStatus> {
    const [database, auth, storage, realtime] = await Promise.all([
      this.checkDatabaseConnection(),
      this.checkAuthService(),
      this.checkStorageService(),
      this.checkRealtimeConnection(),
    ]);

    return {
      database: {
        connected: database.connected,
        responseTime: database.responseTime,
        lastCheck: new Date(),
        error: database.error,
      },
      auth: {
        working: auth.working,
        lastCheck: new Date(),
        error: auth.error,
      },
      storage: {
        working: storage.working,
        lastCheck: new Date(),
        error: storage.error,
      },
      realtime: {
        connected: realtime.connected,
        lastCheck: new Date(),
        error: realtime.error,
      },
    };
  }

  async getDatabaseInfo(): Promise<DatabaseInfo> {
    try {
      // Get schema version
      const { data: versionData } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "schema_version")
        .single();

      // Get table counts in parallel
      const [productsCount, ordersCount, customersCount, branchesCount] =
        await Promise.all([
          supabase.from("products").select("*", { count: "exact", head: true }),
          supabase.from("orders").select("*", { count: "exact", head: true }),
          supabase
            .from("customers")
            .select("*", { count: "exact", head: true }),
          supabase.from("branches").select("*", { count: "exact", head: true }),
        ]);

      return {
        schemaVersion: (versionData?.value as string) || "1.0",
        totalProducts: productsCount.count || 0,
        totalOrders: ordersCount.count || 0,
        totalCustomers: customersCount.count || 0,
        totalBranches: branchesCount.count || 0,
      };
    } catch (error) {
      console.error("Error fetching database info:", error);
      return {};
    }
  }

  async getSystemSettings(): Promise<SystemSettings> {
    try {
      const { data } = await supabase
        .from("system_settings")
        .select("key, value")
        .in("category", ["general", "system"]);

      const settings: Record<string, any> = {};
      data?.forEach((setting) => {
        settings[setting.key] = setting.value;
      });

      return {
        companyName: settings.company_name || "ShopFlow POS",
        taxId: settings.tax_id || "0-1234-56789-01-2",
        email: settings.email || "contact@shopflow.com",
        phone: settings.phone || "02-123-4567",
        address:
          settings.address ||
          "123 ถนนสุขุมวิท แขวงคลองตัน เขตคลองตัน กรุงเทพฯ 10110",
        currency: settings.currency || "THB",
        timezone: settings.timezone || "Asia/Bangkok",
        dateFormat: settings.date_format || "DD/MM/YYYY",
        language: settings.language || "th",
        developmentMode: settings.development_mode === true,
        autoLogging: settings.auto_logging !== false,
        autoBackup: settings.auto_backup !== false,
        emailNotifications: settings.email_notifications !== false,
      };
    } catch (error) {
      console.error("Error fetching system settings:", error);
      // Return default settings
      return {
        companyName: "ShopFlow POS",
        taxId: "0-1234-56789-01-2",
        email: "contact@shopflow.com",
        phone: "02-123-4567",
        address: "123 ถนนสุขุมวิท แขวงคลองตัน เขตคลองตัน กรุงเทพฯ 10110",
        currency: "THB",
        timezone: "Asia/Bangkok",
        dateFormat: "DD/MM/YYYY",
        language: "th",
        developmentMode: false,
        autoLogging: true,
        autoBackup: true,
        emailNotifications: true,
      };
    }
  }

  async updateSystemSettings(
    settings: Partial<SystemSettings>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Convert settings to key-value pairs for storage
      const updates = Object.entries(settings).map(([key, value]) => ({
        category: "general",
        key: key.replace(/([A-Z])/g, "_$1").toLowerCase(), // Convert camelCase to snake_case
        value: value?.toString() || "",
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from("system_settings")
        .upsert(updates, { onConflict: "category,key" });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async setMaintenanceMode(
    enabled: boolean
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from("system_settings").upsert(
        {
          category: "system",
          key: "maintenance_mode",
          value: enabled.toString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "category,key" }
      );

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async isMaintenanceMode(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("system_settings")
        .select("value")
        .eq("category", "system")
        .eq("key", "maintenance_mode")
        .single();

      if (error) {
        return false;
      }

      return data?.value === "true";
    } catch (error) {
      return false;
    }
  }

  async testConnection(): Promise<{
    success: boolean;
    details: any;
    error?: string;
  }> {
    try {
      const status = await this.getSystemStatus();
      const dbInfo = await this.getDatabaseInfo();

      return {
        success: status.database.connected && status.auth.working,
        details: {
          status,
          dbInfo,
          connectionUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        details: null,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

export const systemService = new SystemService();
