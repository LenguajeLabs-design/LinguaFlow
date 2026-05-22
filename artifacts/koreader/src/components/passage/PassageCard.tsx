import { Link } from 'wouter';
import { Bookmark, Clock, BookOpen } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { DifficultyBadge } from './DifficultyBadge';
import { cn } from '@/lib/utils';
import type { Passage } from '@workspace/api-client-react';
import { useToggleBookmark } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { getListPassagesQueryKey } from '@workspace/api-client-react';

interface PassageCardProps {
  passage: Passage;
  className?: string;
}

export function PassageCard({ passage, className }: PassageCardProps) {
  const queryClient = useQueryClient();
  const toggleBookmark = useToggleBookmark({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPassagesQueryKey() });
      }
    }
  });

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark.mutate({ 
      id: passage.id, 
      data: { isBookmarked: !passage.isBookmarked } 
    });
  };

  return (
    <Link 
      href={`/library/${passage.id}`}
      className={cn(
        "group relative flex flex-col justify-between p-6 rounded-2xl bg-card border border-border/60",
        "shadow-sm hover:shadow-md hover:border-border transition-all duration-300",
        "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
    >
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleBookmark}
          disabled={toggleBookmark.isPending}
          className={cn(
            "p-2 rounded-full backdrop-blur-sm transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring",
            passage.isBookmarked 
              ? "bg-accent/10 text-accent hover:bg-accent/20" 
              : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          <Bookmark className={cn("w-4 h-4", passage.isBookmarked && "fill-current")} />
        </button>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <DifficultyBadge difficulty={passage.difficulty} />
          <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
            {passage.topic}
          </span>
        </div>
        
        <h3 className="font-korean font-bold text-lg text-foreground mb-2 leading-tight group-hover:text-primary transition-colors">
          {passage.title}
        </h3>
        
        <p className="text-sm text-muted-foreground line-clamp-2 mb-6 font-korean">
          {passage.koreanText}
        </p>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/50">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatDistanceToNow(new Date(passage.createdAt), { addSuffix: true })}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{passage.sentences.length} sentences</span>
        </div>
      </div>
    </Link>
  );
}
