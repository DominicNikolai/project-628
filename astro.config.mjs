// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  build: {
    assets: 'static'
  },
  site: import.meta.env.DEV
    ? 'http://localhost:4321/'
    : 'https://dominicnikolai.github.io/project-239/',
  base: import.meta.env.DEV ? undefined : '/project-239/'
});
