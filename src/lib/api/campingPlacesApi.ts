import type { CampingPlace, CampingPlaceFormData, ApiError } from '@/lib/types';

// Re-export types for convenience
export type { CampingPlace, CampingPlaceFormData };

/**
 * Client-side API service for camping places
 */

/**
 * Client-side API service for camping places
 */
export const campingPlacesApi = {
  /**
   * Get all camping places
   */
  async getAll(): Promise<CampingPlace[]> 
  {
    const response = await fetch('/api/camping-places');
    
    if (!response.ok) 
    {
      throw new Error('Failed to fetch camping places');
    }
    
    return response.json();
  },

  /**
   * Get a single camping place by ID
   */
  async getById(id: string): Promise<CampingPlace> 
  {
    const response = await fetch(`/api/camping-places/${id}`);
    
    if (!response.ok) 
    {
      if (response.status === 404) 
      {
        throw new Error('Camping place not found');
      }
      throw new Error('Failed to fetch camping place');
    }
    
    return response.json();
  },

  /**
   * Create a new camping place
   */
  async create(data: CampingPlaceFormData): Promise<CampingPlace> 
  {
    const response = await fetch('/api/camping-places', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) 
    {
      const error: ApiError = await response.json();
      throw new Error(error.error || 'Failed to create camping place');
    }

    return response.json();
  },

  /**
   * Update an existing camping place
   */
  async update(id: string, data: CampingPlaceFormData): Promise<CampingPlace> 
  {
    const response = await fetch(`/api/camping-places/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) 
    {
      const error: ApiError = await response.json();
      throw new Error(error.error || 'Failed to update camping place');
    }

    return response.json();
  },

  /**
   * Delete a camping place
   */
  async delete(id: string): Promise<void> 
  {
    const response = await fetch(`/api/camping-places/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) 
    {
      const error: ApiError = await response.json();
      throw new Error(error.error || 'Failed to delete camping place');
    }
  },
};

