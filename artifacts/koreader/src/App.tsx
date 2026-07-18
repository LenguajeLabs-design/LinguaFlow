import { ClerkProvider, SignIn, SignUp, Show } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Switch, Route, Redirect, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";

import Home from "@/pages/Home";
import { Onboarding } from "@/components/onboarding/Onboarding";
import { useOnboardingStore } from "@/hooks/use-onboarding";
import { AppLayout } from "@/components/layout/AppLayout";

const Generate = lazy(() => import("@/pages/Generate"));
const Library = lazy(() => import("@/pages/Library"));
const Reader = lazy(() => import("@/pages/Reader"));
const Settings = lazy(() => import("@/pages/Settings"));
const Vocabulary = lazy(() => import("@/pages/Vocabulary"));
const Admin = lazy(() => import("@/pages/Admin"));
const Contact = lazy(() => import("@/pages/Contact"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Terms = lazy(() => import("@/pages/Terms"));
const Teach = lazy(() => import("@/pages/Teach"));
const NotFound = lazy(() => import("@/pages/not-found"));

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/linguaflow-logo.png`,
  },
  variables: {
    colorPrimary: "hsl(174, 62%, 42%)",
    colorForeground: "hsl(222, 47%, 11%)",
    colorMutedForeground: "hsl(215, 16%, 47%)",
    colorDanger: "hsl(0, 84%, 60%)",
    colorNeutral: "hsl(222, 47%, 11%)",
    colorBackground: "hsl(0, 0%, 100%)",
    colorInput: "hsl(214, 32%, 91%)",
    colorInputForeground: "hsl(222, 47%, 11%)",
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    cardBox: "w-[440px] max-w-full shadow-xl border border-border rounded-2xl",
    card: "!bg-transparent",
    footer: "!bg-transparent",
    headerTitle: "font-serif text-2xl font-bold text-foreground",
    headerSubtitle: "text-muted-foreground text-sm",
    socialButtonsBlockButtonText: "font-medium text-foreground",
    formFieldLabel: "text-foreground text-sm font-medium",
    footerActionLink: "text-primary font-medium hover:underline",
    footerActionText: "text-muted-foreground text-sm",
    dividerText: "text-muted-foreground text-xs",
    formButtonPrimary:
      "bg-gradient-to-r from-[hsl(174,62%,42%)] via-[hsl(200,68%,52%)] to-[hsl(255,52%,60%)] text-white font-semibold hover:opacity-90 transition-opacity",
  },
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AuthedHomeGate() {
  const { hasOnboarded, completeOnboarding, skipOnboarding } = useOnboardingStore();

  if (!hasOnboarded) {
    return (
      <AppLayout>
        <Onboarding
          variant="auth"
          onSkip={skipOnboarding}
          onComplete={() => completeOnboarding()}
        />
      </AppLayout>
    );
  }

  return <Redirect to="/library" />;
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <AuthedHomeGate />
      </Show>
      <Show when="signed-out">
        <Home />
      </Show>
    </>
  );
}

function Router() {
  return (
    <Suspense fallback={null}>
      <Switch>
        <Route path="/" component={HomeRedirect} />
        <Route path="/generate" component={Generate} />
        <Route path="/library" component={Library} />
        <Route path="/library/:id" component={Reader} />
        <Route path="/passage" component={Reader} />
        <Route path="/favorites" component={() => <Redirect to="/library" />} />
        <Route path="/vocabulary" component={Vocabulary} />
        <Route path="/settings" component={Settings} />
        <Route path="/admin" component={Admin} />
        <Route path="/contact" component={Contact} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/teach" component={Teach} />
        <Route
          path="/sign-in/*?"
          component={() => (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
              <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
            </div>
          )}
        />
        <Route
          path="/sign-up/*?"
          component={() => (
            <div className="min-h-screen flex items-center justify-center bg-background p-4">
              <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
            </div>
          )}
        />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      routerPush={(to) => window.history.pushState(null, "", stripBase(to))}
      routerReplace={(to) => window.history.replaceState(null, "", stripBase(to))}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      afterSignOutUrl={basePath || "/"}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={basePath}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
