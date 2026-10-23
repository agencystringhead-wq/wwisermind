import { routes } from '@/lib/routes';
import { BreadcrumbJsonLd } from '@/components/ui/Breadcrumbs';
import type { Metadata } from 'next';
import ContactBooking from '@/components/sections/ContactBooking';
import ContactConnect from '@/components/sections/ContactConnect';
import ContactForm from '@/components/sections/ContactForm';
import ContactGallery from '@/components/sections/ContactGallery';
import ContactHero from '@/components/sections/ContactHero';
import ContactLogos from '@/components/sections/ContactLogos';
import ToolCallout from '@/components/tools/ToolCallout';
import ContactStudio from '@/components/sections/ContactStudio';
import { absUrl, contactPage } from '@/lib/site';

export const metadata: Metadata = {
  title: contactPage.meta.title,
  description: contactPage.meta.description,
  alternates: { canonical: absUrl(routes.contact) },
};

/* Header, footer, the floating contact bar and the two yellow rules all come from the root
   layout, so this page is only its seven frames: the dark hero with the mosaic over its
   foot, then scroller, cards and calendar on white — a hairline at the top of each of the
   last two doing the separating — the form on the light grey, and the studio on white. */
export default function ContactPage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { label: 'Home', href: routes.home },
          { label: 'Contact', href: routes.contact },
        ]}
      />
      <ContactHero />
      <ContactGallery />
      <ContactLogos />
      <ContactConnect />
      <ContactBooking />
      <ContactForm />
      <ToolCallout
        variant="compact"
        toolIds={['website-scorecard', 'local-map-assessment']}
        heading="Not ready to talk yet?"
        placement="contact-pair"
      />
      <ContactStudio />
    </>
  );
}
