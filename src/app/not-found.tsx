import { NotFound } from '@/components/ui';

export default function GlobalNotFound() 
{
  return (
    <NotFound
      icon="🔍"
      title="Page Not Found"
      message="The page you are looking for does not exist."
      backLink={{
        href: '/',
        text: 'Go Home',
      }}
    />
  );
}
