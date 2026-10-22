// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import { readdirSync, readFileSync } from 'node:fs';

// Черновики блога собираются для проверки, но в карту сайта не попадают
const posts = readdirSync('./src/blog').filter((f) => f.endsWith('.md')).map((f) => ({ slug: f.replace(/\.md$/, ''), draft: /^draft:\s*true/m.test(readFileSync(`./src/blog/${f}`, 'utf8')) }));
const drafts = posts.filter((p) => p.draft).map((p) => `/blog/${p.slug}/`);
const blogLive = posts.some((p) => !p.draft);

// Кейсы раньше лежали по адресу /cases/<слаг>, теперь по /kejsy/<слаг>. Список слагов берем из маршрутов, чтобы не вести его вторым списком
const oldCases = Object.fromEntries(
  [...readFileSync('./src/i18n/routes.ts', 'utf8').matchAll(/slug: '([a-z0-9-]+)'/g)].map((m) => [`/cases/${m[1]}`, `/kejsy/${m[1]}/`])
);

// Канонический домен — sitemap и SEO опираются на него.
// Статика в dist/, base `/` — подходит для GitHub Pages + custom domain southwood.pw
export default defineConfig({
  site: 'https://southwood.pw',
  // Адреса прошлой версии сайта: уводим на новые страницы, чтобы в поиске не висели ошибки 404
  redirects: { '/cases': '/kejsy/', '/en': '/', ...oldCases },
  integrations: [
    // Новый сайт: острова на Preact. Старые компоненты на React оставлены до удаления старых страниц
    preact({ include: ['**/pricing/**'] }),
    react({ include: ['**/components/*.tsx'] }),
    sitemap({
      // Служебная библиотека компонентов — не в sitemap
      filter: (page) => !page.includes('/ui') && !drafts.some((d) => page.endsWith(d)) && (blogLive || !page.endsWith('/blog/')),
    }),
  ],
});
