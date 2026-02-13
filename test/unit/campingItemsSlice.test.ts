import { describe, it, expect } from 'vitest'
import reducer, { fetchCampingItems, createCampingItem, updateCampingItem, deleteCampingItem, receiveCampingItemFromWebSocket, receiveCampingItemDeletedFromWebSocket, campingItemsSelectors } from '@/store/campingItemsSlice'
import type { RootState } from '@/store/store'
import type { CampingItem, CampingItemFormData } from '@/api/types'

const mockItem = (overrides: Partial<CampingItem> = {}): CampingItem => ({
  id: 1, name: 'Zelt', category: 'Unterkunft', size: 10, description: null,
  isActive: true, createdAt: '', updatedAt: '', ...overrides
})

describe('campingItemsSlice', () =>
{
  it('sets loading and clears error on fetchCampingItems.pending', () =>
  {
    const state = reducer(undefined, fetchCampingItems.pending('requestId'))
    expect(state.status).toBe('loading')
    expect(state.error).toBeNull()
  })

  it('stores items and sets succeeded on fetchCampingItems.fulfilled', () =>
  {
    const list = [mockItem({ id: 1 }), mockItem({ id: 2 })]
    const state = reducer(undefined, fetchCampingItems.fulfilled(list, 'requestId'))
    expect(state.status).toBe('succeeded')
    expect(campingItemsSelectors.selectIds({ campingItems: state } as RootState)).toEqual([1, 2])
  })

  it('sets failed and error on fetchCampingItems.rejected', () =>
  {
    const state = reducer(undefined, fetchCampingItems.rejected(null, 'requestId', undefined, 'Netzwerkfehler'))
    expect(state.status).toBe('failed')
    expect(state.error).toBe('Netzwerkfehler')
  })

  it('adds entity on createCampingItem.fulfilled', () =>
  {
    const item = mockItem({ id: 3 })
    const formData: CampingItemFormData = { name: 'Zelt', category: 'Unterkunft', size: 10 }
    const state = reducer(undefined, createCampingItem.fulfilled(item, 'requestId', formData))
    expect(campingItemsSelectors.selectById({ campingItems: state } as RootState, 3)).toEqual(item)
  })

  it('updates entity on updateCampingItem.fulfilled', () =>
  {
    const initial = reducer(undefined, fetchCampingItems.fulfilled([mockItem({ id: 1, name: 'Alt' })], 'requestId'))
    const updated = mockItem({ id: 1, name: 'Neu' })
    const state = reducer(initial, updateCampingItem.fulfilled(updated, 'requestId', { id: 1, data: { name: 'Neu' } }))
    expect(campingItemsSelectors.selectById({ campingItems: state } as RootState, 1)?.name).toBe('Neu')
  })

  it('removes entity on deleteCampingItem.fulfilled', () =>
  {
    const initial = reducer(undefined, fetchCampingItems.fulfilled([mockItem({ id: 1 })], 'requestId'))
    const state = reducer(initial, deleteCampingItem.fulfilled(1, 'requestId', 1))
    expect(campingItemsSelectors.selectById({ campingItems: state } as RootState, 1)).toBeUndefined()
  })

  it('upserts entity on receiveCampingItemFromWebSocket', () =>
  {
    const item = mockItem({ id: 7, name: 'WebSocket Item' })
    const state = reducer(undefined, receiveCampingItemFromWebSocket(item))
    expect(campingItemsSelectors.selectById({ campingItems: state } as RootState, 7)?.name).toBe('WebSocket Item')
  })

  it('removes entity on receiveCampingItemDeletedFromWebSocket', () =>
  {
    const initial = reducer(undefined, fetchCampingItems.fulfilled([mockItem({ id: 1 })], 'requestId'))
    const state = reducer(initial, receiveCampingItemDeletedFromWebSocket(1))
    expect(campingItemsSelectors.selectById({ campingItems: state } as RootState, 1)).toBeUndefined()
  })
})
