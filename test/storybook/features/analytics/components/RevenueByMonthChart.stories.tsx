import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import RevenueByMonthChart from '@/features/analytics/components/RevenueByMonthChart';

function ChartWrapper({ children }: { children: ReactNode })
{
  return <div style={{ width: 500 }}>{children}</div>;
}

const mockData = [
  { month: 'Jan', revenue: 1200 },
  { month: 'Feb', revenue: 980 },
  { month: 'Mär', revenue: 1450 },
  { month: 'Apr', revenue: 2100 },
  { month: 'Mai', revenue: 1890 },
  { month: 'Jun', revenue: 2400 },
];

const meta = {
  title: 'Features/Analytics/RevenueByMonthChart',
  component: RevenueByMonthChart,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ChartWrapper>
        <Story />
      </ChartWrapper>
    ),
  ],
} satisfies Meta<typeof RevenueByMonthChart>;

export default meta;
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { data: mockData },
};

export const SingleMonth: Story = {
  args: { data: [{ month: 'Jun', revenue: 2400 }] },
};
