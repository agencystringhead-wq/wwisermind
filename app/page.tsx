import HeroBanner from '@/components/sections/HeroBanner';
import HeroTop from '@/components/sections/HeroTop';
import HomeIntro from '@/components/sections/HomeIntro';
import Practice from '@/components/sections/Practice';
import Problems from '@/components/sections/Problems';
import Process from '@/components/sections/Process';
import Services from '@/components/sections/Services';

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
      {/* Next frames get appended here. */}
    </>
  );
}
