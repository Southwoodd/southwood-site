# Прием заявок на Cloudflare Workers

Замена `server/lead-server.mjs`. Отличия от прежнего сервера:

- заявки нигде не хранятся, уходят только в Telegram и на почту;
- PDF расчета лежит в R2 отведенный срок: в Telegram вложением, в письме ссылкой на `/pdf/<файл>`;
- очереди повторной отправки, счетчики блога и защита от повторов живут в D1;
- вместо `setInterval` расписание Cloudflare: разбор очереди раз в минуту, уборка раз в шесть часов.

Почта по-прежнему уходит своим SMTP с порта 465. Порт 25 из воркера закрыт, 465 разрешен.

## Адреса

| Адрес | Что делает |
| --- | --- |
| `POST /lead` | заявка и сообщение с сайта |
| `GET /stat?p=<статья>` | счетчики статьи |
| `POST /stat` | отметка «дочитал» или «поделился» |
| `GET /pdf/<файл>` | файл расчета по ссылке из письма |
| `GET /health` | длина обеих очередей |

## Локально

```bash
cd worker
npm install
npx wrangler d1 execute southwood-lead --local --file schema.sql -y
npx wrangler dev --local --port 8799
```

В другом окне:

```bash
node test-build.mjs   # разбор заявки, 16 проверок
node test-http.mjs    # адреса, 15 проверок
```

Без секретов оба канала отваливаются, и заявка ложится в очередь: так и задумано, это проверка очереди.
Перед повторным прогоном почистить `hits`, иначе упрется в ограничение частоты:

```bash
npx wrangler d1 execute southwood-lead --local -y --command 'delete from hits; delete from queue; delete from seen; delete from stats'
```

## Разворачивание

```bash
npx wrangler d1 create southwood-lead          # id из вывода вписать в wrangler.toml
npx wrangler r2 bucket create southwood-lead-pdf
npx wrangler d1 execute southwood-lead --file schema.sql -y
for k in TG_BOT_TOKEN TG_CHAT_ID SMTP_HOST SMTP_USER SMTP_PASS MAIL_TO; do npx wrangler secret put $k; done
npx wrangler deploy
```

Значения секретов те же, что в `/etc/southwood/form.env` на прежнем сервере.

Пока домен не переключен, воркер отвечает на адресе `*.workers.dev`. В `ALLOWED_ORIGINS` при этом ничего
менять не надо: там перечислены адреса сайта, откуда приходят формы, а не адрес самого воркера.
А вот в `PUBLIC_BASE` на время проверки нужно вписать этот самый `*.workers.dev`, иначе ссылка на расчет
в письме будет указывать на еще не переключенный `api.southwood.pw`.

## Что поменять в сайте при переключении

- `src/i18n/ru.ts` — адрес приема заявок;
- `src/pages/blog/[...slug].astro` — адрес счетчиков;
- счетчики из `stats.json` с прежнего сервера перенести в таблицу `stats`, иначе числа обнулятся.
