import { supabase } from "./supabase";
import { Product } from "@shopflow/types";

export interface ProductFormData {
  name: string;
  price: number;
  description?: string;
  category?: string;
  imageUrl?: string;
  stock?: number;
  isActive?: boolean;
}

export class ProductService {
  static async getProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching products:", error);
      throw new Error("ไม่สามารถโหลดข้อมูลสินค้าได้");
    }
  }

  static async getProduct(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching product:", error);
      throw new Error("ไม่สามารถโหลดข้อมูลสินค้าได้");
    }
  }

  static async createProduct(productData: ProductFormData): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from("products")
        .insert([
          {
            ...productData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error creating product:", error);
      throw new Error("ไม่สามารถสร้างสินค้าได้");
    }
  }

  static async updateProduct(
    id: string,
    productData: Partial<ProductFormData>
  ): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from("products")
        .update({
          ...productData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating product:", error);
      throw new Error("ไม่สามารถอัพเดตสินค้าได้");
    }
  }

  static async deleteProduct(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw new Error("ไม่สามารถลบสินค้าได้");
    }
  }

  static async searchProducts(query: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error searching products:", error);
      throw new Error("ไม่สามารถค้นหาสินค้าได้");
    }
  }
}

// Helper function for error handling
export function handleSupabaseError(error: any): string {
  if (error?.message) {
    // Translate common Supabase errors to Thai
    switch (error.code) {
      case "23505":
        return "ข้อมูลนี้มีอยู่แล้วในระบบ";
      case "23503":
        return "ไม่สามารถลบข้อมูลนี้ได้ เนื่องจากมีข้อมูลอื่นที่เกี่ยวข้อง";
      case "PGRST116":
        return "ไม่พบข้อมูลที่ต้องการ";
      default:
        return error.message;
    }
  }
  return "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
}
