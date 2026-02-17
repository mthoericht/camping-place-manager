import type { ReactNode } from 'react';
import { mergeClasses } from '@/lib/utils';

interface EmptyStateProps {
  icon: ReactNode
  message: string
  className?: string
}

export default function EmptyState({ icon, message, className }: EmptyStateProps) 
{
  return (
    <div
      className={mergeClasses(
        'flex flex-col items-center justify-center py-12 text-muted-foreground',
        className
      )}
    >
      <div className="mb-4 [&>svg]:h-12 [&>svg]:w-12">{icon}</div>
      <p>{message}</p>
    </div>
  );
}
