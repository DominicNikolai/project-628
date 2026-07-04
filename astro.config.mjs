// @ts-check
import { defineConfig } from 'astro/config';
export default defineConfig({
  build: {
    assets: 'static'
  },
  site: import.meta.env.DEV
    ? 'http://localhost:4321/'
    : 'https://dominicnikolai.github.io/project-628/',
  base: import.meta.env.DEV ? undefined : '/project-628/'
});
