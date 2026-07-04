---
description: Clones a GitHub repo and consolidates its code into src/components/Hero.astro, downloading assets to public/assets/ and rewriting relative URLs.
agent: build
---

## Objective

Clone any GitHub repo (Astro, HTML, CSS, JS, or TS) and consolidate its entire source code into `src/components/Hero.astro`. All assets (images, fonts, etc.) go into `public/assets/` with their relative URLs rewritten to match.

## Steps

### 1. Get the URL

The user provided the GitHub URL as an argument to this command. Use it directly.

### 2. Clone the repo

Clone the repo into the current workspace:
```
git clone <url> temp-repo
```
If git fails, download the ZIP and extract it there.

### 3. Analyze the project structure

- If `astro.config.mjs` exists → **Astro**: find Hero pages/layouts/components
- If `index.html` exists → **HTML/CSS/JS**: read the full page
- If `package.json` exists but no HTML → look for `Hero` or entry scripts
- Otherwise → scan for the largest / most relevant source file

List the full directory tree before proceeding.

### 4. Consolidate code into Hero.astro

Read **every** relevant source file (HTML, CSS, JS, TS, Astro components) and combine them into a single `src/components/Hero.astro`:

- **Template section**: all HTML / JSX markup. Do NOT include `<html>`, `<head>`, `<body>`, or `<!doctype>` tags — this is an Astro component, not a layout.
- **`<style>` tag**: all CSS (merge and deduplicate)
- **`<script>` tag**: all JS/TS (merge, resolve imports, concatenate). Use `<script>` without any attributes.

Do NOT use `import * as THREE from 'three'` — destructure only what you need (`{ ... }`).

Remove all comments from the `<script>` section.

### 5. Handle assets

Find all asset references in the code:
- Images: `.png` `.jpg` `.jpeg` `.gif` `.svg` `.webp` `.avif`
- Fonts: `.woff` `.woff2` `.ttf` `.otf`
- Other static files referenced in the code

For each asset:
- Copy it to `public/assets/` (create the dir if missing)
- If a filename collision occurs, prefix with the source directory name
- Rewrite every relative URL (e.g. `./images/foo.png`, `../assets/bar.jpg`) to `/assets/<filename>`

### 6. Verify

- Re-read `src/components/Hero.astro` and confirm no broken asset paths reHero
- Check that no `import * as THREE from 'three'` slipped in
- Confirm no comments exist in `<script>`
- Confirm no `<html>`, `<head>`, `<body>`, or `<!doctype>` tags exist

### 7. Clean up

Remove `temp-repo` when done.

### 8. Signal

Send: 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢End

