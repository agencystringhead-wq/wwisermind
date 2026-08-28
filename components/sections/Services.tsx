import Image from 'next/image';
import Link from 'next/link';
import { services } from '@/lib/site';
import styles from './Services.module.css';

function ListArrow() {
  return (
    <svg
      className={styles.listArrow}
      width="13"
      height="10"
      viewBox="0 0 13 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 5h10" />
      <path d="M8 1.5L11.5 5 8 8.5" />
    </svg>
  );
}

function LongArrow() {
  return (
    <svg
      className={styles.goIcon}
      viewBox="0 0 88 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="square"
      aria-hidden="true"
    >
      <path d="M0 20h86" />
      <path d="M68 2l18 18-18 18" />
    </svg>
  );
}

export default function Services() {
  const { label, rows, startWithLabel } = services;

  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.label}>{label}</h2>

        <div className={styles.rows}>
          {rows.map((row) => (
            <article className={styles.row} key={row.title}>
              {/* Two copies of the mark, the second recoloured for the fill and laid over the
                  first. The reference's icon carries both the fill's yellow-green and a blue
                  strong enough to read on it; ours is pale at both ends and would all but
                  vanish, so the hover copy pushes its gradient to that same spread. The
                  overlay is absolute, so swapping them moves nothing. */}
              <span className={styles.iconStack}>
                <Image
                  src={row.icon}
                  alt=""
                  width={row.iconWidth}
                  height={row.iconHeight}
                  className={styles.icon}
                />
                <Image
                  src={row.iconOnFill}
                  alt=""
                  width={row.iconWidth}
                  height={row.iconHeight}
                  className={`${styles.icon} ${styles.iconOnFill}`}
                  aria-hidden="true"
                />
              </span>

              <h3>
                <Link href={row.href} className={styles.title}>
                  {row.title}
                </Link>
              </h3>

              <p className={styles.body}>{row.body}</p>

              <div className={styles.startCol}>
                <p className={styles.startLabel}>{startWithLabel}</p>
                <div className={styles.list}>
                  {row.startWith.map((item) => (
                    <Link href={item.href} className={styles.listLink} key={item.label}>
                      <ListArrow />
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              <Link href={row.href} className={styles.go} aria-label={`${row.title} — see more`}>
                <LongArrow />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
