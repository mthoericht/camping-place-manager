import { api } from '@/api/client'
import type { CampingPlace, CampingPlaceFormData } from '@/api/types'

export function fetchCampingPlaces(): Promise<CampingPlace[]> 
{
  return api<CampingPlace[]>('/api/camping-places')
}

export function fetchCampingPlaceById(id: number): Promise<CampingPlace> 
{
  return api<CampingPlace>(`/api/camping-places/${id}`)
}

export function createCampingPlace(data: CampingPlaceFormData): Promise<CampingPlace> 
{
  return api<CampingPlace>('/api/camping-places', { method: 'POST', body: JSON.stringify(data) })
}

export function updateCampingPlace(id: number, data: Partial<CampingPlaceFormData>): Promise<CampingPlace> 
{
  return api<CampingPlace>(`/api/camping-places/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

export function deleteCampingPlace(id: number): Promise<void> 
{
  return api(`/api/camping-places/${id}`, { method: 'DELETE' })
}
