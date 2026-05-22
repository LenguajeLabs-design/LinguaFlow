import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Volume2, VolumeX, Eye, BookOpen, Layout, Bookmark, Type,
  FileText, HelpCircle, CheckCircle2, Languages, List
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Passage, ChineseToken } from '@workspace/api-client-react';
import { DifficultyBadge } from './DifficultyBadge';
import { ChineseWordPopover } from './ChineseWordPopover';
import { useTTS } from '@/hooks/use-tts';
import { cn } from '@/components/layout/AppLayout';
import { useSavePassage, useToggleBookmark, getListPassagesQueryKey, getGetPassageQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useSettings, fontSizeMap } from '@/hooks/use-settings';

type ViewMode = 'hanzi' | 'pinyin' | 'study' | 'full';

interface ChinesePassageReaderProps {
  passage: Passage;
  isUnsaved?: boolean;
  onSaved?: (saved: Passage) => void;
}

function groupTokensBySentence(tokens: ChineseToken[]): ChineseToken[][] {
  const groups: ChineseToken[][] = [];
  let current: ChineseToken[] = [];
  const sentenceEnders = new Set(['。', '！', '？', '…', '!', '?']);

  for (const token of tokens) {
    current.push(token);
    if (token.type === 'punct' && sentenceEnders.has(token.hanzi)) {
      if (current.length > 0) {
        groups.push(current);
        current = [];
      }
    }
  }
  if (current.length > 0 && current.some(t => t.type === 'word')) groups.push(current);
  return groups;
}

