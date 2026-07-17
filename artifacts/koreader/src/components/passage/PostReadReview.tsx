import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, RotateCcw, BookMarked, ChevronRight } from 'lucide-react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';

interface VocabItem {
  korean: string;
  romanization?: string;
  english: string;
  partOfSpeech?: string;
  exampleSentence?: string;
}

interface PostReadReviewProps {
  vocabulary: VocabItem[];
  language?: string;
}

const MAX_CARDS = 3;

export function PostReadReview({ vocabulary, language }: PostReadReviewProps) {
  const cards = useMemo(() => {
    const shuffled = [...vocabulary].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, MAX_CARDS);
  }, [vocabulary]);

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [gotIt, setGotIt] = useState<boolean[]>([]);

  const isZh = language === 'zh';
  const isKo = language === 'ko';
  const wordFont = isZh ? 'font-chinese' : isKo ? 'font-korean' : '';

  const advance = (remembered: boolean) => {
    const next = [...gotIt, remembered];
    setGotIt(next);
    if (index + 1 >= cards.length) {
      setDone(true);
    } else {
      setFlipped(false);
      setTimeout(() => setIndex(i => i + 1), 120);
    }
  };

  const restart = () => {
    setIndex(0);
    setFlipped(false);
    setDone(false);
    setGotIt([]);
  };

  if (cards.length === 0) return null;

  const card = cards[index];

  return (
    <section className="mt-14 pt-8 border-t border-border">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-bold font-serif text-foreground flex items-center gap-2">
          <BookMarked className="w-4 h-4 text-accent" />
          Quick recall
        </h3>
        {!done && (
          <span className="text-xs text-muted-foreground font-medium">
            {index + 1} / {cards.length}
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center text-center py-10 px-6 bg-card border border-border/60 rounded-2xl"
          >
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <p className="font-serif font-bold text-foreground text-lg mb-1">
              {gotIt.filter(Boolean).length === cards.length ? 'Perfect recall!' : 'Review done'}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              {gotIt.filter(Boolean).length} of {cards.length} words remembered
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
              <Link
                href="/vocabulary"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
              >
                Review all vocabulary
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={restart}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:border-accent/30 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Try again
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.18 }}
          >
            {/* Progress dots */}
            <div className="flex gap-1.5 justify-center mb-5">
              {cards.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    i < index
                      ? 'w-4 bg-accent/60'
                      : i === index
                      ? 'w-6 bg-accent'
                      : 'w-1.5 bg-border'
                  )}
                />
              ))}
            </div>

            {/* Card */}
            <div
              className="relative bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm min-h-[180px] flex flex-col"
            >
              {/* Front — word */}
              <div className="flex-1 flex flex-col items-center justify-center px-8 pt-10 pb-6">
                <p className={cn('text-4xl font-bold text-foreground text-center mb-2', wordFont)}>
                  {card.korean}
                </p>
                {!flipped && card.romanization && (
                  <p className="text-sm text-muted-foreground/60">{card.romanization}</p>
                )}
              </div>

              {/* Reveal / Back */}
              <AnimatePresence>
                {!flipped ? (
                  <motion.div
                    key="front-cta"
                    initial={false}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="px-6 pb-6 flex justify-center"
                  >
                    <button
                      onClick={() => setFlipped(true)}
                      className="px-6 py-2.5 rounded-xl text-sm font-semibold border border-accent/30 text-accent hover:bg-accent/10 transition-colors"
                    >
                      Reveal meaning
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="back"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-border/40 px-6 py-4 bg-secondary/30"
                  >
                    {card.romanization && (
                      <p className="text-xs font-mono text-accent mb-1">{card.romanization}</p>
                    )}
                    <p className="text-base font-semibold text-foreground mb-1">{card.english}</p>
                    {card.partOfSpeech && (
                      <p className="text-xs text-muted-foreground capitalize mb-3">{card.partOfSpeech}</p>
                    )}
                    {card.exampleSentence && (
                      <p className={cn('text-xs text-muted-foreground leading-relaxed mb-4 italic', wordFont)}>
                        {card.exampleSentence}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => advance(true)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold bg-green-500/10 text-green-700 hover:bg-green-500/20 border border-green-500/20 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Got it
                      </button>
                      <button
                        onClick={() => advance(false)}
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:border-accent/30 hover:text-foreground transition-all"
                      >
                        Not quite
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
