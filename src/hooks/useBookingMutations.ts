import { useCallback } from 'react';
import { bookingsApi, type Booking, type BookingFormData } from '@/lib/client/api/bookingsApi';
import { invalidateCatalogCaches } from '@/stores/cacheInvalidation';

export type { Booking, BookingFormData };

interface MutationResult 
{
  success: boolean;
  error?: string;
}

/**
 * Custom hook for booking mutations (create/update).
 * This is a hook, not a store, because it has no state - only actions.
 */
export function useBookingMutations() 
{
  const createBooking = useCallback(async (data: BookingFormData): Promise<MutationResult> => 
  {
    try 
    {
      await bookingsApi.create(data);
      invalidateCatalogCaches();
      return { success: true };
    } 
    catch (error) 
    {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An error occurred while creating the booking' 
      };
    }
  }, []);

  const updateBooking = useCallback(async (id: string, data: BookingFormData): Promise<MutationResult> => 
  {
    try 
    {
      await bookingsApi.update(id, data);
      invalidateCatalogCaches();
      return { success: true };
    } 
    catch (error) 
    {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An error occurred while updating the booking' 
      };
    }
  }, []);

  return { createBooking, updateBooking };
}
