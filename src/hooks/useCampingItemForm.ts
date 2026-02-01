'use client';

import { useState, useCallback } from 'react';
import { useCampingItemMutations } from '@/hooks/useCampingItemMutations';
import { useCrudFormActions } from '@/hooks/useCrudFormActions';

export interface CampingItemFormData
{
  name: string;
  category: string;
  size: number;
  description: string;
  isActive: boolean;
}

export interface CampingItemInitialData
{
  id?: string;
  name?: string;
  category?: string;
  size?: number;
  description?: string;
  isActive?: boolean;
}

const safeParseInt = (value: string, fallback: number = 0): number =>
{
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export function useCampingItemForm(initialData?: CampingItemInitialData)
{
  const { createCampingItem, updateCampingItem, deleteCampingItem } = useCampingItemMutations();
  const { isSubmitting, run, runWithConfirm } = useCrudFormActions({ redirectTo: '/camping-items' });

  const [formData, setFormData] = useState<CampingItemFormData>(() => ({
    name: initialData?.name || '',
    category: initialData?.category || '',
    size: initialData?.size || 1,
    description: initialData?.description || '',
    isActive: initialData?.isActive ?? true,
  }));

  const setField = useCallback(<K extends keyof CampingItemFormData>(key: K, value: CampingItemFormData[K]) =>
  {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  const setFieldFromEvent = useCallback((key: keyof CampingItemFormData, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
  {
    if (key === 'size')
    {
      setField(key, safeParseInt(e.target.value, 1));
    }
    else if (key === 'isActive')
    {
      setField(key, (e.target as HTMLInputElement).checked);
    }
    else
    {
      setField(key, e.target.value as CampingItemFormData[typeof key]);
    }
  }, [setField]);

  const handleSubmit = useCallback(async (e: React.FormEvent) =>
  {
    e.preventDefault();
    await run(() =>
      initialData?.id
        ? updateCampingItem(initialData.id, formData)
        : createCampingItem(formData)
    );
  }, [run, initialData?.id, formData, createCampingItem, updateCampingItem]);

  const handleDelete = useCallback(async () =>
  {
    if (!initialData?.id) return;
    await runWithConfirm(
      'Are you sure you want to delete this camping item? This action cannot be undone.',
      () => deleteCampingItem(initialData.id!)
    );
  }, [runWithConfirm, initialData?.id, deleteCampingItem]);

  const isEditMode = !!initialData?.id;

  return {
    formData,
    setField,
    setFieldFromEvent,
    handleSubmit,
    handleDelete,
    isSubmitting,
    isEditMode,
  };
}
