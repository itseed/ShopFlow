// Supabase Database Types
export interface Database {
  public: {
    Tables: {
      branches: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          phone: string | null;
          email: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          sku: string | null;
          name: string;
          description: string | null;
          price: number;
          discount_price: number | null;
          stock: number;
          min_stock: number;
          category_id: string | null;
          status: "active" | "inactive" | "out_of_stock";
          images: string[] | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          sku?: string | null;
          name: string;
          description?: string | null;
          price: number;
          discount_price?: number | null;
          stock?: number;
          min_stock?: number;
          category_id?: string | null;
          status?: "active" | "inactive" | "out_of_stock";
          images?: string[] | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          sku?: string | null;
          name?: string;
          description?: string | null;
          price?: number;
          discount_price?: number | null;
          stock?: number;
          min_stock?: number;
          category_id?: string | null;
          status?: "active" | "inactive" | "out_of_stock";
          images?: string[] | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_name: string | null;
          customer_phone: string | null;
          subtotal: number;
          tax: number;
          total: number;
          payment_method: "cash" | "card" | "bank_transfer" | "e_wallet";
          status: "pending" | "processing" | "completed" | "cancelled";
          branch_id: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number?: string;
          customer_name?: string | null;
          customer_phone?: string | null;
          subtotal: number;
          tax?: number;
          total: number;
          payment_method?: "cash" | "card" | "bank_transfer" | "e_wallet";
          status?: "pending" | "processing" | "completed" | "cancelled";
          branch_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          customer_name?: string | null;
          customer_phone?: string | null;
          subtotal?: number;
          tax?: number;
          total?: number;
          payment_method?: "cash" | "card" | "bank_transfer" | "e_wallet";
          status?: "pending" | "processing" | "completed" | "cancelled";
          branch_id?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          quantity: number;
          unit_price: number;
          total_price: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_name: string;
          quantity: number;
          unit_price: number;
          total_price: number;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          product_name?: string;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          display_name: string;
          role: "admin" | "staff";
          branch_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          role: "admin" | "staff";
          branch_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          role?: "admin" | "staff";
          branch_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
