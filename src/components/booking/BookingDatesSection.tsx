'use client';

import { FormField, Input } from '@/components/ui';

interface BookingDatesSectionProps
{
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
}

export function BookingDatesSection({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: BookingDatesSectionProps)
{
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField label="Check-in Date" htmlFor="startDate" required>
        <Input
          type="date"
          id="startDate"
          required
          value={startDate}
          onChange={e => onStartDateChange(e.target.value)}
        />
      </FormField>

      <FormField label="Check-out Date" htmlFor="endDate" required>
        <Input
          type="date"
          id="endDate"
          required
          value={endDate}
          onChange={e => onEndDateChange(e.target.value)}
        />
      </FormField>
    </div>
  );
}
