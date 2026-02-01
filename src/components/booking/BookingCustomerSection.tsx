'use client';

import { FormField, Input } from '@/components/ui';

type CustomerFieldKey = 'customerName' | 'customerEmail' | 'customerPhone' | 'guests';

interface CustomerFieldTypes
{
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  guests: number;
}

interface BookingCustomerSectionProps
{
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  guests: number;
  maxGuests?: number;
  onFieldChange: <K extends CustomerFieldKey>(key: K, value: CustomerFieldTypes[K]) => void;
}

export function BookingCustomerSection({
  customerName,
  customerEmail,
  customerPhone,
  guests,
  maxGuests,
  onFieldChange,
}: BookingCustomerSectionProps)
{
  return (
    <>
      <FormField
        label="Number of Guests"
        htmlFor="guests"
        required
        helpText={maxGuests ? `Maximum capacity: ${maxGuests} guests` : undefined}
      >
        <Input
          type="number"
          id="guests"
          required
          min="1"
          max={maxGuests || 10}
          value={guests}
          onChange={e => onFieldChange('guests', parseInt(e.target.value))}
        />
      </FormField>

      <FormField label="Customer Name" htmlFor="customerName" required>
        <Input
          type="text"
          id="customerName"
          required
          value={customerName}
          onChange={e => onFieldChange('customerName', e.target.value)}
          placeholder="Enter customer name"
        />
      </FormField>

      <FormField label="Customer Email" htmlFor="customerEmail" required>
        <Input
          type="email"
          id="customerEmail"
          required
          value={customerEmail}
          onChange={e => onFieldChange('customerEmail', e.target.value)}
          placeholder="Enter customer email"
        />
      </FormField>

      <FormField label="Customer Phone" htmlFor="customerPhone">
        <Input
          type="tel"
          id="customerPhone"
          value={customerPhone}
          onChange={e => onFieldChange('customerPhone', e.target.value)}
          placeholder="Enter customer phone number"
        />
      </FormField>
    </>
  );
}
