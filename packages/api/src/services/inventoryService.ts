import { supabase } from "../supabase";
import {
  InventorySummary,
  ProductInventoryStatus,
  InventoryAdjustment,
  CreateInventoryAdjustment,
  CreateInventoryAdjustmentItem,
  AdjustmentReason,
  InventoryValueReport,
  StockMovementReport,
  LowStockAlert,
} from "@shopflow/types";
import { stockMovementService } from "./stockMovementService";

export class InventoryService {
  /**
   * Get comprehensive inventory summary
   */
  async getInventorySummary(branchId?: string): Promise<InventorySummary> {
    try {
      // Get product counts and stock status
      let productQuery = supabase
        .from("products")
        .select("id, stock, min_stock, cost_price, price, is_trackable")
        .eq("is_trackable", true);

      if (branchId) {
        // If branch-specific inventory is implemented later
        // productQuery = productQuery.eq('branch_id', branchId);
      }

      const { data: products, error: productsError } = await productQuery;
      if (productsError) throw productsError;

      // Calculate metrics
      const totalProducts = products.length;
      const lowStockCount = products.filter(
        (p) => p.stock <= (p.min_stock || 5)
      ).length;
      const outOfStockCount = products.filter((p) => p.stock === 0).length;
      const totalInventoryValue = products.reduce(
        (sum, p) => sum + p.stock * (p.cost_price || p.price),
        0
      );

      // Get today's stock movements
      const today = new Date().toISOString().split("T")[0];
      const todaysMovements = await stockMovementService.getStockMovements({
        start_date: today,
        end_date: today + "T23:59:59",
        ...(branchId && { branch_id: branchId }),
      });

      // Get pending purchase orders
      const { data: pendingPOs, error: poError } = await supabase
        .from("purchase_orders")
        .select("id")
        .in("status", ["draft", "sent", "confirmed", "partial"]);

      if (poError) throw poError;

      // Calculate inventory turnover (simplified - last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const salesMovements = await stockMovementService.getStockMovements({
        movement_type: "sale",
        start_date: thirtyDaysAgo.toISOString(),
        ...(branchId && { branch_id: branchId }),
      });

      const totalSalesValue = salesMovements.data?.reduce(
        (sum: number, m: any) => sum + (m.total_value || 0),
        0
      ) || 0;

      const inventoryTurnoverRate =
        totalInventoryValue > 0
          ? (totalSalesValue / totalInventoryValue) * 12 // Annualized
          : 0;

