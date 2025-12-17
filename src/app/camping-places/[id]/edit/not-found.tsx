import { NotFound } from '@/components/ui';

export default function EditCampingPlaceNotFound() {
  return (
    <NotFound
      icon="✏️"
      title="Camping Place Not Found"
      message="The camping place you're trying to edit doesn't exist or has been removed."
      backLink={{
        href: '/camping-places',
        text: 'View All Places',
      }}
      additionalLinks={[
        {
          href: '/camping-places/new',
          text: 'Create New Place',
          variant: 'success',
        },
        {
          href: '/',
          text: 'Go Home',
          variant: 'secondary',
        },
      ]}
    />
  );
}
