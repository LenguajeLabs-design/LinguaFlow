import { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, WifiOff, Download, Check, Sparkles, ArrowRight } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthGate } from '@/components/auth/AuthGate';
import { useListPassages } from '@workspace/api-client-react';
import { PassageCard } from '@/components/passage/PassageCard';
import { DifficultyBadge } from '@/components/passage/DifficultyBadge';
import { cn } from '@/lib/utils';
import { useOfflineLibrary } from '@/hooks/use-offline-library';
import { LANGUAGE_CONFIG, type AppLanguage } from '@/hooks/use-language';
import { Link } from 'wouter';

type FilterTab = 'all' | 'bookmarked';

const LANGUAGE_ORDER: AppLanguage[] = ['ko', 'zh', 'es', 'it', 'en'];

export default function Library() {
  const { data: passages, isLoading, isError } = useListPassages();
  const [searchQuery, setSearchQuery]           = useState('');
  const [activeTab, setActiveTab]               = useState<FilterTab>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [languageFilter, setLanguageFilter]     = useState<string>('all');
  const [synced, setSynced]                     = useState(false);

  const { offlinePassages, isOnline, syncAll, isSyncing } = useOfflineLibrary();

  const activePassages = isOnline ? (passages ?? []) : offlinePassages;

  useEffect(() => {
    if (isOnline && passages && passages.length > 0) {
      syncAll(passages);
    }
  }, [isOnline, passages]);

  const handleManualSync = () => {
    if (passages && passages.length > 0) {
      syncAll(passages);
      setSynced(true);
      setTimeout(() => setSynced(false), 2500);
    }
  };

  const hasActiveFilters = !!(searchQuery || activeTab === 'bookmarked' || difficultyFilter !== 'all' || languageFilter !== 'all');

  const filteredPassages = activePassages.filter(passage => {
    if (activeTab === 'bookmarked' && !passage.isBookmarked) return false;
    if (difficultyFilter !== 'all' && passage.difficulty !== difficultyFilter) return false;
    if (languageFilter !== 'all' && passage.language !== languageFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        passage.title.toLowerCase().includes(q) ||
        passage.topic.toLowerCase().includes(q) ||
        passage.koreanText.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const isEmptyLibrary = isOnline && !isLoading && !isError && activePassages.length === 0;

  // Most recently saved passage (sorted by createdAt DESC)
  const mostRecent = activePassages.length > 0
    ? [...activePassages].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
    : null;

  // 24h return nudge — check if user hasn't read in >24h
  const welcomeBack = (() => {
    try {
      const lastRead = parseInt(localStorage.getItem('lf-last-read') || '0');
      if (!lastRead) return false;
      const hoursSince = (Date.now() - lastRead) / (1000 * 60 * 60);
      return hoursSince > 24;
    } catch { return false; }
  })();

  return (
    <AppLayout>
      <AuthGate message="Sign in to access your personal library and saved passages.">
      <div className="pb-12">
        <header className="mb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4">
                Your Library
              </h1>
              <p className="text-muted-foreground text-lg">
                Review your saved passages, revisit vocabulary, and track your progress.
              </p>
            </div>

            {isOnline ? (
              <button
                onClick={handleManualSync}
                disabled={isSyncing || !passages?.length}
                title="Save all passages for offline reading"
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all shrink-0 mt-1',
                  synced
                    ? 'bg-green-500/10 text-green-600 border-green-500/30'
                    : 'bg-card text-muted-foreground border-border hover:text-foreground hover:border-primary/30'
                )}
              >
                {synced
                  ? <><Check className="w-4 h-4" /> Synced!</>
                  : isSyncing
                  ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Syncing…</>
                  : <><Download className="w-4 h-4" /> Sync for offline</>}
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-amber-500/10 text-amber-600 border border-amber-500/30 shrink-0 mt-1">
                <WifiOff className="w-4 h-4" />
                Offline — showing {offlinePassages.length} cached {offlinePassages.length === 1 ? 'story' : 'stories'}
              </div>
            )}
          </div>
        </header>

        {/* Welcome empty state */}
        {isEmptyLibrary ? (
          <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-card rounded-2xl border border-dashed border-border">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5">
              <BookOpen className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-bold font-serif text-foreground mb-2">
              Your library is ready
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs mb-8 leading-relaxed">
              Generate your first passage and save it here. Your reading history, bookmarks, and progress will all live in this library.
            </p>
            <Link href="/generate">
              <button className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200">
                <Sparkles className="w-4 h-4" />
                Generate your first passage
              </button>
            </Link>
          </div>
        ) : (
          <>
            {/* ── Continue reading / Welcome back ── */}
            {!hasActiveFilters && mostRecent && !isLoading && (
              <div className="mb-8">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                  {welcomeBack ? 'Welcome back' : 'Continue reading'}
                </p>
                {welcomeBack && (
                  <p className="text-sm text-muted-foreground mb-3">
                    Good to see you again. Pick up where you left off.
                  </p>
                )}
                <Link href={`/library/${mostRecent.id}`}>
                  <div className={cn(
                    'group flex items-center justify-between gap-4 p-5 bg-card border rounded-2xl hover:shadow-md transition-all duration-200 cursor-pointer',
                    welcomeBack
                      ? 'border-accent/30 shadow-sm hover:border-accent/50'
                      : 'border-accent/20 hover:border-accent/40'
                  )}>
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 text-lg">
                        {LANGUAGE_CONFIG[mostRecent.language as AppLanguage]?.flag ?? '📖'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <DifficultyBadge difficulty={mostRecent.difficulty} />
                          <span className="text-xs text-muted-foreground capitalize">{mostRecent.topic}</span>
                        </div>
                        <h3 className="font-serif font-bold text-foreground text-base leading-snug truncate group-hover:text-accent transition-colors">
                          {mostRecent.title}
                        </h3>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-accent shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              </div>
            )}

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search titles, topics, or words..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-card border border-border shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="flex gap-2">
                <div className="flex bg-secondary/50 p-1 rounded-xl h-[50px]">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={cn(
                      "px-4 font-medium text-sm rounded-lg transition-colors",
                      activeTab === 'all' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActiveTab('bookmarked')}
                    className={cn(
                      "px-4 font-medium text-sm rounded-lg transition-colors",
                      activeTab === 'bookmarked' ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Bookmarks
                  </button>
                </div>

                <div className="relative h-[50px]">
                  <select
                    value={languageFilter}
                    onChange={(e) => setLanguageFilter(e.target.value)}
                    className="h-full appearance-none pl-4 pr-10 rounded-xl bg-card border border-border text-foreground text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  >
                    <option value="all">All Languages</option>
                    {LANGUAGE_ORDER.map((lang) => (
                      <option key={lang} value={lang}>
                        {LANGUAGE_CONFIG[lang].flag} {LANGUAGE_CONFIG[lang].name}
                      </option>
                    ))}
                  </select>
                  <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>

                <div className="relative h-[50px]">
                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="h-full appearance-none pl-4 pr-10 rounded-xl bg-card border border-border text-foreground text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                  >
                    <option value="all">Any Level</option>
                    <option value="beginner">Beginner</option>
                    <option value="lower_intermediate">Lower Int.</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="upper_intermediate">Upper Int.</option>
                    <option value="advanced">Advanced</option>
                    <option value="hsk1">HSK 1</option>
                    <option value="hsk2">HSK 2</option>
                    <option value="hsk3">HSK 3</option>
                    <option value="hsk4">HSK 4</option>
                    <option value="hsk5">HSK 5</option>
                    <option value="hsk6">HSK 6</option>
                    <option value="a1">A1</option>
                    <option value="a2">A2</option>
                    <option value="b1">B1</option>
                    <option value="b2">B2</option>
                    <option value="c1">C1</option>
                    <option value="c2">C2</option>
                  </select>
                  <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Content */}
            {isOnline && isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-64 rounded-2xl bg-secondary/50 animate-pulse border border-border/50" />
                ))}
              </div>
            ) : isOnline && isError ? (
              <div className="p-8 text-center bg-destructive/10 text-destructive rounded-2xl border border-destructive/20">
                Failed to load library. Please try again.
              </div>
            ) : filteredPassages.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPassages.map(passage => (
                  <PassageCard key={passage.id} passage={passage} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                  {!isOnline
                    ? <WifiOff className="w-8 h-8 text-muted-foreground" />
                    : <BookOpen className="w-8 h-8 text-muted-foreground" />}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {!isOnline ? 'No offline stories found' : 'No passages found'}
                </h3>
                <p className="text-muted-foreground">
                  {!isOnline
                    ? 'Use "Sync for offline" while connected to save stories for your trip.'
                    : hasActiveFilters
                    ? 'Try adjusting your filters or search query.'
                    : "You haven't saved any passages yet."}
                </p>
              </div>
            )}
          </>
        )}
      </div>
      </AuthGate>
    </AppLayout>
  );
}
