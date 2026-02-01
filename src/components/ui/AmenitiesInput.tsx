'use client';

import { useState, KeyboardEvent } from 'react';
import { Input } from './FormField';
import { Button } from './Button';

interface AmenitiesInputProps
{
  value: string[];
  onChange: (amenities: string[]) => void;
  placeholder?: string;
  label?: string;
}

export function AmenitiesInput({
  value,
  onChange,
  placeholder = 'Add amenity...',
  label = 'Amenities',
}: AmenitiesInputProps)
{
  const [inputValue, setInputValue] = useState('');

  const addAmenity = () =>
  {
    const trimmed = inputValue.trim();
    if (trimmed && !value.includes(trimmed))
    {
      onChange([...value, trimmed]);
      setInputValue('');
    }
  };

  const removeAmenity = (index: number) =>
  {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) =>
  {
    if (e.key === 'Enter')
    {
      e.preventDefault();
      addAmenity();
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="flex gap-2 mb-2">
        <Input
          id="amenity-input"
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
        <Button type="button" variant="secondary" onClick={addAmenity}>
          Add
        </Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((amenity, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
              {amenity}
              <button
                type="button"
                onClick={() => removeAmenity(index)}
                className="ml-2 text-blue-600 hover:text-blue-800"
                aria-label={`Remove ${amenity}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
