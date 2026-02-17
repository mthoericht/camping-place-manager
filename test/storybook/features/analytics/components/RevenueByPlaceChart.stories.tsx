import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import RevenueByPlaceChart from '@/features/analytics/components/RevenueByPlaceChart';

function ChartWrapper({ children }: { children: ReactNode })
{
  return <div style={{ width: 500 }}>{children}</div>;
}

const mockData = [
  { name: 'Platz A1', revenue: 3200, bookings: 42 },
  { name: 'Platz B2', revenue: 2800, bookings: 35 },
  { name: 'Platz C3', revenue: 2100, bookings: 28 },
  { name: 'Platz D4', revenue: 1800, bookings: 22 },
  { name: 'Platz E5', revenue: 1500, bookings: 18 },
];

const meta = {
  title: 'Features/Analytics/RevenueByPlaceChart',
  component: RevenueByPlaceChart,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ChartWrapper>
        <Story />
      </ChartWrapper>
    ),
  ],
} satisfies Meta<typeof RevenueByPlaceChart>;

export default meta;
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { data: mockData },
};
