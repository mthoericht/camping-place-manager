import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from './badge'

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'secondary', 'destructive', 'outline'] },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: 'Badge' },
}

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Sekundär' },
}

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Storniert' },
}

export const Outline: Story = {
  args: { variant: 'outline', children: 'Outline' },
}

export const Status: Story = {
  render: () => (
    <div className="flex gap-2 flex-wrap">
      <Badge className="bg-yellow-500">Ausstehend</Badge>
      <Badge className="bg-green-500">Bestätigt</Badge>
      <Badge className="bg-blue-500">Bezahlt</Badge>
      <Badge className="bg-red-500">Storniert</Badge>
      <Badge className="bg-gray-500">Abgeschlossen</Badge>
    </div>
  ),
}
