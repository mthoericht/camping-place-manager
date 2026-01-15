import { create } from 'zustand';
import { campingPlacesApi, type CampingPlace, type CampingPlaceFormData } from '@/lib/client/api/campingPlacesApi';

// Re-export types for convenience
export type { CampingPlace, CampingPlaceFormData };

interface CampingPlacesState {
  campingPlaces: CampingPlace[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  fetchCampingPlaces: (force?: boolean) => Promise<void>;
  getActivePlaces: () => CampingPlace[];
  getPlaceById: (id: string) => CampingPlace | undefined;
  clearCache: () => void;
  createCampingPlace: (data: CampingPlaceFormData) => Promise<{ success: boolean; error?: string }>;
  updateCampingPlace: (id: string, data: CampingPlaceFormData) => Promise<{ success: boolean; error?: string }>;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useCampingPlacesStore = create<CampingPlacesState>((set, get) => ({
  campingPlaces: [],
  loading: false,
  error: null,
  lastFetched: null,

  fetchCampingPlaces: async (force = false) => 
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
      const places = await campingPlacesApi.getAll();
      set({
        campingPlaces: places,
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

  getActivePlaces: () => 
  {
    return get().campingPlaces.filter((place) => place.isActive !== false);
  },

  getPlaceById: (id: string) => 
  {
    return get().campingPlaces.find((place) => place.id === id);
  },

  clearCache: () => 
  {
    set({ lastFetched: null });
  },

  createCampingPlace: async (data: CampingPlaceFormData) => 
  {
    try 
    {
      await campingPlacesApi.create(data);
      get().clearCache();
      return { success: true };
    } 
    catch (error) 
    {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An error occurred while creating the camping place' 
      };
    }
  },

  updateCampingPlace: async (id: string, data: CampingPlaceFormData) => 
  {
    try 
    {
      await campingPlacesApi.update(id, data);
      get().clearCache();
      return { success: true };
    } 
    catch (error) 
    {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An error occurred while updating the camping place' 
      };
    }
  },
}));


