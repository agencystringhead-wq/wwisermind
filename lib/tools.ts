/* The free tools, in one place.

   The Tools menu and the footer's AI Tools row read each tool's name and route from here, and the
   ToolCallout component (components/tools) reads the whole entry. A page asks for a tool by its id,
   so a route or a line of copy changes once.

   Only live tools belong in this list: a tool that is not live gets no callout anywhere, and the
   AI Visibility Report ("Soon") is left out until it is. Imports routes only, so lib/site.ts can
   read it without a circle. */

import { routes, type Route } from '@/lib/routes';

/** A tool that is not finished is "hidden": it keeps its entry (and any page it has) but appears
    nowhere: not in the menus, the footer, a callout, the 404 grid, the hub or a sitemap. */
export type ToolStatus = 'live' | 'hidden';

export type ToolId =
  | 'website-scorecard'
  | 'local-map-assessment'
  | 'therapy-index'
  | 'good-faith-estimate'
  | 'crisis-resources'
  | 'marketing-assessment'
  | 'ai-visibility-report';

/** Which drawing a callout shows for the tool (components/tools/ToolPreviews.tsx). */
export type ToolPreviewKind = 'dial' | 'map' | 'document' | 'ranking' | 'phone';

export type Tool = {
  id: ToolId;
  status: ToolStatus;
  /** The line under the name in the Free Tools menu. */
  menuDesc: string;
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
  /** The quiet text link under a service page's hero button, when that page points here. */
  heroLink?: string;
  /** The decorative drawing on the callout: inline SVG, no image file. */
  preview: ToolPreviewKind;
  /** A photo for the callout, when a tool has one. Unused so far. */
  image?: { src: string; alt: string; width: number; height: number };
};

export const DEFAULT_TOOL_EYEBROW = 'Free tool';

export const tools: Tool[] = [
  {
    id: 'website-scorecard',
    status: 'live',
    menuDesc: 'Your score in 2 minutes',
    preview: 'dial',
    heroLink: 'Not sure yet? Get your free website score',
    name: 'Website Scorecard',
    route: routes.tools.websiteScorecard,
    eyebrow: 'Website Scorecard',
    title: 'How does your website score?',
    description: "Find out what's stopping families from booking. Takes about 2 minutes.",
    ctaLabel: 'Score my website',
  },
  {
    id: 'local-map-assessment',
    status: 'live',
    menuDesc: 'Your Google Maps presence',
    preview: 'map',
    heroLink: 'Not sure yet? Check your map ranking free',
    name: 'Local Map Assessment',
    route: routes.localMapAssessment,
    eyebrow: DEFAULT_TOOL_EYEBROW,
    title: 'Where do you show up on the map?',
    description: 'See how your practice ranks in Google Maps across your area.',
    ctaLabel: 'Check my map ranking',
  },
  {
    id: 'therapy-index',
    status: 'live',
    menuDesc: 'Who patients find in Houston, Austin and Denver',
    preview: 'ranking',
    heroLink: 'Not sure yet? See how practices rank in your city',
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
    status: 'live',
    menuDesc: 'Free PDF for self-pay clients',
    preview: 'document',
    name: 'Good Faith Estimate',
    route: routes.tools.goodFaithEstimate,
    eyebrow: DEFAULT_TOOL_EYEBROW,
    title: 'Need a Good Faith Estimate?',
    description: 'Create one for your self-pay clients in a few minutes. Free.',
    ctaLabel: 'Create a GFE',
  },
  {
    id: 'crisis-resources',
    status: 'live',
    menuDesc: 'Helpline directory for every state',
    preview: 'phone',
    name: 'Crisis Resources by State',
    route: routes.tools.crisisResources,
    ctaRoute: routes.tools.helpNowWidget,
    eyebrow: DEFAULT_TOOL_EYEBROW,
    title: 'Crisis Resources by State',
    description:
      'Free crisis and helpline lists for every US state, plus a help now widget for your own site.',
    ctaLabel: 'Get the widget',
  },
  /* Not finished: kept here so the code and the page stay, shown nowhere. Marketing Assessment has no
     page yet (only a home-page anchor); the AI Visibility Report has a "not ready" page that is
     noindex and out of the sitemaps. Flip `status` to 'live' on the day each launches. */
  {
    id: 'marketing-assessment',
    status: 'hidden',
    menuDesc: 'Where you stand today',
    preview: 'dial',
    name: 'Marketing Assessment',
    route: routes.homeSection('marketing-assessment'),
    eyebrow: DEFAULT_TOOL_EYEBROW,
    title: 'Where does your marketing stand?',
    description: 'A quick read on where your practice stands today.',
    ctaLabel: 'Start the assessment',
  },
  {
    id: 'ai-visibility-report',
    status: 'hidden',
    menuDesc: 'Does ChatGPT know you exist?',
    preview: 'ranking',
    name: 'AI Visibility Report',
    route: routes.tools.aiVisibilityReport,
    eyebrow: DEFAULT_TOOL_EYEBROW,
    title: 'Does AI recommend your practice?',
    description: 'See whether ChatGPT, Gemini and Google AI Overviews mention you.',
    ctaLabel: 'Get the report',
  },
];

const byId = new Map(tools.map((tool) => [tool.id, tool]));

/** The tools that are live, in order: the only ones a menu, callout, grid, hub or sitemap may show. */
export const liveTools: Tool[] = tools.filter((tool) => tool.status === 'live');

/** True when this tool is live. A hidden tool is never shown. */
export const isLiveTool = (id: ToolId): boolean => byId.get(id)?.status === 'live';

/** A tool by its id. Throws on an id that is not in the list, so a typo stops the build. */
export function getTool(id: ToolId): Tool {
  const tool = byId.get(id);
  if (!tool) throw new Error(`[tools] unknown tool "${id}"`);
  return tool;
}

/** True for a string that names a live tool, for data that arrives as text (a blog post's header). */
export const isToolId = (value: string): value is ToolId => isLiveTool(value as ToolId);
