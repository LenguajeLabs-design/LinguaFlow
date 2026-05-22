import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Library, PlusCircle, LayoutDashboard, Heart, Settings, Sun, Moon, LogIn, LogOut, User, BookMarked } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeStore, useThemeInit } from '@/hooks/use-theme';
import { useAuthStore } from '@/hooks/use-auth';
import { useLanguageStore, LANGUAGE_CONFIG } from '@/hooks/use-language';
import { AuthModal } from '@/components/auth/AuthModal';
import { useQueryClient } from '@tanstack/react-query';
import { getListPassagesQueryKey } from '@workspace/api-client-react';
import appIcon from '/hangul-flow-icon.png';

const navItems = [
  { href: '/',           icon: LayoutDashboard, label: 'Home'       },
  { href: '/generate',   icon: PlusCircle,      label: 'Generate'   },
  { href: '/library',    icon: Library,         label: 'Library'    },
  { href: '/favorites',  icon: Heart,           label: 'Favorites'  },
  { href: '/vocabulary', icon: BookMarked,      label: 'Vocabulary' },
  { href: '/settings',   icon: Settings,        label: 'Settings'   },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { theme, toggle } = useThemeStore();
  const { user, isInitialized, init, logout } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();
  const [authModal, setAuthModal] = useState<'login' | 'signup' | null>(null);
  const queryClient = useQueryClient();
  useThemeInit();

  useEffect(() => {
    if (!isInitialized) init();
  }, [isInitialized, init]);

  const handleLogout = async () => {
    await logout();
    queryClient.clear();
  };

  const langConfig = LANGUAGE_CONFIG[language];

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-accent/20">
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg shrink-0">
            <img
              src={appIcon}
              alt={langConfig.appName}
              className="w-8 h-8 rounded-xl shadow-sm group-hover:shadow-md transition-shadow duration-300 object-cover"
            />
            <span className="font-serif font-semibold text-lg tracking-tight text-foreground hidden sm:inline">
              {langConfig.appName}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            {navItems.map((item) => {
              const isActive =
                location === item.href ||
                (item.href !== '/' && location.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isActive
                      ? 'bg-secondary text-secondary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                  )}
                >
                  <item.icon className={cn('w-4 h-4', isActive && 'text-accent')} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Language switcher */}
            <div className="flex items-center p-0.5 bg-secondary/60 border border-border rounded-xl gap-0.5">
              <button
                onClick={() => setLanguage('ko')}
                title="Korean — LinguaFlow"
                className={cn(
                  'px-2.5 py-1.5 rounded-[0.6rem] text-xs font-bold transition-all duration-200',
                  language === 'ko'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                한
              </button>
              <button
                onClick={() => setLanguage('zh')}
                title="Chinese — Hanzi Flow"
                className={cn(
                  'px-2.5 py-1.5 rounded-[0.6rem] text-xs font-bold transition-all duration-200',
                  language === 'zh'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                汉
              </button>
            </div>

            {/* Dark mode toggle */}
            <button
              onClick={toggle}
              aria-label="Toggle dark mode"
              className="p-2 rounded-full transition-all duration-200 border border-border text-muted-foreground hover:text-foreground hover:border-accent/40 hover:bg-secondary/60"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Auth controls */}
            {isInitialized && (
              user ? (
                <div className="flex items-center gap-1.5">
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/60 border border-border text-sm text-muted-foreground">
                    <User className="w-3.5 h-3.5 text-accent" />
                    <span className="max-w-[120px] truncate text-xs font-medium">{user.email}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Sign out"
                    className="p-2 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-accent/40 hover:bg-secondary/60 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAuthModal('login')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-300 text-white"
                  style={{ background: 'linear-gradient(135deg, hsl(174,62%,42%), hsl(200,68%,52%), hsl(255,52%,60%))' }}
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign in</span>
                </button>
              )
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md flex justify-around px-1 py-1">
        {navItems.map((item) => {
          const isActive =
            location === item.href ||
            (item.href !== '/' && location.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center min-w-[44px] py-1.5 rounded-xl transition-colors duration-200 outline-none gap-0.5',
                isActive ? 'text-accent' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className={cn('w-4 h-4', isActive && 'fill-accent/15')} />
              <span className="text-[8px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Auth Modal */}
      {authModal && (
        <AuthModal
          defaultMode={authModal}
          onClose={() => setAuthModal(null)}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: getListPassagesQueryKey() })}
        />
      )}
    </div>
  );
}

