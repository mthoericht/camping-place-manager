import { HttpError } from '../http';

// Mock the http module
jest.mock('../http', () => ({
  HttpError: class HttpError extends Error 
  {
    constructor(public status: number, message: string, public payload?: unknown) 
    {
      super(message);
      this.name = 'HttpError';
    }
  },
  fetchJson: jest.fn(),
}));

import { createCrudApi } from '../createCrudApi';
import { fetchJson } from '../http';

interface TestEntity 
{
  id: string;
  name: string;
}

interface TestFormData 
{
  name: string;
}

describe('createCrudApi', () => 
{
  const mockFetchJson = fetchJson as jest.MockedFunction<typeof fetchJson>;

  beforeEach(() => 
  {
    jest.clearAllMocks();
  });

  describe('getAll', () => 
  {
    it('should fetch all items', async () => 
    {
      const mockData = [{ id: '1', name: 'TEST_Item 1' }, { id: '2', name: 'TEST_Item 2' }];
      mockFetchJson.mockResolvedValueOnce(mockData);

      const api = createCrudApi<TestEntity, TestFormData>('/api/test');
      const result = await api.getAll();

      expect(result).toEqual(mockData);
      expect(mockFetchJson).toHaveBeenCalledWith('/api/test');
    });
  });

  describe('getById', () => 
  {
    it('should fetch single item by id', async () => 
    {
      const mockData = { id: '1', name: 'TEST_Item 1' };
      mockFetchJson.mockResolvedValueOnce(mockData);

      const api = createCrudApi<TestEntity, TestFormData>('/api/test');
      const result = await api.getById('1');

      expect(result).toEqual(mockData);
      expect(mockFetchJson).toHaveBeenCalledWith('/api/test/1');
    });

    it('should throw original error for non-404 errors', async () => 
    {
      const error = new HttpError(500, 'Server error');
      mockFetchJson.mockRejectedValueOnce(error);

      const api = createCrudApi<TestEntity, TestFormData>('/api/test');
      
      await expect(api.getById('1')).rejects.toThrow('Server error');
    });

    it('should throw custom message for 404 when configured', async () => 
    {
      const error = new HttpError(404, 'Not found');
      mockFetchJson.mockRejectedValueOnce(error);

      const api = createCrudApi<TestEntity, TestFormData>('/api/test', {
        notFoundMessage: 'TEST_Item not found',
      });

      await expect(api.getById('1')).rejects.toThrow('TEST_Item not found');
    });

    it('should throw original 404 error when no custom message configured', async () => 
    {
      const error = new HttpError(404, 'Not found');
      mockFetchJson.mockRejectedValueOnce(error);

      const api = createCrudApi<TestEntity, TestFormData>('/api/test');

      await expect(api.getById('1')).rejects.toThrow('Not found');
    });
  });

  describe('create', () => 
  {
    it('should create new item', async () => 
    {
      const formData = { name: 'TEST_New Item' };
      const mockResponse = { id: '3', name: 'TEST_New Item' };
      mockFetchJson.mockResolvedValueOnce(mockResponse);

      const api = createCrudApi<TestEntity, TestFormData>('/api/test');
      const result = await api.create(formData);

      expect(result).toEqual(mockResponse);
      expect(mockFetchJson).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    });
  });

  describe('update', () => 
  {
    it('should update existing item', async () => 
    {
      const formData = { name: 'TEST_Updated Item' };
      const mockResponse = { id: '1', name: 'TEST_Updated Item' };
      mockFetchJson.mockResolvedValueOnce(mockResponse);

      const api = createCrudApi<TestEntity, TestFormData>('/api/test');
      const result = await api.update('1', formData);

      expect(result).toEqual(mockResponse);
      expect(mockFetchJson).toHaveBeenCalledWith('/api/test/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    });
  });

  describe('delete', () => 
  {
    it('should delete item by id', async () => 
    {
      mockFetchJson.mockResolvedValueOnce(undefined);

      const api = createCrudApi<TestEntity, TestFormData>('/api/test');
      await api.delete('1');

      expect(mockFetchJson).toHaveBeenCalledWith('/api/test/1', {
        method: 'DELETE',
      });
    });
  });
});
