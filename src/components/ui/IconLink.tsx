import Link from 'next/link';
import { EyeIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

interface ViewIconLinkProps 
{
  href: string;
  ariaLabel: string;
  className?: string;
  size?: number;
  showText?: boolean;
}

interface EditIconLinkProps 
{
  href: string;
  ariaLabel: string;
  className?: string;
  size?: number;
  showText?: boolean;
}

interface ButtonLinkProps 
{
  href: string;
  children: React.ReactNode;
  className?: string;
}

interface EditButtonLinkProps extends ButtonLinkProps 
{
  compact?: boolean;
}

const viewDefaultClass = 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300';
const editDefaultClass = 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300';

export function ViewIconLink({ href, ariaLabel, className = '', size = 18, showText = false }: ViewIconLinkProps) 
{
  const text = showText ? 'View Details' : null;
  const iconClass = size === 16 ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center gap-1.5 p-1.5 rounded-md transition-colors ${viewDefaultClass} ${className}`}
    >
      <EyeIcon className={`${iconClass} shrink-0`} aria-hidden />
      {text && <span className="text-sm font-medium">{text}</span>}
    </Link>
  );
}

export function EditIconLink({ href, ariaLabel, className = '', size = 18, showText = false }: EditIconLinkProps) 
{
  const text = showText ? 'Edit' : null;
  const iconClass = size === 16 ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={`inline-flex items-center justify-center gap-1.5 p-1.5 rounded-md transition-colors ${editDefaultClass} ${className}`}
    >
      <PencilSquareIcon className={`${iconClass} shrink-0`} aria-hidden />
      {text && <span className="text-sm font-medium">{text}</span>}
    </Link>
  );
}

/** Full-width button style for detail pages (Edit Place, View Bookings, etc.) */
export function ViewButtonLink({ href, children, className = '' }: ButtonLinkProps) 
{
  return (
    <Link
      href={href}
      className={`flex items-center justify-center gap-2 w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 transition-colors text-center ${className}`}
    >
      <EyeIcon className="w-5 h-5 shrink-0" aria-hidden />
      {children}
    </Link>
  );
}

export function EditButtonLink({ href, children, className = '', compact }: EditButtonLinkProps) 
{
  const widthClass = compact ? 'w-auto' : 'w-full';
  return (
    <Link
      href={href}
      className={`flex items-center justify-center gap-2 ${widthClass} bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors text-center ${className}`}
    >
      <PencilSquareIcon className="w-5 h-5 shrink-0" aria-hidden />
      {children}
    </Link>
  );
}

/** Inline link with view icon + text (e.g. "View all X bookings") */
export function ViewTextLink({ href, children, className = '' }: ButtonLinkProps) 
{
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium ${className}`}
    >
      <EyeIcon className="w-4 h-4 shrink-0" aria-hidden />
      {children}
    </Link>
  );
}
