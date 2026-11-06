# SPEC — сайт southwood.pw

Единая спецификация проекта. Обновляется вместе с изменениями: поменял блок или токен — поправь этот файл в том же коммите.

## 1. Что это за проект

Персональный сайт Сергея Воробьева (Southwood): разработка сайтов, CRM, ботов и автоматизации для бизнеса. Статический сайт, который продаёт услуги: страницы услуг, кейсы, цены с калькулятором, блог.

- Домен: `southwood.pw` (канонический, без www)
- Приём заявок: `api.southwood.pw` (Cloudflare Worker)
- Язык: русский. Английская версия — в планах (ветка `en-version`), американский разговорный английский.

## 2. Стек

| Слой | Технология |
| --- | --- |
| Сборка | Astro 7, статика в `dist/`, Node ≥ 22.12 |
| Острова | Preact (калькулятор, `src/pricing/**`), React 19 (старые `*.tsx` в components, до удаления) |
| Стили | Чистый CSS, токены в `src/styles/site.css`. Без Tailwind |
| Шрифт | Onest Variable (self-hosted, `public/fonts`, кириллица + латиница) |
| Анимации | `motion`, `lenis` (плавный скролл), `use-scramble` (эффект текста) |
| Картинки | `sharp` (обработка при сборке), скрипт `scripts/illus-css.mjs` генерит `styles/illus.css` перед dev/build |

## 3. Карта страниц

Источник истины по адресам — `src/i18n/routes.ts` (объект `R_`).

| Адрес | Файл | Что это |
| --- | --- | --- |
| `/` | `pages/index.astro` | Главная |
| `/uslugi/` | `pages/uslugi/index.astro` | Каталог услуг |
| `/uslugi/<slug>/` | `pages/uslugi/[slug].astro` | 9 страниц услуг из `SERVICES` в routes.ts |
| `/ceny/` | `pages/ceny.astro` | Цены + калькулятор (`#pricing`) + пакеты (`#packages`) |
| `/kejsy/` | `pages/kejsy/index.astro` | Каталог кейсов |
| `/kejsy/<slug>/` | `pages/kejsy/[slug].astro` | 14 кейсов из `CASE_META` в routes.ts |
| `/dlya/` | `pages/dlya/index.astro` + `[slug].astro` | 3 отрасли: obshchepita, klinik, torgovli |
| `/katar/` | `pages/katar.astro` | Отдельный лендинг «Бизнес в Катаре» (данные в `i18n/qatar.ts`) |
| `/obo-mne/` | `pages/obo-mne.astro` | Обо мне (`#faq`, `#process`) |
| `/kontakty/` | `pages/kontakty.astro` | Контакты |
| `/blog/` | `pages/blog/[...slug].astro` | Блог, статьи в `src/blog/*.md` |
| `/privacy/`, `/consent/` | одноимённые .astro | Юридические документы (152-ФЗ) |
| `/karta-sajta/` | `karta-sajta.astro` | HTML-карта сайта |
| `/ui/`, `/ui-reel/` | `ui.astro`, `ui-reel.astro` | Служебная библиотека компонентов, исключена из sitemap |
| `/404` | `404.astro` | Страница ошибки |
| `/llms.txt` | `pages/llms.txt.ts` | Описание сайта для LLM |

Редиректы (astro.config.mjs): `/cases` → `/kejsy/`, `/cases/<slug>` → `/kejsy/<slug>/`, `/en` → `/`. Старые якоря одностраничника мапятся в `OLD_ANCHORS` (routes.ts).

Блог: 10 статей, все опубликованы. Черновик = `draft: true` во фронтматтере: собирается для проверки, но не попадает в sitemap. Если живых статей нет, `/blog/` исключается из sitemap.

## 4. Дизайн-система

### Масштаб и сетка

- База 1920px: `1rem = 10px`. От 1024 до 1919px rem масштабируется по ширине (`100vw/192`).
- Брейкпоинты: `1024px` (планшет/мобайл), `768px` (телефон).
- `.page` — обёртка: max-width 1920, отступы 3rem, gap между секциями 2rem.
- `.section` — белая карточка-секция, radius 3.2rem; `.section--pad` — внутренние 10rem/4rem.
- Мобайл: page padding 16px (8px на <768), section radius 24px, pad 56px/20px/32px.
- На десктопе меню — нижняя плашка (Dock), шапки нет; внизу запас 12.4rem под плашку. На мобайле — обычный Header.

### Токены цвета (`styles/site.css`)

