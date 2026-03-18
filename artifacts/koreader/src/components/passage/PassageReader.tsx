import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Eye, BookOpen, Layout, CheckCircle2, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Passage } from '@workspace/api-client-react';
import { DifficultyBadge } from './DifficultyBadge';
import { WordPopover } from './WordPopover';
import { useTTS } from '@/hooks/use-tts';
import { cn } from '@/components/layout/AppLayout';
import { useSavePassage, useToggleBookmark } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { getListPassagesQueryKey, getGetPassageQueryKey } from '@workspace/api-client-react';

type ViewMode = 'reading' | 'study' | 'full';

interface PassageReaderProps {
  passage: Passage;
  isUnsaved?: boolean;
  onSaved?: (savedPassage: Passage) => void;
}

export function PassageReader({ passage, isUnsaved = false, onSaved }: PassageReaderProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('study');
  const [expandedSentences, setExpandedSentences] = useState<Set<number>>(new Set());
  const [activeWord, setActiveWord] = useState<{word: string, context: string, pos: {x: number, y: number}} | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { toggle: toggleTTS, isPlaying, stop: stopTTS } = useTTS();
  const queryClient = useQueryClient();

  const saveMutation = useSavePassage();
  const bookmarkMutation = useToggleBookmark();

  // Clean up TTS when unmounting
  useEffect(() => {
    return () => stopTTS();
  }, [stopTTS]);

  const handleWordClick = (e: React.MouseEvent<HTMLSpanElement>, word: string, context: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveWord({
      word: word.replace(/[.,!?“”"']/g, ''), // Strip basic punctuation
      context,
      pos: { x: rect.left + rect.width / 2, y: rect.bottom }
    });
  };

  const toggleSentence = (index: number) => {
    setExpandedSentences(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleSave = () => {
    if (!isUnsaved) return;
    saveMutation.mutate(
      { data: passage as any }, // Assuming structure matches CreatePassageRequest
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: getListPassagesQueryKey() });
          if (onSaved) onSaved(data);
        }
      }
    );
  };

  const handleBookmark = () => {
    if (isUnsaved) return; // Can't bookmark unsaved
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
    { id: 'reading', label: 'Reading', icon: Eye },
    { id: 'study', label: 'Study', icon: BookOpen },
    { id: 'full', label: 'Full View', icon: Layout },
  ] as const;

  return (
    <div className="max-w-3xl mx-auto pb-24" ref={containerRef}>
      {/* Header & Controls */}
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-md py-4 mb-8 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex bg-secondary/50 p-1 rounded-xl w-fit">
          {modes.map(mode => {
            const isActive = viewMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <mode.icon className={cn("w-4 h-4", isActive && "text-primary")} />
                <span className="hidden sm:inline">{mode.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleTTS(passage.koreanText)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200",
              isPlaying 
                ? "bg-accent/10 text-accent border-accent/20" 
                : "bg-card text-foreground border-border hover:border-primary/30"
            )}
          >
            {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            {isPlaying ? 'Stop' : 'Listen'}
          </button>

          {isUnsaved ? (
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground shadow-md hover:bg-primary/90 transition-all duration-200 disabled:opacity-50"
            >
              {saveMutation.isPending ? <span className="animate-pulse">Saving...</span> : 'Save to Library'}
            </button>
          ) : (
            <button
              onClick={handleBookmark}
              disabled={bookmarkMutation.isPending}
              className={cn(
                "p-2 rounded-xl border transition-all duration-200",
                passage.isBookmarked 
                  ? "bg-accent/10 border-accent/20 text-accent" 
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
              )}
            >
              <Bookmark className={cn("w-5 h-5", passage.isBookmarked && "fill-current")} />
            </button>
          )}
        </div>
      </div>

      {/* Title & Meta */}
      <header className="mb-10 text-center space-y-4">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <DifficultyBadge difficulty={passage.difficulty} />
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
            {passage.topic}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border border-border text-muted-foreground">
            {passage.readingStyle}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-korean font-bold text-foreground leading-tight text-balance">
          {passage.title}
        </h1>
      </header>

      {/* Images (if any) */}
      {passage.imageUrls && passage.imageUrls.length > 0 && (
        <div className="mb-12 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl overflow-hidden shadow-sm">
          {passage.imageUrls.map((url, i) => (
            <img 
              key={i} 
              src={url} 
              alt="Passage illustration" 
              className={cn("w-full h-64 object-cover", passage.imageUrls.length === 1 && "sm:col-span-2 sm:h-80")} 
            />
          ))}
        </div>
      )}

      {/* Content Area */}
      <article className="space-y-8">
        {passage.sentences.map((sentence, idx) => (
          <div key={idx} className="group relative">
            <p className="text-[1.35rem] sm:text-[1.5rem] leading-[2.1] font-korean text-foreground tracking-wide break-keep">
              {sentence.korean.split(' ').map((word, wIdx) => (
                <span 
                  key={wIdx}
                  onClick={(e) => handleWordClick(e, word, sentence.korean)}
                  className="inline-block cursor-pointer hover:bg-primary/10 hover:text-primary rounded px-0.5 -mx-0.5 transition-colors duration-150"
                >
                  {word}{' '}
                </span>
              ))}
            </p>

            {/* Translation block based on view mode */}
            {viewMode !== 'reading' && (
              <div className="mt-3 relative">
                {viewMode === 'study' && !expandedSentences.has(idx) ? (
                  <button 
                    onClick={() => toggleSentence(idx)}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors py-1 opacity-50 hover:opacity-100"
                  >
                    <Eye className="w-4 h-4" /> Show translation
                  </button>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pl-4 border-l-2 border-primary/30"
                  >
                    <p className="font-serif text-lg text-muted-foreground leading-relaxed">
                      {sentence.english}
                    </p>
                    {viewMode === 'study' && (
                      <button 
                        onClick={() => toggleSentence(idx)}
                        className="text-xs font-medium text-muted-foreground/60 hover:text-muted-foreground mt-2 uppercase tracking-widest"
                      >
                        Hide
                      </button>
                    )}
                  </motion.div>
                )}
              </div>
            )}
          </div>
        ))}
      </article>

      {/* Vocabulary Section (hidden in reading mode) */}
      {viewMode !== 'reading' && passage.vocabulary && passage.vocabulary.length > 0 && (
        <section className="mt-20 pt-10 border-t border-border">
          <h3 className="text-xl font-bold font-serif text-foreground mb-6 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Vocabulary Focus
          </h3>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {passage.vocabulary.map((vocab, idx) => (
              <div key={idx} className="bg-card border border-border/60 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-lg font-korean font-bold text-foreground">{vocab.korean}</span>
                    <span className="text-sm font-mono text-muted-foreground ml-2">{vocab.romanization}</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded">
                    {vocab.partOfSpeech}
                  </span>
                </div>
                <p className="font-serif text-foreground font-medium mb-3">{vocab.english}</p>
                {vocab.exampleSentence && (
                  <p className="text-sm text-muted-foreground font-korean bg-secondary/50 p-2 rounded-lg leading-relaxed">
                    {vocab.exampleSentence}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Popover rendered via Portal or inline if high enough z-index */}
      <WordPopover 
        word={activeWord?.word || ''} 
        contextSentence={activeWord?.context || ''}
        difficulty={passage.difficulty}
        position={activeWord?.pos || null} 
        onClose={() => setActiveWord(null)} 
      />
    </div>
  );
}
