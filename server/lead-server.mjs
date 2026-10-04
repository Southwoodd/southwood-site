// Прием заявок с сайта. Без зависимостей, Node 18+.
// Порядок: проверка → запись на диск в России → отправка в Telegram и копия на почту.
// Если канал недоступен, заявка ждет в своей очереди и уходит позже. Почта включается переменными SMTP_*.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import tls from 'node:tls';

const PORT = Number(process.env.PORT || 8787);
const DIR = process.env.LEADS_DIR || '/var/lib/southwood/leads';
const TOKEN = process.env.TG_BOT_TOKEN || '';
const CHAT = process.env.TG_CHAT_ID || '';
const TG_BASES = (process.env.TG_API_BASES || 'https://api.telegram.org').split(',').map((s) => s.trim()).filter(Boolean);
const ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://southwood.pw,https://www.southwood.pw').split(',');
const KEEP_DAYS = Number(process.env.KEEP_DAYS || 30);
const QUEUE = path.join(DIR, 'queue.json');
const MAILQ = path.join(DIR, 'mailqueue.json');
const FILES = path.join(DIR, 'files'); // PDF расчетов из калькулятора
const SMTP = { host: process.env.SMTP_HOST || '', port: Number(process.env.SMTP_PORT || 465), user: process.env.SMTP_USER || '', pass: process.env.SMTP_PASS || '' };
const MAIL_TO = (process.env.MAIL_TO || SMTP.user).split(',').map((x) => x.trim()).filter(Boolean);
const MAIL_ON = Boolean(SMTP.host && SMTP.user && SMTP.pass && MAIL_TO.length);
fs.mkdirSync(FILES, { recursive: true, mode: 0o700 });

const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u0008\u000b-\u001f]/g, '').trim().slice(0, max);
const EMAIL = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[a-z]{2,}$/i;
const VIA = { telegram: 'Telegram', max: 'MAX', call: 'позвонить', email: 'почта' };

const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const esc = (x) => String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const source = (c) => (c === 'calc' ? 'калькулятор' : c === 'quiz' ? 'подбор по вопросам' : c.startsWith('pack:') ? `набор ${c.slice(5)}` : c.startsWith('case:') ? `кейс ${c.slice(5)}` : c);
// Все поля формы по строкам. Для калькулятора и подбора расчет приходит файлом PDF, без него составом в тексте.
function build(b) {
  if (b.consent !== true) return { error: 'consent' };
  if (b.website) return { spam: true };
  const page = clean(b.page, 120);
  if (b.kind === 'write') {
    const msg = clean(b.msg, 1500), contact = clean(b.contact, 80), name = clean(b.name, 80), via = clean(b.via, 12);
    if (msg.length < 5 || contact.length < 3) return { error: 'fields' };
    const lines = ['Сообщение с сайта', '', `Сообщение: ${msg}`, '', `Ответить через: ${VIA[via] || via}`, `Контакт: ${contact}`];
    if (name) lines.push(`Имя: ${name}`);
    if (page) lines.push(`Страница: ${page}`);
    return { rec: { kind: 'write', msg, contact, via, name, page },
      subj: `Сообщение с сайта${name ? `: ${name}` : ''}`.slice(0, 120), reply: via === 'email' && EMAIL.test(contact) ? contact : '', text: lines.join('\n'), html: esc(lines.join('\n')), n: lines.join('\n').length };
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
    if (typeof b.pdf === 'string' && b.pdf.length < 700_000) { const buf = Buffer.from(b.pdf, 'base64'); if (buf.length > 1000 && buf.subarray(0, 5).toString() === '%PDF-') pdf = buf; }
  }
  const lines = [`Заявка с сайта${ctx ? `, ${source(ctx)}` : ''}`, '', `Имя: ${name}`, `Компания: ${company}`, `Телефон: ${phone}`, `Связаться: ${VIA[via] || via}`, `Нужно: ${labels.join(', ')}`];
  if (deadline) lines.push(`Нужно к дате: ${deadline}`);
  if (task) lines.push(`Комментарий: ${task}`);
  if (calc) {
    lines.push('', `Расчет: ${calc.title || 'без суммы'}${pdf ? ', PDF во вложении' : ''}`);
    if (!pdf && calc.text) lines.push(calc.text);
  }
  if (page) lines.push('', `Страница: ${page}`);
  // В Telegram ссылка на расчет уходит словами, в письме адресом
  const LINK = 'Открыть расчет на сайте';
  const tgText = lines.join('\n') + (calc?.link ? `\n\n${LINK}` : '');
  const html = esc(lines.join('\n')) + (calc?.link ? `\n\n<a href="${esc(calc.link)}">${LINK}</a>` : '');
  if (calc?.link) lines.push('', `${LINK}: ${calc.link}`);
  return { rec: { kind: 'lead', name, company, phone, via, need: labels, deadline: dm ? dm[0] : '', task, context: ctx, page, ...(calc ? { calc: { title: calc.title, text: calc.text, link: calc.link } } : {}) },
    subj: `Заявка с сайта: ${name}, ${company}`.slice(0, 120), reply: '', text: lines.join('\n'), html, n: tgText.length, pdf, cap: `Расчет к заявке: ${name}, ${company}`.slice(0, 200) };
}

