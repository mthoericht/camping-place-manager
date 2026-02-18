import { useState } from 'react';
import type { Booking } from '@/api/types';
import { useAppSelector } from '@/store/store';
import { selectBookingsByStatus } from '@/store/bookingsSlice';

export type BookingStatusFilter = '' | Booking['status'];

export type UseFilteredBookingsResult = {
  statusFilter: BookingStatusFilter
  setStatusFilter: (value: BookingStatusFilter) => void
  bookings: Booking[]
};

/**
 * Filter state and memoized list of bookings by status.
 * @returns statusFilter, setStatusFilter, and the filtered bookings list.
 */
export function useFilteredBookings(): UseFilteredBookingsResult
{
  const [statusFilter, setStatusFilter] = useState<BookingStatusFilter>('');
  const bookings = useAppSelector((state) => selectBookingsByStatus(state, statusFilter || undefined));
  return { statusFilter, setStatusFilter, bookings };
}
