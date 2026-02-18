import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as campingPlacesController from '../../../server/src/controllers/campingPlaces.controller';
import * as broadcastModule from '../../../server/src/websockets/broadcast';
import * as service from '../../../server/src/services/campingPlaces.service';

vi.mock('../../../server/src/websockets/broadcast', () => ({ broadcast: vi.fn() }));
vi.mock('../../../server/src/services/campingPlaces.service', () => ({
  getAllCampingPlaces: vi.fn(),
  getCampingPlaceById: vi.fn(),
  createCampingPlace: vi.fn(),
  updateCampingPlace: vi.fn(),
  deleteCampingPlace: vi.fn(),
}));

const mockBroadcast = vi.mocked(broadcastModule.broadcast);

const mockReq = (body: object = {}, params: Record<string, string> = {}) =>
  ({ body, params, query: {} }) as unknown as Parameters<typeof campingPlacesController.create>[0];
const mockRes = () =>
{
  const res = { status: vi.fn().mockReturnThis(), json: vi.fn(), end: vi.fn() };
  return res as unknown as Parameters<typeof campingPlacesController.create>[1];
};
const mockNext = vi.fn();

const fakePlace = {
  id: 1,
  name: 'Place',
  description: null,
  location: 'Here',
  size: 50,
  price: 20,
  amenities: '',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('campingPlaces.controller broadcast', () =>
{
  beforeEach(() =>
  {
    vi.clearAllMocks();
  });

  it('calls broadcast with campingPlaces/created after create', async () =>
  {
    vi.mocked(service.createCampingPlace).mockResolvedValue(fakePlace);
    const res = mockRes();
    await campingPlacesController.create(mockReq({ name: 'Place', location: 'Here', size: 50, price: 20 }), res, mockNext);
    expect(mockBroadcast).toHaveBeenCalledWith({ type: 'campingPlaces/created', payload: fakePlace });
  });

  it('calls broadcast with campingPlaces/updated after update', async () =>
  {
    vi.mocked(service.updateCampingPlace).mockResolvedValue(fakePlace);
    const res = mockRes();
    await campingPlacesController.update(mockReq({}, { id: '1' }), res, mockNext);
    expect(mockBroadcast).toHaveBeenCalledWith({ type: 'campingPlaces/updated', payload: fakePlace });
  });

  it('calls broadcast with campingPlaces/deleted after remove', async () =>
  {
    vi.mocked(service.deleteCampingPlace).mockResolvedValue(undefined as never);
    const res = mockRes();
    await campingPlacesController.remove(mockReq({}, { id: '10' }), res, mockNext);
    expect(mockBroadcast).toHaveBeenCalledWith({ type: 'campingPlaces/deleted', payload: { id: 10 } });
  });
});
