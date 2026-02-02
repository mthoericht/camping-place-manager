import { renderHook, act } from '@testing-library/react';
import { useBookingForm } from '../useBookingForm';

jest.mock('@/stores/useCampingPlacesStore');
jest.mock('@/stores/useCampingItemsStore');
jest.mock('@/hooks/useBookingMutations');
jest.mock('@/hooks/useCrudFormActions');

import { useCampingPlacesStore } from '@/stores/useCampingPlacesStore';
import { useCampingItemsStore } from '@/stores/useCampingItemsStore';
import { useBookingMutations } from '@/hooks/useBookingMutations';
import { useCrudFormActions } from '@/hooks/useCrudFormActions';

interface MockPlace
{
  id: string;
  name: string;
  size: number;
  price: number;
}

interface MockItem
{
  id: string;
  name: string;
  size: number;
  price: number;
}

const mockPlacesStore = 
{
  loading: false,
  error: null as string | null,
  fetch: jest.fn(),
  getActive: jest.fn((): MockPlace[] => []),
  getById: jest.fn((): MockPlace | null => null),
};

const mockItemsStore = 
{
  items: [] as MockItem[],
  loading: false,
  error: null as string | null,
  fetch: jest.fn(),
};

const mockMutations = 
{
  createBooking: jest.fn(),
  updateBooking: jest.fn(),
};

const mockFormActions = 
{
  isSubmitting: false,
  run: jest.fn(),
};

const setupMocks = (
  placesOverrides: Partial<typeof mockPlacesStore> = {},
  itemsOverrides: Partial<typeof mockItemsStore> = {}
) =>
{
  const places = { ...mockPlacesStore, ...placesOverrides };
  const items = { ...mockItemsStore, ...itemsOverrides };

  (useCampingPlacesStore as unknown as jest.Mock).mockImplementation((selector) => 
  {
    const state = 
    {
      loading: places.loading,
      error: places.error,
      fetch: places.fetch,
      getActive: places.getActive,
      getById: places.getById,
    };
    return selector(state);
  });

  (useCampingItemsStore as unknown as jest.Mock).mockImplementation((selector) => 
  {
    const state = 
    {
      items: items.items,
      loading: items.loading,
      error: items.error,
      fetch: items.fetch,
    };
    return selector(state);
  });

  (useBookingMutations as jest.Mock).mockReturnValue(mockMutations);
  (useCrudFormActions as jest.Mock).mockReturnValue(mockFormActions);
};

