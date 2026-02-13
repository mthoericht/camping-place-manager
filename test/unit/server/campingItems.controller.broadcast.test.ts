import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as campingItemsController from '../../../server/src/controllers/campingItems.controller'
import * as broadcastModule from '../../../server/src/ws/broadcast'
import * as service from '../../../server/src/services/campingItems.service'

vi.mock('../../../server/src/ws/broadcast', () => ({ broadcast: vi.fn() }))
vi.mock('../../../server/src/services/campingItems.service', () => ({
  getAllCampingItems: vi.fn(),
  getCampingItemById: vi.fn(),
  createCampingItem: vi.fn(),
  updateCampingItem: vi.fn(),
  deleteCampingItem: vi.fn(),
}))

const mockBroadcast = vi.mocked(broadcastModule.broadcast)

const mockReq = (body: object = {}, params: Record<string, string> = {}) =>
  ({ body, params, query: {} }) as unknown as Parameters<typeof campingItemsController.create>[0]
const mockRes = () =>
{
  const res = { status: vi.fn().mockReturnThis(), json: vi.fn(), end: vi.fn() }
  return res as unknown as Parameters<typeof campingItemsController.create>[1]
}
const mockNext = vi.fn()

const fakeItem = {
  id: 1,
  name: 'Item',
  category: 'Tent',
  size: 10,
  description: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('campingItems.controller broadcast', () =>
{
  beforeEach(() =>
  {
    vi.clearAllMocks()
  })

  it('calls broadcast with campingItems/created after create', async () =>
  {
    vi.mocked(service.createCampingItem).mockResolvedValue(fakeItem)
    const res = mockRes()
    await campingItemsController.create(mockReq({}), res, mockNext)
    expect(mockBroadcast).toHaveBeenCalledWith({ type: 'campingItems/created', payload: fakeItem })
  })

  it('calls broadcast with campingItems/updated after update', async () =>
  {
    vi.mocked(service.updateCampingItem).mockResolvedValue(fakeItem)
    const res = mockRes()
    await campingItemsController.update(mockReq({}, { id: '1' }), res, mockNext)
    expect(mockBroadcast).toHaveBeenCalledWith({ type: 'campingItems/updated', payload: fakeItem })
  })

  it('calls broadcast with campingItems/deleted after remove', async () =>
  {
    vi.mocked(service.deleteCampingItem).mockResolvedValue(undefined as never)
    const res = mockRes()
    await campingItemsController.remove(mockReq({}, { id: '5' }), res, mockNext)
    expect(mockBroadcast).toHaveBeenCalledWith({ type: 'campingItems/deleted', payload: { id: 5 } })
  })
})
