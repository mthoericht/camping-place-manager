import { useState, useMemo } from 'react';
import type { Booking } from '@/api/types';
import { useAppSelector } from '@/store/store';
import { selectBookingsByStatus } from '@/store/bookingsSlice';

export type BookingStatusFilter = '' | Booking['status'];

export type PlaceFilter = '' | number;

export type UseFilteredBookingsResult = {
  statusFilter: BookingStatusFilter
  setStatusFilter: (value: BookingStatusFilter) => void
  placeFilter: PlaceFilter
  setPlaceFilter: (value: PlaceFilter) => void
  searchTerm: string
  setSearchTerm: (value: string) => void
  bookings: Booking[]
};

function matchesSearch(booking: Booking, term: string): boolean
{
  if (!term.trim()) return true;
  const q = term.trim().toLowerCase();
  const name = (booking.customerName ?? '').toLowerCase();
  const email = (booking.customerEmail ?? '').toLowerCase();
  const phone = (booking.customerPhone ?? '').toLowerCase();
  return name.includes(q) || email.includes(q) || phone.includes(q);
}

/**
 * Filter state and memoized list of bookings by status, place, and search (name, email, phone).
 * @returns statusFilter, setStatusFilter, placeFilter, setPlaceFilter, searchTerm, setSearchTerm, and the filtered bookings list.
 */
export function useFilteredBookings(): UseFilteredBookingsResult
{
  const [statusFilter, setStatusFilter] = useState<BookingStatusFilter>('');
  const [placeFilter, setPlaceFilter] = useState<PlaceFilter>('');
  const [searchTerm, setSearchTerm] = useState('');
  const byStatus = useAppSelector((state) => selectBookingsByStatus(state, statusFilter || undefined));
  const bookings = useMemo(() =>
  {
    const byPlace = placeFilter === '' ? byStatus : byStatus.filter((b) => b.campingPlaceId === placeFilter);
    return searchTerm.trim() === '' ? byPlace : byPlace.filter((b) => matchesSearch(b, searchTerm));
  }, [byStatus, placeFilter, searchTerm]);
  
  return { statusFilter, setStatusFilter, placeFilter, setPlaceFilter, searchTerm, setSearchTerm, bookings };
}