      return {
        total_products: totalProducts,
        total_inventory_value: totalInventoryValue,
        low_stock_count: lowStockCount,
        out_of_stock_count: outOfStockCount,
        total_stock_movements_today: todaysMovements.data?.length || 0,
        pending_purchase_orders: pendingPOs.length,
        inventory_turnover_rate: inventoryTurnoverRate,
      };
    } catch (error) {
      console.error("Error fetching inventory summary:", error);
      throw error;
    }
  }

  /**
   * Get detailed inventory status for all products
   */
  async getInventoryStatus(
    branchId?: string
  ): Promise<ProductInventoryStatus[]> {
    try {
      let query = supabase
        .from("products")
        .select(
          `
          id, name, sku, stock, min_stock, max_stock, cost_price, price,
          category:categories(name),
          supplier:suppliers(name)
        `
        )
        .eq("is_trackable", true);

      if (branchId) {
        // If branch-specific inventory is implemented later
        // query = query.eq('branch_id', branchId);
      }

      const { data: products, error } = await query.order("name");
      if (error) throw error;

      const inventoryStatus: ProductInventoryStatus[] = products.map(
        (product: any) => {
          const currentStock = product.stock;
          const minStock = product.min_stock || 5;
          const maxStock = product.max_stock;

          let stockStatus: "healthy" | "low" | "critical" | "out_of_stock";
          if (currentStock === 0) {
            stockStatus = "out_of_stock";
          } else if (currentStock <= minStock * 0.5) {
            stockStatus = "critical";
          } else if (currentStock <= minStock) {
            stockStatus = "low";
          } else {
            stockStatus = "healthy";
          }

          // Calculate suggested reorder quantity
          const suggestedOrderQuantity = maxStock
            ? Math.max(0, maxStock - currentStock)
            : Math.max(0, minStock * 2 - currentStock);

          return {
            product_id: product.id,
            product_name: product.name,
            sku: product.sku,
            current_stock: currentStock,
            min_stock: minStock,
            max_stock: maxStock,
            stock_status: stockStatus,
            reorder_point: minStock,
            suggested_order_quantity: suggestedOrderQuantity,
            supplier_name: product.supplier?.name,
            category_name: product.category?.name,
          };
        }
      );

      return inventoryStatus;
    } catch (error) {
      console.error("Error fetching inventory status:", error);
      throw error;
    }
  }

  /**
   * Get low stock alerts
   */
  async getLowStockAlerts(branchId?: string): Promise<LowStockAlert[]> {
    try {
      const inventoryStatus = await this.getInventoryStatus(branchId);

      const lowStockProducts = inventoryStatus.filter(
        (product) =>
          product.stock_status === "low" || product.stock_status === "critical"
      );

      // Get last restock dates from stock movements
      const alerts: LowStockAlert[] = [];

      for (const product of lowStockProducts) {
        const movements = await stockMovementService.getProductStockMovements(
          product.product_id
        );

        const lastRestock = movements.data?.find(
          (m: any) =>
            m.movement_type === "purchase" || m.movement_type === "adjustment"
        );

        alerts.push({
          product_id: product.product_id,
          product_name: product.product_name,
          current_stock: product.current_stock,
          min_stock: product.min_stock,
          shortage: Math.max(0, product.min_stock - product.current_stock),
          category_name: product.category_name,
          supplier_name: product.supplier_name,
          last_restocked: lastRestock?.created_at,
          suggested_order_quantity: product.suggested_order_quantity,
        });
      }

      return alerts.sort((a, b) => a.shortage - b.shortage);
    } catch (error) {
      console.error("Error fetching low stock alerts:", error);
      throw error;
    }
  }

  /**
   * Create inventory adjustment
   */
  async createInventoryAdjustment(
    adjustmentData: CreateInventoryAdjustment,
    userId: string
  ): Promise<InventoryAdjustment> {
    try {
      // Generate adjustment number
      const adjustmentNumber = await this.generateAdjustmentNumber();

      // Calculate total adjustment value
      let totalAdjustmentValue = 0;
      const processedItems = [];

      for (const item of adjustmentData.items) {
        // Get current product stock and cost
        const { data: product, error: productError } = await supabase
          .from("products")
          .select("stock, cost_price, price")
          .eq("id", item.product_id)
          .single();

        if (productError) throw productError;

        const quantityBefore = product.stock;
        const quantityChange = item.quantity_after - quantityBefore;
        const unitCost = item.unit_cost || product.cost_price || product.price;
        const adjustmentValue = Math.abs(quantityChange) * unitCost;

        totalAdjustmentValue += adjustmentValue;

        processedItems.push({
          product_id: item.product_id,
          quantity_before: quantityBefore,
          quantity_after: item.quantity_after,
          quantity_change: quantityChange,
          unit_cost: unitCost,
          adjustment_value: adjustmentValue,
          reason: item.reason,
          notes: item.notes,
        });
      }

      // Create the adjustment record
      const { data: adjustment, error: adjustmentError } = await supabase
        .from("inventory_adjustments")
        .insert([
          {
            adjustment_number: adjustmentNumber,
            branch_id: adjustmentData.branch_id,
            reason: adjustmentData.reason,
            notes: adjustmentData.notes,
            total_adjustment_value: totalAdjustmentValue,
            status: "pending",
            created_by: userId,
          },
        ])
        .select()
        .single();

      if (adjustmentError) throw adjustmentError;

      // Create adjustment items
      const itemsData = processedItems.map((item) => ({
        adjustment_id: adjustment.id,
        ...item,
      }));

      const { error: itemsError } = await supabase
        .from("inventory_adjustment_items")
        .insert(itemsData);

      if (itemsError) throw itemsError;

      return await this.getInventoryAdjustmentById(adjustment.id);
    } catch (error) {
      console.error("Error creating inventory adjustment:", error);
      throw error;
    }
  }

  /**
   * Approve inventory adjustment and apply changes
   */
  async approveInventoryAdjustment(adjustmentId: string, userId: string) {
    try {
      // Get the adjustment with items
      const adjustment = await this.getInventoryAdjustmentById(adjustmentId);

      if (!adjustment || adjustment.status !== "pending") {
        throw new Error("Adjustment not found or already processed");
      }

      // Apply stock changes and create stock movements
      for (const item of adjustment.items) {
        if (item.quantity_change !== 0) {
          // Update product stock
          const { error: updateError } = await supabase
            .from("products")
            .update({ stock: item.quantity_after })
            .eq("id", item.product_id);

          if (updateError) throw updateError;

          // Create stock movement
          // Get current product stock to calculate before/after quantities
          const { data: productData } = await supabase
            .from("products")
            .select("stock_quantity")
            .eq("id", item.product_id)
            .single();

          const quantityBefore = productData?.stock_quantity || 0;
          const quantityAfter = quantityBefore + item.quantity_change;

          await stockMovementService.createStockMovement(
            {
              product_id: item.product_id,
              movement_type: "adjustment",
              quantity_change: item.quantity_change,
              quantity_before: quantityBefore,
              quantity_after: quantityAfter,
              unit_cost: item.unit_cost,
              reference_type: "adjustment",
              reference_id: adjustmentId,
              reference_number: adjustment.adjustment_number,
              reason: item.reason || adjustment.reason,
              notes: item.notes,
              created_by: userId,
            }
          );
        }
      }

      // Update adjustment status
      const { data, error } = await supabase
        .from("inventory_adjustments")
        .update({
          status: "approved",
          approved_by: userId,
          approved_at: new Date().toISOString(),
        })
        .eq("id", adjustmentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error approving inventory adjustment:", error);
      throw error;
    }
  }

  /**
   * Get inventory value report by category
   */
  async getInventoryValueReport(
    branchId?: string
  ): Promise<InventoryValueReport> {
    try {
      let query = supabase
        .from("products")
        .select(
          `
          id, stock, cost_price, price,
          category:categories(id, name)
        `
        )
        .eq("is_trackable", true)
        .gt("stock", 0);

      if (branchId) {
        // If branch-specific inventory is implemented later
        // query = query.eq('branch_id', branchId);
      }

      const { data: products, error } = await query;
      if (error) throw error;

      const categoryData: Record<string, any> = {};
      let totalInventoryValue = 0;

      products.forEach((product: any) => {
        const categoryId = product.category?.id || "uncategorized";
        const categoryName = product.category?.name || "Uncategorized";
        const productValue =
          product.stock * (product.cost_price || product.price);

        if (!categoryData[categoryId]) {
          categoryData[categoryId] = {
            category_id: categoryId,
            category_name: categoryName,
            total_value: 0,
            product_count: 0,
          };
        }

        categoryData[categoryId].total_value += productValue;
        categoryData[categoryId].product_count++;
        totalInventoryValue += productValue;
      });

      // Calculate percentages
      const categories = Object.values(categoryData).map((cat: any) => ({
        ...cat,
        percentage:
          totalInventoryValue > 0
            ? (cat.total_value / totalInventoryValue) * 100
            : 0,
      }));

      return {
        categories: categories.sort(
          (a: any, b: any) => b.total_value - a.total_value
        ),
        total_inventory_value: totalInventoryValue,
      };
    } catch (error) {
      console.error("Error generating inventory value report:", error);
      throw error;
    }
  }

  /**
   * Get stock movement report for a period
   */
  async getStockMovementReport(
    dateFrom: string,
    dateTo: string,
    branchId?: string
  ): Promise<StockMovementReport> {
    try {
      const movements = await stockMovementService.getStockMovements({
        start_date: dateFrom,
        end_date: dateTo,
        ...(branchId && { branch_id: branchId }),
      });

      // Group by date and movement type
      const dailyData: Record<string, any> = {};
      let totalIn = 0,
        totalOut = 0,
        valueIn = 0,
        valueOut = 0;

      movements.data?.forEach((movement: any) => {
        const date = movement.created_at.split("T")[0];
        const key = `${date}_${movement.movement_type}`;

        if (!dailyData[key]) {
          dailyData[key] = {
            date,
            movement_type: movement.movement_type,
            total_movements: 0,
            total_value: 0,
          };
        }

        dailyData[key].total_movements++;
        dailyData[key].total_value += movement.total_value || 0;

        if (movement.quantity_change > 0) {
          totalIn += movement.quantity_change;
          valueIn += movement.total_value || 0;
        } else {
          totalOut += Math.abs(movement.quantity_change);
          valueOut += movement.total_value || 0;
        }
      });

      return {
        period: `${dateFrom} to ${dateTo}`,
        movements: Object.values(dailyData),
        summary: {
          total_in: totalIn,
          total_out: totalOut,
          net_change: totalIn - totalOut,
          value_in: valueIn,
          value_out: valueOut,
          net_value_change: valueIn - valueOut,
        },
      };
    } catch (error) {
      console.error("Error generating stock movement report:", error);
      throw error;
    }
  }

  /**
   * Get inventory adjustment by ID
   */
  private async getInventoryAdjustmentById(
    id: string
  ): Promise<InventoryAdjustment> {
    const { data, error } = await supabase
      .from("inventory_adjustments")
      .select(
        `
        *,
        branch:branches(id, name),
        created_by_user:user_profiles!inventory_adjustments_created_by_fkey(id, display_name),
        approved_by_user:user_profiles!inventory_adjustments_approved_by_fkey(id, display_name),
        items:inventory_adjustment_items(
          *,
          product:products(id, name, sku)
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as InventoryAdjustment;
  }

  /**
   * Generate unique adjustment number
   */
  private async generateAdjustmentNumber(): Promise<string> {
    try {
      const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
      const prefix = `ADJ-${today}`;

      const { data, error } = await supabase
        .from("inventory_adjustments")
        .select("adjustment_number")
        .like("adjustment_number", `${prefix}%`)
        .order("adjustment_number", { ascending: false })
        .limit(1);

      if (error) throw error;

      let sequence = 1;
      if (data && data.length > 0) {
        const lastNumber = data[0].adjustment_number;
        const lastSequence = parseInt(lastNumber.split("-")[2] || "0");
        sequence = lastSequence + 1;
      }

      return `${prefix}-${sequence.toString().padStart(4, "0")}`;
    } catch (error) {
      console.error("Error generating adjustment number:", error);
      return `ADJ-${Date.now()}`;
    }
  }
}

export const inventoryService = new InventoryService();
