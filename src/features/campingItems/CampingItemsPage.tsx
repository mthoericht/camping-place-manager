import { Package } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import PageHeader from '@/components/layout/PageHeader'
import EmptyState from '@/components/layout/EmptyState'
import ItemCard from './components/ItemCard'
import ItemFormDialog from './components/ItemFormDialog'
import { useItemCrud } from './useItemCrud'
import { useConfirmDelete } from '@/hooks/useConfirmDelete'
import { useFetchWhenIdle } from '@/hooks/useFetchWhenIdle'
import { useAppSelector } from '@/store/hooks'
import { fetchCampingItems, deleteCampingItem, campingItemsSelectors } from '@/store/campingItemsSlice'

export default function CampingItemsPage()
{
  const items = useAppSelector(campingItemsSelectors.selectAll)
  const status = useAppSelector((s) => s.campingItems.status)

  const { editing, form, setForm, openCreate, openEdit, close, dialogProps, handleSubmit } = useItemCrud()
  const handleDelete = useConfirmDelete(deleteCampingItem, {
    confirmMessage: 'Item wirklich löschen?',
    successMessage: 'Item gelöscht',
    errorMessage: 'Fehler beim Löschen',
  })

  useFetchWhenIdle(() => fetchCampingItems(), status)

  return (
    <div className="space-y-6">
      <PageHeader title="Camping-Ausrüstung" description="Verwalten Sie verfügbare Camping-Items">
        <ItemFormDialog
          dialogProps={dialogProps}
          openCreate={openCreate}
          editing={editing}
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          onClose={close}
        />
      </PageHeader>

      {status === 'loading' && <p className="text-muted-foreground">Laden...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        ))}
        {items.length === 0 && status !== 'loading' && (
          <Card className="col-span-full">
            <CardContent><EmptyState icon={<Package />} message="Keine Camping-Items vorhanden" /></CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
