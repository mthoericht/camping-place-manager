import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { RootState } from '@/store/store';
import type { Booking } from '@/api/types';
import reducer, { fetchBookings } from '@/store/bookingsSlice';
import { useFilteredBookings } from '@/features/bookings/useFilteredBookings';

const mockBooking = (overrides: Partial<Booking> = {}): Booking => ({
  id: 1,
  campingPlaceId: 1,
  customerName: 'Test',
  customerEmail: 'test@example.com',
  customerPhone: null,
  startDate: '2025-01-01',
  endDate: '2025-01-03',
  guests: 2,
  totalPrice: 100,
  status: 'PENDING',
  notes: null,
  campingPlace: {} as Booking['campingPlace'],
  bookingItems: [],
  statusChanges: [],
  createdAt: '',
  updatedAt: '',
  ...overrides,
});

let mockBookingsState: ReturnType<typeof reducer>;

vi.mock('@/store/store', () => ({
  useAppSelector: vi.fn((selector: (state: RootState) => unknown) =>
    selector({ bookings: mockBookingsState } as RootState)
  ),
}));

describe('useFilteredBookings', () =>
{
  beforeEach(() =>
  {
    const bookings = [
      mockBooking({ id: 1, status: 'PENDING', customerName: 'Anna Müller', customerEmail: 'anna@example.com', customerPhone: null }),
      mockBooking({ id: 2, status: 'PAID', customerName: 'Bob Schmidt', customerEmail: 'bob@test.de', customerPhone: '+49 171 123456' }),
      mockBooking({ id: 3, status: 'PAID', customerName: 'Clara Weber', customerEmail: 'clara@example.com', customerPhone: '0172 987654' }),
      mockBooking({ id: 4, status: 'CANCELLED', customerName: 'David Fischer', customerEmail: 'david@test.de', customerPhone: null }),
    ];
    mockBookingsState = reducer(undefined, fetchBookings.fulfilled(bookings, '', undefined));
  });

  it('returns all bookings when statusFilter is empty', () =>
  {
    const { result } = renderHook(() => useFilteredBookings());

    expect(result.current.statusFilter).toBe('');
    expect(result.current.bookings).toHaveLength(4);
    expect(result.current.bookings.map((b) => b.status)).toEqual(['PENDING', 'PAID', 'PAID', 'CANCELLED']);
  });

  it('returns only bookings with selected status when filter is set', () =>
  {
    const { result } = renderHook(() => useFilteredBookings());

    act(() => result.current.setStatusFilter('PAID'));

    expect(result.current.statusFilter).toBe('PAID');
    expect(result.current.bookings).toHaveLength(2);
    expect(result.current.bookings.every((b) => b.status === 'PAID')).toBe(true);
  });

  it('returns single booking when filtering by CANCELLED', () =>
  {
    const { result } = renderHook(() => useFilteredBookings());

    act(() => result.current.setStatusFilter('CANCELLED'));

    expect(result.current.bookings).toHaveLength(1);
    expect(result.current.bookings[0].status).toBe('CANCELLED');
  });

  it('returns empty list when no booking has selected status', () =>
  {
    const { result } = renderHook(() => useFilteredBookings());

    act(() => result.current.setStatusFilter('COMPLETED'));

    expect(result.current.bookings).toHaveLength(0);
  });

  it('resetting filter to empty shows all bookings again', () =>
  {
    const { result } = renderHook(() => useFilteredBookings());

    act(() => result.current.setStatusFilter('PAID'));
    expect(result.current.bookings).toHaveLength(2);

    act(() => result.current.setStatusFilter(''));
    expect(result.current.statusFilter).toBe('');
    expect(result.current.bookings).toHaveLength(4);
  });

  it('initial searchTerm is empty', () =>
  {
    const { result } = renderHook(() => useFilteredBookings());
    expect(result.current.searchTerm).toBe('');
  });

  it('filters by customer name (case-insensitive)', () =>
  {
    const { result } = renderHook(() => useFilteredBookings());

    act(() => result.current.setSearchTerm('anna'));
    expect(result.current.bookings).toHaveLength(1);
    expect(result.current.bookings[0].customerName).toBe('Anna Müller');

    act(() => result.current.setSearchTerm('SCHMIDT'));
    expect(result.current.bookings).toHaveLength(1);
    expect(result.current.bookings[0].customerName).toBe('Bob Schmidt');
  });

  it('filters by customer email', () =>
  {
    const { result } = renderHook(() => useFilteredBookings());

    act(() => result.current.setSearchTerm('test.de'));
    expect(result.current.bookings).toHaveLength(2);
    expect(result.current.bookings.map((b) => b.customerEmail)).toContain('bob@test.de');
    expect(result.current.bookings.map((b) => b.customerEmail)).toContain('david@test.de');
  });

  it('filters by customer phone', () =>
  {
    const { result } = renderHook(() => useFilteredBookings());

    act(() => result.current.setSearchTerm('171'));
    expect(result.current.bookings).toHaveLength(1);
    expect(result.current.bookings[0].customerPhone).toBe('+49 171 123456');
  });

  it('search and status filter combine', () =>
  {
    const { result } = renderHook(() => useFilteredBookings());

    act(() => result.current.setSearchTerm('example'));
    act(() => result.current.setStatusFilter('PAID'));
    expect(result.current.bookings).toHaveLength(1);
    expect(result.current.bookings[0].customerEmail).toBe('clara@example.com');
    expect(result.current.bookings[0].status).toBe('PAID');
  });

  it('empty searchTerm shows all (status-filtered) bookings', () =>
  {
    const { result } = renderHook(() => useFilteredBookings());

    act(() => result.current.setSearchTerm('nomat ch'));
    expect(result.current.bookings).toHaveLength(0);

    act(() => result.current.setSearchTerm(''));
    expect(result.current.bookings).toHaveLength(4);
  });
});
