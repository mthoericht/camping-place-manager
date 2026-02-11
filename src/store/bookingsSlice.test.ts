import { describe, it, expect } from 'vitest'
import reducer, { fetchBookings, deleteBooking, fetchBookingStatusChanges, bookingsSelectors } from './bookingsSlice'
import type { Booking, BookingStatusChange } from '@/api/types'

const mockBooking = (overrides: Partial<Booking> = {}): Booking => ({
  id: 1,
  campingPlaceId: 1,
  customerName: 'Test',
  customerEmail: 'test@example.com',
  customerPhone: null,
  startDate: '2025-01-01',
  endDate: '2025-01-03',
  guests: 2,
  totalPrice: 100,
  status: 'PENDING',
  notes: null,
  campingPlace: {} as Booking['campingPlace'],
  bookingItems: [],
  statusChanges: [],
  createdAt: '',
  updatedAt: '',
  ...overrides
})

describe('bookingsSlice', () => 
{
  it('sets loading and clears error on fetchBookings.pending', () => 
  {
    const state = reducer(undefined, fetchBookings.pending('', undefined))
    expect(state.status).toBe('loading')
    expect(state.error).toBeNull()
  })

  it('stores bookings and sets succeeded on fetchBookings.fulfilled', () => 
  {
    const list = [mockBooking({ id: 1 }), mockBooking({ id: 2 })]
    const state = reducer(undefined, fetchBookings.fulfilled(list, '', undefined))
    expect(state.status).toBe('succeeded')
    expect(bookingsSelectors.selectIds({ bookings: state } as never)).toEqual([1, 2])
  })

  it('removes booking and its statusChanges on deleteBooking.fulfilled', () => 
  {
    const withStatusChanges = {
      ...reducer(undefined, fetchBookings.fulfilled([mockBooking({ id: 1 })], '', undefined)),
      statusChanges: { 1: [{ id: 1, bookingId: 1, status: 'PENDING', changedAt: '' }] as BookingStatusChange[] }
    }
    const state = reducer(withStatusChanges, deleteBooking.fulfilled(1, '', 1))
    expect(bookingsSelectors.selectById({ bookings: state } as never, 1)).toBeUndefined()
    expect(state.statusChanges[1]).toBeUndefined()
  })

  it('stores statusChanges by bookingId on fetchBookingStatusChanges.fulfilled', () => 
  {
    const changes: BookingStatusChange[] = [
      { id: 1, bookingId: 5, status: 'PENDING', changedAt: '2025-01-01T00:00:00' },
      { id: 2, bookingId: 5, status: 'CONFIRMED', changedAt: '2025-01-02T00:00:00' }
    ]
    const state = reducer(undefined, fetchBookingStatusChanges.fulfilled(changes, 'requestId', 5))
    expect(state.statusChanges[5]).toEqual(changes)
  })
})
