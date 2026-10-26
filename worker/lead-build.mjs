// Разбор и сборка заявки. Чистые функции без обращений к сети и хранилищам, чтобы их можно было прогнать тестами.
export const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u0008\u000b-\u001f]/g, '').trim().slice(0, max);
export const EMAIL = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[a-z]{2,}$/i;
export const VIA = { telegram: 'Telegram', max: 'MAX', call: 'позвонить', email: 'почта' };
export const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
export const esc = (x) => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const source = (c) => (c === 'calc' ? 'калькулятор' : c === 'quiz' ? 'подбор по вопросам' : c.startsWith('pack:') ? `набор ${c.slice(5)}` : c.startsWith('case:') ? `кейс ${c.slice(5)}` : c.startsWith('scenario:') ? `сценарий автоматизации ${c.slice(9)}` : c);
export const list = (v, d = '') => String(v ?? d).split(',').map((s) => s.trim()).filter(Boolean);
export const num = (v, d) => Number(v ?? d) || d;

// Base64 кусками: на длинной строке разворачивать массив в аргументы нельзя.
export const b64bytes = (u8) => { let bin = ''; for (let i = 0; i < u8.length; i += 0x8000) bin += String.fromCharCode(...u8.subarray(i, i + 0x8000)); return btoa(bin); };
export const b64 = (s) => b64bytes(new TextEncoder().encode(s));
export const unb64 = (s) => { const bin = atob(s); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; };

export function encWord(x) { // заголовок с кириллицей кусками до 75 знаков
  const out = []; let cur = '';
  const len = (s) => new TextEncoder().encode(s).length;
  for (const ch of x) { if (len(cur + ch) > 42) { out.push(cur); cur = ''; } cur += ch; }
  if (cur) out.push(cur);
  return out.map((p) => `=?UTF-8?B?${b64(p)}?=`).join('\r\n ');
}

const LINK = 'Открыть расчет на сайте';

// Все поля формы по строкам.
// Письмо всегда получает расчет составом: файл уходит только в Telegram, нигде не хранится.
// Для Telegram готовятся два вида текста: с файлом (состав не дублируем) и без него, на случай сбоя отправки.
export function build(b) {
  if (b.consent !== true) return { error: 'consent' };
  if (b.website) return { spam: true };
  const page = clean(b.page, 120);
  if (b.kind === 'write') {
    const msg = clean(b.msg, 1500), contact = clean(b.contact, 80), name = clean(b.name, 80), via = clean(b.via, 12);
    if (msg.length < 5 || contact.length < 3) return { error: 'fields' };
    const lines = ['Сообщение с сайта', '', `Сообщение: ${msg}`, '', `Ответить через: ${VIA[via] || via}`, `Контакт: ${contact}`];
    if (name) lines.push(`Имя: ${name}`);
    if (page) lines.push(`Страница: ${page}`);
    const text = lines.join('\n'), html = esc(text);
    return { subj: `Сообщение с сайта${name ? `: ${name}` : ''}`.slice(0, 120), reply: via === 'email' && EMAIL.test(contact) ? contact : '',
      text, html, n: text.length, htmlPlain: html, nPlain: text.length, pdf: null };
  }
  const name = clean(b.name, 80), company = clean(b.company, 120), phone = clean(b.phone, 24), task = clean(b.task, 1500), via = clean(b.via, 12);
  const labels = Array.isArray(b.needLabels) ? b.needLabels.slice(0, 12).map((x) => clean(x, 40)) : [];
  if (name.length < 2 || company.length < 2 || phone.replace(/\D/g, '').length < 10 || !labels.length) return { error: 'fields' };
  const ctx = clean(b.context, 60);
  const dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(b.deadline || ''));
  const deadline = dm && MONTHS[+dm[2] - 1] ? `${+dm[3]} ${MONTHS[+dm[2] - 1]} ${dm[1]}` : '';
  let calc = null, pdf = null;
  if (b.calc && typeof b.calc === 'object') {
    const link = String(b.calc.link || '');
    calc = { title: clean(b.calc.title, 60), text: clean(b.calc.text, 2000), link: /^https:\/\/southwood\.pw\/\S*$/.test(link) && link.length <= 2500 ? link : '' };
    if (typeof b.pdf === 'string' && b.pdf.length < 700_000) { const buf = unb64(b.pdf); if (buf.length > 1000 && new TextDecoder().decode(buf.subarray(0, 5)) === '%PDF-') pdf = buf; }
  }
  const head = [`Заявка с сайта${ctx ? `, ${source(ctx)}` : ''}`, '', `Имя: ${name}`, `Компания: ${company}`, `Телефон: ${phone}`, `Связаться: ${VIA[via] || via}`, `Нужно: ${labels.join(', ')}`];
  if (deadline) head.push(`Нужно к дате: ${deadline}`);
  if (task) head.push(`Комментарий: ${task}`);
  // Состав расчета. В Telegram с файлом его не повторяем, в письме он есть всегда.
  const title = calc ? `Расчет: ${calc.title || 'без суммы'}` : '';
  const whole = calc ? ['', title, ...(calc.text ? [calc.text] : [])] : [];
  const brief = calc ? ['', `${title}${pdf ? ', PDF во вложении' : ''}`, ...(!pdf && calc.text ? [calc.text] : [])] : [];
  const tail = page ? ['', `Страница: ${page}`] : [];

  const mail = [...head, ...whole, ...tail].join('\n') + (calc?.link ? `\n\n${LINK}: ${calc.link}` : '');
  const tg = [...head, ...brief, ...tail].join('\n');
  const tgPlain = [...head, ...whole, ...tail].join('\n');
  const withLink = (s) => esc(s) + (calc?.link ? `\n\n<a href="${esc(calc.link)}">${LINK}</a>` : '');
  const lenWithLink = (s) => s.length + (calc?.link ? LINK.length + 2 : 0);

  return { subj: `Заявка с сайта: ${name}, ${company}`.slice(0, 120), reply: '',
    text: mail, html: withLink(tg), n: lenWithLink(tg), htmlPlain: withLink(tgPlain), nPlain: lenWithLink(tgPlain),
    pdf, cap: `Расчет к заявке: ${name}, ${company}`.slice(0, 200),
    // Если текст уже ушел, а файл не дошел: отдельным сообщением только состав расчета.
    calcHtml: calc ? esc([title, ...(calc.text ? [calc.text] : [])].join('\n')) : '' };
}
