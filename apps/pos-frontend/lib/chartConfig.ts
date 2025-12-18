// Chart.js configuration utility
// This file handles chart.js registration to avoid ESM/CommonJS issues

let chartJSRegistered = false;

export async function registerChartJS() {
  if (chartJSRegistered || typeof window === "undefined") {
    return;
  }

  try {
    const chartJS = await import("chart.js");
    chartJS.Chart.register(
      chartJS.CategoryScale,
      chartJS.LinearScale,
      chartJS.BarElement,
      chartJS.LineElement,
      chartJS.PointElement,
      chartJS.ArcElement,
      chartJS.Title,
      chartJS.Tooltip,
      chartJS.Legend
    );
    chartJSRegistered = true;
  } catch (error) {
    console.error("Failed to register Chart.js:", error);
  }
}

// Auto-register on import in browser
if (typeof window !== "undefined") {
  registerChartJS();
}
