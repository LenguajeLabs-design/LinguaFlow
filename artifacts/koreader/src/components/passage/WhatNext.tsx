import { ArrowRight, BookMarked, Sparkles, Library, TrendingUp } from 'lucide-react';
import { Link } from 'wouter';

interface WhatNextProps {
  topic?: string;
  difficulty?: string;
  language?: string;
}

// Difficulty step-up map — one level at a time, per language system
const STEP_UP: Record<string, string | null> = {
  // Korean TOPIK-style
  beginner: 'lower_intermediate',
  lower_intermediate: 'intermediate',
  intermediate: 'upper_intermediate',
  upper_intermediate: 'advanced',
  advanced: null,
  // Chinese HSK
  hsk1: 'hsk2', hsk2: 'hsk3', hsk3: 'hsk4',
  hsk4: 'hsk5', hsk5: 'hsk6', hsk6: null,
  // CEFR (Spanish, Italian, English)
  a1: 'a2', a2: 'b1', b1: 'b2', b2: 'c1', c1: 'c2', c2: null,
};

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: 'Beginner',
  lower_intermediate: 'Lower Intermediate',
  intermediate: 'Intermediate',
  upper_intermediate: 'Upper Intermediate',
  advanced: 'Advanced',
  hsk1: 'HSK 1', hsk2: 'HSK 2', hsk3: 'HSK 3',
  hsk4: 'HSK 4', hsk5: 'HSK 5', hsk6: 'HSK 6',
  a1: 'A1', a2: 'A2', b1: 'B1', b2: 'B2', c1: 'C1', c2: 'C2',
};

function getStepUpSuggestion(difficulty?: string): string | null {
  if (!difficulty) return null;
  try {
    const recent: string[] = JSON.parse(localStorage.getItem('lf-read-difficulties') || '[]');
    // Suggest step-up when 2+ of the last 4 reads are at the same level
    const matchCount = recent.slice(-4).filter(d => d === difficulty).length;
    if (matchCount < 2) return null;
    return STEP_UP[difficulty] ?? null;
  } catch {
    return null;
  }
}

export function WhatNext({ topic, difficulty, language }: WhatNextProps) {
  const nextLevel = getStepUpSuggestion(difficulty);
  const nextLabel = nextLevel ? DIFFICULTY_LABEL[nextLevel] : null;

  const generateLabel = nextLabel
    ? `Try a ${nextLabel} passage`
    : topic
    ? `Read another "${topic}" passage`
    : 'Generate another passage';

  const generateDescription = nextLabel
    ? `You've been reading at ${DIFFICULTY_LABEL[difficulty ?? ''] ?? 'this level'} comfortably — ${nextLabel} is a natural next step.`
    : 'Keep the momentum going with a new reading at your level.';

  const generateIcon = nextLabel ? TrendingUp : Sparkles;

  const actions = [
    {
      icon: BookMarked,
      label: 'Review your vocabulary',
      description: 'Reinforce the words you\'ve saved from this and past passages.',
      href: '/vocabulary',
      accent: false,
    },
    {
      icon: generateIcon,
      label: generateLabel,
      description: generateDescription,
      href: '/generate',
      accent: true,
    },
    {
      icon: Library,
      label: 'Back to your library',
      description: 'Browse everything you\'ve saved so far.',
      href: '/library',
      accent: false,
    },
  ];

  return (
    <section className="mt-10 pt-8 border-t border-border">
      <h3 className="text-base font-bold font-serif text-foreground mb-5">
        What's next?
      </h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.href + action.label}
            href={action.href}
            className={`group flex flex-col gap-3 p-4 rounded-2xl border transition-all duration-200 hover:shadow-md ${
              action.accent
                ? 'border-accent/25 bg-accent/5 hover:border-accent/40 hover:bg-accent/8'
                : 'border-border/60 bg-card hover:border-border'
            }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              action.accent ? 'bg-accent/15 text-accent' : 'bg-secondary text-muted-foreground'
            }`}>
              <action.icon className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground mb-1 group-hover:text-accent transition-colors line-clamp-2">
                {action.label}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                {action.description}
              </p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-accent group-hover:translate-x-0.5 transition-all self-end" />
          </Link>
        ))}
      </div>
    </section>
  );
}
