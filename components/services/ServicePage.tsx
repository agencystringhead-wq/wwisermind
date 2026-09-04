import type { ReactNode } from 'react';
import type { Service } from '@/lib/services';
import ContactGallery from '@/components/sections/ContactGallery';
import Faq from '@/components/sections/Faq';
import ServiceHero from './ServiceHero';
import ServiceIncluded from './ServiceIncluded';
import ServiceIntro from './ServiceIntro';
import ServiceProcess from './ServiceProcess';
import ServiceProjects from './ServiceProjects';
import ServiceRelated from './ServiceRelated';
import ServiceTechnology from './ServiceTechnology';
import ServiceTestimonials from './ServiceTestimonials';
import ServiceWhatWeDo from './ServiceWhatWeDo';
import ServiceWhyChooseUs from './ServiceWhyChooseUs';

/** The two grounds the frames alternate between under the hero. */
export type Ground = 'light' | 'grey';

/** A frame takes the next ground in turn, or names its own: the homepage FAQ is white
    and sets its own spacing, so it is a fixed point the alternation runs through. */
type Frame = { render: (ground: Ground) => ReactNode; fixed?: Ground };

/**
 * The one template every service page is. Header, footer, the floating contact bar and
 * the two yellow bars come from the root layout; the footer's own "ready to move faster?"
 * block is what closes the page, so nothing here repeats it.
 *
 * Under the dark hero and the mosaic that straddles its foot, the frames alternate white
 * and grey — but only over the frames the entry actually has. An optional frame with no
 * data is not rendered at all, and the ones after it take the next colour in turn, so two
 * of one ground never meet whatever a service leaves out. The mosaic sits on white, so the
 * first frame under it is white; the FAQ is the homepage's, always white, and the frames
 * after it continue from there.
 */
export default function ServicePage({ service }: { service: Service }) {
  const frames: Frame[] = [
    { render: (g) => <ServiceIntro service={service} ground={g} key="intro" /> },
  ];

  if (service.whatWeDo) {
    const block = service.whatWeDo;
    frames.push({ render: (g) => <ServiceWhatWeDo block={block} ground={g} key="what-we-do" /> });
  }

  frames.push({ render: (g) => <ServiceIncluded service={service} ground={g} key="included" /> });

  if (service.whyChooseUs) {
    const block = service.whyChooseUs;
    frames.push({ render: (g) => <ServiceWhyChooseUs block={block} ground={g} key="why" /> });
  }
  if (service.technology) {
    const block = service.technology;
    frames.push({ render: (g) => <ServiceTechnology block={block} ground={g} key="technology" /> });
  }
  if (service.projects) {
    const block = service.projects;
    frames.push({ render: (g) => <ServiceProjects block={block} ground={g} key="projects" /> });
  }
  if (service.process) {
    const block = service.process;
    frames.push({ render: (g) => <ServiceProcess block={block} ground={g} key="process" /> });
  }
  if (service.testimonials) {
    const block = service.testimonials;
    frames.push({
      render: (g) => <ServiceTestimonials block={block} ground={g} key="testimonials" />,
    });
  }

  frames.push({
    fixed: 'light',
    render: () => (
      <Faq
        key="faq"
        items={service.faqs.map((faq) => ({ question: faq.question, answer: faq.answer }))}
      />
    ),
  });
  frames.push({ render: (g) => <ServiceRelated service={service} ground={g} key="related" /> });

  let ground: Ground = 'grey';

  return (
    <>
      <ServiceHero service={service} withMosaic={Boolean(service.gallery)} />
      {service.gallery ? (
        <ContactGallery
          photos={{ tall: service.gallery.tall, mid: service.gallery.mid, wide: service.gallery.wide }}
          accent={service.gallery.accent}
          label={`${service.name} in pictures`}
        />
      ) : null}
      {frames.map((frame) => {
        ground = frame.fixed ?? (ground === 'light' ? 'grey' : 'light');
        return frame.render(ground);
      })}
    </>
  );
}
