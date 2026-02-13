import { useState, useCallback } from 'react'
import { toast } from 'sonner'

type CrudMode<TEntity> =
  | { type: 'create' }
  | { type: 'edit'; entity: TEntity }

/**
 * Configuration options for {@link useCrud}.
 *
 * @typeParam TForm - Shape of the local form state.
 * @typeParam TEntity - Entity type returned by the API (must have a numeric `id`).
 * @typeParam TPayload - Shape of the data sent to create/update (defaults to `TForm`).
 */
export type UseCrudOptions<TForm, TEntity extends { id: number }, TPayload = TForm> = {
  /** Initial (empty) form state used when creating a new entity or resetting the dialog. */
  emptyForm: TForm
  /** Converts an existing entity into form state for editing. */
  toForm: (entity: TEntity) => TForm
  /** Transforms the current form state into the API payload before submission. */
  buildPayload: (form: TForm) => TPayload

  /** Persists a new entity. Receives the built payload and should return a promise. */
  create: (payload: TPayload) => Promise<unknown>
  /** Updates an existing entity. Receives the entity id and the built payload. */
  update: (args: { id: number; data: TPayload }) => Promise<unknown>

  /** Toast messages shown after a successful create or update. */
  messages: { create: string; update: string }

  /**
   * Optional form validator invoked before submission.
   * Return an error message string to abort and show a toast, or `null` to proceed.
   */
  validate?: (form: TForm) => string | null
}

/**
 * Generic hook that manages CRUD dialog state, form data, validation, and the submit flow.
 *
 * This hook is framework-agnostic regarding data fetching — it delegates persistence
 * to the `create` and `update` promise-based functions provided via options.
 *
 * @typeParam TForm - Shape of the local form state.
 * @typeParam TEntity - Entity type (must have a numeric `id`).
 * @typeParam TPayload - API payload shape (defaults to `TForm`).
 * @param options - CRUD configuration (form shape, persistence functions, messages, validation).
 * @returns Dialog state, form state and setter, open/close/submit handlers, and `dialogProps` for the dialog component.
 */
export function useCrud<TForm, TEntity extends { id: number }, TPayload = TForm>({
  emptyForm,
  toForm,
  buildPayload,
  create,
  update,
  messages,
  validate,
}: UseCrudOptions<TForm, TEntity, TPayload>)
{
  const [mode, setMode] = useState<CrudMode<TEntity> | null>(null)
  const [form, setForm] = useState<TForm>(emptyForm)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isOpen = mode !== null
  const editing = mode?.type === 'edit' ? mode.entity : null

  const openCreate = useCallback(() =>
  {
    setMode({ type: 'create' })
    setForm(emptyForm)
  }, [emptyForm])

  const openEdit = useCallback(
    (entity: TEntity) =>
    {
      setMode({ type: 'edit', entity })
      setForm(toForm(entity))
    },
    [toForm]
  )

  const close = useCallback(() =>
  {
    setMode(null)
    setForm(emptyForm)
  }, [emptyForm])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) =>
    {
      e.preventDefault()

      const validationError = validate?.(form) ?? null
      if (validationError)
      {
        toast.error(validationError)
        return
      }

      const payload = buildPayload(form);      
      const doSave = editing
        ? () => update({ id: editing.id, data: payload })
        : () => create(payload);

      const successMessage = editing ? messages.update : messages.create

      try
      {
        setIsSubmitting(true)
        await doSave()
        toast.success(successMessage)
        close()
      }
      catch (err: unknown)
      {
        const message = typeof err === 'string' ? err : err instanceof Error ? err.message : 'Fehler'
        toast.error(message)
      }
      finally
      {
        setIsSubmitting(false)
      }
    },
    [validate, form, buildPayload, editing, update, create, messages, close]
  )

  return {
    isOpen,
    editing,
    form,
    setForm,
    isSubmitting,
    openCreate,
    openEdit,
    close,
    handleSubmit,
    dialogProps: {
      open: isOpen,
      onOpenChange: (openValue: boolean) => { if (!openValue) close() },
    },
  }
}
