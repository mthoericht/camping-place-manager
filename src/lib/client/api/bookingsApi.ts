import type { Booking, BookingFormData, ApiError } from '@/lib/shared/types';

// Re-export types for convenience
export type { Booking, BookingFormData };

/**
 * Client-side API service for bookings
 */

/**
 * Client-side API service for bookings
 */
export const bookingsApi = {
  /**
   * Get all bookings
   */
  async getAll(): Promise<Booking[]> 
  {
    const response = await fetch('/api/bookings');
    
    if (!response.ok) 
    {
      throw new Error('Failed to fetch bookings');
    }
    
    return response.json();
  },

  /**
   * Get a single booking by ID
   */
  async getById(id: string): Promise<Booking> 
  {
    const response = await fetch(`/api/bookings/${id}`);
    
    if (!response.ok) 
    {
      if (response.status === 404) 
      {
        throw new Error('Booking not found');
      }
      throw new Error('Failed to fetch booking');
    }
    
    return response.json();
  },

  /**
   * Create a new booking
   */
  async create(data: BookingFormData): Promise<Booking> 
  {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) 
    {
      const error: ApiError = await response.json();
      throw new Error(error.error || 'Failed to create booking');
    }

    return response.json();
  },

  /**
   * Update an existing booking
   */
  async update(id: string, data: BookingFormData): Promise<Booking> 
  {
    const response = await fetch(`/api/bookings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) 
    {
      const error: ApiError = await response.json();
      throw new Error(error.error || 'Failed to update booking');
    }

    return response.json();
  },

  /**
   * Delete a booking
   */
  async delete(id: string): Promise<void> 
  {
    const response = await fetch(`/api/bookings/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) 
    {
      const error: ApiError = await response.json();
      throw new Error(error.error || 'Failed to delete booking');
    }
  },
};

