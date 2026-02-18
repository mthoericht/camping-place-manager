import { useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { fetchBookingById, changeBookingStatus, fetchBookingStatusChanges, bookingsSelectors } from '@/store/bookingsSlice';
import { toast } from 'sonner';
import type { Booking, BookingStatus, BookingStatusChange } from '@/api/types';

const EMPTY_STATUS_CHANGES: BookingStatusChange[] = [];

/**
 * Fetches and manages a single booking detail: booking entity, status changes, and status update handler.
 * @param bookingId - ID of the booking to load
 * @returns Booking, status changes list, and handleStatusChange callback
 */
export function useBookingDetail(bookingId: number): {booking: Booking | undefined, statusChanges: BookingStatusChange[], handleStatusChange: (status: BookingStatus) => Promise<void>}
{
  const dispatch = useAppDispatch();
  const booking = useAppSelector((state) => bookingsSelectors.selectById(state, bookingId));
  const statusChanges = useAppSelector((state) => state.bookings.statusChanges[bookingId] ?? EMPTY_STATUS_CHANGES);

  useEffect(() => 
  {
    dispatch(fetchBookingById(bookingId));
    dispatch(fetchBookingStatusChanges(bookingId));
  }, [dispatch, bookingId]);

  /**
   * Memoized with useCallback so the function reference stays stable when dispatch and bookingId
   * are unchanged. Prevents unnecessary re-renders of children that receive this handler (e.g.
   * status dropdown) and avoids re-running any effects that depend on handleStatusChange.
   */
  const handleStatusChange = useCallback(async (status: BookingStatus) => 
  {
    try 
    {
      await dispatch(changeBookingStatus({ id: bookingId, status })).unwrap();
      dispatch(fetchBookingStatusChanges(bookingId));
      toast.success('Status aktualisiert');
    }
    catch (err: unknown) 
    {
      toast.error(typeof err === 'string' ? err : err instanceof Error ? err.message : 'Fehler');
    }
  }, [dispatch, bookingId]);

  return { booking, statusChanges, handleStatusChange };
}
