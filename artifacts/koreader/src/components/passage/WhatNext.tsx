import { ArrowRight, BookMarked, Sparkles, Library } from 'lucide-react';
import { Link } from 'wouter';

interface WhatNextProps {
  topic?: string;
  difficulty?: string;
  language?: string;
}

export function WhatNext({ topic, difficulty, language }: WhatNextProps) {
  const generateHref = '/generate';

  const actions = [
    {
      icon: BookMarked,
      label: 'Review your vocabulary',
      description: 'Reinforce the words you\'ve saved from this and past passages.',
      href: '/vocabulary',
      accent: false,
    },
    {
      icon: Sparkles,
      label: topic ? `Read another passage on "${topic}"` : 'Generate another passage',
      description: 'Keep the momentum going with a new reading at your level.',
      href: generateHref,
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
            key={action.href}
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
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
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
