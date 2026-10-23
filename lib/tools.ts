/* The free tools, in one place.

   The Tools menu and the footer's AI Tools row read each tool's name and route from here, and the
   ToolCallout component (components/tools) reads the whole entry. A page asks for a tool by its id,
   so a route or a line of copy changes once.

   Only live tools belong in this list: a tool that is not live gets no callout anywhere, and the
   AI Visibility Report ("Soon") is left out until it is. Imports routes only, so lib/site.ts can
   read it without a circle. */

import { routes, type Route } from '@/lib/routes';

export type ToolId =
  | 'website-scorecard'
  | 'local-map-assessment'
  | 'therapy-index'
  | 'good-faith-estimate'
  | 'crisis-resources';

export type Tool = {
  id: ToolId;
  /** The name the Tools menu and the footer show. */
  name: string;
  /** The tool's own page. */
  route: Route;
  /** Where a callout's button goes when that is not the tool's front page. */
  ctaRoute?: Route;
  /** The mono label over a callout. A page can override it. */
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  /** A picture for the callout, when a tool has one. Unused so far. */
  image?: { src: string; alt: string; width: number; height: number };
};

export const DEFAULT_TOOL_EYEBROW = 'Free tool';

export const tools: Tool[] = [
  {
    id: 'website-scorecard',
    name: 'Free Website Scorecard',
    route: routes.tools.websiteScorecard,
    eyebrow: 'Free Website Scorecard',
    title: 'How does your website score?',
    description: "Find out what's stopping families from booking. Takes about 2 minutes.",
    ctaLabel: 'Score my website',
  },
  {
    id: 'local-map-assessment',
    name: 'Local Map Assessment',
    route: routes.localMapAssessment,
    eyebrow: DEFAULT_TOOL_EYEBROW,
    title: 'Where do you show up on the map?',
    description: 'See how your practice ranks in Google Maps across your area.',
    ctaLabel: 'Check my map ranking',
  },
  {
    id: 'therapy-index',
    name: 'Therapy Index',
    route: routes.therapyIndex.hub,
    eyebrow: DEFAULT_TOOL_EYEBROW,
    title: "See who's easiest to find in your city.",
    description:
      'Our therapy index ranks practices in Denver, Houston and Austin by how visible they are online.',
    ctaLabel: 'Explore the index',
  },
  {
    id: 'good-faith-estimate',
    name: 'Good Faith Estimate',
    route: routes.tools.goodFaithEstimate,
    eyebrow: DEFAULT_TOOL_EYEBROW,
    title: 'Need a Good Faith Estimate?',
    description: 'Create one for your self-pay clients in a few minutes. Free.',
    ctaLabel: 'Create a GFE',
  },
  {
    id: 'crisis-resources',
    name: 'Crisis Resources by State',
    route: routes.tools.crisisResources,
    ctaRoute: routes.tools.helpNowWidget,
    eyebrow: DEFAULT_TOOL_EYEBROW,
    title: 'Crisis Resources by State',
    description:
      'Free crisis and helpline lists for every US state, plus a help now widget for your own site.',
    ctaLabel: 'Get the widget',
  },
];

const byId = new Map(tools.map((tool) => [tool.id, tool]));

/** A tool by its id. Throws on an id that is not in the list, so a typo stops the build. */
export function getTool(id: ToolId): Tool {
  const tool = byId.get(id);
  if (!tool) throw new Error(`[tools] unknown tool "${id}"`);
  return tool;
}

/** True for a string that names a tool, for data that arrives as text (a blog post's header). */
export const isToolId = (value: string): value is ToolId => byId.has(value as ToolId);
