import { X, BookOpen, Layers, TrendingUp } from 'lucide-react';
import { Link } from 'wouter';

interface AuthPromptModalProps {
  onClose: () => void;
  trigger?: 'save' | 'vocab' | 'audio' | 'generate';
}

const TRIGGER_MESSAGES: Record<string, string> = {
  save: 'Save this story to your personal library',
  vocab: 'Build your vocabulary collection',
  audio: 'Listen to your stories read aloud',
  generate: 'Generate unlimited stories',
};

export function AuthPromptModal({ onClose, trigger = 'generate' }: AuthPromptModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-4">
            <BookOpen className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1">
            Create your free account
          </h2>
          <p className="text-muted-foreground text-sm">
            to save your language journey
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-sm text-foreground font-medium">Save your reading library</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-sm text-foreground font-medium">Collect vocabulary as you read</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-sm text-foreground font-medium">Track your reading progress</span>
          </div>
        </div>

        <div className="space-y-3">
          <Link
            href="/sign-up"
            className="block w-full py-3.5 rounded-xl font-bold text-center bg-primary text-primary-foreground shadow hover:opacity-90 transition-opacity"
          >
            Create free account
          </Link>
          <Link
            href="/sign-in"
            className="block w-full py-3 rounded-xl font-medium text-center text-muted-foreground hover:text-foreground border border-border hover:border-primary/30 transition-all text-sm"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
