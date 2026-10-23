/* The free tools and downloads, grouped the one way the whole site shows them.

   The Free Tools menu (desktop and mobile) and the /free-tools/ hub both read this list, so a tool
   moves, is renamed or is hidden in one place. A tool comes from lib/tools.ts (and is dropped if its
   status is "hidden"); a download comes from lib/freebies.ts by its slug, with the short name and
   line the menu shows for it. */

import { FREEBIE_PATHS, type FreebieKey, type Route } from '@/lib/routes';
import { getTool, isLiveTool, type ToolId } from '@/lib/tools';

export type FreeToolItem =
  | { kind: 'tool'; id: ToolId }
  | { kind: 'download'; slug: FreebieKey; label: string; desc: string };

export type FreeToolGroup = {
  /** The word before the slash in the group's label, in the accent colour. */
  lead: string;
  title: string;
  items: FreeToolItem[];
};

export const freeToolGroups: FreeToolGroup[] = [
  {
    lead: 'Check',
    title: 'Your Practice',
    items: [
      { kind: 'tool', id: 'website-scorecard' },
      { kind: 'tool', id: 'local-map-assessment' },
    ],
  },
  {
    lead: 'See',
    title: 'Your Market',
    items: [{ kind: 'tool', id: 'therapy-index' }],
  },
  {
    lead: 'Care',
    title: 'Paperwork and Clients',
    items: [
      { kind: 'tool', id: 'good-faith-estimate' },
      { kind: 'tool', id: 'crisis-resources' },
      {
        kind: 'download',
        slug: 'email-signature-for-therapists',
        label: 'Email Signature for Therapists',
        desc: 'Signature generator',
      },
    ],
  },
  {
    lead: 'Download',
    title: 'Guides and Templates',
    items: [
      {
        kind: 'download',
        slug: '2027-full-caseload-plan-for-therapists',
        label: '2027 Full-Caseload Plan',
        desc: 'PDF guide',
      },
      {
        kind: 'download',
        slug: 'psychology-today-profile-kit-for-therapists',
        label: 'Psychology Today Profile Kit',
        desc: 'PDF + templates',
      },
      {
        kind: 'download',
        slug: 'google-business-profile-checklist-for-therapists',
        label: 'Google Business Profile Checklist',
        desc: 'Checklist',
      },
      {
        kind: 'download',
        slug: 'social-media-posts-for-therapists',
        label: '30 Days of Social Media Posts',
        desc: 'Canva templates',
      },
      {
        kind: 'download',
        slug: 'business-card-template-for-therapists',
        label: 'Business Card Template',
        desc: 'Canva template',
      },
    ],
  },
];

/** What the menu shows for an item: label, line and address. Null for a hidden tool. */
export function freeToolLink(item: FreeToolItem): { label: string; desc: string; href: Route } | null {
  if (item.kind === 'download') {
    return { label: item.label, desc: item.desc, href: FREEBIE_PATHS[item.slug] };
  }
  if (!isLiveTool(item.id)) return null;
  const tool = getTool(item.id);
  return { label: tool.name, desc: tool.menuDesc, href: tool.route };
}

/** The group's items that can be shown, as menu links. */
export function freeToolLinks(group: FreeToolGroup) {
  return group.items.flatMap((item) => {
    const link = freeToolLink(item);
    return link ? [link] : [];
  });
}
