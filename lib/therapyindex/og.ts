import { absUrl } from '@/lib/site';

/* Share images for every Therapy Index page: 1200 x 630 JPEGs in public/images/therapyindex/og/, built by
   scripts/therapyindex/build-og.mjs from the generated background images and the page's title. The hub, methodology page
   and each city have their own; every practice profile shares one template. */

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export type OgName = 'hub' | 'methodology' | 'profile' | `city-${string}`;

export const ogUrl = (name: OgName) => absUrl(`/images/therapyindex/og/${name}.jpg`);

export const ogImages = (name: OgName, alt: string) => [{ url: ogUrl(name), width: OG_WIDTH, height: OG_HEIGHT, alt }];
