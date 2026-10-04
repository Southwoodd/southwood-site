// Прием заявок с сайта. Без зависимостей, Node 18+.
// Порядок: проверка → запись на диск в России → отправка в Telegram. Если Telegram недоступен, заявка ждет в очереди и уходит позже.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const PORT = Number(process.env.PORT || 8787);
const DIR = process.env.LEADS_DIR || '/var/lib/southwood/leads';
const TOKEN = process.env.TG_BOT_TOKEN || '';
const CHAT = process.env.TG_CHAT_ID || '';
const TG_BASES = (process.env.TG_API_BASES || 'https://api.telegram.org').split(',').map((s) => s.trim()).filter(Boolean);
const ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://southwood.pw,https://www.southwood.pw').split(',');
const KEEP_DAYS = Number(process.env.KEEP_DAYS || 30);
const QUEUE = path.join(DIR, 'queue.json');
fs.mkdirSync(DIR, { recursive: true, mode: 0o700 });

const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u0008\u000b-\u001f]/g, '').trim().slice(0, max);
const VIA = { telegram: 'Telegram', max: 'MAX', call: 'позвонить', email: 'почта' };

function build(b) {
  if (b.consent !== true) return { error: 'consent' };
  if (b.website) return { spam: true };
  if (b.kind === 'write') {
    const msg = clean(b.msg, 1500), contact = clean(b.contact, 80);
    if (msg.length < 5 || contact.length < 3) return { error: 'fields' };
    return { rec: { kind: 'write', msg, contact, via: clean(b.via, 12), name: clean(b.name, 80), page: clean(b.page, 120) },
      text: `Сообщение с сайта\n\n${msg}\n\nОтветить: ${VIA[b.via] || b.via} ${contact}${b.name ? `\nИмя: ${clean(b.name, 80)}` : ''}` };
  }
  const name = clean(b.name, 80), company = clean(b.company, 120), phone = clean(b.phone, 24), task = clean(b.task, 1500);
  const labels = Array.isArray(b.needLabels) ? b.needLabels.slice(0, 12).map((x) => clean(x, 40)) : [];
  if (name.length < 2 || company.length < 2 || phone.replace(/\D/g, '').length < 10 || !labels.length) return { error: 'fields' };
  const ctx = clean(b.context, 60);
  return { rec: { kind: 'lead', name, company, phone, via: clean(b.via, 12), need: labels, task, context: ctx, page: clean(b.page, 120) },
    text: `Заявка с сайта${ctx ? ` (${ctx})` : ''}\n\n${name}, ${company}\n${phone}\nСвязаться: ${VIA[b.via] || b.via}\n\nНужно: ${labels.join(', ')}${task ? `\n\n${task}` : ''}` };
}

async function tg(text) {
  if (!TOKEN || !CHAT) throw new Error('telegram is not configured');
  let last;
  for (const base of TG_BASES) {
    try {
      const r = await fetch(`${base}/bot${TOKEN}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: CHAT, text: text.slice(0, 4000), disable_web_page_preview: true }), signal: AbortSignal.timeout(8000) });
      if (r.ok) return; last = new Error('telegram ' + r.status);
    } catch (e) { last = e; }
  }
  throw last;
}
const readQueue = () => { try { return JSON.parse(fs.readFileSync(QUEUE, 'utf8')); } catch { return []; } };
const writeQueue = (q) => fs.writeFileSync(QUEUE, JSON.stringify(q), { mode: 0o600 });
let flushing = false;
async function flush() {
  if (flushing) return; flushing = true;
  try { let q = readQueue(); while (q.length) { await tg(q[0]); q = readQueue().slice(1); writeQueue(q); } } catch (e) { console.error('queue:', e.message); }
  flushing = false;
}
function sweep() {
  const limit = Date.now() - KEEP_DAYS * 864e5;
  for (const f of fs.readdirSync(DIR)) { const m = f.match(/^(\d{4}-\d{2}-\d{2})\.jsonl$/); if (m && new Date(m[1]).getTime() < limit) fs.unlinkSync(path.join(DIR, f)); }
}
setInterval(flush, 60_000); setInterval(sweep, 6 * 3600_000); sweep(); flush();

const hits = new Map();
function limited(ip) { const now = Date.now(); const a = (hits.get(ip) || []).filter((t) => now - t < 600_000); a.push(now); hits.set(ip, a); return a.length > 6; }
setInterval(() => hits.clear(), 3600_000);

http.createServer((req, res) => {
  const origin = req.headers.origin || '';
  const cors = ORIGINS.includes(origin) ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {};
  const send = (code, obj) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...cors }); res.end(JSON.stringify(obj)); };
  if (req.url === '/health') return send(200, { ok: true, queue: readQueue().length });
  if (req.url !== '/lead') return send(404, { ok: false });
  if (req.method === 'OPTIONS') { res.writeHead(204, { ...cors, 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400' }); return res.end(); }
  if (req.method !== 'POST') return send(405, { ok: false });
  if (origin && !ORIGINS.includes(origin)) return send(403, { ok: false });
  const ip = String(req.headers['x-real-ip'] || req.socket.remoteAddress || '');
  if (limited(ip)) return send(429, { ok: false, error: 'rate' });
  let raw = ''; let over = false;
  req.on('data', (c) => { raw += c; if (raw.length > 20_000) { over = true; req.destroy(); } });
  req.on('end', async () => {
    if (over) return;
    let body; try { body = JSON.parse(raw); } catch { return send(400, { ok: false, error: 'json' }); }
    const r = build(body);
    if (r.spam) return send(200, { ok: true });
    if (r.error) return send(422, { ok: false, error: r.error });
    const now = new Date();
    try { fs.appendFileSync(path.join(DIR, now.toISOString().slice(0, 10) + '.jsonl'), JSON.stringify({ t: now.toISOString(), ip, ua: clean(req.headers['user-agent'], 200), ...r.rec }) + '\n', { mode: 0o600 }); }
    catch (e) { console.error('disk:', e.message); return send(500, { ok: false, error: 'store' }); }
    // Заявка уже сохранена. Если Telegram не ответил, она уйдет из очереди позже, посетителю это не мешает.
    try { await tg(r.text); } catch (e) { console.error('telegram:', e.message); writeQueue([...readQueue(), r.text]); }
    send(200, { ok: true });
  });
}).listen(PORT, '127.0.0.1', () => console.log('lead server on 127.0.0.1:' + PORT));
