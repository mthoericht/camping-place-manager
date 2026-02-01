'use client';

import { useRouter } from 'next/navigation';
import { useBookingForm, type BookingInitialData } from '@/hooks/useBookingForm';
import {
  BookingPlaceSection,
  BookingDatesSection,
  BookingCustomerSection,
  BookingItemsPicker,
  BookingSummary,
} from '@/components/booking';
import {
  FormAlert,
  CrudFormActions,
  FormField,
  Textarea,
  FormContainer,
} from '@/components/ui';

interface BookingFormProps
{
  initialData?: BookingInitialData;
}

export default function BookingForm({ initialData }: BookingFormProps)
{
  const router = useRouter();
  const {
    formData,
    setField,
    selectedItems,
    updateItemQuantity,
    campingPlaces,
    campingItems,
    selectedPlace,
    nights,
    totalPrice,
    totalSize,
    isLoading,
    error,
    isSubmitting,
    handleSubmit,
    isEditMode,
  } = useBookingForm(initialData);

  return (
    <FormContainer title={isEditMode ? 'Edit Booking' : 'New Booking'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {isLoading && <FormAlert variant="info">Loading camping places and items...</FormAlert>}
        {error && <FormAlert variant="error">Error loading data: {error}</FormAlert>}

        <BookingPlaceSection
          campingPlaceId={formData.campingPlaceId}
          campingPlaces={campingPlaces}
          isLoading={isLoading}
          onChange={value => setField('campingPlaceId', value)}
        />

        <BookingDatesSection
          startDate={formData.startDate}
          endDate={formData.endDate}
          onStartDateChange={value => setField('startDate', value)}
          onEndDateChange={value => setField('endDate', value)}
        />

        <BookingCustomerSection
          customerName={formData.customerName}
          customerEmail={formData.customerEmail}
          customerPhone={formData.customerPhone}
          guests={formData.guests}
          maxGuests={selectedPlace?.size}
          onFieldChange={(key, value) => setField(key, value as never)}
        />

        {selectedPlace && (
          <BookingItemsPicker
            campingItems={campingItems}
            selectedItems={selectedItems}
            onQuantityChange={updateItemQuantity}
            maxSize={selectedPlace.size}
            totalSize={totalSize}
          />
        )}

        <FormField label="Notes" htmlFor="notes">
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={e => setField('notes', e.target.value)}
            placeholder="Any special requests or notes"
          />
        </FormField>

        {selectedPlace && nights > 0 && (
          <BookingSummary
            placeName={selectedPlace.name}
            pricePerNight={selectedPlace.price}
            nights={nights}
            totalPrice={totalPrice}
          />
        )}

        <CrudFormActions
          isSubmitting={isSubmitting}
          isEditMode={isEditMode}
          onCancel={() => router.back()}
        />
      </form>
    </FormContainer>
  );
}
