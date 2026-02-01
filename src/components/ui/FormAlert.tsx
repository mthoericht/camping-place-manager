import { ReactNode } from 'react';

interface FormAlertProps
{
  variant: 'info' | 'error' | 'success' | 'warning';
  children: ReactNode;
}

const alertVariants =
{
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  error: 'bg-red-50 text-red-700 border-red-200',
  success: 'bg-green-50 text-green-700 border-green-200',
  warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
};

export function FormAlert({ variant, children }: FormAlertProps)
{
  return (
    <div className={`px-4 py-3 rounded-md border ${alertVariants[variant]}`}>
      {children}
    </div>
  );
}
