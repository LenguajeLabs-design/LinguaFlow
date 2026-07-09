import { useState } from 'react';
import { Sparkles, Loader2, Hash, BookType } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LANGUAGE_CONFIG, SUPPORT_LANGUAGE_OPTIONS, type AppLanguage, useLanguageStore } from '@/hooks/use-language';

interface GuestGenerateFormProps {
  onGenerated: (passage: any) => void;
}

const LANGUAGES: { key: AppLanguage; label: string; native: string; flag: string }[] = [
  { key: 'ko', label: 'Korean', native: '한국어', flag: '🇰🇷' },
  { key: 'zh', label: 'Chinese', native: '普通话', flag: '🇨🇳' },
  { key: 'es', label: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { key: 'en', label: 'English', native: 'English', flag: '🇺🇸' },
];

export function GuestGenerateForm({ onGenerated }: GuestGenerateFormProps) {
  const { language: storedLanguage, setLanguage, supportLanguage, setSupportLanguage } = useLanguageStore();
  const [language, setLocalLanguage] = useState<AppLanguage>(storedLanguage);
  const langConfig = LANGUAGE_CONFIG[language];

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

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-3">
          What do you want to read today?
        </h1>
        <p className="text-muted-foreground text-base">
          Pick a language, a topic, and we'll write a story just for your level.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {LANGUAGES.map(({ key, label, native, flag }) => (
            <button
              key={key}
              type="button"
              onClick={() => handleLanguageChange(key)}
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

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
          <label className="block text-sm font-semibold text-foreground">
            What language helps you learn?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SUPPORT_LANGUAGE_OPTIONS.map(({ value, label, flag }) => (
              <button
                key={value}
                type="button"
                onClick={() => setSupportLanguage(value)}
                className={cn(
                  'flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all duration-200 font-medium',
                  supportLanguage === value
                    ? 'border-primary bg-primary/5 text-foreground shadow-sm'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
                )}
              >
                <span className="text-lg">{flag}</span>
                <span className="text-xs font-semibold">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-6">
          <div>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-primary" /> {langConfig.difficultyLabel}
              </label>
              <div className="relative">
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                  className="w-full appearance-none px-4 py-2.5 rounded-xl bg-secondary/50 border border-border text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
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
              <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <BookType className="w-3.5 h-3.5 text-primary" /> Format
              </label>
              <div className="relative">
                <select
                  value={formData.readingStyle}
                  onChange={(e) => setFormData(prev => ({ ...prev, readingStyle: e.target.value }))}
                  className="w-full appearance-none px-4 py-2.5 rounded-xl bg-secondary/50 border border-border text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
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

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Length</label>
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
              <span>Writing your story…</span>
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
