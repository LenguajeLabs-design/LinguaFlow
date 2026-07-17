import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { GuestGenerateForm } from '@/components/guest/GuestGenerateForm';
import { GuestReader } from '@/components/guest/GuestReader';
import { Onboarding } from '@/components/onboarding/Onboarding';
import { useOnboardingStore } from '@/hooks/use-onboarding';

export default function Home() {
  const [passage, setPassage] = useState<any>(null);
  const { hasOnboarded, completeOnboarding, skipOnboarding } = useOnboardingStore();

  const handleGenerated = (p: any) => {
    setPassage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setPassage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!hasOnboarded) {
    return (
      <AppLayout minimal>
        <Onboarding
          variant="guest"
          onSkip={skipOnboarding}
          onComplete={(p) => {
            completeOnboarding();
            if (p) handleGenerated(p);
          }}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {passage ? (
        <GuestReader passage={passage} onBack={handleBack} />
      ) : (
        <GuestGenerateForm onGenerated={handleGenerated} />
      )}
    </AppLayout>
  );
}
