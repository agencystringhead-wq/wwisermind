/* ==========================================================================
   /results/: the client showcase banners.

   One entry per project, shown as a full-width lifestyle photograph (the site on a laptop, an
   iPad and a phone together) with its name, a line about the practice and a link to the live
   site. The page maps over this list in this order, so adding a project is adding an entry here
   and its two images under public/images.

   Each project has two pictures made from the same shot: `desktop` (2000px wide) and `mobile`
   (1000px wide, used below 768px). Both are 16:9 on the page and under 150 KB.

   Nothing here is a statistic. No em dashes or en dashes.
   ========================================================================== */

export type ShowcaseProject = {
  slug: string;
  name: string;
  /** The one line under the name: who the practice sees, and where. */
  description: string;
  /** The live site. The banner and the "Visit site" link both open it in a new tab. */
  url: string;
  /** What the small tag row under the description reads. */
  devices: string[];
  /** The sentence behind the tag row, for assistive technology. */
  note: string;
  image: {
    desktop: string;
    mobile: string;
    /** The width and height of the desktop file, so the box is the right shape before it loads. */
    width: number;
    height: number;
  };
};

export const showcaseProjects: ShowcaseProject[] = [
  {
    slug: 'evolve-therapy',
    name: 'Evolve Therapy & Yoga',
    description: 'Children and teen therapy, Tinley Park, IL',
    url: 'https://evolvetherapy.pages.dev/',
    devices: ['Desktop', 'Tablet', 'Mobile'],
    note: 'Responsive on desktop, tablet and mobile',
    image: {
      desktop: '/images/wwisermind-results-evolve-therapy.webp',
      mobile: '/images/wwisermind-results-evolve-therapy-mobile.webp',
      width: 2000,
      height: 1131,
    },
  },
  {
    slug: 'timely-therapy',
    name: 'Timely Therapy',
    description: 'Anxiety and depression therapy, Seattle, WA',
    url: 'https://www.timelytherapy.com/',
    devices: ['Desktop', 'Tablet', 'Mobile'],
    note: 'Responsive on desktop, tablet and mobile',
    image: {
      desktop: '/images/wwisermind-results-timely-therapy.webp',
      mobile: '/images/wwisermind-results-timely-therapy-mobile.webp',
      width: 2000,
      height: 1131,
    },
  },
];
