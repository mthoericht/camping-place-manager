'use client';

import { useRouter } from 'next/navigation';
import { useBookingForm, type BookingInitialData } from '@/hooks/useBookingForm';
import { FormField, Input, Textarea, Select, Button, FormContainer } from '@/components/ui';

interface BookingFormProps {
  initialData?: BookingInitialData;
}

export default function BookingForm({ initialData }: BookingFormProps) {
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
        {isLoading && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md">
            Loading camping places and items...
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
            Error loading data: {error}
          </div>
        )}

        <FormField label="Camping Place" htmlFor="campingPlaceId" required>
          <Select
            id="campingPlaceId"
            required
            value={formData.campingPlaceId}
            onChange={e => setField('campingPlaceId', e.target.value)}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Check-in Date" htmlFor="startDate" required>
            <Input
              type="date"
              id="startDate"
              required
              value={formData.startDate}
              onChange={e => setField('startDate', e.target.value)}
            />
          </FormField>

          <FormField label="Check-out Date" htmlFor="endDate" required>
            <Input
              type="date"
              id="endDate"
              required
              value={formData.endDate}
              onChange={e => setField('endDate', e.target.value)}
            />
          </FormField>
        </div>

        <FormField
          label="Number of Guests"
          htmlFor="guests"
          required
          helpText={selectedPlace ? `Maximum capacity: ${selectedPlace.size} guests` : undefined}
        >
          <Input
            type="number"
            id="guests"
            required
            min="1"
            max={selectedPlace?.size || 10}
            value={formData.guests}
            onChange={e => setField('guests', parseInt(e.target.value))}
          />
        </FormField>

        <FormField label="Customer Name" htmlFor="customerName" required>
          <Input
            type="text"
            id="customerName"
            required
            value={formData.customerName}
            onChange={e => setField('customerName', e.target.value)}
            placeholder="Enter customer name"
          />
        </FormField>

        <FormField label="Customer Email" htmlFor="customerEmail" required>
          <Input
            type="email"
            id="customerEmail"
            required
            value={formData.customerEmail}
            onChange={e => setField('customerEmail', e.target.value)}
            placeholder="Enter customer email"
          />
        </FormField>

        <FormField label="Customer Phone" htmlFor="customerPhone">
          <Input
            type="tel"
            id="customerPhone"
            value={formData.customerPhone}
            onChange={e => setField('customerPhone', e.target.value)}
            placeholder="Enter customer phone number"
          />
        </FormField>

        {selectedPlace && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Camping Items</label>
            <div className="space-y-3">
              {campingItems.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-600">
                      {item.category} - {item.size} m&#178;{' '}
                      {item.description && `- ${item.description}`}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => updateItemQuantity(item.id, (selectedItems[item.id] || 0) - 1)}
                      disabled={!selectedItems[item.id] || selectedItems[item.id] <= 0}
                      className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{selectedItems[item.id] || 0}</span>
                    <button
                      type="button"
                      onClick={() => updateItemQuantity(item.id, (selectedItems[item.id] || 0) + 1)}
                      disabled={totalSize + item.size > selectedPlace.size}
                      className="w-8 h-8 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Total size used: {totalSize} m&#178; / {selectedPlace.size} m&#178;
              {totalSize > selectedPlace.size && (
                <span className="text-red-600 ml-2">Exceeds available space</span>
              )}
            </div>
          </div>
        )}

        <FormField label="Notes" htmlFor="notes">
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={e => setField('notes', e.target.value)}
            placeholder="Any special requests or notes"
          />
        </FormField>

        {selectedPlace && formData.startDate && formData.endDate && nights > 0 && (
          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Booking Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Place:</span>
                <span>{selectedPlace.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Price per night (€):</span>
                <span>{selectedPlace.price} €</span>
              </div>
              <div className="flex justify-between">
                <span>Number of nights:</span>
                <span>{nights}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total price:</span>
                <span>{totalPrice.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-4">
          <Button
            type="submit"
            variant="success"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Processing...' : isEditMode ? 'Update Booking' : 'Create Booking'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </FormContainer>
  );
}
