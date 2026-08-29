import Image from 'next/image';
import Link from 'next/link';
import { getFound } from '@/lib/site';
import ScrollReveal from '@/components/ui/ScrollReveal';
import styles from './GetFound.module.css';

export default function GetFound() {
  const { background, heading, body, featured, logos, link } = getFound;

  return (
    <section className={styles.section}>
      <Image src={background} alt="" fill sizes="100vw" className={styles.backdrop} />

      <div className={`container ${styles.inner}`}>
        <ScrollReveal text={heading} className={styles.heading} />
        <p className={styles.body}>{body}</p>

        <Image
          src={featured.src}
          alt={featured.alt}
          width={featured.width}
          height={featured.height}
          className={styles.featured}
        />

        <div className={styles.logos}>
          {logos.map((logo) => (
            <Image
              key={logo.alt}
              src={logo.src}
              alt={logo.alt}
              width={logo.width}
              height={logo.height}
            />
          ))}
        </div>

        <Link href={link.href} className={styles.link}>
          {link.label}
        </Link>
      </div>
    </section>
  );
}
