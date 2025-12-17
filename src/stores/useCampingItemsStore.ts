import { create } from 'zustand';
import { campingItemsApi, type CampingItem, type CampingItemFormData } from '@/lib/api/campingItemsApi';

// Re-export types for convenience
export type { CampingItem, CampingItemFormData };

interface CampingItemsState {
  campingItems: CampingItem[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  fetchCampingItems: (force?: boolean) => Promise<void>;
  getActiveItems: () => CampingItem[];
  getItemById: (id: string) => CampingItem | undefined;
  clearCache: () => void;
  createCampingItem: (data: CampingItemFormData) => Promise<{ success: boolean; error?: string }>;
  updateCampingItem: (id: string, data: CampingItemFormData) => Promise<{ success: boolean; error?: string }>;
  deleteCampingItem: (id: string) => Promise<{ success: boolean; error?: string }>;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useCampingItemsStore = create<CampingItemsState>((set, get) => ({
  campingItems: [],
  loading: false,
  error: null,
  lastFetched: null,

  fetchCampingItems: async (force = false) => 
  {
    const state = get();
    
    // Check if we should use cached data
    if (!force && state.lastFetched && Date.now() - state.lastFetched < CACHE_DURATION) 
    {
      return;
    }

    set({ loading: true, error: null });

    try 
    {
      const items = await campingItemsApi.getAll();
      set({
        campingItems: items,
        loading: false,
        error: null,
        lastFetched: Date.now(),
      });
    }
    catch (error) 
    {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  },

  getActiveItems: () => 
  {
    return get().campingItems.filter((item) => item.isActive !== false);
  },

  getItemById: (id: string) => 
  {
    return get().campingItems.find((item) => item.id === id);
  },

  clearCache: () => 
  {
    set({ lastFetched: null });
  },

  createCampingItem: async (data: CampingItemFormData) => 
  {
    try 
    {
      await campingItemsApi.create(data);
      get().clearCache();
      return { success: true };
    } 
    catch (error) 
    {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An error occurred while creating the camping item' 
      };
    }
  },

  updateCampingItem: async (id: string, data: CampingItemFormData) => 
  {
    try 
    {
      await campingItemsApi.update(id, data);
      get().clearCache();
      return { success: true };
    } 
    catch (error) 
    {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An error occurred while updating the camping item' 
      };
    }
  },

  deleteCampingItem: async (id: string) => 
  {
    try 
    {
      await campingItemsApi.delete(id);
      get().clearCache();
      return { success: true };
    } 
    catch (error) 
    {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An error occurred while deleting the camping item' 
      };
    }
  },
}));


