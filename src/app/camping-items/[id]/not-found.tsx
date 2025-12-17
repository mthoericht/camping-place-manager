import { NotFound } from '@/components/ui';

export default function CampingItemNotFound() {
  return (
    <NotFound
      icon="🎒"
      title="Camping Item Not Found"
      message="The camping item you're looking for doesn't exist or has been removed."
      backLink={{
        href: '/camping-items',
        text: 'Back to Camping Items',
      }}
    />
  );
}
