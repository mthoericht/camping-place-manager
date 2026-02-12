import { api } from '@/api/client'
import type { Booking, BookingFormData, BookingStatusChange, BookingItemData, BookingStatus } from '@/api/types'

/** Fetches all bookings, optionally filtered by query params. */
export function fetchBookings(filters?: Record<string, string>): Promise<Booking[]> 
{
  const params = filters ? '?' + new URLSearchParams(filters).toString() : ''
  return api<Booking[]>(`/api/bookings${params}`)
}

/** Fetches a single booking by ID. */
export function fetchBookingById(id: number): Promise<Booking> 
{
  return api<Booking>(`/api/bookings/${id}`)
}

/** Creates a new booking. */
export function createBooking(data: BookingFormData): Promise<Booking> 
{
  return api<Booking>('/api/bookings', { method: 'POST', body: JSON.stringify(data) })
}

/** Updates an existing booking. */
export function updateBooking(id: number, data: Partial<BookingFormData>): Promise<Booking> 
{
  return api<Booking>(`/api/bookings/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

/** Deletes a booking. */
export function deleteBooking(id: number): Promise<void> 
{
  return api(`/api/bookings/${id}`, { method: 'DELETE' })
}

/** Updates a booking's status. */
export function changeBookingStatus(id: number, status: BookingStatus): Promise<Booking> 
{
  return api<Booking>(`/api/bookings/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) })
}

/** Fetches the status change history for a booking. */
export function fetchBookingStatusChanges(id: number): Promise<BookingStatusChange[]> 
{
  return api<BookingStatusChange[]>(`/api/bookings/${id}/status-changes`)
}

/** Fetches all items (camping equipment) for a booking. */
export function fetchBookingItems(bookingId: number): Promise<BookingItemData[]> 
{
  return api<BookingItemData[]>(`/api/bookings/${bookingId}/items`)
}

/** Adds a camping item to a booking. */
export function addBookingItem(bookingId: number, data: { campingItemId: number; quantity: number }): Promise<BookingItemData> 
{
  return api<BookingItemData>(`/api/bookings/${bookingId}/items`, { method: 'POST', body: JSON.stringify(data) })
}

/** Removes a camping item from a booking. */
export function removeBookingItem(bookingId: number, itemId: number): Promise<void> 
{
  return api(`/api/bookings/${bookingId}/items/${itemId}`, { method: 'DELETE' })
}
