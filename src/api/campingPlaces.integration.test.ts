import { describe, it, expect, beforeEach, beforeAll } from 'vitest'
import { ApiError } from '@/api/client'
import * as campingPlacesApi from '@/api/campingPlaces'
import * as bookingsApi from '@/api/bookings'

let clearDb: () => Promise<void>

beforeAll(async () => 
{
  const { setupIntegrationTest } = await import('../../server/src/test/integrationEnv')
  const env = setupIntegrationTest()
  clearDb = env.clearDb
})

describe('API Integration: Camping-Plätze', () => 
{
  beforeEach(async () => 
  {
    await clearDb()
  })

  it('fetchCampingPlaces returns empty array when no places exist', async () => 
  {
    const list = await campingPlacesApi.fetchCampingPlaces()
    expect(list).toEqual([])
  })

  it('createCampingPlace and fetchCampingPlaces returns created places', async () => 
  {
    await campingPlacesApi.createCampingPlace({
      name: 'Platz A',
      location: 'Wiese 1',
      size: 50,
      price: 25
    })
    const list = await campingPlacesApi.fetchCampingPlaces()
    expect(list).toHaveLength(1)
    expect(list[0].name).toBe('Platz A')
  })

  it('createCampingPlace returns 201 with full body', async () => 
  {
    const place = await campingPlacesApi.createCampingPlace({
      name: 'Testplatz',
      description: 'Ruhig',
      location: 'Hinten',
      size: 60,
      price: 30
    })
    expect(place).toMatchObject({ name: 'Testplatz', price: 30 })
    expect(place.id).toBeDefined()
  })

  it('fetchCampingPlaceById returns place when id exists', async () => 
  {
    const created = await campingPlacesApi.createCampingPlace({ name: 'Platz X', location: 'Y', size: 45, price: 22 })
    const place = await campingPlacesApi.fetchCampingPlaceById(created.id)
    expect(place).toMatchObject({ id: created.id, name: 'Platz X', price: 22 })
  })

  it('fetchCampingPlaceById throws ApiError 404 when id does not exist', async () => 
  {
    await expect(campingPlacesApi.fetchCampingPlaceById(99999)).rejects.toMatchObject({ status: 404 })
    await expect(campingPlacesApi.fetchCampingPlaceById(99999)).rejects.toThrow(ApiError)
  })

  it('updateCampingPlace updates and returns data', async () => 
  {
    const created = await campingPlacesApi.createCampingPlace({ name: 'Alt', location: 'L', size: 40, price: 20 })
    const updated = await campingPlacesApi.updateCampingPlace(created.id, { name: 'Neu', price: 28 })
    expect(updated).toMatchObject({ id: created.id, name: 'Neu', price: 28 })
  })

  it('updateCampingPlace throws 404 when id does not exist', async () => 
  {
    await expect(campingPlacesApi.updateCampingPlace(99999, { name: 'X' })).rejects.toMatchObject({ status: 404 })
  })

  it('deleteCampingPlace throws 400 when place has active booking', async () => 
  {
    const place = await campingPlacesApi.createCampingPlace({ name: 'P', location: 'L', size: 40, price: 20 })
    await bookingsApi.createBooking({
      campingPlaceId: place.id,
      customerName: 'Kunde',
      customerEmail: 'k@test.de',
      guests: 2,
      startDate: '2025-06-01',
      endDate: '2025-06-03'
    })
    await expect(campingPlacesApi.deleteCampingPlace(place.id)).rejects.toMatchObject({ status: 400 })
    const err = await campingPlacesApi.deleteCampingPlace(place.id).catch((e) => e)
    expect((err as ApiError).message).toContain('aktive Buchungen')
  })

  it('deleteCampingPlace deletes when no active bookings', async () => 
  {
    const place = await campingPlacesApi.createCampingPlace({ name: 'Frei', location: 'L', size: 40, price: 20 })
    await campingPlacesApi.deleteCampingPlace(place.id)
    await expect(campingPlacesApi.fetchCampingPlaceById(place.id)).rejects.toMatchObject({ status: 404 })
  })
})
