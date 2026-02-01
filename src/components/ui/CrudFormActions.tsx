import { Button } from './Button';

interface CrudFormActionsProps
{
  isSubmitting: boolean;
  isEditMode: boolean;
  onCancel: () => void;
  onDelete?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  deleteLabel?: string;
  deleteConfirmMessage?: string;
}

export function CrudFormActions({
  isSubmitting,
  isEditMode,
  onCancel,
  onDelete,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  deleteLabel = 'Delete',
  deleteConfirmMessage = 'Are you sure you want to delete this item?',
}: CrudFormActionsProps)
{
  const handleDelete = () =>
  {
    if (onDelete && confirm(deleteConfirmMessage))
    {
      onDelete();
    }
  };

  return (
    <div className="flex justify-between items-center pt-4">
      <div className="flex gap-3">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          {cancelLabel}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
      {isEditMode && onDelete && (
        <Button type="button" variant="danger" onClick={handleDelete} disabled={isSubmitting}>
          {deleteLabel}
        </Button>
      )}
    </div>
  );
}
