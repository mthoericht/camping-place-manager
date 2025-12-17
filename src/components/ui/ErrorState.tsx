import Link from 'next/link';
import { Button } from './Button';

interface ErrorStateProps {
  message?: string;
}

export function ErrorState({ message = 'Unable to connect to the database. Please check your MongoDB connection.' }: ErrorStateProps) {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">⚠️</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Database Connection Error</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      <Link href="/">
        <Button>Go Home</Button>
      </Link>
    </div>
  );
}

