import HeroBanner from '@/components/sections/HeroBanner';
import HeroTop from '@/components/sections/HeroTop';
import HomeIntro from '@/components/sections/HomeIntro';
import Problems from '@/components/sections/Problems';
import Services from '@/components/sections/Services';

export default function HomePage() {
  return (
    <>
      <HeroTop />
      <HeroBanner />
      <HomeIntro />
      <Problems />
      <Services />
      {/* Next frames get appended here. */}
    </>
  );
}
