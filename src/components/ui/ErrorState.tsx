import Link from 'next/link';
import { Button } from './Button';

interface ErrorStateProps 
{
  title?: string;
  message?: string;
  icon?: string;
  reset?: () => void;
  homeLink?: boolean;
}

export function ErrorState({ 
  title = 'Something went wrong',
  message = 'An unexpected error occurred.',
  icon = '⚠️',
  reset,
  homeLink = true,
}: ErrorStateProps) 
{
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="flex justify-center gap-4">
        {reset && (
          <Button onClick={reset}>
            Try again
          </Button>
        )}
        {homeLink && (
          <Link href="/">
            <Button variant={reset ? 'secondary' : 'primary'}>Go Home</Button>
          </Link>
        )}
      </div>
    </div>
  );
}

