import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { GuestGenerateForm } from '@/components/guest/GuestGenerateForm';
import { GuestReader } from '@/components/guest/GuestReader';

export default function Home() {
  const [passage, setPassage] = useState<any>(null);

  const handleGenerated = (p: any) => {
    setPassage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setPassage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
