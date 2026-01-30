import { useCampingPlacesStore } from '../useCampingPlacesStore';
import { campingPlacesApi } from '@/lib/client/api/campingPlacesApi';

jest.mock('@/lib/client/api/campingPlacesApi');

const TEST_PLACES = [
  { id: '1', name: 'TEST_Place 1', price: 50, size: 100, isActive: true },
  { id: '2', name: 'TEST_Place 2', price: 75, size: 150, isActive: false },
];

describe('useCampingPlacesStore', () => 
{
  beforeEach(() => 
  {
    jest.clearAllMocks();
    useCampingPlacesStore.setState({
      items: [],
      loading: false,
      error: null,
      lastFetched: null,
    });
  });

  describe('fetch', () => 
  {
    it('should fetch camping places successfully', async () => 
    {
      (campingPlacesApi.getAll as jest.Mock).mockResolvedValueOnce(TEST_PLACES);

      await useCampingPlacesStore.getState().fetch();

      const state = useCampingPlacesStore.getState();
      expect(state.items).toEqual(TEST_PLACES);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.lastFetched).not.toBeNull();
    });

    it('should use cache when not forced', async () => 
    {
      (campingPlacesApi.getAll as jest.Mock).mockResolvedValueOnce(TEST_PLACES);

      await useCampingPlacesStore.getState().fetch();
      await useCampingPlacesStore.getState().fetch();

      expect(campingPlacesApi.getAll).toHaveBeenCalledTimes(1);
    });

    it('should refetch when forced', async () => 
    {
      (campingPlacesApi.getAll as jest.Mock).mockResolvedValue(TEST_PLACES);

      await useCampingPlacesStore.getState().fetch();
      await useCampingPlacesStore.getState().fetch(true);

      expect(campingPlacesApi.getAll).toHaveBeenCalledTimes(2);
    });

    it('should handle API errors', async () => 
    {
      (campingPlacesApi.getAll as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await useCampingPlacesStore.getState().fetch();

      const state = useCampingPlacesStore.getState();
      expect(state.error).toBe('Network error');
      expect(state.loading).toBe(false);
    });
  });

  describe('getById', () => 
  {
    it('should return place by id', async () => 
    {
      (campingPlacesApi.getAll as jest.Mock).mockResolvedValueOnce(TEST_PLACES);
      await useCampingPlacesStore.getState().fetch();

      const place = useCampingPlacesStore.getState().getById('1');
      expect(place?.name).toBe('TEST_Place 1');
    });

    it('should return undefined for unknown id', async () => 
    {
      (campingPlacesApi.getAll as jest.Mock).mockResolvedValueOnce(TEST_PLACES);
      await useCampingPlacesStore.getState().fetch();

      const place = useCampingPlacesStore.getState().getById('unknown');
      expect(place).toBeUndefined();
    });
  });

  describe('getActive', () => 
  {
    it('should return only active places', async () => 
    {
      (campingPlacesApi.getAll as jest.Mock).mockResolvedValueOnce(TEST_PLACES);
      await useCampingPlacesStore.getState().fetch();

      const activePlaces = useCampingPlacesStore.getState().getActive();
      expect(activePlaces).toHaveLength(1);
      expect(activePlaces[0].name).toBe('TEST_Place 1');
    });
  });

  describe('clearCache', () => 
  {
    it('should clear lastFetched', async () => 
    {
      (campingPlacesApi.getAll as jest.Mock).mockResolvedValueOnce(TEST_PLACES);
      await useCampingPlacesStore.getState().fetch();

      expect(useCampingPlacesStore.getState().lastFetched).not.toBeNull();

      useCampingPlacesStore.getState().clearCache();

      expect(useCampingPlacesStore.getState().lastFetched).toBeNull();
    });
  });
});
