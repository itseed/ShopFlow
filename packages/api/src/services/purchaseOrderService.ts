import { supabase } from "../supabase";
import {
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseOrderFormData,
  CreatePurchaseOrderItem,
  PurchaseOrderFilters,
  PurchaseOrderStatus,
  UpdatePurchaseOrderStatus,
  ReceivePurchaseOrderItem,
} from "@shopflow/types";
import { stockMovementService } from "./stockMovementService";

export class PurchaseOrderService {
  /**
   * Get all purchase orders with optional filtering
   */
  async getPurchaseOrders(filters: PurchaseOrderFilters = {}) {
    try {
      let query = supabase
        .from("purchase_orders")
        .select(
          `
          *,
          supplier:suppliers(id, name, supplier_code),
          branch:branches(id, name),
          created_by_user:user_profiles!purchase_orders_created_by_fkey(id, display_name),
          items:purchase_order_items(
            *,
            product:products(id, name, sku)
          )
        `
        )
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.supplier_id) {
        query = query.eq("supplier_id", filters.supplier_id);
      }

      if (filters.branch_id) {
        query = query.eq("branch_id", filters.branch_id);
      }

      if (filters.created_by) {
        query = query.eq("created_by", filters.created_by);
      }

      if (filters.date_from) {
        query = query.gte("order_date", filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte("order_date", filters.date_to);
      }

      if (filters.po_number) {
        query = query.ilike("po_number", `%${filters.po_number}%`);
      }

      if (filters.search) {
        query = query.or(
          `po_number.ilike.%${filters.search}%,suppliers.name.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as PurchaseOrder[];
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      throw error;
    }
  }

  /**
   * Get a single purchase order by ID
   */
  async getPurchaseOrderById(id: string) {
    try {
      const { data, error } = await supabase
        .from("purchase_orders")
        .select(
          `
          *,
          supplier:suppliers(id, name, supplier_code, contact_person, email, phone),
          branch:branches(id, name),
          created_by_user:user_profiles!purchase_orders_created_by_fkey(id, display_name),
          items:purchase_order_items(
            *,
            product:products(id, name, sku, unit, cost_price)
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as PurchaseOrder;
    } catch (error) {
      console.error("Error fetching purchase order:", error);
      throw error;
    }
  }

  /**
   * Create a new purchase order
   */
  async createPurchaseOrder(orderData: PurchaseOrderFormData, userId: string) {
    try {
      // Generate PO number
      const poNumber = await this.generatePONumber();

      // Calculate totals
      let subtotal = 0;
      const itemsWithTotals = orderData.items.map((item) => {
        const total = item.quantity_ordered * item.unit_cost;
        subtotal += total;
        return {
          ...item,
          total_cost: total,
        };
      });

      const tax = subtotal * 0.07; // 7% VAT (configurable)
      const total = subtotal + tax + 0; // No shipping cost by default

      // Create purchase order
      const { data: purchaseOrder, error: orderError } = await supabase
        .from("purchase_orders")
        .insert([
          {
            po_number: poNumber,
            supplier_id: orderData.supplier_id,
            branch_id: orderData.branch_id,
            subtotal,
            tax,
            shipping_cost: 0,
            total,
            order_date: new Date().toISOString().split("T")[0],
            expected_date: orderData.expected_date,
            notes: orderData.notes,
            status: "draft" as PurchaseOrderStatus,
            created_by: userId,
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create purchase order items
      const itemsData = itemsWithTotals.map((item) => ({
        purchase_order_id: purchaseOrder.id,
        product_id: item.product_id,
        quantity_ordered: item.quantity_ordered,
        quantity_received: 0,
        unit_cost: item.unit_cost,
        total_cost: item.total_cost,
        notes: item.notes,
      }));

      const { error: itemsError } = await supabase
        .from("purchase_order_items")
        .insert(itemsData);

      if (itemsError) throw itemsError;

      return await this.getPurchaseOrderById(purchaseOrder.id);
    } catch (error) {
      console.error("Error creating purchase order:", error);
      throw error;
    }
  }

  /**
   * Update purchase order status
   */
  async updatePurchaseOrderStatus(
    updateData: UpdatePurchaseOrderStatus,
    userId: string
  ) {
    try {
      const updateFields: any = {
        status: updateData.status,
        updated_at: new Date().toISOString(),
      };

      if (updateData.notes) {
        updateFields.notes = updateData.notes;
      }

      if (updateData.received_date) {
        updateFields.received_date = updateData.received_date;
      }

      const { data, error } = await supabase
        .from("purchase_orders")
        .update(updateFields)
        .eq("id", updateData.purchase_order_id)
        .select()
        .single();

      if (error) throw error;
      return data as PurchaseOrder;
    } catch (error) {
      console.error("Error updating purchase order status:", error);
      throw error;
    }
  }

  /**
   * Receive items for a purchase order
   */
  async receiveItems(
    purchaseOrderId: string,
    receivedItems: ReceivePurchaseOrderItem[],
    userId: string
  ) {
    try {
      const results = [];

      for (const item of receivedItems) {
        // Update the purchase order item
        const { data: updatedItem, error: updateError } = await supabase
          .from("purchase_order_items")
          .update({
            quantity_received: item.quantity_received,
            unit_cost: item.actual_unit_cost || undefined,
            notes: item.notes,
          })
          .eq("id", item.purchase_order_item_id)
          .select(
            `
            *,
            product:products(id, name, sku)
          `
          )
          .single();

        if (updateError) throw updateError;

        // Create stock movement for received items
        if (item.quantity_received > 0) {
          // Get current product stock to calculate before/after quantities
          const { data: productData } = await supabase
            .from("products")
            .select("stock_quantity")
            .eq("id", updatedItem.product_id)
            .single();

          const quantityBefore = productData?.stock_quantity || 0;
          const quantityAfter = quantityBefore + item.quantity_received;

          await stockMovementService.createStockMovement(
            {
              product_id: updatedItem.product_id,
              movement_type: "purchase",
              quantity_change: item.quantity_received,
              quantity_before: quantityBefore,
              quantity_after: quantityAfter,
              unit_cost: item.actual_unit_cost || updatedItem.unit_cost,
              reference_type: "purchase_order",
              reference_id: purchaseOrderId,
              reason: "Purchase order receipt",
              notes: item.notes,
              created_by: userId,
            }
          );
        }

        results.push(updatedItem);
      }

      // Check if all items are fully received and update PO status
      const { data: allItems, error: itemsError } = await supabase
        .from("purchase_order_items")
        .select("quantity_ordered, quantity_received")
        .eq("purchase_order_id", purchaseOrderId);

      if (itemsError) throw itemsError;

      const totalOrdered = allItems.reduce(
        (sum, item) => sum + item.quantity_ordered,
        0
      );
      const totalReceived = allItems.reduce(
        (sum, item) => sum + item.quantity_received,
        0
      );

      let newStatus: PurchaseOrderStatus;
      if (totalReceived === 0) {
        newStatus = "confirmed";
      } else if (totalReceived >= totalOrdered) {
        newStatus = "completed";
      } else {
        newStatus = "partial";
      }

      // Update PO status
      await this.updatePurchaseOrderStatus(
        {
          purchase_order_id: purchaseOrderId,
          status: newStatus,
          received_date:
            newStatus === "completed"
              ? new Date().toISOString().split("T")[0]
              : undefined,
        },
        userId
      );

      return results;
    } catch (error) {
      console.error("Error receiving purchase order items:", error);
      throw error;
    }
  }

  /**
   * Delete a purchase order (only if status is draft)
   */
  async deletePurchaseOrder(id: string) {
    try {
      // Check if PO can be deleted
      const { data: po, error: fetchError } = await supabase
        .from("purchase_orders")
        .select("status")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;
      if (po.status !== "draft") {
        throw new Error("Only draft purchase orders can be deleted");
      }

      // Delete items first (cascade should handle this, but being explicit)
      const { error: itemsError } = await supabase
        .from("purchase_order_items")
        .delete()
        .eq("purchase_order_id", id);

      if (itemsError) throw itemsError;

      // Delete the purchase order
      const { error: deleteError } = await supabase
        .from("purchase_orders")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;
      return true;
    } catch (error) {
      console.error("Error deleting purchase order:", error);
      throw error;
    }
  }

  /**
   * Get purchase order summary statistics
   */
  async getPurchaseOrderSummary(
    dateFrom?: string,
    dateTo?: string,
    supplierId?: string
  ) {
    try {
      let query = supabase
        .from("purchase_orders")
        .select("status, total, created_at");

      if (dateFrom) {
        query = query.gte("order_date", dateFrom);
      }

      if (dateTo) {
        query = query.lte("order_date", dateTo);
      }

      if (supplierId) {
        query = query.eq("supplier_id", supplierId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const summary = data.reduce(
        (acc: any, po) => {
          acc.total_count++;
          acc.total_value += po.total;
          acc.status_counts[po.status] =
            (acc.status_counts[po.status] || 0) + 1;
          return acc;
        },
        {
          total_count: 0,
          total_value: 0,
          status_counts: {},
        }
      );

      return summary;
    } catch (error) {
      console.error("Error fetching purchase order summary:", error);
      throw error;
    }
  }

  /**
   * Get top suppliers by purchase volume
   */
  async getTopSuppliersByVolume(
    limit: number = 10,
    dateFrom?: string,
    dateTo?: string
  ) {
    try {
      let query = supabase
        .from("purchase_orders")
        .select(
          `
          supplier_id,
          total,
          supplier:suppliers(name, supplier_code)
        `
        )
        .eq("status", "completed");

      if (dateFrom) {
        query = query.gte("order_date", dateFrom);
      }

      if (dateTo) {
        query = query.lte("order_date", dateTo);
      }

      const { data, error } = await query;
      if (error) throw error;

      const supplierTotals = data.reduce((acc: any, po: any) => {
        if (!acc[po.supplier_id]) {
          acc[po.supplier_id] = {
            supplier_id: po.supplier_id,
            supplier_name: po.supplier.name,
            supplier_code: po.supplier.supplier_code,
            total_orders: 0,
            total_value: 0,
          };
        }

        acc[po.supplier_id].total_orders++;
        acc[po.supplier_id].total_value += po.total;

        return acc;
      }, {});

      return Object.values(supplierTotals)
        .sort((a: any, b: any) => b.total_value - a.total_value)
        .slice(0, limit);
    } catch (error) {
      console.error("Error fetching top suppliers:", error);
      throw error;
    }
  }

  /**
   * Generate a unique PO number
   */
  private async generatePONumber(): Promise<string> {
    try {
      const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
      const prefix = `PO-${today}`;

      // Get the latest PO number for today
      const { data, error } = await supabase
        .from("purchase_orders")
        .select("po_number")
        .like("po_number", `${prefix}%`)
        .order("po_number", { ascending: false })
        .limit(1);

      if (error) throw error;

      let sequence = 1;
      if (data && data.length > 0) {
        const lastNumber = data[0].po_number;
        const lastSequence = parseInt(lastNumber.split("-")[2] || "0");
        sequence = lastSequence + 1;
      }

      return `${prefix}-${sequence.toString().padStart(4, "0")}`;
    } catch (error) {
      console.error("Error generating PO number:", error);
      // Fallback to timestamp-based number
      return `PO-${Date.now()}`;
    }
  }

  /**
   * Get purchase orders that need attention (overdue, etc.)
   */
  async getPurchaseOrdersNeedingAttention() {
    try {
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("purchase_orders")
        .select(
          `
          *,
          supplier:suppliers(name)
        `
        )
        .in("status", ["sent", "confirmed", "partial"])
        .or(`expected_date.lt.${today},expected_date.is.null`)
        .order("expected_date", { ascending: true });

      if (error) throw error;
      return data as PurchaseOrder[];
    } catch (error) {
      console.error("Error fetching purchase orders needing attention:", error);
      throw error;
    }
  }
}

export const purchaseOrderService = new PurchaseOrderService();
