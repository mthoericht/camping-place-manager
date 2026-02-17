import { describe, it, expect } from 'vitest';
import reducer, { fetchCampingPlaces, createCampingPlace, updateCampingPlace, deleteCampingPlace, receiveCampingPlaceFromWebSocket, receiveCampingPlaceDeletedFromWebSocket, campingPlacesSelectors } from '@/store/campingPlacesSlice';
import type { RootState } from '@/store/store';
import type { CampingPlace, CampingPlaceFormData } from '@/api/types';

const mockPlace = (overrides: Partial<CampingPlace> = {}): CampingPlace => ({
  id: 1, name: 'Platz A', description: null, location: 'Nord', size: 50, price: 25,
  amenities: 'Strom', isActive: true, createdAt: '', updatedAt: '', ...overrides
});

describe('campingPlacesSlice', () =>
{
  it('sets loading and clears error on fetchCampingPlaces.pending', () =>
  {
    const state = reducer(undefined, fetchCampingPlaces.pending('requestId'));
    expect(state.status).toBe('loading');
    expect(state.error).toBeNull();
  });

  it('stores places and sets succeeded on fetchCampingPlaces.fulfilled', () =>
  {
    const list = [mockPlace({ id: 1 }), mockPlace({ id: 2 })];
    const state = reducer(undefined, fetchCampingPlaces.fulfilled(list, 'requestId'));
    expect(state.status).toBe('succeeded');
    expect(campingPlacesSelectors.selectIds({ campingPlaces: state } as RootState)).toEqual([1, 2]);
  });

  it('sets failed and error on fetchCampingPlaces.rejected', () =>
  {
    const state = reducer(undefined, fetchCampingPlaces.rejected(null, 'requestId', undefined, 'Netzwerkfehler'));
    expect(state.status).toBe('failed');
    expect(state.error).toBe('Netzwerkfehler');
  });

  it('adds entity on createCampingPlace.fulfilled', () =>
  {
    const place = mockPlace({ id: 3 });
    const formData: CampingPlaceFormData = { name: 'Platz A', location: 'Nord', size: 50, price: 25 };
    const state = reducer(undefined, createCampingPlace.fulfilled(place, 'requestId', formData));
    expect(campingPlacesSelectors.selectById({ campingPlaces: state } as RootState, 3)).toEqual(place);
  });

  it('updates entity on updateCampingPlace.fulfilled', () =>
  {
    const initial = reducer(undefined, fetchCampingPlaces.fulfilled([mockPlace({ id: 1, name: 'Alt' })], 'requestId'));
    const updated = mockPlace({ id: 1, name: 'Neu' });
    const state = reducer(initial, updateCampingPlace.fulfilled(updated, 'requestId', { id: 1, data: { name: 'Neu' } }));
    expect(campingPlacesSelectors.selectById({ campingPlaces: state } as RootState, 1)?.name).toBe('Neu');
  });

  it('removes entity on deleteCampingPlace.fulfilled', () =>
  {
    const initial = reducer(undefined, fetchCampingPlaces.fulfilled([mockPlace({ id: 1 })], 'requestId'));
    const state = reducer(initial, deleteCampingPlace.fulfilled(1, 'requestId', 1));
    expect(campingPlacesSelectors.selectById({ campingPlaces: state } as RootState, 1)).toBeUndefined();
  });

  it('upserts entity on receiveCampingPlaceFromWebSocket', () =>
  {
    const place = mockPlace({ id: 7, name: 'WebSocket Platz' });
    const state = reducer(undefined, receiveCampingPlaceFromWebSocket(place));
    expect(campingPlacesSelectors.selectById({ campingPlaces: state } as RootState, 7)?.name).toBe('WebSocket Platz');
  });

  it('removes entity on receiveCampingPlaceDeletedFromWebSocket', () =>
  {
    const initial = reducer(undefined, fetchCampingPlaces.fulfilled([mockPlace({ id: 1 })], 'requestId'));
    const state = reducer(initial, receiveCampingPlaceDeletedFromWebSocket(1));
    expect(campingPlacesSelectors.selectById({ campingPlaces: state } as RootState, 1)).toBeUndefined();
  });
});
