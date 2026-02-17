import { describe, it, expect } from 'vitest';
import { toDateInputValue } from '@/lib/dateUtils';

describe('toDateInputValue', () => 
{
  it('returns empty string for null', () => 
  {
    expect(toDateInputValue(null)).toBe('');
  });

  it('returns empty string for undefined', () => 
  {
    expect(toDateInputValue(undefined)).toBe('');
  });

  it('returns empty string for invalid date string', () => 
  {
    expect(toDateInputValue('not-a-date')).toBe('');
  });

  it('formats valid date as YYYY-MM-DD', () => 
  {
    expect(toDateInputValue('2025-02-11')).toBe('2025-02-11');
  });

  it('formats ISO datetime as date only', () => 
  {
    expect(toDateInputValue('2025-02-11T14:30:00.000Z')).toBe('2025-02-11');
  });

  it('pads month and day with leading zero', () => 
  {
    expect(toDateInputValue('2025-01-05')).toBe('2025-01-05');
  });
});
