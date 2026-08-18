# Siza Mzansi — web app

Mobile-first MVP for Siza Mzansi ("We help you access opportunities"),
built with React + Vite + Tailwind, backed by a real Supabase (Postgres)
database for auth, opportunities, saved jobs, applications and profiles.

## First-time setup

1. **Database**: in your Supabase project, go to **SQL Editor → New query**,
   paste in the entire contents of `supabase/schema.sql`, and run it. This
   creates every table, security rule, and the starter set of opportunities.
2. **Credentials**: copy `.env.example` to `.env` and fill in your project's
   URL and *publishable* (anon) key from **Project Settings → API Keys**.
   Never put the `secret` key in this file — it must never reach the browser.
3. Install and run:

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. Sign up for an account on first launch —
saved jobs, applications and your profile are all scoped to your user id.

## Build for production

```bash
npm run build
```

Outputs a static site to `dist/`.

## Deploy to Netlify

**Option A — connect a Git repo (recommended, gives you auto-deploys on every push):**

1. Push this folder to a GitHub (or GitLab/Bitbucket) repo — `.env` is
   gitignored, so your keys won't be committed.
2. In Netlify: **Add new site → Import an existing project** → pick the repo.
3. Netlify reads `netlify.toml` automatically (build: `npm run build`,
   publish: `dist`).
4. **Add your environment variables**: Site settings → Environment variables
   → add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with the same
   values from your `.env`. Without this step the deployed site can't talk
   to the database.
5. Click **Deploy site**. Every future `git push` redeploys automatically.

**Option B — drag and drop (fastest, no auto-deploys):**

1. Run `npm run build` locally (this bakes your local `.env` values into
   the build).
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
3. Drag the `dist/` folder onto the page.

Either way you get a free `*.netlify.app` URL immediately, and can attach a
custom domain later under **Site settings → Domain management**.

## Project structure

```
index.html            Vite entry HTML
public/                PWA icons + manifest
src/main.jsx           React entry point
src/App.jsx             All screens (single file for now)
src/index.css           Tailwind + fonts + shared utility classes
src/lib/supabaseClient.js  Supabase client (reads env vars)
src/lib/api.js             All database reads/writes in one place
src/lib/matching.js        Client-side match-score calculation
supabase/schema.sql         Database schema — run this in Supabase first
netlify.toml            Netlify build + SPA redirect config
```

## What's real vs. still a stub

**Real**: auth (sign up/login), profile, opportunities, saved jobs,
application tracking — all backed by Postgres via Supabase, scoped per
user with row-level security.

**Still a stub**: match-score reasoning is a simple keyword-overlap
heuristic (see `src/lib/matching.js`), not a real AI call. CV
build/review and interview-coach feedback are scripted, not AI-generated.
The scam checker uses regex pattern matching. The admin dashboard's
opportunity list is real, but its stats and reported-opportunities list
are still illustrative (no analytics queries or report-submission flow
built yet).

