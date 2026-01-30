import { useCampingItemsStore } from '../useCampingItemsStore';
import { campingItemsApi } from '@/lib/client/api/campingItemsApi';

jest.mock('@/lib/client/api/campingItemsApi');

const TEST_ITEMS = [
  { id: '1', name: 'TEST_Tent 1', category: 'Tent', size: 10, isActive: true },
  { id: '2', name: 'TEST_Van 1', category: 'Van', size: 20, isActive: false },
];

describe('useCampingItemsStore', () => 
{
  beforeEach(() => 
  {
    jest.clearAllMocks();
    useCampingItemsStore.setState({
      items: [],
      loading: false,
      error: null,
      lastFetched: null,
    });
  });

  describe('fetch', () => 
  {
    it('should fetch camping items successfully', async () => 
    {
      (campingItemsApi.getAll as jest.Mock).mockResolvedValueOnce(TEST_ITEMS);

      await useCampingItemsStore.getState().fetch();

      const state = useCampingItemsStore.getState();
      expect(state.items).toEqual(TEST_ITEMS);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.lastFetched).not.toBeNull();
    });

    it('should use cache when not forced', async () => 
    {
      (campingItemsApi.getAll as jest.Mock).mockResolvedValueOnce(TEST_ITEMS);

      await useCampingItemsStore.getState().fetch();
      await useCampingItemsStore.getState().fetch();

      expect(campingItemsApi.getAll).toHaveBeenCalledTimes(1);
    });

    it('should refetch when forced', async () => 
    {
      (campingItemsApi.getAll as jest.Mock).mockResolvedValue(TEST_ITEMS);

      await useCampingItemsStore.getState().fetch();
      await useCampingItemsStore.getState().fetch(true);

      expect(campingItemsApi.getAll).toHaveBeenCalledTimes(2);
    });

    it('should handle API errors', async () => 
    {
      (campingItemsApi.getAll as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await useCampingItemsStore.getState().fetch();

      const state = useCampingItemsStore.getState();
      expect(state.error).toBe('Network error');
      expect(state.loading).toBe(false);
    });
  });

  describe('getById', () => 
  {
    it('should return item by id', async () => 
    {
      (campingItemsApi.getAll as jest.Mock).mockResolvedValueOnce(TEST_ITEMS);
      await useCampingItemsStore.getState().fetch();

      const item = useCampingItemsStore.getState().getById('1');
      expect(item?.name).toBe('TEST_Tent 1');
    });

    it('should return undefined for unknown id', async () => 
    {
      (campingItemsApi.getAll as jest.Mock).mockResolvedValueOnce(TEST_ITEMS);
      await useCampingItemsStore.getState().fetch();

      const item = useCampingItemsStore.getState().getById('unknown');
      expect(item).toBeUndefined();
    });
  });

  describe('getActive', () => 
  {
    it('should return only active items', async () => 
    {
      (campingItemsApi.getAll as jest.Mock).mockResolvedValueOnce(TEST_ITEMS);
      await useCampingItemsStore.getState().fetch();

      const activeItems = useCampingItemsStore.getState().getActive();
      expect(activeItems).toHaveLength(1);
      expect(activeItems[0].name).toBe('TEST_Tent 1');
    });
  });

  describe('clearCache', () => 
  {
    it('should clear lastFetched', async () => 
    {
      (campingItemsApi.getAll as jest.Mock).mockResolvedValueOnce(TEST_ITEMS);
      await useCampingItemsStore.getState().fetch();

      expect(useCampingItemsStore.getState().lastFetched).not.toBeNull();

      useCampingItemsStore.getState().clearCache();

      expect(useCampingItemsStore.getState().lastFetched).toBeNull();
    });
  });
});
