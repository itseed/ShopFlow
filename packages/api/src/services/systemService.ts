/**
 * System Service - Settings, Users, and Branches Management
 * Consolidates: userService, branchService, settingsService
 * Phase 1: Foundation Refactor
 */

import { supabase } from "../supabase";
import type { Database } from "@shopflow/types";

type User = Database["public"]["Tables"]["user_profiles"]["Row"];
type Branch = Database["public"]["Tables"]["branches"]["Row"];
type BranchSettings = Database["public"]["Tables"]["branch_settings"]["Row"];
type SystemSettings = Database["public"]["Tables"]["system_settings"]["Row"];

/**
 * User Management
 */
export const users = {
  /**
   * Get all users
   */
  async getAll(params?: { branchId?: string }) {
    let query = supabase.from("user_profiles").select("*");

    if (params?.branchId) {
      query = query.eq("branch_id", params.branchId);
    }

    const { data, error } = await query.order("display_name");
    if (error) throw error;

    return data as User[];
  },

  /**
   * Get user by ID
   */
  async getById(id: string) {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as User;
  },

  /**
   * Get user by email
   */
  async getByEmail(email: string) {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // No user found
      }
      throw error;
    }
    return data as User;
  },

  /**
   * Update user
   */
  async update(id: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from("user_profiles")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as User;
  },

  /**
   * Delete user
   */
  async delete(id: string) {
    const { error } = await supabase
      .from("user_profiles")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return { success: true };
  },

  /**
   * Get user role
   */
  async getRole(userId: string) {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data.role;
  },

  /**
   * Update user role
   */
  async updateRole(userId: string, role: string) {
    const { data, error } = await supabase
      .from("user_profiles")
      .update({ role })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data as User;
  },
};

/**
 * Branch Management
 */
export const branches = {
  /**
   * Get all branches
   */
  async getAll() {
    const { data, error } = await supabase
      .from("branches")
      .select("*")
      .order("name");

    if (error) throw error;
    return data as Branch[];
  },

  /**
   * Get branch by ID
   */
  async getById(id: string) {
    const { data, error } = await supabase
      .from("branches")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as Branch;
  },

  /**
   * Create new branch
   */
  async create(branch: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    is_active?: boolean;
  }) {
    const { data, error } = await supabase
      .from("branches")
      .insert(branch)
      .select()
      .single();

    if (error) throw error;

    // Create default branch settings
    const { error: settingsError } = await supabase
      .from("branch_settings")
      .insert({
        branch_id: data.id,
      });

    if (settingsError) throw settingsError;

    return data as Branch;
  },

  /**
   * Update branch
   */
  async update(id: string, updates: Partial<Branch>) {
    const { data, error } = await supabase
      .from("branches")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data as Branch;
  },

  /**
   * Delete branch
   */
  async delete(id: string) {
    const { error } = await supabase.from("branches").delete().eq("id", id);

    if (error) throw error;
    return { success: true };
  },

  /**
   * Get branch statistics
   */
  async getStats(
    branchId: string,
    params?: { startDate?: string; endDate?: string }
  ) {
    let ordersQuery = supabase
      .from("orders")
      .select("id, total, status")
      .eq("branch_id", branchId);

    if (params?.startDate) {
      ordersQuery = ordersQuery.gte("created_at", params.startDate);
    }

    if (params?.endDate) {
      ordersQuery = ordersQuery.lte("created_at", params.endDate);
    }

    const { data: orders, error: ordersError } = await ordersQuery;
    if (ordersError) throw ordersError;

    const { count: productsCount, error: productsError } = await supabase
      .from("products")
      .select("id", { count: "exact" })
      .eq("branch_id", branchId);

    if (productsError) throw productsError;

    const completedOrders =
      orders?.filter((o: any) => o.status === "completed") || [];

    return {
      totalOrders: orders?.length || 0,
      completedOrders: completedOrders.length,
      totalRevenue: completedOrders.reduce(
        (sum: number, o: any) => sum + (o.total || 0),
        0
      ),
      totalProducts: productsCount || 0,
    };
  },
};

/**
 * Branch Settings Management
 */
