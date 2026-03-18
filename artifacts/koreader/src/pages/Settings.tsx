import { Settings as SettingsIcon, Sun, Moon, Type, Volume2, Eye } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { cn } from '@/components/layout/AppLayout';
import { useThemeStore } from '@/hooks/use-theme';
import { useSettings } from '@/hooks/use-settings';

type FontSize = 'normal' | 'large' | 'xlarge';

export default function Settings() {
  const { theme, setTheme } = useThemeStore();
  const { fontSize, setFontSize, showRomanization, setShowRomanization, ttsSpeed, setTtsSpeed } = useSettings();

  const fontSizes: { value: FontSize; label: string; preview: string }[] = [
    { value: 'normal',  label: 'Normal',       preview: 'text-xl'   },
    { value: 'large',   label: 'Large',        preview: 'text-2xl'  },
    { value: 'xlarge',  label: 'Extra Large',  preview: 'text-3xl'  },
  ];

  const speeds = [
    { value: 0.7,  label: 'Slow'    },
    { value: 0.85, label: 'Normal'  },
    { value: 1.0,  label: 'Fast'    },
  ];

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <SettingsIcon className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-2xl font-serif font-bold text-foreground">Settings</h1>
        </div>

        <div className="space-y-6">
          {/* Appearance */}
          <section className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Appearance</h2>

            {/* Theme */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">Color Theme</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setTheme('light')}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all',
                    theme === 'light'
                      ? 'bg-primary text-primary-foreground border-primary shadow-md'
                      : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
                  )}
                >
                  <Sun className="w-4 h-4" /> Light
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all',
                    theme === 'dark'
                      ? 'bg-primary text-primary-foreground border-primary shadow-md'
                      : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
                  )}
                >
                  <Moon className="w-4 h-4" /> Dark
                </button>
              </div>
            </div>

            {/* Font size */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">Reading Font Size</label>
              <div className="flex gap-3 flex-wrap">
                {fontSizes.map((fs) => (
                  <button
                    key={fs.value}
                    onClick={() => setFontSize(fs.value)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 px-5 py-3 rounded-xl border text-sm font-medium transition-all',
                      fontSize === fs.value
                        ? 'bg-primary text-primary-foreground border-primary shadow-md'
                        : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
                    )}
                  >
                    <Type className={cn('w-5 h-5', fs.value === 'xlarge' && 'scale-125', fs.value === 'large' && 'scale-110')} />
                    {fs.label}
                  </button>
                ))}
              </div>
              <p className="mt-3 font-korean text-muted-foreground">
                <span className={cn(
                  fontSize === 'normal' && 'text-xl',
                  fontSize === 'large'  && 'text-2xl',
                  fontSize === 'xlarge' && 'text-3xl',
                )}>
                  한국어 미리보기
                </span>
                <span className="text-sm ml-2 font-sans">(Korean preview)</span>
              </p>
            </div>
          </section>

          {/* Reading */}
          <section className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Reading</h2>

            {/* Romanization */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Show romanization</p>
                  <p className="text-xs text-muted-foreground">Display romanized pronunciation in word popups</p>
                </div>
              </div>
              <button
                role="switch"
                aria-checked={showRomanization}
                onClick={() => setShowRomanization(!showRomanization)}
                className={cn(
                  'relative w-11 h-6 rounded-full transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring outline-none',
                  showRomanization ? 'bg-primary' : 'bg-border'
                )}
              >
                <span
                  className={cn(
                    'absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200',
                    showRomanization && 'translate-x-5'
                  )}
                />
              </button>
            </div>
          </section>

          {/* Audio */}
          <section className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Audio</h2>

            <div>
              <div className="flex items-center gap-3 mb-3">
                <Volume2 className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">Read-aloud speed</p>
              </div>
              <div className="flex gap-3">
                {speeds.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setTtsSpeed(s.value)}
                    className={cn(
                      'px-4 py-2 rounded-xl border text-sm font-medium transition-all',
                      ttsSpeed === s.value
                        ? 'bg-primary text-primary-foreground border-primary shadow-md'
                        : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
