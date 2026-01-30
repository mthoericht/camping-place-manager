import { renderHook } from '@testing-library/react';
import { useCampingPlaceMutations } from '../useCampingPlaceMutations';
import { campingPlacesApi } from '@/lib/client/api/campingPlacesApi';
import { invalidateCatalogCaches } from '@/stores/cacheInvalidation';

jest.mock('@/lib/client/api/campingPlacesApi');
jest.mock('@/stores/cacheInvalidation');

describe('useCampingPlaceMutations', () => 
{
  beforeEach(() => 
  {
    jest.clearAllMocks();
  });

  describe('createCampingPlace', () => 
  {
    it('should create a camping place successfully', async () => 
    {
      (campingPlacesApi.create as jest.Mock).mockResolvedValueOnce({});

      const { result } = renderHook(() => useCampingPlaceMutations());
      const mutationResult = await result.current.createCampingPlace({
        name: 'TEST_Place',
        location: 'TEST_Location',
        size: 100,
        price: 50,
        amenities: ['WiFi'],
        isActive: true,
      });

      expect(mutationResult.success).toBe(true);
      expect(campingPlacesApi.create).toHaveBeenCalledWith({
        name: 'TEST_Place',
        location: 'TEST_Location',
        size: 100,
        price: 50,
        amenities: ['WiFi'],
        isActive: true,
      });
      expect(invalidateCatalogCaches).toHaveBeenCalled();
    });

    it('should handle API errors', async () => 
    {
      (campingPlacesApi.create as jest.Mock).mockRejectedValueOnce(new Error('Validation error'));

      const { result } = renderHook(() => useCampingPlaceMutations());
      const mutationResult = await result.current.createCampingPlace({
        name: 'TEST_Place',
        location: 'TEST_Location',
        size: 100,
        price: 50,
      });

      expect(mutationResult.success).toBe(false);
      expect(mutationResult.error).toBe('Validation error');
    });
  });

  describe('updateCampingPlace', () => 
  {
    it('should update a camping place successfully', async () => 
    {
      (campingPlacesApi.update as jest.Mock).mockResolvedValueOnce({});

      const { result } = renderHook(() => useCampingPlaceMutations());
      const mutationResult = await result.current.updateCampingPlace('123', {
        name: 'TEST_Updated Place',
        location: 'TEST_Updated Location',
        size: 150,
        price: 75,
      });

      expect(mutationResult.success).toBe(true);
      expect(campingPlacesApi.update).toHaveBeenCalledWith('123', {
        name: 'TEST_Updated Place',
        location: 'TEST_Updated Location',
        size: 150,
        price: 75,
      });
      expect(invalidateCatalogCaches).toHaveBeenCalled();
    });

    it('should handle API errors', async () => 
    {
      (campingPlacesApi.update as jest.Mock).mockRejectedValueOnce(new Error('Place not found'));

      const { result } = renderHook(() => useCampingPlaceMutations());
      const mutationResult = await result.current.updateCampingPlace('123', {
        name: 'TEST_Updated Place',
        location: 'TEST_Updated Location',
        size: 150,
        price: 75,
      });

      expect(mutationResult.success).toBe(false);
      expect(mutationResult.error).toBe('Place not found');
    });
  });
});