export function ChinesePassageReader({ passage, isUnsaved = false, onSaved }: ChinesePassageReaderProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('study');
  const [expandedSentences, setExpandedSentences] = useState<Set<number>>(new Set());
  const [activeToken, setActiveToken] = useState<{ token: ChineseToken; anchorRect: DOMRect; context: string } | null>(null);
  const [revealedAnswers, setRevealedAnswers] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  const { toggle: toggleTTS, isPlaying, stop: stopTTS } = useTTS();
  const { fontSize } = useSettings();
  const queryClient = useQueryClient();
  const saveMutation = useSavePassage();
  const bookmarkMutation = useToggleBookmark();

  useEffect(() => () => stopTTS(), [stopTTS]);

  const tokens: ChineseToken[] = (passage.tokens as ChineseToken[]) ?? [];
  const sentenceGroups = groupTokensBySentence(tokens);
  const sentences = passage.sentences;

  const comprehensionQuestions = passage.comprehensionQuestions as Array<{ question: string; answer: string }> | undefined;
  const summary = passage.summary;

  const handleTokenClick = useCallback((e: React.MouseEvent, token: ChineseToken, sentenceIdx: number) => {
    e.stopPropagation();
    if (token.type === 'punct' || !token.meaning) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const context = sentences[sentenceIdx]?.korean ?? '';
    setActiveToken({ token, anchorRect: rect, context });
  }, [sentences]);

  const toggleSentence = (idx: number) => {
    setExpandedSentences(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  const toggleAnswer = (idx: number) => {
    setRevealedAnswers(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
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
    { id: 'hanzi',  label: 'Hanzi',    icon: Eye,       tooltip: 'Characters only — no distractions' },
    { id: 'pinyin', label: '+ Pinyin', icon: Languages, tooltip: 'Hanzi with pinyin shown above each word' },
    { id: 'study',  label: 'Study',    icon: BookOpen,  tooltip: 'Tap each sentence to reveal translation' },
    { id: 'full',   label: 'Full',     icon: Layout,    tooltip: 'All translations always visible' },
  ] as const;

  const showPinyin = viewMode === 'pinyin' || viewMode === 'full';
  const showTranslation = (idx: number) => viewMode === 'full' || (viewMode === 'study' && expandedSentences.has(idx));

  const chineseFontClass = cn('font-chinese text-foreground leading-relaxed', fontSizeMap[fontSize]);

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
                    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-[0.6rem] text-xs sm:text-sm font-medium transition-all duration-200',
                    isActive ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <mode.icon className={cn('w-3.5 h-3.5', isActive && 'text-accent')} />
                  <span className="hidden sm:inline">{mode.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
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

            <button
              onClick={() => toggleTTS(passage.koreanText)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all',
                isPlaying
                  ? 'bg-accent/10 text-accent border-accent/30'
                  : 'bg-card text-foreground border-border hover:border-primary/30'
              )}
            >
              {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{isPlaying ? 'Stop' : 'Listen'}</span>
            </button>

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
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-600 border border-red-500/20">
            {passage.difficulty?.toUpperCase()}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground capitalize">
            {passage.topic}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border border-border text-muted-foreground capitalize">
            {passage.readingStyle}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-chinese font-bold text-foreground leading-tight">
          {passage.title}
        </h1>
        {summary && (
          <div className="flex items-start gap-2 text-left max-w-lg mx-auto bg-secondary/40 rounded-xl px-4 py-3">
            <FileText className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-sm font-serif text-muted-foreground leading-relaxed">{summary}</p>
          </div>
        )}
      </header>

      {/* ── Images ── */}
      {passage.imageUrls && passage.imageUrls.length > 0 && (
        <div className="mb-10 overflow-hidden rounded-2xl shadow-sm">
          <img
            src={passage.imageUrls[0]}
            alt={passage.topic}
            className="w-full h-52 object-cover"
          />
        </div>
      )}

      {/* ── Passage Text ── */}
      <div className="bg-card border border-border/60 rounded-2xl p-6 sm:p-8 shadow-sm mb-10">
        {sentenceGroups.length > 0 ? (
          sentenceGroups.map((group, sIdx) => (
            <div key={sIdx} className="mb-6 last:mb-0">
              {/* Token display */}
              <div className={cn('flex flex-wrap gap-x-1 gap-y-2', showPinyin ? 'items-end' : 'items-baseline')}>
                {group.map((token, tIdx) => {
                  if (token.type === 'punct') {
                    return (
                      <span key={tIdx} className={cn(chineseFontClass, 'select-none')}>
                        {token.hanzi}
                      </span>
                    );
                  }
                  return (
                    <button
                      key={tIdx}
                      onClick={(e) => handleTokenClick(e, token, sIdx)}
                      className={cn(
                        'inline-flex flex-col items-center cursor-pointer rounded-lg transition-all duration-150',
                        showPinyin ? 'px-0.5 py-0.5 hover:bg-accent/10' : 'px-0.5 hover:bg-accent/10 hover:text-accent'
                      )}
                    >
                      {showPinyin && (
                        <span className="text-[0.6rem] text-accent leading-none mb-0.5 font-medium tracking-tight">
                          {token.pinyin}
                        </span>
                      )}
                      <span className={cn(chineseFontClass, 'leading-none')}>{token.hanzi}</span>
                    </button>
                  );
                })}
              </div>

              {/* Sentence-level pinyin (full mode) */}
              {viewMode === 'full' && sentences[sIdx]?.pinyin && (
                <p className="mt-1.5 text-xs text-muted-foreground/70 italic leading-relaxed">
                  {sentences[sIdx].pinyin}
                </p>
              )}

              {/* Translation */}
              <AnimatePresence>
                {showTranslation(sIdx) && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 text-sm text-muted-foreground italic leading-relaxed pl-1 border-l-2 border-accent/30"
                  >
                    {sentences[sIdx]?.english}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Study mode tap button */}
              {viewMode === 'study' && (
                <button
                  onClick={() => toggleSentence(sIdx)}
                  className="mt-1.5 text-xs text-accent/70 hover:text-accent transition-colors"
                >
                  {expandedSentences.has(sIdx) ? '▲ Hide translation' : '▼ Show translation'}
                </button>
              )}
            </div>
          ))
        ) : (
          /* Fallback: render sentence-by-sentence without tokens */
          sentences.map((s, idx) => (
            <div key={idx} className="mb-6 last:mb-0">
              <p className={cn(chineseFontClass, 'leading-loose')}>{s.korean}</p>
              {showPinyin && s.pinyin && (
                <p className="mt-1 text-xs text-muted-foreground/70 italic">{s.pinyin}</p>
              )}
              <AnimatePresence>
                {showTranslation(idx) && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 text-sm text-muted-foreground italic leading-relaxed pl-1 border-l-2 border-accent/30"
                  >
                    {s.english}
                  </motion.p>
                )}
              </AnimatePresence>
              {viewMode === 'study' && (
                <button onClick={() => toggleSentence(idx)} className="mt-1.5 text-xs text-accent/70 hover:text-accent transition-colors">
                  {expandedSentences.has(idx) ? '▲ Hide translation' : '▼ Show translation'}
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* ── Vocabulary ── */}
      {passage.vocabulary && passage.vocabulary.length > 0 && (
        <section className="mb-10">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground mb-4">
            <List className="w-5 h-5 text-accent" /> Key Vocabulary
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {passage.vocabulary.map((word, idx) => (
              <div key={idx} className="bg-card border border-border/60 rounded-xl px-4 py-3 flex items-start gap-3 shadow-sm">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-chinese font-bold text-foreground text-lg leading-none">{word.korean}</span>
                    <span className="text-xs text-accent font-medium">{word.romanization}</span>
                    <span className="text-xs text-muted-foreground/70 italic">{word.partOfSpeech}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{word.english}</p>
                  {word.exampleSentence && (
                    <p className="text-xs text-muted-foreground/60 font-chinese mt-1 leading-snug">{word.exampleSentence}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Comprehension Questions ── */}
      {comprehensionQuestions && comprehensionQuestions.length > 0 && (
        <section className="mb-10">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground mb-4">
            <HelpCircle className="w-5 h-5 text-accent" /> Comprehension
          </h2>
          <div className="space-y-4">
            {comprehensionQuestions.map((q, idx) => (
              <div key={idx} className="bg-card border border-border/60 rounded-2xl p-5 shadow-sm">
                <p className={cn('font-chinese font-medium text-foreground mb-3', fontSizeMap[fontSize] === fontSizeMap.xlarge ? 'text-lg' : 'text-base')}>
                  {idx + 1}. {q.question}
                </p>
                <AnimatePresence>
                  {revealedAnswers.has(idx) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-start gap-2 p-3 bg-accent/8 rounded-xl border border-accent/20"
                    >
                      <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                      <p className="text-sm font-chinese text-foreground">{q.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
                <button
                  onClick={() => toggleAnswer(idx)}
                  className={cn(
                    'mt-3 text-sm font-medium px-4 py-2 rounded-xl border transition-all',
                    revealedAnswers.has(idx)
                      ? 'text-muted-foreground border-border hover:border-primary/30'
                      : 'text-accent border-accent/30 bg-accent/5 hover:bg-accent/10'
                  )}
                >
                  {revealedAnswers.has(idx) ? 'Hide Answer' : 'Reveal Answer'}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Word Popover */}
      {activeToken && (
        <ChineseWordPopover
          token={activeToken.token}
          context={activeToken.context}
          passageId={passage.id}
          difficulty={passage.difficulty}
          anchorRect={activeToken.anchorRect}
          onClose={() => setActiveToken(null)}
        />
      )}
    </div>
  );
}
