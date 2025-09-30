'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface CampingPlace {
  id: string
  name: string
  price: number
  size: number
}

interface CampingItem {
  id: string
  name: string
  category: string
  size: number
  description?: string
}

interface BookingFormProps {
  initialData?: {
    id?: string
    campingPlaceId?: string
    customerName?: string
    customerEmail?: string
    customerPhone?: string
    startDate?: string
    endDate?: string
    guests?: number
    notes?: string
  }
}

export default function BookingForm({ initialData }: BookingFormProps) {
  const router = useRouter()
  const [campingPlaces, setCampingPlaces] = useState<CampingPlace[]>([])
  const [campingItems, setCampingItems] = useState<CampingItem[]>([])
  const [formData, setFormData] = useState(() => ({
    campingPlaceId: initialData?.campingPlaceId || '',
    customerName: initialData?.customerName || '',
    customerEmail: initialData?.customerEmail || '',
    customerPhone: initialData?.customerPhone || '',
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    guests: initialData?.guests || 1,
    notes: initialData?.notes || '',
  }))
  const [selectedItems, setSelectedItems] = useState<{[key: string]: number}>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedPlace, setSelectedPlace] = useState<CampingPlace | null>(null)

  useEffect(() => {
    fetchCampingPlaces()
    fetchCampingItems()
  }, [])

  useEffect(() => {
    if (formData.campingPlaceId) {
      const place = campingPlaces.find(p => p.id === formData.campingPlaceId)
      setSelectedPlace(place || null)
    }
  }, [formData.campingPlaceId, campingPlaces])

  const fetchCampingPlaces = async () => {
    try {
      const response = await fetch('/api/camping-places')
      if (response.ok) {
        const places = await response.json()
        setCampingPlaces(places.filter((place: any) => place.isActive))
      }
    } catch (error) {
      console.error('Error fetching camping places:', error)
    }
  }

  const fetchCampingItems = async () => {
    try {
      const response = await fetch('/api/camping-items')
      if (response.ok) {
        const items = await response.json()
        setCampingItems(items)
      }
    } catch (error) {
      console.error('Error fetching camping items:', error)
    }
  }

  const calculateTotalSize = () => {
    let totalSize = 0
    Object.entries(selectedItems).forEach(([itemId, quantity]) => {
      const item = campingItems.find(i => i.id === itemId)
      if (item) {
        totalSize += item.size * quantity
      }
    })
    return totalSize
  }

  const calculateTotalPrice = () => {
    if (!selectedPlace || !formData.startDate || !formData.endDate) return 0
    
    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    
    return nights * selectedPlace.price
  }

  const updateItemQuantity = (itemId: string, quantity: number) => {
    const newSelectedItems = { ...selectedItems }
    if (quantity === 0) {
      delete newSelectedItems[itemId]
    } else {
      newSelectedItems[itemId] = quantity
    }
    setSelectedItems(newSelectedItems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = initialData?.id 
        ? `/api/bookings/${initialData.id}`
        : '/api/bookings'
      
      const method = initialData?.id ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          campingItems: selectedItems
        }),
      })

      if (response.ok) {
        router.push('/bookings')
        router.refresh()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('An error occurred while submitting the form')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        {initialData?.id ? 'Edit Booking' : 'New Booking'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-6">
        <div>
          <label htmlFor="campingPlaceId" className="block text-sm font-medium text-gray-700 mb-2">
            Camping Place *
          </label>
          <select
            id="campingPlaceId"
            required
            value={formData.campingPlaceId}
            onChange={(e) => setFormData({ ...formData, campingPlaceId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a camping place</option>
            {campingPlaces.map((place) => (
              <option key={place.id} value={place.id}>
                {place.name} - ${place.price}/night (Size: {place.size} m&#178;)
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
              Check-in Date *
            </label>
            <input
              type="date"
              id="startDate"
              required
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
              Check-out Date *
            </label>
            <input
              type="date"
              id="endDate"
              required
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-2">
            Number of Guests *
          </label>
          <input
            type="number"
            id="guests"
            required
            min="1"
            max={selectedPlace?.size || 10}
            value={formData.guests}
            onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {selectedPlace && (
            <p className="text-sm text-gray-500 mt-1">
              Maximum capacity: {selectedPlace.size} guests
            </p>
          )}
        </div>

        <div>
          <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
            Customer Name *
          </label>
          <input
            type="text"
            id="customerName"
            required
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter customer name"
          />
        </div>

        <div>
          <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-2">
            Customer Email *
          </label>
          <input
            type="email"
            id="customerEmail"
            required
            value={formData.customerEmail}
            onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter customer email"
          />
        </div>

        <div>
          <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-2">
            Customer Phone
          </label>
          <input
            type="tel"
            id="customerPhone"
            value={formData.customerPhone}
            onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter customer phone number"
          />
        </div>

        {selectedPlace && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Camping Items
            </label>
            <div className="space-y-3">
              {campingItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-600">
                      {item.category} - {item.size} m&#178; {item.description && `- ${item.description}`}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => updateItemQuantity(item.id, (selectedItems[item.id] || 0) - 1)}
                      disabled={!selectedItems[item.id] || selectedItems[item.id] <= 0}
                      className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{selectedItems[item.id] || 0}</span>
                    <button
                      type="button"
                      onClick={() => updateItemQuantity(item.id, (selectedItems[item.id] || 0) + 1)}
                      disabled={calculateTotalSize() + item.size > selectedPlace.size}
                      className="w-8 h-8 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Total size used: {calculateTotalSize()} m&#178; / {selectedPlace.size} m&#178;
              {calculateTotalSize() > selectedPlace.size && (
                <span className="text-red-600 ml-2">⚠️ Exceeds available space</span>
              )}
            </div>
          </div>
        )}

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            id="notes"
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Any special requests or notes"
          />
        </div>

        {selectedPlace && formData.startDate && formData.endDate && (
          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Booking Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Place:</span>
                <span>{selectedPlace.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Price per night:</span>
                <span>${selectedPlace.price}</span>
              </div>
              <div className="flex justify-between">
                <span>Number of nights:</span>
                <span>
                  {Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24))}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total Price:</span>
                <span>${calculateTotalPrice()}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
          >
            {isSubmitting ? 'Processing...' : (initialData?.id ? 'Update Booking' : 'Create Booking')}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
