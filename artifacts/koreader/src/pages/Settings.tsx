import { Settings as SettingsIcon, Sun, Moon, Type, Volume2, Eye, Save } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/hooks/use-theme';
import { useSettings } from '@/hooks/use-settings';

type FontSize = 'normal' | 'large' | 'xlarge';

export default function Settings() {
  const { theme, setTheme } = useThemeStore();
  const { fontSize, setFontSize, showRomanization, setShowRomanization, ttsSpeed, setTtsSpeed, autosave, setAutosave } = useSettings();

  const fontSizes: { value: FontSize; label: string }[] = [
    { value: 'normal',  label: 'Normal'      },
    { value: 'large',   label: 'Large'       },
    { value: 'xlarge',  label: 'Extra Large' },
  ];

  const speeds = [
    { value: 0.7,  label: 'Slow'   },
    { value: 0.85, label: 'Normal' },
    { value: 1.0,  label: 'Fast'   },
  ];

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        'relative w-11 h-6 rounded-full transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring outline-none',
        checked ? 'bg-primary' : 'bg-border'
      )}
    >
      <span className={cn(
        'absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200',
        checked && 'translate-x-5'
      )} />
    </button>
  );

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

            <div>
              <label className="block text-sm font-medium text-foreground mb-3">Color Theme</label>
              <div className="flex gap-3">
                {[
                  { value: 'light', icon: Sun,  label: 'Light' },
                  { value: 'dark',  icon: Moon, label: 'Dark'  },
                ].map(({ value, icon: Icon, label }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value as any)}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all',
                      theme === value
                        ? 'bg-primary text-primary-foreground border-primary shadow-md'
                        : 'border-border text-muted-foreground hover:border-primary/30 hover:text-foreground'
                    )}
                  >
                    <Icon className="w-4 h-4" /> {label}
                  </button>
                ))}
              </div>
            </div>

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
              <p className="mt-3 text-muted-foreground">
                <span className={cn(
                  'font-korean',
                  fontSize === 'normal' && 'text-xl',
                  fontSize === 'large'  && 'text-2xl',
                  fontSize === 'xlarge' && 'text-3xl',
                )}>한국어 / </span>
                <span className={cn(
                  'font-chinese',
                  fontSize === 'normal' && 'text-xl',
                  fontSize === 'large'  && 'text-2xl',
                  fontSize === 'xlarge' && 'text-3xl',
                )}>中文 / </span>
                <span className={cn(
                  fontSize === 'normal' && 'text-xl',
                  fontSize === 'large'  && 'text-2xl',
                  fontSize === 'xlarge' && 'text-3xl',
                )}>Español</span>
                <span className="text-sm ml-2 font-sans">(preview)</span>
              </p>
            </div>
          </section>

          {/* Reading */}
          <section className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Reading</h2>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Show romanization/pinyin</p>
                  <p className="text-xs text-muted-foreground">Display in Korean word popups</p>
                </div>
              </div>
              <Toggle checked={showRomanization} onChange={() => setShowRomanization(!showRomanization)} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Save className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Auto-save passages</p>
                  <p className="text-xs text-muted-foreground">Automatically save to library after generation</p>
                </div>
              </div>
              <Toggle checked={autosave} onChange={() => setAutosave(!autosave)} />
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
