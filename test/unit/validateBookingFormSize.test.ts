import { describe, it, expect } from 'vitest';
import { validateBookingFormSize } from '@/features/bookings/useBookingCrud';
import type { BookingFormData, CampingPlace, CampingItem } from '@/api/types';

// helper functions to create mock camping places and items
const place = (id: number, size: number): CampingPlace =>
  ({ id, name: `Place ${id}`, description: null, location: '', size, price: 10, amenities: '', isActive: true, createdAt: '', updatedAt: '' });

// helper function to create mock camping items
const item = (id: number, size: number): CampingItem =>
  ({ id, name: `Item ${id}`, category: 'Tent', size, description: null, isActive: true, createdAt: '', updatedAt: '' });

const ERROR_MSG = 'Die Gesamtgröße der Items überschreitet die Stellplatzgröße';

describe('validateBookingFormSize', () =>
{
  it('returns null when total item size is within place size', () =>
  {
    const places = [place(1, 20)];
    const items = [item(1, 5), item(2, 3)];
    const form: BookingFormData = {
      campingPlaceId: 1,
      customerName: '',
      customerEmail: '',
      guests: 1,
      totalPrice: 0,
      status: 'PENDING',
      bookingItems: [
        { campingItemId: 1, quantity: 2 },
        { campingItemId: 2, quantity: 2 },
      ],
    };
    expect(validateBookingFormSize(form, places, items)).toBeNull();
  });

  it('returns error when total item size exceeds place size', () =>
  {
    const places = [place(1, 10)];
    const items = [item(1, 5), item(2, 3)];
    const form: BookingFormData = {
      campingPlaceId: 1,
      customerName: '',
      customerEmail: '',
      guests: 1,
      totalPrice: 0,
      status: 'PENDING',
      bookingItems: [
        { campingItemId: 1, quantity: 2 },
        { campingItemId: 2, quantity: 2 },
      ],
    };
    expect(validateBookingFormSize(form, places, items)).toBe(ERROR_MSG);
  });

  it('returns null when total equals place size', () =>
  {
    const places = [place(1, 10)];
    const items = [item(1, 5)];
    const form: BookingFormData = {
      campingPlaceId: 1,
      customerName: '',
      customerEmail: '',
      guests: 1,
      totalPrice: 0,
      status: 'PENDING',
      bookingItems: [{ campingItemId: 1, quantity: 2 }],
    };
    expect(validateBookingFormSize(form, places, items)).toBeNull();
  });

  it('returns null when bookingItems is empty', () =>
  {
    const places = [place(1, 5)];
    const items: CampingItem[] = [];
    const form: BookingFormData = {
      campingPlaceId: 1,
      customerName: '',
      customerEmail: '',
      guests: 1,
      totalPrice: 0,
      status: 'PENDING',
      bookingItems: [],
    };
    expect(validateBookingFormSize(form, places, items)).toBeNull();
  });

  it('returns null when place is not found', () =>
  {
    const places = [place(1, 10)];
    const items = [item(1, 100)];
    const form: BookingFormData = {
      campingPlaceId: 99,
      customerName: '',
      customerEmail: '',
      guests: 1,
      totalPrice: 0,
      status: 'PENDING',
      bookingItems: [{ campingItemId: 1, quantity: 1 }],
    };
    expect(validateBookingFormSize(form, places, items)).toBeNull();
  });

  it('returns null when campingPlaceId is 0', () =>
  {
    const places = [place(1, 10)];
    const items = [item(1, 5)];
    const form: BookingFormData = {
      campingPlaceId: 0,
      customerName: '',
      customerEmail: '',
      guests: 1,
      totalPrice: 0,
      status: 'PENDING',
      bookingItems: [{ campingItemId: 1, quantity: 2 }],
    };
    expect(validateBookingFormSize(form, places, items)).toBeNull();
  });
});
