import { api } from '@/api/client';
import type { AnalyticsData } from '@/api/types';

export function fetchAnalytics(): Promise<AnalyticsData> 
{
  return api<AnalyticsData>('/api/analytics');
}
