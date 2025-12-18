// Supabase Database Types (Enhanced Schema)
export interface Database {
  public: {
    Tables: {
      branches: {
        Row: {
          id: string;
          name: string;
          code: string;
          address: string | null;
          phone: string | null;
          email: string | null;
          manager_name: string | null;
          is_active: boolean;
          business_hours: Record<string, any> | null;
          settings: Record<string, any> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          manager_name?: string | null;
          is_active?: boolean;
          business_hours?: Record<string, any> | null;
          settings?: Record<string, any> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          manager_name?: string | null;
          is_active?: boolean;
          business_hours?: Record<string, any> | null;
          settings?: Record<string, any> | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          parent_id: string | null;
          display_order: number;
          is_active: boolean;
          image_url: string | null;
          icon: string | null;
          path: string | null;
          level: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          parent_id?: string | null;
          display_order?: number;
          is_active?: boolean;
          image_url?: string | null;
          icon?: string | null;
          path?: string | null;
          level?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          parent_id?: string | null;
          display_order?: number;
          is_active?: boolean;
          image_url?: string | null;
          icon?: string | null;
          path?: string | null;
          level?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          sku: string | null;
          barcode: string | null;
          name: string;
          description: string | null;
          short_description: string | null;
          price: number;
          cost_price: number | null;
          discount_price: number | null;
          stock: number;
          min_stock: number;
          max_stock: number | null;
          unit: string;
          weight: number | null;
          dimensions: Record<string, any> | null;
          category_id: string | null;
          supplier_id: string | null;
          brand: string | null;
          status: "active" | "inactive" | "out_of_stock" | "discontinued";
          images: string[] | null;
          tags: string[] | null;
          meta_data: Record<string, any> | null;
          is_featured: boolean;
          is_trackable: boolean;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          sku?: string | null;
          barcode?: string | null;
          name: string;
          description?: string | null;
          short_description?: string | null;
          price: number;
          cost_price?: number | null;
          discount_price?: number | null;
          stock?: number;
          min_stock?: number;
          max_stock?: number | null;
          unit?: string;
          weight?: number | null;
          dimensions?: Record<string, any> | null;
          category_id?: string | null;
          supplier_id?: string | null;
          brand?: string | null;
          status?: "active" | "inactive" | "out_of_stock" | "discontinued";
          images?: string[] | null;
          tags?: string[] | null;
          meta_data?: Record<string, any> | null;
          is_featured?: boolean;
          is_trackable?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          sku?: string | null;
          barcode?: string | null;
          name?: string;
          description?: string | null;
          short_description?: string | null;
          price?: number;
          cost_price?: number | null;
          discount_price?: number | null;
          stock?: number;
          min_stock?: number;
          max_stock?: number | null;
          unit?: string;
          weight?: number | null;
          dimensions?: Record<string, any> | null;
          category_id?: string | null;
          supplier_id?: string | null;
          brand?: string | null;
          status?: "active" | "inactive" | "out_of_stock" | "discontinued";
          images?: string[] | null;
          tags?: string[] | null;
          meta_data?: Record<string, any> | null;
          is_featured?: boolean;
          is_trackable?: boolean;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
      };
      customers: {
        Row: {
          id: string;
          customer_code: string | null;
          first_name: string | null;
          last_name: string | null;
          company_name: string | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          city: string | null;
          postal_code: string | null;
          country: string;
          customer_type: "individual" | "business";
          status: "active" | "inactive" | "vip";
          credit_limit: number;
          current_balance: number;
          total_orders: number;
          total_spent: number;
          last_order_date: string | null;
          loyalty_points: number;
          preferred_branch_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          customer_code?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          company_name?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          country?: string;
          customer_type?: "individual" | "business";
          status?: "active" | "inactive" | "vip";
          credit_limit?: number;
          current_balance?: number;
          total_orders?: number;
          total_spent?: number;
          last_order_date?: string | null;
          loyalty_points?: number;
          preferred_branch_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          customer_code?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          company_name?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          country?: string;
          customer_type?: "individual" | "business";
          status?: "active" | "inactive" | "vip";
          credit_limit?: number;
          current_balance?: number;
          total_orders?: number;
          total_spent?: number;
          last_order_date?: string | null;
          loyalty_points?: number;
          preferred_branch_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
      };
      suppliers: {
        Row: {
          id: string;
          supplier_code: string | null;
          name: string;
          contact_person: string | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          city: string | null;
          postal_code: string | null;
          country: string;
          tax_id: string | null;
          payment_terms: string | null;
          credit_limit: number;
          current_balance: number;
          status: "active" | "inactive" | "suspended";
          rating: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          supplier_code?: string | null;
          name: string;
          contact_person?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          country?: string;
          tax_id?: string | null;
          payment_terms?: string | null;
          credit_limit?: number;
          current_balance?: number;
          status?: "active" | "inactive" | "suspended";
          rating?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          supplier_code?: string | null;
          name?: string;
          contact_person?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          country?: string;
          tax_id?: string | null;
          payment_terms?: string | null;
          credit_limit?: number;
          current_balance?: number;
          status?: "active" | "inactive" | "suspended";
          rating?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_id: string | null;
          customer_name: string | null;
          customer_phone: string | null;
          customer_email: string | null;
          customer_type:
            | "registered"
            | "walk_in"
            | "phone_order"
            | "repeat_customer";
          shop_name: string | null;
          shop_type:
            | "convenience_store"
            | "grocery_store"
            | "mini_mart"
            | "supermarket"
            | "restaurant"
            | "other"
            | null;
          subtotal: number;
          discount_amount: number;
          tax: number;
          delivery_fee: number;
          total: number;
          payment_method:
            | "cash"
            | "card"
            | "bank_transfer"
            | "e_wallet"
            | "credit";
          payment_status:
            | "pending"
            | "paid"
            | "partial"
            | "overdue"
            | "refunded";
          status:
            | "pending"
            | "confirmed"
            | "processing"
            | "ready"
            | "delivering"
            | "completed"
            | "cancelled"
            | "refunded";
          priority: "low" | "normal" | "high" | "urgent";
          delivery_method: "pickup" | "delivery" | "shipping";
          delivery_address: string | null;
          delivery_date: string | null;
          delivered_at: string | null;
          branch_id: string | null;
          sales_rep: string | null;
          cashier_id: string | null;
          notes: string | null;
          internal_notes: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          order_number?: string;
          customer_id?: string | null;
          customer_name?: string | null;
          customer_phone?: string | null;
          customer_email?: string | null;
          customer_type?:
            | "registered"
            | "walk_in"
            | "phone_order"
            | "repeat_customer";
          shop_name?: string | null;
          shop_type?:
            | "convenience_store"
            | "grocery_store"
            | "mini_mart"
            | "supermarket"
            | "restaurant"
            | "other"
            | null;
          subtotal: number;
          discount_amount?: number;
          tax?: number;
          delivery_fee?: number;
          total: number;
          payment_method?:
            | "cash"
            | "card"
            | "bank_transfer"
            | "e_wallet"
            | "credit";
          payment_status?:
            | "pending"
            | "paid"
            | "partial"
            | "overdue"
            | "refunded";
          status?:
            | "pending"
            | "confirmed"
            | "processing"
            | "ready"
            | "delivering"
            | "completed"
            | "cancelled"
            | "refunded";
          priority?: "low" | "normal" | "high" | "urgent";
          delivery_method?: "pickup" | "delivery" | "shipping";
          delivery_address?: string | null;
          delivery_date?: string | null;
          delivered_at?: string | null;
          branch_id?: string | null;
          sales_rep?: string | null;
          cashier_id?: string | null;
          notes?: string | null;
          internal_notes?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          order_number?: string;
          customer_id?: string | null;
          customer_name?: string | null;
          customer_phone?: string | null;
          customer_email?: string | null;
          customer_type?:
            | "registered"
            | "walk_in"
            | "phone_order"
            | "repeat_customer";
          shop_name?: string | null;
          shop_type?:
            | "convenience_store"
            | "grocery_store"
            | "mini_mart"
            | "supermarket"
            | "restaurant"
            | "other"
            | null;
          subtotal?: number;
          discount_amount?: number;
          tax?: number;
          delivery_fee?: number;
          total?: number;
          payment_method?:
            | "cash"
            | "card"
            | "bank_transfer"
            | "e_wallet"
            | "credit";
          payment_status?:
            | "pending"
            | "paid"
            | "partial"
            | "overdue"
            | "refunded";
          status?:
            | "pending"
            | "confirmed"
            | "processing"
            | "ready"
            | "delivering"
            | "completed"
            | "cancelled"
            | "refunded";
          priority?: "low" | "normal" | "high" | "urgent";
          delivery_method?: "pickup" | "delivery" | "shipping";
          delivery_address?: string | null;
          delivery_date?: string | null;
          delivered_at?: string | null;
          branch_id?: string | null;
          sales_rep?: string | null;
          cashier_id?: string | null;
          notes?: string | null;
          internal_notes?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_sku: string | null;
          product_name: string;
          product_description: string | null;
          variant_info: Record<string, any> | null;
          quantity: number;
          unit_price: number;
          discount_amount: number;
          total_price: number;
          cost_price: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_sku?: string | null;
          product_name: string;
          product_description?: string | null;
          variant_info?: Record<string, any> | null;
          quantity: number;
          unit_price: number;
          discount_amount?: number;
          total_price: number;
          cost_price?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          product_sku?: string | null;
          product_name?: string;
          product_description?: string | null;
          variant_info?: Record<string, any> | null;
          quantity?: number;
          unit_price?: number;
          discount_amount?: number;
          total_price?: number;
          cost_price?: number | null;
          created_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          display_name: string;
          first_name: string | null;
          last_name: string | null;
          email: string | null;
          phone: string | null;
          role: "admin" | "manager" | "staff" | "cashier";
          branch_id: string | null;
          permissions: Record<string, any> | null;
          is_active: boolean;
          last_login: string | null;
          settings: Record<string, any> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          phone?: string | null;
          role: "admin" | "manager" | "staff" | "cashier";
          branch_id?: string | null;
          permissions?: Record<string, any> | null;
          is_active?: boolean;
          last_login?: string | null;
          settings?: Record<string, any> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          phone?: string | null;
          role?: "admin" | "manager" | "staff" | "cashier";
          branch_id?: string | null;
          permissions?: Record<string, any> | null;
          is_active?: boolean;
          last_login?: string | null;
          settings?: Record<string, any> | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      stock_movements: {
        Row: {
          id: string;
          product_id: string;
          movement_type:
            | "sale"
            | "purchase"
            | "adjustment"
            | "return"
            | "transfer"
            | "waste"
            | "initial";
          quantity_change: number;
          quantity_before: number;
          quantity_after: number;
          unit_cost: number | null;
          total_value: number | null;
          reference_type:
            | "order"
            | "purchase_order"
            | "adjustment"
            | "transfer"
            | null;
          reference_id: string | null;
          reference_number: string | null;
          reason: string | null;
          notes: string | null;
          branch_id: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          movement_type:
            | "sale"
            | "purchase"
            | "adjustment"
            | "return"
            | "transfer"
            | "waste"
            | "initial";
          quantity_change: number;
          quantity_before: number;
          quantity_after: number;
          unit_cost?: number | null;
          total_value?: number | null;
          reference_type?:
            | "order"
            | "purchase_order"
            | "adjustment"
            | "transfer"
            | null;
          reference_id?: string | null;
          reference_number?: string | null;
          reason?: string | null;
          notes?: string | null;
          branch_id?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          movement_type?:
            | "sale"
            | "purchase"
            | "adjustment"
            | "return"
            | "transfer"
            | "waste"
            | "initial";
          quantity_change?: number;
          quantity_before?: number;
          quantity_after?: number;
          unit_cost?: number | null;
          total_value?: number | null;
          reference_type?:
            | "order"
            | "purchase_order"
            | "adjustment"
            | "transfer"
            | null;
          reference_id?: string | null;
          reference_number?: string | null;
          reason?: string | null;
          notes?: string | null;
          branch_id?: string | null;
          created_by?: string;
          created_at?: string;
        };
      };
      purchase_orders: {
        Row: {
          id: string;
          po_number: string;
          supplier_id: string;
          branch_id: string | null;
          status:
            | "draft"
            | "sent"
            | "confirmed"
            | "partial"
            | "completed"
            | "cancelled";
          subtotal: number;
          tax: number;
          shipping_cost: number;
          total: number;
          order_date: string;
          expected_date: string | null;
          received_date: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          po_number: string;
          supplier_id: string;
          branch_id?: string | null;
          status?:
            | "draft"
            | "sent"
            | "confirmed"
            | "partial"
            | "completed"
            | "cancelled";
          subtotal?: number;
          tax?: number;
          shipping_cost?: number;
          total?: number;
          order_date?: string;
          expected_date?: string | null;
          received_date?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by: string;
        };
        Update: {
          id?: string;
          po_number?: string;
          supplier_id?: string;
          branch_id?: string | null;
          status?:
            | "draft"
            | "sent"
            | "confirmed"
            | "partial"
            | "completed"
            | "cancelled";
          subtotal?: number;
          tax?: number;
          shipping_cost?: number;
          total?: number;
          order_date?: string;
          expected_date?: string | null;
          received_date?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string;
        };
      };
      purchase_order_items: {
        Row: {
          id: string;
          purchase_order_id: string;
          product_id: string;
          quantity_ordered: number;
          quantity_received: number;
          unit_cost: number;
          total_cost: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          purchase_order_id: string;
          product_id: string;
          quantity_ordered: number;
          quantity_received?: number;
          unit_cost: number;
          total_cost: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          purchase_order_id?: string;
          product_id?: string;
          quantity_ordered?: number;
          quantity_received?: number;
          unit_cost?: number;
          total_cost?: number;
          created_at?: string;
        };
      };
      system_settings: {
        Row: {
          id: string;
          key: string;
          value: Record<string, any> | string | number | boolean;
          description: string | null;
          type: "string" | "number" | "boolean" | "json";
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: Record<string, any> | string | number | boolean;
          description?: string | null;
          type?: "string" | "number" | "boolean" | "json";
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: Record<string, any> | string | number | boolean;
          description?: string | null;
          type?: "string" | "number" | "boolean" | "json";
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      branch_settings: {
        Row: {
          id: string;
          branch_id: string;
          business_info: Record<string, any> | null;
          pricing_config: Record<string, any> | null;
          inventory_config: Record<string, any> | null;
          printer_config: Record<string, any> | null;
          loyalty_config: Record<string, any> | null;
          payment_config: Record<string, any> | null;
          permissions: Record<string, any> | null;
          pos_display_settings: Record<string, any> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          branch_id: string;
          business_info?: Record<string, any> | null;
          pricing_config?: Record<string, any> | null;
          inventory_config?: Record<string, any> | null;
          printer_config?: Record<string, any> | null;
          loyalty_config?: Record<string, any> | null;
          payment_config?: Record<string, any> | null;
          permissions?: Record<string, any> | null;
          pos_display_settings?: Record<string, any> | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          branch_id?: string;
          business_info?: Record<string, any> | null;
          pricing_config?: Record<string, any> | null;
          inventory_config?: Record<string, any> | null;
          printer_config?: Record<string, any> | null;
          loyalty_config?: Record<string, any> | null;
          payment_config?: Record<string, any> | null;
          permissions?: Record<string, any> | null;
          pos_display_settings?: Record<string, any> | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      payment_transactions: {
        Row: {
          id: string;
          order_id: string;
          transaction_type: "payment" | "refund" | "partial_refund";
          payment_method:
            | "cash"
            | "card"
            | "bank_transfer"
            | "e_wallet"
            | "credit"
            | "points";
          amount: number;
          currency: string | null;
          reference_number: string | null;
          card_type: string | null;
          card_last_four: string | null;
          status: "pending" | "completed" | "failed" | "cancelled";
          processed_by: string | null;
          processed_at: string;
          notes: string | null;
          meta_data: Record<string, any> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          transaction_type: "payment" | "refund" | "partial_refund";
          payment_method:
            | "cash"
            | "card"
            | "bank_transfer"
            | "e_wallet"
            | "credit"
            | "points";
          amount: number;
          currency?: string | null;
          reference_number?: string | null;
          card_type?: string | null;
          card_last_four?: string | null;
          status?: "pending" | "completed" | "failed" | "cancelled";
          processed_by?: string | null;
          processed_at?: string;
          notes?: string | null;
          meta_data?: Record<string, any> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          transaction_type?: "payment" | "refund" | "partial_refund";
          payment_method?:
            | "cash"
            | "card"
            | "bank_transfer"
            | "e_wallet"
            | "credit"
            | "points";
          amount?: number;
          currency?: string | null;
          reference_number?: string | null;
          card_type?: string | null;
          card_last_four?: string | null;
          status?: "pending" | "completed" | "failed" | "cancelled";
          processed_by?: string | null;
          processed_at?: string;
          notes?: string | null;
          meta_data?: Record<string, any> | null;
          created_at?: string;
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
