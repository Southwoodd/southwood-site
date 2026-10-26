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

// Все поля формы по строкам. Для калькулятора и подбора расчет приходит файлом PDF, без него составом в тексте.
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
    return { subj: `Сообщение с сайта${name ? `: ${name}` : ''}`.slice(0, 120), reply: via === 'email' && EMAIL.test(contact) ? contact : '',
      text: lines.join('\n'), html: esc(lines.join('\n')), n: lines.join('\n').length };
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
  const lines = [`Заявка с сайта${ctx ? `, ${source(ctx)}` : ''}`, '', `Имя: ${name}`, `Компания: ${company}`, `Телефон: ${phone}`, `Связаться: ${VIA[via] || via}`, `Нужно: ${labels.join(', ')}`];
  if (deadline) lines.push(`Нужно к дате: ${deadline}`);
  if (task) lines.push(`Комментарий: ${task}`);
  if (calc) {
    lines.push('', `Расчет: ${calc.title || 'без суммы'}${pdf ? ', PDF отдельной ссылкой' : ''}`);
    if (!pdf && calc.text) lines.push(calc.text);
  }
  if (page) lines.push('', `Страница: ${page}`);
  // В Telegram ссылка на расчет уходит словами, в письме адресом
  const LINK = 'Открыть расчет на сайте';
  const tgText = lines.join('\n') + (calc?.link ? `\n\n${LINK}` : '');
  const html = esc(lines.join('\n')) + (calc?.link ? `\n\n<a href="${esc(calc.link)}">${LINK}</a>` : '');
  if (calc?.link) lines.push('', `${LINK}: ${calc.link}`);
  return { subj: `Заявка с сайта: ${name}, ${company}`.slice(0, 120), reply: '', text: lines.join('\n'), html, n: tgText.length,
    pdf, cap: `Расчет к заявке: ${name}, ${company}`.slice(0, 200) };
}
