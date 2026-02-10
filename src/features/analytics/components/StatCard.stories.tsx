import type { Meta, StoryObj } from '@storybook/react-vite'
import { Euro, Calendar, Tent, Package } from 'lucide-react'
import StatCard from './StatCard'

const meta = {
  title: 'Features/Analytics/StatCard',
  component: StatCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof StatCard>

export default meta
type Story = StoryObj<typeof meta>

export const Revenue: Story = {
  args: {
    title: 'Gesamtumsatz',
    value: '€1.234,56',
    subtitle: 'Aus 12 bestätigten Buchungen',
    icon: Euro,
  },
}

export const Bookings: Story = {
  args: {
    title: 'Gesamtbuchungen',
    value: 42,
    subtitle: '5 ausstehend',
    icon: Calendar,
  },
}

export const Places: Story = {
  args: {
    title: 'Stellplätze',
    value: 8,
    subtitle: '6 aktiv',
    icon: Tent,
  },
}

export const Items: Story = {
  args: {
    title: 'Ausrüstung',
    value: 15,
    subtitle: '12 aktiv',
    icon: Package,
  },
}
