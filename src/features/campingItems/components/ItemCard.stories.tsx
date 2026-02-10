import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import ItemCard from './ItemCard'
import type { CampingItem } from '@/api/types'

const mockItem: CampingItem = {
  id: 1,
  name: 'Familienzelt',
  category: 'Tent',
  size: 25,
  description: '4-Personen-Zelt',
  isActive: true,
  createdAt: '',
  updatedAt: '',
}

const meta = {
  title: 'Features/CampingItems/ItemCard',
  component: ItemCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  args: {
    onEdit: fn(),
    onDelete: fn(),
  },
} satisfies Meta<typeof ItemCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { item: mockItem },
}

export const Inactive: Story = {
  args: { item: { ...mockItem, isActive: false, name: 'Reserve-Pavillon' } },
}

export const OtherCategory: Story = {
  args: { item: { ...mockItem, category: 'Other', name: 'Zusatzausrüstung' } },
}
