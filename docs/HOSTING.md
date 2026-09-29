# Hosting

The arcade is plain static files (no server, no build), so any static host works.

| Where | Role | How it updates |
|---|---|---|
| **Vercel** | Primary: https://arcade-games-two.vercel.app | Redeploys on every push to `main`. Every other branch gets a private preview build. Headers and redirects come from `vercel.json`. |
| **Cloudflare Pages** | Free mirror (a second URL that serves the same site) | Rebuilds from `main` the same way once connected (steps below). |
| GitHub Pages | Only Math Quest Runner, in its own repository | Push to its `main`. |

A mirror is a second address you can hand out or fall back on. It does not switch over by itself if one host is down.

## Set up the Cloudflare Pages mirror (one time, about five minutes)

1. Sign in at https://dash.cloudflare.com and open **Workers & Pages**, then **Create**, then the **Pages** tab, then **Connect to Git**.
2. Let Cloudflare's GitHub app access **only** the `zaarno-learning-arcade` repository, and select it.
3. Project name: `learning-arcade` (your mirror will be `https://learning-arcade.pages.dev`).
4. Production branch: `main`. Framework preset: **None**.
5. Build command: `node tools/build-dist.mjs`. Build output directory: `dist`.
6. Add an environment variable `NODE_VERSION` = `22`.
7. **Save and Deploy.** Later pushes to `main` redeploy on their own, and other branches get preview URLs.

The build script copies just the pages and screenshots into `dist/` and writes two files Cloudflare understands, `_headers` (the same Content-Security-Policy and other security headers as Vercel) and `_redirects` (the same old-URL redirects). Both are generated from `vercel.json`, so the two hosts cannot drift apart. Netlify reads the same two files, so it works there too: build command `node tools/build-dist.mjs`, publish directory `dist`.

Cloudflare Pages serves `mathman.html` at `/mathman` on its own, like Vercel's `cleanUrls`.

## Check a build locally

```bash
node tools/build-dist.mjs
```

This writes `dist/` and fails if any page links to a file that is missing. To look at it, serve the folder (`python -m http.server 8000 --directory dist`). Local servers do not apply `_headers`, so headers are only tested on the real host: open the mirror in a browser and check that the games start (a wrong Content-Security-Policy shows up as a blank or frozen game).

## Notes

- Nothing here needs secrets. Neither host is given tokens, and the games make no network requests.
- If you add a custom domain later, point it at one host and keep the other as the backup address.