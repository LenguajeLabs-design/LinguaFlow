import { cn } from '@/lib/utils';

interface DifficultyBadgeProps {
  difficulty: string;
  className?: string;
}

const difficultyConfig: Record<string, { label: string; colors: string }> = {
  beginner: { label: 'Beginner', colors: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  lower_intermediate: { label: 'Lower Int.', colors: 'bg-blue-100 text-blue-800 border-blue-200' },
  intermediate: { label: 'Intermediate', colors: 'bg-amber-100 text-amber-800 border-amber-200' },
  upper_intermediate: { label: 'Upper Int.', colors: 'bg-orange-100 text-orange-800 border-orange-200' },
  advanced: { label: 'Advanced', colors: 'bg-rose-100 text-rose-800 border-rose-200' },
  a1: { label: 'A1 · Beginner',          colors: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  a2: { label: 'A2 · Elementary',         colors: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  b1: { label: 'B1 · Intermediate',       colors: 'bg-blue-100 text-blue-800 border-blue-200' },
  b2: { label: 'B2 · Upper Int.',         colors: 'bg-blue-100 text-blue-800 border-blue-200' },
  c1: { label: 'C1 · Advanced',           colors: 'bg-violet-100 text-violet-800 border-violet-200' },
  c2: { label: 'C2 · Mastery',            colors: 'bg-violet-100 text-violet-800 border-violet-200' },
  hsk1: { label: 'HSK 1', colors: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  hsk2: { label: 'HSK 2', colors: 'bg-teal-100 text-teal-800 border-teal-200' },
  hsk3: { label: 'HSK 3', colors: 'bg-blue-100 text-blue-800 border-blue-200' },
  hsk4: { label: 'HSK 4', colors: 'bg-amber-100 text-amber-800 border-amber-200' },
  hsk5: { label: 'HSK 5', colors: 'bg-orange-100 text-orange-800 border-orange-200' },
  hsk6: { label: 'HSK 6', colors: 'bg-rose-100 text-rose-800 border-rose-200' },
};

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  const config = difficultyConfig[difficulty.toLowerCase()] || { 
    label: difficulty.replace('_', ' '), 
    colors: 'bg-secondary text-secondary-foreground border-border' 
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-sm",
      config.colors,
      className
    )}>
      {config.label}
    </span>
  );
}
