import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as bookingsController from '../../../server/src/controllers/bookings.controller';
import * as broadcastModule from '../../../server/src/ws/broadcast';
import * as service from '../../../server/src/services/bookings.service';

vi.mock('../../../server/src/ws/broadcast', () => ({ broadcast: vi.fn() }));
vi.mock('../../../server/src/services/bookings.service', () => ({
  getAllBookings: vi.fn(),
  getBookingById: vi.fn(),
  createBooking: vi.fn(),
  updateBooking: vi.fn(),
  deleteBooking: vi.fn(),
  changeBookingStatus: vi.fn(),
  getBookingStatusChanges: vi.fn(),
  getBookingItems: vi.fn(),
  addBookingItem: vi.fn(),
  removeBookingItem: vi.fn(),
}));

const mockBroadcast = vi.mocked(broadcastModule.broadcast);

const mockReq = (body: object = {}, params: Record<string, string> = {}) =>
  ({ body, params, query: {} }) as unknown as Parameters<typeof bookingsController.create>[0];
const mockRes = () =>
{
  const res = { status: vi.fn().mockReturnThis(), json: vi.fn(), end: vi.fn() };
  return res as unknown as Parameters<typeof bookingsController.create>[1];
};
const mockNext = vi.fn();

const fakeCampingPlace = {
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

const fakeBooking = {
  id: 1,
  campingPlaceId: 1,
  customerName: 'Test',
  customerEmail: 'a@b.de',
  customerPhone: null,
  startDate: null,
  endDate: null,
  guests: 2,
  totalPrice: 100,
  status: 'PENDING' as const,
  notes: null,
  campingPlace: fakeCampingPlace,
  bookingItems: [],
  statusChanges: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('bookings.controller broadcast', () =>
{
  beforeEach(() =>
  {
    vi.clearAllMocks();
  });

  it('calls broadcast with bookings/created after create', async () =>
  {
    vi.mocked(service.createBooking).mockResolvedValue(fakeBooking);
    const res = mockRes();
    await bookingsController.create(mockReq({ campingPlaceId: 1, customerName: 'Test', customerEmail: 'a@b.de', guests: 2 }), res, mockNext);
    expect(mockBroadcast).toHaveBeenCalledTimes(1);
    expect(mockBroadcast).toHaveBeenCalledWith({ type: 'bookings/created', payload: fakeBooking });
  });

  it('calls broadcast with bookings/updated after update', async () =>
  {
    vi.mocked(service.updateBooking).mockResolvedValue(fakeBooking);
    const res = mockRes();
    await bookingsController.update(mockReq({}, { id: '1' }), res, mockNext);
    expect(mockBroadcast).toHaveBeenCalledWith({ type: 'bookings/updated', payload: fakeBooking });
  });

  it('calls broadcast with bookings/deleted after remove', async () =>
  {
    vi.mocked(service.deleteBooking).mockResolvedValue(undefined as never);
    const res = mockRes();
    await bookingsController.remove(mockReq({}, { id: '42' }), res, mockNext);
    expect(mockBroadcast).toHaveBeenCalledWith({ type: 'bookings/deleted', payload: { id: 42 } });
  });

  it('calls broadcast with bookings/updated after changeStatus', async () =>
  {
    vi.mocked(service.changeBookingStatus).mockResolvedValue(fakeBooking);
    const res = mockRes();
    await bookingsController.changeStatus(mockReq({ status: 'CONFIRMED' }, { id: '1' }), res, mockNext);
    expect(mockBroadcast).toHaveBeenCalledWith({ type: 'bookings/updated', payload: fakeBooking });
  });
});
