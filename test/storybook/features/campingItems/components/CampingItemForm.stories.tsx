import type { Meta, StoryObj } from '@storybook/react-vite';
import type React from 'react';
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, FormDialog } from '@/components/ui/dialog';
import CampingItemFormContent from '@/features/campingItems/components/CampingItemFormContent';
import type { CampingItemFormData } from '@/api/types';

const emptyForm: CampingItemFormData = {
  name: '',
  category: 'Tent',
  size: 0,
  description: '',
  isActive: true,
};

const filledForm: CampingItemFormData = {
  name: 'Familienzelt',
  category: 'Tent',
  size: 25,
  description: '4-Personen-Zelt',
  isActive: true,
};

const formContainerClass = 'max-w-lg rounded-lg border bg-background p-6 shadow-lg';

function CampingItemFormDialogWrapper({ initialForm, campingItemId }: { initialForm: CampingItemFormData; campingItemId: number | null })
{
  const [form, setForm] = useState<CampingItemFormData>(initialForm);
  const [open, setOpen] = useState(false);
  const openCreate = () => { setForm(emptyForm); setOpen(true); };
  return (
    <>
      <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Neues Camping-Item</Button>
      <FormDialog open={open} onOpenChange={(v) => (v ? openCreate() : setOpen(false))}>
        <CampingItemFormContent campingItemId={campingItemId} form={form} setForm={setForm} onSubmit={(e) => { e.preventDefault(); setOpen(false); }} onClose={() => setOpen(false)} />
      </FormDialog>
    </>
  );
}

function CampingItemFormContentWrapper({ initialForm, campingItemId }: { initialForm: CampingItemFormData; campingItemId: number | null })
{
  const [form, setForm] = useState<CampingItemFormData>(initialForm);
  useEffect(() => { setForm(initialForm); }, [initialForm]);
  return (
    <Dialog open>
      <div className={formContainerClass}>
        <CampingItemFormContent
          campingItemId={campingItemId}
          form={form}
          setForm={setForm}
          onSubmit={(e) => e.preventDefault()}
          onClose={() => undefined}
        />
      </div>
    </Dialog>
  );
}

const meta = {
  title: 'Features/CampingItems/CampingItemForm',
  component: CampingItemFormContent,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof CampingItemFormContent>;

export default meta;
type Story = StoryObj<typeof meta>

type FormStory = {
  args?: Partial<CampingItemFormData>
  render?: (args: Partial<CampingItemFormData>) => React.ReactElement
  parameters?: Story['parameters']
}

export const Create: FormStory = {
  render: () => <CampingItemFormDialogWrapper initialForm={emptyForm} campingItemId={null} />,
};

export const CreateContent: FormStory = {
  render: () => <CampingItemFormContentWrapper initialForm={emptyForm} campingItemId={null} />,
  parameters: { docs: { description: { story: 'Formular-Inhalt direkt im Storybook-Container.' } } },
};

function CampingItemFormDialogEditWrapper()
{
  const [form, setForm] = useState<CampingItemFormData>(emptyForm);
  const [open, setOpen] = useState(false);
  const [campingItemId, setCampingItemId] = useState<number | null>(null);
  const openEdit = () => { setForm(filledForm); setCampingItemId(1); setOpen(true); };
  return (
    <>
      <Button onClick={openEdit}>Bearbeiten</Button>
      <FormDialog open={open} onOpenChange={(v) => { if (!v) setOpen(false); }}>
        <CampingItemFormContent campingItemId={campingItemId} form={form} setForm={setForm} onSubmit={(e) => { e.preventDefault(); setOpen(false); }} onClose={() => setOpen(false)} />
      </FormDialog>
    </>
  );
}

export const Edit: FormStory = {
  render: () => <CampingItemFormDialogEditWrapper />,
  parameters: { docs: { description: { story: 'Klick auf „Bearbeiten“ öffnet den Dialog mit ausgefüllten Camping-Item-Daten.' } } },
};

export const EditContent: FormStory = {
  args: {
    name: filledForm.name,
    category: filledForm.category,
    size: filledForm.size,
    description: filledForm.description,
    isActive: filledForm.isActive,
  },
  render: (args) =>
  {
    const initialForm: CampingItemFormData = { ...filledForm, ...args };
    return <CampingItemFormContentWrapper initialForm={initialForm} campingItemId={1} />;
  },
  parameters: { docs: { description: { story: 'Formular-Inhalt mit über Controls änderbaren Ausgangsdaten.' } } },
};
