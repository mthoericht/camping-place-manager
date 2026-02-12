import { describe, it, expect, beforeEach, beforeAll } from 'vitest'
import { ApiError } from '@/api/client'
import * as campingPlacesApi from '@/api/campingPlaces'
import * as campingItemsApi from '@/api/campingItems'
import * as bookingsApi from '@/api/bookings'

let clearDb: () => Promise<void>

beforeAll(async () => 
{
  const { setupIntegrationTest } = await import('../../server/src/test/integrationEnv')
  const env = setupIntegrationTest()
  clearDb = env.clearDb
})

describe('API Integration: Bookings', () => 
{
  beforeEach(async () => 
  {
    await clearDb()
  })

  it('createBooking calculates totalPrice', async () => 
  {
    const place = await campingPlacesApi.createCampingPlace({ name: 'Buchbar', location: 'X', size: 50, price: 35 })
    const booking = await bookingsApi.createBooking({
      campingPlaceId: place.id,
      customerName: 'Max',
      customerEmail: 'max@test.de',
      guests: 2,
      startDate: '2025-07-01',
      endDate: '2025-07-04'
    })
    expect(booking.totalPrice).toBe(105)
    expect(booking.status).toBe('PENDING')
  })

  it('createBooking throws 400 when camping place does not exist', async () => 
  {
    await expect(bookingsApi.createBooking({
      campingPlaceId: 99999,
      customerName: 'X',
      customerEmail: 'x@x.de',
      guests: 1,
      startDate: '2025-01-01',
      endDate: '2025-01-02'
    })).rejects.toMatchObject({ status: 400 })
    const err = await bookingsApi.createBooking({
      campingPlaceId: 99999,
      customerName: 'X',
      customerEmail: 'x@x.de',
      guests: 1,
      startDate: '2025-01-01',
      endDate: '2025-01-02'
    }).catch((e) => e)
    expect((err as ApiError).message).toContain('Stellplatz')
  })

  it('createBooking with bookingItems creates booking and items', async () => 
  {
    const place = await campingPlacesApi.createCampingPlace({ name: 'B', location: 'X', size: 50, price: 30 })
    const item = await campingItemsApi.createCampingItem({ name: 'Zelt', category: 'U', size: 1 })
    const booking = await bookingsApi.createBooking({
      campingPlaceId: place.id,
      customerName: 'Max',
      customerEmail: 'max@test.de',
      guests: 2,
      startDate: '2025-07-01',
      endDate: '2025-07-04',
      bookingItems: [{ campingItemId: item.id, quantity: 2 }]
    })
    expect(booking.totalPrice).toBe(90)
    expect(booking.bookingItems).toHaveLength(1)
    expect(booking.bookingItems[0].quantity).toBe(2)
    expect(booking.bookingItems[0].campingItem.name).toBe('Zelt')
  })

  it('createBooking throws 400 when bookingItems reference non-existent item', async () => 
  {
    const place = await campingPlacesApi.createCampingPlace({ name: 'B', location: 'X', size: 50, price: 30 })
    await expect(bookingsApi.createBooking({
      campingPlaceId: place.id,
      customerName: 'Max',
      customerEmail: 'max@test.de',
      guests: 1,
      startDate: '2025-07-01',
      endDate: '2025-07-02',
      bookingItems: [{ campingItemId: 99999, quantity: 1 }]
    })).rejects.toMatchObject({ status: 400 })
  })

  it('fetchBookings returns empty array when no bookings', async () => 
  {
    const list = await bookingsApi.fetchBookings()
    expect(list).toEqual([])
  })

  it('fetchBookings filters by campingPlaceId', async () => 
  {
    const place1 = await campingPlacesApi.createCampingPlace({ name: 'P1', location: 'L', size: 40, price: 20 })
    const place2 = await campingPlacesApi.createCampingPlace({ name: 'P2', location: 'L', size: 40, price: 25 })
    await bookingsApi.createBooking({
      campingPlaceId: place1.id,
      customerName: 'A',
      customerEmail: 'a@t.de',
      guests: 1,
      startDate: '2025-06-01',
      endDate: '2025-06-02'
    })
    await bookingsApi.createBooking({
      campingPlaceId: place2.id,
      customerName: 'B',
      customerEmail: 'b@t.de',
      guests: 1,
      startDate: '2025-06-02',
      endDate: '2025-06-03'
    })
    const list = await bookingsApi.fetchBookings({ campingPlaceId: String(place1.id) })
    expect(list).toHaveLength(1)
    expect(list[0].campingPlaceId).toBe(place1.id)
  })

  it('fetchBookings filters by status', async () => 
  {
    const place = await campingPlacesApi.createCampingPlace({ name: 'P', location: 'L', size: 40, price: 20 })
    await bookingsApi.createBooking({
      campingPlaceId: place.id,
      customerName: 'A',
      customerEmail: 'a@t.de',
      guests: 1,
      startDate: '2025-06-01',
      endDate: '2025-06-02'
    })
    const list = await bookingsApi.fetchBookings({ status: 'PENDING' })
    expect(list).toHaveLength(1)
    expect(list[0].status).toBe('PENDING')
  })

  it('fetchBookingById returns booking with place, items, statusChanges', async () => 
  {
    const place = await campingPlacesApi.createCampingPlace({ name: 'B', location: 'X', size: 50, price: 35 })
    const booking = await bookingsApi.createBooking({
      campingPlaceId: place.id,
      customerName: 'Max',
      customerEmail: 'max@test.de',
      guests: 2,
      startDate: '2025-07-01',
      endDate: '2025-07-04'
    })
    const fetched = await bookingsApi.fetchBookingById(booking.id)
    expect(fetched.id).toBe(booking.id)
    expect(fetched.campingPlace).toBeDefined()
    expect(fetched.campingPlace.name).toBe('B')
    expect(fetched.bookingItems).toEqual([])
    expect(fetched.statusChanges).toHaveLength(1)
    expect(fetched.statusChanges[0].status).toBe('PENDING')
  })

  it('fetchBookingById throws 404 when id does not exist', async () => 
  {
    await expect(bookingsApi.fetchBookingById(99999)).rejects.toMatchObject({ status: 404 })
  })

  it('updateBooking recalculates totalPrice', async () => 
  {
    const place = await campingPlacesApi.createCampingPlace({ name: 'P', location: 'L', size: 50, price: 30 })
    const booking = await bookingsApi.createBooking({
      campingPlaceId: place.id,
      customerName: 'A',
      customerEmail: 'a@t.de',
      guests: 1,
      startDate: '2025-06-01',
      endDate: '2025-06-03'
    })
    expect(booking.totalPrice).toBe(60)
    const updated = await bookingsApi.updateBooking(booking.id, { endDate: '2025-06-05' })
    expect(updated.totalPrice).toBe(120)
  })

  it('updateBooking throws 404 when id does not exist', async () => 
  {
    await expect(bookingsApi.updateBooking(99999, { customerName: 'X' })).rejects.toMatchObject({ status: 404 })
  })

  it('deleteBooking deletes and returns 204', async () => 
  {
    const place = await campingPlacesApi.createCampingPlace({ name: 'P', location: 'L', size: 40, price: 20 })
    const booking = await bookingsApi.createBooking({
      campingPlaceId: place.id,
      customerName: 'K',
      customerEmail: 'k@t.de',
      guests: 1,
      startDate: '2025-06-01',
      endDate: '2025-06-02'
    })
    await bookingsApi.deleteBooking(booking.id)
    await expect(bookingsApi.fetchBookingById(booking.id)).rejects.toMatchObject({ status: 404 })
  })

  it('changeBookingStatus updates status', async () => 
  {
    const place = await campingPlacesApi.createCampingPlace({ name: 'P', location: 'L', size: 40, price: 20 })
    const booking = await bookingsApi.createBooking({
      campingPlaceId: place.id,
      customerName: 'K',
      customerEmail: 'k@t.de',
      guests: 1,
      startDate: '2025-06-01',
      endDate: '2025-06-02'
    })
    const updated = await bookingsApi.changeBookingStatus(booking.id, 'CONFIRMED')
    expect(updated.status).toBe('CONFIRMED')
  })

  it('changeBookingStatus throws 400 when status is empty', async () => 
  {
    const place = await campingPlacesApi.createCampingPlace({ name: 'P', location: 'L', size: 40, price: 20 })
    const booking = await bookingsApi.createBooking({
      campingPlaceId: place.id,
      customerName: 'K',
      customerEmail: 'k@t.de',
      guests: 1,
      startDate: '2025-06-01',
      endDate: '2025-06-02'
    })
    await expect(bookingsApi.changeBookingStatus(booking.id, '' as never)).rejects.toMatchObject({ status: 400 })
  })

  it('fetchBookingStatusChanges returns changes in order', async () => 
  {
    const place = await campingPlacesApi.createCampingPlace({ name: 'P', location: 'L', size: 40, price: 20 })
    const booking = await bookingsApi.createBooking({
      campingPlaceId: place.id,
      customerName: 'K',
      customerEmail: 'k@t.de',
      guests: 1,
      startDate: '2025-06-01',
      endDate: '2025-06-02'
    })
    await bookingsApi.changeBookingStatus(booking.id, 'CONFIRMED')
    const changes = await bookingsApi.fetchBookingStatusChanges(booking.id)
    expect(changes).toHaveLength(2)
    expect(changes[0].status).toBe('PENDING')
    expect(changes[1].status).toBe('CONFIRMED')
  })

  it('fetchBookingItems and addBookingItem return items with campingItem', async () => 
  {
    const place = await campingPlacesApi.createCampingPlace({ name: 'P', location: 'L', size: 40, price: 20 })
    const item = await campingItemsApi.createCampingItem({ name: 'Zelt', category: 'U', size: 1 })
    const booking = await bookingsApi.createBooking({
      campingPlaceId: place.id,
      customerName: 'K',
      customerEmail: 'k@t.de',
      guests: 1,
      startDate: '2025-06-01',
      endDate: '2025-06-02'
    })
    await bookingsApi.addBookingItem(booking.id, { campingItemId: item.id, quantity: 2 })
    const items = await bookingsApi.fetchBookingItems(booking.id)
    expect(items).toHaveLength(1)
    expect(items[0].quantity).toBe(2)
    expect(items[0].campingItem.name).toBe('Zelt')
  })

  it('addBookingItem returns 201 with item', async () => 
  {
    const place = await campingPlacesApi.createCampingPlace({ name: 'P', location: 'L', size: 40, price: 20 })
    const item = await campingItemsApi.createCampingItem({ name: 'Lampe', category: 'A', size: 1 })
    const booking = await bookingsApi.createBooking({
      campingPlaceId: place.id,
      customerName: 'K',
      customerEmail: 'k@t.de',
      guests: 1,
      startDate: '2025-06-01',
      endDate: '2025-06-02'
    })
    const added = await bookingsApi.addBookingItem(booking.id, { campingItemId: item.id, quantity: 3 })
    expect(added).toMatchObject({ quantity: 3 })
    expect(added.campingItem.name).toBe('Lampe')
  })

  it('addBookingItem throws 400 when campingItemId does not exist', async () => 
  {
    const place = await campingPlacesApi.createCampingPlace({ name: 'P', location: 'L', size: 40, price: 20 })
    const booking = await bookingsApi.createBooking({
      campingPlaceId: place.id,
      customerName: 'K',
      customerEmail: 'k@t.de',
      guests: 1,
      startDate: '2025-06-01',
      endDate: '2025-06-02'
    })
    await expect(bookingsApi.addBookingItem(booking.id, { campingItemId: 99999, quantity: 1 })).rejects.toMatchObject({ status: 400 })
  })

  it('removeBookingItem removes item', async () => 
  {
    const place = await campingPlacesApi.createCampingPlace({ name: 'P', location: 'L', size: 40, price: 20 })
    const item = await campingItemsApi.createCampingItem({ name: 'Zelt', category: 'U', size: 1 })
    const booking = await bookingsApi.createBooking({
      campingPlaceId: place.id,
      customerName: 'K',
      customerEmail: 'k@t.de',
      guests: 1,
      startDate: '2025-06-01',
      endDate: '2025-06-02'
    })
    const added = await bookingsApi.addBookingItem(booking.id, { campingItemId: item.id, quantity: 1 })
    await bookingsApi.removeBookingItem(booking.id, added.id)
    const items = await bookingsApi.fetchBookingItems(booking.id)
    expect(items).toHaveLength(0)
  })
})
