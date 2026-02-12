import { describe, it, expect } from 'vitest'
import { calcBookingTotalPrice } from '@shared/bookingPrice'

describe('calcBookingTotalPrice', () => 
{
  it('returns 0 when pricePerNight <= 0', () => 
  {
    expect(calcBookingTotalPrice('2025-01-01', '2025-01-03', 0)).toBe(0)
    expect(calcBookingTotalPrice('2025-01-01', '2025-01-03', -10)).toBe(0)
  })

  it('returns 0 when startDate is null', () => 
  {
    expect(calcBookingTotalPrice(null, '2025-01-03', 25)).toBe(0)
  })

  it('returns 0 when endDate is null', () => 
  {
    expect(calcBookingTotalPrice('2025-01-01', null, 25)).toBe(0)
  })

  it('returns 0 when end <= start', () => 
  {
    expect(calcBookingTotalPrice('2025-01-05', '2025-01-01', 25)).toBe(0)
    expect(calcBookingTotalPrice('2025-01-01', '2025-01-01', 25)).toBe(0)
  })

  it('calculates 1 night correctly', () => 
  {
    expect(calcBookingTotalPrice('2025-01-01', '2025-01-02', 30)).toBe(30)
  })

  it('calculates multiple nights correctly', () => 
  {
    expect(calcBookingTotalPrice('2025-01-01', '2025-01-04', 25)).toBe(75)
  })

  it('accepts Date objects', () => 
  {
    const start = new Date('2025-01-01')
    const end = new Date('2025-01-03')
    expect(calcBookingTotalPrice(start, end, 20)).toBe(40)
  })

  it('rounds up partial days to full nights', () => 
  {
    expect(calcBookingTotalPrice('2025-01-01T10:00:00', '2025-01-02T08:00:00', 50)).toBe(50)
  })
})
