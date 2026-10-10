/* ==========================================================================
   Blog — reads content/blog/*.md at build time.

   A post is one markdown file in this format, exactly as the owner writes them:

     title: …                 a header of `key: value` lines, then a line holding only ---
     takeaways:               a key with no value takes the `- item` lines under it
     - first takeaway
     sources:
     - Label | https://…      a source is `label | url`
     ---
     The body, in a small markdown subset (see `parseBlocks`).

   The reader is strict on purpose. A post missing a required key, or with a malformed
   date, stops the build with the file name rather than publishing half a page. The text is
   never edited: every string is passed through exactly as written. The only thing checked
   in the words themselves is the em dash the owner has ruled out, which is warned about at
   build time, not removed.

   Server-only: it reads the file system, so import it from server components and routes,
   never from a client component.
   ========================================================================== */

import fs from 'node:fs';
import path from 'node:path';

const POSTS_DIR = path.join(process.cwd(), 'content', 'blog');

export type BlogSource = { label: string; url: string };

export type BlogPost = {
  slug: string;
  title: string;
  /** The title shown in the browser tab and to search engines; falls back to `title`. */
  seoTitle: string;
  description: string;
  excerpt: string;
  category: string;
  categorySlug: string;
  tags: string[];
  /** ISO dates, YYYY-MM-DD. */
  publishedAt: string;
  updatedAt: string;
  author: string;
  featured: boolean;
  /** A path under /public, such as /images/blog/<slug>.webp. */
  image: string;
  imageAlt: string;
  /** True while the picture is a stand-in to be replaced. It is data only; nothing is drawn. */
  imagePlaceholder: boolean;
  imageCredit?: string;
  imageCreditUrl?: string;
  takeaways: string[];
  sources: BlogSource[];
  body: Block[];
  /** Whole minutes, from the word count of the body at 220 words a minute. */
  readingMinutes: number;
};

/* --- the body ----------------------------------------------------------------------- */

export type Inline =
  | { type: 'text'; text: string }
  | { type: 'strong'; text: string }
  | { type: 'link'; text: string; href: string };

export type Block =
  | { type: 'h2'; id: string; text: string }
  | { type: 'p'; content: Inline[] }
  | { type: 'ul'; items: Inline[][] }
  | { type: 'ol'; items: Inline[][] }
  | { type: 'note'; title: string; blocks: Block[] };

/** `**bold**` and `[text](url)`: the only inline marks the posts use. */
export function parseInline(source: string): Inline[] {
  const out: Inline[] = [];
  const pattern = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(source))) {
    if (match.index > last) out.push({ type: 'text', text: source.slice(last, match.index) });
    if (match[1] !== undefined) out.push({ type: 'strong', text: match[1] });
    else out.push({ type: 'link', text: match[2], href: match[3] });
    last = match.index + match[0].length;
  }
  if (last < source.length) out.push({ type: 'text', text: source.slice(last) });
  return out;
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * Blocks, in the subset the posts use: `## ` headings, paragraphs, `- ` bullet lists,
 * `1. ` numbered lists, and `:::note Title` … `:::` callouts holding more of the same.
 * Anything else is a paragraph, so an unsupported mark shows as plain text, never vanishes.
 */
