import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string
  description?: string
  children?: ReactNode
}

export default function PageHeader({ title, description, children }: PageHeaderProps) 
{
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-3xl font-bold">{title}</h2>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}
