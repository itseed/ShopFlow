import { supabase } from "../supabase";
import { StockMovement } from "@shopflow/types";
import {
  ApiResponse,
  createSuccessResponse,
  createErrorResponse,
  handleSupabaseError,
} from "../types/api";

export interface CreateStockMovementData {
  product_id: string;
  movement_type: "sale" | "purchase" | "adjustment" | "return" | "transfer" | "waste" | "initial";
  quantity_change: number;
  quantity_before: number;
  quantity_after: number;
  unit_cost?: number;
  total_value?: number;
  reference_type?: "order" | "purchase_order" | "adjustment" | "transfer";
  reference_id?: string;
  reference_number?: string;
  reason?: string;
  notes?: string;
  branch_id?: string;
  created_by: string;
}

class StockMovementService {
  private tableName = "stock_movements";

  async createStockMovement(
    movementData: CreateStockMovementData
  ): Promise<ApiResponse<StockMovement>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert({
          ...movementData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(data, "Stock movement created successfully");
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Get stock movements with filters
  async getStockMovements(
    filters: { 
      product_id?: string;
      movement_type?: string;
      reference_type?: string;
      reference_id?: string;
      branch_id?: string;
      start_date?: string;
      end_date?: string;
    } = {}
  ): Promise<ApiResponse<StockMovement[]>> {
    try {
      let query = supabase.from(this.tableName).select("*");

      if (filters.product_id) {
        query = query.eq("product_id", filters.product_id);
      }

      if (filters.movement_type) {
        query = query.eq("movement_type", filters.movement_type);
      }

      if (filters.reference_type) {
        query = query.eq("reference_type", filters.reference_type);
      }

      if (filters.reference_id) {
        query = query.eq("reference_id", filters.reference_id);
      }

      if (filters.branch_id) {
        query = query.eq("branch_id", filters.branch_id);
      }

      if (filters.start_date) {
        query = query.gte("created_at", filters.start_date);
      }

      if (filters.end_date) {
        query = query.lte("created_at", filters.end_date);
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(data || []);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }

  // Get product stock movements
  async getProductStockMovements(
    productId: string
  ): Promise<ApiResponse<StockMovement[]>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(data || []);
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }
}

export const stockMovementService = new StockMovementService();
export default stockMovementService;