import { create } from 'zustand';
import { bookingsApi, type Booking, type BookingFormData } from '@/lib/client/api/bookingsApi';

// Re-export types for convenience
export type { Booking, BookingFormData };

interface BookingsState {
  createBooking: (data: BookingFormData) => Promise<{ success: boolean; error?: string }>;
  updateBooking: (id: string, data: BookingFormData) => Promise<{ success: boolean; error?: string }>;
}

export const useBookingsStore = create<BookingsState>((set, get) => ({
  createBooking: async (data: BookingFormData) => 
  {
    try 
    {
      await bookingsApi.create(data);
      // Clear cache for related stores
      const { useCampingPlacesStore } = await import('./useCampingPlacesStore');
      const { useCampingItemsStore } = await import('./useCampingItemsStore');
      useCampingPlacesStore.getState().clearCache();
      useCampingItemsStore.getState().clearCache();
      return { success: true };
    } 
    catch (error) 
    {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An error occurred while creating the booking' 
      };
    }
  },

  updateBooking: async (id: string, data: BookingFormData) => 
  {
    try 
    {
      await bookingsApi.update(id, data);
      // Clear cache for related stores
      const { useCampingPlacesStore } = await import('./useCampingPlacesStore');
      const { useCampingItemsStore } = await import('./useCampingItemsStore');
      useCampingPlacesStore.getState().clearCache();
      useCampingItemsStore.getState().clearCache();
      return { success: true };
    } 
    catch (error) 
    {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'An error occurred while updating the booking' 
      };
    }
  },
}));

