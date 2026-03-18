import { useState } from 'react';
import { Search, Filter, BookOpen } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useListPassages } from '@workspace/api-client-react';
import { PassageCard } from '@/components/passage/PassageCard';
import { cn } from '@/components/layout/AppLayout';

type FilterTab = 'all' | 'bookmarked';

export default function Library() {
  const { data: passages, isLoading, isError } = useListPassages();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  // Filter logic
  const filteredPassages = (passages || []).filter(passage => {
    // Tab filter
    if (activeTab === 'bookmarked' && !passage.isBookmarked) return false;
    
    // Difficulty filter
    if (difficultyFilter !== 'all' && passage.difficulty !== difficultyFilter) return false;
    
    // Search filter
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

  return (
    <AppLayout>
      <div className="pb-12">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4">
            Your Library
          </h1>
          <p className="text-muted-foreground text-lg">
            Review your saved passages, revisit vocabulary, and track your progress.
          </p>
        </header>

        {/* Filters & Search Bar */}
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
              </select>
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 rounded-2xl bg-secondary/50 animate-pulse border border-border/50" />
            ))}
          </div>
        ) : isError ? (
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
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No passages found</h3>
            <p className="text-muted-foreground">
              {searchQuery || activeTab === 'bookmarked' || difficultyFilter !== 'all' 
                ? "Try adjusting your filters or search query." 
                : "You haven't saved any passages yet."}
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
