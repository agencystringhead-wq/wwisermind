import type { Metadata } from 'next';
import ReviewsPage from '@/components/reviews/ReviewsPage';
import { reviewsPage } from '@/lib/reviews';
import { siteConfig } from '@/lib/site';

/* No Review or AggregateRating JSON-LD on purpose: Google does not show self-hosted reviews
   for a business's own site, and markup that disagrees with the Google profile is a risk. */
export const metadata: Metadata = {
  title: reviewsPage.meta.title,
  description: reviewsPage.meta.description,
  alternates: { canonical: `${siteConfig.url}/reviews` },
};

export default function Page() {
  return <ReviewsPage />;
}
