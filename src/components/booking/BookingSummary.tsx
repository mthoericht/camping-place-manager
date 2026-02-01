'use client';

interface BookingSummaryProps
{
  placeName: string;
  pricePerNight: number;
  nights: number;
  totalPrice: number;
}

export function BookingSummary({
  placeName,
  pricePerNight,
  nights,
  totalPrice,
}: BookingSummaryProps)
{
  return (
    <div className="bg-blue-50 p-4 rounded-md">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Booking Summary</h3>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Place:</span>
          <span>{placeName}</span>
        </div>
        <div className="flex justify-between">
          <span>Price per night (€):</span>
          <span>{pricePerNight} €</span>
        </div>
        <div className="flex justify-between">
          <span>Number of nights:</span>
          <span>{nights}</span>
        </div>
        <div className="flex justify-between font-semibold text-lg">
          <span>Total price:</span>
          <span>{totalPrice.toFixed(2)} €</span>
        </div>
      </div>
    </div>
  );
}
