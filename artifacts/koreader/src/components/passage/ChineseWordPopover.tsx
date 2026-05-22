import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, BookMarked, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChineseToken } from '@workspace/api-client-react';
import { vocabularyApi } from '@workspace/api-client-react';
import { useAuthStore } from '@/hooks/use-auth';

interface ChineseWordPopoverProps {
  token: ChineseToken;
  context?: string;
  passageId?: number;
  difficulty?: string;
  anchorRect: DOMRect;
  onClose: () => void;
}

export function ChineseWordPopover({
  token,
  context,
  passageId,
  difficulty,
  anchorRect,
  onClose,
}: ChineseWordPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { user } = useAuthStore();

  const [style, setStyle] = useState<React.CSSProperties>({ opacity: 0 });

  useEffect(() => {
    const el = popoverRef.current;
    if (!el) return;

    const pop = el.getBoundingClientRect();
    const margin = 12;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = anchorRect.left + anchorRect.width / 2 - pop.width / 2;
    let top = anchorRect.top - pop.height - 10;

    if (top < margin) top = anchorRect.bottom + 10;
    left = Math.max(margin, Math.min(left, vw - pop.width - margin));

    if (top + pop.height > vh - margin) {
      top = Math.max(margin, anchorRect.top - pop.height - 10);
    }

    setStyle({ left, top, opacity: 1 });
  }, [anchorRect]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const escHandler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    setTimeout(() => document.addEventListener('mousedown', handler), 100);
    document.addEventListener('keydown', escHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', escHandler);
    };
  }, [onClose]);

  const handleSave = async () => {
    if (!user || saving || saved) return;
    setSaving(true);
    try {
      await vocabularyApi.save({
        language: 'zh',
        word: token.hanzi,
        pinyin: token.pinyin,
        meaning: token.meaning,
        exampleSentence: context,
        sourcePassageId: passageId,
        difficulty,
      });
      setSaved(true);
    } catch (err) {
      console.error('Failed to save vocabulary:', err);
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div
      ref={popoverRef}
      style={{ ...style, position: 'fixed', zIndex: 9999, transition: 'opacity 0.15s ease' }}
      className="w-64 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors z-10"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border/60">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl font-bold text-foreground leading-none font-chinese">{token.hanzi}</span>
          <span className="text-sm text-accent font-medium">{token.pinyin}</span>
        </div>
      </div>

      {/* Meaning */}
      <div className="px-4 py-3">
        <p className="text-sm font-medium text-foreground leading-snug">{token.meaning}</p>

        {context && (
          <div className="mt-3 p-2.5 rounded-xl bg-secondary/40 border border-border/40">
            <p className="text-xs text-muted-foreground leading-relaxed font-chinese">{context}</p>
          </div>
        )}
      </div>

      {/* Save button */}
      {user && (
        <div className="px-4 pb-4">
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={cn(
              'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200',
              saved
                ? 'bg-green-500/15 text-green-600 border border-green-500/30'
                : 'bg-accent/10 text-accent border border-accent/25 hover:bg-accent/20'
            )}
          >
            {saving ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
            ) : saved ? (
              <><Check className="w-3.5 h-3.5" /> Saved to Vocabulary</>
            ) : (
              <><BookMarked className="w-3.5 h-3.5" /> Save to Vocabulary</>
            )}
          </button>
        </div>
      )}
    </div>,
    document.body
  );
}
