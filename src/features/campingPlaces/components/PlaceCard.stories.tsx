import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import PlaceCard from './PlaceCard'
import type { CampingPlace } from '@/api/types'

const mockPlace: CampingPlace = {
  id: 1,
  name: 'Platz A1',
  description: 'Ruhiger Platz am See',
  location: 'Seeufer Nord',
  size: 80,
  price: 50,
  amenities: 'Strom, Wasser, WLAN',
  isActive: true,
  createdAt: '',
  updatedAt: '',
}

const meta = {
  title: 'Features/CampingPlaces/PlaceCard',
  component: PlaceCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: {
    onEdit: fn(),
    onDelete: fn(),
  },
} satisfies Meta<typeof PlaceCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { place: mockPlace },
}

export const Inactive: Story = {
  args: { place: { ...mockPlace, isActive: false, name: 'Platz B2' } },
}

export const Minimal: Story = {
  args: {
    place: {
      ...mockPlace,
      description: null,
      amenities: '',
      name: 'Platz C3',
    },
  },
}
