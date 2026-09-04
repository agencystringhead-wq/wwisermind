'use client';

import { useState } from 'react';
import Image from 'next/image';
import { testimonials, type Service } from '@/lib/services';
import { ArrowLeftIcon, ArrowRightIcon, StarIcon } from '@/components/ui/icons';
import ScrollReveal from '@/components/ui/ScrollReveal';
import section from './Section.module.css';
import type { Ground } from './ServicePage';
import styles from './ServiceTestimonials.module.css';

/**
 * Frame 11: testimonials, set to the page's own scale. The eyebrow, the section heading
 * and the supporting line hold the left column; on the right, between two hairlines, the
 * one testimonial: a small row of stars, the quote at reading size, and under it the
 * reviewer — a 44px photograph, the name and the role — with the two small round arrows
 * at the end of that row when there is more than one to move between.
 *
 * A carousel wrapping at both ends; the quote block is a live region so a screen reader
 * hears the new one after an arrow. With one testimonial the arrows are not drawn.
 */
export default function ServiceTestimonials({
  block,
  ground,
}: {
  block: NonNullable<Service['testimonials']>;
  ground: Ground;
}) {
  const items = (block.ids ?? (Object.keys(testimonials) as (keyof typeof testimonials)[])).map(
    (id) => testimonials[id],
  );
  const [index, setIndex] = useState(0);
  const current = items[index];
  const many = items.length > 1;

  const step = (by: number) => setIndex((value) => (value + by + items.length) % items.length);

  return (
    <section className={`${section.section} ${section[ground]}`}>
      <div className={`container ${styles.grid}`}>
        <div>
          <p className={section.eyebrow}>Testimonials</p>
          <ScrollReveal text={block.heading} className={styles.heading} />
          <p className={styles.paragraph}>{block.paragraph}</p>
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
            <p>“{current.quote}”</p>
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
