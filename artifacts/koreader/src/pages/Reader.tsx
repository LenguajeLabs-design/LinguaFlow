import { useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { AppLayout } from '@/components/layout/AppLayout';
import { PassageReader } from '@/components/passage/PassageReader';
import { ChinesePassageReader } from '@/components/passage/ChinesePassageReader';
import { usePassageStore } from '@/store/use-passage-store';
import { useGetPassage } from '@workspace/api-client-react';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

export default function Reader() {
  const [isLibraryRoute, params] = useRoute('/library/:id');
  const [isTempRoute] = useRoute('/passage');
  const [_, setLocation] = useLocation();

  const generatedPassage = usePassageStore(state => state.generatedPassage);
  const clearGeneratedPassage = usePassageStore(state => state.clearGeneratedPassage);

  useEffect(() => {
    if (isTempRoute && !generatedPassage) {
      setLocation('/generate');
    }
  }, [isTempRoute, generatedPassage, setLocation]);

  const passageId = isLibraryRoute ? Number(params.id) : 0;
  const { data: savedPassage, isLoading, isError } = useGetPassage(passageId, {
    query: { enabled: isLibraryRoute && !!passageId }
  });

  const handlePassageSaved = (saved: any) => {
    clearGeneratedPassage();
    setLocation(`/library/${saved.id}`);
  };

  const passage = isLibraryRoute ? savedPassage : generatedPassage;
  const isZh = passage?.language === 'zh';

  return (
    <AppLayout>
      <div className="mb-6">
        <Link
          href={isLibraryRoute ? '/library' : '/generate'}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {isLibraryRoute ? 'Library' : 'Generator'}
        </Link>
      </div>

      {isLibraryRoute && isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
          <p>Loading passage…</p>
        </div>
      ) : isLibraryRoute && isError ? (
        <div className="p-8 text-center bg-destructive/10 text-destructive rounded-2xl border border-destructive/20">
          Failed to load passage. It may have been deleted.
        </div>
      ) : passage ? (
        isZh ? (
          <ChinesePassageReader
            passage={passage}
            isUnsaved={!!isTempRoute}
            onSaved={handlePassageSaved}
          />
        ) : (
          <PassageReader
            passage={passage}
            isUnsaved={!!isTempRoute}
            onSaved={handlePassageSaved}
          />
        )
      ) : null}
    </AppLayout>
  );
}
