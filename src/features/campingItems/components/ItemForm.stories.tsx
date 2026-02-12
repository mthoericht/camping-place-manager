import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FormDialog } from '@/components/ui/dialog'
import ItemFormContent from './ItemFormContent'
import type { CampingItemFormData } from '@/api/types'

const emptyForm: CampingItemFormData = {
  name: '',
  category: 'Tent',
  size: 0,
  description: '',
  isActive: true,
}

const filledForm: CampingItemFormData = {
  name: 'Familienzelt',
  category: 'Tent',
  size: 25,
  description: '4-Personen-Zelt',
  isActive: true,
}

const formContainerClass = 'max-w-lg rounded-lg border bg-background p-6 shadow-lg'

function ItemFormDialogWrapper({ initialForm, editing }: { initialForm: CampingItemFormData; editing: { id: number } | null })
{
  const [form, setForm] = useState<CampingItemFormData>(initialForm)
  const [open, setOpen] = useState(false)
  const openCreate = () => { setForm(emptyForm); setOpen(true) }
  return (
    <>
      <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Neues Item</Button>
      <FormDialog open={open} onOpenChange={(v) => (v ? openCreate() : setOpen(false))}>
        <ItemFormContent editing={editing} form={form} setForm={setForm} onSubmit={(e) => { e.preventDefault(); setOpen(false) }} onClose={() => setOpen(false)} />
      </FormDialog>
    </>
  )
}

function ItemFormContentWrapper({ initialForm, editing }: { initialForm: CampingItemFormData; editing: { id: number } | null })
{
  const [form, setForm] = useState<CampingItemFormData>(initialForm)
  return (
    <div className={formContainerClass}>
      <ItemFormContent
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
  title: 'Features/CampingItems/ItemForm',
  component: ItemFormContent,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof ItemFormContent>

export default meta
type Story = StoryObj<typeof meta>

export const Create: Story = {
  render: () => <ItemFormDialogWrapper initialForm={emptyForm} editing={null} />,
} as unknown as Story

export const CreateContent: Story = {
  render: () => <ItemFormContentWrapper initialForm={emptyForm} editing={null} />,
  parameters: { docs: { description: { story: 'Formular-Inhalt direkt im Storybook-Container.' } } },
} as unknown as Story

function ItemFormDialogEditWrapper()
{
  const [form, setForm] = useState<CampingItemFormData>(emptyForm)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<{ id: number } | null>(null)
  const openEdit = () => { setForm(filledForm); setEditing({ id: 1 }); setOpen(true) }
  return (
    <>
      <Button onClick={openEdit}>Bearbeiten</Button>
      <FormDialog open={open} onOpenChange={(v) => { if (!v) setOpen(false) }}>
        <ItemFormContent editing={editing} form={form} setForm={setForm} onSubmit={(e) => { e.preventDefault(); setOpen(false) }} onClose={() => setOpen(false)} />
      </FormDialog>
    </>
  )
}

export const Edit: Story = {
  render: () => <ItemFormDialogEditWrapper />,
  parameters: { docs: { description: { story: 'Klick auf „Bearbeiten“ öffnet den Dialog mit ausgefüllten Item-Daten.' } } },
} as unknown as Story

export const EditContent: Story = {
  render: () => <ItemFormContentWrapper initialForm={filledForm} editing={{ id: 1 }} />,
  parameters: { docs: { description: { story: 'Formular-Inhalt direkt im Storybook-Container.' } } },
} as unknown as Story
