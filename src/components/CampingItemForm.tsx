'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCampingItemsStore } from '@/stores/useCampingItemsStore';
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
  const { createCampingItem, updateCampingItem, deleteCampingItem } = useCampingItemsStore();
  const [formData, setFormData] = useState(() => ({
    name: initialData?.name || '',
    category: initialData?.category || '',
    size: initialData?.size || 1,
    description: initialData?.description || '',
    isActive: initialData?.isActive ?? true,
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = initialData?.id
        ? await updateCampingItem(initialData.id, formData)
        : await createCampingItem(formData);

      if (result.success) {
        router.push('/camping-items');
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

  const handleDelete = async () => {
    if (!initialData?.id) return;
    
    if (!confirm('Are you sure you want to delete this camping item? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await deleteCampingItem(initialData.id);

      if (result.success) {
        router.push('/camping-items');
        router.refresh();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting camping item:', error);
      alert('An error occurred while deleting the camping item');
    }
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
            <option value="Pavillon/Awning">Pavillon/Awning</option>
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
            <Button type="button" variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          )}
        </div>
      </form>
    </FormContainer>
  );
}
