import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../lib/supabase";

type HealthStatus = {
  status: "healthy" | "unhealthy";
  timestamp: string;
  services: {
    api: "up" | "down";
    database: "up" | "down" | "unknown";
  };
  version: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthStatus>
) {
  const healthStatus: HealthStatus = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      api: "up",
      database: "unknown",
    },
    version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
  };

  try {
    // Test database connection
    const { error } = await supabase.from("products").select("id").limit(1);

    if (error) {
      healthStatus.services.database = "down";
      healthStatus.status = "unhealthy";
    } else {
      healthStatus.services.database = "up";
    }
  } catch (error) {
    healthStatus.services.database = "down";
    healthStatus.status = "unhealthy";
  }

  const statusCode = healthStatus.status === "healthy" ? 200 : 503;
  res.status(statusCode).json(healthStatus);
}

