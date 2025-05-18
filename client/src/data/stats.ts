// src/data/stats.ts
export async function fetchHomeStats() {
  // Fetch from backend API
  const res = await fetch("/api/home-stats");
  if (!res.ok) throw new Error("Failed to fetch home stats");
  const stats = await res.json();
  // Parse and normalize values for UI
  return {
    implementationSpeed:
      stats.implementationSpeed ||
      stats["implementationSpeed"] ||
      stats["implementation_speed"] ||
      "-",
    customerSatisfaction: Number(
      stats.customerSatisfaction ||
        stats["customerSatisfaction"] ||
        stats["customer_satisfaction"] ||
        0
    ),
    integrations: Number(
      stats.integrations ||
        stats["integrations"] ||
        stats["integration_count"] ||
        0
    ),
    roi: stats.roi || stats["roi"] || stats["roi_period"] || "-",
  };
}

// Dynamically count integrations from apps.ts
import { apps } from "./apps";
export function getIntegrationCount() {
  return apps.length;
}
