import Link from 'next/link';
import { ReactNode } from 'react';
import { Button } from './Button';

interface PageHeaderProps {
  title: string;
  actionLink?: {
    href: string;
    text: string;
  };
}

export function PageHeader({ title, actionLink }: PageHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      {actionLink && (
        <Link href={actionLink.href}>
          <Button>{actionLink.text}</Button>
        </Link>
      )}
    </div>
  );
}

