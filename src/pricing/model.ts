// Каталог услуг и расчет. Все суммы в тысячах рублей. Источник цифр: справочник цен в макете.
export type R = [number, number];
export type Item = {
  id: string; group: string; name: string; short?: string; desc: string; base: R; from?: boolean; tbd?: boolean;
  birzha?: R | null; studio?: R | null; sized?: boolean; excl?: string; work?: string; pct?: number; long?: boolean;
};
export const PLATFORMS = [
  { v: 'tpl', l: 'Тильда шаблон', k: 0.7, d: 'Тильда шаблон: готовые блоки Тильды с вашими текстами и цветами. Самый быстрый и недорогой вариант. × 0,7 к цене.' },
  { v: 'zero', l: 'Тильда Zero', k: 1, d: 'Тильда Zero: уникальный дизайн в Zero-блоках, анимации и своя верстка. Тексты и картинки меняете сами без программиста.' },
  { v: 'wp', l: 'WordPress', k: 1.3, d: 'WordPress: популярная система управления. Подходит, если много страниц или есть блог. × 1,3 к цене.' },
  { v: 'bx', l: 'Битрикс', k: 1.6, d: 'Битрикс: российская система для бизнеса. Нужна, если уже работаете в Битрикс24 или 1С. × 1,6 к цене.' },
  { v: 'code', l: 'Свой код', k: 1.8, d: 'Свой код: сайт пишется с нуля под задачу, без конструктора. Максимум свободы и скорости, правки делает разработчик. × 1,8 к цене.' },
  { v: 'other', l: 'Другая CMS или конструктор', k: 1.3, d: 'Другая CMS или конструктор: MODX, OpenCart, InSales, Readymag и другие. Напишите в форме, какая система. В расчете считается как × 1,3, точную цену назову после разбора.' },
];
export const REDESIGN = { new: 'Новый сайт: структура, тексты, дизайн и сборка с нуля.', re: 'Редизайн: обновляю ваш сайт, переношу содержимое. 70% от цены нового.' };
export const GROUPS = [
  { id: 'site', name: 'Сайты', sub: 'Сайт, магазин, личный кабинет, запись, оплата, SEO и тексты', icon: 'shop', tile: 'Сайт или магазин', from: 60, step: 'Сайт', next: 'сайт' },
  { id: 'app', name: 'Приложения', sub: 'Telegram mini-app и приложение для телефона', icon: 'custom', tile: 'Приложение', from: 80, step: 'Приложение', next: 'приложение' },
  { id: 'crm', name: 'Заявки и продажи', sub: 'CRM, связка с сайтом, аналитика, телефония, рассылки', icon: 'c_crm', tile: 'CRM и заявки', from: 50, step: 'CRM и заявки', next: 'CRM и заявки' },
  { id: 'bots', name: 'Боты', sub: 'Бот по сценарию или с AI в мессенджерах и на сайте', icon: 'p_brief', tile: 'Боты', from: 30, step: 'Боты', next: 'боты' },
  { id: 'docs', name: 'Документы', sub: 'Шаблоны КП и договоров, презентация, фирменный стиль', icon: 'c_fix', tile: 'Документы и КП', from: 40, step: 'Документы и КП', next: 'документы' },
  { id: 'team', name: 'Команда', sub: 'Регламенты, база знаний, AI-помощник, обучение', icon: 'p_launch', tile: 'Команда и регламенты', from: 60, step: 'Команда и регламенты', next: 'команда' },
  { id: 'data', name: 'Цифры', sub: 'Дашборд собственника и финансовая модель', icon: 'c_docs', tile: 'Цифры и отчеты', from: 60, step: 'Цифры и отчеты', next: 'цифры' },
  { id: 'link', name: 'Автоматизация', sub: 'Связать программы между собой и убрать ручной перенос данных', icon: 'p_support', tile: 'Связать программы', from: 80, step: 'Связать программы', next: 'автоматизация' },
  { id: 'fix', name: 'Доработки', sub: 'Правки, новые блоки, перенос, концепция, UX-аудит', icon: 'p_build', tile: 'Доработки сайта', from: 15, step: 'Доработки сайта', next: 'доработки' },
] as const;
export type GroupId = (typeof GROUPS)[number]['id'];
const I = (o: Item) => o;
export const ITEMS: Item[] = [
  I({ id: 'landing', group: 'site', excl: 'siteType', name: 'Лендинг до 10 экранов', short: 'Лендинг', desc: 'Структура, тексты, дизайн и сборка, формы заявок', base: [60, 100], birzha: [15, 40], studio: [100, 250], work: 'Роман Копосов' }),
  I({ id: 'corp', group: 'site', excl: 'siteType', name: 'Корпоративный сайт', short: 'Корпоративный', desc: 'Страницы услуг, о компании, контакты, формы заявок', base: [120, 200], birzha: [30, 80], studio: [250, 600], work: 'Alfa Elite' }),
  I({ id: 'shop', group: 'site', excl: 'siteType', name: 'Интернет-магазин', short: 'Магазин', desc: 'Каталог, корзина, оплата картой и СБП, доставка', base: [150, 250], birzha: [40, 100], studio: [300, 800], work: 'Caro' }),
  I({ id: 'lang', group: 'site', name: 'Дополнительный язык сайта', short: 'Второй язык', desc: 'Перевод и версия сайта на другом языке', base: [0, 0], pct: 0.3, birzha: null, studio: null }),
  I({ id: 'lk', group: 'site', name: 'Личный кабинет клиента', short: 'Личный кабинет', desc: 'Вход по телефону или почте, история заказов, документы', base: [80, 150], birzha: [30, 60], studio: [200, 500], long: true }),
  I({ id: 'booking', group: 'site', name: 'Онлайн-запись или бронирование', short: 'Онлайн-запись', desc: 'Клиент сам выбирает время, запись падает в CRM', base: [30, 60], birzha: [10, 25], studio: [60, 150] }),
  I({ id: 'pay', group: 'site', name: 'Онлайн-оплата', desc: 'Подключение эквайринга и СБП к сайту или боту', base: [15, 30], birzha: [5, 15], studio: [30, 60] }),
  I({ id: 'quiz', group: 'site', name: 'Квиз или калькулятор на сайте', short: 'Квиз или калькулятор', desc: 'Клиент отвечает на вопросы и сразу видит цену или подборку', base: [20, 50], birzha: [5, 20], studio: [50, 120] }),
  I({ id: 'seo', group: 'site', name: 'SEO и GEO', desc: 'Чтобы сайт находили в поиске и в ответах нейросетей', base: [30, 60], birzha: [10, 30], studio: [60, 150] }),
  I({ id: 'texts', group: 'site', name: 'Тексты для сайта', short: 'Тексты', desc: 'Пишу тексты страниц по вашему бизнесу, без воды', base: [20, 60], birzha: [5, 20], studio: [50, 150] }),
  I({ id: 'legal', group: 'site', name: 'Юридические документы для сайта', short: 'Юридические документы', desc: 'Политика обработки данных, согласия, оферта по 152-ФЗ', base: [15, 30], birzha: [5, 10], studio: [30, 80] }),
  I({ id: 'tgapp', group: 'app', name: 'Telegram mini-app', short: 'Приложение в Telegram', desc: 'Каталог, запись или личный кабинет прямо в Telegram', base: [80, 150], birzha: [30, 70], studio: [200, 500] }),
  I({ id: 'phoneapp', group: 'app', name: 'Приложение для телефона', desc: 'Устанавливается с сайта и работает как обычное приложение', base: [150, 300], birzha: [60, 150], studio: [500, 1500], work: 'Mono Coffee', long: true }),
  I({ id: 'fixpack', group: 'fix', name: 'Правки, пакет 10 часов', short: 'Пакет правок', desc: 'Тексты, картинки, мелкие изменения на действующем сайте', base: [25, 25], birzha: [10, 20], studio: [20, 60] }),
  I({ id: 'block', group: 'fix', name: 'Новый блок или раздел', short: 'Новый блок', desc: 'Дизайн и сборка одного нового блока на сайте', base: [15, 30], birzha: [5, 10], studio: [30, 60] }),
  I({ id: 'migrate', group: 'fix', name: 'Перенос на другую платформу', short: 'Перенос сайта', desc: 'Например, с конструктора на Тильду или Битрикс без потери страниц', base: [40, 80], birzha: [15, 30], studio: [100, 200] }),
  I({ id: 'concept', group: 'fix', name: 'Дизайн-концепция в Figma', short: 'Новая концепция', desc: 'Макет сайта без разработки, можно отдать своей команде', base: [60, 120], birzha: [20, 50], studio: [300, 600] }),
  I({ id: 'audit', group: 'fix', name: 'UX-аудит сайта', short: 'UX-аудит', desc: 'Где сайт теряет заявки и что поправить в первую очередь', base: [20, 40], birzha: [5, 15], studio: [60, 150] }),
  I({ id: 'crmBasic', group: 'crm', excl: 'crm', name: 'CRM, базовая настройка', short: 'Базовая настройка', desc: 'Воронка продаж, карточки клиентов, задачи менеджерам', base: [50, 80], birzha: [25, 50], studio: [150, 350], sized: true }),
  I({ id: 'crmAuto', group: 'crm', excl: 'crm', name: 'CRM с автоматизацией', short: 'С автоматизацией', desc: 'Несколько воронок, автоматические задачи, распределение заявок, отчеты', base: [100, 180], birzha: [50, 100], studio: [250, 500], sized: true, work: 'Alfa Elite' }),
  I({ id: 'crmLink', group: 'crm', name: 'Связка сайта с CRM, UTM, Client ID', short: 'Связка сайта с CRM', desc: 'Каждая заявка попадает в CRM вместе с источником рекламы', base: [30, 50], birzha: [10, 25], studio: [50, 100] }),
  I({ id: 'goals', group: 'crm', name: 'Цели Яндекс Метрики', desc: 'Видно, какая реклама приводит заявки, а какая нет', base: [10, 20], birzha: [5, 10], studio: [30, 60] }),
  I({ id: 'tel', group: 'crm', name: 'Телефония в CRM', short: 'Телефония', desc: 'Звонки записываются и попадают в карточку клиента', base: [20, 40], birzha: [10, 20], studio: [40, 80] }),
  I({ id: 'msg', group: 'crm', name: 'Мессенджеры в CRM', short: 'Мессенджеры', desc: 'Переписка из мессенджеров в одной ленте с клиентом', base: [15, 30], birzha: [5, 15], studio: [30, 60] }),
  I({ id: 'email', group: 'crm', name: 'Email-рассылки', desc: 'Письма по базе и автоматические цепочки', base: [20, 40], birzha: [10, 20], studio: [40, 100] }),
  I({ id: 'botScen', group: 'bots', excl: 'bot', name: 'Бот по сценарию', desc: 'Отвечает на частые вопросы кнопками и собирает контакт', base: [30, 50], birzha: [10, 25], studio: [50, 200] }),
  I({ id: 'botAi', group: 'bots', excl: 'bot', name: 'Бот с AI', desc: 'Отвечает своими словами по базе знаний компании и передает заявку в CRM', base: [80, 150], birzha: [30, 60], studio: [300, 600], work: 'Alfa Elite' }),
  I({ id: 'kp', group: 'docs', name: 'Шаблоны КП и договоров из CRM', short: 'Шаблоны КП и договоров', desc: 'Документ собирается из карточки сделки за минуты', base: [40, 80], birzha: [15, 40], studio: [100, 200], work: 'Alfa Elite' }),
  I({ id: 'pres', group: 'docs', name: 'Презентация компании', short: 'Презентация', desc: 'Для клиентов, партнеров или инвесторов. Структура, тексты, дизайн', base: [40, 80], birzha: [15, 40], studio: [100, 300], work: 'Alfa Elite' }),
  I({ id: 'logo', group: 'docs', name: 'Логотип и фирменный стиль', desc: 'Логотип, цвета и шрифты для сайта и документов', base: [40, 100], birzha: [10, 30], studio: [150, 500] }),
  I({ id: 'regs', group: 'team', name: 'Регламенты и база знаний', short: 'Регламенты', desc: 'Описание ключевых процессов, чтобы новичок вошел в работу без вас', base: [60, 100], birzha: [50, 80], studio: [300, 600], sized: true, long: true }),
  I({ id: 'aihelp', group: 'team', name: 'AI-помощник для сотрудников', desc: 'Отвечает команде по регламентам и базе знаний', base: [80, 150], birzha: null, studio: [300, 600], sized: true, work: 'MeetFlow', long: true }),
  I({ id: 'train', group: 'team', name: 'Обучение сотрудников CRM', short: 'Обучение работе в CRM', desc: 'Показываю на ваших сделках, оставляю запись и памятку', base: [15, 30], birzha: [5, 10], studio: [30, 60] }),
  I({ id: 'dash', group: 'data', name: 'Дашборд собственника', short: 'Дашборд', desc: 'Заявки, сделки и выручка на одном экране, обновляется сам', base: [60, 100], birzha: [20, 60], studio: [150, 300], sized: true, long: true }),
  I({ id: 'fin', group: 'data', name: 'Финмодель и юнит-экономика', short: 'Финансовая модель', desc: 'Доходы, расходы и точка окупаемости. Меняете цифру и видите результат', base: [40, 100], birzha: [15, 40], studio: [150, 400], work: 'Mono Coffee' }),
  I({ id: 'link', group: 'link', name: 'Связать программы между собой', short: 'Связка программ', desc: 'Обмен данными между учетом, CRM, кассой или складом. Например, Шеф-Эксперт и iiko, 1С и Битрикс24', base: [80, 120], from: true, birzha: null, studio: [300, 600], long: true }),
  I({ id: 'routine', group: 'link', name: 'Автоматизация рутины', short: 'Убрать ручную рутину', desc: 'Уведомления, отчеты и перенос данных по расписанию, без участия сотрудников', base: [30, 60], from: true, birzha: [10, 30], studio: [100, 200] }),
  I({ id: 'oneprog', group: 'link', name: 'Одна программа вместо нескольких', desc: 'Своя система под ваши процессы, цена после разбора', base: [0, 0], tbd: true, birzha: null, studio: null }),
];
export const DIAG = { name: 'Начать с диагностики', desc: 'Разберу, что уже есть и где теряются заявки, дам план. Стоимость засчитывается в проект', base: [30, 50] as R };
export const byId = Object.fromEntries(ITEMS.map((i) => [i.id, i])) as Record<string, Item>;
export const TILE_DEFAULT: Record<GroupId, string> = { site: 'corp', app: 'tgapp', crm: 'crmBasic', bots: 'botScen', docs: 'kp', team: 'regs', data: 'dash', link: 'link', fix: 'fixpack' };
export const SIZES = [{ l: 'До 50 человек', s: 'до 50 человек', k: 1 }, { l: '50–150 человек', s: '50–150 человек', k: 1.15 }, { l: '150–300 человек', s: '150–300 человек', k: 1.3 }, { l: 'Больше 300', s: 'больше 300 человек', k: 1.3 }];
export const AFTER = [
  { v: 'none', l: 'Без сопровождения', d: 'Сборка, запуск и обучение', p: '0 ₽', m: '0 ₽, без сопровождения', s: 'без сопровождения' },
  { v: 'support', l: 'Поддержка', d: 'Правки и мелкие доработки', p: '50 тыс. ₽ в месяц', m: '50 тыс. ₽, поддержка', s: 'поддержка' },
  { v: 'team', l: 'В команду', d: 'Дизайнер и разработчик вместо найма', p: 'от 90 тыс. ₽ в месяц', m: 'от 90 тыс. ₽, в команду', s: 'в команду' },
  { v: 'full', l: 'Сопровождение целиком', d: 'Развиваю всю цифровую часть', p: '150 тыс. ₽ в месяц', m: '150 тыс. ₽, сопровождение целиком', s: 'сопровождение целиком' },
] as const;
// Ступени параметров. Множители ступеней в макете не заданы, взяты как рабочее допущение.
export const TIERS: Record<string, { label: string; opts: string[]; k: number[] }> = {
  shop: { label: 'Товаров в каталоге', opts: ['до 50', 'до 500', 'больше 500'], k: [1, 1.2, 1.5] },
  migrate: { label: 'Страниц', opts: ['до 10', 'до 30', 'больше 30'], k: [1, 1.5, 2] },
  concept: { label: 'Страниц', opts: ['1–3', '4–8', '9 и больше'], k: [1, 1.5, 2] },
  crmAuto: { label: 'Воронок', opts: ['1–2', '3–5', 'больше 5'], k: [1, 1.25, 1.5] },
  goals: { label: 'Целей', opts: ['до 5', 'до 15'], k: [1, 1.5] },
  kp: { label: 'Шаблонов', opts: ['до 3', 'до 10'], k: [1, 1.5] },
  pres: { label: 'Слайдов', opts: ['до 15', 'до 30'], k: [1, 1.5] },
  regs: { label: 'Процессов', opts: ['до 5', 'до 10', 'больше 10'], k: [1, 1.5, 2] },
};
export const CHANNELS = ['Telegram', 'MAX', 'VK', 'Сайт'];
export const LINK_METHODS = [{ l: 'Не знаю, подберите', k: 1 }, { l: 'Готовый модуль × 0,5', k: 0.5 }, { l: 'Сервис-связка × 1', k: 1 }, { l: 'Свой софт-посредник × 2', k: 2 }];
export const PRESETS: Record<string, { name: string; sel: string[] }> = {
  start: { name: 'Старт', sel: ['landing', 'crmBasic', 'crmLink', 'botScen'] },
  grow: { name: 'Рост', sel: ['corp', 'crmAuto', 'crmLink', 'botAi', 'kp'] },
  shop: { name: 'Магазин', sel: ['shop', 'crmBasic', 'crmLink'] },
  full: { name: 'Полный', sel: ['corp', 'crmAuto', 'crmLink', 'botAi', 'kp', 'regs', 'dash'] },
};

