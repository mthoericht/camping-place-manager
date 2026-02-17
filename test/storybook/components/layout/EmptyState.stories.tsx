import type { Meta, StoryObj } from '@storybook/react-vite';
import { Calendar, Package } from 'lucide-react';
import EmptyState from '@/components/layout/EmptyState';

const meta = {
  title: 'Layout/EmptyState',
  component: EmptyState,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    icon: <Calendar className="h-12 w-12" />,
    message: 'Keine Buchungen vorhanden',
  },
};

export const NoItems: Story = {
  args: {
    icon: <Package className="h-12 w-12" />,
    message: 'Keine Camping-Items vorhanden',
  },
};
