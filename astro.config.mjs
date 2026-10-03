// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';

// Канонический домен — sitemap и SEO опираются на него.
// Статика в dist/, base `/` — подходит для GitHub Pages + custom domain southwood.pw
export default defineConfig({
  site: 'https://southwood.pw',
  integrations: [
    // Новый сайт: острова на Preact. Старые компоненты на React оставлены до удаления старых страниц
    preact({ include: ['**/pricing/**'] }),
    react({ include: ['**/components/*.tsx'] }),
    sitemap({
      // Служебная библиотека компонентов — не в sitemap
      filter: (page) => !page.includes('/ui'),
    }),
  ],
});
