import { renderHook } from '@testing-library/react';
import { useBookingMutations } from '../useBookingMutations';
import { bookingsApi } from '@/lib/client/api/bookingsApi';
import { invalidateCatalogCaches } from '@/stores/cacheInvalidation';

jest.mock('@/lib/client/api/bookingsApi');
jest.mock('@/stores/cacheInvalidation');

describe('useBookingMutations', () => 
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

      const { result } = renderHook(() => useBookingMutations());
      const mutationResult = await result.current.createBooking({
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

      expect(mutationResult.success).toBe(true);
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
      expect(invalidateCatalogCaches).toHaveBeenCalled();
    });

    it('should handle API errors', async () => 
    {
      (bookingsApi.create as jest.Mock).mockRejectedValueOnce(new Error('Validation error'));

      const { result } = renderHook(() => useBookingMutations());
      const mutationResult = await result.current.createBooking({
        campingPlaceId: 'place123',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        startDate: '2024-01-15',
        endDate: '2024-01-20',
        guests: 2,
      });

      expect(mutationResult.success).toBe(false);
      expect(mutationResult.error).toBe('Validation error');
    });

    it('should handle network errors', async () => 
    {
      (bookingsApi.create as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useBookingMutations());
      const mutationResult = await result.current.createBooking({
        campingPlaceId: 'place123',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        startDate: '2024-01-15',
        endDate: '2024-01-20',
        guests: 2,
      });

      expect(mutationResult.success).toBe(false);
      expect(mutationResult.error).toBe('Network error');
    });
  });

  describe('updateBooking', () => 
  {
    it('should update a booking successfully', async () => 
    {
      (bookingsApi.update as jest.Mock).mockResolvedValueOnce({});

      const { result } = renderHook(() => useBookingMutations());
      const mutationResult = await result.current.updateBooking('123', {
        campingPlaceId: 'place123',
        customerName: 'Jane Doe',
        customerEmail: 'jane@example.com',
        startDate: '2024-01-15',
        endDate: '2024-01-20',
        guests: 3,
      });

      expect(mutationResult.success).toBe(true);
      expect(bookingsApi.update).toHaveBeenCalledWith('123', {
        campingPlaceId: 'place123',
        customerName: 'Jane Doe',
        customerEmail: 'jane@example.com',
        startDate: '2024-01-15',
        endDate: '2024-01-20',
        guests: 3,
      });
      expect(invalidateCatalogCaches).toHaveBeenCalled();
    });

    it('should handle API errors', async () => 
    {
      (bookingsApi.update as jest.Mock).mockRejectedValueOnce(new Error('Booking not found'));

      const { result } = renderHook(() => useBookingMutations());
      const mutationResult = await result.current.updateBooking('123', {
        campingPlaceId: 'place123',
        customerName: 'Jane Doe',
        customerEmail: 'jane@example.com',
        startDate: '2024-01-15',
        endDate: '2024-01-20',
        guests: 3,
      });

      expect(mutationResult.success).toBe(false);
      expect(mutationResult.error).toBe('Booking not found');
    });
  });
});
