import { NotFound } from '@/components/ui';

export default function EditCampingItemNotFound() {
  return (
    <NotFound
      icon="🎒"
      title="Camping Item Not Found"
      message="The camping item you're trying to edit doesn't exist or has been removed."
      backLink={{
        href: '/camping-items',
        text: 'Back to Camping Items',
      }}
    />
  );
}
