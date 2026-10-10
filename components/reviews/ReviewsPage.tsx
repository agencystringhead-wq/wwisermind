import { reviews } from '@/lib/reviews';
import section from '@/components/services/Section.module.css';
import styles from './Reviews.module.css';
import ReviewsFeatured from './ReviewsFeatured';
import ReviewsHero from './ReviewsHero';
import ReviewsNumbers from './ReviewsNumbers';
import ReviewsWall from './ReviewsWall';
import ReviewsWorked from './ReviewsWorked';

/**
 * /reviews — header, footer, the floating contact bar and the two yellow bars come from the
 * root layout, and the footer's own "ready to move faster?" block is the closing CTA, as on
 * every other page.
 *
 * Nothing here relies on a minimum number of reviews. The featured review is the one marked
 * `featured` (or the first). The wall is every other review, and when there are none — one
 * review in all — the wall is left out entirely rather than shown empty or repeating the
 * featured one. Grounds alternate white and a soft blue-grey tint over whichever frames
 * exist, so two of one ground never meet, and the frame above the footer's dark CTA is always
 * light. The hero is the only dark frame in the body.
 */
export default function ReviewsPage() {
  const featured = reviews.find((r) => r.featured) ?? reviews[0];
  const wall = reviews.filter((r) => r !== featured);

  const frames: Array<(ground: string) => React.ReactNode> = [];
  if (featured) frames.push((g) => <ReviewsFeatured review={featured} ground={g} key="featured" />);
  if (wall.length > 0) frames.push((g) => <ReviewsWall items={wall} ground={g} key="wall" />);
  frames.push((g) => <ReviewsWorked ground={g} key="worked" />);
  frames.push((g) => <ReviewsNumbers ground={g} key="numbers" />);

  const grounds = [section.light, styles.tint];

  return (
    <>
      <ReviewsHero />
      {frames.map((render, i) => render(grounds[i % 2]))}
    </>
  );
}
