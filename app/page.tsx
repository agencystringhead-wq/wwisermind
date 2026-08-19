import Faq from '@/components/sections/Faq';
import Founder from '@/components/sections/Founder';
import Freebies from '@/components/sections/Freebies';
import GetFound from '@/components/sections/GetFound';
import HeroBanner from '@/components/sections/HeroBanner';
import HeroTop from '@/components/sections/HeroTop';
import HomeIntro from '@/components/sections/HomeIntro';
import Practice from '@/components/sections/Practice';
import Problems from '@/components/sections/Problems';
import Process from '@/components/sections/Process';
import Services from '@/components/sections/Services';
import WhyUs from '@/components/sections/WhyUs';

export default function HomePage() {
  return (
    <>
      <HeroTop />
      <HeroBanner />
      <HomeIntro />
      <Problems />
      <Services />
      <Practice />
      <Process />
      <WhyUs />
      <Founder />
      <Freebies />
      <GetFound />
      <Faq />
      {/* Next frames get appended here. */}
    </>
  );
}