describe('useBookingForm', () => 
{
  beforeEach(() => 
  {
    jest.clearAllMocks();
  });

  describe('initialization', () => 
  {
    it('should initialize formData with initialData', () => 
    {
      setupMocks();

      const initialData = 
      {
        campingPlaceId: 'TEST_place1',
        customerName: 'TEST_Max Mustermann',
        customerEmail: 'test@example.com',
        customerPhone: '123456789',
        startDate: '2024-06-01',
        endDate: '2024-06-05',
        guests: 4,
        notes: 'TEST notes',
      };

      const { result } = renderHook(() => useBookingForm(initialData));

      expect(result.current.formData).toEqual(
        {
          campingPlaceId: 'TEST_place1',
          customerName: 'TEST_Max Mustermann',
          customerEmail: 'test@example.com',
          customerPhone: '123456789',
          startDate: '2024-06-01',
          endDate: '2024-06-05',
          guests: 4,
          notes: 'TEST notes',
        });
    });

    it('should initialize selectedItems with initialData.campingItems', () => 
    {
      setupMocks();

      const initialData = 
      {
        campingItems: { 'TEST_item1': 2, 'TEST_item2': 3 },
      };

      const { result } = renderHook(() => useBookingForm(initialData));

      expect(result.current.selectedItems).toEqual({ 'TEST_item1': 2, 'TEST_item2': 3 });
    });

    it('should set isEditMode to true when initialData.id is present', () => 
    {
      setupMocks();

      const { result: resultWithId } = renderHook(() => 
        useBookingForm({ id: 'TEST_booking123' })
      );
      expect(resultWithId.current.isEditMode).toBe(true);

      const { result: resultWithoutId } = renderHook(() => useBookingForm({}));
      expect(resultWithoutId.current.isEditMode).toBe(false);

      const { result: resultUndefined } = renderHook(() => useBookingForm());
      expect(resultUndefined.current.isEditMode).toBe(false);
    });
  });

  describe('selectedPlace fallback', () => 
  {
    it('should return initialData.campingPlace when store is empty', () => 
    {
      setupMocks({ getById: jest.fn(() => null) });

      const initialData = 
      {
        campingPlaceId: 'TEST_place1',
        campingPlace: 
        {
          id: 'TEST_place1',
          name: 'TEST Camping Place',
          size: 100,
          price: 50,
        },
      };

      const { result } = renderHook(() => useBookingForm(initialData));

      expect(result.current.selectedPlace).toEqual(
        {
          id: 'TEST_place1',
          name: 'TEST Camping Place',
          size: 100,
          price: 50,
        });
    });

    it('should prefer store place over initialData.campingPlace', () => 
    {
      const storePlace = 
      {
        id: 'TEST_place1',
        name: 'TEST Store Place',
        size: 150,
        price: 75,
      };

      setupMocks({ getById: jest.fn(() => storePlace) });

      const initialData = 
      {
        campingPlaceId: 'TEST_place1',
        campingPlace: 
        {
          id: 'TEST_place1',
          name: 'TEST Initial Place',
          size: 100,
          price: 50,
        },
      };

      const { result } = renderHook(() => useBookingForm(initialData));

      expect(result.current.selectedPlace).toEqual(storePlace);
    });

    it('should return null when campingPlaceId is not set', () => 
    {
      setupMocks();

      const { result } = renderHook(() => useBookingForm({}));

      expect(result.current.selectedPlace).toBeNull();
    });
  });

  describe('setField', () => 
  {
    it('should update individual fields correctly', () => 
    {
      setupMocks();

      const { result } = renderHook(() => useBookingForm());

      act(() => 
      {
        result.current.setField('customerName', 'TEST_New Name');
      });

      expect(result.current.formData.customerName).toBe('TEST_New Name');

      act(() => 
      {
        result.current.setField('guests', 5);
      });

      expect(result.current.formData.guests).toBe(5);

      act(() => 
      {
        result.current.setField('startDate', '2024-07-01');
        result.current.setField('endDate', '2024-07-10');
      });

      expect(result.current.formData.startDate).toBe('2024-07-01');
      expect(result.current.formData.endDate).toBe('2024-07-10');
    });
  });

  describe('updateItemQuantity', () => 
  {
    it('should add/update item when quantity > 0', () => 
    {
      setupMocks();

      const { result } = renderHook(() => useBookingForm());

      act(() => 
      {
        result.current.updateItemQuantity('TEST_item1', 3);
      });

      expect(result.current.selectedItems).toEqual({ 'TEST_item1': 3 });

      act(() => 
      {
        result.current.updateItemQuantity('TEST_item1', 5);
      });

      expect(result.current.selectedItems).toEqual({ 'TEST_item1': 5 });

      act(() => 
      {
        result.current.updateItemQuantity('TEST_item2', 2);
      });

      expect(result.current.selectedItems).toEqual({ 'TEST_item1': 5, 'TEST_item2': 2 });
    });

    it('should remove item when quantity <= 0', () => 
    {
      setupMocks();

      const { result } = renderHook(() => 
        useBookingForm({ campingItems: { 'TEST_item1': 3, 'TEST_item2': 2 } })
      );

      act(() => 
      {
        result.current.updateItemQuantity('TEST_item1', 0);
      });

      expect(result.current.selectedItems).toEqual({ 'TEST_item2': 2 });

      act(() => 
      {
        result.current.updateItemQuantity('TEST_item2', -1);
      });

      expect(result.current.selectedItems).toEqual({});
    });
  });

  describe('derived values', () => 
  {
    it('should calculate nights correctly from startDate/endDate', () => 
    {
      setupMocks();

      const initialData = 
      {
        startDate: '2024-06-01',
        endDate: '2024-06-05',
      };

      const { result } = renderHook(() => useBookingForm(initialData));

      expect(result.current.nights).toBe(4);
    });

    it('should return 0 nights when dates are missing', () => 
    {
      setupMocks();

      const { result } = renderHook(() => useBookingForm());

      expect(result.current.nights).toBe(0);
    });

    it('should calculate totalPrice as nights * selectedPlace.price', () => 
    {
      const storePlace = 
      {
        id: 'TEST_place1',
        name: 'TEST Place',
        size: 100,
        price: 25,
      };

      setupMocks({ getById: jest.fn(() => storePlace) });

      const initialData = 
      {
        campingPlaceId: 'TEST_place1',
        startDate: '2024-06-01',
        endDate: '2024-06-05',
      };

      const { result } = renderHook(() => useBookingForm(initialData));

      expect(result.current.nights).toBe(4);
      expect(result.current.totalPrice).toBe(100);
    });

    it('should return 0 totalPrice when no selectedPlace', () => 
    {
      setupMocks();

      const initialData = 
      {
        startDate: '2024-06-01',
        endDate: '2024-06-05',
      };

      const { result } = renderHook(() => useBookingForm(initialData));

      expect(result.current.totalPrice).toBe(0);
    });

    it('should calculate totalSize as sum of selectedItems * item.size', () => 
    {
      const items = 
      [
        { id: 'TEST_item1', name: 'Tent', size: 10, price: 5 },
        { id: 'TEST_item2', name: 'Car', size: 15, price: 10 },
      ];

      setupMocks({}, { items });

      const initialData = 
      {
        campingItems: { 'TEST_item1': 2, 'TEST_item2': 1 },
      };

      const { result } = renderHook(() => useBookingForm(initialData));

      expect(result.current.totalSize).toBe(35);
    });

    it('should return 0 totalSize when no items selected', () => 
    {
      setupMocks();

      const { result } = renderHook(() => useBookingForm());

      expect(result.current.totalSize).toBe(0);
    });
  });

  describe('error combination', () => 
  {
    it('should combine placesError and itemsError with "; "', () => 
    {
      setupMocks(
        { error: 'TEST Places error' },
        { error: 'TEST Items error' }
      );

      const { result } = renderHook(() => useBookingForm());

      expect(result.current.error).toBe('TEST Places error; TEST Items error');
    });

    it('should return only placesError when only placesError is set', () => 
    {
      setupMocks({ error: 'TEST Places error' });

      const { result } = renderHook(() => useBookingForm());

      expect(result.current.error).toBe('TEST Places error');
    });

    it('should return only itemsError when only itemsError is set', () => 
    {
      setupMocks({}, { error: 'TEST Items error' });

      const { result } = renderHook(() => useBookingForm());

      expect(result.current.error).toBe('TEST Items error');
    });

    it('should return null when no errors', () => 
    {
      setupMocks();

      const { result } = renderHook(() => useBookingForm());

      expect(result.current.error).toBeNull();
    });
  });
});
