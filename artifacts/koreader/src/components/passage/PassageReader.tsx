import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Volume2, Pause, Square, Eye, EyeOff, BookOpen, Layout, Bookmark,
  Type, ChevronDown, ChevronUp, List, FileText, HelpCircle, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Passage } from '@workspace/api-client-react';
import { DifficultyBadge } from './DifficultyBadge';
import { WordPopover } from './WordPopover';
import { useOpenAITTS } from '@/hooks/use-openai-tts';
import { cn } from '@/lib/utils';
import { useSavePassage, useToggleBookmark } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { getListPassagesQueryKey, getGetPassageQueryKey } from '@workspace/api-client-react';
import { useSettings, fontSizeMap } from '@/hooks/use-settings';

type ViewMode = 'reading' | 'study' | 'full';

interface PassageReaderProps {
  passage: Passage;
  isUnsaved?: boolean;
  onSaved?: (savedPassage: Passage) => void;
}

export function PassageReader({ passage, isUnsaved = false, onSaved }: PassageReaderProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('study');
  const [expandedSentences, setExpandedSentences] = useState<Set<number>>(new Set());
  const [allExpanded, setAllExpanded] = useState(false);
  const [activeWord, setActiveWord] = useState<{ word: string; context: string; anchorRect: DOMRect } | null>(null);
  const [revealedAnswers, setRevealedAnswers] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  const { toggle: toggleTTS, isPlaying, isLoading: ttsLoading, hasAudio: ttsHasAudio, stop: stopTTS } = useOpenAITTS(passage.language ?? 'ko');
  const { fontSize } = useSettings();
  const queryClient = useQueryClient();

  const saveMutation = useSavePassage();
  const bookmarkMutation = useToggleBookmark();

  useEffect(() => () => stopTTS(), [stopTTS]);

  const handleWordClick = useCallback((e: React.MouseEvent<HTMLSpanElement>, word: string, context: string) => {
    e.stopPropagation();
    const cleaned = word.replace(/[.,!?"""''·…—\-「」『』]/g, '').trim();
    if (!cleaned) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveWord({ word: cleaned, context, anchorRect: rect });
  }, []);

  const toggleSentence = (index: number) => {
    setExpandedSentences(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleAll = () => {
    if (allExpanded) {
      setExpandedSentences(new Set());
      setAllExpanded(false);
    } else {
      setExpandedSentences(new Set(passage.sentences.map((_, i) => i)));
      setAllExpanded(true);
    }
  };

  const toggleAnswer = (index: number) => {
    setRevealedAnswers(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleSave = () => {
    if (!isUnsaved) return;
    saveMutation.mutate(
      { data: passage as any },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: getListPassagesQueryKey() });
          if (onSaved) onSaved(data);
        }
      }
    );
  };

  const handleBookmark = () => {
    if (isUnsaved) return;
    bookmarkMutation.mutate(
      { id: passage.id, data: { isBookmarked: !passage.isBookmarked } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetPassageQueryKey(passage.id) });
          queryClient.invalidateQueries({ queryKey: getListPassagesQueryKey() });
        }
      }
    );
  };

  const modes = [
    { id: 'reading', label: 'Reading', icon: Eye,      tooltip: 'Korean text only — no distractions' },
    { id: 'study',   label: 'Study',   icon: BookOpen, tooltip: 'Tap each sentence to reveal translation' },
    { id: 'full',    label: 'Full',    icon: Layout,   tooltip: 'All translations always visible' },
  ] as const;

  const lang = passage.language ?? 'ko';
  const isKo = lang === 'ko';
  const isZh = lang === 'zh';
  const koreanFontClass = cn(
    'korean-reading-text text-foreground',
    isKo ? 'font-korean' : isZh ? 'font-chinese' : '',
    fontSizeMap[fontSize],
  );
  const comprehensionQuestions = (passage as any).comprehensionQuestions as Array<{ question: string; answer: string }> | undefined;
  const summary = (passage as any).summary as string | undefined;

  return (
    <div className="max-w-2xl mx-auto pb-28 md:pb-16" ref={containerRef}>

      {/* ── Sticky toolbar ── */}
      <div className="sticky top-14 z-30 -mx-4 sm:mx-0 mb-8 px-4 sm:px-0 pt-3 pb-3 bg-background/95 backdrop-blur-md border-b border-border/40">
        <div className="flex flex-wrap items-center justify-between gap-3">

          {/* View mode pills */}
          <div className="flex bg-secondary/60 p-0.5 rounded-xl gap-0.5">
            {modes.map(mode => {
              const isActive = viewMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id)}
                  title={mode.tooltip}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-[0.6rem] text-xs sm:text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <mode.icon className={cn('w-3.5 h-3.5', isActive && 'text-accent')} />
                  {mode.label}
                </button>
              );
            })}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Font size quick-cycle */}
            <button
              title="Cycle font size"
              onClick={() => {
                const { fontSize: fs, setFontSize } = useSettings.getState();
                const cycle: Record<string, 'normal' | 'large' | 'xlarge'> = { normal: 'large', large: 'xlarge', xlarge: 'normal' };
                setFontSize(cycle[fs]);
              }}
              className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
            >
              <Type className="w-4 h-4" />
            </button>

            {/* TTS */}
            <button
              onClick={() => toggleTTS(passage.koreanText)}
              disabled={ttsLoading}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all',
                ttsLoading
                  ? 'bg-card text-muted-foreground border-border opacity-70 cursor-wait'
                  : isPlaying
                    ? 'bg-accent/10 text-accent border-accent/30'
                    : 'bg-card text-foreground border-border hover:border-primary/30'
              )}
            >
              {ttsLoading ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {ttsLoading ? 'Loading…' : isPlaying ? 'Pause' : ttsHasAudio ? 'Resume' : 'Listen'}
              </span>
            </button>
            {ttsHasAudio && (
              <button
                onClick={stopTTS}
                title="Stop"
                className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            )}

            {/* Save / Bookmark */}
            {isUnsaved ? (
              <button
                onClick={handleSave}
                disabled={saveMutation.isPending}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {saveMutation.isPending ? <span className="animate-pulse">Saving…</span> : 'Save'}
              </button>
            ) : (
              <button
                onClick={handleBookmark}
                disabled={bookmarkMutation.isPending}
                title={passage.isBookmarked ? 'Remove from favorites' : 'Add to favorites'}
                className={cn(
                  'p-2 rounded-xl border transition-all',
                  passage.isBookmarked
                    ? 'bg-accent/10 border-accent/30 text-accent'
                    : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/30'
                )}
              >
                <Bookmark className={cn('w-4 h-4', passage.isBookmarked && 'fill-current')} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Title & meta ── */}
      <header className="mb-8 text-center space-y-3">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <DifficultyBadge difficulty={passage.difficulty} />
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground capitalize">
            {passage.topic}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border border-border text-muted-foreground capitalize">
            {passage.readingStyle}
          </span>
        </div>
        <h1 className={cn('text-2xl sm:text-3xl font-bold text-foreground leading-tight text-balance', isKo ? 'font-korean' : isZh ? 'font-chinese' : 'font-serif')}>
          {passage.title}
        </h1>
        {/* English summary */}
        {summary && (
          <div className="flex items-start gap-2 text-left max-w-lg mx-auto bg-secondary/40 rounded-xl px-4 py-3 mt-1">
            <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-sm font-serif text-muted-foreground leading-relaxed">{summary}</p>
          </div>
        )}
      </header>

      {/* ── Study mode show/hide all ── */}
      {viewMode === 'study' && (
        <div className="flex justify-end mb-3">
          <button
            onClick={toggleAll}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 rounded-full border border-border hover:border-primary/30"
          >
            {allExpanded
              ? <><EyeOff className="w-3.5 h-3.5" /> Hide all</>
              : <><Eye className="w-3.5 h-3.5" /> Show all translations</>
            }
          </button>
        </div>
      )}

      {/* ── Reading content ── */}
      <article
        className="space-y-7 reading-mode-article"
        onClick={() => setActiveWord(null)}
      >
        {passage.sentences.map((sentence, idx) => (
          <div key={idx} className="group">
            {/* Korean text — word-clickable */}
            <p className={koreanFontClass}>
              {sentence.korean.split(' ').map((word, wIdx) => (
                <span
                  key={wIdx}
                  onClick={(e) => handleWordClick(e, word, sentence.korean)}
                  className="inline cursor-pointer rounded px-0.5 -mx-0.5 transition-colors duration-100 hover:bg-primary/10 hover:text-primary active:bg-primary/20"
                >
                  {word}{' '}
                </span>
              ))}
            </p>

            {/* Translation */}
            {viewMode !== 'reading' && (
              <div className="mt-2">
                {viewMode === 'study' && !expandedSentences.has(idx) ? (
                  <button
                    onClick={() => toggleSentence(idx)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground/50 hover:text-primary transition-colors py-1 group/btn"
                  >
                    <ChevronDown className="w-3.5 h-3.5 group-hover/btn:translate-y-0.5 transition-transform" />
                    Show translation
                  </button>
                ) : (
                  <AnimatePresence initial={false}>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <div className="pl-3 border-l-2 border-primary/20 mt-2">
                        <p className="font-serif text-sm sm:text-base text-muted-foreground leading-relaxed">
                          {sentence.english}
                        </p>
                        {viewMode === 'study' && (
                          <button
                            onClick={() => toggleSentence(idx)}
                            className="flex items-center gap-1 text-xs text-muted-foreground/40 hover:text-muted-foreground mt-1.5 transition-colors"
                          >
                            <ChevronUp className="w-3 h-3" /> Hide
                          </button>
                        )}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            )}
          </div>
        ))}
      </article>

      {/* ── Vocabulary section ── */}
      {viewMode !== 'reading' && passage.vocabulary && passage.vocabulary.length > 0 && (
        <section className="mt-14 pt-8 border-t border-border">
          <h3 className="text-base font-bold font-serif text-foreground mb-5 flex items-center gap-2">
            <List className="w-4 h-4 text-primary" />
            Vocabulary · 어휘
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {passage.vocabulary.map((vocab, idx) => (
              <div
                key={idx}
                className="bg-card border border-border/50 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-baseline gap-2">
                    <span className={cn('font-bold text-foreground', isKo ? 'font-korean' : isZh ? 'font-chinese' : '')}>{vocab.korean}</span>
                    <span className="text-xs font-mono text-muted-foreground">{vocab.romanization}</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded shrink-0 ml-1">
                    {vocab.partOfSpeech}
                  </span>
                </div>
                <p className="text-sm font-serif text-foreground font-medium mb-2">{vocab.english}</p>
                {vocab.exampleSentence && (
                  <p className={cn('text-xs text-muted-foreground bg-secondary/50 px-3 py-2 rounded-lg leading-relaxed', isKo ? 'font-korean' : isZh ? 'font-chinese' : '')}>
                    {vocab.exampleSentence}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Comprehension questions ── */}
      {viewMode !== 'reading' && comprehensionQuestions && comprehensionQuestions.length > 0 && (
        <section className="mt-10 pt-8 border-t border-border">
          <h3 className="text-base font-bold font-serif text-foreground mb-5 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-primary" />
            Comprehension · 이해 확인
          </h3>
          <div className="space-y-4">
            {comprehensionQuestions.map((q, idx) => (
              <div key={idx} className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm">
                <div className="px-4 py-3 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className={cn('text-foreground leading-relaxed pt-0.5', isKo ? 'font-korean' : isZh ? 'font-chinese' : '')}>{q.question}</p>
                </div>
                <div className="border-t border-border/40">
                  {revealedAnswers.has(idx) ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="px-4 py-3 flex items-start gap-3 bg-secondary/30"
                    >
                      <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className={cn('text-foreground text-sm leading-relaxed', isKo ? 'font-korean' : isZh ? 'font-chinese' : '')}>{q.answer}</p>
                        <button
                          onClick={() => toggleAnswer(idx)}
                          className="text-xs text-muted-foreground/50 hover:text-muted-foreground mt-2 transition-colors"
                        >
                          Hide answer
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <button
                      onClick={() => toggleAnswer(idx)}
                      className="w-full px-4 py-2.5 text-left text-xs text-muted-foreground/60 hover:text-primary hover:bg-secondary/30 transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-3.5 h-3.5" /> Show answer
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Word popover ── */}
      <WordPopover
        word={activeWord?.word || ''}
        contextSentence={activeWord?.context || ''}
        difficulty={passage.difficulty}
        language={passage.language}
        supportLanguage={(passage as any).supportLanguage}
        anchorRect={activeWord?.anchorRect || null}
        onClose={() => setActiveWord(null)}
      />
    </div>
  );
}
