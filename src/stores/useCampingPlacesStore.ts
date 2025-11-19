import { create } from 'zustand';

export interface CampingPlace {
  id: string;
  name: string;
  price: number;
  size: number;
  description?: string;
  location?: string;
  amenities?: string[];
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CampingPlacesState {
  campingPlaces: CampingPlace[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  fetchCampingPlaces: (force?: boolean) => Promise<void>;
  getActivePlaces: () => CampingPlace[];
  getPlaceById: (id: string) => CampingPlace | undefined;
  clearCache: () => void;
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
      const response = await fetch('/api/camping-places');
      if (!response.ok) 
      {
        throw new Error('Failed to fetch camping places');
      }
      const places = await response.json();
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
}));


