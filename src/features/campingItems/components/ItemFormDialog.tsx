import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import type { CampingItemFormData } from '@/api/types'
import { categories } from '../constants'

export type ItemFormDialogProps = {
  dialogProps: { open?: boolean; onOpenChange?: (open: boolean) => void }
  openCreate: () => void
  editing: { id: number } | null
  form: CampingItemFormData
  setForm: (f: CampingItemFormData) => void
  onSubmit: (e: React.FormEvent) => void
  onClose: () => void
}

export default function ItemFormDialog({
  dialogProps,
  openCreate,
  editing,
  form,
  setForm,
  onSubmit,
  onClose,
}: ItemFormDialogProps)
{
  return (
    <Dialog {...dialogProps}>
      <DialogTrigger asChild>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Neues Item</Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>{editing ? 'Item bearbeiten' : 'Neues Item'}</DialogTitle>
            <DialogDescription>Geben Sie die Details des Camping-Items ein</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="z.B. Familienzelt" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Kategorie</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="size">Größe (m²)</Label>
              <Input id="size" type="number" min="0" value={form.size} onChange={(e) => setForm({ ...form, size: Number(e.target.value) || 0 })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Input id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optionale Beschreibung" />
            </div>
            <div className="flex items-center gap-2">
              <Switch id="isActive" checked={form.isActive} onCheckedChange={(c) => setForm({ ...form, isActive: c })} />
              <Label htmlFor="isActive">Aktiv</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Abbrechen</Button>
            <Button type="submit">{editing ? 'Aktualisieren' : 'Erstellen'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
