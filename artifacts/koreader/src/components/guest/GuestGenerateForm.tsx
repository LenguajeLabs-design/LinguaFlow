import { useState } from 'react';
import { Sparkles, Loader2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LANGUAGE_CONFIG, SUPPORT_LANGUAGE_OPTIONS, type AppLanguage, useLanguageStore } from '@/hooks/use-language';

interface GuestGenerateFormProps {
  onGenerated: (passage: any) => void;
}

const LANGUAGES: { key: AppLanguage; label: string; native: string; flag: string }[] = [
  { key: 'ko', label: 'Korean',  native: '한국어',  flag: '🇰🇷' },
  { key: 'zh', label: 'Chinese', native: '普通话',  flag: '🇨🇳' },
  { key: 'es', label: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { key: 'en', label: 'English', native: 'English', flag: '🇺🇸' },
  { key: 'it', label: 'Italian', native: 'Italiano', flag: '🇮🇹' },
];

export function GuestGenerateForm({ onGenerated }: GuestGenerateFormProps) {
  const { language: storedLanguage, setLanguage, supportLanguage, setSupportLanguage } = useLanguageStore();
  const [language, setLocalLanguage] = useState<AppLanguage>(storedLanguage);
  const langConfig = LANGUAGE_CONFIG[language];
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  const [formData, setFormData] = useState({
    topic: '',
    difficulty: langConfig.difficulties[0].value,
    length: 'short' as 'short' | 'medium' | 'long',
    readingStyle: langConfig.readingStyles[0].value,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLanguageChange = (lang: AppLanguage) => {
    const cfg = LANGUAGE_CONFIG[lang];
    setLocalLanguage(lang);
    setLanguage(lang);
    setFormData(prev => ({
      ...prev,
      difficulty: cfg.difficulties[0].value,
      readingStyle: cfg.readingStyles[0].value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.topic.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/guest/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...formData, language, supportLanguage }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 429 && data.code === 'GUEST_LIMIT') {
          setError("You've reached the guest limit. Create a free account to keep reading.");
        } else {
          setError(data.error ?? 'Something went wrong. Please try again.');
        }
        return;
      }

      const passage = await res.json();
      onGenerated({ ...passage, language, supportLanguage });
    } catch {
      setError('Unable to generate right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isZh = language === 'zh';
  const isEs = language === 'es';
  const isEn = language === 'en';
  const isIt = language === 'it';

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-3">
          What do you want to read today?
        </h1>
        <p className="text-muted-foreground text-base">
          Pick a language, enter a topic, and we'll write a passage at your level.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Step 1 — Reading language */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            I want to read in…
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
            {LANGUAGES.map(({ key, label, native, flag }) => (
              <button
                key={key}
                type="button"
                onClick={() => handleLanguageChange(key)}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-3.5 rounded-2xl border-2 transition-all duration-200 font-medium',
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
        </div>

        {/* Step 2 — Topic */}
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm">
          <label className="block text-sm font-semibold text-foreground mb-3">
            Topic
          </label>
          <input
            type="text"
            required
            placeholder={
              isZh ? 'e.g. Life in Shanghai, Chinese New Year…'
              : isEs ? 'e.g. La vida en Buenos Aires, comida mexicana…'
              : isEn ? 'e.g. Life in a big city, learning a new skill…'
              : isIt ? 'e.g. Un weekend a Firenze, cucina italiana…'
              : 'e.g. Buying a train ticket to Busan, Korean café culture…'
            }
            value={formData.topic}
            onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {langConfig.topicSuggestions.slice(0, 5).map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, topic }))}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-secondary/60 text-muted-foreground border border-border hover:border-primary/40 hover:text-foreground transition-all"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* Step 3 — Customize (collapsed by default) */}
        <div className="border border-border rounded-2xl overflow-hidden bg-card">
          <button
            type="button"
            onClick={() => setIsOptionsOpen(o => !o)}
            className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-secondary/30 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
          >
            <span className="text-sm font-medium text-muted-foreground">Customize</span>
            <ChevronDown
              className={cn('w-4 h-4 text-muted-foreground/60 transition-transform duration-300', isOptionsOpen && 'rotate-180')}
            />
          </button>

          <AnimatePresence>
            {isOptionsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-border/50"
              >
                <div className="px-5 py-5 space-y-5">

                  {/* Explanation language */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1">
                      Explanation language
                    </label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Translations and vocabulary notes will appear in this language.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {SUPPORT_LANGUAGE_OPTIONS.map(({ value, label, flag }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setSupportLanguage(value)}
                          className={cn(
                            'flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all duration-200',
                            supportLanguage === value
                              ? 'border-primary bg-primary/5 text-foreground shadow-sm'
                              : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                          )}
                        >
                          <span className="text-lg">{flag}</span>
                          <span className="text-xs font-semibold">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Level + Format */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-2">
                        {langConfig.difficultyLabel}
                      </label>
                      <div className="relative">
                        <select
                          value={formData.difficulty}
                          onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                          className="w-full appearance-none px-3 py-2.5 rounded-xl bg-secondary/50 border border-border text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          {langConfig.difficulties.map(level => (
                            <option key={level.value} value={level.value}>{level.label}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-2">
                        Format
                      </label>
                      <div className="relative">
                        <select
                          value={formData.readingStyle}
                          onChange={(e) => setFormData(prev => ({ ...prev, readingStyle: e.target.value }))}
                          className="w-full appearance-none px-3 py-2.5 rounded-xl bg-secondary/50 border border-border text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          {langConfig.readingStyles.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Length */}
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-2">Length</label>
                    <div className="flex p-1 bg-secondary/50 rounded-xl">
                      {(['short', 'medium', 'long'] as const).map((len) => (
                        <button
                          key={len}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, length: len }))}
                          className={cn(
                            'flex-1 py-2 text-sm font-medium capitalize rounded-lg transition-all',
                            formData.length === len
                              ? 'bg-card text-foreground shadow-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          )}
                        >
                          {len}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !formData.topic.trim()}
          className="w-full py-4 rounded-2xl font-bold text-base bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Writing your passage…</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate free reading</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
