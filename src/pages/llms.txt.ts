// Краткая карта сайта для нейросетей: кто, что делает, сколько стоит, чем подтверждено.
// Собирается из тех же данных, что и страница, поэтому не расходится с ней.
import type { APIRoute } from 'astro';
import { site, hero, about, packages, process, faq, cases, automation } from '../i18n/ru';
import data from '../i18n/modals.ru.json';
import { ITEMS, GROUPS, PLATFORMS, fmtRange } from '../pricing/model';
import { SERVICES, serviceHref, CASES, caseBy } from '../i18n/routes';
import { LIVE_POSTS } from '../i18n/blog';

const U = 'https://southwood.pw/';
const clean = (s: string) => s.replace(/ /g, ' ');

export const GET: APIRoute = () => {
  const L: string[] = [];
  L.push(`# ${site.name}: разработка сайтов, CRM, ботов и автоматизация под ключ`, '');
  L.push(`> ${site.name}, независимый разработчик и продуктовый дизайнер с опытом 9+ лет. ${about.place}. Делает сайты, интернет-магазины, CRM Битрикс24, чат-ботов, автоматизацию, дашборды и приложения для бизнеса и учреждений. Работает один, напрямую с собственниками, по договору как самозанятый. Цены открыты, сумма фиксируется в договоре.`, '');
  L.push('## Коротко', '');
  L.push(`- Сайт: ${U}`, `- Кому подходит: малый и средний бизнес, учреждения, эксперты. Тем, кому нужны сайт, CRM и боты как одна система, а не от трех разных подрядчиков.`, `- Где работает: ${about.place}.`, `- Формат: фиксированная смета, оплата частями 30% / 40% / 30%, возможна рассрочка без банка.`, `- Сроки: набор из сайта, CRM и бота занимает 2–3 недели.`, `- Контакты: Telegram ${site.telegram}, почта ${site.email}.`, '');
  L.push('## Страницы сайта', '');
  L.push(`- [Услуги](${U}uslugi/): все направления`, ...SERVICES.map((x) => `- [${x.menu}](${U.slice(0, -1)}${serviceHref(x.slug)}): от ${x.from} тыс. ₽. ${clean(x.card)}`));
  L.push(`- [Цены и калькулятор](${U}ceny/): готовые наборы и расчет суммы`, `- [Кейсы](${U}kejsy/): ${CASES.length} работ со страницей у каждой`, `- [Обо мне](${U}obo-mne/): кто делает, как устроена работа, ответы на вопросы`, `- [Контакты](${U}kontakty/)`, `- [Бизнес в Катаре](${U}katar/)`, '');
  if (LIVE_POSTS.length) L.push('## Блог', '', ...LIVE_POSTS.map((p) => `- [${p.title}](${U}blog/${p.slug}/): ${p.description}`), '');
  L.push('## Готовые наборы', '');
  for (const p of packages.list) L.push(`- ${p.name} (${p.sub.toLowerCase()}): ${p.items.join(', ')}. Цена ${p.price}, срок ${p.term}, ${p.month}.`);
  L.push(`- ${packages.custom.name}: ${packages.custom.sub.toLowerCase()}, ${packages.custom.price}.`, '', clean(packages.note), '');
  L.push('## Отдельные услуги и цены', '', 'Цены для компании до 50 человек, сайт на Тильде Zero. Точная сумма считается в калькуляторе на сайте.', '');
  for (const g of GROUPS) {
    const items = ITEMS.filter((i) => i.group === g.id && !i.tbd && i.base[1] > 0);
    if (!items.length) continue;
    L.push(`### ${g.name}`, '');
    for (const i of items) L.push(`- ${i.name}: ${i.from ? 'от ' : ''}${fmtRange(i.base)}. ${i.desc}.`);
    L.push('');
  }
  L.push('### Платформы для сайта', '', ...PLATFORMS.map((p) => `- ${clean(p.d)}`), '');
  L.push('## Типовые сценарии автоматизации', '', clean(automation.scenarios.note), '');
  for (const s of automation.scenarios.list as any[]) L.push(`- ${s.title} (${s.who.toLowerCase()}): ${s.price}, срок ${s.term}.`);
  L.push('', '## Как устроена работа', '', clean(process.intro), '');
  process.steps.forEach((s, i) => L.push(`${i + 1}. ${s.title} (${s.tag.toLowerCase()}). ${clean(s.text)}`));
  L.push('', '## Выполненные проекты', '');
  const all = data.cases as Record<string, any>;
  const meta: Record<string, string> = Object.fromEntries([...cases.list.map((c: any) => [c.key, c.text]), ...cases.more.list.map((c: any) => [c.key, c.text])]);
  for (const [k, c] of Object.entries(all)) {
    const links = (c.links || []).map((l: any) => l.href).join(', ');
    L.push(`### ${c.name}`, '', `Страница кейса: ${U.slice(0, -1)}${caseBy[k].href}`, '', `${clean(meta[k] || c.context)}`, '', `- Задача: ${clean(c.task)}`, `- Сделано: ${c.done.map(clean).join('; ')}.`, `- Итог: ${clean(c.summary)}`, `- Срок: ${c.term}`);
    if (c.awards) L.push(`- Награды: ${c.awards.map((a: any) => a.label).join(', ')}.`);
    if (links) L.push(`- Ссылки: ${links}`);
    L.push('');
  }
  L.push('## Вопросы по услугам', '');
  for (const x of SERVICES) { L.push(`### ${x.menu}`, ''); for (const f of x.faq) L.push(`**${clean(f.q)}** ${clean(f.a)}`, ''); }
  L.push('## Вопросы и ответы', '');
  for (const f of faq.list) L.push(`### ${clean(f.q)}`, '', clean(f.a), '');
  L.push('## Ссылки', '', `- Главная: ${U}`, `- Расчет цены: ${U}ceny/#pricing`, `- Кейсы: ${U}kejsy/`, `- Behance: ${site.behance}`, `- TenChat: ${site.tenchat}`, `- VK: ${site.vk}`, `- Политика конфиденциальности: ${U}privacy/`, '');
  return new Response(L.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
