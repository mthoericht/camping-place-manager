'use client';

import { useRouter } from 'next/navigation';
import { useCampingPlaceForm, type CampingPlaceInitialData } from '@/hooks/useCampingPlaceForm';
import { FormField, Input, Textarea, Checkbox, FormContainer, CrudFormActions, AmenitiesInput } from '@/components/ui';

interface CampingPlaceFormProps
{
  initialData?: CampingPlaceInitialData;
}

export default function CampingPlaceForm({ initialData }: CampingPlaceFormProps)
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
  } = useCampingPlaceForm(initialData);

  return (
    <FormContainer title={isEditMode ? 'Edit Camping Place' : 'Add New Camping Place'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField label="Name" htmlFor="name" required>
          <Input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={e => setField('name', e.target.value)}
            placeholder="Enter camping place name"
          />
        </FormField>

        <FormField label="Description" htmlFor="description">
          <Textarea
            id="description"
            value={formData.description}
            onChange={e => setField('description', e.target.value)}
            placeholder="Describe the camping place"
          />
        </FormField>

        <FormField label="Location" htmlFor="location" required>
          <Input
            type="text"
            id="location"
            required
            value={formData.location}
            onChange={e => setField('location', e.target.value)}
            placeholder="Enter location"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
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

          <FormField label="Price per night (€)" htmlFor="price" required>
            <Input
              type="number"
              id="price"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={e => setFieldFromEvent('price', e)}
            />
          </FormField>
        </div>

        <AmenitiesInput
          value={formData.amenities}
          onChange={amenities => setField('amenities', amenities)}
          placeholder="Add amenity (e.g., WiFi, Pool, BBQ)"
          label="Amenities"
        />

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
