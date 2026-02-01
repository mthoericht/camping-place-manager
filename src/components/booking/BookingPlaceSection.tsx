'use client';

import { FormField, Select } from '@/components/ui';
import type { CampingPlace } from '@/lib/shared/types';

interface BookingPlaceSectionProps
{
  campingPlaceId: string;
  campingPlaces: CampingPlace[];
  isLoading: boolean;
  onChange: (value: string) => void;
}

export function BookingPlaceSection({
  campingPlaceId,
  campingPlaces,
  isLoading,
  onChange,
}: BookingPlaceSectionProps)
{
  return (
    <FormField label="Camping Place" htmlFor="campingPlaceId" required>
      <Select
        id="campingPlaceId"
        required
        value={campingPlaceId}
        onChange={e => onChange(e.target.value)}
        disabled={isLoading}
      >
        <option value="">Select a camping place</option>
        {campingPlaces.map(place => (
          <option key={place.id} value={place.id}>
            {place.name} - {place.price} €/night (Size: {place.size} m&#178;)
          </option>
        ))}
      </Select>
    </FormField>
  );
}
