# Abhinav Chutani — Portfolio

Personal portfolio site. Static HTML/CSS/JS with a lightweight Vite workflow for development and production builds.

## Pages

| File | What it is |
|------|------------|
| `index.html` | Home — impact-led landing page with the discipline list, hover illustrations, and skill detail modal |
| `about.html` | About — richer profile page with hero, selected work, connections graph, and current-focus sections |
| `src/styles/` | Page-specific stylesheets extracted out of the HTML wrappers |
| `src/scripts/` | Page-specific JavaScript modules |
| `src/data/graph-data.js` | Content file for the Connections mind map — nodes, edges, and hover-card details |
| `vite.config.js` | Multi-page Vite configuration for local dev and production builds |
| `vercel.json` | Static hosting config for clean Vercel deployment |

## Stack

- **Vanilla HTML/CSS/JS**
- **Vite** — multi-page dev server and production build pipeline
- **COBE** (`esm.sh/cobe@0.6.3`) — WebGL globe with arc paths (Delhi ↔ Helsinki ↔ Detroit)
- **Three.js** (`esm.sh/three@0.158.0`) — force-directed 3D knowledge graph on desktop
- **Canvas 2D** — mobile circle graph, torus portfolio canvas on index, interactive mesh hero background
- **Google Fonts** — Inter + Playfair Display + Space Mono
- **Puppeteer** (dev-only) — screenshot verification during development

## Features

- Hand-coded static portfolio with thin page wrappers and extracted assets
- Stronger first-glance hierarchy for academics, recruiters, and competition reviewers
- Responsive desktop/mobile layouts with simplified phone UX
- Custom cursor, animated loader, theme toggle, and inline SVG illustration system
- Desktop interactions: globe, draggable portfolio canvas, and 3D connections graph
- Mobile interactions: stacked sections, tap-based work cards, and 2D graph alternative

## Local Preview

```bash
npm install
npm run dev
```

Then open `http://127.0.0.1:8000`.

To preview the production bundle locally:

```bash
npm run build
npm run preview
```

## Deployment

This repo is already set up for static deployment through [Vercel](https://vercel.com/).

```bash
npm install
npx vercel
```

For a production deploy:

```bash
npm run deploy:vercel
```

Recommended first-time flow:

1. Run `npx vercel` from the project root and complete `vercel login` if prompted.
2. Link the project when Vercel asks.
3. Deploy a preview first, then run `npm run deploy:vercel` for production.
4. Add your custom domain in the Vercel dashboard under Project → Settings → Domains.

## Editing content

- **Home page skill modals**: edit the `SKILL_DATA` array in `src/scripts/index.js`
- **Mind map nodes and stories**: edit `src/data/graph-data.js`
- **Works / projects** on the about page: edit the `NODES` / `WORKS` content blocks in `src/scripts/about.js`
- **Current focus** section: edit the `.quest-item` HTML blocks in `about.html`

---

© 2026 Abhinav Chutani
