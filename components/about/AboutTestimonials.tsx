'use client';

import { useState } from 'react';
import Image from 'next/image';
import { testimonials } from '@/lib/services';
import { ArrowLeftIcon, ArrowRightIcon, StarIcon } from '@/components/ui/icons';
import ScrollReveal from '@/components/ui/ScrollReveal';
import styles from './AboutTestimonials.module.css';

/**
 * Frame 7 — testimonials.
 *
 * Light grey ground (#f5f5f5). Reuses the ServiceTestimonials layout exactly:
 * left column is eyebrow + heading + supporting line; right column is the quote
 * between two hairlines, stars, text, author row + arrows (hidden if only one).
 *
 * We have one verified testimonial (Matt Erdman). The carousel controls are
 * hidden when there is only one item.
 */
const ITEMS = [testimonials['matt-erdman']];

export default function AboutTestimonials() {
  const [index, setIndex] = useState(0);
  const current = ITEMS[index];
  const many = ITEMS.length > 1;

  const step = (by: number) =>
    setIndex((v) => (v + by + ITEMS.length) % ITEMS.length);

  return (
    <section className={styles.section}>
      <div className={`container ${styles.grid}`}>
        <div>
          <p className={styles.eyebrow}>Testimonials</p>
          <ScrollReveal
            text="What therapists say about working with us."
            className={styles.heading}
            start={0.82}
            end={0.45}
          />
          <p className={styles.paragraph}>
            We measure success by whether a practice stays with us. These are their
            words.
          </p>
        </div>

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
            <p>"{current.quote}"</p>
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
                  {index + 1} / {ITEMS.length}
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