async function tgCall(method, make, ms) {
  if (!TOKEN || !CHAT) throw new Error('telegram is not configured');
  let last;
  for (const base of TG_BASES) {
    try { const r = await fetch(`${base}/bot${TOKEN}/${method}`, { method: 'POST', ...make(), signal: AbortSignal.timeout(ms) }); if (r.ok) return; last = new Error(`telegram ${method} ${r.status}`); } catch (e) { last = e; }
  }
  throw last;
}
const tgMsg = (text, html) => tgCall('sendMessage', () => ({ headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: CHAT, text: text.slice(0, 4000), disable_web_page_preview: true, ...(html ? { parse_mode: 'HTML' } : {}) }) }), 8000);
const PDF_NAME = () => `raschet-southwood-${new Date().toISOString().slice(0, 10)}.pdf`;
const filePath = (f) => path.join(FILES, path.basename(f));
const tgDoc = (file, cap, html) => tgCall('sendDocument', () => {
  const fd = new FormData(); fd.set('chat_id', CHAT); fd.set('caption', cap); if (html) fd.set('parse_mode', 'HTML');
  fd.set('document', new Blob([fs.readFileSync(filePath(file))], { type: 'application/pdf' }), PDF_NAME());
  return { body: fd };
}, 20000);
// Одна заявка в Telegram. С расчетом: файл с подписью из всех полей. Если подпись длиннее лимита, текст и файл отдельно.
// При сбое на файле после ушедшего текста в ошибке лежит остаток, чтобы текст не дублировался.
async function tgItem(it) {
  if (typeof it === 'string') return tgMsg(it);
  const file = it.doc && fs.existsSync(filePath(it.doc)) ? it.doc : '';
  if (!it.h) { if (file) await tgDoc(file, it.cap || ''); return; }
  if (file && it.n <= 1000) return tgDoc(file, it.h, true);
  await tgMsg(it.h, true);
  if (file) try { await tgDoc(file, it.cap || ''); } catch (e) { e.rest = { doc: file, cap: it.cap }; throw e; }
}

// Почта: SMTP поверх TLS (порт 465), вход по логину и паролю приложения.
const b64 = (x) => Buffer.from(x, 'utf8').toString('base64');
function encWord(x) { // заголовок с кириллицей кусками до 75 знаков
  const out = []; let cur = '';
  for (const ch of x) { if (Buffer.byteLength(cur + ch) > 42) { out.push(cur); cur = ''; } cur += ch; }
  if (cur) out.push(cur);
  return out.map((p) => `=?UTF-8?B?${b64(p)}?=`).join('\r\n ');
}
function mail({ s: subject, t: text, r: reply, f: file }) {
  return new Promise((resolve, reject) => {
    const full = file ? filePath(file) : '';
    const att = full && fs.existsSync(full) ? fs.readFileSync(full).toString('base64').replace(/(.{76})/g, '$1\r\n') : '';
    const bnd = 'sw' + Date.now().toString(36) + Math.random().toString(36).slice(2);
    const wrap76 = (x) => b64(x).replace(/(.{76})/g, '$1\r\n');
    const bodyPart = att
      ? [`Content-Type: multipart/mixed; boundary="${bnd}"`, '', `--${bnd}`, 'Content-Type: text/plain; charset=utf-8', 'Content-Transfer-Encoding: base64', '', wrap76(text),
        `--${bnd}`, `Content-Type: application/pdf; name="${PDF_NAME()}"`, 'Content-Transfer-Encoding: base64', `Content-Disposition: attachment; filename="${PDF_NAME()}"`, '', att, `--${bnd}--`]
      : ['Content-Type: text/plain; charset=utf-8', 'Content-Transfer-Encoding: base64', '', wrap76(text)];
    const msg = [`From: ${encWord('Сайт southwood.pw')} <${SMTP.user}>`, `To: ${MAIL_TO.map((x) => `<${x}>`).join(', ')}`, ...(reply ? [`Reply-To: <${reply}>`] : []),
      `Subject: ${encWord(subject)}`, `Date: ${new Date().toUTCString().replace('GMT', '+0000')}`, `Message-ID: <${Date.now()}.${Math.random().toString(36).slice(2)}@southwood.pw>`,
      'MIME-Version: 1.0', ...bodyPart].join('\r\n');
    const steps = ['EHLO southwood.pw', 'AUTH LOGIN', b64(SMTP.user), b64(SMTP.pass), `MAIL FROM:<${SMTP.user}>`, ...MAIL_TO.map((x) => `RCPT TO:<${x}>`), 'DATA', msg + '\r\n.', 'QUIT'];
    const sentAt = steps.length - 1; // ответ на письмо приходит перед QUIT
    let i = 0, buf = '', done = false;
    const sock = tls.connect({ host: SMTP.host, port: SMTP.port, servername: SMTP.host });
    const fail = (e) => { if (!done) { done = true; sock.destroy(); reject(e); } };
    sock.setTimeout(30000, () => fail(new Error('mail timeout')));
    sock.on('error', fail);
    sock.on('close', () => fail(new Error('mail closed')));
    sock.on('data', (d) => {
      buf += d; const lines = buf.split('\r\n'); buf = lines.pop();
      for (const l of lines) {
        if (!/^\d{3} /.test(l)) continue; // строка многострочного ответа
        if (Number(l.slice(0, 3)) >= 400) return fail(new Error('mail ' + l.slice(0, 80)));
        if (i === sentAt && !done) { done = true; resolve(); }
        if (i < steps.length) sock.write(steps[i++] + '\r\n'); else sock.end();
      }
    });
  });
}

