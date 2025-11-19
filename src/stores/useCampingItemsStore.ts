import { create } from 'zustand';

export interface CampingItem {
  id: string;
  name: string;
  category: string;
  size: number;
  description?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CampingItemsState {
  campingItems: CampingItem[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  fetchCampingItems: (force?: boolean) => Promise<void>;
  getActiveItems: () => CampingItem[];
  getItemById: (id: string) => CampingItem | undefined;
  clearCache: () => void;
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
      const response = await fetch('/api/camping-items');
      if (!response.ok) 
      {
        throw new Error('Failed to fetch camping items');
      }
      const items = await response.json();
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
}));


