import ContactHero from '@/components/sections/ContactHero';
import Faq from '@/components/sections/Faq';
import { processPage } from '@/lib/process';
import ProcessComms from './ProcessComms';
import ProcessIntro from './ProcessIntro';
import ProcessNeeds from './ProcessNeeds';
import ProcessSteps from './ProcessSteps';
import ProcessTimeline from './ProcessTimeline';

/**
 * /process — eight frames. Header, footer, the floating contact bar and the two yellow bars
 * come from the root layout, and the footer's own "ready to move faster?" block is the
 * closing CTA, as on every other page.
 *
 * Grounds, down the page: dark hero · white · pale blue · grey · white · pale blue · white,
 * then the footer's dark CTA. The hero is the only dark frame in the body, and the frame
 * above the footer is white, so no two dark frames ever meet.
 */
export default function ProcessPage() {
  return (
    <>
      <ContactHero hero={processPage.hero} tabs={null} overlap={false} />
      <ProcessIntro />
      <ProcessSteps />
      <ProcessTimeline />
      <ProcessNeeds />
      <ProcessComms />
      <Faq items={processPage.faq} />
    </>
  );
}
