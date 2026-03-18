import { Link, useLocation } from 'wouter';
import { BookOpen, Sparkles, TrendingUp, Library, Bookmark, PlusCircle, Star } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useListPassages } from '@workspace/api-client-react';
import { PassageCard } from '@/components/passage/PassageCard';

export default function Home() {
  const [_, setLocation] = useLocation();
  const { data: passages, isLoading } = useListPassages();

  const recentPassages = passages?.slice(0, 4) || [];
  const stats = {
    read: passages?.length || 0,
    bookmarked: passages?.filter(p => p.isBookmarked).length || 0,
    vocab: passages?.reduce((acc, curr) => acc + (curr.vocabulary?.length || 0), 0) || 0
  };

  const sampleTopics = [
    "Korean Cinema", "Temple Stay", "Life in Seoul",
    "Traditional Food", "Language Learning", "Family Life"
  ];

  return (
    <AppLayout>
      <div className="space-y-16 pb-12">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="relative rounded-3xl overflow-hidden shadow-2xl">
          {/* Gradient background matching the icon */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, hsl(174,62%,42%) 0%, hsl(200,68%,50%) 35%, hsl(255,52%,58%) 70%, hsl(295,42%,58%) 100%)',
            }}
          />

          {/* Animated glow orbs */}
          <div className="hf-orb absolute -top-20 -left-16 w-72 h-72 rounded-full"
            style={{ background: 'hsl(174,60%,52%)', opacity: 0.25, filter: 'blur(60px)' }} />
          <div className="hf-orb-2 absolute -bottom-16 right-0 w-80 h-80 rounded-full"
            style={{ background: 'hsl(295,42%,67%)', opacity: 0.20, filter: 'blur(72px)' }} />

          {/* Wave decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
            <svg className="hf-wave absolute bottom-0 left-0 w-full" viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ opacity: 0.12 }}>
              <path d="M0,60 C200,100 400,20 600,60 C800,100 1000,20 1200,60 L1200,120 L0,120 Z" fill="white" />
            </svg>
            <svg className="hf-wave-2 absolute bottom-4 left-0 w-full" viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ opacity: 0.08 }}>
              <path d="M0,80 C300,40 500,100 700,70 C900,40 1100,90 1200,70 L1200,120 L0,120 Z" fill="white" />
            </svg>
          </div>

          {/* Sparkles */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            <Star className="hf-sparkle absolute top-10 right-[18%] w-3 h-3 text-white/60 fill-white/60" />
            <Star className="hf-sparkle-2 absolute top-[45%] right-[8%] w-2 h-2 text-white/50 fill-white/50" />
            <Star className="hf-sparkle-3 absolute bottom-[30%] left-[12%] w-2.5 h-2.5 text-white/50 fill-white/50" />
          </div>

          {/* Content */}
          <div className="relative z-10 p-8 sm:p-12 md:p-16 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-sm font-medium mb-6 text-white">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Reading Practice</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight mb-6 leading-tight text-white drop-shadow-sm">
              Master Korean<br className="hidden sm:block" /> through personalized<br className="hidden sm:block" /> stories.
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-xl font-light leading-relaxed">
              Generate reading passages tailored exactly to your level and interests. Learn new vocabulary naturally with instant translations and context.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/generate"
                className="inline-flex justify-center items-center gap-2 px-8 py-4 rounded-xl bg-white text-slate-900 font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                <PlusCircle className="w-5 h-5" />
                Generate New Passage
              </Link>
              <Link
                href="/library"
                className="hf-btn-ghost"
              >
                <Library className="w-5 h-5" />
                View Library
              </Link>
            </div>
          </div>
        </section>

        {/* ── Stats Row ─────────────────────────────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="hf-card hf-gradient-border flex items-center gap-4 p-6">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, hsl(174,60%,52%), hsl(200,68%,58%))' }}>
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">Passages Read</p>
              <p className="text-3xl font-serif font-bold text-foreground">{stats.read}</p>
            </div>
          </div>

          <div className="hf-card hf-gradient-border flex items-center gap-4 p-6">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, hsl(255,52%,66%), hsl(295,42%,67%))' }}>
              <Bookmark className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">Bookmarked</p>
              <p className="text-3xl font-serif font-bold text-foreground">{stats.bookmarked}</p>
            </div>
          </div>

          <div className="hf-card hf-gradient-border flex items-center gap-4 p-6">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, hsl(200,68%,58%), hsl(255,52%,66%))' }}>
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">Words Learned</p>
              <p className="text-3xl font-serif font-bold text-foreground">{stats.vocab}</p>
            </div>
          </div>
        </section>

        {/* ── Quick Topics ──────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-foreground">Quick Start Topics</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {sampleTopics.map(topic => (
              <button
                key={topic}
                onClick={() => setLocation(`/generate?topic=${encodeURIComponent(topic)}`)}
                className="px-5 py-2.5 rounded-full bg-secondary text-secondary-foreground font-medium text-sm border border-border hover:border-accent/40 hover:text-accent hover:bg-accent/8 transition-all duration-300 shadow-sm"
              >
                {topic}
              </button>
            ))}
          </div>
        </section>

        {/* ── Continue Reading ──────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-foreground">Continue Reading</h2>
            <Link href="/library" className="text-sm font-medium text-accent hover:text-accent/80 hover:underline flex items-center gap-1 transition-colors">
              See all <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-64 rounded-2xl bg-secondary/50 animate-pulse border border-border/50" />
              ))}
            </div>
          ) : recentPassages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentPassages.map(passage => (
                <PassageCard key={passage.id} passage={passage} />
              ))}
            </div>
          ) : (
            /* Empty state with brand decoration */
            <div className="relative text-center py-20 rounded-3xl border border-dashed border-border overflow-hidden bg-card">
              {/* Soft glow */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full hf-orb"
                  style={{ background: 'hsl(174,60%,52%)', opacity: 0.06, filter: 'blur(60px)' }} />
              </div>
              <div className="relative z-10">
                {/* Icon container with gradient */}
                <div className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg"
                  style={{ background: 'linear-gradient(135deg, hsl(174,62%,42%), hsl(255,52%,60%))' }}>
                  <BookOpen className="w-9 h-9 text-white" />
                </div>
                <h3 className="text-xl font-serif font-bold text-foreground mb-2">Your library is empty</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-8 leading-relaxed">
                  Start your journey by generating your first personalized Korean reading passage.
                </p>
                <Link
                  href="/generate"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 text-white"
                  style={{ background: 'linear-gradient(135deg, hsl(174,62%,42%), hsl(200,68%,52%), hsl(255,52%,60%))' }}
                >
                  <PlusCircle className="w-5 h-5" />
                  Create Your First Passage
                </Link>
              </div>
            </div>
          )}
        </section>

      </div>
    </AppLayout>
  );
}
