import { supabase } from "../supabase";

export interface SecurityLog {
  id: string;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  action: string;
  resource: string | null;
  ip_address: string | null;
  user_agent: string | null;
  location: string | null;
  success: boolean;
  risk_level: "low" | "medium" | "high" | "critical" | null;
  details: any;
  created_at: string;
}

export interface ApiKey {
  id: string;
  name: string;
  description: string | null;
  key_hash: string;
  permissions: string[];
  last_used: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  usage_count: number;
  rate_limit: number;
}

class SecurityService {
  async getSecurityLogs(limit: number = 50): Promise<SecurityLog[]> {
    try {
      const { data, error } = await supabase
        .from("security_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching security logs:", error);
      return [];
    }
  }

  async getApiKeys(): Promise<ApiKey[]> {
    try {
      const { data, error } = await supabase
        .from("api_keys")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching API keys:", error);
      return [];
    }
  }

  async createApiKey(
    apiKey: Omit<ApiKey, "id" | "created_at" | "usage_count" | "last_used">
  ): Promise<ApiKey | null> {
    try {
      const { data, error } = await supabase
        .from("api_keys")
        .insert([apiKey])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error("Error creating API key:", error);
      return null;
    }
  }

  async updateApiKey(id: string, updates: Partial<ApiKey>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("api_keys")
        .update(updates)
        .eq("id", id);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (error) {
      console.error("Error updating API key:", error);
      return false;
    }
  }

  async deleteApiKey(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("api_keys").delete().eq("id", id);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (error) {
      console.error("Error deleting API key:", error);
      return false;
    }
  }

  async logSecurityEvent(
    log: Omit<SecurityLog, "id" | "created_at">
  ): Promise<SecurityLog | null> {
    try {
      const { data, error } = await supabase
        .from("security_logs")
        .insert([log])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error("Error logging security event:", error);
      return null;
    }
  }
}

export const securityService = new SecurityService();
