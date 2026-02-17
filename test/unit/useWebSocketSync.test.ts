import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleWebSocketMessage } from '@/hooks/useWebSocketSync';
import { receiveBookingFromWebSocket, receiveBookingDeletedFromWebSocket } from '@/store/bookingsSlice';
import { receiveCampingPlaceFromWebSocket, receiveCampingPlaceDeletedFromWebSocket } from '@/store/campingPlacesSlice';
import { receiveCampingItemFromWebSocket, receiveCampingItemDeletedFromWebSocket } from '@/store/campingItemsSlice';
import type { Booking, CampingPlace, CampingItem } from '@/api/types';

const mockBooking: Booking = {
  id: 1,
  campingPlaceId: 1,
  customerName: 'Test',
  customerEmail: 'test@test.de',
  customerPhone: null,
  startDate: null,
  endDate: null,
  guests: 2,
  totalPrice: 100,
  status: 'PENDING',
  notes: null,
  campingPlace: {} as CampingPlace,
  bookingItems: [],
  statusChanges: [],
  createdAt: '',
  updatedAt: '',
};

const mockPlace: CampingPlace = {
  id: 1,
  name: 'Place',
  description: null,
  location: 'Here',
  size: 50,
  price: 20,
  amenities: '',
  isActive: true,
  createdAt: '',
  updatedAt: '',
};

const mockItem: CampingItem = {
  id: 1,
  name: 'Item',
  category: 'Tent',
  size: 10,
  description: null,
  isActive: true,
  createdAt: '',
  updatedAt: '',
};

describe('handleWebSocketMessage', () =>
{
  let dispatch: ReturnType<typeof vi.fn>;

  beforeEach(() =>
  {
    dispatch = vi.fn();
  });

  it('dispatches receiveBookingFromWebSocket on bookings/created', () =>
  {
    handleWebSocketMessage({ type: 'bookings/created', payload: mockBooking }, dispatch);
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(receiveBookingFromWebSocket(mockBooking));
  });

  it('dispatches receiveBookingFromWebSocket on bookings/updated', () =>
  {
    handleWebSocketMessage({ type: 'bookings/updated', payload: mockBooking }, dispatch);
    expect(dispatch).toHaveBeenCalledWith(receiveBookingFromWebSocket(mockBooking));
  });

  it('dispatches receiveBookingDeletedFromWebSocket on bookings/deleted', () =>
  {
    handleWebSocketMessage({ type: 'bookings/deleted', payload: { id: 42 } }, dispatch);
    expect(dispatch).toHaveBeenCalledWith(receiveBookingDeletedFromWebSocket(42));
  });

  it('dispatches receiveCampingPlaceFromWebSocket on campingPlaces/created', () =>
  {
    handleWebSocketMessage({ type: 'campingPlaces/created', payload: mockPlace }, dispatch);
    expect(dispatch).toHaveBeenCalledWith(receiveCampingPlaceFromWebSocket(mockPlace));
  });

  it('dispatches receiveCampingPlaceFromWebSocket on campingPlaces/updated', () =>
  {
    handleWebSocketMessage({ type: 'campingPlaces/updated', payload: mockPlace }, dispatch);
    expect(dispatch).toHaveBeenCalledWith(receiveCampingPlaceFromWebSocket(mockPlace));
  });

  it('dispatches receiveCampingPlaceDeletedFromWebSocket on campingPlaces/deleted', () =>
  {
    handleWebSocketMessage({ type: 'campingPlaces/deleted', payload: { id: 10 } }, dispatch);
    expect(dispatch).toHaveBeenCalledWith(receiveCampingPlaceDeletedFromWebSocket(10));
  });

  it('dispatches receiveCampingItemFromWebSocket on campingItems/created', () =>
  {
    handleWebSocketMessage({ type: 'campingItems/created', payload: mockItem }, dispatch);
    expect(dispatch).toHaveBeenCalledWith(receiveCampingItemFromWebSocket(mockItem));
  });

  it('dispatches receiveCampingItemFromWebSocket on campingItems/updated', () =>
  {
    handleWebSocketMessage({ type: 'campingItems/updated', payload: mockItem }, dispatch);
    expect(dispatch).toHaveBeenCalledWith(receiveCampingItemFromWebSocket(mockItem));
  });

  it('dispatches receiveCampingItemDeletedFromWebSocket on campingItems/deleted', () =>
  {
    handleWebSocketMessage({ type: 'campingItems/deleted', payload: { id: 5 } }, dispatch);
    expect(dispatch).toHaveBeenCalledWith(receiveCampingItemDeletedFromWebSocket(5));
  });
});
