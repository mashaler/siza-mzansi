# Siza Mzansi — web app

Mobile-first MVP prototype for Siza Mzansi ("We help you access opportunities"),
built with React + Vite + Tailwind. All data is currently mocked in `src/App.jsx`
— there's no backend yet.

## Run it locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

## Build for production

```bash
npm run build
```

Outputs a static site to `dist/`.

## Deploy to Netlify

**Option A — connect a Git repo (recommended, gives you auto-deploys on every push):**

1. Push this folder to a GitHub (or GitLab/Bitbucket) repo.
2. In Netlify: **Add new site → Import an existing project** → pick the repo.
3. Netlify will read `netlify.toml` automatically:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Click **Deploy site**. Every future `git push` redeploys automatically.

**Option B — drag and drop (fastest, no auto-deploys):**

1. Run `npm run build` locally.
2. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
3. Drag the `dist/` folder onto the page.

Either way you get a free `*.netlify.app` URL immediately, and can attach a
custom domain later under **Site settings → Domain management**.

## Project structure

```
index.html          Vite entry HTML
src/main.jsx         React entry point
src/App.jsx           All screens + mock data (single file for now)
src/index.css         Tailwind + fonts + shared utility classes
netlify.toml          Netlify build + SPA redirect config
```
# siza-mzansi
