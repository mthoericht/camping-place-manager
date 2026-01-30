import { useCampingPlacesStore } from './useCampingPlacesStore';
import { useCampingItemsStore } from './useCampingItemsStore';

/**
 * Invalidates caches for catalog-related stores.
 * Call this after mutations that affect camping places or items availability.
 */
export function invalidateCatalogCaches(): void 
{
  useCampingPlacesStore.getState().clearCache();
  useCampingItemsStore.getState().clearCache();
}
