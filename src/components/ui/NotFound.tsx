import Link from 'next/link';

interface NotFoundProps {
  icon: string;
  title: string;
  message: string;
  backLink: {
    href: string;
    text: string;
  };
  additionalLinks?: Array<{
    href: string;
    text: string;
    variant?: 'primary' | 'secondary' | 'success';
  }>;
}

export default function NotFound({ icon, title, message, backLink, additionalLinks }: NotFoundProps) {
  const buttonVariants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    success: 'bg-green-600 text-white hover:bg-green-700',
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-4xl mx-auto text-center">
        <div className="text-6xl mb-4">{icon}</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-gray-600 mb-8">{message}</p>
        <div className={additionalLinks ? 'space-x-4' : ''}>
          <Link
            href={backLink.href}
            className={`${buttonVariants.primary} px-6 py-3 rounded-md transition-colors inline-block`}
          >
            {backLink.text}
          </Link>
          {additionalLinks?.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className={`${buttonVariants[link.variant || 'secondary']} px-6 py-3 rounded-md transition-colors inline-block`}
            >
              {link.text}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

