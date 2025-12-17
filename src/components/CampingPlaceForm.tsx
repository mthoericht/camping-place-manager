'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCampingPlacesStore } from '@/stores/useCampingPlacesStore';
import { FormField, Input, Textarea, Select, Checkbox, Button, FormContainer } from '@/components/ui';

interface CampingPlaceFormProps {
  initialData?: {
    id?: string;
    name?: string;
    description?: string;
    location?: string;
    size?: number;
    price?: number;
    amenities?: string[];
    isActive?: boolean;
  };
}

export default function CampingPlaceForm({ initialData }: CampingPlaceFormProps) {
  const router = useRouter();
  const { createCampingPlace, updateCampingPlace } = useCampingPlacesStore();
  const [formData, setFormData] = useState(() => ({
    name: initialData?.name || '',
    description: initialData?.description || '',
    location: initialData?.location || '',
    size: initialData?.size || 1,
    price: initialData?.price || 0,
    amenities: initialData?.amenities || [],
    isActive: initialData?.isActive ?? true,
  }));
  const [amenityInput, setAmenityInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = initialData?.id
        ? await updateCampingPlace(initialData.id, formData)
        : await createCampingPlace(formData);

      if (result.success) {
        router.push('/camping-places');
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

  const addAmenity = () => {
    if (amenityInput.trim() && !formData.amenities.includes(amenityInput.trim())) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenityInput.trim()],
      });
      setAmenityInput('');
    }
  };

  const removeAmenity = (amenity: string) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter(a => a !== amenity),
    });
  };

  return (
    <FormContainer title={initialData?.id ? 'Edit Camping Place' : 'Add New Camping Place'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField label="Name" htmlFor="name" required>
          <Input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter camping place name"
          />
        </FormField>

        <FormField label="Description" htmlFor="description">
          <Textarea
            id="description"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the camping place"
          />
        </FormField>

        <FormField label="Location" htmlFor="location" required>
          <Input
            type="text"
            id="location"
            required
            value={formData.location}
            onChange={e => setFormData({ ...formData, location: e.target.value })}
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
              onChange={e => setFormData({ ...formData, size: parseInt(e.target.value) })}
            />
          </FormField>

          <FormField label="Price per Night ($)" htmlFor="price" required>
            <Input
              type="number"
              id="price"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            />
          </FormField>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={amenityInput}
              onChange={e => setAmenityInput(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add amenity (e.g., WiFi, Pool, BBQ)"
              onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
            />
            <button
              type="button"
              onClick={addAmenity}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.amenities.map((amenity, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {amenity}
                <button
                  type="button"
                  onClick={() => removeAmenity(amenity)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <Checkbox
          id="isActive"
          label="Active (available for booking)"
          checked={formData.isActive}
          onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
        />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : initialData?.id ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </FormContainer>
  );
}
