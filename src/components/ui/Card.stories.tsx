import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'

const meta = {
  title: 'UI/Card',
  component: Card,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card className="w-[360px]">
      <CardHeader>
        <CardTitle>Titel</CardTitle>
        <CardDescription>Beschreibung der Karte</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Inhalt der Karte.</p>
      </CardContent>
    </Card>
  ),
}

export const WithContent: Story = {
  render: () => (
    <Card className="w-[360px]">
      <CardHeader>
        <CardTitle>Stellplatz A1</CardTitle>
        <CardDescription>Seeufer Nord</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Größe</span><span>80 m²</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Preis/Nacht</span><span>€25,00</span></div>
        </div>
      </CardContent>
    </Card>
  ),
}
