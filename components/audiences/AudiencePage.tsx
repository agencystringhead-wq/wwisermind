import type { Audience } from '@/lib/audiences';
import Faq from '@/components/sections/Faq';
import AudienceCapabilities from './AudienceCapabilities';
import AudienceClosing from './AudienceClosing';
import AudienceHero from './AudienceHero';
import AudienceLife from './AudienceLife';
import AudienceProcess from './AudienceProcess';
import AudienceProof from './AudienceProof';
import AudienceStory from './AudienceStory';
import AudienceValues from './AudienceValues';
import AudienceVision from './AudienceVision';

/**
 * The one template both /who-we-help pages are. Header, footer, the floating contact bar
 * and the two yellow bars come from the root layout, and the footer's own "ready to move
 * faster?" block is what closes the page — so nothing here repeats it.
 *
 * Ten frames, top to bottom, on the reference's grounds: the hero and the story on
 * white, the proof row on grey, the capabilities on the dark grey, life on white, the
 * vision dark, the values on white, the process dark, then the homepage FAQ with this
 * audience's questions on white, and the closing statement on grey. Every frame is on
 * both pages — the two entries are the same shape — so the order is fixed here rather
 * than worked out per entry.
 */
export default function AudiencePage({ audience }: { audience: Audience }) {
  return (
    <>
      <AudienceHero audience={audience} />
      <AudienceStory audience={audience} />
      <AudienceProof audience={audience} />
      <AudienceCapabilities audience={audience} />
      <AudienceLife audience={audience} />
      <AudienceVision audience={audience} />
      <AudienceValues audience={audience} />
      <AudienceProcess audience={audience} />
      <Faq items={audience.faqs} />
      <AudienceClosing audience={audience} />
    </>
  );
}
