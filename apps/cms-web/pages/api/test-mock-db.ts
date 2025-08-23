import { NextApiRequest, NextApiResponse } from "next";

// Mock data for testing CMS without database
const mockCategories = [
  { id: "1", name: "เครื่องดื่ม", is_active: true },
  { id: "2", name: "ขนมขบเคี้ยว", is_active: true },
  { id: "3", name: "อาหารสด", is_active: true },
];

const mockProducts = [
  { id: "1", name: "น้ำดื่ม", price: 15.0, stock: 100 },
  { id: "2", name: "ขนมปัง", price: 25.0, stock: 50 },
  { id: "3", name: "นม", price: 35.0, stock: 75 },
];

const mockBranches = [
  { id: "1", name: "สาขาหลัก", is_active: true },
  { id: "2", name: "สาขา 2", is_active: true },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Simulate some delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    const testResults = {
      database_connection: "mock_mode",
      tables: {
        categories: {
          status: "success",
          count: mockCategories.length,
          sample: mockCategories[0],
        },
        products: {
          status: "success",
          count: mockProducts.length,
          sample: mockProducts[0],
        },
        branches: {
          status: "success",
          count: mockBranches.length,
          sample: mockBranches[0],
        },
      },
      auth: {
        status: "mock_mode",
        message: "Running in mock mode - no real database connection",
        users_count: 0,
      },
      environment: {
        supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL
          ? "configured"
          : "missing",
        supabase_anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          ? "configured"
          : "missing",
        service_role_key: process.env.SUPABASE_SERVICE_ROLE_KEY
          ? "configured"
          : "missing",
        mode: "MOCK_MODE - No real database connection",
      },
    };

    res.status(200).json({
      success: true,
      message: "🚧 Mock database connection successful! (No real database)",
      timestamp: new Date().toISOString(),
      results: testResults,
    });
  } catch (error: any) {
    console.error("Mock database test error:", error);

    res.status(500).json({
      success: false,
      message: "Mock test failed",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
