import { createCachedListStore } from './createCachedListStore';
import { campingItemsApi, type CampingItem, type CampingItemFormData } from '@/lib/client/api/campingItemsApi';

export type { CampingItem, CampingItemFormData };

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useCampingItemsStore = createCachedListStore<CampingItem>({
  fetchAll: () => campingItemsApi.getAll(),
  cacheDurationMs: CACHE_DURATION,
});
