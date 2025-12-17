import { NotFound } from '@/components/ui';

export default function BookingNotFound() {
  return (
    <NotFound
      icon="📅"
      title="Booking Not Found"
      message="The booking you're looking for doesn't exist or has been removed."
      backLink={{
        href: '/bookings',
        text: 'View All Bookings',
      }}
      additionalLinks={[
        {
          href: '/bookings/new',
          text: 'Create New Booking',
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
