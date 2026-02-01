import { renderHook, act } from '@testing-library/react';
import { useCampingItemForm } from '../useCampingItemForm';
import { useCampingItemMutations } from '../useCampingItemMutations';
import { useCrudFormActions } from '../useCrudFormActions';

jest.mock('../useCampingItemMutations');
jest.mock('../useCrudFormActions');

const mockCreateCampingItem = jest.fn();
const mockUpdateCampingItem = jest.fn();
const mockDeleteCampingItem = jest.fn();
const mockRun = jest.fn();
const mockRunWithConfirm = jest.fn();

describe('useCampingItemForm', () =>
{
  beforeEach(() =>
  {
    jest.clearAllMocks();
    (useCampingItemMutations as jest.Mock).mockReturnValue({
      createCampingItem: mockCreateCampingItem,
      updateCampingItem: mockUpdateCampingItem,
      deleteCampingItem: mockDeleteCampingItem,
    });
    (useCrudFormActions as jest.Mock).mockReturnValue({
      isSubmitting: false,
      run: mockRun,
      runWithConfirm: mockRunWithConfirm,
    });
  });

  describe('initialization', () =>
  {
    it('should initialize formData with defaults when no initialData', () =>
    {
      const { result } = renderHook(() => useCampingItemForm());

      expect(result.current.formData).toEqual({
        name: '',
        category: '',
        size: 1,
        description: '',
        isActive: true,
      });
    });

    it('should initialize formData with initialData', () =>
    {
      const initialData = {
        id: 'TEST_123',
        name: 'TEST_Tent',
        category: 'TEST_Equipment',
        size: 5,
        description: 'TEST_Description',
        isActive: false,
      };

      const { result } = renderHook(() => useCampingItemForm(initialData));

      expect(result.current.formData).toEqual({
        name: 'TEST_Tent',
        category: 'TEST_Equipment',
        size: 5,
        description: 'TEST_Description',
        isActive: false,
      });
    });

    it('should set isEditMode to true when initialData.id is present', () =>
    {
      const { result } = renderHook(() => useCampingItemForm({ id: 'TEST_123' }));

      expect(result.current.isEditMode).toBe(true);
    });

    it('should set isEditMode to false when initialData.id is not present', () =>
    {
      const { result } = renderHook(() => useCampingItemForm({ name: 'TEST_Name' }));

      expect(result.current.isEditMode).toBe(false);
    });

    it('should set isEditMode to false when no initialData', () =>
    {
      const { result } = renderHook(() => useCampingItemForm());

      expect(result.current.isEditMode).toBe(false);
    });
  });

  describe('setField', () =>
  {
    it('should update single fields correctly', () =>
    {
      const { result } = renderHook(() => useCampingItemForm());

      act(() =>
      {
        result.current.setField('name', 'TEST_NewName');
      });

      expect(result.current.formData.name).toBe('TEST_NewName');
    });

    it('should update size field correctly', () =>
    {
      const { result } = renderHook(() => useCampingItemForm());

      act(() =>
      {
        result.current.setField('size', 10);
      });

      expect(result.current.formData.size).toBe(10);
    });

    it('should update isActive field correctly', () =>
    {
      const { result } = renderHook(() => useCampingItemForm());

      act(() =>
      {
        result.current.setField('isActive', false);
      });

      expect(result.current.formData.isActive).toBe(false);
    });
  });

  describe('setFieldFromEvent with NaN-safe parsing', () =>
  {
    it('should parse size with valid number', () =>
    {
      const { result } = renderHook(() => useCampingItemForm());

      act(() =>
      {
        result.current.setFieldFromEvent('size', {
          target: { value: '42' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.formData.size).toBe(42);
    });

    it('should fallback to 1 when size is empty string', () =>
    {
      const { result } = renderHook(() => useCampingItemForm());

      act(() =>
      {
        result.current.setFieldFromEvent('size', {
          target: { value: '' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.formData.size).toBe(1);
    });

    it('should fallback to 1 when size is "abc"', () =>
    {
      const { result } = renderHook(() => useCampingItemForm());

      act(() =>
      {
        result.current.setFieldFromEvent('size', {
          target: { value: 'abc' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.formData.size).toBe(1);
    });

    it('should use checked for isActive checkbox', () =>
    {
      const { result } = renderHook(() => useCampingItemForm());

      act(() =>
      {
        result.current.setFieldFromEvent('isActive', {
          target: { checked: false },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.formData.isActive).toBe(false);

      act(() =>
      {
        result.current.setFieldFromEvent('isActive', {
          target: { checked: true },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.formData.isActive).toBe(true);
    });

    it('should update name field from event', () =>
    {
      const { result } = renderHook(() => useCampingItemForm());

      act(() =>
      {
        result.current.setFieldFromEvent('name', {
          target: { value: 'TEST_EventName' },
        } as React.ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.formData.name).toBe('TEST_EventName');
    });
  });

  describe('handleSubmit', () =>
  {
    it('should call createCampingItem for new item', async () =>
    {
      mockRun.mockImplementation(async (fn: () => Promise<unknown>) =>
      {
        await fn();
      });

      const { result } = renderHook(() => useCampingItemForm());

      act(() =>
      {
        result.current.setField('name', 'TEST_NewItem');
      });

      await act(async () =>
      {
        await result.current.handleSubmit({ preventDefault: jest.fn() } as unknown as React.FormEvent);
      });

      expect(mockRun).toHaveBeenCalled();
      expect(mockCreateCampingItem).toHaveBeenCalledWith({
        name: 'TEST_NewItem',
        category: '',
        size: 1,
        description: '',
        isActive: true,
      });
      expect(mockUpdateCampingItem).not.toHaveBeenCalled();
    });

    it('should call updateCampingItem for existing item with id', async () =>
    {
      mockRun.mockImplementation(async (fn: () => Promise<unknown>) =>
      {
        await fn();
      });

      const { result } = renderHook(() => useCampingItemForm({
        id: 'TEST_existingId',
        name: 'TEST_ExistingItem',
      }));

      await act(async () =>
      {
        await result.current.handleSubmit({ preventDefault: jest.fn() } as unknown as React.FormEvent);
      });

      expect(mockRun).toHaveBeenCalled();
      expect(mockUpdateCampingItem).toHaveBeenCalledWith('TEST_existingId', {
        name: 'TEST_ExistingItem',
        category: '',
        size: 1,
        description: '',
        isActive: true,
      });
      expect(mockCreateCampingItem).not.toHaveBeenCalled();
    });

    it('should call preventDefault on form event', async () =>
    {
      const preventDefault = jest.fn();
      const { result } = renderHook(() => useCampingItemForm());

      await act(async () =>
      {
        await result.current.handleSubmit({ preventDefault } as unknown as React.FormEvent);
      });

      expect(preventDefault).toHaveBeenCalled();
    });
  });

  describe('handleDelete', () =>
  {
    it('should call deleteCampingItem with id', async () =>
    {
      mockRunWithConfirm.mockImplementation(async (_msg: string, fn: () => Promise<unknown>) =>
      {
        await fn();
      });

      const { result } = renderHook(() => useCampingItemForm({ id: 'TEST_deleteId' }));

      await act(async () =>
      {
        await result.current.handleDelete();
      });

      expect(mockRunWithConfirm).toHaveBeenCalledWith(
        'Are you sure you want to delete this camping item? This action cannot be undone.',
        expect.any(Function)
      );
      expect(mockDeleteCampingItem).toHaveBeenCalledWith('TEST_deleteId');
    });

    it('should not call deleteCampingItem when no id', async () =>
    {
      const { result } = renderHook(() => useCampingItemForm());

      await act(async () =>
      {
        await result.current.handleDelete();
      });

      expect(mockRunWithConfirm).not.toHaveBeenCalled();
      expect(mockDeleteCampingItem).not.toHaveBeenCalled();
    });
  });
});
