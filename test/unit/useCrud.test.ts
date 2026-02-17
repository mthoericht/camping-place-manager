import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { useCrud } from '@/hooks/useCrud';
import { toast } from 'sonner';

type TestForm = { name: string }
type TestEntity = { id: number; name: string }

const defaultOptions = () => ({
  emptyForm: { name: '' } as TestForm,
  toForm: (entity: TestEntity): TestForm => ({ name: entity.name }),
  buildPayload: (form: TestForm) => form,
  create: vi.fn().mockResolvedValue({}),
  update: vi.fn().mockResolvedValue({}),
  messages: { create: 'Erstellt', update: 'Aktualisiert' },
});

describe('useCrud', () =>
{
  beforeEach(() =>
  {
    vi.clearAllMocks();
  });

  it('initializes with closed dialog and empty form', () =>
  {
    const { result } = renderHook(() => useCrud(defaultOptions()));
    expect(result.current.isOpen).toBe(false);
    expect(result.current.editing).toBe(null);
    expect(result.current.form.name).toBe('');
  });

  it('openCreate opens dialog with empty form', () =>
  {
    const { result } = renderHook(() => useCrud(defaultOptions()));
    act(() => result.current.openCreate());
    expect(result.current.isOpen).toBe(true);
    expect(result.current.editing).toBe(null);
    expect(result.current.form.name).toBe('');
  });

  it('openEdit opens dialog with entity data', () =>
  {
    const { result } = renderHook(() => useCrud(defaultOptions()));
    act(() => result.current.openEdit({ id: 1, name: 'Test' }));
    expect(result.current.isOpen).toBe(true);
    expect(result.current.editing!.id).toBe(1);
    expect(result.current.form.name).toBe('Test');
  });

  it('close resets dialog and form', () =>
  {
    const { result } = renderHook(() => useCrud(defaultOptions()));
    act(() => result.current.openEdit({ id: 1, name: 'Test' }));
    act(() => result.current.close());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.editing).toBe(null);
    expect(result.current.form.name).toBe('');
  });

  it('handleSubmit calls create for new entity and shows success toast', async () =>
  {
    const options = defaultOptions();
    const { result } = renderHook(() => useCrud(options));

    act(() => result.current.openCreate());
    act(() => result.current.setForm({ name: 'New' }));

    const fakeEvent = { preventDefault: vi.fn() };
    await act(async () => result.current.handleSubmit(fakeEvent));

    expect(fakeEvent.preventDefault).toHaveBeenCalled();
    expect(options.create).toHaveBeenCalledWith({ name: 'New' });
    expect(toast.success).toHaveBeenCalledWith('Erstellt');
    expect(result.current.isOpen).toBe(false);
  });

  it('handleSubmit calls update for existing entity and shows success toast', async () =>
  {
    const options = defaultOptions();
    const { result } = renderHook(() => useCrud(options));

    act(() => result.current.openEdit({ id: 5, name: 'Old' }));
    act(() => result.current.setForm({ name: 'Updated' }));

    const fakeEvent = { preventDefault: vi.fn() };
    await act(async () => result.current.handleSubmit(fakeEvent));

    expect(options.update).toHaveBeenCalledWith({ id: 5, data: { name: 'Updated' } });
    expect(toast.success).toHaveBeenCalledWith('Aktualisiert');
    expect(result.current.isOpen).toBe(false);
  });

  it('handleSubmit shows error toast on validation failure', async () =>
  {
    const options = { ...defaultOptions(), validate: () => 'Validation error' };
    const { result } = renderHook(() => useCrud(options));

    act(() => result.current.openCreate());

    const fakeEvent = { preventDefault: vi.fn() };
    await act(async () => result.current.handleSubmit(fakeEvent));

    expect(toast.error).toHaveBeenCalledWith('Validation error');
    expect(options.create).not.toHaveBeenCalled();
  });

  it('handleSubmit shows error toast when create rejects', async () =>
  {
    const options = defaultOptions();
    options.create.mockRejectedValue(new Error('Server error'));
    const { result } = renderHook(() => useCrud(options));

    act(() => result.current.openCreate());

    const fakeEvent = { preventDefault: vi.fn() };
    await act(async () => result.current.handleSubmit(fakeEvent));

    expect(toast.error).toHaveBeenCalledWith('Server error');
    expect(result.current.isOpen).toBe(true);
  });

  it('dialogProps.onOpenChange(false) closes the dialog', () =>
  {
    const { result } = renderHook(() => useCrud(defaultOptions()));
    act(() => result.current.openCreate());
    act(() => result.current.dialogProps.onOpenChange(false));
    expect(result.current.isOpen).toBe(false);
  });
});
