import { renderHook, act } from '@testing-library/react';
import { useCampingPlaceForm } from '../useCampingPlaceForm';
import { useCampingPlaceMutations } from '../useCampingPlaceMutations';
import { useCrudFormActions } from '../useCrudFormActions';

jest.mock('../useCampingPlaceMutations');
jest.mock('../useCrudFormActions');

const mockCreateCampingPlace = jest.fn();
const mockUpdateCampingPlace = jest.fn();
const mockDeleteCampingPlace = jest.fn();
const mockRun = jest.fn();
const mockRunWithConfirm = jest.fn();

describe('useCampingPlaceForm', () => 
{
  beforeEach(() => 
  {
    jest.clearAllMocks();

    (useCampingPlaceMutations as jest.Mock).mockReturnValue({
      createCampingPlace: mockCreateCampingPlace,
      updateCampingPlace: mockUpdateCampingPlace,
      deleteCampingPlace: mockDeleteCampingPlace,
    });

    (useCrudFormActions as jest.Mock).mockReturnValue({
      isSubmitting: false,
      run: mockRun,
      runWithConfirm: mockRunWithConfirm,
    });
  });

  describe('initialization', () => 
  {
    it('should initialize formData with defaults', () => 
    {
      const { result } = renderHook(() => useCampingPlaceForm());

      expect(result.current.formData).toEqual({
        name: '',
        description: '',
        location: '',
        size: 1,
        price: 0,
        amenities: [],
        isActive: true,
      });
    });

    it('should initialize formData with initialData', () => 
    {
      const initialData = {
        id: 'TEST_123',
        name: 'TEST_Place',
        description: 'TEST_Description',
        location: 'TEST_Location',
        size: 5,
        price: 25.50,
        amenities: ['WiFi', 'Pool'],
        isActive: false,
      };

      const { result } = renderHook(() => useCampingPlaceForm(initialData));

      expect(result.current.formData).toEqual({
        name: 'TEST_Place',
        description: 'TEST_Description',
        location: 'TEST_Location',
        size: 5,
        price: 25.50,
        amenities: ['WiFi', 'Pool'],
        isActive: false,
      });
    });

    it('should set isEditMode to true when initialData.id is present', () => 
    {
      const { result } = renderHook(() => useCampingPlaceForm({ id: 'TEST_123' }));
      expect(result.current.isEditMode).toBe(true);
    });

    it('should set isEditMode to false when no id is present', () => 
    {
      const { result } = renderHook(() => useCampingPlaceForm());
      expect(result.current.isEditMode).toBe(false);
    });
  });

  describe('setField', () => 
  {
    it('should update individual fields correctly', () => 
    {
      const { result } = renderHook(() => useCampingPlaceForm());

      act(() => 
      {
        result.current.setField('name', 'TEST_NewName');
      });

      expect(result.current.formData.name).toBe('TEST_NewName');
    });

    it('should update numeric fields correctly', () => 
    {
      const { result } = renderHook(() => useCampingPlaceForm());

      act(() => 
      {
        result.current.setField('size', 10);
        result.current.setField('price', 99.99);
      });

      expect(result.current.formData.size).toBe(10);
      expect(result.current.formData.price).toBe(99.99);
    });
  });

  describe('setFieldFromEvent with NaN-safe parsing', () => 
  {
    const createMockEvent = (value: string) => ({
      target: { value },
    }) as React.ChangeEvent<HTMLInputElement>;

    it('should parse size with valid number as int', () => 
    {
      const { result } = renderHook(() => useCampingPlaceForm());

      act(() => 
      {
        result.current.setFieldFromEvent('size', createMockEvent('5'));
      });

      expect(result.current.formData.size).toBe(5);
    });

    it('should fallback to 1 when size is empty string', () => 
    {
      const { result } = renderHook(() => useCampingPlaceForm());

      act(() => 
      {
        result.current.setFieldFromEvent('size', createMockEvent(''));
      });

      expect(result.current.formData.size).toBe(1);
    });

    it('should parse price with valid number as float', () => 
    {
      const { result } = renderHook(() => useCampingPlaceForm());

      act(() => 
      {
        result.current.setFieldFromEvent('price', createMockEvent('25.50'));
      });

      expect(result.current.formData.price).toBe(25.50);
    });

    it('should fallback to 0 when price is empty string', () => 
    {
      const { result } = renderHook(() => useCampingPlaceForm());

      act(() => 
      {
        result.current.setFieldFromEvent('price', createMockEvent(''));
      });

      expect(result.current.formData.price).toBe(0);
    });
  });

  describe('amenities management', () => 
  {
    it('should add new amenity with addAmenity', () => 
    {
      const { result } = renderHook(() => useCampingPlaceForm());

      act(() => 
      {
        result.current.setAmenityInput('TEST_WiFi');
      });

      act(() => 
      {
        result.current.addAmenity();
      });

      expect(result.current.formData.amenities).toContain('TEST_WiFi');
      expect(result.current.amenityInput).toBe('');
    });

    it('should not add duplicate amenity', () => 
    {
      const { result } = renderHook(() => useCampingPlaceForm({
        amenities: ['TEST_WiFi'],
      }));

      act(() => 
      {
        result.current.setAmenityInput('TEST_WiFi');
      });

      act(() => 
      {
        result.current.addAmenity();
      });

      expect(result.current.formData.amenities).toEqual(['TEST_WiFi']);
    });

    it('should not add empty amenity', () => 
    {
      const { result } = renderHook(() => useCampingPlaceForm());

      act(() => 
      {
        result.current.setAmenityInput('   ');
      });

      act(() => 
      {
        result.current.addAmenity();
      });

      expect(result.current.formData.amenities).toEqual([]);
    });

    it('should remove amenity with removeAmenity', () => 
    {
      const { result } = renderHook(() => useCampingPlaceForm({
        amenities: ['TEST_WiFi', 'TEST_Pool'],
      }));

      act(() => 
      {
        result.current.removeAmenity('TEST_WiFi');
      });

      expect(result.current.formData.amenities).toEqual(['TEST_Pool']);
    });
  });

  describe('handleSubmit', () => 
  {
    const mockPreventDefault = jest.fn();
    const mockEvent = { preventDefault: mockPreventDefault } as unknown as React.FormEvent;

    it('should call createCampingPlace for new place', async () => 
    {
      mockRun.mockImplementation(async (fn: () => Promise<unknown>) => 
      {
        await fn();
      });

      const { result } = renderHook(() => useCampingPlaceForm());

      await act(async () => 
      {
        await result.current.handleSubmit(mockEvent);
      });

      expect(mockPreventDefault).toHaveBeenCalled();
      expect(mockRun).toHaveBeenCalled();
      expect(mockCreateCampingPlace).toHaveBeenCalledWith(result.current.formData);
      expect(mockUpdateCampingPlace).not.toHaveBeenCalled();
    });

    it('should call updateCampingPlace for existing place', async () => 
    {
      mockRun.mockImplementation(async (fn: () => Promise<unknown>) => 
      {
        await fn();
      });

      const { result } = renderHook(() => useCampingPlaceForm({ id: 'TEST_123' }));

      await act(async () => 
      {
        await result.current.handleSubmit(mockEvent);
      });

      expect(mockPreventDefault).toHaveBeenCalled();
      expect(mockRun).toHaveBeenCalled();
      expect(mockUpdateCampingPlace).toHaveBeenCalledWith('TEST_123', result.current.formData);
      expect(mockCreateCampingPlace).not.toHaveBeenCalled();
    });
  });

  describe('handleDelete', () => 
  {
    it('should call deleteCampingPlace with id', async () => 
    {
      mockRunWithConfirm.mockImplementation(async (_msg: string, fn: () => Promise<unknown>) => 
      {
        await fn();
      });

      const { result } = renderHook(() => useCampingPlaceForm({ id: 'TEST_123' }));

      await act(async () => 
      {
        await result.current.handleDelete();
      });

      expect(mockRunWithConfirm).toHaveBeenCalledWith(
        'Are you sure you want to delete this camping place? This action cannot be undone.',
        expect.any(Function)
      );
      expect(mockDeleteCampingPlace).toHaveBeenCalledWith('TEST_123');
    });

    it('should not call deleteCampingPlace when no id', async () => 
    {
      const { result } = renderHook(() => useCampingPlaceForm());

      await act(async () => 
      {
        await result.current.handleDelete();
      });

      expect(mockRunWithConfirm).not.toHaveBeenCalled();
      expect(mockDeleteCampingPlace).not.toHaveBeenCalled();
    });
  });
});
