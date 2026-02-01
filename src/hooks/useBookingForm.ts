'use client';

import { useState, useEffect, useMemo, useCallback, ChangeEvent } from 'react';
import { useCampingPlacesStore } from '@/stores/useCampingPlacesStore';
import { useCampingItemsStore } from '@/stores/useCampingItemsStore';
import { useBookingMutations } from '@/hooks/useBookingMutations';
import { useCrudFormActions } from '@/hooks/useCrudFormActions';
import type { CampingPlace, CampingItem } from '@/lib/shared/types';

export interface BookingFormData 
{
  campingPlaceId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  guests: number;
  notes: string;
}

export interface BookingInitialData 
{
  id?: string;
  campingPlaceId?: string;
  campingPlace?: {
    id: string;
    name: string;
    size: number;
    price: number;
  };
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  startDate?: string;
  endDate?: string;
  guests?: number;
  notes?: string;
  campingItems?: { [key: string]: number };
}

const safeParseInt = (value: string, fallback: number = 0): number =>
{
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export function useBookingForm(initialData?: BookingInitialData) 
{
  const placesLoading = useCampingPlacesStore(s => s.loading);
  const placesError = useCampingPlacesStore(s => s.error);
  const fetchPlaces = useCampingPlacesStore(s => s.fetch);
  const getActivePlaces = useCampingPlacesStore(s => s.getActive);
  const getPlaceById = useCampingPlacesStore(s => s.getById);
  
  const items = useCampingItemsStore(s => s.items);
  const itemsLoading = useCampingItemsStore(s => s.loading);
  const itemsError = useCampingItemsStore(s => s.error);
  const fetchItems = useCampingItemsStore(s => s.fetch);

  const { createBooking, updateBooking } = useBookingMutations();
  const { isSubmitting, run } = useCrudFormActions({ redirectTo: '/bookings' });

  const [formData, setFormData] = useState<BookingFormData>(() => ({
    campingPlaceId: initialData?.campingPlaceId || '',
    customerName: initialData?.customerName || '',
    customerEmail: initialData?.customerEmail || '',
    customerPhone: initialData?.customerPhone || '',
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    guests: initialData?.guests || 1,
    notes: initialData?.notes || '',
  }));

  const [selectedItems, setSelectedItems] = useState<{ [key: string]: number }>(() => 
    initialData?.campingItems || {}
  );

  useEffect(() => 
  {
    fetchPlaces();
    fetchItems();
  }, [fetchPlaces, fetchItems]);

  const campingPlaces = getActivePlaces();
  
  const selectedPlace = useMemo(
    () => 
    {
      if (!formData.campingPlaceId) return null;
      const storePlace = getPlaceById(formData.campingPlaceId);
      if (storePlace) return storePlace;
      if (initialData?.campingPlace && initialData.campingPlace.id === formData.campingPlaceId)
      {
        return initialData.campingPlace as CampingPlace;
      }
      return null;
    },
    [formData.campingPlaceId, getPlaceById, initialData?.campingPlace]
  );

  const itemsById = useMemo(
    () => new Map(items.map(i => [i.id, i])),
    [items]
  );

  const totalSize = useMemo(() => 
  {
    let size = 0;
    Object.entries(selectedItems).forEach(([itemId, quantity]) => 
    {
      const item = itemsById.get(itemId);
      if (item) 
      {
        size += item.size * quantity;
      }
    });
    return size;
  }, [selectedItems, itemsById]);

  const nights = useMemo(() => 
  {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }, [formData.startDate, formData.endDate]);

  const totalPrice = useMemo(() => 
  {
    if (!selectedPlace || nights <= 0) return 0;
    return nights * selectedPlace.price;
  }, [selectedPlace, nights]);

  const setField = useCallback(<K extends keyof BookingFormData>(key: K, value: BookingFormData[K]) => 
  {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  const setFieldFromEvent = useCallback(
    (key: keyof BookingFormData) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    {
      const value = e.target.value;
      if (key === 'guests')
      {
        setFormData(prev => ({ ...prev, [key]: safeParseInt(value, 1) }));
      }
      else
      {
        setFormData(prev => ({ ...prev, [key]: value }));
      }
    },
    []
  );

  const updateItemQuantity = useCallback((itemId: string, quantity: number) => 
  {
    setSelectedItems(prev => 
    {
      const newItems = { ...prev };
      if (quantity <= 0) 
      {
        delete newItems[itemId];
      } 
      else 
      {
        newItems[itemId] = quantity;
      }
      return newItems;
    });
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => 
  {
    e.preventDefault();
    await run(() => 
      initialData?.id
        ? updateBooking(initialData.id, { ...formData, campingItems: selectedItems })
        : createBooking({ ...formData, campingItems: selectedItems })
    );
  }, [run, initialData?.id, formData, selectedItems, createBooking, updateBooking]);

  const isLoading = placesLoading || itemsLoading;
  
  const error = useMemo(() =>
  {
    const errors = [placesError, itemsError].filter(Boolean);
    return errors.length > 0 ? errors.join('; ') : null;
  }, [placesError, itemsError]);

  return {
    formData,
    setField,
    setFieldFromEvent,
    selectedItems,
    updateItemQuantity,
    campingPlaces,
    campingItems: items,
    selectedPlace,
    nights,
    totalPrice,
    totalSize,
    isLoading,
    error,
    isSubmitting,
    handleSubmit,
    isEditMode: !!initialData?.id,
  };
}
