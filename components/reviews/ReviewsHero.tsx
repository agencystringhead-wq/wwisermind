import ContactHero from '@/components/sections/ContactHero';
import { hasRealUrl, reviewsPage, reviewsSummary } from '@/lib/reviews';
import RatingLockup from './RatingLockup';

/**
 * Frame 1 — the contact page's hero, with the rating lockup between the lead and the
 * buttons. "Read them on Google" is left out until `googleReviewsUrl` is a real address,
 * rather than being linked to nowhere.
 */
export default function ReviewsHero() {
  const { hero } = reviewsPage;
  const copy = {
    eyebrow: hero.eyebrow,
    heading: hero.heading,
    lead: hero.lead,
    primary: hero.primary,
    secondary: hasRealUrl(reviewsSummary.googleReviewsUrl)
      ? { label: hero.google.label, href: reviewsSummary.googleReviewsUrl }
      : undefined,
  };

  return (
    <ContactHero hero={copy} tabs={null} overlap={false}>
      <RatingLockup />
    </ContactHero>
  );
}
