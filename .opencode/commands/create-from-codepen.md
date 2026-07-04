---
description: Fetches a CodePen and consolidates its HTML/CSS/JS into src/components/Hero.astro using npm packages (never CDN script tags).
agent: build
---

## Objective

Fetch any CodePen by URL and consolidate its HTML, CSS, and JS into `src/components/Hero.astro`. External assets (images, fonts, etc.) go into `public/assets/` with their relative URLs rewritten.

## Critical rules (do not break these)

1. **NEVER use CDN `<script>` tags** — In Astro 2026, CDN script tags cause CORS errors (`No 'Access-Control-Allow-Origin' header`) and fail with UMD strict-mode errors (`Cannot set property window of #<Window>`). Always install via `pnpm i` and use ES module imports.
2. **Always fetch and merge ALL external resources** listed in the pen's `resources` array (CSS and JS from other CodePens or CDNs). Missing external CSS is the most common hidden bug — pens often import base styles, CSS variables, or flair/sprite styling from another pen.
3. **Always run `pnpm i`** after adding any new npm dependency.
4. **Always run `pnpm build`** at the end to verify no errors.
5. Use `<script>` without attributes (Astro bundles it as a module).
6. Use `:global()` in `<style>` for selectors that target elements outside the component (`html`, `body`, `:root`, `svg`, `path`, `#id`).
7. Write TypeScript in the `<script>` block — destructure imports, add explicit types.

## Steps

### 1. Parse the URL

```
https://codepen.io/{user}/pen/{penId}
```

Extract `{user}` and `{penId}`.

### 2. Fetch the pen data

Try sources in this order:

**Primary: `__NEXT_DATA__` from the pen page**
```
https://codepen.io/{user}/pen/{penId}
```
Fetch this as `text`. Search for `"__item":"` — extract the JSON value from `"__item":"{...}"`. The value is a single-line JSON string with keys: `html`, `css`, `js`, `resources` (array of external deps), `html_pre_processor`, `css_pre_processor`, `js_pre_processor`, etc. Parse this JSON to get the source code and all external resource URLs.

**How to extract `resources` from the page JSON:**
```
"__item":"{\"html\":\"...\",\"css\":\"...\",\"js\":\"...\",\"resources\":[{\"url\":\"https://...\",\"order\":0,\"resource_type\":\"css\",\"par_content\":\"\"},...]}"
```
Each entry in `resources` has:
- `url`: the full URL to fetch
- `resource_type`: `"css"` or `"js"`
- `order`: load order (lower = first)
- `par_content`: pre-compiled content (usually empty for external URLs)

**Fallback: raw file URLs**
```
https://codepen.io/{user}/pen/{penId}/raw/index.html
https://codepen.io/{user}/pen/{penId}/raw/style.css
https://codepen.io/{user}/pen/{penId}/raw/script.js
```

**Last resort: embed/debug URL**
```
https://cdpn.io/{user}/debug/{penId}
```

### 3. Fetch and merge ALL external resources

After getting the pen's own HTML/CSS/JS, the `resources` array from `__item` lists every external dependency the pen author added. **You MUST process every entry.**

For each resource in `resources`:

#### If `resource_type` is `"css"`:
1. Fetch the `url` with `webfetch` (format: `text`)
2. If it returns content (status 200):
   - **Merge ALL of it** into the component's `<style>` block
   - Do NOT drop or deduplicate rules — the pen depends on them
   - Place it before the pen's own CSS so the pen's CSS can override
   - If the fetched CSS defines custom properties (`:root { ... }`), keep them; they're needed by the pen
3. If it fails (403, 404):
   - **State clearly in output**: "WARNING: Could not fetch external CSS from {url}. The pen may be missing styles. You may need to manually fetch the source pen's CSS and merge it."
   - Then try fetching the pen page from the `url` (the format is `https://codepen.io/{user}/pen/{otherPenId}/...` — extract the pen ID) to get its source via `__NEXT_DATA__` as a fallback

#### If `resource_type` is `"js"`:
1. Check if the URL is a CDN library (unpkg.com, cdnjs.cloudflare.com, jsdelivr.net, etc.):
   - Search npm for the corresponding package
   - Install with `pnpm i <package>`
   - Import as ES module in `<script>`
   - **NEVER** add a CDN `<script>` tag
2. If the URL is from another CodePen:
   - Try to fetch it; if it fails, note it as a warning
   - These are typically transpiled/bundled JS and may need manual handling

### 4. Download all external assets to `public/assets/`

From the pen data, find every external URL:

- **Images**: `.png` `.jpg` `.jpeg` `.gif` `.svg` `.webp` `.avif`
- **Fonts**: `.woff` `.woff2` `.ttf` `.otf`
- **Any other static file** hosted on an external domain

**Steps:**

1. Extract all `https://` URLs from the HTML, CSS, and JS of the pen
2. For each URL, download the file with `curl -sL -H "Referer: https://codepen.io/" -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" "<url>" -o "public/assets/<filename>"` (Codepen's CDN checks the Referer header — without it you get an HTML error page instead of the real file)
3. Rewrite every reference in `<style>` and `<template>` from the full URL to `/assets/<filename>`
4. Remove any CSS `@font-face` blocks that reference external URLs — move them to global CSS or embed them properly
5. Remove any CSS `url("https://...")` noise-texture patterns since those are unique to each external host and won't work locally

**Important**: Do NOT skip files that fail to download — report which ones failed so the user knows what's missing.

### 5. Consolidate into Hero.astro

Combine everything into `src/components/Hero.astro`:

- **Template section**: the pen's HTML markup. Remove `<html>`, `<head>`, `<body>`, and `<!doctype>` tags.
- **`<style>` tag**: external CSS FIRST (from `resources`), then the pen's own CSS. Use `:global()` for selectors that must apply outside the component (`html`, `body`, `:root`, etc.). Component-scoped selectors (`.container`, `.carousel`, etc.) work automatically.
- **`<script>` tag**: all JS as TypeScript. Use ES module imports for npm packages. Remove all comments from the JS code.

### 6. Verify

```sh
pnpm build
```

- Confirm no build errors
- Confirm no CDN `<script>` tags in the output
- Confirm no `<html>`, `<head>`, `<body>`, or `<!doctype>` tags in the template
- Confirm no comments exist in `<script>`
- Confirm every CSS variable used (e.g. `var(--mid)`, `var(--light)`) has either:
  - A `:root` definition in the CSS, OR
  - Was provided by a fetched external resource
  - If not, add a fallback: `color: var(--mid, #888);` or define `:root { --mid: #888; }`
- Confirm no external `<script>` tags (from CDNs or other CodePens) remain in the template

### 7. Signal

Send: 🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢🟢End
