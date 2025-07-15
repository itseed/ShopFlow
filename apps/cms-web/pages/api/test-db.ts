import { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Test basic connection
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("id, name, is_active")
      .limit(5);

    if (categoriesError) {
      throw new Error(`Categories query failed: ${categoriesError.message}`);
    }

    // Test products connection
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, price, stock")
      .limit(5);

    if (productsError) {
      throw new Error(`Products query failed: ${productsError.message}`);
    }

    // Test branches connection
    const { data: branches, error: branchesError } = await supabase
      .from("branches")
      .select("id, name, is_active")
      .limit(5);

    if (branchesError) {
      throw new Error(`Branches query failed: ${branchesError.message}`);
    }

    // Test auth users connection (admin only)
    const {
      data: { users },
      error: usersError,
    } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });

    const testResults = {
      database_connection: "success",
      tables: {
        categories: {
          status: "success",
          count: categories?.length || 0,
          sample: categories?.[0],
        },
        products: {
          status: "success",
          count: products?.length || 0,
          sample: products?.[0],
        },
        branches: {
          status: "success",
          count: branches?.length || 0,
          sample: branches?.[0],
        },
      },
      auth: {
        status: usersError ? "limited_access" : "success",
        message: usersError
          ? "Cannot access admin users (expected in development)"
          : "Auth working",
        users_count: users?.length || 0,
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
      },
    };

    res.status(200).json({
      success: true,
      message: "Database connection successful! 🎉",
      timestamp: new Date().toISOString(),
      results: testResults,
    });
  } catch (error: any) {
    console.error("Database test error:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
      timestamp: new Date().toISOString(),
      troubleshooting: {
        check_env_vars:
          "Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set",
        check_database:
          "Verify database schema is created and RLS policies are enabled",
        check_project: "Ensure Supabase project is active and accessible",
      },
    });
  }
}
