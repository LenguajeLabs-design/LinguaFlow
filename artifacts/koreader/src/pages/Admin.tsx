import { useQuery } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react/custom-fetch";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthGate } from "@/components/auth/AuthGate";

interface AdminStats {
  summary: {
    totalUsers: number;
    totalGenerations: number;
    totalGloss: number;
    totalTts: number;
    totalVocabSaves: number;
  };
  topUsers: {
    userId: number;
    email: string;
    generateTotal: number;
    glossTotal: number;
    ttsTotal: number;
    vocabSaves: number;
  }[];
  recentLimitEvents: {
    userId: number;
    email: string;
    feature: string;
    hitAt: string;
  }[];
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-1">
      <span className="text-2xl font-bold tabular-nums">{value.toLocaleString()}</span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

const FEATURE_LABELS: Record<string, string> = {
  generate: "Generate",
  gloss: "Gloss",
  tts: "TTS",
};

export default function Admin() {
  const { data, isLoading, error } = useQuery<AdminStats>({
    queryKey: ["admin", "stats"],
    queryFn: () => customFetch<AdminStats>("/api/admin/stats"),
    retry: false,
  });

  const is403 = (error as any)?.status === 403;

  return (
    <AuthGate>
      <AppLayout>
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
          <div>
            <h1 className="text-2xl font-bold">Beta Usage Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Admin-only · updates on page load</p>
          </div>

          {isLoading && (
            <p className="text-muted-foreground text-sm">Loading stats…</p>
          )}

          {is403 && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-destructive text-sm">
              Access denied — admin accounts only.
            </div>
          )}

          {error && !is403 && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-destructive text-sm">
              Failed to load stats. Check server logs.
            </div>
          )}

          {data && (
            <>
              {/* Summary */}
              <section>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Overview</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  <SummaryCard label="Total users"       value={data.summary.totalUsers} />
                  <SummaryCard label="Passages generated" value={data.summary.totalGenerations} />
                  <SummaryCard label="Gloss requests"    value={data.summary.totalGloss} />
                  <SummaryCard label="TTS requests"      value={data.summary.totalTts} />
                  <SummaryCard label="Vocab saves"       value={data.summary.totalVocabSaves} />
                </div>
              </section>

              {/* Top users */}
              <section>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Most Active Users</h2>
                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Email</th>
                        <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Passages</th>
                        <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Gloss</th>
                        <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">TTS</th>
                        <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Vocab saves</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {data.topUsers.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">No usage yet.</td>
                        </tr>
                      )}
                      {data.topUsers.map((u) => (
                        <tr key={u.userId} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-2.5 font-mono text-xs truncate max-w-[220px]">{u.email}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums">{u.generateTotal}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums">{u.glossTotal}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums">{u.ttsTotal}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums">{u.vocabSaves}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Limit events */}
              <section>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Recent Quota Limit Hits
                  <span className="ml-2 text-xs font-normal normal-case">(last 100)</span>
                </h2>
                {data.recentLimitEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No limit events recorded yet.</p>
                ) : (
                  <div className="rounded-xl border border-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Email</th>
                          <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Feature</th>
                          <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Time (UTC)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {data.recentLimitEvents.map((e, i) => (
                          <tr key={i} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-2.5 font-mono text-xs truncate max-w-[220px]">{e.email}</td>
                            <td className="px-4 py-2.5">
                              <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-xs px-2 py-0.5 font-medium">
                                {FEATURE_LABELS[e.feature] ?? e.feature}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-muted-foreground text-xs tabular-nums">
                              {new Date(e.hitAt).toLocaleString("en-US", { timeZone: "UTC", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })} UTC
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </AppLayout>
    </AuthGate>
  );
}