export const branchSettings = {
  /**
   * Get branch settings
   */
  async get(branchId: string) {
    const { data, error } = await supabase
      .from("branch_settings")
      .select("*")
      .eq("branch_id", branchId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No settings found, create default
        const { data: newSettings, error: createError } = await supabase
          .from("branch_settings")
          .insert({ branch_id: branchId })
          .select()
          .single();

        if (createError) throw createError;
        return newSettings as BranchSettings;
      }
      throw error;
    }

    return data as BranchSettings;
  },

  /**
   * Update branch settings
   */
  async update(
    branchId: string,
    updates: {
      business_info?: any;
      pricing_config?: any;
      inventory_config?: any;
      printer_config?: any;
      loyalty_config?: any;
      payment_config?: any;
      permissions?: any;
      pos_display_settings?: any;
    }
  ) {
    const { data, error } = await supabase
      .from("branch_settings")
      .update(updates)
      .eq("branch_id", branchId)
      .select()
      .single();

    if (error) throw error;
    return data as BranchSettings;
  },

  /**
   * Update specific setting section
   */
  async updateSection(
    branchId: string,
    section:
      | "business_info"
      | "pricing_config"
      | "inventory_config"
      | "printer_config"
      | "loyalty_config"
      | "payment_config"
      | "permissions"
      | "pos_display_settings",
    value: any
  ) {
    const updates = { [section]: value };

    const { data, error } = await supabase
      .from("branch_settings")
      .update(updates)
      .eq("branch_id", branchId)
      .select()
      .single();

    if (error) throw error;
    return data as BranchSettings;
  },

  /**
   * Get POS display settings
   */
  async getPOSSettings(branchId: string) {
    const { data, error } = await supabase
      .from("branch_settings")
      .select("pos_display_settings, printer_config, payment_config")
      .eq("branch_id", branchId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Reset settings to default
   */
  async reset(branchId: string) {
    const { data, error } = await supabase
      .from("branch_settings")
      .update({
        business_info: {},
        pricing_config: {
          currency: "THB",
          tax_rate: 0.07,
          tax_inclusive: false,
          decimal_places: 2,
        },
        inventory_config: {
          low_stock_threshold: 10,
          allow_negative_stock: false,
          track_serial_numbers: false,
        },
        printer_config: {
          printer_type: "thermal",
          paper_size: "80mm",
          auto_print: false,
          print_logo: true,
        },
        loyalty_config: {
          enabled: true,
          points_per_baht: 1,
          points_expiry_days: 365,
        },
        payment_config: {
          cash_enabled: true,
          card_enabled: true,
          qr_enabled: true,
          payment_gateway: "",
        },
        permissions: {
          allow_discount: true,
          allow_refund: false,
          allow_void: false,
          require_approval: true,
        },
        pos_display_settings: {
          language: "th",
          theme: "light",
          show_stock: true,
          show_cost: false,
          grid_columns: 4,
        },
      })
      .eq("branch_id", branchId)
      .select()
      .single();

    if (error) throw error;
    return data as BranchSettings;
  },
};

/**
 * System Settings Management
 */
export const systemSettings = {
  /**
   * Get system settings
   */
  async get() {
    const { data, error } = await supabase
      .from("system_settings")
      .select("*")
      .limit(1)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return {
          maintenance_mode: false,
          default_language: "th",
          default_currency: "THB",
          tax_rate: 0.07,
        } as any;
      }
      throw error;
    }

    return data as any;
  },

  /**
   * Update system settings
   */
  async update(updates: Partial<SystemSettings>) {
    // Check if settings exist
    const { data: existing } = await supabase
      .from("system_settings")
      .select("id")
      .limit(1)
      .single();

    if (existing) {
      const { data, error } = await supabase
        .from("system_settings")
        .update(updates as any)
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;
      return data as SystemSettings;
    } else {
      // Create new settings
      const { data, error } = await supabase
        .from("system_settings")
        .insert(updates as any)
        .select()
        .single();

      if (error) throw error;
      return data as SystemSettings;
    }
  },

  /**
   * Get maintenance mode status
   */
  async getMaintenanceMode() {
    const { data } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "maintenance_mode")
      .limit(1)
      .single();
    if (!data) return false;
    const val = (data as any).value;
    return typeof val === "boolean" ? val : Boolean(val);
  },

  /**
   * Set maintenance mode
   */
  async setMaintenanceMode(enabled: boolean) {
    const existing = await supabase
      .from("system_settings")
      .select("id")
      .eq("key", "maintenance_mode")
      .limit(1)
      .single();

    if (existing.data) {
      const { data, error } = await supabase
        .from("system_settings")
        .update({ value: enabled })
        .eq("id", (existing.data as any).id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from("system_settings")
        .insert({ key: "maintenance_mode", value: enabled })
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },
};

/**
 * Audit Logging
 */
export const auditLogs = {
  /**
   * Create audit log
   */
  async create(log: {
    user_id?: string;
    action: string;
    entity_type: string;
    entity_id?: string;
    details?: any;
  }) {
    const { data, error } = await supabase
      .from("audit_logs")
      .insert(log)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get audit logs
   */
  async get(params?: {
    userId?: string;
    entityType?: string;
    entityId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }) {
    let query = supabase.from("audit_logs").select("*");

    if (params?.userId) {
      query = query.eq("user_id", params.userId);
    }

    if (params?.entityType) {
      query = query.eq("entity_type", params.entityType);
    }

    if (params?.entityId) {
      query = query.eq("entity_id", params.entityId);
    }

    if (params?.startDate) {
      query = query.gte("created_at", params.startDate);
    }

    if (params?.endDate) {
      query = query.lte("created_at", params.endDate);
    }

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    return data;
  },
};

/**
 * System Service - Main Export
 */
export const systemService = {
  users,
  branches,
  branchSettings,
  systemSettings,
  auditLogs,
};

export default systemService;
