import { createCachedListStore } from './createCachedListStore';
import { campingPlacesApi, type CampingPlace, type CampingPlaceFormData } from '@/lib/client/api/campingPlacesApi';

export type { CampingPlace, CampingPlaceFormData };

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useCampingPlacesStore = createCachedListStore<CampingPlace>({
  fetchAll: () => campingPlacesApi.getAll(),
  cacheDurationMs: CACHE_DURATION,
});
