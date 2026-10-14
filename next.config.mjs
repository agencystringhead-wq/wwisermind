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

export default nextConfig;
