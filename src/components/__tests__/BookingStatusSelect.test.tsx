import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookingStatusSelect } from '../BookingStatusSelect';
import { bookingsApi } from '@/lib/client/api/bookingsApi';

const mockRefresh = jest.fn();

jest.mock('@/lib/client/api/bookingsApi');
jest.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

describe('BookingStatusSelect', () => 
{
  beforeEach(() => 
  {
    jest.clearAllMocks();
  });

  it('should call bookingsApi.updateStatus and router.refresh on status change', async () => 
  {
    (bookingsApi.updateStatus as jest.Mock).mockResolvedValueOnce({});

    render(
      <BookingStatusSelect
        bookingId="507f1f77bcf86cd799439011"
        currentStatus="PENDING"
      />
    );

    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'PAID');

    await waitFor(() => 
    {
      expect(bookingsApi.updateStatus).toHaveBeenCalledTimes(1);
      expect(bookingsApi.updateStatus).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        'PAID'
      );
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
  });

  it('should show error when updateStatus fails', async () => 
  {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (bookingsApi.updateStatus as jest.Mock).mockRejectedValueOnce(
      new Error('Failed to update status')
    );

    render(
      <BookingStatusSelect
        bookingId="507f1f77bcf86cd799439011"
        currentStatus="PENDING"
      />
    );

    const select = screen.getByRole('combobox');
    await userEvent.selectOptions(select, 'CANCELLED');

    await waitFor(() => 
    {
      expect(screen.getByText('Failed to update status')).toBeInTheDocument();
    });
    expect(mockRefresh).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
