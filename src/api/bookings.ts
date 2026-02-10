import { api } from '@/api/client'
import type { Booking, BookingFormData, BookingStatusChange } from '@/api/types'

export function fetchBookings(filters?: Record<string, string>): Promise<Booking[]> 
{
  const params = filters ? '?' + new URLSearchParams(filters).toString() : ''
  return api<Booking[]>(`/api/bookings${params}`)
}

export function fetchBookingById(id: number): Promise<Booking> 
{
  return api<Booking>(`/api/bookings/${id}`)
}

export function createBooking(data: BookingFormData): Promise<Booking> 
{
  return api<Booking>('/api/bookings', { method: 'POST', body: JSON.stringify(data) })
}

export function updateBooking(id: number, data: Partial<BookingFormData>): Promise<Booking> 
{
  return api<Booking>(`/api/bookings/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

export function deleteBooking(id: number): Promise<void> 
{
  return api(`/api/bookings/${id}`, { method: 'DELETE' })
}

export function changeBookingStatus(id: number, status: string): Promise<Booking> 
{
  return api<Booking>(`/api/bookings/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) })
}

export function fetchBookingStatusChanges(id: number): Promise<BookingStatusChange[]> 
{
  return api<BookingStatusChange[]>(`/api/bookings/${id}/status-changes`)
}
