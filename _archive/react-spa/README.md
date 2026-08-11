# Southwood site

Персональный лендинг на **React 19 + Vite 7**. Тексты — в `src/data/content.js`.

## Локально

```bash
npm install
cp .env.example .env
# впиши VITE_WEB3FORMS_ACCESS_KEY
npm run dev
```

Открыть: http://127.0.0.1:5173/

## Деплой (GitHub Pages)

Пуш в `master` → Actions собирает сайт и выкладывает на Pages.

Секрет репозитория: `VITE_WEB3FORMS_ACCESS_KEY` (ключ Web3Forms).

Кастомный домен: `southwood.pw` (файл `public/CNAME`).

DNS у регистратора (apex):

| Тип | Имя | Значение |
|-----|-----|----------|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `Southwoodd.github.io` |

В Settings → Pages включи Custom domain `southwood.pw` и Enforce HTTPS после проверки DNS.
