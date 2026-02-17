import { describe, it, expect, beforeEach } from 'vitest';
import { ApiError } from '@/api/client';
import * as campingPlacesApi from '@/api/campingPlaces';
import * as campingItemsApi from '@/api/campingItems';
import * as bookingsApi from '@/api/bookings';
import { clearDb, loginTestUser } from './helpers';

describe('API Integration: Camping-Items', () => 
{
  beforeEach(async () => 
  {
    await clearDb();
    await loginTestUser();
  });

  it('fetchCampingItems returns empty array when no items exist', async () => 
  {
    const list = await campingItemsApi.fetchCampingItems();
    expect(list).toEqual([]);
  });

  it('createCampingItem and fetchCampingItems returns created items', async () => 
  {
    await campingItemsApi.createCampingItem({ name: 'Zelt', category: 'Unterkunft', size: 2 });
    const list = await campingItemsApi.fetchCampingItems();
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe('Zelt');
  });

  it('createCampingItem returns 201 with body', async () => 
  {
    const item = await campingItemsApi.createCampingItem({
      name: 'Schlafsack',
      category: 'Ausrüstung',
      size: 1,
      description: 'Warm',
      isActive: true
    });
    expect(item).toMatchObject({ name: 'Schlafsack', category: 'Ausrüstung', size: 1 });
    expect(item.id).toBeDefined();
  });

  it('fetchCampingItemById returns item when id exists', async () => 
  {
    const created = await campingItemsApi.createCampingItem({ name: 'Lampe', category: 'Ausrüstung', size: 1 });
    const item = await campingItemsApi.fetchCampingItemById(created.id);
    expect(item).toMatchObject({ id: created.id, name: 'Lampe' });
  });

  it('fetchCampingItemById throws 404 when id does not exist', async () => 
  {
    await expect(campingItemsApi.fetchCampingItemById(99999)).rejects.toMatchObject({ status: 404 });
  });

  it('updateCampingItem updates and returns data', async () => 
  {
    const created = await campingItemsApi.createCampingItem({ name: 'Alt', category: 'X', size: 1 });
    const updated = await campingItemsApi.updateCampingItem(created.id, { name: 'Neu', description: 'Beschreibung' });
    expect(updated).toMatchObject({ id: created.id, name: 'Neu', description: 'Beschreibung' });
  });

  it('updateCampingItem throws 404 when id does not exist', async () => 
  {
    await expect(campingItemsApi.updateCampingItem(99999, { name: 'X' })).rejects.toMatchObject({ status: 404 });
  });

  it('deleteCampingItem throws 400 when item has active booking', async () => 
  {
    const place = await campingPlacesApi.createCampingPlace({ name: 'P', location: 'L', size: 40, price: 20 });
    const item = await campingItemsApi.createCampingItem({ name: 'Zelt', category: 'U', size: 1 });
    const booking = await bookingsApi.createBooking({
      campingPlaceId: place.id,
      customerName: 'K',
      customerEmail: 'k@t.de',
      guests: 1,
      startDate: '2025-06-01',
      endDate: '2025-06-03'
    });
    await bookingsApi.addBookingItem(booking.id, { campingItemId: item.id, quantity: 1 });
    await expect(campingItemsApi.deleteCampingItem(item.id)).rejects.toMatchObject({ status: 400 });
    const err = await campingItemsApi.deleteCampingItem(item.id).catch((e) => e);
    expect((err as ApiError).message).toContain('aktive Buchungen');
  });

  it('deleteCampingItem deletes when no active bookings', async () => 
  {
    const created = await campingItemsApi.createCampingItem({ name: 'Frei', category: 'X', size: 1 });
    await campingItemsApi.deleteCampingItem(created.id);
    await expect(campingItemsApi.fetchCampingItemById(created.id)).rejects.toMatchObject({ status: 404 });
  });
});
