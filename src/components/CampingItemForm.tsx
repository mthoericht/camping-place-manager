'use client';

import { useRouter } from 'next/navigation';
import { useCampingItemForm, type CampingItemInitialData } from '@/hooks/useCampingItemForm';
import { FormField, Input, Textarea, Select, Checkbox, FormContainer, CrudFormActions } from '@/components/ui';

interface CampingItemFormProps
{
  initialData?: CampingItemInitialData;
}

export default function CampingItemForm({ initialData }: CampingItemFormProps)
{
  const router = useRouter();
  const {
    formData,
    setField,
    setFieldFromEvent,
    isSubmitting,
    handleSubmit,
    handleDelete,
    isEditMode,
  } = useCampingItemForm(initialData);

  return (
    <FormContainer title={isEditMode ? 'Edit Camping Item' : 'Add New Camping Item'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField label="Name" htmlFor="name" required>
          <Input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={e => setField('name', e.target.value)}
            placeholder="Enter camping item name"
          />
        </FormField>

        <FormField label="Category" htmlFor="category" required>
          <Select
            id="category"
            required
            value={formData.category}
            onChange={e => setField('category', e.target.value)}
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
            onChange={e => setFieldFromEvent('size', e)}
          />
        </FormField>

        <FormField label="Description" htmlFor="description">
          <Textarea
            id="description"
            value={formData.description}
            onChange={e => setField('description', e.target.value)}
            placeholder="Describe the camping item"
          />
        </FormField>

        <Checkbox
          id="isActive"
          label="Active (available for booking)"
          checked={formData.isActive}
          onChange={e => setField('isActive', e.target.checked)}
        />

        <CrudFormActions
          isSubmitting={isSubmitting}
          isEditMode={isEditMode}
          onCancel={() => router.back()}
          onDelete={isEditMode ? handleDelete : undefined}
        />
      </form>
    </FormContainer>
  );
}
