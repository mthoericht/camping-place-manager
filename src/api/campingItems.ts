import { api } from '@/api/client';
import type { CampingItem, CampingItemFormData } from '@/api/types';

export function fetchCampingItems(): Promise<CampingItem[]> 
{
  return api<CampingItem[]>('/api/camping-items');
}

export function fetchCampingItemById(id: number): Promise<CampingItem> 
{
  return api<CampingItem>(`/api/camping-items/${id}`);
}

export function createCampingItem(data: CampingItemFormData): Promise<CampingItem> 
{
  return api<CampingItem>('/api/camping-items', { method: 'POST', body: JSON.stringify(data) });
}

export function updateCampingItem(id: number, data: Partial<CampingItemFormData>): Promise<CampingItem> 
{
  return api<CampingItem>(`/api/camping-items/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function deleteCampingItem(id: number): Promise<void> 
{
  return api(`/api/camping-items/${id}`, { method: 'DELETE' });
}
