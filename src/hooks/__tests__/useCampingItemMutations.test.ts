import { renderHook } from '@testing-library/react';
import { useCampingItemMutations } from '../useCampingItemMutations';
import { campingItemsApi } from '@/lib/client/api/campingItemsApi';
import { invalidateCatalogCaches } from '@/stores/cacheInvalidation';

jest.mock('@/lib/client/api/campingItemsApi');
jest.mock('@/stores/cacheInvalidation');

describe('useCampingItemMutations', () => 
{
  beforeEach(() => 
  {
    jest.clearAllMocks();
  });

  describe('createCampingItem', () => 
  {
    it('should create a camping item successfully', async () => 
    {
      (campingItemsApi.create as jest.Mock).mockResolvedValueOnce({});

      const { result } = renderHook(() => useCampingItemMutations());
      const mutationResult = await result.current.createCampingItem({
        name: 'TEST_Tent',
        category: 'Tent',
        size: 10,
        description: 'A test tent',
        isActive: true,
      });

      expect(mutationResult.success).toBe(true);
      expect(campingItemsApi.create).toHaveBeenCalledWith({
        name: 'TEST_Tent',
        category: 'Tent',
        size: 10,
        description: 'A test tent',
        isActive: true,
      });
      expect(invalidateCatalogCaches).toHaveBeenCalled();
    });

    it('should handle API errors', async () => 
    {
      (campingItemsApi.create as jest.Mock).mockRejectedValueOnce(new Error('Validation error'));

      const { result } = renderHook(() => useCampingItemMutations());
      const mutationResult = await result.current.createCampingItem({
        name: 'TEST_Tent',
        category: 'Tent',
        size: 10,
      });

      expect(mutationResult.success).toBe(false);
      expect(mutationResult.error).toBe('Validation error');
    });
  });

  describe('updateCampingItem', () => 
  {
    it('should update a camping item successfully', async () => 
    {
      (campingItemsApi.update as jest.Mock).mockResolvedValueOnce({});

      const { result } = renderHook(() => useCampingItemMutations());
      const mutationResult = await result.current.updateCampingItem('123', {
        name: 'TEST_Updated Tent',
        category: 'Tent',
        size: 15,
      });

      expect(mutationResult.success).toBe(true);
      expect(campingItemsApi.update).toHaveBeenCalledWith('123', {
        name: 'TEST_Updated Tent',
        category: 'Tent',
        size: 15,
      });
      expect(invalidateCatalogCaches).toHaveBeenCalled();
    });

    it('should handle API errors', async () => 
    {
      (campingItemsApi.update as jest.Mock).mockRejectedValueOnce(new Error('Item not found'));

      const { result } = renderHook(() => useCampingItemMutations());
      const mutationResult = await result.current.updateCampingItem('123', {
        name: 'TEST_Updated Tent',
        category: 'Tent',
        size: 15,
      });

      expect(mutationResult.success).toBe(false);
      expect(mutationResult.error).toBe('Item not found');
    });
  });

  describe('deleteCampingItem', () => 
  {
    it('should delete a camping item successfully', async () => 
    {
      (campingItemsApi.delete as jest.Mock).mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useCampingItemMutations());
      const mutationResult = await result.current.deleteCampingItem('123');

      expect(mutationResult.success).toBe(true);
      expect(campingItemsApi.delete).toHaveBeenCalledWith('123');
      expect(invalidateCatalogCaches).toHaveBeenCalled();
    });

    it('should handle API errors', async () => 
    {
      (campingItemsApi.delete as jest.Mock).mockRejectedValueOnce(new Error('Item not found'));

      const { result } = renderHook(() => useCampingItemMutations());
      const mutationResult = await result.current.deleteCampingItem('123');

      expect(mutationResult.success).toBe(false);
      expect(mutationResult.error).toBe('Item not found');
    });
  });
});
