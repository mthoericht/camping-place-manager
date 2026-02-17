import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const mockDispatch = vi.fn();
vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: vi.fn(),
}));

import type { AsyncThunk } from '@reduxjs/toolkit';
import { renderHook, act } from '@testing-library/react';
import { useConfirmDelete } from '@/hooks/useConfirmDelete';
import { toast } from 'sonner';

const mockThunk = vi.fn() as unknown as AsyncThunk<number, number, { rejectValue: string }>;

describe('useConfirmDelete', () =>
{
  beforeEach(() =>
  {
    vi.clearAllMocks();
  });

  it('does nothing when confirm returns false', async () =>
  {
    vi.spyOn(globalThis, 'confirm').mockReturnValue(false);

    const { result } = renderHook(() =>
      useConfirmDelete(mockThunk, { confirmMessage: 'Wirklich löschen?' })
    );

    await act(async () => result.current(1));

    expect(mockDispatch).not.toHaveBeenCalled();

    vi.restoreAllMocks();
  });

  it('dispatches thunk and shows success toast on confirm', async () =>
  {
    vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    mockDispatch.mockReturnValue({ unwrap: () => Promise.resolve(1) });

    const { result } = renderHook(() =>
      useConfirmDelete(mockThunk, { confirmMessage: 'Wirklich löschen?' })
    );

    await act(async () => result.current(1));

    expect(mockDispatch).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Gelöscht');

    vi.restoreAllMocks();
  });

  it('shows error toast when thunk rejects', async () =>
  {
    vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    mockDispatch.mockReturnValue({ unwrap: () => Promise.reject(new Error('Cannot delete')) });

    const { result } = renderHook(() =>
      useConfirmDelete(mockThunk, { confirmMessage: 'Wirklich löschen?' })
    );

    await act(async () => result.current(1));

    expect(toast.error).toHaveBeenCalledWith('Cannot delete');

    vi.restoreAllMocks();
  });

  it('uses custom messages', async () =>
  {
    vi.spyOn(globalThis, 'confirm').mockReturnValue(true);
    mockDispatch.mockReturnValue({ unwrap: () => Promise.resolve(1) });

    const { result } = renderHook(() =>
      useConfirmDelete(mockThunk, {
        confirmMessage: 'Custom confirm?',
        successMessage: 'Custom success',
        errorMessage: 'Custom error',
      })
    );

    await act(async () => result.current(1));

    expect(toast.success).toHaveBeenCalledWith('Custom success');

    vi.restoreAllMocks();
  });
});
