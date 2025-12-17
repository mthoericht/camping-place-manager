import { useCampingItemsStore } from '../useCampingItemsStore';
import { campingItemsApi } from '@/lib/api/campingItemsApi';

// Mock the API service
jest.mock('@/lib/api/campingItemsApi');

describe('useCampingItemsStore', () => 
{
  beforeEach(() => 
  {
    jest.clearAllMocks();
    // Reset store state
    useCampingItemsStore.setState({
      campingItems: [],
      loading: false,
      error: null,
      lastFetched: null,
    });
    // Mock clearCache to avoid side effects
    jest.spyOn(useCampingItemsStore.getState(), 'clearCache').mockImplementation(() => {});
  });

  describe('createCampingItem', () => 
  {
    it('should create a camping item successfully', async () => 
    {
      (campingItemsApi.create as jest.Mock).mockResolvedValueOnce({});

      const result = await useCampingItemsStore.getState().createCampingItem({
        name: 'Test Tent',
        category: 'Tent',
        size: 10,
        description: 'A test tent',
        isActive: true,
      });

      expect(result.success).toBe(true);
      expect(campingItemsApi.create).toHaveBeenCalledWith({
        name: 'Test Tent',
        category: 'Tent',
        size: 10,
        description: 'A test tent',
        isActive: true,
      });
    });

    it('should handle API errors', async () => 
    {
      (campingItemsApi.create as jest.Mock).mockRejectedValueOnce(new Error('Validation error'));

      const result = await useCampingItemsStore.getState().createCampingItem({
        name: 'Test Tent',
        category: 'Tent',
        size: 10,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation error');
    });

    it('should handle network errors', async () => 
    {
      (campingItemsApi.create as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await useCampingItemsStore.getState().createCampingItem({
        name: 'Test Tent',
        category: 'Tent',
        size: 10,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('updateCampingItem', () => 
  {
    it('should update a camping item successfully', async () => 
    {
      (campingItemsApi.update as jest.Mock).mockResolvedValueOnce({});

      const result = await useCampingItemsStore.getState().updateCampingItem('123', {
        name: 'Updated Tent',
        category: 'Tent',
        size: 15,
      });

      expect(result.success).toBe(true);
      expect(campingItemsApi.update).toHaveBeenCalledWith('123', {
        name: 'Updated Tent',
        category: 'Tent',
        size: 15,
      });
    });

    it('should handle API errors', async () => 
    {
      (campingItemsApi.update as jest.Mock).mockRejectedValueOnce(new Error('Item not found'));

      const result = await useCampingItemsStore.getState().updateCampingItem('123', {
        name: 'Updated Tent',
        category: 'Tent',
        size: 15,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Item not found');
    });
  });

  describe('deleteCampingItem', () => 
  {
    it('should delete a camping item successfully', async () => 
    {
      (campingItemsApi.delete as jest.Mock).mockResolvedValueOnce(undefined);

      const result = await useCampingItemsStore.getState().deleteCampingItem('123');

      expect(result.success).toBe(true);
      expect(campingItemsApi.delete).toHaveBeenCalledWith('123');
    });

    it('should handle API errors', async () => 
    {
      (campingItemsApi.delete as jest.Mock).mockRejectedValueOnce(new Error('Item not found'));

      const result = await useCampingItemsStore.getState().deleteCampingItem('123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Item not found');
    });

    it('should handle network errors', async () => 
    {
      (campingItemsApi.delete as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await useCampingItemsStore.getState().deleteCampingItem('123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });
});