const read = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return []; } };
const write = (f, q) => fs.writeFileSync(f, JSON.stringify(q), { mode: 0o600 });
const readQueue = () => read(QUEUE);
const writeQueue = (q) => write(QUEUE, q);
let flushing = false;
async function drain(file, send, label) {
  try { let q = read(file); while (q.length) { await send(q[0]); q = read(file).slice(1); write(file, q); } } catch (e) { console.error(label, e.message); if (e.rest) write(file, [e.rest, ...read(file).slice(1)]); }
}
async function flush() {
  if (flushing) return; flushing = true;
  await drain(QUEUE, tgItem, 'queue:');
  if (MAIL_ON) await drain(MAILQ, mail, 'mail queue:');
  flushing = false;
}
function sweep() {
  const limit = Date.now() - KEEP_DAYS * 864e5;
  for (const f of fs.readdirSync(DIR)) { const m = f.match(/^(\d{4}-\d{2}-\d{2})\.jsonl$/); if (m && new Date(m[1]).getTime() < limit) fs.unlinkSync(path.join(DIR, f)); }
  for (const f of fs.readdirSync(FILES)) { const full = path.join(FILES, f); if (fs.statSync(full).mtimeMs < limit) fs.unlinkSync(full); }
}
setInterval(flush, 60_000); setInterval(sweep, 6 * 3600_000); sweep(); flush();

const hits = new Map();
function limited(ip) { const now = Date.now(); const a = (hits.get(ip) || []).filter((t) => now - t < 600_000); a.push(now); hits.set(ip, a); return a.length > 6; }
setInterval(() => hits.clear(), 3600_000);

http.createServer((req, res) => {
  const origin = req.headers.origin || '';
  const cors = ORIGINS.includes(origin) ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {};
  const send = (code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...cors }); res.end(JSON.stringify(obj)); };
  if (req.url === '/health') return send(200, { ok: true, queue: readQueue().length, mail: MAIL_ON ? read(MAILQ).length : -1 });
  if (req.url !== '/lead') return send(404, { ok: false });
  if (req.method === 'OPTIONS') { res.writeHead(204, { ...cors, 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400' }); return res.end(); }
  if (req.method !== 'POST') return send(405, { ok: false });
  if (origin && !ORIGINS.includes(origin)) return send(403, { ok: false });
  const ip = String(req.headers['x-real-ip'] || req.socket.remoteAddress || '');
  if (limited(ip)) return send(429, { ok: false, error: 'rate' });
  let raw = ''; let over = false;
  req.on('data', (c) => { raw += c; if (raw.length > 900_000) { over = true; req.destroy(); } });
  req.on('end', async () => {
    if (over) return;
    let body; try { body = JSON.parse(raw); } catch { return send(400, { ok: false, error: 'json' }); }
    const r = build(body);
    if (r.spam) return send(200, { ok: true });
    if (r.error) return send(422, { ok: false, error: r.error });
    const now = new Date();
    let file = '';
    try {
      if (r.pdf) { file = `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}.pdf`; fs.writeFileSync(path.join(FILES, file), r.pdf, { mode: 0o600 }); }
      fs.appendFileSync(path.join(DIR, now.toISOString().slice(0, 10) + '.jsonl'), JSON.stringify({ t: now.toISOString(), ip, ua: clean(req.headers['user-agent'], 200), ...r.rec, ...(file ? { pdf: file } : {}) }) + '\n', { mode: 0o600 });
    } catch (e) { console.error('disk:', e.message); return send(500, { ok: false, error: 'store' }); }
    // Заявка уже сохранена. Если канал не ответил, она уйдет из очереди позже, посетителю это не мешает.
    const m = { s: r.subj, t: r.text, r: r.reply, ...(file ? { f: file } : {}) };
    const item = { h: r.html, n: r.n, ...(file ? { doc: file, cap: r.cap } : {}) };
    const viaTg = async () => { try { await tgItem(item); } catch (e) { console.error('telegram:', e.message); writeQueue([...readQueue(), e.rest || item]); } };
    const viaMail = async () => { if (MAIL_ON) try { await mail(m); } catch (e) { console.error('mail:', e.message); write(MAILQ, [...read(MAILQ), m]); } };
    await Promise.all([viaTg(), viaMail()]);
    send(200, { ok: true });
  });
}).listen(PORT, '127.0.0.1', () => console.log('lead server on 127.0.0.1:' + PORT));
