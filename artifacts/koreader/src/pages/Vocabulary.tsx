import { useState } from 'react';
import { BookMarked, Download, Trash2, Check, Loader2, Search, Globe } from 'lucide-react';
import { AppLayout, AuthGate, cn } from '@/components/layout/AppLayout';
import { vocabularyApi } from '@workspace/api-client-react';
import type { SavedVocab } from '@workspace/api-client-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type LangFilter = 'all' | 'ko' | 'zh';

export default function Vocabulary() {
  const [langFilter, setLangFilter] = useState<LangFilter>('all');
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: vocab = [], isLoading } = useQuery({
    queryKey: ['vocabulary', langFilter],
    queryFn: () => vocabularyApi.list(langFilter === 'all' ? undefined : langFilter),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => vocabularyApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vocabulary'] }),
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, reviewed }: { id: number; reviewed: boolean }) =>
      vocabularyApi.update(id, { reviewed }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vocabulary'] }),
  });

  const handleExport = async () => {
    const lang = langFilter === 'all' ? undefined : langFilter;
    try {
      const res = await vocabularyApi.exportCsv(lang);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = lang ? `vocabulary_${lang}.csv` : 'vocabulary.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  const filtered = vocab.filter((v) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      v.word.toLowerCase().includes(q) ||
      v.meaning.toLowerCase().includes(q) ||
      (v.pinyin?.toLowerCase().includes(q) ?? false)
    );
  });

  const tabs: { value: LangFilter; label: string; flag: string }[] = [
    { value: 'all', label: 'All',     flag: '🌐' },
    { value: 'ko',  label: 'Korean',  flag: '🇰🇷' },
    { value: 'zh',  label: 'Chinese', flag: '🇨🇳' },
  ];

  return (
    <AppLayout>
      <AuthGate message="Sign in to access your saved vocabulary.">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <BookMarked className="w-5 h-5 text-accent" />
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">Vocabulary</h1>
                </div>
                <p className="text-muted-foreground text-sm">
                  {filtered.length} {filtered.length === 1 ? 'word' : 'words'} saved
                  {search && ' · filtered'}
                </p>
              </div>
              {vocab.length > 0 && (
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:border-accent/40 hover:bg-secondary/60 transition-all duration-200"
                >
                  <Download className="w-4 h-4" />
                  Export Anki CSV
                </button>
              )}
            </div>
          </div>

          {/* Lang tabs + search */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex bg-secondary/60 p-1 rounded-xl gap-0.5">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setLangFilter(tab.value)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    langFilter === tab.value
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <span>{tab.flag}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search words…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
              />
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mr-3" />
              Loading vocabulary…
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-secondary/60">
                <BookMarked className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {search ? 'No results found' : 'No vocabulary saved yet'}
              </h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                {search
                  ? 'Try a different search term.'
                  : 'Tap any word while reading a passage to save it here.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((item) => (
                <VocabCard
                  key={item.id}
                  item={item}
                  onDelete={() => deleteMutation.mutate(item.id)}
                  onToggleReviewed={() => reviewMutation.mutate({ id: item.id, reviewed: !item.reviewed })}
                  isDeleting={deleteMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </AuthGate>
    </AppLayout>
  );
}

function VocabCard({
  item,
  onDelete,
  onToggleReviewed,
  isDeleting,
}: {
  item: SavedVocab;
  onDelete: () => void;
  onToggleReviewed: () => void;
  isDeleting: boolean;
}) {
  const isZh = item.language === 'zh';

  return (
    <div className={cn(
      'group bg-card border rounded-2xl px-5 py-4 shadow-sm transition-all duration-200',
      item.reviewed ? 'border-green-500/20 bg-green-500/3' : 'border-border/60'
    )}>
      <div className="flex items-start gap-4">
        {/* Language badge */}
        <span className={cn(
          'shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold mt-0.5',
          isZh
            ? 'bg-red-500/10 text-red-600'
            : 'bg-blue-500/10 text-blue-600'
        )}>
          {isZh ? '汉' : '한'}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className={cn(
              'font-bold text-foreground text-xl leading-none',
              isZh ? 'font-chinese' : 'font-korean'
            )}>
              {item.word}
            </span>
            {item.pinyin && (
              <span className="text-sm text-accent font-medium">{item.pinyin}</span>
            )}
            {item.difficulty && (
              <span className="text-xs text-muted-foreground/60 border border-border px-1.5 py-0.5 rounded-full">
                {item.difficulty.toUpperCase()}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{item.meaning}</p>
          {item.exampleSentence && (
            <p className={cn(
              'text-xs text-muted-foreground/60 mt-1.5 leading-relaxed',
              isZh ? 'font-chinese' : 'font-korean'
            )}>
              {item.exampleSentence}
            </p>
          )}
          {item.notes && (
            <p className="text-xs text-muted-foreground/50 mt-1 italic">{item.notes}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onToggleReviewed}
            title={item.reviewed ? 'Mark as unreviewed' : 'Mark as reviewed'}
            className={cn(
              'p-2 rounded-xl border text-sm transition-all duration-200',
              item.reviewed
                ? 'bg-green-500/10 border-green-500/25 text-green-600 hover:bg-green-500/20'
                : 'border-border text-muted-foreground hover:border-green-500/30 hover:text-green-600 opacity-0 group-hover:opacity-100'
            )}
          >
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            title="Delete word"
            className="p-2 rounded-xl border border-border text-muted-foreground hover:border-destructive/30 hover:text-destructive hover:bg-destructive/5 transition-all duration-200 opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
