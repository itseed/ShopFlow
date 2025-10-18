import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// Direct Supabase connection for testing
const supabaseUrl = "http://localhost:8000";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    console.log("Testing reports API directly...");

    // Test direct database query
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    console.log("Querying orders from:", thirtyDaysAgo.toISOString());

    const { data: orders, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        total,
        payment_method,
        status,
        created_at,
        items:order_items(
          quantity,
          unit_price,
          total_price
        )
      `
      )
      .gte("created_at", thirtyDaysAgo.toISOString())
      .eq("status", "completed")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({
        success: false,
        message: "Database query failed",
        error: error.message,
        details: error,
      });
    }

    console.log("Found orders:", orders?.length || 0);

    // Group by date
    const salesByDate = new Map<string, { orders: number; revenue: number }>();

    orders?.forEach((order) => {
      const date = new Date(order.created_at).toISOString().split("T")[0];
      if (!salesByDate.has(date)) {
        salesByDate.set(date, { orders: 0, revenue: 0 });
      }
      const dayData = salesByDate.get(date)!;
      dayData.orders += 1;
      dayData.revenue += order.total || 0;
    });

    const reportData = Array.from(salesByDate.entries()).map(
      ([date, data]) => ({
        date,
        totalOrders: data.orders,
        totalSales: data.revenue,
        averageOrderValue: data.orders > 0 ? data.revenue / data.orders : 0,
      })
    );

    return res.status(200).json({
      success: true,
      message: "Reports API working",
      data: {
        totalOrders: orders?.length || 0,
        totalRevenue:
          orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0,
        reportData: reportData.slice(0, 5), // First 5 days
        sampleOrders:
          orders?.slice(0, 3).map((o) => ({
            id: o.id,
            total: o.total,
            payment_method: o.payment_method,
            created_at: o.created_at,
            items_count: o.items?.length || 0,
          })) || [],
      },
    });
  } catch (error: unknown) {
    console.error("Reports API error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
