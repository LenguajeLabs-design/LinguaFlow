import { cn } from '@/components/layout/AppLayout';

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
