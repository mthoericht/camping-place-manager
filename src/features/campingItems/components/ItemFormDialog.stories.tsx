import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ItemFormDialog from './ItemFormDialog'
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

function ItemFormDialogWrapper({ initialForm, editing, defaultOpen }: { initialForm: CampingItemFormData; editing: { id: number } | null; defaultOpen?: boolean })
{
  const [form, setForm] = useState<CampingItemFormData>(initialForm)
  const [open, setOpen] = useState(defaultOpen ?? false)
  const openCreate = () => { setForm(emptyForm); setOpen(true) }
  return (
    <>
      {!defaultOpen && <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Neues Item</Button>}
      <ItemFormDialog
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
  title: 'Features/CampingItems/ItemFormDialog',
  component: ItemFormDialog,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof ItemFormDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Create: Story = {
  render: () => <ItemFormDialogWrapper initialForm={emptyForm} editing={null} />,
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
      <ItemFormDialog
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
  render: () => <ItemFormDialogEditWrapper />,
  parameters: { docs: { description: { story: 'Klick auf „Bearbeiten“ öffnet den Dialog mit ausgefüllten Item-Daten.' } } },
} as unknown as Story