export function parseBlocks(lines: string[]): Block[] {
  const blocks: Block[] = [];
  let i = 0;

  const isSpecial = (line: string) =>
    /^## /.test(line) || /^- /.test(line) || /^\d+\. /.test(line) || /^:::/.test(line);

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') {
      i += 1;
      continue;
    }

    if (line.startsWith('## ')) {
      const text = line.slice(3).trim();
      blocks.push({ type: 'h2', id: slugify(text), text });
      i += 1;
      continue;
    }

    if (line.startsWith(':::note')) {
      const title = line.slice(':::note'.length).trim();
      const inner: string[] = [];
      i += 1;
      while (i < lines.length && lines[i].trim() !== ':::') {
        inner.push(lines[i]);
        i += 1;
      }
      i += 1; // the closing :::
      blocks.push({ type: 'note', title, blocks: parseBlocks(inner) });
      continue;
    }

    if (/^- /.test(line)) {
      const items: Inline[][] = [];
      while (i < lines.length && /^- /.test(lines[i])) {
        items.push(parseInline(lines[i].slice(2).trim()));
        i += 1;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    if (/^\d+\. /.test(line)) {
      const items: Inline[][] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(parseInline(lines[i].replace(/^\d+\.\s+/, '').trim()));
        i += 1;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    const para: string[] = [];
    while (i < lines.length && lines[i].trim() !== '' && !isSpecial(lines[i])) {
      para.push(lines[i].trim());
      i += 1;
    }
    blocks.push({ type: 'p', content: parseInline(para.join(' ')) });
  }

  return blocks;
}

/* --- the file ----------------------------------------------------------------------- */

const REQUIRED = [
  'title',
  'description',
  'excerpt',
  'category',
  'publishedAt',
  'updatedAt',
  'author',
  'image',
  'imageAlt',
] as const;

const DATE = /^\d{4}-\d{2}-\d{2}$/;

function parseFile(file: string): BlogPost {
  const slug = file.replace(/\.md$/, '');
  const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8').replace(/\r\n/g, '\n');

  if (raw.includes('—')) {
    console.warn(`[blog] ${file}: contains an em dash. The house rule is none.`);
  }

  const lines = raw.split('\n');
  const divider = lines.findIndex((line) => line.trim() === '---');
  if (divider === -1) throw new Error(`[blog] ${file}: no --- line between the header and the body`);

  const meta: Record<string, string | string[]> = {};
  let listKey: string | null = null;

  for (const line of lines.slice(0, divider)) {
    if (line.trim() === '') continue;
    const item = /^- (.*)$/.exec(line);
    if (item && listKey) {
      (meta[listKey] as string[]).push(item[1].trim());
      continue;
    }
    const pair = /^([A-Za-z][A-Za-z0-9]*):\s*(.*)$/.exec(line);
    if (!pair) throw new Error(`[blog] ${file}: cannot read header line "${line}"`);
    const [, key, value] = pair;
    if (value === '') {
      meta[key] = [];
      listKey = key;
    } else {
      meta[key] = value.trim();
      listKey = null;
    }
  }

  const text = (key: string) => {
    const value = meta[key];
    return typeof value === 'string' ? value : '';
  };
  const list = (key: string) => (Array.isArray(meta[key]) ? (meta[key] as string[]) : []);

  for (const key of REQUIRED) {
    if (!text(key)) throw new Error(`[blog] ${file}: missing "${key}"`);
  }
  for (const key of ['publishedAt', 'updatedAt'] as const) {
    if (!DATE.test(text(key))) throw new Error(`[blog] ${file}: "${key}" must be YYYY-MM-DD`);
  }

  const sources = list('sources').map((entry): BlogSource => {
    const cut = entry.lastIndexOf(' | ');
    if (cut === -1) throw new Error(`[blog] ${file}: source "${entry}" is not "label | url"`);
    return { label: entry.slice(0, cut).trim(), url: entry.slice(cut + 3).trim() };
  });

  const body = parseBlocks(lines.slice(divider + 1));
  const words = lines.slice(divider + 1).join(' ').split(/\s+/).filter(Boolean).length;

  return {
    slug,
    title: text('title'),
    seoTitle: text('seoTitle') || text('title'),
    description: text('description'),
    excerpt: text('excerpt'),
    category: text('category'),
    categorySlug: slugify(text('category')),
    tags: text('tags')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    publishedAt: text('publishedAt'),
    updatedAt: text('updatedAt'),
    author: text('author'),
    featured: text('featured') === 'true',
    image: text('image'),
    imageAlt: text('imageAlt'),
    imagePlaceholder: text('imagePlaceholder') === 'true',
    imageCredit: text('imageCredit') || undefined,
    imageCreditUrl: text('imageCreditUrl') || undefined,
    takeaways: list('takeaways'),
    sources,
    body,
    readingMinutes: Math.max(1, Math.ceil(words / 220)),
  };
}

/* --- the queries --------------------------------------------------------------------- */

let cache: BlogPost[] | null = null;

/** Every post, newest first; posts on the same day fall back to title order. */
export function getAllPosts(): BlogPost[] {
  if (!cache) {
    const files = fs.existsSync(POSTS_DIR)
      ? fs.readdirSync(POSTS_DIR).filter((file) => file.endsWith('.md'))
      : [];
    cache = files
      .map(parseFile)
      .sort((a, b) =>
        a.publishedAt === b.publishedAt
          ? a.title.localeCompare(b.title)
          : b.publishedAt.localeCompare(a.publishedAt),
      );
  }
  return cache;
}

export function getPost(slug: string): BlogPost | undefined {
  return getAllPosts().find((post) => post.slug === slug);
}

export type BlogCategory = { name: string; slug: string; count: number };

/** Categories in the order their newest post appears. */
export function getCategories(): BlogCategory[] {
  const seen = new Map<string, BlogCategory>();
  for (const post of getAllPosts()) {
    const found = seen.get(post.categorySlug);
    if (found) found.count += 1;
    else seen.set(post.categorySlug, { name: post.category, slug: post.categorySlug, count: 1 });
  }
  return [...seen.values()];
}

export function postsInCategory(categorySlug: string): BlogPost[] {
  return getAllPosts().filter((post) => post.categorySlug === categorySlug);
}

/** The post the index leads with: the first one marked featured, else the newest. */
export function getLeadPost(): BlogPost | undefined {
  const posts = getAllPosts();
  return posts.find((post) => post.featured) ?? posts[0];
}

/** Up to `count` other posts: the same category first, then the newest of the rest. */
export function relatedPosts(post: BlogPost, count = 3): BlogPost[] {
  const others = getAllPosts().filter((candidate) => candidate.slug !== post.slug);
  const same = others.filter((candidate) => candidate.categorySlug === post.categorySlug);
  const rest = others.filter((candidate) => candidate.categorySlug !== post.categorySlug);
  return [...same, ...rest].slice(0, count);
}

/** "October 11, 2026", from an ISO date, with no time zone shifting it a day. */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, m - 1, d)));
}
