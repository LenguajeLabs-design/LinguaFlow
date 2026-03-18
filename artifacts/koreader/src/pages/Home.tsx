import { Link, useLocation } from 'wouter';
import { BookOpen, Sparkles, TrendingUp, Library, Bookmark, PlusCircle } from 'lucide-react';
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
        
        {/* Hero Section */}
        <section className="relative rounded-3xl overflow-hidden bg-primary text-primary-foreground p-8 sm:p-12 md:p-16 shadow-xl">
          <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay">
            <img 
              src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
              alt="" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 text-accent-foreground" />
              <span>AI-Powered Reading Practice</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold tracking-tight mb-6 leading-tight">
              Master Korean through<br className="hidden sm:block" /> personalized stories.
            </h1>
            <p className="text-lg sm:text-xl text-primary-foreground/80 mb-8 max-w-xl font-light">
              Generate reading passages tailored exactly to your level and interests. Learn new vocabulary naturally with instant translations and context.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/generate"
                className="inline-flex justify-center items-center gap-2 px-8 py-4 rounded-xl bg-card text-card-foreground font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                <PlusCircle className="w-5 h-5" />
                Generate New Passage
              </Link>
              <Link 
                href="/library"
                className="inline-flex justify-center items-center gap-2 px-8 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold hover:bg-white/20 transition-all duration-300"
              >
                <Library className="w-5 h-5" />
                View Library
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Row */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 p-6 rounded-2xl bg-card border border-border shadow-sm">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Passages Read</p>
              <p className="text-3xl font-serif font-bold text-foreground">{stats.read}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-6 rounded-2xl bg-card border border-border shadow-sm">
            <div className="w-12 h-12 rounded-full bg-accent/20 text-accent flex items-center justify-center">
              <Bookmark className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Bookmarked</p>
              <p className="text-3xl font-serif font-bold text-foreground">{stats.bookmarked}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-6 rounded-2xl bg-card border border-border shadow-sm">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Words Learned</p>
              <p className="text-3xl font-serif font-bold text-foreground">{stats.vocab}</p>
            </div>
          </div>
        </section>

        {/* Quick Topics */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-foreground">Quick Start Topics</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {sampleTopics.map(topic => (
              <button
                key={topic}
                onClick={() => setLocation(`/generate?topic=${encodeURIComponent(topic)}`)}
                className="px-5 py-2.5 rounded-full bg-secondary text-secondary-foreground font-medium hover:bg-primary hover:text-primary-foreground transition-colors duration-300 border border-transparent hover:border-primary shadow-sm"
              >
                {topic}
              </button>
            ))}
          </div>
        </section>

        {/* Recent Library */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold text-foreground">Continue Reading</h2>
            <Link href="/library" className="text-primary font-medium hover:underline flex items-center gap-1">
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
            <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Your library is empty</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                Start your journey by generating your first personalized reading passage.
              </p>
              <Link 
                href="/generate"
                className="inline-flex px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/90 transition-colors"
              >
                Create a Passage
              </Link>
            </div>
          )}
        </section>

      </div>
    </AppLayout>
  );
}

