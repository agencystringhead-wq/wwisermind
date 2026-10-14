import { BreadcrumbJsonLd } from '@/components/ui/Breadcrumbs';
import { routes } from '@/lib/routes';
import type { Metadata } from 'next';
import ReviewsPage from '@/components/reviews/ReviewsPage';
import { reviewsPage } from '@/lib/reviews';
import { siteConfig, absUrl } from '@/lib/site';

/* No Review or AggregateRating JSON-LD on purpose: Google does not show self-hosted reviews
   for a business's own site, and markup that disagrees with the Google profile is a risk. */
export const metadata: Metadata = {
  title: reviewsPage.meta.title,
  description: reviewsPage.meta.description,
  alternates: { canonical: absUrl(routes.reviews) },
};

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { label: 'Home', href: routes.home },
          { label: 'Reviews', href: routes.reviews },
        ]}
      />
      <ReviewsPage />
    </>
  );
}
