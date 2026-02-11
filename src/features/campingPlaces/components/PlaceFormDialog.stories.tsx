import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PlaceFormDialog from './PlaceFormDialog'
import type { CampingPlaceFormData } from '@/api/types'

const emptyForm: CampingPlaceFormData = {
  name: '',
  description: '',
  location: '',
  size: 0,
  price: 0,
  amenities: '',
  isActive: true,
}

const filledForm: CampingPlaceFormData = {
  name: 'Platz A1',
  description: 'Ruhiger Platz am See',
  location: 'Seeufer Nord',
  size: 80,
  price: 50,
  amenities: 'Strom, Wasser, WLAN',
  isActive: true,
}

function PlaceFormDialogWrapper({ initialForm, editing, defaultOpen }: { initialForm: CampingPlaceFormData; editing: { id: number } | null; defaultOpen?: boolean })
{
  const [form, setForm] = useState<CampingPlaceFormData>(initialForm)
  const [open, setOpen] = useState(defaultOpen ?? false)
  const openCreate = () => { setForm(emptyForm); setOpen(true) }
  return (
    <>
      {!defaultOpen && <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Neuer Stellplatz</Button>}
      <PlaceFormDialog
        open={open}
        onOpenChange={(v) => (v ? openCreate() : setOpen(false))}
        editing={editing}
        form={form}
        setForm={setForm}
        onSubmit={(e) => { e.preventDefault(); setOpen(false) }}
        onClose={() => setOpen(false)}
      />
    </>
  )
}

const meta = {
  title: 'Features/CampingPlaces/PlaceFormDialog',
  component: PlaceFormDialog,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof PlaceFormDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Create: Story = {
  render: () => <PlaceFormDialogWrapper initialForm={emptyForm} editing={null} />,
} as unknown as Story

function PlaceFormDialogEditWrapper()
{
  const [form, setForm] = useState<CampingPlaceFormData>(emptyForm)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<{ id: number } | null>(null)
  const openEdit = () => { setForm(filledForm); setEditing({ id: 1 }); setOpen(true) }
  return (
    <>
      <Button onClick={openEdit}>Bearbeiten</Button>
      <PlaceFormDialog
        open={open}
        onOpenChange={(v) => { if (!v) setOpen(false) }}
        editing={editing}
        form={form}
        setForm={setForm}
        onSubmit={(e) => { e.preventDefault(); setOpen(false) }}
        onClose={() => setOpen(false)}
      />
    </>
  )
}

export const Edit: Story = {
  render: () => <PlaceFormDialogEditWrapper />,
  parameters: { docs: { description: { story: 'Klick auf „Bearbeiten“ öffnet den Dialog mit ausgefüllten Stellplatz-Daten.' } } },
} as unknown as Story
