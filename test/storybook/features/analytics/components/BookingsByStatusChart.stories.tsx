import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'
import BookingsByStatusChart from '@/features/analytics/components/BookingsByStatusChart'

function ChartWrapper({ children }: { children: ReactNode })
{
  return <div style={{ width: 500 }}>{children}</div>
}

const mockData = [
  { name: 'Ausstehend', value: 5, color: '#eab308' },
  { name: 'Bestätigt', value: 12, color: '#22c55e' },
  { name: 'Bezahlt', value: 8, color: '#3b82f6' },
  { name: 'Storniert', value: 2, color: '#ef4444' },
  { name: 'Abgeschlossen', value: 15, color: '#6b7280' },
]

const meta = {
  title: 'Features/Analytics/BookingsByStatusChart',
  component: BookingsByStatusChart,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ChartWrapper>
        <Story />
      </ChartWrapper>
    ),
  ],
} satisfies Meta<typeof BookingsByStatusChart>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { data: mockData },
}
