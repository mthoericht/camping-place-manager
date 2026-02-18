import { Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FormDialog } from '@/components/ui/dialog';
import PageHeader from '@/components/layout/PageHeader';
import EmptyState from '@/components/layout/EmptyState';
import CampingItemCard from './components/CampingItemCard';
import CampingItemFormContent from './components/CampingItemFormContent';
import { useCampingItemCrud } from './useCampingItemCrud';
import { useConfirmDelete } from '@/hooks/useConfirmDelete';
import { useFetchWhenIdle } from '@/hooks/useFetchWhenIdle';
import { useAppSelector } from '@/store/store';
import { fetchCampingItems, deleteCampingItem, campingItemsSelectors } from '@/store/campingItemsSlice';

export default function CampingItemsPage()
{
  const items = useAppSelector(campingItemsSelectors.selectAll);
  const campingItemsStatus = useAppSelector((state) => state.campingItems.status);

  const { editing, form, setForm, openCreate, openEdit, close, dialogProps, handleSubmit } = useCampingItemCrud();
  const handleDelete = useConfirmDelete(deleteCampingItem, {
    confirmMessage: 'Camping-Item wirklich löschen?',
    successMessage: 'Camping-Item gelöscht',
    errorMessage: 'Fehler beim Löschen',
  });

  useFetchWhenIdle(() => fetchCampingItems(), campingItemsStatus);

  return (
    <div id="camping-items-page" className="space-y-6">
      <PageHeader title="Camping-Ausrüstung" description="Verwalten Sie verfügbare Camping-Items">
        <Button id="item-list-add" onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Neues Camping-Item</Button>
      </PageHeader>
      <FormDialog {...dialogProps}>
        <CampingItemFormContent campingItemId={editing?.id ?? null} form={form} setForm={setForm} onSubmit={handleSubmit} onClose={close} />
      </FormDialog>

      {campingItemsStatus === 'loading' && <p className="text-muted-foreground">Laden...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <CampingItemCard
            key={item.id}
            item={item}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        ))}
        {items.length === 0 && campingItemsStatus !== 'loading' && (
          <Card className="col-span-full">
            <CardContent><EmptyState icon={<Package />} message="Keine Camping-Items vorhanden" /></CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
