'use client';

import type { CampingItem } from '@/lib/shared/types';

interface BookingItemsPickerProps
{
  campingItems: CampingItem[];
  selectedItems: { [key: string]: number };
  onQuantityChange: (itemId: string, quantity: number) => void;
  maxSize: number;
  totalSize: number;
}

export function BookingItemsPicker({
  campingItems,
  selectedItems,
  onQuantityChange,
  maxSize,
  totalSize,
}: BookingItemsPickerProps)
{
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Camping Items</label>
      <div className="space-y-3">
        {campingItems.map(item => (
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
                onClick={() => onQuantityChange(item.id, (selectedItems[item.id] || 0) - 1)}
                disabled={!selectedItems[item.id] || selectedItems[item.id] <= 0}
                className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -
              </button>
              <span className="w-8 text-center">{selectedItems[item.id] || 0}</span>
              <button
                type="button"
                onClick={() => onQuantityChange(item.id, (selectedItems[item.id] || 0) + 1)}
                disabled={totalSize + item.size > maxSize}
                className="w-8 h-8 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 text-sm text-gray-600">
        Total size used: {totalSize} m&#178; / {maxSize} m&#178;
        {totalSize > maxSize && (
          <span className="text-red-600 ml-2">Exceeds available space</span>
        )}
      </div>
    </div>
  );
}
