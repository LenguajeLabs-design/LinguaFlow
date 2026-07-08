import { useState } from 'react';
import { ArrowLeft, Bookmark, Volume2, ChevronDown, ChevronUp, Lock } from 'lucide-react';
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
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Generator
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
            <Bookmark className="w-4 h-4" />
            <span>Save</span>
          </button>
        </div>
      </div>

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

      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center">
        <p className="font-semibold text-foreground mb-1">Ready to keep going?</p>
        <p className="text-sm text-muted-foreground mb-4">
          Create a free account to generate unlimited stories, save your reading library, and track vocabulary.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/sign-up"
            className="px-6 py-3 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-sm"
          >
            Create free account
          </Link>
          <button
            onClick={() => setAuthPrompt('generate')}
            className="px-6 py-3 rounded-xl font-medium border border-border text-foreground hover:border-primary/30 transition-all text-sm"
          >
            Generate another story
          </button>
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
