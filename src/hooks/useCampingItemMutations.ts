import { useCallback } from 'react';
import { campingItemsApi, type CampingItemFormData } from '@/lib/client/api/campingItemsApi';
import { invalidateCatalogCaches } from '@/stores/cacheInvalidation';

export type { CampingItemFormData };

interface MutationResult 
{
  success: boolean;
  error?: string;
}

export function useCampingItemMutations() 
{
  const createCampingItem = useCallback(async (data: CampingItemFormData): Promise<MutationResult> => 
  {
    try 
    {
      await campingItemsApi.create(data);
      invalidateCatalogCaches();
      return { success: true };
    } 
    catch (error) 
    {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An error occurred while creating the camping item' 
      };
    }
  }, []);

  const updateCampingItem = useCallback(async (id: string, data: CampingItemFormData): Promise<MutationResult> => 
  {
    try 
    {
      await campingItemsApi.update(id, data);
      invalidateCatalogCaches();
      return { success: true };
    } 
    catch (error) 
    {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An error occurred while updating the camping item' 
      };
    }
  }, []);

  const deleteCampingItem = useCallback(async (id: string): Promise<MutationResult> => 
  {
    try 
    {
      await campingItemsApi.delete(id);
      invalidateCatalogCaches();
      return { success: true };
    } 
    catch (error) 
    {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An error occurred while deleting the camping item' 
      };
    }
  }, []);

  return { createCampingItem, updateCampingItem, deleteCampingItem };
}
