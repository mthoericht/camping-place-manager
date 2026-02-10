import type { Meta, StoryObj } from '@storybook/react-vite'
import PageHeader from './PageHeader'
import { Button } from '@/components/ui/button'

const meta = {
  title: 'Layout/PageHeader',
  component: PageHeader,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof PageHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Buchungen',
    description: 'Verwalten Sie alle Campingplatz-Buchungen',
  },
}

export const WithAction: Story = {
  args: {
    title: 'Stellplätze & Flächen',
    description: 'Verwalten Sie alle verfügbaren Plätze',
    children: <Button>Neuer Stellplatz</Button>,
  },
}

export const TitleOnly: Story = {
  args: { title: 'Analytics & Berichte' },
}
