import Link from 'next/link';
import { Button } from './Button';

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
  actionLink?: {
    href: string;
    text: string;
  };
}

export function EmptyState({ icon, title, message, actionLink }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      {actionLink && (
        <Link href={actionLink.href}>
          <Button>{actionLink.text}</Button>
        </Link>
      )}
    </div>
  );
}

