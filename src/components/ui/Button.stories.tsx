import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './button'

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] },
    size: { control: 'select', options: ['default', 'sm', 'lg', 'icon'] },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: 'Button' },
}

export const Destructive: Story = {
  args: { variant: 'destructive', children: 'Löschen' },
}

export const Outline: Story = {
  args: { variant: 'outline', children: 'Abbrechen' },
}

export const Small: Story = {
  args: { size: 'sm', children: 'Klein' },
}

export const Large: Story = {
  args: { size: 'lg', children: 'Groß' },
}

export const Disabled: Story = {
  args: { disabled: true, children: 'Deaktiviert' },
}
