import { useState, useCallback, useMemo } from 'react'

export function useFormDialog<T>(emptyForm: T) 
{
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState<T>(emptyForm)

  const open = useCallback(() => 
  {
    setForm(emptyForm)
    setIsOpen(true)
  }, [emptyForm])

  const close = useCallback(() => 
  {
    setForm(emptyForm)
    setIsOpen(false)
  }, [emptyForm])

  const dialogProps = useMemo(
    () => ({
      open: isOpen,
      onOpenChange: (openValue: boolean) => (openValue ? open() : close()),
    }),
    [isOpen, open, close]
  )

  return { isOpen, form, setForm, open, close, dialogProps }
}
