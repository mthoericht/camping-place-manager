import { fetchJson, HttpError } from '../http';

describe('http utilities', () => 
{
  beforeEach(() => 
  {
    jest.resetAllMocks();
  });

  describe('HttpError', () => 
  {
    it('should create error with status and message', () => 
    {
      const error = new HttpError(404, 'Not found');
      
      expect(error.status).toBe(404);
      expect(error.message).toBe('Not found');
      expect(error.name).toBe('HttpError');
      expect(error.payload).toBeUndefined();
    });

    it('should include payload when provided', () => 
    {
      const payload = { details: 'TEST_additional info' };
      const error = new HttpError(400, 'Bad request', payload);
      
      expect(error.payload).toEqual(payload);
    });
  });

  describe('fetchJson', () => 
  {
    it('should return parsed JSON on success', async () => 
    {
      const mockData = { id: '1', name: 'TEST_Item' };
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockData),
      });

      const result = await fetchJson('/api/test');
      
      expect(result).toEqual(mockData);
      expect(fetch).toHaveBeenCalledWith('/api/test', undefined);
    });

    it('should return undefined for 204 No Content', async () => 
    {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 204,
      });

      const result = await fetchJson('/api/test');
      
      expect(result).toBeUndefined();
    });

    it('should pass request options to fetch', async () => 
    {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });

      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'TEST_data' }),
      };

      await fetchJson('/api/test', options);
      
      expect(fetch).toHaveBeenCalledWith('/api/test', options);
    });

    it('should throw HttpError with API error message', async () => 
    {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: 'TEST_Validation failed' }),
      });

      await expect(fetchJson('/api/test')).rejects.toThrow('TEST_Validation failed');
      await expect(fetchJson('/api/test')).rejects.toBeInstanceOf(HttpError);
    });

    it('should throw HttpError with default message when no API error', async () => 
    {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.reject(new Error('Invalid JSON')),
        text: () => Promise.resolve(''),
      });

      await expect(fetchJson('/api/test')).rejects.toThrow('Request failed (500)');
    });

    it('should use text response as error message when JSON fails', async () => 
    {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json: () => Promise.reject(new Error('Invalid JSON')),
        text: () => Promise.resolve('Service unavailable'),
      });

      await expect(fetchJson('/api/test')).rejects.toThrow('Service unavailable');
    });
  });
});