| Токен | Светлая | Тёмная | Роль |
| --- | --- | --- | --- |
| `--bg` | #f3f6f2 | #0b100e | Фон страницы |
| `--surface` | #fff | #18211e | Секции-карточки |
| `--ink` / `--ink-2` | #0a0a0a / #111 | #eef2ef / #e2e8e4 | Текст |
| `--muted` / `--grey-text` | #5a6b62 / #6b7280 | #a8b8b0 / #7d8d86 | Вторичный текст |
| `--accent` | #7dab90 | = | Акцент (зелёный) |
| `--deep` | #3f6b56 | = | Глубокий зелёный (кнопки, бейджи) |
| `--deep-t` | var(--deep) | var(--accent) | `--deep` как цвет текста: на тёмной светлее |
| `--light` | #bee0cc | = | Светло-зелёный |
| `--line` | #d5e0d8 | #243029 | Линии, бордеры |
| `--card` | #f3f3f3 | #121917 | Карточки внутри секций |
| `--mint` | #e8f0eb | #1e2a24 | Мятные подложки |
| `--qatar` / `--qatar-bg` | #8a1538 | #d44f71 / #8a1538 | Бордовый: текст / подложка под белым |
| `--err` / `--err-bg` | #d23b3b / #fbeaea | #ec8080 / #2a1718 | Ошибки форм |
| `--feature` / `--on-feature` / `--feature-hover` | #0a0a0a / #fff / #222 | var(--deep) / #fff / #35594a | Почти чёрные блоки (шоурил, карточки кейсов) |
| `--sep` / `--wash` | rgba(0,0,0,.1/.05) | rgba(255,255,255,.12/.07) | Разделители и приглушённые подложки |
| `--tint` | var(--light) | #20302a | Подложка hover на пилюлях |

**Правила тёмной темы (важно, из боли):**

1. Три состояния: системная (`prefers-color-scheme`), ручной выбор `localStorage.swTheme` + `data-theme` на `<html>`. Значения тёмной темы заданы дважды (медиазапрос + `[data-theme=dark]`) — иначе ручной выбор не перебьёт систему.
2. **Никаких хардкод-цветов в компонентах.** Только токены. Захардкоженный цвет = сломанная тёмная тема.
3. «Вечные» цвета допустимы только там, где фон постоянный в обеих темах: белая кнопка `.btn--white`, светлая пилюля `.badge--light`, бордовая подложка `--qatar-bg`.
4. Скрипт в Site.astro выставляет `data-theme` до отрисовки, без мигания. Переключатель — `components/site/Theme.astro`.
5. Иконки в hero в тёмной теме: отдельный набор `public/img/hero/ic-dark/*.svg` (зелёные плашки), `opacity: .1` — так задумано, не «чинить».

### Типографика и типовые элементы

- Body: 1.8rem (min 15px), line-height 1.35, letter-spacing -.02em.
- Заголовки: `text-wrap: balance`, тексты `text-wrap: pretty` — висяки правятся правилом, не руками.
- `.head` — шапка секции: бейдж слева, текст справа (grid 89.1rem + 1fr); `.head--center` — центрированная.
- `.badge` — пилюля секции (deep-зелёная, 3.6rem); `.badge--light` — светлая с постоянными цветами.
- `.btn` — кнопка-пилюля. Модификаторы: `--deep` (главная, с бликом sheen-анимацией), `--ink` (чёрная/акцентная), `--white` (только на цветных/тёмных секциях), `--grey`.
- `[data-reveal]` — появление при скролле (opacity+translateY, задержка `--d`); `prefers-reduced-motion` и `no-js` отключают.
- `.fold` — details-аккордеон на мобайле, обычный блок на десктопе.
- Фокус: `:focus-visible` outline 2px var(--deep).

## 5. Блоки (components/site)

Общие: `Header`, `Dock` (нижнее меню десктопа), `Footer`, `Logo`, `Crumbs`, `Theme`, `CookieBar`, `Modals`, `Sound`, `MenuIcon`.

Секции страниц: `Hero`, `PageHero`, `Services`, `ServiceTiles`, `Cases`, `Clients`, `About`, `Why`, `Process`, `Start`, `Packages`, `Pricing`, `Faq`, `Final`, `LeadForm`, `WriteForm`, `Support`, `Tools`, `Proofs`, `Promo`, `Qatar`, `Reel`, `VidsCarousel`, `AutoFlow`, `Automation`, `FlowTeaser`, `Ticker`, `TextPage`, `Illus`, `Arrow`.

UI-примитивы (components/ui): `Badge`, `Head`, `Ic` (иконки), `Ui`.

Правило: все блоки строятся на токенах из раздела 4. Новый блок = проверка в обеих темах и на 3 ширинах (1920 / 1024 / 375).

## 6. Контент и данные

