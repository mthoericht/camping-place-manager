'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCampingPlacesStore } from '@/stores/useCampingPlacesStore';
import { useCampingItemsStore } from '@/stores/useCampingItemsStore';
import { useBookingsStore } from '@/stores/useBookingsStore';
import { FormField, Input, Textarea, Select, Button, FormContainer } from '@/components/ui';

interface BookingFormProps {
  initialData?: {
    id?: string;
    campingPlaceId?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    startDate?: string;
    endDate?: string;
    guests?: number;
    notes?: string;
    campingItems?: { [key: string]: number };
  };
}

export default function BookingForm({ initialData }: BookingFormProps) {
  const router = useRouter();
  
  // Zustand stores
  const {
    getActivePlaces,
    getPlaceById,
    fetchCampingPlaces,
    loading: placesLoading,
    error: placesError,
  } = useCampingPlacesStore();
  
  const {
    campingItems,
    fetchCampingItems,
    loading: itemsLoading,
    error: itemsError,
  } = useCampingItemsStore();

  const { createBooking, updateBooking } = useBookingsStore();

  const campingPlaces = getActivePlaces();

  const [formData, setFormData] = useState(() => ({
    campingPlaceId: initialData?.campingPlaceId || '',
    customerName: initialData?.customerName || '',
    customerEmail: initialData?.customerEmail || '',
    customerPhone: initialData?.customerPhone || '',
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    guests: initialData?.guests || 1,
    notes: initialData?.notes || '',
  }));
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: number }>(() => {
    console.log('BookingForm initialData:', initialData);
    console.log('BookingForm initial camping items:', initialData?.campingItems);
    return initialData?.campingItems || {};
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    fetchCampingPlaces();
    fetchCampingItems();
  }, []);

  // Get selected place from store
  const selectedPlace = formData.campingPlaceId
    ? getPlaceById(formData.campingPlaceId) || null
    : null;

  const calculateTotalSize = () => {
    let totalSize = 0;
    Object.entries(selectedItems).forEach(([itemId, quantity]) => {
      const item = campingItems.find(i => i.id === itemId);
      if (item) {
        totalSize += item.size * quantity;
      }
    });
    return totalSize;
  };

  const calculateTotalPrice = () => {
    if (!selectedPlace || !formData.startDate || !formData.endDate) {
      return 0;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    return nights * selectedPlace.price;
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    const newSelectedItems = { ...selectedItems };
    if (quantity === 0) {
      delete newSelectedItems[itemId];
    } else {
      newSelectedItems[itemId] = quantity;
    }
    setSelectedItems(newSelectedItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = initialData?.id
        ? await updateBooking(initialData.id, {
            ...formData,
            campingItems: selectedItems,
          })
        : await createBooking({
            ...formData,
            campingItems: selectedItems,
          });

      if (result.success) {
        router.push('/bookings');
        router.refresh();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred while submitting the form');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormContainer title={initialData?.id ? 'Edit Booking' : 'New Booking'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {(placesLoading || itemsLoading) && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md">
            Loading camping places and items...
          </div>
        )}
        {(placesError || itemsError) && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
            Error loading data: {placesError || itemsError}
          </div>
        )}
        <FormField label="Camping Place" htmlFor="campingPlaceId" required>
          <Select
            id="campingPlaceId"
            required
            value={formData.campingPlaceId}
            onChange={e => setFormData({ ...formData, campingPlaceId: e.target.value })}
            disabled={placesLoading}
          >
            <option value="">Select a camping place</option>
            {campingPlaces.map(place => (
              <option key={place.id} value={place.id}>
                {place.name} - ${place.price}/night (Size: {place.size} m&#178;)
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
              onChange={e => setFormData({ ...formData, startDate: e.target.value })}
            />
          </FormField>

          <FormField label="Check-out Date" htmlFor="endDate" required>
            <Input
              type="date"
              id="endDate"
              required
              value={formData.endDate}
              onChange={e => setFormData({ ...formData, endDate: e.target.value })}
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
            onChange={e => setFormData({ ...formData, guests: parseInt(e.target.value) })}
          />
        </FormField>

        <FormField label="Customer Name" htmlFor="customerName" required>
          <Input
            type="text"
            id="customerName"
            required
            value={formData.customerName}
            onChange={e => setFormData({ ...formData, customerName: e.target.value })}
            placeholder="Enter customer name"
          />
        </FormField>

        <FormField label="Customer Email" htmlFor="customerEmail" required>
          <Input
            type="email"
            id="customerEmail"
            required
            value={formData.customerEmail}
            onChange={e => setFormData({ ...formData, customerEmail: e.target.value })}
            placeholder="Enter customer email"
          />
        </FormField>

        <FormField label="Customer Phone" htmlFor="customerPhone">
          <Input
            type="tel"
            id="customerPhone"
            value={formData.customerPhone}
            onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
            placeholder="Enter customer phone number"
          />
        </FormField>

        {selectedPlace && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Camping Items</label>
            <div className="space-y-3">
              {campingItems.map(item => {
                console.log(`Item ${item.id} (${item.name}) selected quantity:`, selectedItems[item.id]);
                return (
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
                      disabled={calculateTotalSize() + item.size > selectedPlace.size}
                      className="w-8 h-8 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Total size used: {calculateTotalSize()} m&#178; / {selectedPlace.size} m&#178;
              {calculateTotalSize() > selectedPlace.size && (
                <span className="text-red-600 ml-2">⚠️ Exceeds available space</span>
              )}
            </div>
          </div>
        )}

        <FormField label="Notes" htmlFor="notes">
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any special requests or notes"
          />
        </FormField>

        {selectedPlace && formData.startDate && formData.endDate && (
          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Booking Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Place:</span>
                <span>{selectedPlace.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Price per night:</span>
                <span>${selectedPlace.price}</span>
              </div>
              <div className="flex justify-between">
                <span>Number of nights:</span>
                <span>
                  {Math.ceil(
                    (new Date(formData.endDate).getTime() -
                      new Date(formData.startDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total Price:</span>
                <span>${calculateTotalPrice()}</span>
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
            {isSubmitting ? 'Processing...' : initialData?.id ? 'Update Booking' : 'Create Booking'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </FormContainer>
  );
}
