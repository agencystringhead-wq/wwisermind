import AboutHero from './AboutHero';
import AboutFounder from './AboutFounder';
import AboutMission from './AboutMission';
import AboutStory from './AboutStory';
import AboutBelief from './AboutBelief';
import AboutTeam from './AboutTeam';
import AboutTestimonials from './AboutTestimonials';

/**
 * The /about page: eight frames, top to bottom.
 *
 * Header, footer, the floating contact bar and the two yellow bars come from the root
 * layout. The footer's own "Ready to move faster?" block closes the page — nothing here
 * repeats it.
 *
 * Grounds alternate: hero (white) → founder (light) → mission (dark grey) → story
 * (light) → belief (dark grey) → team (light) → testimonials (grey). The footer CTA
 * is the closing beat.
 */
export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <AboutFounder />
      <AboutMission />
      <AboutStory />
      <AboutBelief />
      <AboutTeam />
      <AboutTestimonials />
    </>
  );
}
