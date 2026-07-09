import { useState } from 'react';
import { useLocation } from 'wouter';
import { Sparkles, Loader2, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  useLanguageStore,
  LANGUAGE_CONFIG,
  SUPPORT_LANGUAGE_OPTIONS,
  type AppLanguage,
} from '@/hooks/use-language';
import { useSettings } from '@/hooks/use-settings';
import { usePassageStore } from '@/store/use-passage-store';
import { useGeneratePassage, useSavePassage, getListPassagesQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';

type Level = 'beginner' | 'intermediate' | 'advanced';

const LEVEL_MAP: Record<AppLanguage, Record<Level, string>> = {
  ko: { beginner: 'beginner', intermediate: 'intermediate', advanced: 'advanced' },
  zh: { beginner: 'hsk2', intermediate: 'hsk4', advanced: 'hsk6' },
  es: { beginner: 'a1', intermediate: 'b1', advanced: 'c1' },
  en: { beginner: 'a1', intermediate: 'b1', advanced: 'c1' },
};

const LANGUAGE_OPTIONS: { key: AppLanguage; label: string; native: string; flag: string }[] = [
  { key: 'ko', label: 'Korean', native: '한국어', flag: '🇰🇷' },
  { key: 'zh', label: 'Chinese', native: '普通话', flag: '🇨🇳' },
  { key: 'es', label: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { key: 'en', label: 'English', native: 'English', flag: '🇺🇸' },
];

const LEVELS: { key: Level; title: string; tagline: string }[] = [
  { key: 'beginner', title: 'Beginner', tagline: 'Build my foundation' },
  { key: 'intermediate', title: 'Intermediate', tagline: 'Help me grow' },
  { key: 'advanced', title: 'Advanced', tagline: 'Challenge me' },
];

interface OnboardingProps {
  variant: 'guest' | 'auth';
  onSkip: () => void;
  onComplete: (passage?: any) => void;
}

export function Onboarding({ variant, onSkip, onComplete }: OnboardingProps) {
  const [, setLocation] = useLocation();
  const { language, setLanguage, supportLanguage, setSupportLanguage } = useLanguageStore();
  const { autosave } = useSettings();
  const setGeneratedPassage = usePassageStore((s) => s.setGeneratedPassage);
  const generateMutation = useGeneratePassage();
  const saveMutation = useSavePassage();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<Level | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const langConfig = LANGUAGE_CONFIG[language];
  const totalSteps = 5;

  const next = () => setStep((s) => Math.min(s + 1, totalSteps));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  const handleGenerate = async () => {
    if (!topic.trim() || !level) return;
    setError(null);
    setIsGenerating(true);

    const difficulty = LEVEL_MAP[language][level];
    const payload = {
      topic: topic.trim(),
      difficulty,
      length: 'short' as const,
      readingStyle: langConfig.readingStyles[0].value,
    };

    if (variant === 'guest') {
      try {
        const res = await fetch('/api/guest/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ ...payload, language, supportLanguage }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? 'Something went wrong. Please try again.');
          setIsGenerating(false);
          return;
        }

        const passage = await res.json();
        setIsGenerating(false);
        onComplete({ ...passage, language, supportLanguage });
      } catch {
        setError('Unable to generate right now. Please try again.');
        setIsGenerating(false);
      }
      return;
    }

    generateMutation.mutate(
      { data: { ...payload, language: language as any, supportLanguage: supportLanguage as any } },
      {
        onSuccess: (data: any) => {
          const passageWithLang = { ...data, language, supportLanguage };
          setGeneratedPassage(passageWithLang as any);

          if (autosave) {
            saveMutation.mutate(
              { data: passageWithLang as any },
              {
                onSuccess: (saved: any) => {
                  queryClient.invalidateQueries({ queryKey: getListPassagesQueryKey() });
                  setIsGenerating(false);
                  onComplete();
                  setLocation(`/library/${saved.id}`);
                },
                onError: () => {
                  setIsGenerating(false);
                  onComplete();
                  setLocation('/passage');
                },
              }
            );
          } else {
            setIsGenerating(false);
            onComplete();
            setLocation('/passage');
          }
        },
        onError: () => {
          setIsGenerating(false);
          setError('Something went wrong. Please try again.');
        },
      }
    );
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl">
        {/* Progress + Skip */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i + 1 === step ? 'w-6 bg-primary' : i + 1 < step ? 'w-1.5 bg-primary/50' : 'w-1.5 bg-border'
                )}
              />
            ))}
          </div>
          <button
            onClick={onSkip}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
          >
            {step === 1 && (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 text-accent mb-6 shadow-sm border border-accent/20">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4">
                  Read what you love. At your level.
                </h1>
                <p className="text-lg text-muted-foreground mb-10 max-w-md mx-auto">
                  LinguaFlow creates personalized readings in your target language with support from a
                  language you understand.
                </p>
                <button
                  onClick={next}
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Sparkles className="w-5 h-5" />
                  Create my first reading
                </button>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-2 text-center">
                  What language are you learning?
                </h2>
                <p className="text-muted-foreground text-center mb-8">
                  We'll tailor readings to this language.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
                  {LANGUAGE_OPTIONS.map(({ key, label, native, flag }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setLanguage(key)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 transition-all duration-200 font-medium',
                        language === key
                          ? 'border-primary bg-primary/5 text-foreground shadow-sm'
                          : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
                      )}
                    >
                      <span className="text-2xl">{flag}</span>
                      <span className="text-sm font-semibold">{label}</span>
                      <span className="text-xs opacity-60">{native}</span>
                    </button>
                  ))}
                </div>
                <StepNav onBack={back} onNext={next} />
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-2 text-center">
                  What language helps you understand?
                </h2>
                <p className="text-muted-foreground text-center mb-8 max-w-md mx-auto">
                  We use this for vocabulary, translations, and explanations.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
                  {SUPPORT_LANGUAGE_OPTIONS.map(({ value, label, flag }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setSupportLanguage(value)}
                      className={cn(
                        'flex flex-col items-center gap-1 p-4 rounded-2xl border-2 transition-all duration-200 font-medium',
                        supportLanguage === value
                          ? 'border-primary bg-primary/5 text-foreground shadow-sm'
                          : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
                      )}
                    >
                      <span className="text-xl">{flag}</span>
                      <span className="text-xs font-semibold">{label}</span>
                    </button>
                  ))}
                </div>
                <StepNav onBack={back} onNext={next} />
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-2 text-center">
                  What do you love reading about?
                </h2>
                <p className="text-muted-foreground text-center mb-8">
                  Pick a suggestion or type your own topic.
                </p>
                <div className="bg-card border border-border p-6 rounded-2xl shadow-sm mb-10">
                  <input
                    type="text"
                    placeholder="Type a topic you're curious about…"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-5 py-4 rounded-xl bg-background border-2 border-border text-foreground text-lg placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                  />
                  <div className="mt-4 flex flex-wrap gap-2">
                    {langConfig.topicSuggestions.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTopic(t)}
                        className={cn(
                          'px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200',
                          topic === t
                            ? 'border-primary bg-primary/10 text-foreground'
                            : 'bg-secondary/60 text-muted-foreground border-border hover:border-primary/40 hover:text-foreground hover:bg-secondary'
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <StepNav onBack={back} onNext={next} nextDisabled={!topic.trim()} />
              </div>
            )}

            {step === 5 && (
              <div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-8 text-center">
                  Choose your challenge
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                  {LEVELS.map(({ key, title, tagline }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setLevel(key)}
                      className={cn(
                        'flex flex-col items-center text-center gap-2 p-6 rounded-2xl border-2 transition-all duration-200',
                        level === key
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border bg-card hover:border-primary/40'
                      )}
                    >
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full border-2 flex items-center justify-center mb-1',
                          level === key ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                        )}
                      >
                        {level === key && <Check className="w-4 h-4" />}
                      </div>
                      <span className="font-bold text-foreground">{title}</span>
                      <span className="text-sm text-muted-foreground">{tagline}</span>
                    </button>
                  ))}
                </div>

                {error && (
                  <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm mb-6">
                    {error}
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button
                    onClick={back}
                    disabled={isGenerating}
                    className="px-5 py-4 rounded-2xl font-semibold text-muted-foreground border border-border hover:text-foreground hover:border-primary/30 transition-all disabled:opacity-50"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={!level || isGenerating}
                    className="flex-1 py-4 rounded-2xl font-bold text-lg bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 flex items-center justify-center gap-3"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>Crafting your first reading…</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-6 h-6" />
                        <span>Generate my first reading</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function StepNav({
  onBack,
  onNext,
  nextDisabled,
}: {
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onBack}
        className="px-5 py-4 rounded-2xl font-semibold text-muted-foreground border border-border hover:text-foreground hover:border-primary/30 transition-all"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="flex-1 py-4 rounded-2xl font-bold text-lg bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
      >
        Continue
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
