import { DateUtil } from '../DateUtil';

describe('DateUtil', () => 
{
  describe('formatDate', () => 
  {
    it('should format a valid date string correctly', () => 
    {
      const date = '2024-01-15T10:30:00Z';
      const formatted = DateUtil.formatDate(date);
      expect(formatted).toBe('15.1.2024');
    });

    it('should format a date with different month correctly', () => 
    {
      const date = '2024-12-25T00:00:00Z';
      const formatted = DateUtil.formatDate(date);
      expect(formatted).toBe('25.12.2024');
    });

    it('should format a date with single digit day and month correctly', () => 
    {
      const date = '2024-03-05T00:00:00Z';
      const formatted = DateUtil.formatDate(date);
      expect(formatted).toBe('5.3.2024');
    });

    it('should handle ISO date strings', () => 
    {
      const date = '2023-06-20T14:45:30.000Z';
      const formatted = DateUtil.formatDate(date);
      expect(formatted).toBe('20.6.2023');
    });

    it('should handle dates at year boundaries', () => 
    {
      const date = '2024-01-01T00:00:00Z';
      const formatted = DateUtil.formatDate(date);
      expect(formatted).toBe('1.1.2024');
    });
  });
});