export type State = {
  mode: 'quiz' | 'calc'; step: number; done: boolean; pay: 'once' | 'inst'; term: number;
  tiles: GroupId[]; seen: GroupId[]; diag: boolean; sel: string[];
  platform: string; redesign: boolean; tier: Record<string, number>; ch: number[]; fixN: number; blockN: number; src: number;
  linkN: number; linkBoth: boolean; linkM: number; linkText: string; crmSys: number; own: string;
  size: number; urgent: boolean; after: (typeof AFTER)[number]['v']; preset: string;
};
export const initial = (): State => ({
  mode: 'quiz', step: 0, done: false, pay: 'once', term: 0, tiles: [], seen: [], diag: false, sel: [],
  platform: 'zero', redesign: false, tier: {}, ch: [0], fixN: 1, blockN: 1, src: 1, linkN: 2, linkBoth: false, linkM: 0, linkText: '', crmSys: 0, own: '',
  size: 0, urgent: false, after: 'none', preset: '',
});

const r5 = (n: number) => Math.round(n / 5) * 5;
const r10 = (n: number) => Math.round(n / 10) * 10;
export const fmtNum = (n: number) => String(n).replace('.', ',');
export function fmtRange([a, b]: R, unit = true): string {
  const tail = unit ? ' ₽' : '';
  if (b >= 1000) { const f = (n: number) => fmtNum(Math.round(n / 50) / 20); return (a === b ? f(a) : `${f(a)}–${f(b)}`) + ' млн' + tail; }
  return (a === b ? `${a}` : `${a}–${b}`) + ' тыс.' + tail;
}
export function itemPrice(s: State, id: string): R {
  const it = byId[id]; let [a, b] = it.base; let k = 1;
  if (it.excl === 'siteType') { k *= PLATFORMS.find((p) => p.v === s.platform)!.k; if (s.redesign) k *= 0.7; if (id === 'shop') k *= TIERS.shop.k[s.tier.shop || 0]; }
  if (TIERS[id] && id !== 'shop') k *= TIERS[id].k[s.tier[id] || 0];
  if (it.excl === 'bot') k *= 1 + 0.3 * (Math.max(1, s.ch.length) - 1);
  if (id === 'fixpack') k *= s.fixN;
  if (id === 'block') { let q = 0; for (let i = 0; i < s.blockN; i++) q += Math.pow(0.8, i); k *= q; }
  if (id === 'dash') { a += 20 * (s.src - 1); b += 20 * (s.src - 1); }
  if (id === 'link') { const m = LINK_METHODS[s.linkM].k * (s.linkBoth ? 1.3 : 1); a = (80 + 40 * (s.linkN - 2)) * m; b = a + 40 * m; k = 1; }
  if (id === 'lang') { const site = s.sel.find((x) => byId[x]?.excl === 'siteType'); const p = site ? itemPrice(s, site) : [0, 0]; return [r5(p[0] * 0.3), r5(p[1] * 0.3)]; }
  if (it.sized) k *= SIZES[s.size].k;
  return [r5(a * k), r5(b * k)];
}
export type Line = { id: string; name: string; price: R; text: string; pale: boolean };
export function lineName(s: State, id: string): string {
  const it = byId[id];
  if (it.excl === 'siteType') return `${it.name.replace(' до 10 экранов', '')} · ${PLATFORMS.find((p) => p.v === s.platform)!.l}${s.redesign ? ', редизайн' : ''}`;
  if (it.excl === 'bot' && s.ch.length > 1) return `${it.name} · ${s.ch.length} ${s.ch.length < 5 ? 'канала' : 'каналов'}`;
  if (id === 'fixpack' && s.fixN > 1) return `Правки, ${s.fixN} пакета по 10 часов`;
  if (id === 'block' && s.blockN > 1) return `Новые блоки · ${s.blockN}`;
  if (id === 'link') return `Связка программ · ${s.linkN}${s.linkN >= 5 ? ' и больше' : ''}`;
  if (id === 'crmBasic') return `CRM${s.crmSys < 2 ? ' ' + ['Битрикс24', 'amoCRM'][s.crmSys] : ''}, базовая настройка`;
  return it.short && ['kp', 'crmLink'].includes(id) ? it.short : it.name;
}
const plural = (n: number, f: [string, string, string]) => { const a = n % 10, b = n % 100; return a === 1 && b !== 11 ? f[0] : a >= 2 && a <= 4 && (b < 10 || b >= 20) ? f[1] : f[2]; };
export const servicesWord = (n: number) => `${n} ${plural(n, ['услуга', 'услуги', 'услуг'])}`;
export function compute(s: State) {
  const ids = ITEMS.filter((i) => s.sel.includes(i.id)).map((i) => i.id);
  const lines: Line[] = [];
  if (s.diag) lines.push({ id: 'diag', name: 'Диагностика', price: DIAG.base, text: fmtRange(DIAG.base), pale: false });
  for (const id of ids) {
    const it = byId[id]; const price = itemPrice(s, id);
    const pale = s.mode === 'quiz' && !s.done && !s.seen.includes(it.group as GroupId);
    lines.push({ id, name: lineName(s, id), price, text: it.tbd ? 'после разбора' : (it.from ? 'от ' : '') + (it.from ? `${price[0]} тыс. ₽` : fmtRange(price)), pale });
  }
  const own = s.own.trim();
  const priced = lines.filter((l) => !byId[l.id]?.tbd);
  const count = lines.length;
  const sum: R = [priced.reduce((a, l) => a + l.price[0], 0), priced.reduce((a, l) => a + l.price[1], 0)];
  const disc = count >= 5 ? 0.1 : count >= 3 ? 0.05 : 0;
  const k = (1 - disc) * (s.urgent ? 2 : 1);
  const total: R = [r10(sum[0] * k), r10(sum[1] * k)];
  const sizedOn = ids.some((id) => byId[id].sized);
  const large = total[1] > 1500 || (s.size === 3 && sizedOn);
  const tbd = !!own || ids.some((id) => byId[id].tbd);
  const onlyTbd = count > 0 ? priced.length === 0 : !!own;
  const empty = count === 0 && !own;
  // рассрочка
  const terms = [2, 3, 4, 6].map((n) => ({ n, ok: Math.ceil(total[0] / n) >= 15 }));
  const instOk = !large && !empty && !onlyTbd && total[0] >= 30;
  const allowed = terms.filter((t) => t.ok).map((t) => t.n);
  const term = allowed.includes(s.term) ? s.term : allowed[allowed.length - 1] || 2;
  const monthly = Math.ceil(total[0] / term);
  // срок
  let weeks = 'до 2 недель';
  if (ids.some((id) => byId[id].long)) weeks = '1–2 месяца'; else if (total[0] >= 200) weeks = '2–3 недели'; else if (count > 0) weeks = '1–2 недели';
  if (s.urgent) weeks = ({ '1–2 месяца': '2–4 недели', '2–3 недели': '1–1,5 недели', '1–2 недели': 'до недели' } as Record<string, string>)[weeks] || weeks;
  // рынок
  const mk = (key: 'birzha' | 'studio'): R => {
    let a = 0, b = 0;
    for (const id of ids) { const it = byId[id]; const m = it[key]; if (m) { a += m[0]; b += m[1]; } else if (key === 'birzha' && !it.tbd && !it.pct) { const p = itemPrice(s, id); a += p[0]; b += p[1]; } }
    if (s.diag && key === 'studio') { a += 50; b += 150; }
    if (s.urgent) { a *= 1.5; b *= key === 'studio' ? 2 : 1.5; }
    return [r10(a), r10(b)];
  };
  const birzha = mk('birzha'), studio = mk('studio');
  // сторонние сервисы
  const ext: { name: string; lo: number; hi: number }[] = [];
  const site = ids.find((id) => byId[id].excl === 'siteType');
  if (site && (s.platform === 'tpl' || s.platform === 'zero')) ext.push({ name: 'Тильда 500–1 200 ₽', lo: 500, hi: 1200 });
  if (ids.some((id) => byId[id].excl === 'crm')) ext.push(s.crmSys === 1 ? { name: 'amoCRM 599–1 699 ₽ за пользователя', lo: 599, hi: 1699 } : { name: 'Битрикс24 2 490–6 990 ₽', lo: 2490, hi: 6990 });
  if (ids.some((id) => ['botScen', 'botAi', 'link', 'aihelp', 'tgapp'].includes(id))) ext.push({ name: 'сервер от 500 ₽', lo: 500, hi: 800 });
  const ai = ids.some((id) => ['botAi', 'aihelp'].includes(id));
  const extSum: R = [ext.reduce((a, e) => a + e.lo, 0), ext.reduce((a, e) => a + e.hi, 0)];
  const after = AFTER.find((a) => a.v === s.after)!;
  return { lines, count, sum, disc, total, large, tbd, onlyTbd, empty, own, sizedOn, terms, instOk, term, monthly, weeks, birzha, studio, ext, extSum, ai, after };
}
export type Calc = ReturnType<typeof compute>;
// Краткое описание выбора по группе: для экрана Сборка готова и для заявки
export function groupSummary(s: State, g: GroupId): string {
  const ids = ITEMS.filter((i) => i.group === g && s.sel.includes(i.id));
  const parts = ids.map((i) => (i.excl === 'siteType' ? `${i.short}, ${PLATFORMS.find((p) => p.v === s.platform)!.l}${s.redesign ? ', редизайн' : ''}` : i.excl === 'bot' ? `${i.id === 'botAi' ? 'С AI' : 'По сценарию'}, ${s.ch.map((c) => CHANNELS[c]).join(' и ')}` : i.excl === 'crm' ? `${i.short}${s.crmSys < 2 ? ', ' + ['Битрикс24', 'amoCRM'][s.crmSys] : ''}` : (i.short || i.name)));
  return parts.map((p, i) => (i === 0 || /^[A-ZА-Я]{2}/.test(p) || /^(Telegram|Битрикс)/.test(p) ? p : p.charAt(0).toLowerCase() + p.slice(1))).join(', ');
}
export function composition(s: State, c: Calc): string {
  const rows = c.lines.map((l) => `${l.name}: ${l.text}`);
  if (c.own) rows.push(`Своя задача: ${c.own}`);
  if (s.linkText.trim() && s.sel.includes('link')) rows.push(`Какие программы: ${s.linkText.trim()}`);
  rows.push(`Компания: ${SIZES[s.size].s}. Сроки: ${s.urgent ? 'срочно' : 'обычные'}. После запуска: ${c.after.s}.`);
  rows.push(c.large ? 'Итог: крупный проект, нужна личная оценка' : `Итог: ${fmtRange(c.total)}${c.tbd ? ' плюс задача после разбора' : ''}, срок ${c.weeks}${s.pay === 'inst' && c.instOk ? `, в рассрочку на ${c.term} мес.` : ''}`);
  return rows.join('\n');
}
// Ссылка на расчет
export function encode(s: State, total: R): string {
  const d = { v: 1, t: Date.now(), tot: total, s: { ...s, step: 0, mode: s.mode } };
  return btoa(unescape(encodeURIComponent(JSON.stringify(d)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export function decode(str: string): { s: State; t: number; tot: R } | null {
  try { const d = JSON.parse(decodeURIComponent(escape(atob(str.replace(/-/g, '+').replace(/_/g, '/'))))); if (d.v !== 1) return null; return { s: { ...initial(), ...d.s }, t: d.t, tot: d.tot }; } catch { return null; }
}
