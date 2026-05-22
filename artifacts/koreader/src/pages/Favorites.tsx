import { useState } from 'react';
import { Heart, BookOpen } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthGate } from '@/components/auth/AuthGate';
import { useListPassages } from '@workspace/api-client-react';
import { PassageCard } from '@/components/passage/PassageCard';
import { cn } from '@/lib/utils';

export default function Favorites() {
  const { data: passages, isLoading, isError } = useListPassages();
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  const difficulties = ['all', 'beginner', 'elementary', 'intermediate', 'upper-intermediate', 'advanced'];

  const bookmarked = (passages || []).filter((p) => p.isBookmarked);

  const filtered = bookmarked.filter((p) => {
    if (difficultyFilter !== 'all' && p.difficulty !== difficultyFilter) return false;
    return true;
  });

  return (
    <AppLayout>
      <AuthGate message="Sign in to see your bookmarked passages.">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-5 h-5 text-accent fill-accent/20" />
            <h1 className="text-2xl font-serif font-bold text-foreground">Favorites</h1>
          </div>
          <p className="text-muted-foreground">Passages you've bookmarked for quick access.</p>
        </div>

        {/* Difficulty filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {difficulties.map((d) => (
            <button
              key={d}
              onClick={() => setDifficultyFilter(d)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors duration-150',
                difficultyFilter === d
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              {d === 'all' ? 'All Levels' : d}
            </button>
          ))}
        </div>

        {/* States */}
        {isLoading && (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3" />
            Loading favorites...
          </div>
        )}

        {isError && (
          <div className="text-center py-24 text-destructive">
            Failed to load passages. Please try again.
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="text-center py-24 space-y-4">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto">
              <Heart className="w-7 h-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">No favorites yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                {bookmarked.length === 0
                  ? 'Bookmark passages from the library to save them here.'
                  : 'No favorites match the selected filter.'}
              </p>
            </div>
          </div>
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((passage) => (
              <PassageCard key={passage.id} passage={passage} />
            ))}
          </div>
        )}
      </div>
      </AuthGate>
    </AppLayout>
  );
}
