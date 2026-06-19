import { Link } from 'wouter';
import { User } from 'lucide-react';
import { Show, useUser } from '@clerk/react';

export function AuthGate({
  children,
  message = 'Sign in to access this page.',
}: {
  children: React.ReactNode;
  message?: string;
}) {
  const { isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-7 h-7 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Show when="signed-in">{children}</Show>
      <Show when="signed-out">
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="relative mb-8">
            <div
              className="absolute inset-0 rounded-full blur-2xl opacity-25"
              style={{ background: 'linear-gradient(135deg, hsl(174,60%,52%), hsl(255,52%,66%))' }}
            />
            <div
              className="relative w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, hsl(174,62%,42%), hsl(255,52%,60%))' }}
            >
              <User className="w-9 h-9 text-white" />
            </div>
          </div>
          <h2 className="text-xl font-serif font-bold text-foreground mb-2">Sign in to continue</h2>
          <p className="text-muted-foreground max-w-xs mb-8 text-sm leading-relaxed">{message}</p>
          <div className="flex gap-3">
            <Link
              href="/sign-in"
              className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:opacity-90 hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, hsl(174,62%,42%), hsl(200,68%,52%), hsl(255,52%,60%))' }}
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="px-6 py-3 rounded-xl text-sm font-semibold bg-secondary text-secondary-foreground border border-border hover:border-accent/30 transition-all duration-300"
            >
              Create account
            </Link>
          </div>
        </div>
      </Show>
    </>
  );
}
