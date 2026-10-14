import type { MetadataRoute } from 'next';
import { absUrl } from '@/lib/site';

export const dynamic = 'force-static';

/* The site had no robots file, so every crawler was already allowed everywhere. This keeps
   that exactly as it was and adds the one thing that was missing: where the sitemap is. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: absUrl('/sitemap.xml'),
  };
}
