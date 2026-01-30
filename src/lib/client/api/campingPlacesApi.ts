import type { CampingPlace, CampingPlaceFormData } from '@/lib/shared/types';
import { createCrudApi } from './createCrudApi';

export type { CampingPlace, CampingPlaceFormData };

export const campingPlacesApi = createCrudApi<CampingPlace, CampingPlaceFormData>('/api/camping-places', {
  notFoundMessage: 'Camping place not found',
});
