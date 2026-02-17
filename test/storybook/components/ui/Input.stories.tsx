import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { placeholder: 'Placeholder...' },
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="email">E-Mail</Label>
      <Input id="email" type="email" placeholder="name@beispiel.de" />
    </div>
  ),
};

export const Number: Story = {
  args: { type: 'number', placeholder: '0', min: 0 },
};

export const Date: Story = {
  args: { type: 'date' },
};

export const Disabled: Story = {
  args: { disabled: true, placeholder: 'Deaktiviert' },
};
