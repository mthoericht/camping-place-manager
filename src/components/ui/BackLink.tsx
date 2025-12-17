import Link from 'next/link';

interface BackLinkProps {
  href: string;
  text: string;
}

export function BackLink({ href, text }: BackLinkProps) {
  return (
    <div className="mb-6">
      <Link
        href={href}
        className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4 inline-block"
      >
        ← {text}
      </Link>
    </div>
  );
}

