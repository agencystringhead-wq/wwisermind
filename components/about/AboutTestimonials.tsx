'use client';

import { useState } from 'react';
import Image from 'next/image';
import { testimonials } from '@/lib/services';
import { ArrowLeftIcon, ArrowRightIcon, StarIcon } from '@/components/ui/icons';
import ScrollReveal from '@/components/ui/ScrollReveal';
import styles from './AboutTestimonials.module.css';

/**
 * Section 7 — Testimonials (grey ground).
 *
 * Adapted from ServiceTestimonials with the same carousel mechanics, without
 * needing a service-specific `block` or `ground` prop.
 */

const items = Object.values(testimonials);

export default function AboutTestimonials() {
  const [index, setIndex] = useState(0);
  const current = items[index];
  const many = items.length > 1;

  const step = (by: number) => setIndex((v) => (v + by + items.length) % items.length);

  return (
    <section className={styles.section}>
      <div className={`container ${styles.grid}`}>
        {/* Left — heading */}
        <div>
          <p className={styles.eyebrow}>What therapists say</p>
          <ScrollReveal
            text={"Real results.\nReal words."}
            className={styles.heading}
          />
          <p className={styles.paragraph}>
            We let the outcomes speak. These are the people we&apos;ve worked alongside —
            in their own words.
          </p>
        </div>

        {/* Right — quote */}
        <figure className={styles.quote} aria-live="polite">
          <span
            className={styles.stars}
            role="img"
            aria-label={`${current.rating} out of 5 stars`}
          >
            {Array.from({ length: 5 }, (_, i) => (
              <StarIcon
                key={i}
                className={`${styles.star} ${i < current.rating ? '' : styles.starOff}`}
              />
            ))}
          </span>

          <blockquote className={styles.text}>
            <p>&ldquo;{current.quote}&rdquo;</p>
          </blockquote>

          <div className={styles.foot}>
            <figcaption className={styles.author}>
              <Image
                src={current.photo.src}
                alt=""
                width={44}
                height={44}
                className={styles.photo}
              />
              <span className={styles.name}>{current.name}</span>
              <span className={styles.role}>{current.role}</span>
            </figcaption>

            {many ? (
              <div className={styles.controls}>
                <button
                  type="button"
                  className={styles.control}
                  onClick={() => step(-1)}
                  aria-label="Previous testimonial"
                >
                  <ArrowLeftIcon />
                </button>
                <span className={styles.count}>
                  {index + 1} / {items.length}
                </span>
                <button
                  type="button"
                  className={styles.control}
                  onClick={() => step(1)}
                  aria-label="Next testimonial"
                >
                  <ArrowRightIcon />
                </button>
              </div>
            ) : null}
          </div>
        </figure>
      </div>
    </section>
  );
}
