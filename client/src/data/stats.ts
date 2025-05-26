// src/data/stats.ts
import { HomeStats } from '@/types/stats';
import { apiRequest } from '@/lib/queryClient';

export async function fetchHomeStats(): Promise<HomeStats> {
  const stats = await apiRequest<HomeStats>('/api/home-stats');
  return {
    implementationSpeed: stats.implementationSpeed || '-',
    customerSatisfaction: Number(stats.customerSatisfaction || 0),
    integrations: Number(stats.integrations || 0),
    roi: stats.roi || '-',
  };
}

// Dynamically count integrations from apps.ts
import { apps } from "./apps";
export function getIntegrationCount() {
  return apps.length;
}
