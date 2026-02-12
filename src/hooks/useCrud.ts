import { useState, useCallback, useMemo } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { toast } from 'sonner'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DispatchableThunk<TArg> = (arg: TArg) => any

/**
 * Configuration for useCrud: form shape, entity mapping, thunks, validation, and success messages.
 */
export type UseCrudOptions<TForm, TEntity extends { id: number }, TPayload = TForm> = {
  emptyForm: TForm
  toForm: (entity: TEntity) => TForm
  createThunk: DispatchableThunk<TPayload>
  updateThunk: DispatchableThunk<{ id: number; data: TPayload }>
  getPayload: (form: TForm) => TPayload
  successCreate: string
  successUpdate: string
  validate?: (form: TForm) => boolean
}

/**
 * Manages CRUD dialog state, form data, and submit flow for create/edit.
 * @param options - CRUD configuration (emptyForm, toForm, thunks, validation, messages)
 * @returns Dialog state, form, handlers (openCreate, openEdit, close), dialogProps, handleSubmit
 */
export function useCrud<TForm, TEntity extends { id: number }, TPayload = TForm>({
  emptyForm,
  toForm,
  createThunk,
  updateThunk,
  getPayload,
  successCreate,
  successUpdate,
  validate,
}: UseCrudOptions<TForm, TEntity, TPayload>)
{
  const dispatch = useAppDispatch()
  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState<TEntity | null>(null)
  const [form, setForm] = useState<TForm>(emptyForm)

  const openCreate = useCallback(() =>
  {
    setEditing(null)
    setForm(emptyForm)
    setIsOpen(true)
  }, [emptyForm])

  const openEdit = useCallback(
    (entity: TEntity) =>
    {
      setEditing(entity)
      setForm(toForm(entity))
      setIsOpen(true)
    },
    [toForm]
  )

  const close = useCallback(() =>
  {
    setForm(emptyForm)
    setEditing(null)
    setIsOpen(false)
  }, [emptyForm])

  const dialogProps = useMemo(
    () => ({
      open: isOpen,
      onOpenChange: (openValue: boolean) => { if (!openValue) close() },
    }),
    [isOpen, close]
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) =>
    {
      e.preventDefault()
      if (validate && !validate(form)) return
      const payload = getPayload(form)
      try
      {
        if (editing)
        {
          await dispatch(updateThunk({ id: editing.id, data: payload })).unwrap()
          toast.success(successUpdate)
        }
        else
        {
          await dispatch(createThunk(payload)).unwrap()
          toast.success(successCreate)
        }
        close()
      }
      catch (err: unknown)
      {
        toast.error(typeof err === 'string' ? err : err instanceof Error ? err.message : 'Fehler')
      }
    },
    [dispatch, form, editing, validate, getPayload, createThunk, updateThunk, successCreate, successUpdate, close]
  )

  return { isOpen, editing, form, setForm, openCreate, openEdit, close, dialogProps, handleSubmit }
}
