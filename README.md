# Abhinav Chutani — Personal Portfolio

A minimalist, single-page personal portfolio built with pure HTML and Tailwind CSS (CDN). No build step. No dependencies. Just open `index.html`.

## Pages

| File | Description |
|------|-------------|
| `index.html` | Home — disciplines list with hover illustrations and skill modals |
| `about.html` | About — full bio, mastery progress bars, selected works, socials |

## Stack

- **HTML5** — semantic, hand-coded
- **Tailwind CSS** — via CDN (no build step required)
- **Vanilla JS** — custom cursor, scroll reveal, skill modals, loader animation
- **SVG** — all illustrations inline

## Features

- Animated loading screen with morphing progress bar → nav
- Custom cursor with magnetic hover effect
- Scroll-reveal for all rows
- Click any discipline row to open a detailed skill modal
- Skill mastery progress bars (about page)
- Fully responsive

## Deployment

This is a static site — deploy anywhere:

- **GitHub Pages**: push to `main`, enable Pages from repo settings, set source to `/ (root)`
- **Netlify / Vercel**: drag and drop the folder, or connect the repo

## Local Preview

No server needed. Just open `index.html` in any browser:

```bash
open index.html
```

Or use a local server for a cleaner experience:

```bash
npx serve .
```

---

© 2026 Abhinav Chutani
