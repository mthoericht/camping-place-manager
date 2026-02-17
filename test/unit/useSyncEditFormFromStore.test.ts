import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useSyncEditFormFromStore } from '@/hooks/useSyncEditFormFromStore';

type Entity = { id: number; updatedAt: string }
type Form = { name: string }
const toForm = (e: Entity): Form => ({ name: `entity-${e.id}` });

describe('useSyncEditFormFromStore', () =>
{
  it('does nothing when not editing', () =>
  {
    const close = vi.fn();
    const setForm = vi.fn();

    renderHook(() => useSyncEditFormFromStore<Entity, Form>(null, undefined, close, setForm, toForm));

    expect(close).not.toHaveBeenCalled();
    expect(setForm).not.toHaveBeenCalled();
  });

  it('calls close when entity is deleted from store', () =>
  {
    const close = vi.fn();
    const setForm = vi.fn();
    const editing: Entity = { id: 1, updatedAt: '2025-01-01' };

    renderHook(() => useSyncEditFormFromStore<Entity, Form>(editing, undefined, close, setForm, toForm));

    expect(close).toHaveBeenCalled();
  });

  it('calls setForm when storeEntity updatedAt differs from editing', () =>
  {
    const close = vi.fn();
    const setForm = vi.fn();
    const editing: Entity = { id: 1, updatedAt: '2025-01-01' };
    const storeEntity: Entity = { id: 1, updatedAt: '2025-01-02' };

    renderHook(() => useSyncEditFormFromStore<Entity, Form>(editing, storeEntity, close, setForm, toForm));

    expect(setForm).toHaveBeenCalledWith({ name: 'entity-1' });
  });

  it('does nothing when updatedAt matches', () =>
  {
    const close = vi.fn();
    const setForm = vi.fn();
    const editing: Entity = { id: 1, updatedAt: '2025-01-01' };
    const storeEntity: Entity = { id: 1, updatedAt: '2025-01-01' };

    renderHook(() => useSyncEditFormFromStore<Entity, Form>(editing, storeEntity, close, setForm, toForm));

    expect(close).not.toHaveBeenCalled();
    expect(setForm).not.toHaveBeenCalled();
  });
});
