import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FormDialog } from '@/components/ui/dialog'
import PlaceFormContent from './PlaceFormContent'
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

const formContainerClass = 'max-w-2xl rounded-lg border bg-background p-6 shadow-lg'

function PlaceFormDialogWrapper({ initialForm, editing }: { initialForm: CampingPlaceFormData; editing: { id: number } | null })
{
  const [form, setForm] = useState<CampingPlaceFormData>(initialForm)
  const [open, setOpen] = useState(false)
  const openCreate = () => { setForm(emptyForm); setOpen(true) }
  return (
    <>
      <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Neuer Stellplatz</Button>
      <FormDialog open={open} onOpenChange={(v) => (v ? openCreate() : setOpen(false))} contentClassName="max-w-2xl">
        <PlaceFormContent editing={editing} form={form} setForm={setForm} onSubmit={(e) => { e.preventDefault(); setOpen(false) }} onClose={() => setOpen(false)} />
      </FormDialog>
    </>
  )
}

function PlaceFormContentWrapper({ initialForm, editing }: { initialForm: CampingPlaceFormData; editing: { id: number } | null })
{
  const [form, setForm] = useState<CampingPlaceFormData>(initialForm)
  return (
    <div className={formContainerClass}>
      <PlaceFormContent
        editing={editing}
        form={form}
        setForm={setForm}
        onSubmit={(e) => e.preventDefault()}
        onClose={() => undefined}
      />
    </div>
  )
}

const meta = {
  title: 'Features/CampingPlaces/PlaceForm',
  component: PlaceFormContent,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof PlaceFormContent>

export default meta
type Story = StoryObj<typeof meta>

export const Create: Story = {
  render: () => <PlaceFormDialogWrapper initialForm={emptyForm} editing={null} />,
} as unknown as Story

export const CreateContent: Story = {
  render: () => <PlaceFormContentWrapper initialForm={emptyForm} editing={null} />,
  parameters: { docs: { description: { story: 'Formular-Inhalt direkt im Storybook-Container.' } } },
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
      <FormDialog open={open} onOpenChange={(v) => { if (!v) setOpen(false) }} contentClassName="max-w-2xl">
        <PlaceFormContent editing={editing} form={form} setForm={setForm} onSubmit={(e) => { e.preventDefault(); setOpen(false) }} onClose={() => setOpen(false)} />
      </FormDialog>
    </>
  )
}

export const Edit: Story = {
  render: () => <PlaceFormDialogEditWrapper />,
  parameters: { docs: { description: { story: 'Klick auf „Bearbeiten“ öffnet den Dialog mit ausgefüllten Stellplatz-Daten.' } } },
} as unknown as Story

export const EditContent: Story = {
  render: () => <PlaceFormContentWrapper initialForm={filledForm} editing={{ id: 1 }} />,
  parameters: { docs: { description: { story: 'Formular-Inhalt direkt im Storybook-Container.' } } },
} as unknown as Story
