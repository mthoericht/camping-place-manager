import { ReactNode } from 'react';

interface FormContainerProps {
  title: string;
  children: ReactNode;
}

export function FormContainer({ title, children }: FormContainerProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{title}</h1>
      <div className="bg-white shadow-md rounded-lg p-6">{children}</div>
    </div>
  );
}

