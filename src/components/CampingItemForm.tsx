'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCampingItemMutations } from '@/hooks/useCampingItemMutations';
import { useCrudFormActions } from '@/hooks/useCrudFormActions';
import { FormField, Input, Textarea, Select, Checkbox, Button, FormContainer } from '@/components/ui';

interface CampingItemFormProps {
  initialData?: {
    id?: string;
    name?: string;
    category?: string;
    size?: number;
    description?: string;
    isActive?: boolean;
  };
}

export default function CampingItemForm({ initialData }: CampingItemFormProps) {
  const router = useRouter();
  const { createCampingItem, updateCampingItem, deleteCampingItem } = useCampingItemMutations();
  const { isSubmitting, run, runWithConfirm } = useCrudFormActions({ redirectTo: '/camping-items' });

  const [formData, setFormData] = useState(() => ({
    name: initialData?.name || '',
    category: initialData?.category || '',
    size: initialData?.size || 1,
    description: initialData?.description || '',
    isActive: initialData?.isActive ?? true,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await run(() => 
      initialData?.id
        ? updateCampingItem(initialData.id, formData)
        : createCampingItem(formData)
    );
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;
    await runWithConfirm(
      'Are you sure you want to delete this camping item? This action cannot be undone.',
      () => deleteCampingItem(initialData.id!)
    );
  };

  return (
    <FormContainer title={initialData?.id ? 'Edit Camping Item' : 'Add New Camping Item'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField label="Name" htmlFor="name" required>
          <Input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter camping item name"
          />
        </FormField>

        <FormField label="Category" htmlFor="category" required>
          <Select
            id="category"
            required
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="">Select a category</option>
            <option value="Tent">Tent</option>
            <option value="Van">Van</option>
            <option value="Trailer">Trailer</option>
            <option value="Pavilion/Awning">Pavilion / Awning</option>
          </Select>
        </FormField>

        <FormField label="Size in m²" htmlFor="size" required>
          <Input
            type="number"
            id="size"
            required
            min="1"
            value={formData.size}
            onChange={e => setFormData({ ...formData, size: parseInt(e.target.value) })}
            placeholder="Enter size in square meters"
          />
        </FormField>

        <FormField label="Description" htmlFor="description">
          <Textarea
            id="description"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the camping item"
          />
        </FormField>

        <Checkbox
          id="isActive"
          label="Active (available for booking)"
          checked={formData.isActive}
          onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
        />

        <div className="flex justify-between">
          <div className="flex space-x-4">
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : initialData?.id ? 'Update' : 'Create'}
            </Button>
          </div>
          
          {initialData?.id && (
            <Button type="button" variant="danger" onClick={handleDelete} disabled={isSubmitting}>
              Delete
            </Button>
          )}
        </div>
      </form>
    </FormContainer>
  );
}
