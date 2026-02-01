'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BookingStatus } from '@/lib/shared/types';
import { bookingsApi } from '@/lib/client/api/bookingsApi';

const BOOKING_STATUSES: { value: BookingStatus; label: string; color: string }[] = [
  { value: 'PENDING', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'CONFIRMED', label: 'Confirmed', color: 'bg-green-100 text-green-800' },
  { value: 'PAID', label: 'Paid', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  { value: 'COMPLETED', label: 'Completed', color: 'bg-blue-100 text-blue-800' },
];

interface BookingStatusSelectProps 
{
  bookingId: string;
  currentStatus: BookingStatus;
}

export function BookingStatusSelect({ bookingId, currentStatus }: BookingStatusSelectProps) 
{
  const router = useRouter();
  const [status, setStatus] = useState<BookingStatus>(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: BookingStatus) => 
  {
    if (newStatus === status) return;

    setIsUpdating(true);
    setError(null);

    try 
    {
      await bookingsApi.updateStatus(bookingId, newStatus);
      setStatus(newStatus);
      router.refresh();
    }
    catch (err) 
    {
      setError('Failed to update status');
      console.error('Error updating booking status:', err);
    }
    finally 
    {
      setIsUpdating(false);
    }
  };

  const currentStatusConfig = BOOKING_STATUSES.find(s => s.value === status);

  return (
    <div className="space-y-2">
      <select
        value={status}
        onChange={(e) => handleStatusChange(e.target.value as BookingStatus)}
        disabled={isUpdating}
        className={`
          px-3 py-2 rounded-md border font-semibold text-sm
          ${currentStatusConfig?.color || 'bg-gray-100 text-gray-800'}
          ${isUpdating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          focus:outline-none focus:ring-2 focus:ring-blue-500
        `}
      >
        {BOOKING_STATUSES.map((statusOption) => (
          <option key={statusOption.value} value={statusOption.value}>
            {statusOption.label}
          </option>
        ))}
      </select>
      {isUpdating && (
        <span className="text-sm text-gray-500 ml-2">Updating...</span>
      )}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
