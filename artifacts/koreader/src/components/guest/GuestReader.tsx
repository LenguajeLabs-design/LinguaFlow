import { useState } from 'react';
import { ArrowLeft, Volume2, ChevronDown, ChevronUp, Lock, BookMarked, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthPromptModal } from './AuthPromptModal';
import { DifficultyBadge } from '@/components/passage/DifficultyBadge';
import { cn } from '@/lib/utils';
import { LANGUAGE_CONFIG, type AppLanguage } from '@/hooks/use-language';
import { Link } from 'wouter';

interface GuestReaderProps {
  passage: any;
  onBack: () => void;
}

const VOCAB_PREVIEW_COUNT = 4;

export function GuestReader({ passage, onBack }: GuestReaderProps) {
  const [expandedSentences, setExpandedSentences] = useState<Set<number>>(new Set());
  const [showAllTranslations, setShowAllTranslations] = useState(false);
  const [authPrompt, setAuthPrompt] = useState<'save' | 'vocab' | 'audio' | 'generate' | null>(null);

  const lang = passage.language as AppLanguage;
  const langConfig = LANGUAGE_CONFIG[lang] ?? LANGUAGE_CONFIG['ko'];
  const sentences: Array<{ korean: string; english: string; pinyin?: string }> = passage.sentences ?? [];
  const vocabulary: Array<{ korean: string; romanization: string; english: string; partOfSpeech: string; exampleSentence?: string }> = passage.vocabulary ?? [];
  const previewVocab = vocabulary.slice(0, VOCAB_PREVIEW_COUNT);
  const hiddenVocabCount = Math.max(0, vocabulary.length - VOCAB_PREVIEW_COUNT);

  const toggleSentence = (i: number) => {
    setExpandedSentences(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const toggleAll = () => {
    if (showAllTranslations) {
      setExpandedSentences(new Set());
      setShowAllTranslations(false);
    } else {
      setExpandedSentences(new Set(sentences.map((_, i) => i)));
      setShowAllTranslations(true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6 px-4">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAuthPrompt('audio')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground border border-border hover:border-primary/30 hover:text-foreground transition-all"
          >
            <Volume2 className="w-4 h-4" />
            <span className="hidden sm:inline">Listen</span>
            <Lock className="w-3 h-3 opacity-50" />
          </button>
          <button
            onClick={() => setAuthPrompt('save')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <BookMarked className="w-4 h-4" />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Passage meta */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-sm font-medium px-2.5 py-1 rounded-full bg-secondary text-muted-foreground border border-border">
            {langConfig.flag} {langConfig.name}
          </span>
          <DifficultyBadge difficulty={passage.difficulty} language={lang} />
          {passage.readingStyle && (
            <span className="text-sm px-2.5 py-1 rounded-full bg-secondary text-muted-foreground border border-border capitalize">
              {passage.readingStyle}
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-3">
          {passage.title}
        </h1>

        {passage.summary && (
          <p className="text-muted-foreground text-sm leading-relaxed border-l-2 border-primary/30 pl-4 italic">
            {passage.summary}
          </p>
        )}
      </div>

      {/* Reading */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Reading</h2>
          <button
            onClick={toggleAll}
            className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
          >
            {showAllTranslations ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {showAllTranslations ? 'Hide all translations' : 'Show all translations'}
          </button>
        </div>

        <div className="space-y-3">
          {sentences.map((sentence, i) => {
            const isExpanded = expandedSentences.has(i);
            return (
              <div key={i} className="group">
                <button
                  type="button"
                  onClick={() => toggleSentence(i)}
                  className="w-full text-left"
                >
                  <p className="text-foreground text-lg leading-relaxed font-medium tracking-wide">
                    {sentence.korean}
                  </p>
                  {sentence.pinyin && (
                    <p className="text-muted-foreground text-sm mt-0.5">{sentence.pinyin}</p>
                  )}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden"
                    >
                      <p className="text-muted-foreground text-sm mt-1 pb-2 border-b border-border/40">
                        {sentence.english}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!isExpanded && (
                  <button
                    onClick={() => toggleSentence(i)}
                    className="text-xs text-muted-foreground/60 hover:text-primary transition-colors mt-0.5 flex items-center gap-1"
                  >
                    <ChevronDown className="w-3 h-3" />
                    Show translation
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Vocabulary preview */}
      {vocabulary.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Vocabulary
            </h2>
            <span className="text-xs text-muted-foreground">{vocabulary.length} words</span>
          </div>

          <div className="space-y-3">
            {previewVocab.map((item, i) => (
              <div key={i} className="flex items-start justify-between gap-4 pb-3 border-b border-border/50 last:border-0 last:pb-0">
                <div>
                  <span className="font-semibold text-foreground text-base">{item.korean}</span>
                  {item.romanization && (
                    <span className="ml-2 text-sm text-muted-foreground">{item.romanization}</span>
                  )}
                </div>
                <div className="text-right min-w-0">
                  <p className="text-sm text-foreground">{item.english}</p>
                  <p className="text-xs text-muted-foreground capitalize">{item.partOfSpeech}</p>
                </div>
              </div>
            ))}
          </div>

          {hiddenVocabCount > 0 && (
            <div className="relative mt-3">
              <div className="pointer-events-none">
                {vocabulary.slice(VOCAB_PREVIEW_COUNT, VOCAB_PREVIEW_COUNT + 2).map((item, i) => (
                  <div key={i} className="flex items-start justify-between gap-4 pb-3 opacity-30 select-none blur-sm">
                    <div>
                      <span className="font-semibold text-foreground text-base">{item.korean}</span>
                    </div>
                    <p className="text-sm text-foreground">{item.english}</p>
                  </div>
                ))}
              </div>
              <div className="absolute inset-x-0 bottom-0 top-0 bg-gradient-to-b from-transparent via-card/80 to-card flex flex-col items-center justify-end pb-2">
                <button
                  onClick={() => setAuthPrompt('vocab')}
                  className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Unlock {hiddenVocabCount} more words — sign up free
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Conversion moment ── */}
      <div className="mt-2 rounded-2xl border border-border overflow-hidden">
        {/* Header band */}
        <div className="px-6 pt-7 pb-5 text-center bg-gradient-to-b from-accent/5 to-transparent">
          <div className="inline-flex w-12 h-12 rounded-2xl items-center justify-center mb-4"
               style={{ background: 'linear-gradient(135deg, hsl(174,62%,42%,0.12), hsl(255,52%,60%,0.12))' }}>
            <BookMarked className="w-5 h-5 text-accent" />
          </div>
          <h2 className="text-xl font-serif font-bold text-foreground mb-2">
            Keep what you learn
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
            Save this passage to your library, tap words to build vocabulary, and listen to it anytime — all free.
          </p>
        </div>

        {/* CTAs */}
        <div className="px-6 pb-6 flex flex-col gap-3">
          <Link
            href="/sign-up"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 hover:shadow-md"
            style={{ background: 'linear-gradient(135deg, hsl(174,62%,42%), hsl(200,68%,52%), hsl(255,52%,60%))' }}
          >
            <Sparkles className="w-4 h-4" />
            Create free account
          </Link>
          <Link
            href="/sign-in"
            className="flex items-center justify-center w-full py-3 rounded-xl text-sm font-semibold bg-secondary text-foreground border border-border hover:border-accent/30 transition-all"
          >
            Sign in
          </Link>
          <div className="text-center pt-1">
            <button
              onClick={() => setAuthPrompt('generate')}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              Or generate another story first →
            </button>
          </div>
        </div>
      </div>

      {authPrompt && (
        <AuthPromptModal
          trigger={authPrompt}
          onClose={() => setAuthPrompt(null)}
        />
      )}
    </div>
  );
}
