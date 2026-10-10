import AboutHero from './AboutHero';
import AboutFounder from './AboutFounder';
import AboutMission from './AboutMission';
import AboutStory from './AboutStory';
import AboutBelief from './AboutBelief';
import AboutTeam from './AboutTeam';
import AboutTestimonials from './AboutTestimonials';
import AboutCta from './AboutCta';

/**
 * /about — eight sections matching the About-Page-Design reference.
 * Header, footer, contact bar and yellow bars come from the root layout.
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
      <AboutCta />
    </>
  );
}
