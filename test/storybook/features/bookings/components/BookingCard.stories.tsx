import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { fn } from 'storybook/test'
import BookingCard from '@/features/bookings/components/BookingCard'
import { statusLabels, statusColors } from '@/features/bookings/constants'
import type { Booking } from '@/api/types'

const mockBooking: Booking = {
  id: 1,
  campingPlaceId: 1,
  customerName: 'Max Mustermann',
  customerEmail: 'max@beispiel.de',
  customerPhone: '+49 123 456789',
  startDate: '2025-06-01',
  endDate: '2025-06-05',
  guests: 4,
  totalPrice: 200,
  status: 'CONFIRMED',
  notes: null,
  campingPlace: {
    id: 1,
    name: 'Platz A1',
    description: null,
    location: 'Seeufer Nord',
    size: 80,
    price: 50,
    amenities: 'Strom, Wasser',
    isActive: true,
    createdAt: '',
    updatedAt: '',
  },
  bookingItems: [
    { id: 1, bookingId: 1, campingItemId: 1, quantity: 1, campingItem: { id: 1, name: 'Zelt', category: 'Tent', size: 20, description: null, isActive: true, createdAt: '', updatedAt: '' }, createdAt: '', updatedAt: '' },
  ],
  statusChanges: [],
  createdAt: '',
  updatedAt: '',
}

const meta = {
  title: 'Features/Bookings/BookingCard',
  component: BookingCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="w-[480px]"><Story /></div>
      </MemoryRouter>
    ),
  ],
  args: {
    onEdit: fn(),
    onDelete: fn(),
  },
} satisfies Meta<typeof BookingCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    booking: mockBooking,
    statusLabels,
    statusColors,
  },
}

export const Pending: Story = {
  args: {
    booking: { ...mockBooking, status: 'PENDING' },
    statusLabels,
    statusColors,
  },
}

export const WithoutItems: Story = {
  args: {
    booking: { ...mockBooking, bookingItems: [] },
    statusLabels,
    statusColors,
  },
}
