export function calcBookingTotalPrice(
  startDate: Date | string | null,
  endDate: Date | string | null,
  pricePerNight: number
): number
{
  if (pricePerNight <= 0) return 0
  const start = startDate ? new Date(startDate) : null
  const end = endDate ? new Date(endDate) : null
  if (!start || !end || end <= start) return 0
  const nights = Math.ceil((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
  return nights * pricePerNight
}
