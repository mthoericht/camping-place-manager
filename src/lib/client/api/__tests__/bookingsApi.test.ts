jest.mock('../http', () => ({
  fetchJson: jest.fn(),
}));

import { bookingsApi } from '../bookingsApi';
import { fetchJson } from '../http';

const mockFetchJson = fetchJson as jest.MockedFunction<typeof fetchJson>;

describe('bookingsApi', () => 
{
  beforeEach(() => 
  {
    jest.clearAllMocks();
  });

  describe('updateStatus', () => 
  {
    it('should call PUT /api/bookings/:id with status and return booking', async () => 
    {
      const mockBooking = {
        id: '507f1f77bcf86cd799439011',
        status: 'PAID',
        customerName: 'John Doe',
      };
      mockFetchJson.mockResolvedValueOnce(mockBooking);

      const result = await bookingsApi.updateStatus('507f1f77bcf86cd799439011', 'PAID');

      expect(result).toEqual(mockBooking);
      expect(mockFetchJson).toHaveBeenCalledTimes(1);
      expect(mockFetchJson).toHaveBeenCalledWith('/api/bookings/507f1f77bcf86cd799439011', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PAID' }),
      });
    });

    it('should throw when fetchJson fails', async () => 
    {
      const error = new Error('Booking not found');
      mockFetchJson.mockRejectedValueOnce(error);

      await expect(
        bookingsApi.updateStatus('507f1f77bcf86cd799439011', 'CONFIRMED')
      ).rejects.toThrow('Booking not found');
      expect(mockFetchJson).toHaveBeenCalledWith(
        '/api/bookings/507f1f77bcf86cd799439011',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ status: 'CONFIRMED' }),
        })
      );
    });
  });
});
