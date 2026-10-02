import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Header } from "@/components/site/Header";
import { LanguageProvider, useHindi } from "@/lib/language";
import { LanguageToggle } from "@/components/site/LanguageToggle";
import { Footer } from "@/components/site/Footer";
import { DemoGuide } from "@/components/site/DemoGuide";
import { ClerkProvider, SignIn, useAuth } from "@clerk/clerk-react";
import { useLocation } from "@tanstack/react-router";
import { GuestProvider, useGuest } from "@/lib/guest";

const CLERK_PUBLISHABLE_KEY = "pk_test_aW5mb3JtZWQtbWFybW90LTc0MzkuY2xlcmsuYWNjb3VudHMuZGV2JA";

function NotFoundComponent() {
  const hi = useHindi();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          {hi ? "पृष्ठ नहीं मिला" : "Page not found"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {hi
            ? "यह पृष्ठ उपलब्ध नहीं है या इसका पता बदल गया है।"
            : "The page you’re looking for doesn’t exist or has been moved."}
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {hi ? "मुखपृष्ठ" : "Go home"}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const hi = useHindi();
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {hi ? "यह पृष्ठ लोड नहीं हुआ" : "This page didn’t load"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {hi
            ? "कुछ गड़बड़ हुई। पृष्ठ फिर से लोड करें या मुखपृष्ठ पर जाएँ।"
            : "Something went wrong on our end. You can try refreshing or head back home."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {hi ? "फिर प्रयास करें" : "Try again"}
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {hi ? "मुखपृष्ठ" : "Go home"}
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Dhruva — Polar Knowledge and Outreach Portal" },
      {
        name: "description",
        content:
          "Discover polar expeditions, stations, reports, publications, datasets and media from one trusted knowledge portal.",
      },
      { name: "application-name", content: "Dhruva" },
      { name: "apple-mobile-web-app-title", content: "Dhruva" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Dhruva — Polar Knowledge and Outreach Portal" },
      {
        property: "og:description",
        content:
          "Discover polar expeditions, stations, reports, publications, datasets and media from one trusted knowledge portal.",
      },
      { property: "og:image", content: "/favicon.png" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Dhruva — Polar Knowledge and Outreach Portal" },
      { name: "twitter:image", content: "/favicon.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap",
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} afterSignOutUrl="/">
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <GuestProvider>
            <AppGate />
          </GuestProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function AppGate() {
  const hi = useHindi();
  const { pathname } = useLocation();
  const { isLoaded, isSignedIn } = useAuth();
  const { guest, ready, setGuest } = useGuest();

  if (pathname === "/") return <Outlet />;

  if (isSignedIn || (ready && guest)) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <DemoGuide />
      </div>
    );
  }

  if (!isLoaded || !ready) {
    return (
      <div
        className="flex min-h-screen items-center justify-center surface-ice"
        role="status"
        aria-live="polite"
      >
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="sr-only">{hi ? "लोड हो रहा है" : "Loading"}</span>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-5 surface-ice px-4 py-12">
      <div className="absolute right-4 top-4">
        <LanguageToggle />
      </div>
      <SignIn routing="hash" forceRedirectUrl={pathname} signUpForceRedirectUrl={pathname} />
      <button type="button" onClick={() => setGuest(true)} className="btn-base btn-outline">
        {hi ? "अतिथि के रूप में देखें" : "Continue as guest"}
      </button>
    </div>
  );
}
