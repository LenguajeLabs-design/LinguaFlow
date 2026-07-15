import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Sparkles, Loader2, Settings2, Hash, BookType } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthGate } from '@/components/auth/AuthGate';
import { cn } from '@/lib/utils';
import { useGeneratePassage, useSavePassage, getListPassagesQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { usePassageStore } from '@/store/use-passage-store';
import { useLanguageStore, LANGUAGE_CONFIG, SUPPORT_LANGUAGE_OPTIONS } from '@/hooks/use-language';
import { useSettings } from '@/hooks/use-settings';

export default function Generate() {
  const [_, setLocation] = useLocation();
  const setGeneratedPassage = usePassageStore(state => state.setGeneratedPassage);
  const generateMutation = useGeneratePassage();
  const saveMutation = useSavePassage();
  const queryClient = useQueryClient();
  const { language, supportLanguage, setSupportLanguage } = useLanguageStore();
  const { autosave } = useSettings();
  const langConfig = LANGUAGE_CONFIG[language];
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const [formData, setFormData] = useState({
    topic: '',
    difficulty: langConfig.difficulties[0].value,
    length: 'short' as 'short' | 'medium' | 'long',
    readingStyle: langConfig.readingStyles[0].value as string,
    vocabularyFocus: '',
    grammarFocus: ''
  });

  // Reset difficulty and style when language changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      difficulty: LANGUAGE_CONFIG[language].difficulties[0].value,
      readingStyle: LANGUAGE_CONFIG[language].readingStyles[0].value,
    }));
  }, [language]);

  // Pre-fill topic from query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const topic = params.get('topic');
    if (topic) setFormData(prev => ({ ...prev, topic }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.topic.trim()) return;

    generateMutation.mutate(
      {
        data: {
          ...formData,
          language: language as any,
          supportLanguage: supportLanguage as any,
        }
      },
      {
        onSuccess: (data) => {
          const passageWithLang = { ...data, language, supportLanguage };
          setGeneratedPassage(passageWithLang as any);

          if (autosave) {
            saveMutation.mutate(
              { data: passageWithLang as any },
              {
                onSuccess: (saved) => {
                  queryClient.invalidateQueries({ queryKey: getListPassagesQueryKey() });
                  setLocation(`/library/${saved.id}`);
                },
                onError: () => {
                  setLocation('/passage');
                }
              }
            );
          } else {
            setLocation('/passage');
          }
        }
      }
    );
  };

  const isLoading = generateMutation.isPending || (autosave && saveMutation.isPending);
  const isZh = language === 'zh';
  const isEs = language === 'es';
  const isEn = language === 'en';
  const isIt = language === 'it';

  return (
    <AppLayout>
      <AuthGate message={`Sign in to generate personalized ${langConfig.name} reading passages.`}>
      <div className="max-w-2xl mx-auto py-8">

        <header className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 text-accent mb-6 shadow-sm border border-accent/20">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4">
            Design Your Reading
          </h1>
          <p className="text-lg text-muted-foreground">
            {isZh
              ? 'Generate Chinese passages calibrated to your HSK level on any topic you care about.'
              : isEs
              ? 'Generate Spanish passages calibrated to your CEFR level — perfect for heritage learners and advanced students.'
              : isEn
              ? 'Generate English passages calibrated to your CEFR level on any topic you care about.'
              : isIt
              ? 'Generate Italian passages calibrated to your CEFR level — ideal for learners who want natural, meaningful reading practice.'
              : 'Tell the AI what you want to read about, and it will craft a passage perfect for your level.'}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Support language */}
          <div className="bg-card border border-border p-6 sm:p-8 rounded-2xl shadow-sm">
            <label className="block text-lg font-bold text-foreground mb-4">
              What language helps you learn?
            </label>
            <p className="text-sm text-muted-foreground mb-4">
              Vocabulary meanings, translations, and grammar notes will be shown in this language.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SUPPORT_LANGUAGE_OPTIONS.map(({ value, label, flag }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSupportLanguage(value)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all duration-200 font-medium',
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
          </div>

          {/* Topic */}
          <div className="bg-card border border-border p-6 sm:p-8 rounded-2xl shadow-sm">
            <label className="block text-lg font-bold text-foreground mb-4">
              What do you want to read about?
            </label>
            <input
              type="text"
              required
              placeholder={isZh
                ? 'e.g. Life in Shanghai, Chinese New Year, AI technology…'
                : isEs
                ? 'e.g. La vida en Buenos Aires, comida mexicana, música latina…'
                : isIt
                ? 'e.g. Un weekend a Firenze, pasta fatta in casa, cinema italiano…'
                : 'e.g. Buying a train ticket to Busan, Korean café culture…'}
              value={formData.topic}
              onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
              className="w-full px-5 py-4 rounded-xl bg-background border-2 border-border text-foreground text-lg placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
            />

            {/* Topic suggestions */}
            <div className="mt-4 flex flex-wrap gap-2">
              {langConfig.topicSuggestions.slice(0, 6).map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, topic }))}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-secondary/60 text-muted-foreground border border-border hover:border-accent/40 hover:text-foreground hover:bg-secondary transition-all duration-200"
                >
                  {topic}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
              {/* Level */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Hash className="w-4 h-4 text-primary" /> {langConfig.difficultyLabel}
                </label>
                <div className="relative">
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full appearance-none px-4 py-3 rounded-xl bg-secondary/50 border border-border text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {langConfig.difficulties.map(level => (
                      <option key={level.value} value={level.value}>{level.label} — {level.desc}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              {/* Format */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <BookType className="w-4 h-4 text-primary" /> Format
                </label>
                <div className="relative">
                  <select
                    value={formData.readingStyle}
                    onChange={(e) => setFormData(prev => ({ ...prev, readingStyle: e.target.value }))}
                    className="w-full appearance-none px-4 py-3 rounded-xl bg-secondary/50 border border-border text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {langConfig.readingStyles.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Length */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-foreground mb-3">Length</label>
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

          {/* Advanced Options */}
          <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="w-full px-6 py-4 flex items-center justify-between bg-card hover:bg-secondary/30 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
            >
              <span className="font-semibold text-foreground flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-muted-foreground" />
                Target Specific Focus Areas (Optional)
              </span>
              <svg
                className={cn('w-5 h-5 text-muted-foreground transition-transform duration-300', isAdvancedOpen && 'rotate-180')}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <AnimatePresence>
              {isAdvancedOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 pb-6 border-t border-border/50"
                >
                  <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        {isZh ? 'Vocabulary to Include' : 'Vocabulary to Include'}
                      </label>
                      <input
                        type="text"
                        placeholder={isZh ? 'e.g. 旅行, 美食, 文化' : isEs ? 'e.g. viaje, cocina, familia' : isIt ? 'e.g. viaggio, cucina, famiglia' : 'e.g. 기차, 예매, 역무원'}
                        value={formData.vocabularyFocus}
                        onChange={(e) => setFormData(prev => ({ ...prev, vocabularyFocus: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        {isZh ? 'Grammar to Practice' : 'Grammar to Practice'}
                      </label>
                      <input
                        type="text"
                        placeholder={isZh ? 'e.g. 把字句, 被动句, 结果补语' : isEs ? 'e.g. subjuntivo, pretérito vs imperfecto, ser/estar' : isIt ? 'e.g. congiuntivo, passato prossimo vs imperfetto, articoli' : 'e.g. ~(으)면 좋겠다, ~기 때문에'}
                        value={formData.grammarFocus}
                        onChange={(e) => setFormData(prev => ({ ...prev, grammarFocus: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="submit"
            disabled={isLoading || !formData.topic.trim()}
            className="w-full py-5 rounded-2xl font-bold text-lg bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 flex items-center justify-center gap-3 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            {isLoading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>{autosave && saveMutation.isPending ? 'Saving…' : 'Crafting your passage…'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" />
                <span>Generate {isZh ? 'Chinese' : isEs ? 'Spanish' : isEn ? 'English' : isIt ? 'Italian' : 'Korean'} Passage</span>
              </>
            )}
          </button>
        </form>
      </div>
      </AuthGate>
    </AppLayout>
  );
}
