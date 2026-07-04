---
description: "Fetch a CodePen URL and integrate it into Hero.astro. Use: /hero-add <url>"
---

# Hero Add Command

The user provided a CodePen URL: $ARGUMENTS

Your task is to:
1. Fetch the full page content of that URL using webfetch
2. Extract the HTML (inside `<body translate="no">`), the CSS (inside `<style>` tags), and the JS (inside `<script id="rendered-js">`)
3. Read the current `src/components/Hero.astro` file
4. Integrate the fetched code into Hero.astro:
   - Keep the existing 3D cube HTML
   - Add the new HTML from the CodePen (typically after the cubes)
   - Convert any SCSS/SASS to plain CSS if needed
   - Add the CSS in a `<style>` tag
   - Add the JS in a `<script>` tag, using `import gsap from 'gsap'` if GSAP is needed (it's already installed)
5. If the CodePen uses external libraries (like GSAP), check if they're in package.json first
6. Run `pnpm run build` to verify it compiles without errors
7. If there are build errors, fix them
