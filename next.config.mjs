import { spawnSync } from 'node:child_process';
import { isMainThread } from 'node:worker_threads';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  /* The site is fully static, so it exports to plain HTML for Cloudflare Pages.
     Static export means no image optimizer at runtime — every source image is already
     converted to webp and sized by `npm run images`, so nothing is lost. */
  output: 'export',
  /* Every URL ends in a slash, and the export writes folder/index.html for each page. */
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

/* When `next build` has finished writing out/, inline each page's critical CSS and load its full
   stylesheets without blocking the first paint (scripts/critical). Done as the build process exits
   so it happens whichever command starts the build: Cloudflare runs `npx next build`, not
   `npm run build`. Only the build's own process does it — the workers it starts load this file
   too, and one of those exiting early would race the export. A page whose stylesheets are not the
   ones recorded in scripts/critical/data.json is left as built. */
export default (phase) => {
  if (phase === 'phase-production-build' && isMainThread && !process.send) {
    process.on('exit', (code) => {
      if (code === 0) spawnSync(process.execPath, ['scripts/critical/apply.mjs'], { stdio: 'inherit' });
    });
  }
  return nextConfig;
};
