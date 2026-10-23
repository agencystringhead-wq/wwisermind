import Image from 'next/image';
import Reveal from '@/components/ui/Reveal';
import ScrollReveal from '@/components/ui/ScrollReveal';
import styles from './AboutFounder.module.css';

/**
 * Section 2: founder story (white ground).
 *
 * Reference: dominant tall portrait left (sticky on desktop so the long story never leaves
 * a hole beside it); right: mono eyebrow, two-line heading, the story, signature.
 *
 * Portrait: Srikaanth-Founder-wwisermind.webp (700×700, 95 kB)
 */
export default function AboutFounder() {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.grid}`}>
        {/* LEFT: portrait and pull quote, one sticky block */}
        <div className={styles.stick}>
          <figure className={styles.portrait} data-reveal="0">
            <Image
              src="/images/Srikaanth-Founder-wwisermind.webp"
              alt="Srikaant H., co-founder of wwisermind"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1023px) 50vw, 540px"
              className={styles.portraitImg}
            />
          </figure>
          <blockquote className={styles.pullQuote}>
            10% of our profit goes toward therapy for autistic children whose families
            can&apos;t afford it.
          </blockquote>
        </div>

        {/* RIGHT: copy */}
        <Reveal as="div" className={styles.copy}>
          <p className={styles.eyebrow} data-reveal="0">A word from the founder</p>

          <ScrollReveal
            text={"Why I built this\nfor therapists."}
            className={styles.heading}
          />

          <div className={styles.body} data-reveal="2">
            <p>My nephew was three when we found out he&apos;s autistic.</p>
            <p>
              I remember the weeks after that. Not the diagnosis itself, but what came next. My
              brother and his wife needed help, and they needed it fast. A speech therapist. An
              occupational therapist. Someone who understood children like him.
            </p>
            <p>So they started searching.</p>
            <p>
              Evenings on the phone. Weekends driving to clinics. Asking relatives, asking
              friends of relatives, scrolling through websites that told them nothing. Some
              therapists had no website at all. Some had one that hadn&apos;t been touched in
              years. The good ones were somehow the hardest to find.
            </p>
            <p>
              I watched all of it. And it bothered me, because helping healthcare practices get
              found was literally my job. I&apos;d been doing it for years. I knew how much a
              clear website and the right search presence change who a family ends up calling.
            </p>
            <p>And still, my own family was lost.</p>
            <p>
              They did find the right therapist in the end. My nephew is seven now. He&apos;s
              grown so much, and he keeps surprising us. There&apos;s a long road ahead, but
              he&apos;s walking it with people who understand him.
            </p>
            <p>
              That search never left me though. Every parent going through it right now is
              losing time they don&apos;t have. Not because good therapists don&apos;t exist, but
              because they can&apos;t be found.
            </p>
            <p>
              That&apos;s why wwisermind exists. We help therapists and psychologists get found
              by the families who are looking for them.
            </p>

            <h3 className={styles.subheading}>
              Why we work with US practices, and where the money goes
            </h3>

            <p>
              People ask me this. If the story started in India, why serve therapists in America?
            </p>
            <p>
              Because that&apos;s where we can do the most good, twice. US practices need what
              we&apos;re good at. And what we earn there can help children here at home.
            </p>
            <p>
              In India, most autistic children never get consistent therapy. Not because their
              parents don&apos;t care, but because they can&apos;t afford it. My nephew got help
              because his family could pay. A lot of children like him can&apos;t.
            </p>
            <p className={styles.promise}>
              So we made a promise. 10% of wwisermind&apos;s profit goes toward therapy for
              autistic children in India whose families can&apos;t afford it. Every website we
              build, every practice we help grow, a part of it goes to a child who needs it.
            </p>
            <p>We&apos;ll share what that adds up to here, every year.</p>
            <p>
              Your practice gets found. A child somewhere gets their therapy. That&apos;s the
              whole idea.
            </p>
          </div>

          <p className={styles.signature} data-reveal="2">
            Srikaant H.
            <br />
            Co-founder, wwisermind
          </p>
        </Reveal>
      </div>
    </section>
  );
}
