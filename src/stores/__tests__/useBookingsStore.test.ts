import { useBookingsStore } from '../useBookingsStore';
import { bookingsApi } from '@/lib/client/api/bookingsApi';

// Mock the API service
jest.mock('@/lib/client/api/bookingsApi');

// Mock the related stores
jest.mock('../useCampingPlacesStore', () => ({
  useCampingPlacesStore: {
    getState: () => ({
      clearCache: jest.fn(),
    }),
  },
}));

jest.mock('../useCampingItemsStore', () => ({
  useCampingItemsStore: {
    getState: () => ({
      clearCache: jest.fn(),
    }),
  },
}));

describe('useBookingsStore', () => 
{
  beforeEach(() => 
  {
    jest.clearAllMocks();
  });

  describe('createBooking', () => 
  {
    it('should create a booking successfully', async () => 
    {
      (bookingsApi.create as jest.Mock).mockResolvedValueOnce({});

      const result = await useBookingsStore.getState().createBooking({
        campingPlaceId: 'place123',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '1234567890',
        startDate: '2024-01-15',
        endDate: '2024-01-20',
        guests: 2,
        notes: 'Test booking',
        campingItems: { item1: 1 },
      });

      expect(result.success).toBe(true);
      expect(bookingsApi.create).toHaveBeenCalledWith({
        campingPlaceId: 'place123',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        customerPhone: '1234567890',
        startDate: '2024-01-15',
        endDate: '2024-01-20',
        guests: 2,
        notes: 'Test booking',
        campingItems: { item1: 1 },
      });
    });

    it('should handle API errors', async () => 
    {
      (bookingsApi.create as jest.Mock).mockRejectedValueOnce(new Error('Validation error'));

      const result = await useBookingsStore.getState().createBooking({
        campingPlaceId: 'place123',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        startDate: '2024-01-15',
        endDate: '2024-01-20',
        guests: 2,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Validation error');
    });

    it('should handle network errors', async () => 
    {
      (bookingsApi.create as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await useBookingsStore.getState().createBooking({
        campingPlaceId: 'place123',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        startDate: '2024-01-15',
        endDate: '2024-01-20',
        guests: 2,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('updateBooking', () => 
  {
    it('should update a booking successfully', async () => 
    {
      (bookingsApi.update as jest.Mock).mockResolvedValueOnce({});

      const result = await useBookingsStore.getState().updateBooking('123', {
        campingPlaceId: 'place123',
        customerName: 'Jane Doe',
        customerEmail: 'jane@example.com',
        startDate: '2024-01-15',
        endDate: '2024-01-20',
        guests: 3,
      });

      expect(result.success).toBe(true);
      expect(bookingsApi.update).toHaveBeenCalledWith('123', {
        campingPlaceId: 'place123',
        customerName: 'Jane Doe',
        customerEmail: 'jane@example.com',
        startDate: '2024-01-15',
        endDate: '2024-01-20',
        guests: 3,
      });
    });

    it('should handle API errors', async () => 
    {
      (bookingsApi.update as jest.Mock).mockRejectedValueOnce(new Error('Booking not found'));

      const result = await useBookingsStore.getState().updateBooking('123', {
        campingPlaceId: 'place123',
        customerName: 'Jane Doe',
        customerEmail: 'jane@example.com',
        startDate: '2024-01-15',
        endDate: '2024-01-20',
        guests: 3,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Booking not found');
    });
  });
});

