import type { CampingItem, CampingItemFormData, ApiError } from '@/lib/types';

// Re-export types for convenience
export type { CampingItem, CampingItemFormData };

/**
 * Client-side API service for camping items
 */
export const campingItemsApi = {
  /**
   * Get all camping items
   */
  async getAll(): Promise<CampingItem[]> 
  {
    const response = await fetch('/api/camping-items');
    
    if (!response.ok) 
    {
      throw new Error('Failed to fetch camping items');
    }
    
    return response.json();
  },

  /**
   * Get a single camping item by ID
   */
  async getById(id: string): Promise<CampingItem> 
  {
    const response = await fetch(`/api/camping-items/${id}`);
    
    if (!response.ok) 
    {
      if (response.status === 404) 
      {
        throw new Error('Camping item not found');
      }
      throw new Error('Failed to fetch camping item');
    }
    
    return response.json();
  },

  /**
   * Create a new camping item
   */
  async create(data: CampingItemFormData): Promise<CampingItem> 
  {
    const response = await fetch('/api/camping-items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) 
    {
      const error: ApiError = await response.json();
      throw new Error(error.error || 'Failed to create camping item');
    }

    return response.json();
  },

  /**
   * Update an existing camping item
   */
  async update(id: string, data: CampingItemFormData): Promise<CampingItem> 
  {
    const response = await fetch(`/api/camping-items/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) 
    {
      const error: ApiError = await response.json();
      throw new Error(error.error || 'Failed to update camping item');
    }

    return response.json();
  },

  /**
   * Delete a camping item
   */
  async delete(id: string): Promise<void> 
  {
    const response = await fetch(`/api/camping-items/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) 
    {
      const error: ApiError = await response.json();
      throw new Error(error.error || 'Failed to delete camping item');
    }
  },
};

