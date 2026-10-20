---
name: blog-post-format-and-migration
description: How wwisermind blog posts are stored and rendered, and how to migrate externally written markdown posts into that format.
metadata:
  type: project
---

Posts are `content/blog/<slug>.md`, read by `lib/blog.ts` at build time. The format is NOT standard YAML frontmatter: `key: value` header lines (no opening `---`), then one `---` line, then the body. Required keys: title, description, excerpt, category, publishedAt, updatedAt, author, image, imageAlt. Optional: seoTitle, tags, takeaways, sources, featured. The slug is the filename. The page prints the title as H1, so strip any `# ` H1 from the body.

Body subset the parser supports: `##`/`###` headings, paragraphs, `-` lists, `- [ ]` checklists, `1.` lists, `>` quotes, `![alt](/path)` images, `*italic*`, `**bold**`, links, `:::note` callouts. A closing `## Frequently asked questions` section (with `###` questions) is split out, rendered as closed `<details>` rows and written as FAQPage JSON-LD. Every post already gets BlogPosting (Article subtype) and BreadcrumbList JSON-LD.

Migrating an incoming post (YAML frontmatter with slug/date, primary_keyword ignored): map date to publishedAt and updatedAt, set description and excerpt (excerpt falls back to the description), pick a category from the existing four (AI and your practice, Running your practice, Search and trust, Website platforms), supply image and imageAlt, rewrite `https://wwisermind.com/...` links to relative, and put consecutive bold label lines in separate paragraphs because the parser joins adjacent lines. Feature images need to be landscape (hero is 16:9); the portrait files in public/images don't fit. Blog index, categories, sitemap and RSS update automatically from the files.

**Why:** three posts were migrated this way (commit f64a512) and the first attempt would have failed on the header format.
**How to apply:** convert to this format rather than changing the parser; verify with the built HTML (one H1, internal hrefs exist in out/, external links target=_blank rel=noopener). Don't leave a local server running in out/ or `next build` fails with EBUSY; see [[booking-links-use-ctalink]] for the same built-HTML audit approach.
