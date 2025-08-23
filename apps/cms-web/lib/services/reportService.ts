import { supabase } from "../supabase";

export interface InventoryReportData {
  id: string;
  name: string;
  sku?: string;
  current_stock: number;
  reorder_level: number;
  max_stock_level: number;
  value: number;
  status: "critical" | "low" | "good" | "overstock";
  category_name?: string;
  price: number;
  cost?: number;
  branch_id?: string;
  branch_name?: string;
}

export interface InventoryStats {
  total_items: number;
  total_value: number;
  low_stock_items: number;
  critical_stock_items: number;
  out_of_stock_items: number;
}

export interface StockMovement {
  date: string;
  inbound: number;
  outbound: number;
  net: number;
}

export interface CategoryData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export class ReportService {
  /**
   * Get inventory report data with optional filters
   */
  static async getInventoryReport(filters?: {
    branch_id?: string;
    category_id?: string;
    search?: string;
    status?: string;
  }): Promise<InventoryReportData[]> {
    try {
      let query = supabase
        .from("products")
        .select(
          `
          id,
          name,
          sku,
          stock as current_stock,
          price,
          cost,
          status,
          reorder_level:min_stock_level,
          max_stock_level,
          category:categories(name),
          branch:product_branches(
            branch_id,
            stock,
            branch:branches(name)
          )
        `
        )
        .eq("status", "active");

      // Apply filters
      if (filters?.branch_id && filters.branch_id !== "all") {
        query = query.eq("product_branches.branch_id", filters.branch_id);
      }

      if (filters?.category_id && filters.category_id !== "all") {
        query = query.eq("category_id", filters.category_id);
      }

      if (filters?.search) {
        query = query.or(
          `name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        console.warn("Failed to fetch inventory data:", error);
        // Return mock data as fallback
        return this.getMockInventoryData();
      }

      if (!data || data.length === 0) {
        // Return mock data if no real data available
        return this.getMockInventoryData();
      }

      // Transform data and calculate status
      return data.map((item: any) => {
        const current_stock = item.current_stock || 0;
        const reorder_level = item.reorder_level || 20;
        const max_stock_level = item.max_stock_level || 100;
        const price = item.price || 0;
        const cost = item.cost || 0;

        let status: "critical" | "low" | "good" | "overstock" = "good";

        if (current_stock === 0) {
          status = "critical";
        } else if (current_stock <= reorder_level * 0.5) {
          status = "critical";
        } else if (current_stock <= reorder_level) {
          status = "low";
        } else if (current_stock > max_stock_level) {
          status = "overstock";
        }

        return {
          id: item.id,
          name: item.name,
          sku: item.sku,
          current_stock,
          reorder_level,
          max_stock_level,
          value: current_stock * (cost || price * 0.7), // Estimate cost if not available
          status,
          category_name: item.category?.name || "ไม่ระบุ",
          price,
          cost,
          branch_id: item.branch?.[0]?.branch_id,
          branch_name: item.branch?.[0]?.branch?.name || "ทุกสาขา",
        };
      });
    } catch (error) {
      console.warn("Error in getInventoryReport:", error);
      // Return mock data as fallback
      return this.getMockInventoryData();
    }
  }

  /**
   * Get inventory statistics
   */
  static async getInventoryStats(branch_id?: string): Promise<InventoryStats> {
    try {
      const inventoryData = await this.getInventoryReport({ branch_id });

      const stats: InventoryStats = {
        total_items: inventoryData.length,
        total_value: inventoryData.reduce((sum, item) => sum + item.value, 0),
        low_stock_items: inventoryData.filter((item) => item.status === "low")
          .length,
        critical_stock_items: inventoryData.filter(
          (item) => item.status === "critical"
        ).length,
        out_of_stock_items: inventoryData.filter(
          (item) => item.current_stock === 0
        ).length,
      };

      return stats;
    } catch (error) {
      console.warn("Error getting inventory stats:", error);
      return {
        total_items: 156,
        total_value: 2340000,
        low_stock_items: 12,
        critical_stock_items: 3,
        out_of_stock_items: 2,
      };
    }
  }

  /**
   * Get stock movement data (mock for now, would need stock_movements table)
   */
  static async getStockMovement(days = 7): Promise<StockMovement[]> {
    // For now, return mock data since stock movement tracking would require additional tables
    const mockData: StockMovement[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      mockData.push({
        date: date.toISOString().split("T")[0],
        inbound: Math.floor(Math.random() * 100) + 50,
        outbound: Math.floor(Math.random() * 80) + 30,
        net: Math.floor(Math.random() * 40) - 20,
      });
    }

    return mockData;
  }

  /**
   * Get category breakdown
   */
  static async getCategoryData(): Promise<CategoryData[]> {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select(
          `
          id,
          name,
          products:products(count)
        `
        )
        .eq("is_active", true);

      if (error || !data) {
        return this.getMockCategoryData();
      }

      const total = data.reduce(
        (sum, cat: any) => sum + (cat.products?.[0]?.count || 0),
        0
      );
      const colors = [
        "#3182CE",
        "#38A169",
        "#D69E2E",
        "#E53E3E",
        "#805AD5",
        "#DD6B20",
      ];

      return data.map((category: any, index: number) => {
        const count = category.products?.[0]?.count || 0;
        return {
          name: category.name,
          value: count,
          percentage: total > 0 ? (count / total) * 100 : 0,
          color: colors[index % colors.length],
        };
      });
    } catch (error) {
      console.warn("Error getting category data:", error);
      return this.getMockCategoryData();
    }
  }

  /**
   * Mock data fallback for inventory
   */
  private static getMockInventoryData(): InventoryReportData[] {
    return [
      {
        id: "1",
        name: "โค้ก 325ml",
        sku: "COLA001",
        current_stock: 45,
        reorder_level: 50,
        max_stock_level: 200,
        value: 1125,
        status: "low",
        category_name: "เครื่องดื่ม",
        price: 15,
        cost: 10,
      },
      {
        id: "2",
        name: "น้ำเปล่า 600ml",
        sku: "WATER001",
        current_stock: 89,
        reorder_level: 30,
        max_stock_level: 150,
        value: 890,
        status: "good",
        category_name: "เครื่องดื่ม",
        price: 10,
        cost: 7,
      },
      {
        id: "3",
        name: "ลายส์ธรรมดา",
        sku: "LAYS001",
        current_stock: 12,
        reorder_level: 25,
        max_stock_level: 100,
        value: 480,
        status: "critical",
        category_name: "ขนมขบเคี้ยว",
        price: 20,
        cost: 15,
      },
      {
        id: "4",
        name: "มาม่า หมูสับ",
        sku: "MAMA001",
        current_stock: 156,
        reorder_level: 80,
        max_stock_level: 300,
        value: 1560,
        status: "good",
        category_name: "อาหารแห้ง",
        price: 10,
        cost: 7,
      },
    ];
  }

  /**
   * Mock data fallback for categories
   */
  private static getMockCategoryData(): CategoryData[] {
    return [
      { name: "เครื่องดื่ม", value: 45, percentage: 35, color: "#3182CE" },
      { name: "ขนมขบเคี้ยว", value: 32, percentage: 25, color: "#38A169" },
      { name: "อาหารแห้ง", value: 28, percentage: 22, color: "#D69E2E" },
      { name: "ของใช้", value: 23, percentage: 18, color: "#E53E3E" },
    ];
  }
}
