import { createCachedListStore } from '../createCachedListStore';

interface TestItem 
{
  id: string;
  name: string;
  isActive: boolean;
}

describe('createCachedListStore', () => 
{
  const TEST_ITEMS: TestItem[] = [
    { id: '1', name: 'TEST_Item 1', isActive: true },
    { id: '2', name: 'TEST_Item 2', isActive: false },
    { id: '3', name: 'TEST_Item 3', isActive: true },
  ];

  let mockFetchAll: jest.Mock;
  let useStore: ReturnType<typeof createCachedListStore<TestItem>>;

  beforeEach(() => 
  {
    mockFetchAll = jest.fn().mockResolvedValue(TEST_ITEMS);
    useStore = createCachedListStore<TestItem>({
      fetchAll: mockFetchAll,
      cacheDurationMs: 5000,
    });
  });

  describe('initial state', () => 
  {
    it('should have empty initial state', () => 
    {
      const state = useStore.getState();
      
      expect(state.items).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.lastFetched).toBeNull();
    });
  });

  describe('fetch', () => 
  {
    it('should fetch and store items', async () => 
    {
      await useStore.getState().fetch();
      
      const state = useStore.getState();
      expect(state.items).toEqual(TEST_ITEMS);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.lastFetched).not.toBeNull();
      expect(mockFetchAll).toHaveBeenCalledTimes(1);
    });

    it('should set loading state during fetch', async () => 
    {
      const fetchPromise = useStore.getState().fetch();
      
      expect(useStore.getState().loading).toBe(true);
      
      await fetchPromise;
      
      expect(useStore.getState().loading).toBe(false);
    });

    it('should use cache when not expired', async () => 
    {
      await useStore.getState().fetch();
      await useStore.getState().fetch();
      
      expect(mockFetchAll).toHaveBeenCalledTimes(1);
    });

    it('should refetch when forced', async () => 
    {
      await useStore.getState().fetch();
      await useStore.getState().fetch(true);
      
      expect(mockFetchAll).toHaveBeenCalledTimes(2);
    });

    it('should handle fetch errors', async () => 
    {
      mockFetchAll.mockRejectedValue(new Error('TEST_Network error'));
      
      await useStore.getState().fetch();
      
      const state = useStore.getState();
      expect(state.error).toBe('TEST_Network error');
      expect(state.loading).toBe(false);
      expect(state.items).toEqual([]);
    });
  });

  describe('clearCache', () => 
  {
    it('should clear lastFetched', async () => 
    {
      await useStore.getState().fetch();
      expect(useStore.getState().lastFetched).not.toBeNull();
      
      useStore.getState().clearCache();
      
      expect(useStore.getState().lastFetched).toBeNull();
    });

    it('should allow refetch after clearCache', async () => 
    {
      await useStore.getState().fetch();
      useStore.getState().clearCache();
      await useStore.getState().fetch();
      
      expect(mockFetchAll).toHaveBeenCalledTimes(2);
    });
  });

  describe('getById', () => 
  {
    it('should return item by id', async () => 
    {
      await useStore.getState().fetch();
      
      const item = useStore.getState().getById('2');
      
      expect(item).toEqual({ id: '2', name: 'TEST_Item 2', isActive: false });
    });

    it('should return undefined for unknown id', async () => 
    {
      await useStore.getState().fetch();
      
      const item = useStore.getState().getById('unknown');
      
      expect(item).toBeUndefined();
    });
  });

  describe('getActive', () => 
  {
    it('should return only active items', async () => 
    {
      await useStore.getState().fetch();
      
      const activeItems = useStore.getState().getActive();
      
      expect(activeItems).toHaveLength(2);
      expect(activeItems.every(item => item.isActive)).toBe(true);
    });

    it('should use custom isActive function when provided', async () => 
    {
      const customStore = createCachedListStore<TestItem>({
        fetchAll: mockFetchAll,
        cacheDurationMs: 5000,
        isActive: (item) => item.name.includes('1'),
      });
      
      await customStore.getState().fetch();
      const activeItems = customStore.getState().getActive();
      
      expect(activeItems).toHaveLength(1);
      expect(activeItems[0].name).toBe('TEST_Item 1');
    });
  });
});
