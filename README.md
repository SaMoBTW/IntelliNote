# IntelliNote

Study companion UI (Vite + React + TypeScript + Tailwind) backed by **Supabase Auth** and a **`documents`** table for My Library. Original Figma: https://www.figma.com/design/OpHArKb5EzeYMczJWU94ed/IntelliNote

## Requirements

- Node.js 20+ recommended
- A [Supabase](https://supabase.com) project

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (default **http://localhost:5173**).

### Environment (required)

Credentials are **only** loaded from env vars (nothing is embedded in the repo).

1. Copy `.env.example` to `.env.local`.
2. In the [Supabase](https://supabase.com) dashboard: **Project Settings → API**, copy **Project URL** and the **anon public** key into `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Restart `npm run dev` after any change to `.env.local`.

If either variable is missing or empty, the app shows a short setup screen instead of the login form.

### Database

Run these migrations in order (SQL Editor or `supabase db push`):

1. `supabase/migrations/20250412120000_create_documents.sql` — `documents` table  
2. `supabase/migrations/20250412140000_study_features.sql` — summaries, flashcards, quizzes, attempts, and document `body_text` / progress fields  

Every table uses **Row Level Security** so each user only sees their own rows.

### Auth

- **Email / password**: Sign up and sign in on the login screen. If your project requires email confirmation, you will get a toast and must confirm before signing in.
- **Google**: Enable the Google provider under **Authentication → Providers** and add redirect URLs (e.g. `http://localhost:5173` and your production URL).

## Other scripts

| Command | Purpose |
|--------|---------|
| `npm run build` | Typecheck + production bundle to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | `tsc --noEmit` only |

## Edge functions

Optional Deno/Hono scaffold (KV store) lives under `supabase/functions/server/`. The main app talks to Supabase directly from the browser for auth and documents.
