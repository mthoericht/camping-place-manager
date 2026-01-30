import { create, type StoreApi, type UseBoundStore } from 'zustand';

interface CachedListState<T> 
{
  items: T[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  fetch: (force?: boolean) => Promise<void>;
  clearCache: () => void;
  getById: (id: string) => T | undefined;
  getActive: () => T[];
}

interface CreateCachedListStoreConfig<T> 
{
  cacheDurationMs: number;
  fetchAll: () => Promise<T[]>;
  isActive?: (item: T) => boolean;
}

export function createCachedListStore<T extends { id: string }>(
  config: CreateCachedListStoreConfig<T>
): UseBoundStore<StoreApi<CachedListState<T>>> 
{
  return create<CachedListState<T>>((set, get) => ({
    items: [],
    loading: false,
    error: null,
    lastFetched: null,

    fetch: async (force = false) => 
    {
      const { lastFetched } = get();
      if (!force && lastFetched && Date.now() - lastFetched < config.cacheDurationMs) 
      {
        return;
      }

      set({ loading: true, error: null });
      try 
      {
        const items = await config.fetchAll();
        set({ items, loading: false, error: null, lastFetched: Date.now() });
      } 
      catch (e) 
      {
        set({ loading: false, error: e instanceof Error ? e.message : 'Unknown error occurred' });
      }
    },

    clearCache: () => set({ lastFetched: null }),

    getById: (id: string) => get().items.find((x) => x.id === id),

    getActive: () => 
    {
      const isActive = config.isActive ?? ((x: T) => (x as T & { isActive?: boolean }).isActive !== false);
      return get().items.filter(isActive);
    },
  }));
}
