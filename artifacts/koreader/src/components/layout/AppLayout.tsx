import React from 'react';
import { Link, useLocation } from 'wouter';
import { Library, PlusCircle, LayoutDashboard, Heart, Settings, Sun, Moon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useThemeStore, useThemeInit } from '@/hooks/use-theme';
import appIcon from '/hangul-flow-icon.png';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { href: '/',          icon: LayoutDashboard, label: 'Home'      },
  { href: '/generate',  icon: PlusCircle,      label: 'Generate'  },
  { href: '/library',   icon: Library,         label: 'Library'   },
  { href: '/favorites', icon: Heart,           label: 'Favorites' },
  { href: '/settings',  icon: Settings,        label: 'Settings'  },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { theme, toggle } = useThemeStore();
  useThemeInit();

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-accent/20">
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg shrink-0">
            <img
              src={appIcon}
              alt="Hangul Flow"
              className="w-8 h-8 rounded-xl shadow-sm group-hover:shadow-md transition-shadow duration-300 object-cover"
            />
            <span className="font-serif font-semibold text-lg tracking-tight text-foreground hidden sm:inline group-hover:hf-gradient-text transition-all duration-300">
              Hangul Flow
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
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

          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="p-2 rounded-full transition-all duration-200 border border-border text-muted-foreground hover:text-foreground hover:border-accent/40 hover:bg-secondary/60"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md flex justify-around px-2 py-1">
        {navItems.map((item) => {
          const isActive =
            location === item.href ||
            (item.href !== '/' && location.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center min-w-[52px] py-2 rounded-xl transition-colors duration-200 outline-none gap-0.5',
                isActive ? 'text-accent' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive && 'fill-accent/15')} />
              <span className="text-[9px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