| Файл | Что внутри |
| --- | --- |
| `i18n/routes.ts` | **Главный файл контента.** Адреса (R_), 9 услуг (`SERVICES`: тексты, FAQ, SEO), 14 кейсов (`CASE_META`), старые якоря. Цены не дублируются руками — считаются из модели калькулятора |
| `i18n/ru.ts` | Карточки кейсов, тексты форм, endpoint заявок |
| `i18n/modals.ru.json` | Детальные тексты кейсов (модалки/страницы) |
| `i18n/industries.ts` | 3 отраслевые страницы |
| `i18n/qatar.ts` | Контент лендинга Катара |
| `i18n/flows.ts` | Анимированные схемы автоматизации (AutoFlow) |
| `i18n/blog.ts` | Метаданные блога |
| `i18n/schema.ts` | JSON-LD: WebSite, Person (им@southwood.pw, соцсети) |
| `pricing/model.ts` | Каталог калькулятора: ITEMS, PLATFORMS (множители ×0,7–×1,8), SIZES, AFTER (тарифы поддержки). Источник всех цен на сайте |
| `data/content.js` | Тексты главной (переносится в i18n постепенно) |
| `src/blog/*.md` | Статьи блога, frontmatter: title, description, draft, дата |

**Принцип: цена живёт в одном месте** — `pricing/model.ts`. Страницы услуг и кейсов подставляют её через `show()`/`itemPrice()`. Захардкоженная цена в тексте — баг.

**Свои цены показываются только как «от X»** (`fmtFrom()`): нижняя граница, верх зависит от объёма и называется после разбора. Верхняя граница `base` остаётся в модели для порога «крупный проект» и полос сравнения. Вилки «биржа» и «агентство» показываются диапазоном (`fmtRange()`). Наборы (`PRESETS`): Старт от 50, Магазин от 90, Рост от 110, Полный от 180 тыс. ₽ — их состав подобран так, что калькулятор даёт ровно эти суммы; при правке цен услуг сверить карточки наборов в `i18n/ru.ts` и `i18n/modals.ru.json`. Часовая ставка 2 500 ₽, пакет правок 20 тыс. ₽ за 10 часов. Источник цифр — `Прайс Southwood.xlsx` в корне проекта, столбец «Цена от»; он и `model.ts` должны совпадать.

## 7. Заявки, формы, аналитика

- Формы (`LeadForm`, `WriteForm`, калькулятор) шлют POST на `https://api.southwood.pw/lead` (Cloudflare Worker, `worker/lead-worker.mjs`).
- Worker: заявки не хранит — уходит в Telegram и на почту (SMTP :465). PDF-расчёт уходит в Telegram вложением из памяти; в письме — ссылка на расчёт на сайте. Очереди повторов и счётчики блога в D1. Cron: очередь каждую минуту, уборка каждые 6 часов. Адреса: `POST /lead`, `GET|POST /stat` (счётчики статей), `GET /health`.
- Запасной вариант того же приёма — `server/lead-server.mjs` на Beget (systemd `southwood-lead.service`).
- Яндекс Метрика: счётчик **89268669** (`METRIKA_ID` в `i18n/ru.ts`). Подключён в `CookieBar.astro`: грузится **только после согласия** «Принять все» (выбор хранится в `localStorage.sw-cookies`, год). Цели идут через `window.swGoal(name)`: клики по `[data-goal]`, дочитывание статьи `article_read` (конец + ≥30 сек). Вебвизор, кликмап, trackLinks, accurateTrackBounce включены; в формах класс `ym-disable-keys`.
- CookieBar — согласие на cookies (152-ФЗ).

## 8. Инфраструктура и деплой

- Репозиторий: `github.com/Southwoodd/southwood-site`, ветка `master`.
- **Деплой (основной):** push в master → `.github/workflows/deploy-own.yml` → npm ci → build → rsync на Beget (`/var/www/southwood/`, секреты `DEPLOY_SSH_KEY`, `DEPLOY_HOST`) → заодно заливается `server/lead-server.mjs` в `incoming/` → IndexNow-пинг Яндексу и Bing со всем sitemap.
- Легаси-workflows: `deploy-pages.yml` (GitHub Pages), `deploy-cloudflare.yml` (отказались: Cloudflare отдавал сайт в РФ ~800 байт/с). Оставлены как история, не использовать.
- На сервере (Beget, папка `server/`): nginx-конфиги (`nginx-site.conf`, `nginx-api.conf`, `nginx-security.conf`), скрипты настройки (setup, harden, certs, mail, monitor, www-redirect), DNS-записи в `server/dns-records.md`.
- SEO: sitemap.xml (интеграция, фильтры выше), robots.txt, IndexNow key-файл в public/, JSON-LD из `i18n/schema.ts`, OG-обложки в `public/og/`.

## 9. Процесс работы (наш с тобой)

1. Правки делаем локально, проверяем на `localhost:7100` в обеих темах.
2. Показываю → ты смотришь → только после «ок/вкатывай» коммит + push в master.
3. После пуша ждём ~100 сек и проверяем живой сайт curl'ом.
4. Спека (этот файл) обновляется в том же коммите, если менялись страницы, блоки, токены или цены.

## 10. Открытые направления

- Тёмная тема: основная работа закрыта, точечные косяки чиним по скринам.
- Английская версия: перевод на американский разговорный, цены под Запад из `../pricing-west.md`, проверка контейнеров под другую длину строк, новые скрины кейсов (готовит Сергей).
- Скрины кейсов: инвентарь и размеры в `../case-screens-inventory.md`.
