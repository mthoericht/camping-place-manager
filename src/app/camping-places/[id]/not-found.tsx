import { NotFound } from '@/components/ui';

export default function CampingPlaceNotFound() {
  return (
    <NotFound
      icon="🏕️"
      title="Camping Place Not Found"
      message="The camping place you're looking for doesn't exist or has been removed."
      backLink={{
        href: '/camping-places',
        text: 'View All Places',
      }}
      additionalLinks={[
        {
          href: '/',
          text: 'Go Home',
          variant: 'secondary',
        },
      ]}
    />
  );
}
