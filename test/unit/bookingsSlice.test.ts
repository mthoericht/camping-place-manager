import { describe, it, expect } from 'vitest'
import reducer, { fetchBookings, deleteBooking, fetchBookingStatusChanges, bookingsSelectors } from '@/store/bookingsSlice'
import { receiveCampingPlaceFromWebSocket } from '@/store/campingPlacesSlice'
import { receiveCampingItemFromWebSocket } from '@/store/campingItemsSlice'
import type { Booking, BookingStatusChange, CampingPlace, CampingItem, BookingItemData } from '@/api/types'

const mockCampingPlace = (overrides: Partial<CampingPlace> = {}): CampingPlace => ({
  id: 1, name: 'Platz A', description: null, location: 'Nord', size: 50, price: 25,
  amenities: 'Strom', isActive: true, createdAt: '', updatedAt: '', ...overrides
})

const mockCampingItem = (overrides: Partial<CampingItem> = {}): CampingItem => ({
  id: 5, name: 'Zelt', category: 'Unterkunft', size: 10, description: null,
  isActive: true, createdAt: '', updatedAt: '', ...overrides
})

const mockBookingItem = (overrides: Partial<BookingItemData> = {}): BookingItemData => ({
  id: 1, bookingId: 1, campingItemId: 5, quantity: 2,
  campingItem: mockCampingItem(), createdAt: '', updatedAt: '', ...overrides
})

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

  it('updates embedded campingPlace when receiveCampingPlaceFromWebSocket is dispatched', () =>
  {
    const booking = mockBooking({ campingPlaceId: 1, campingPlace: mockCampingPlace({ id: 1, name: 'Old Name' }) })
    const initial = reducer(undefined, fetchBookings.fulfilled([booking], '', undefined))
    const state = reducer(initial, receiveCampingPlaceFromWebSocket(mockCampingPlace({ id: 1, name: 'New Name' })))
    const updated = bookingsSelectors.selectById({ bookings: state } as never, 1)
    expect(updated?.campingPlace.name).toBe('New Name')
  })

  it('does not affect bookings with different campingPlaceId', () =>
  {
    const booking = mockBooking({ campingPlaceId: 1, campingPlace: mockCampingPlace({ id: 1, name: 'Original' }) })
    const initial = reducer(undefined, fetchBookings.fulfilled([booking], '', undefined))
    const state = reducer(initial, receiveCampingPlaceFromWebSocket(mockCampingPlace({ id: 99, name: 'Other' })))
    const unchanged = bookingsSelectors.selectById({ bookings: state } as never, 1)
    expect(unchanged?.campingPlace.name).toBe('Original')
  })

  it('updates embedded campingItem in bookingItems when receiveCampingItemFromWebSocket is dispatched', () =>
  {
    const booking = mockBooking({
      campingPlace: mockCampingPlace(),
      bookingItems: [mockBookingItem({ campingItemId: 5, campingItem: mockCampingItem({ id: 5, name: 'Old Item' }) })]
    })
    const initial = reducer(undefined, fetchBookings.fulfilled([booking], '', undefined))
    const state = reducer(initial, receiveCampingItemFromWebSocket(mockCampingItem({ id: 5, name: 'Updated Item' })))
    const updated = bookingsSelectors.selectById({ bookings: state } as never, 1)
    expect(updated?.bookingItems[0].campingItem.name).toBe('Updated Item')
  })

  it('does not affect bookingItems with different campingItemId', () =>
  {
    const booking = mockBooking({
      campingPlace: mockCampingPlace(),
      bookingItems: [mockBookingItem({ campingItemId: 5, campingItem: mockCampingItem({ id: 5, name: 'Original Item' }) })]
    })
    const initial = reducer(undefined, fetchBookings.fulfilled([booking], '', undefined))
    const state = reducer(initial, receiveCampingItemFromWebSocket(mockCampingItem({ id: 99, name: 'Other Item' })))
    const unchanged = bookingsSelectors.selectById({ bookings: state } as never, 1)
    expect(unchanged?.bookingItems[0].campingItem.name).toBe('Original Item')
  })
})
