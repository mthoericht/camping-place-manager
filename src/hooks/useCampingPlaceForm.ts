'use client';

import { useState, useCallback } from 'react';
import { useCampingPlaceMutations } from '@/hooks/useCampingPlaceMutations';
import { useCrudFormActions } from '@/hooks/useCrudFormActions';

export interface CampingPlaceFormData
{
  name: string;
  description: string;
  location: string;
  size: number;
  price: number;
  amenities: string[];
  isActive: boolean;
}

export interface CampingPlaceInitialData
{
  id?: string;
  name?: string;
  description?: string;
  location?: string;
  size?: number;
  price?: number;
  amenities?: string[];
  isActive?: boolean;
}

const safeParseInt = (value: string, fallback: number = 0): number =>
{
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const safeParseFloat = (value: string, fallback: number = 0): number =>
{
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export function useCampingPlaceForm(initialData?: CampingPlaceInitialData)
{
  const { createCampingPlace, updateCampingPlace, deleteCampingPlace } = useCampingPlaceMutations();
  const { isSubmitting, run, runWithConfirm } = useCrudFormActions({ redirectTo: '/camping-places' });

  const [formData, setFormData] = useState<CampingPlaceFormData>(() => ({
    name: initialData?.name || '',
    description: initialData?.description || '',
    location: initialData?.location || '',
    size: initialData?.size || 1,
    price: initialData?.price || 0,
    amenities: initialData?.amenities || [],
    isActive: initialData?.isActive ?? true,
  }));

  const [amenityInput, setAmenityInput] = useState('');

  const setField = useCallback(<K extends keyof CampingPlaceFormData>(key: K, value: CampingPlaceFormData[K]) =>
  {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  const setFieldFromEvent = useCallback((key: keyof CampingPlaceFormData, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
  {
    if (key === 'size')
    {
      setField(key, safeParseInt(e.target.value, 1));
    }
    else if (key === 'price')
    {
      setField(key, safeParseFloat(e.target.value, 0));
    }
    else if (key === 'isActive')
    {
      setField(key, (e.target as HTMLInputElement).checked);
    }
    else if (key !== 'amenities')
    {
      setField(key, e.target.value as CampingPlaceFormData[typeof key]);
    }
  }, [setField]);

  const addAmenity = useCallback(() =>
  {
    if (amenityInput.trim() && !formData.amenities.includes(amenityInput.trim()))
    {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenityInput.trim()],
      }));
      setAmenityInput('');
    }
  }, [amenityInput, formData.amenities]);

  const removeAmenity = useCallback((amenity: string) =>
  {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(a => a !== amenity),
    }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) =>
  {
    e.preventDefault();
    await run(() =>
      initialData?.id
        ? updateCampingPlace(initialData.id, formData)
        : createCampingPlace(formData)
    );
  }, [run, initialData?.id, formData, createCampingPlace, updateCampingPlace]);

  const handleDelete = useCallback(async () =>
  {
    if (!initialData?.id) return;
    await runWithConfirm(
      'Are you sure you want to delete this camping place? This action cannot be undone.',
      () => deleteCampingPlace(initialData.id!)
    );
  }, [runWithConfirm, initialData?.id, deleteCampingPlace]);

  const isEditMode = !!initialData?.id;

  return {
    formData,
    setField,
    setFieldFromEvent,
    amenityInput,
    setAmenityInput,
    addAmenity,
    removeAmenity,
    handleSubmit,
    handleDelete,
    isSubmitting,
    isEditMode,
  };
}
