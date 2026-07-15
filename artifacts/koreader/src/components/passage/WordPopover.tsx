import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, BookOpen } from 'lucide-react';
import { useGlossWord } from '@workspace/api-client-react';
import { cn } from '@/lib/utils';
import { useSettings } from '@/hooks/use-settings';

interface WordPopoverProps {
  word: string;
  contextSentence: string;
  difficulty: string;
  language?: string;
  supportLanguage?: string;
  anchorRect: DOMRect | null;
  onClose: () => void;
}

const POPOVER_WIDTH = 320;
const POPOVER_OFFSET = 12;

function computePosition(rect: DOMRect): { top?: string; bottom?: string; left: string; openUp: boolean } {
  const viewH = window.innerHeight;
  const viewW = window.innerWidth;
  const spaceBelow = viewH - rect.bottom;
  const openUp = spaceBelow < 260 && rect.top > 260;

  const rawLeft = rect.left + rect.width / 2 - POPOVER_WIDTH / 2;
  const clampedLeft = Math.max(12, Math.min(rawLeft, viewW - POPOVER_WIDTH - 12));

  if (openUp) {
    return {
      bottom: `${viewH - rect.top + POPOVER_OFFSET}px`,
      left: `${clampedLeft}px`,
      openUp: true,
    };
  }
  return {
    top: `${rect.bottom + POPOVER_OFFSET}px`,
    left: `${clampedLeft}px`,
    openUp: false,
  };
}

export function WordPopover({ word, contextSentence, difficulty, language, supportLanguage, anchorRect, onClose }: WordPopoverProps) {
  const { showRomanization } = useSettings();
  const glossMutation = useGlossWord();
  const prevWordRef = useRef('');

  useEffect(() => {
    if (word && anchorRect && word !== prevWordRef.current) {
      prevWordRef.current = word;
      glossMutation.mutate({
        data: {
          word,
          context: contextSentence,
          difficulty,
          ...(language ? { language: language as any } : {}),
          ...(supportLanguage ? { supportLanguage: supportLanguage as any } : {}),
        }
      });
    }
  }, [word, anchorRect]);

  useEffect(() => {
    if (!word) prevWordRef.current = '';
  }, [word]);

  const isOpen = Boolean(word && anchorRect);

  const pos = anchorRect ? computePosition(anchorRect) : null;

  const popover = (
    <AnimatePresence>
      {isOpen && pos && (
        <>
          {/* Dismiss overlay */}
          <div
            className="fixed inset-0 z-50"
            onClick={onClose}
          />

          <motion.div
            key={word}
            initial={{ opacity: 0, y: pos.openUp ? 6 : -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.12 } }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              width: `min(${POPOVER_WIDTH}px, calc(100vw - 24px))`,
              top: pos.top,
              bottom: pos.bottom,
              left: pos.left,
              zIndex: 51,
              transformOrigin: pos.openUp ? 'bottom center' : 'top center',
            }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-2xl shadow-2xl shadow-black/15 border border-border/70 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-start justify-between px-4 pt-4 pb-3 border-b border-border/40 bg-secondary/20">
              <div>
                <h3 className={cn('text-xl font-bold text-foreground leading-tight', language === 'ko' ? 'font-korean' : language === 'zh' ? 'font-chinese' : '')}>{word}</h3>
                {showRomanization && glossMutation.data?.romanization && (
                  <p className="text-xs text-muted-foreground mt-0.5 font-mono tracking-wide">
                    {glossMutation.data.romanization}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-1 -mr-1 -mt-0.5 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 min-h-[100px]">
              {glossMutation.isPending && (
                <div className="flex flex-col items-center justify-center gap-2.5 py-5 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-xs">Looking up…</span>
                </div>
              )}

              {glossMutation.isError && (
                <p className="text-center py-5 text-destructive text-sm">
                  Could not load definition.
                </p>
              )}

              {glossMutation.isSuccess && glossMutation.data && (
                <div className="space-y-3">
                  {/* Part of speech + meaning */}
                  <div>
                    <span className="inline-block text-[10px] uppercase tracking-widest font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded mb-2">
                      {glossMutation.data.partOfSpeech}
                    </span>
                    <p className="text-base font-serif font-medium text-foreground leading-snug">
                      {glossMutation.data.englishMeaning}
                    </p>
                  </div>

                  {/* Grammar note */}
                  {glossMutation.data.grammarNote && (
                    <div className="bg-secondary/60 rounded-lg px-3 py-2.5 text-xs">
                      <div className="flex items-center gap-1.5 text-primary font-semibold mb-1">
                        <BookOpen className="w-3 h-3" />
                        Grammar
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {glossMutation.data.grammarNote}
                      </p>
                    </div>
                  )}

                  {/* Example */}
                  {glossMutation.data.exampleSentence && (
                    <div className="border-t border-border/40 pt-3 space-y-1">
                      <p className={cn('text-sm text-foreground leading-relaxed', language === 'ko' ? 'font-korean' : language === 'zh' ? 'font-chinese' : '')}>
                        {glossMutation.data.exampleSentence}
                      </p>
                      <p className="text-xs font-serif text-muted-foreground leading-relaxed">
                        {glossMutation.data.exampleTranslation}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(popover, document.body);
}
