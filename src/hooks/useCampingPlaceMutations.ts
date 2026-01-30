import { useCallback } from 'react';
import { campingPlacesApi, type CampingPlaceFormData } from '@/lib/client/api/campingPlacesApi';
import { invalidateCatalogCaches } from '@/stores/cacheInvalidation';

export type { CampingPlaceFormData };

interface MutationResult 
{
  success: boolean;
  error?: string;
}

export function useCampingPlaceMutations() 
{
  const createCampingPlace = useCallback(async (data: CampingPlaceFormData): Promise<MutationResult> => 
  {
    try 
    {
      await campingPlacesApi.create(data);
      invalidateCatalogCaches();
      return { success: true };
    } 
    catch (error) 
    {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An error occurred while creating the camping place' 
      };
    }
  }, []);

  const updateCampingPlace = useCallback(async (id: string, data: CampingPlaceFormData): Promise<MutationResult> => 
  {
    try 
    {
      await campingPlacesApi.update(id, data);
      invalidateCatalogCaches();
      return { success: true };
    } 
    catch (error) 
    {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An error occurred while updating the camping place' 
      };
    }
  }, []);

  return { createCampingPlace, updateCampingPlace };
}
