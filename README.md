# Wisermind

Marketing site for Wisermind, built frame by frame from the supplied design screenshots.

- **Stack:** Next.js 15 (App Router) · React 19 · TypeScript · CSS Modules
- **Container:** 1300px site-wide (`--container-width`, `.container`)
- **Type:** Inter — body 15px/400, headings 700 (see `app/globals.css`)
- **Images:** sources live in `images/`, `npm run images` converts them to WebP in
  `public/images/`. Components only ever reference `.webp`.

See [PROJECT-MEMORY.md](PROJECT-MEMORY.md) for the design measurements, tokens and a
per-frame build log.

## Commands

```bash
npm install
npm run dev      # http://localhost:3000
npm run images   # images/*.{png,jpg} -> public/images/*.webp
npm run build    # static export to out/
```

## Deploying

The site is fully static (`output: 'export'` in `next.config.mjs`).

| Cloudflare Pages setting | Value |
| --- | --- |
| Framework preset | Next.js (Static HTML Export) |
| Build command | `npm run build` |
| Build output directory | `out` |
| Node version | 20 or newer |

Don't run `npm run build` while `npm run dev` is running — they share `.next` and the dev
server starts throwing module-not-found errors. Stop dev, `rm -rf .next`, then build.
