# Southwood site

Персональный лендинг на **Astro** (статика + React-острова для HUD/формы/scramble).
Тексты — в `src/data/content.js` (перенесём в задаче 2).

## Локально

```bash
npm install
cp .env.example .env
# впиши VITE_WEB3FORMS_ACCESS_KEY
npm run dev
```

Открыть: http://127.0.0.1:4321/

Фоновый dev (как в AGENTS.md): `astro dev --background`

## Деплой (GitHub Pages)

Пуш в `master` → Actions собирает сайт и выкладывает на Pages.

Секрет репозитория: `VITE_WEB3FORMS_ACCESS_KEY` (ключ Web3Forms).

Кастомный домен: `southwood.pw` (файл `public/CNAME`).
