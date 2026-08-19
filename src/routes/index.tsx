import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Moon,
  PlusCircle,
  Sun,
} from "lucide-react";
import { useTheme } from "@/lib/theme";
import { EvidenceBadge } from "@/components/app/EvidenceBadge";
import logoAsset from "@/assets/teryaq-logo.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TERYaq — Evidence-Grounded Breast Cancer Answers" },
      {
        name: "description",
        content:
          "TERYaq answers breast cancer questions with evidence status, evidence-match scores and traceable citations from trusted clinical references.",
      },
      { property: "og:title", content: "TERYaq — Evidence-Grounded Breast Cancer Answers" },
      {
        property: "og:description",
        content:
          "Explore breast cancer information through answers grounded in trusted clinical references, with transparent evidence and source traceability.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

const features = [
  {
    icon: PlusCircle,
    title: "Breast Cancer Focus",
    body: "Specialized in breast cancer clinical education and evidence-based information.",
  },
  {
    icon: FileText,
    title: "Trusted References",
    body: "Answers are grounded in a controlled collection of clinical reference documents.",
  },
  {
    icon: CheckCircle2,
    title: "Evidence Traceability",
    body: "See the document, section, page, and supporting evidence behind an answer.",
  },
  {
    icon: Clock,
    title: "Grounded Answers",
    body: "Relevant retrieved evidence is used to support generated responses.",
  },
] as const;

const steps = [
  {
    n: "01",
    title: "Retrieve",
    body: "Relevant information is retrieved from available clinical references.",
  },
  { n: "02", title: "Ground", body: "The response is generated using the retrieved evidence." },
  {
    n: "03",
    title: "Trace",
    body: "Supporting sources remain visible so users can understand where the information came from.",
  },
] as const;

const sources = [
  {
    badge: "WHO",
    score: "0.87",
    source: "WHO",
    topic: "Breast Cancer",
    section: "Screening",
    page: "24",
    id: "WHO-BC-2023-001",
  },
  {
    badge: "USPSTF",
    score: "0.81",
    source: "USPSTF",
    topic: "Breast Cancer Screening",
    section: "Benefits & Harms",
    page: "5",
    id: "USPSTF-BC-2024",
  },
  {
    badge: "IARC",
    score: "0.74",
    source: "IARC",
    topic: "Cancer Prevention",
    section: "Mammography",
    page: "117",
    id: "IARC-HANDB-2016",
  },
] as const;

function Eyebrow({ children }: { children: string }) {
  return (
    <p className="text-xs font-semibold tracking-[0.16em] text-teal uppercase">{children}</p>
  );
}

function LandingPage() {
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-dvh bg-background">
      <header className="bg-navy text-navy-foreground">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-4 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logoAsset.url} alt="TERYaq" className="h-8 w-8 rounded-lg object-cover" />
            <span className="font-display text-lg font-bold tracking-tight">TERYaq</span>
          </Link>

          <nav aria-label="Primary" className="ml-auto hidden items-center gap-7 text-sm md:flex">
            <a href="#about" className="text-navy-foreground/80 hover:text-navy-foreground">
              About
            </a>
            <a href="#how-it-works" className="text-navy-foreground/80 hover:text-navy-foreground">
              How It Works
            </a>
            <a href="#evidence" className="text-navy-foreground/80 hover:text-navy-foreground">
              Evidence
            </a>
          </nav>

          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle dark mode"
            className="ml-auto grid h-9 w-9 place-items-center rounded-lg border border-sidebar-border md:ml-4"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" aria-hidden />
            ) : (
              <Moon className="h-4 w-4" aria-hidden />
            )}
          </button>

          <Link
            to="/auth"
            search={{ mode: "signin" }}
            className="rounded-lg bg-sidebar-accent px-4 py-2 text-sm font-medium transition-colors hover:bg-sidebar-primary"
          >
            Sign In
          </Link>
          <Link
            to="/auth"
            search={{ mode: "signup" }}
            className="hidden rounded-lg bg-background px-4 py-2 text-sm font-medium text-foreground transition-opacity hover:opacity-90 sm:block"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-navy text-navy-foreground">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-sidebar-border px-4 py-1.5 text-[11px] font-medium tracking-[0.14em] text-teal uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-teal" aria-hidden />
              Focused on breast cancer
            </span>
            <h1 className="mt-7 font-display text-4xl leading-[1.08] font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Evidence-grounded answers for breast cancer.
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-navy-foreground/70">
              Explore breast cancer information through answers grounded in trusted clinical
              references, with transparent evidence and source traceability.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/auth"
                search={{ mode: "signup" }}
                className="rounded-lg bg-background px-6 py-3 text-sm font-medium text-foreground transition-opacity hover:opacity-90"
              >
                Get Started
              </Link>
              <Link
                to="/auth"
                search={{ mode: "signin" }}
                className="rounded-lg bg-sidebar-accent px-6 py-3 text-sm font-medium transition-colors hover:bg-sidebar-primary"
              >
                Sign In
              </Link>
            </div>
            <p className="mt-9 text-sm text-teal">
              Evidence-grounded <span className="text-navy-muted">·</span> Source-traceable{" "}
              <span className="text-navy-muted">·</span> Reference-backed
            </p>
          </div>

          {/* Answer preview */}
          <div className="rounded-2xl border border-sidebar-border bg-sidebar-primary/40">
            <div className="border-b border-sidebar-border p-6">
              <div className="flex flex-wrap items-center gap-4">
                <EvidenceBadge status="Strong" score={0.87} />
                <p className="text-xs text-navy-foreground/60">
                  Evidence-grounded · Source-traceable
                </p>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-navy-foreground/90">
                Breast cancer screening may reduce mortality through early detection, though it is
                also associated with potential harms including false-positive results and
                overdiagnosis.
              </p>
              <div className="mt-5 flex flex-wrap gap-2 font-mono text-[11px] text-teal">
                <span className="rounded-md border border-sidebar-border px-2 py-1">
                  WHO-BC-2023-001 · p.24
                </span>
                <span className="rounded-md border border-sidebar-border px-2 py-1">
                  USPSTF-BC-2024 · p.5
                </span>
              </div>
            </div>
            <div className="p-6">
              <p className="text-xs text-navy-foreground/60">Evidence used to generate this answer</p>
              <ul className="mt-3 space-y-2">
                {[
                  { n: "01", src: "WHO", title: "Breast Cancer Reference", page: 24, score: "0.87" },
                  {
                    n: "02",
                    src: "USPSTF",
                    title: "Breast Cancer Screening",
                    page: 5,
                    score: "0.74",
                  },
                ].map((c) => (
                  <li
                    key={c.n}
                    className="flex items-center gap-4 rounded-xl border border-sidebar-border px-4 py-3"
                  >
                    <span className="font-mono text-[11px] text-navy-muted">{c.n}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">
                        <span className="font-semibold">{c.src}</span>
                        <span className="text-navy-foreground/70"> — {c.title}</span>
                      </p>
                      <p className="text-xs text-navy-foreground/60">Page {c.page}</p>
                    </div>
                    <span className="font-mono text-sm text-teal">{c.score}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="border-b border-border bg-secondary">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <Eyebrow>Focused on breast cancer</Eyebrow>
          <h2 className="mt-4 max-w-2xl font-display text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
            Clinical information, grounded in evidence.
          </h2>
          <p className="mt-5 max-w-2xl leading-relaxed text-muted-foreground">
            TERYaq is designed to help users explore breast cancer information through trusted
            clinical references and transparent evidence.
          </p>
        </div>
      </section>

      {/* Why TERYaq */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <Eyebrow>Why TERYaq</Eyebrow>
        <h2 className="mt-4 font-display text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
          Built around evidence, not guesswork.
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, body }) => (
            <article
              key={title}
              className="rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-soft text-teal">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-5 text-base font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-secondary">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <Eyebrow>The process</Eyebrow>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            How TERYaq works
          </h2>
          <ol className="mt-12 grid gap-10 sm:grid-cols-3">
            {steps.map(({ n, title, body }) => (
              <li key={n} className="relative">
                <span className="grid h-16 w-16 place-items-center rounded-full border border-border bg-card font-mono text-sm text-teal">
                  {n}
                </span>
                <h3 className="mt-6 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Source traceability */}
      <section id="evidence" className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <Eyebrow>Source traceability</Eyebrow>
        <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          See where the answer comes from.
        </h2>
        <p className="mt-4 text-muted-foreground">
          Every answer links back to specific documents, pages, and sections.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sources.map((s) => (
            <article
              key={s.id}
              className="rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-navy font-mono text-[10px] font-bold text-navy-foreground">
                  {s.badge}
                </span>
                <span className="font-mono text-lg text-teal">{s.score}</span>
              </div>
              <dl className="mt-5 space-y-2 text-sm">
                {[
                  ["Source", s.source],
                  ["Topic", s.topic],
                  ["Section", s.section],
                  ["Page", s.page],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-4">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="text-right font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 border-t border-border pt-4 font-mono text-xs text-muted-foreground">
                {s.id}
              </p>
            </article>
          ))}
        </div>
        <p className="mt-6 text-sm italic text-muted-foreground">
          Evidence Match represents retrieval relevance, not medical accuracy.
        </p>
      </section>

      {/* Get started */}
      <section className="bg-navy text-navy-foreground">
        <div className="mx-auto max-w-2xl px-5 py-20 text-center sm:px-8">
          <Eyebrow>Get started</Eyebrow>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Start exploring TERYaq.
          </h2>
          <p className="mt-5 leading-relaxed text-navy-foreground/70">
            Sign in to ask evidence-grounded questions and access your conversations.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="rounded-lg bg-background px-6 py-3 text-sm font-medium text-foreground transition-opacity hover:opacity-90"
            >
              Get Started
            </Link>
            <Link
              to="/auth"
              search={{ mode: "signin" }}
              className="rounded-lg bg-sidebar-accent px-6 py-3 text-sm font-medium transition-colors hover:bg-sidebar-primary"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <div className="border-y border-border bg-secondary">
        <div className="mx-auto flex max-w-6xl items-start gap-3 px-5 py-5 sm:px-8">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <p className="text-sm text-muted-foreground">
            Educational information only — TERYaq does not provide diagnosis, personalized treatment
            recommendations, or medical advice.
          </p>
        </div>
      </div>

      <footer className="bg-navy text-navy-foreground">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-6 px-5 py-10 sm:px-8">
          <div className="min-w-56 flex-1">
            <p className="font-display text-lg font-bold tracking-tight">TERYaq</p>
            <p className="mt-1 text-sm text-navy-foreground/60">
              Evidence-grounded breast cancer clinical education.
            </p>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-6 text-sm">
            <Link to="/" className="text-navy-foreground/80 hover:text-navy-foreground">
              Home
            </Link>
            <Link to="/chat" className="text-navy-foreground/80 hover:text-navy-foreground">
              Chat
            </Link>
            <Link to="/history" className="text-navy-foreground/80 hover:text-navy-foreground">
              History
            </Link>
            <Link to="/saved" className="text-navy-foreground/80 hover:text-navy-foreground">
              Evidence
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
