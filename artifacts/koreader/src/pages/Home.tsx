import { AppLayout } from '@/components/layout/AppLayout';
import { useLanguageStore } from '@/hooks/use-language';
import { LandingHero } from '@/components/landing/LandingHero';
import { WhySection } from '@/components/landing/WhySection';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { TrustSection } from '@/components/landing/TrustSection';

export default function Home() {
  const { language } = useLanguageStore();

  return (
    <AppLayout>
      <div className="-mt-8 -mb-24 md:-mb-8">
        <LandingHero language={language} />
        <WhySection />
        <HowItWorks />
        <TrustSection />
      </div>
    </AppLayout>
  );
}
