import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, BookOpen } from 'lucide-react';
import { useGlossWord } from '@workspace/api-client-react';
import { cn } from '@/components/layout/AppLayout';

interface WordPopoverProps {
  word: string;
  contextSentence: string;
  difficulty: string;
  position: { x: number; y: number } | null;
  onClose: () => void;
}

export function WordPopover({ word, contextSentence, difficulty, position, onClose }: WordPopoverProps) {
  const [hasFetched, setHasFetched] = useState(false);
  
  const glossMutation = useGlossWord();

  useEffect(() => {
    if (word && position && !hasFetched) {
      setHasFetched(true);
      glossMutation.mutate({
        data: {
          word,
          context: contextSentence,
          difficulty
        }
      });
    }
  }, [word, position]);

  // Reset fetch state when word changes
  useEffect(() => {
    setHasFetched(false);
  }, [word]);

  if (!position || !word) return null;

  // Determine if popover should open upwards or downwards
  const isBottomHalf = position.y > window.innerHeight / 2;
  const top = isBottomHalf ? 'auto' : `${position.y + 10}px`;
  const bottom = isBottomHalf ? `${window.innerHeight - position.y + 10}px` : 'auto';
  
  // Center horizontally relative to click, but keep within viewport bounds
  let left = position.x - 160; // 320px width / 2
  if (left < 16) left = 16;
  if (left + 320 > window.innerWidth - 16) left = window.innerWidth - 336;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 pointer-events-auto sm:pointer-events-none"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-background/20 backdrop-blur-[2px] sm:hidden" />
        
        <motion.div
          initial={{ opacity: 0, y: isBottomHalf ? 10 : -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          style={{ top, bottom, left }}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "fixed w-[calc(100vw-32px)] sm:w-[320px] bg-card rounded-2xl shadow-xl shadow-black/10 border border-border/80 overflow-hidden pointer-events-auto",
            isBottomHalf ? "origin-bottom" : "origin-top"
          )}
        >
          <div className="flex items-start justify-between p-4 pb-3 border-b border-border/50 bg-secondary/30">
            <div>
              <h3 className="text-2xl font-korean font-bold text-foreground leading-none">{word}</h3>
              {glossMutation.data?.romanization && (
                <p className="text-sm text-muted-foreground mt-1 font-mono">{glossMutation.data.romanization}</p>
              )}
            </div>
            <button 
              onClick={onClose}
              className="p-1 -mr-1 -mt-1 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 min-h-[120px]">
            {glossMutation.isPending && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground py-6">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Looking up dictionary...</span>
              </div>
            )}

            {glossMutation.isError && (
              <div className="text-center py-6 text-destructive text-sm">
                Failed to load dictionary definition.
              </div>
            )}

            {glossMutation.isSuccess && glossMutation.data && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-accent bg-accent/10 px-1.5 py-0.5 rounded">
                      {glossMutation.data.partOfSpeech}
                    </span>
                  </div>
                  <p className="text-lg font-serif font-medium text-foreground">
                    {glossMutation.data.englishMeaning}
                  </p>
                </div>

                {glossMutation.data.grammarNote && (
                  <div className="bg-secondary/50 rounded-lg p-3 text-sm">
                    <div className="flex items-center gap-1.5 text-primary font-medium mb-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Grammar Note</span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {glossMutation.data.grammarNote}
                    </p>
                  </div>
                )}

                {glossMutation.data.exampleSentence && (
                  <div className="pt-2 border-t border-border/50">
                    <p className="font-korean text-foreground leading-relaxed">
                      {glossMutation.data.exampleSentence}
                    </p>
                    <p className="text-sm font-serif text-muted-foreground mt-1">
                      {glossMutation.data.exampleTranslation}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
