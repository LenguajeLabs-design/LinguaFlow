import { Link } from 'wouter';
import { Mail } from 'lucide-react';

const CONTACT_EMAIL = 'forozc1@gmail.com';

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background/60 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <p className="font-serif text-lg font-bold text-foreground flex items-center gap-1.5">
            LinguaFlow <span aria-hidden="true">🌊</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Built by a language teacher and lifelong learner.
          </p>
        </div>

        <nav className="flex flex-col gap-2 text-sm">
          <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors w-fit">
            Contact
          </Link>
          <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors w-fit">
            Feedback
          </Link>
          <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors w-fit">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors w-fit">
            Terms
          </Link>
        </nav>

        <div className="text-sm">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            {CONTACT_EMAIL}
          </a>
        </div>
      </div>

      <div className="border-t border-border/40 px-4 sm:px-6 py-4 flex flex-col items-center gap-1 text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} LinguaFlow. All rights reserved.</span>
        <span className="text-muted-foreground/50 tracking-wide">
          Created by Federico Orozco &nbsp;·&nbsp;{' '}
          <a
            href="mailto:forozc1@gmail.com"
            className="hover:text-muted-foreground transition-colors"
          >
            forozc1@gmail.com
          </a>
        </span>
      </div>
    </footer>
  );
}
