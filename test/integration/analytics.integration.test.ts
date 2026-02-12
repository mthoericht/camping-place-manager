import { describe, it, expect, beforeEach } from 'vitest'
import * as campingPlacesApi from '@/api/campingPlaces'
import * as bookingsApi from '@/api/bookings'
import * as analyticsApi from '@/api/analytics'
import { clearDb, loginTestUser } from './helpers'

describe('API Integration: Analytics', () =>
{
  beforeEach(async () =>
  {
    await clearDb()
    await loginTestUser()
  })

  it('fetchAnalytics returns zero values when db empty', async () => 
  {
    const data = await analyticsApi.fetchAnalytics()
    expect(data).toMatchObject({
      totalRevenue: 0,
      totalBookings: 0,
      confirmedBookings: 0,
      pendingBookings: 0,
      cancelledBookings: 0,
      totalPlaces: 0,
      activePlaces: 0,
      totalItems: 0,
      activeItems: 0,
      avgBookingValue: 0,
      avgGuests: 0
    })
    expect(data.revenueByMonth).toEqual([])
    expect(data.bookingsByStatus).toEqual([])
    expect(data.revenueByPlace).toEqual([])
  })

  it('fetchAnalytics returns aggregated data when data exists', async () => 
  {
    const place = await campingPlacesApi.createCampingPlace({ name: 'P', location: 'L', size: 40, price: 30 })
    const booking = await bookingsApi.createBooking({
      campingPlaceId: place.id,
      customerName: 'A',
      customerEmail: 'a@t.de',
      guests: 2,
      startDate: '2025-06-01',
      endDate: '2025-06-03'
    })
    await bookingsApi.changeBookingStatus(booking.id, 'CONFIRMED')
    const data = await analyticsApi.fetchAnalytics()
    expect(data.totalBookings).toBe(1)
    expect(data.totalPlaces).toBe(1)
    expect(data.confirmedBookings).toBe(1)
    expect(data.totalRevenue).toBe(60)
    expect(data.avgBookingValue).toBe(60)
    expect(data.avgGuests).toBe(2)
    expect(data.revenueByPlace).toHaveLength(1)
    expect(data.revenueByPlace[0]).toMatchObject({ name: 'P', revenue: 60, bookings: 1 })
  })
})
