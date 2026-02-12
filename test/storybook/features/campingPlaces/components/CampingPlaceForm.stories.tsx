import type { Meta, StoryObj } from '@storybook/react-vite'
import type React from 'react'
import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FormDialog } from '@/components/ui/dialog'
import CampingPlaceFormContent from '@/features/campingPlaces/components/CampingPlaceFormContent'
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

function CampingPlaceFormDialogWrapper({ initialForm, campingPlaceId }: { initialForm: CampingPlaceFormData; campingPlaceId: number | null })
{
  const [form, setForm] = useState<CampingPlaceFormData>(initialForm)
  const [open, setOpen] = useState(false)
  const openCreate = () => { setForm(emptyForm); setOpen(true) }
  return (
    <>
      <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Neuer Stellplatz</Button>
      <FormDialog open={open} onOpenChange={(v) => (v ? openCreate() : setOpen(false))} contentClassName="max-w-2xl">
        <CampingPlaceFormContent campingPlaceId={campingPlaceId} form={form} setForm={setForm} onSubmit={(e) => { e.preventDefault(); setOpen(false) }} onClose={() => setOpen(false)} />
      </FormDialog>
    </>
  )
}

function CampingPlaceFormContentWrapper({ initialForm, campingPlaceId }: { initialForm: CampingPlaceFormData; campingPlaceId: number | null })
{
  const [form, setForm] = useState<CampingPlaceFormData>(initialForm)
  useEffect(() => { setForm(initialForm) }, [initialForm])
  return (
    <div className={formContainerClass}>
      <CampingPlaceFormContent
        campingPlaceId={campingPlaceId}
        form={form}
        setForm={setForm}
        onSubmit={(e) => e.preventDefault()}
        onClose={() => undefined}
      />
    </div>
  )
}

const meta = {
  title: 'Features/CampingPlaces/CampingPlaceForm',
  component: CampingPlaceFormContent,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof CampingPlaceFormContent>

export default meta
type Story = StoryObj<typeof meta>
type FormStory = {
  args?: Partial<CampingPlaceFormData>
  render?: (args: Partial<CampingPlaceFormData>) => React.ReactElement
  parameters?: Story['parameters']
}

export const Create: FormStory = {
  render: () => <CampingPlaceFormDialogWrapper initialForm={emptyForm} campingPlaceId={null} />,
}

export const CreateContent: FormStory = {
  render: () => <CampingPlaceFormContentWrapper initialForm={emptyForm} campingPlaceId={null} />,
  parameters: { docs: { description: { story: 'Formular-Inhalt direkt im Storybook-Container.' } } },
}

function CampingPlaceFormDialogEditWrapper()
{
  const [form, setForm] = useState<CampingPlaceFormData>(emptyForm)
  const [open, setOpen] = useState(false)
  const [campingPlaceId, setCampingPlaceId] = useState<number | null>(null)
  const openEdit = () => { setForm(filledForm); setCampingPlaceId(1); setOpen(true) }
  return (
    <>
      <Button onClick={openEdit}>Bearbeiten</Button>
      <FormDialog open={open} onOpenChange={(v) => { if (!v) setOpen(false) }} contentClassName="max-w-2xl">
        <CampingPlaceFormContent campingPlaceId={campingPlaceId} form={form} setForm={setForm} onSubmit={(e) => { e.preventDefault(); setOpen(false) }} onClose={() => setOpen(false)} />
      </FormDialog>
    </>
  )
}

export const Edit: FormStory = {
  render: () => <CampingPlaceFormDialogEditWrapper />,
  parameters: { docs: { description: { story: 'Klick auf „Bearbeiten“ öffnet den Dialog mit ausgefüllten Stellplatz-Daten.' } } },
}

export const EditContent: FormStory = {
  args: {
    name: filledForm.name,
    description: filledForm.description,
    location: filledForm.location,
    size: filledForm.size,
    price: filledForm.price,
    amenities: filledForm.amenities,
    isActive: filledForm.isActive,
  },
  render: (args) =>
  {
    const initialForm: CampingPlaceFormData = { ...filledForm, ...args }
    return <CampingPlaceFormContentWrapper initialForm={initialForm} campingPlaceId={1} />
  },
  parameters: { docs: { description: { story: 'Formular-Inhalt mit über Controls änderbaren Ausgangsdaten.' } } },
}
