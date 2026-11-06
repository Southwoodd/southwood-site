# Страницы

Карта всех страниц и правила роутинга — в [../../SPEC.md](../../SPEC.md), раздел 3.

Коротко: статичные страницы лежат рядом, динамические собираются из данных:

- `uslugi/[slug].astro` — услуги из `SERVICES` в `src/i18n/routes.ts`
- `kejsy/[slug].astro` — кейсы из `CASE_META` там же
- `dlya/[slug].astro` — отрасли из `src/i18n/industries.ts`
- `blog/[...slug].astro` — статьи из `src/blog/*.md` (`draft: true` = черновик)
- `ui.astro`, `ui-reel.astro` — служебная библиотека компонентов, в sitemap не попадают
