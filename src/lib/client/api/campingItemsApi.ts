import type { CampingItem, CampingItemFormData } from '@/lib/shared/types';
import { createCrudApi } from './createCrudApi';

export type { CampingItem, CampingItemFormData };

export const campingItemsApi = createCrudApi<CampingItem, CampingItemFormData>('/api/camping-items', {
  notFoundMessage: 'Camping item not found',
});
