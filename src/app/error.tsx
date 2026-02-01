'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/ui';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) 
{
  useEffect(() => 
  {
    console.error(error);
  }, [error]);

  return (
    <ErrorState
      title="Something went wrong"
      message="An unexpected error occurred. Please try again."
      reset={reset}
    />
  );
}
