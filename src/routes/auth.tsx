import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import logoAsset from "@/assets/teryaq-logo-mark.jpg.asset.json";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).catch("signin"),
});

const credentials = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(255),
  password: z.string().min(8, "Password must be at least 8 characters.").max(72),
  fullName: z.string().trim().max(120).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign In or Create Account | TERYaq" },
      {
        name: "description",
        content:
          "Sign in to TERYaq to ask evidence-grounded breast cancer questions and keep your conversations and saved evidence.",
      },
      { property: "og:title", content: "Sign In or Create Account | TERYaq" },
      {
        property: "og:description",
        content: "Access your TERYaq conversations and saved clinical evidence.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const isSignup = mode === "signup";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/chat", replace: true });
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        navigate({ to: "/chat", replace: true });
      }
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    const parsed = credentials.safeParse({ email, password, fullName });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your details.");
      return;
    }

    setBusy(true);
    try {
      if (isSignup) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: parsed.data.fullName ?? "" },
          },
        });
        if (signUpError) {
          setError(signUpError.message);
        } else if (!data.session) {
          setNotice("Check your email to confirm your account, then sign in.");
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (signInError) setError(signInError.message);
      }
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setError(null);
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError("Google sign-in failed. Please try again.");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/chat", replace: true });
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-navy px-5 py-12 text-navy-foreground">
      <div className="w-full max-w-md">
        <Link to="/" className="mx-auto flex w-fit items-center gap-2.5">
          <img src={logoAsset.url} alt="TERYaq" className="h-9 w-9 rounded-lg object-cover" />
          <span className="font-display text-xl font-bold tracking-tight">TERYaq</span>
        </Link>

        <div className="mt-8 rounded-2xl border border-sidebar-border bg-sidebar-primary/40 p-7">
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {isSignup ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-navy-foreground/70">
            {isSignup
              ? "Start asking evidence-grounded breast cancer questions."
              : "Sign in to continue your evidence-grounded conversations."}
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {isSignup && (
              <div>
                <label htmlFor="fullName" className="text-xs text-navy-foreground/70">
                  Full name
                </label>
                <input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  maxLength={120}
                  autoComplete="name"
                  className="mt-1 w-full rounded-lg border border-sidebar-border bg-navy px-3 py-2.5 text-sm outline-none focus:border-teal"
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="text-xs text-navy-foreground/70">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
                autoComplete="email"
                className="mt-1 w-full rounded-lg border border-sidebar-border bg-navy px-3 py-2.5 text-sm outline-none focus:border-teal"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-xs text-navy-foreground/70">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                maxLength={72}
                autoComplete={isSignup ? "new-password" : "current-password"}
                className="mt-1 w-full rounded-lg border border-sidebar-border bg-navy px-3 py-2.5 text-sm outline-none focus:border-teal"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            {notice && <p className="text-sm text-teal">{notice}</p>}

            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              {isSignup ? "Create account" : "Sign in"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-navy-muted">
            <span className="h-px flex-1 bg-sidebar-border" aria-hidden />
            or
            <span className="h-px flex-1 bg-sidebar-border" aria-hidden />
          </div>

          <button
            type="button"
            onClick={onGoogle}
            disabled={busy}
            className="w-full rounded-lg border border-sidebar-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-sidebar-accent disabled:opacity-60"
          >
            Continue with Google
          </button>

          <p className="mt-6 text-center text-sm text-navy-foreground/70">
            {isSignup ? "Already have an account?" : "New to TERYaq?"}{" "}
            <Link
              to="/auth"
              search={{ mode: isSignup ? "signin" : "signup" }}
              className="text-teal hover:underline"
            >
              {isSignup ? "Sign in" : "Create one"}
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-navy-foreground/50">
          Educational information only — not a diagnosis or medical advice.
        </p>
      </div>
    </main>
  );
}
