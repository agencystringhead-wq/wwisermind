import { metadata as homeMeta } from '@/app/layout';
import { metadata as aboutMeta } from '@/app/about/page';
import { metadata as contactMeta } from '@/app/contact/page';
import { metadata as faqMeta } from '@/app/faq/page';
import { metadata as pricingMeta } from '@/app/pricing/page';
import { metadata as processMeta } from '@/app/process/page';
import { metadata as resultsMeta } from '@/app/results/page';
import { metadata as reviewsMeta } from '@/app/reviews/page';
import { metadata as servicesMeta } from '@/app/services/page';
import { freebiePath, freebies, hubMeta, isLive } from '@/lib/freebies';
import { AUDIENCE_SLUGS } from '@/lib/audience-slugs';
import { getAudience } from '@/lib/audiences';
import { carePlansMeta } from '@/lib/pricing/care-plans';
import { customWebsiteMeta } from '@/lib/pricing/custom-website';
import { hyperGrowthMeta } from '@/lib/pricing/hyper-growth';
import { localSeoMeta } from '@/lib/pricing/local-seo';
import { oneTimeSeoMeta } from '@/lib/pricing/one-time-seo';
import { ongoingSeoMeta } from '@/lib/pricing/ongoing-seo';
import { seoAuditMeta } from '@/lib/pricing/seo-audit';
import { websiteDesignMeta } from '@/lib/pricing/website-design';
import { SERVICE_PATHS, routes } from '@/lib/routes';
import { services } from '@/lib/services';
import { absUrl } from '@/lib/site';
import { liveTools } from '@/lib/tools';

/* Static export: this is written to /llms.txt at build time. */
export const dynamic = 'force-static';

/** One plain sentence: a dash in a page's description becomes a comma. */
const plain = (text: string | null | undefined) =>
  (text ?? '').replace(/\s*[—–]\s*/g, ', ').replace(/\s+/g, ' ').trim();

type Entry = { name: string; path: string; description: string | null | undefined };

const line = ({ name, path, description }: Entry) =>
  `- [${name}](${absUrl(path)}): ${plain(description)}`;

/**
 * llms.txt: the site's key pages as a plain list for AI tools, each with its full URL and the
 * description the page gives search engines. Built from the same data as the pages and the
 * sitemap, so it cannot list a page that has moved.
 */
export function GET() {
  const sections: { title: string; entries: Entry[] }[] = [
    {
      title: 'Services',
      entries: [
        { name: 'All services', path: routes.services.hub, description: servicesMeta.description },
        ...services
          .filter((service) => !service.draft)
          .map((service) => ({
            name: service.name,
            path: SERVICE_PATHS[service.slug],
            description: service.seo.description,
          })),
      ],
    },
    {
      title: 'Pricing',
      entries: [
        { name: 'Pricing', path: routes.pricing.hub, description: pricingMeta.description },
        { name: 'Hyper Growth Marketing', path: routes.pricing.hyperGrowth, description: hyperGrowthMeta.description },
        { name: 'One-Week Website', path: routes.pricing.oneWeekWebsite, description: websiteDesignMeta.description },
        { name: 'Custom Website Design', path: routes.pricing.customWebsite, description: customWebsiteMeta.description },
        { name: 'WordPress Care Plans', path: routes.pricing.carePlans, description: carePlansMeta.description },
        { name: 'SEO Audit', path: routes.pricing.seoAudit, description: seoAuditMeta.description },
        { name: 'One-Time SEO', path: routes.pricing.oneTimeSeo, description: oneTimeSeoMeta.description },
        { name: 'Ongoing SEO, AEO & GEO', path: routes.pricing.seo, description: ongoingSeoMeta.description },
        { name: 'Local SEO', path: routes.pricing.localSeo, description: localSeoMeta.description },
      ],
    },
    {
      title: 'Free tools and downloads',
      entries: [
        { name: 'Free Tools', path: routes.freebies.hub, description: hubMeta.description },
        ...freebies.filter(isLive).map((freebie) => ({
          name: freebie.title,
          path: freebiePath(freebie),
          description: freebie.shortDescription,
        })),
      ],
    },
    {
      title: 'Tools',
      /* Every live tool in lib/tools.ts; a hidden one is left out. */
      entries: liveTools.map((tool) => ({
        name: tool.name,
        path: tool.route,
        description: tool.description,
      })),
    },
    {
      title: 'Company',
      entries: [
        { name: 'Home', path: routes.home, description: homeMeta.description },
        { name: 'About', path: routes.about, description: aboutMeta.description },
        { name: 'Our process', path: routes.process, description: processMeta.description },
        { name: 'Results', path: routes.results, description: resultsMeta.description },
        { name: 'Reviews', path: routes.reviews, description: reviewsMeta.description },
        { name: 'FAQ', path: routes.faq, description: faqMeta.description },
        { name: 'Contact', path: routes.contact, description: contactMeta.description },
        ...AUDIENCE_SLUGS.flatMap((slug) => {
          const audience = getAudience(slug);
          return audience
            ? [{ name: audience.name, path: routes.audience(slug), description: audience.seo.description }]
            : [];
        }),
      ],
    },
  ];

  const body = [
    '# wwisermind',
    '',
    '> Websites, search and AI services for therapists and group practices.',
    '',
    ...sections.flatMap((section) => [`## ${section.title}`, '', ...section.entries.map(line), '']),
  ].join('\n');

  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
