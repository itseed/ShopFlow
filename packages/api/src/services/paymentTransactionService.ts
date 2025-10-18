import { supabase } from "../supabase";
import { Payment } from "@shopflow/types";
import {
  ApiResponse,
  createSuccessResponse,
  createErrorResponse,
  handleSupabaseError,
} from "../types/api";

export interface CreatePaymentTransactionData {
  order_id: string;
  transaction_type: "payment" | "refund" | "partial_refund";
  payment_method: "cash" | "card" | "bank_transfer" | "e_wallet" | "credit" | "points";
  amount: number;
  currency?: string;
  reference_number?: string;
  card_type?: string;
  card_last_four?: string;
  status?: "pending" | "completed" | "failed" | "cancelled";
  processed_by?: string;
  notes?: string;
  meta_data?: Record<string, any>;
}

class PaymentTransactionService {
  private tableName = "payment_transactions";

  async createPaymentTransaction(
    transactionData: CreatePaymentTransactionData
  ): Promise<ApiResponse<Payment>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert({
          ...transactionData,
          processed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return createErrorResponse(handleSupabaseError(error));
      }

      return createSuccessResponse(
        data,
        "Payment created successfully"
      );
    } catch (error) {
      return createErrorResponse(handleSupabaseError(error));
    }
  }
}

export const paymentTransactionService = new PaymentTransactionService();
export default paymentTransactionService;
