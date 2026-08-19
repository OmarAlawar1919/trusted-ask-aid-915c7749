# TERYaq — Evidence-Grounded Clinical Assistant

TERYaq is a breast-cancer-focused clinical education assistant. It answers
questions using retrieved clinical reference material and always shows the
evidence status, an evidence-match score, and traceable citations
(document, section, page).

> Educational information only — TERYaq does not provide diagnosis,
> personalized treatment recommendations, or medical advice.

## Features

- **Landing page** — hero with a live answer preview, mission section,
  "Why TERYaq" feature cards, a three-step process (Retrieve → Ground → Trace),
  source-traceability cards, and a get-started call to action.
- **Authentication** — email/password sign up and sign in plus Google
  sign-in, with a protected app area.
- **Chat** — ask questions and get answers with evidence badges, match
  scores, and citation cards.
- **History** — search and filter previous conversations by evidence level.
- **Saved evidence** — bookmark answers with their supporting sources.
- **Light/dark theme** — persisted per browser.

## Tech stack

- TanStack Start (React 19, TanStack Router, server functions) + Vite 7
- Tailwind CSS v4 (design tokens in `src/styles.css`) with shadcn-style UI
- Lovable Cloud (Postgres, auth, row-level security) for persistence

## Routes

| Path | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Landing page |
| `/auth?mode=signin\|signup` | Public | Sign in / create account |
| `/chat` | Signed in | Ask evidence-grounded questions |
| `/history` | Signed in | Browse past conversations |
| `/saved` | Signed in | Saved evidence |

Protected pages live under `src/routes/_authenticated/`, whose layout
redirects unauthenticated visitors to `/auth`.

## Backend

Schema (all tables have row-level security scoped to `auth.uid()`):

- `profiles` — display name and avatar for each account.
- `conversations` — `title` plus a `messages` JSONB array holding the chat
  turns, answers, citations, and evidence metadata.
- `saved_evidence` — a bookmarked `question` and its `answer` payload.

Data access goes through authenticated server functions in
`src/lib/chats.functions.ts` (`listConversations`, `upsertConversation`,
`removeConversation`, `listSavedEvidence`, `addSavedEvidence`,
`removeSavedEvidence`). `src/lib/store.tsx` loads from the database when a
user is signed in, debounces conversation writes, and falls back to
`localStorage` for signed-out visitors.

## Project structure

```text
src/
  routes/                 file-based routes (index, auth, _authenticated/*)
  components/app/         AppShell, AppSidebar, evidence + chat UI
  lib/                    store, theme, types, server functions
  services/chatApi.ts     answer generation / retrieval calls
  integrations/           Lovable Cloud client, auth middleware
  styles.css              Tailwind v4 theme tokens
```

## Local development

```bash
bun install
bun run dev
```

The app runs on http://localhost:8080.

### Environment

Cloud credentials are injected automatically (`VITE_SUPABASE_URL`,
`VITE_SUPABASE_PUBLISHABLE_KEY`). Set `VITE_API_BASE_URL` to point the chat
service at an external retrieval/answering API; without it the app uses
built-in sample data.
