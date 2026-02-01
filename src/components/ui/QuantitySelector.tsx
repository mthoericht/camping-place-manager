import { Button } from './Button';

interface QuantitySelectorProps
{
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  disableIncrease?: boolean;
  disableDecrease?: boolean;
}

export function QuantitySelector({
  value,
  onChange,
  min = 0,
  max,
  disabled = false,
  disableIncrease = false,
  disableDecrease = false,
}: QuantitySelectorProps)
{
  const handleDecrease = () =>
  {
    if (value > min)
    {
      onChange(value - 1);
    }
  };

  const handleIncrease = () =>
  {
    if (max === undefined || value < max)
    {
      onChange(value + 1);
    }
  };

  const isDecreaseDisabled = disabled || disableDecrease || value <= min;
  const isIncreaseDisabled = disabled || disableIncrease || (max !== undefined && value >= max);

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="secondary"
        onClick={handleDecrease}
        disabled={isDecreaseDisabled}
        aria-label="Decrease quantity"
        className="px-3 py-1"
      >
        −
      </Button>
      <span className="w-8 text-center font-medium" aria-live="polite">
        {value}
      </span>
      <Button
        type="button"
        variant="secondary"
        onClick={handleIncrease}
        disabled={isIncreaseDisabled}
        aria-label="Increase quantity"
        className="px-3 py-1"
      >
        +
      </Button>
    </div>
  );
}
