import Link from 'next/link';
import type { ComponentProps } from 'react';
import BookCallButton from './BookCallButton';
import { isBookingHref } from './cal';

/**
 * A link that is a booking button when its href is the booking target, and a plain link
 * otherwise. CTAs come from data, so a page asks for `href: routes.contactBook` and gets
 * the popup without a per-page edit.
 */
export default function CtaLink({ href, prefetch, replace, scroll, ...rest }: ComponentProps<typeof Link>) {
  if (typeof href === 'string' && isBookingHref(href)) {
    return <BookCallButton {...rest} />;
  }
  return <Link href={href} prefetch={prefetch} replace={replace} scroll={scroll} {...rest} />;
}
