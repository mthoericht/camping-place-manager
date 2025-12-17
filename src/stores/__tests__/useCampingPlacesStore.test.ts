import { useCampingPlacesStore } from '../useCampingPlacesStore';
import { campingPlacesApi } from '@/lib/api/campingPlacesApi';

// Mock the API service
jest.mock('@/lib/api/campingPlacesApi');

describe('useCampingPlacesStore', () => 
{
  beforeEach(() => 
  {
    jest.clearAllMocks();
    // Reset store state
    useCampingPlacesStore.setState({
      campingPlaces: [],
      loading: false,
      error: null,
      lastFetched: null,
    });
    // Mock clearCache to avoid side effects
    jest.spyOn(useCampingPlacesStore.getState(), 'clearCache').mockImplementation(() => {});
  });

  describe('createCampingPlace', () => 
  {
    it('should create a camping place successfully', async () => 
    {
      (campingPlacesApi.create as jest.Mock).mockResolvedValueOnce({});

      const result = await useCampingPlacesStore.getState().createCampingPlace({
        name: 'Test Place',
        location: 'Test Location',
        size: 100,
        price: 50,
        amenities: ['WiFi'],
        isActive: true,
      });

      expect(result.success).toBe(true);
      expect(campingPlacesApi.create).toHaveBeenCalledWith({
        name: 'Test Place',
        location: 'Test Location',
        size: 100,
        price: 50,
        amenities: ['WiFi'],
        isActive: true,
      });
    });

    it('should handle API errors', async () => 
    {
      (campingPlacesApi.create as jest.Mock).mockRejectedValueOnce(new Error('Validation error'));

      const result = await useCampingPlacesStore.getState().createCampingPlace({
        name: 'Test Place',
        location: 'Test Location',
        size: 100,
        price: 50,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation error');
    });

    it('should handle network errors', async () => 
    {
      (campingPlacesApi.create as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await useCampingPlacesStore.getState().createCampingPlace({
        name: 'Test Place',
        location: 'Test Location',
        size: 100,
        price: 50,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('updateCampingPlace', () => 
  {
    it('should update a camping place successfully', async () => 
    {
      (campingPlacesApi.update as jest.Mock).mockResolvedValueOnce({});

      const result = await useCampingPlacesStore.getState().updateCampingPlace('123', {
        name: 'Updated Place',
        location: 'Updated Location',
        size: 150,
        price: 75,
      });

      expect(result.success).toBe(true);
      expect(campingPlacesApi.update).toHaveBeenCalledWith('123', {
        name: 'Updated Place',
        location: 'Updated Location',
        size: 150,
        price: 75,
      });
    });

    it('should handle API errors', async () => 
    {
      (campingPlacesApi.update as jest.Mock).mockRejectedValueOnce(new Error('Place not found'));

      const result = await useCampingPlacesStore.getState().updateCampingPlace('123', {
        name: 'Updated Place',
        location: 'Updated Location',
        size: 150,
        price: 75,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Place not found');
    });
  });
});

