// Прием заявок с сайта на Cloudflare Workers. Без зависимостей.
// Порядок: проверка → отправка в Telegram и копия на почту. Сами заявки нигде не хранятся.
// PDF расчета живет в R2 отведенный срок: в Telegram уходит вложением, в письме ссылкой.
// Если канал недоступен, заявка ждет в своей очереди в D1 и уходит по расписанию.
import { connect } from 'cloudflare:sockets';
import { build, b64, encWord, list, num } from './lead-build.mjs';

// Telegram
async function tgCall(env, method, make, ms) {
  const token = env.TG_BOT_TOKEN || '', chat = env.TG_CHAT_ID || '';
  if (!token || !chat) throw new Error('telegram is not configured');
  let last;
  for (const base of list(env.TG_API_BASES, 'https://api.telegram.org')) {
    try { const r = await fetch(`${base}/bot${token}/${method}`, { method: 'POST', ...make(chat), signal: AbortSignal.timeout(ms) }); if (r.ok) return; last = new Error(`telegram ${method} ${r.status}`); } catch (e) { last = e; }
  }
  throw last;
}
const tgMsg = (env, text, html) => tgCall(env, 'sendMessage', (chat) => ({ headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ chat_id: chat, text: text.slice(0, 4000), disable_web_page_preview: true, ...(html ? { parse_mode: 'HTML' } : {}) }) }), 8000);
const PDF_NAME = () => `raschet-southwood-${new Date().toISOString().slice(0, 10)}.pdf`;
// Имя файла в R2. Ровно шесть знаков: короче нельзя, иначе ссылка из письма не пройдет проверку ниже.
const KEY = /^\d+-[0-9a-f]{6}\.pdf$/;
const newKey = () => `${Date.now()}-${Array.from(crypto.getRandomValues(new Uint8Array(3)), (b) => b.toString(16).padStart(2, '0')).join('')}.pdf`;
async function tgDoc(env, file, cap, html) {
  const obj = await env.PDFS.get(file);
  if (!obj) throw new Error('pdf is gone'); // файл убрали по срокам, дублировать текст незачем
  const bytes = await obj.arrayBuffer();
  return tgCall(env, 'sendDocument', (chat) => {
    const fd = new FormData(); fd.set('chat_id', chat); fd.set('caption', cap); if (html) fd.set('parse_mode', 'HTML');
    fd.set('document', new Blob([bytes], { type: 'application/pdf' }), PDF_NAME());
    return { body: fd };
  }, 20000);
}
// Одна заявка в Telegram. С расчетом: файл с подписью из всех полей. Если подпись длиннее лимита, текст и файл отдельно.
// При сбое на файле после ушедшего текста в ошибке лежит остаток, чтобы текст не дублировался.
async function tgItem(env, it) {
  if (typeof it === 'string') return tgMsg(env, it);
  const file = it.doc && (await env.PDFS.head(it.doc)) ? it.doc : '';
  if (!it.h) { if (file) await tgDoc(env, file, it.cap || ''); return; }
  if (file && it.n <= 1000) return tgDoc(env, file, it.h, true);
  await tgMsg(env, it.h, true);
  if (file) try { await tgDoc(env, file, it.cap || ''); } catch (e) { e.rest = { doc: file, cap: it.cap }; throw e; }
}

// Почта: SMTP поверх TLS (порт 465), вход по логину и паролю приложения. Порт 25 из воркера закрыт, 465 разрешен.
export async function mail(env, { s: subject, t: text, r: reply }) {
  const host = env.SMTP_HOST || '', user = env.SMTP_USER || '', pass = env.SMTP_PASS || '';
  const to = list(env.MAIL_TO, user);
  if (!host || !user || !pass || !to.length) throw new Error('mail is not configured');
  const wrap76 = (x) => b64(x).replace(/(.{76})/g, '$1\r\n');
  const msg = [`From: ${encWord('Сайт southwood.pw')} <${user}>`, `To: ${to.map((x) => `<${x}>`).join(', ')}`, ...(reply ? [`Reply-To: <${reply}>`] : []),
    `Subject: ${encWord(subject)}`, `Date: ${new Date().toUTCString().replace('GMT', '+0000')}`,
    `Message-ID: <${Date.now()}.${Math.random().toString(36).slice(2)}@southwood.pw>`, 'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8', 'Content-Transfer-Encoding: base64', '', wrap76(text)].join('\r\n');
  const steps = ['EHLO southwood.pw', 'AUTH LOGIN', b64(user), b64(pass), `MAIL FROM:<${user}>`, ...to.map((x) => `RCPT TO:<${x}>`), 'DATA', msg + '\r\n.', 'QUIT'];
  const sentAt = steps.length - 1; // ответ на письмо приходит перед QUIT
  const sock = connect({ hostname: host, port: num(env.SMTP_PORT, 465) }, { secureTransport: 'on' });
  const w = sock.writable.getWriter(), rd = sock.readable.getReader();
  const enc = new TextEncoder(), dec = new TextDecoder();
  let buf = '', i = 0;
  try {
    for (;;) {
      const { value, done } = await rd.read();
      if (done) throw new Error('mail closed');
      buf += dec.decode(value, { stream: true });
      const lines = buf.split('\r\n'); buf = lines.pop();
      for (const l of lines) {
        if (!/^\d{3} /.test(l)) continue; // строка многострочного ответа
        if (Number(l.slice(0, 3)) >= 400) throw new Error('mail ' + l.slice(0, 80));
        if (i === sentAt) { try { await w.write(enc.encode('QUIT\r\n')); } catch {} return; }
        await w.write(enc.encode(steps[i++] + '\r\n'));
      }
    }
  } finally { try { await sock.close(); } catch {} }
}

// Очереди в D1: по элементу за раз, порядок сохраняется.
const push = (env, kind, body) => env.DB.prepare('insert into queue (kind, body, at) values (?1, ?2, ?3)').bind(kind, JSON.stringify(body), Date.now()).run();
async function drain(env, kind, send) {
  for (;;) {
    const row = await env.DB.prepare('select id, body from queue where kind = ?1 order by id limit 1').bind(kind).first();
    if (!row) return;
    try { await send(JSON.parse(row.body)); } catch (e) {
      console.error(kind + ' queue:', e.message);
      if (e.rest) await env.DB.prepare('update queue set body = ?2 where id = ?1').bind(row.id, JSON.stringify(e.rest)).run();
      return; // следующая попытка по расписанию, порядок не рвем
    }
    await env.DB.prepare('delete from queue where id = ?1').bind(row.id).run();
  }
}

// Уборка: старые файлы расчетов, отметки посетителей и записи о частоте.
async function sweep(env) {
  const limit = Date.now() - num(env.KEEP_DAYS, 30) * 864e5, day = Date.now() - 864e5;
  await env.DB.batch([
    env.DB.prepare('delete from seen where at < ?1').bind(day),
    env.DB.prepare('delete from hits where at < ?1').bind(day),
  ]);
  let cursor;
  do {
    const page = await env.PDFS.list({ cursor, limit: 500 });
    const old = page.objects.filter((o) => o.uploaded.getTime() < limit).map((o) => o.key);
    if (old.length) await env.PDFS.delete(old);
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);
}

// Заявки с одного адреса: не больше шести за десять минут.
async function limited(env, ip) {
  const now = Date.now();
  const r = await env.DB.prepare('select count(*) as n from hits where ip = ?1 and at > ?2').bind(ip, now - 600_000).first();
  await env.DB.prepare('insert into hits (ip, at) values (?1, ?2)').bind(ip, now).run();
  return (r?.n || 0) >= 6;
}

// Счетчики статей блога: сколько раз дочитали и сколько раз нажали «Поделиться».
// Адреса посетителей держатся сутки только чтобы один человек не считался дважды.
// Наружу число отдается, когда оно перевалило за порог, до этого на сайте ничего не показывается.
const SLUG = /^[a-z0-9-]{1,80}$/;
const STAT_KEYS = 300; // больше страниц не заводим, чтобы базу нельзя было раздуть запросами
async function statOut(env, p) {
  const v = (await env.DB.prepare('select read, share from stats where slug = ?1').bind(p).first()) || {};
  const on = (v.read || 0) >= num(env.SHOW_READS, 300);
  return { ok: true, read: on ? v.read : null, share: on && (v.share || 0) >= num(env.SHOW_SHARES, 20) ? v.share : null };
}
async function statHit(env, p, e, ip) {
  const ins = await env.DB.prepare('insert or ignore into seen (k, at) values (?1, ?2)').bind(`${ip}|${p}|${e}`, Date.now()).run();
  if (!ins.meta.changes) return;
  const known = await env.DB.prepare('select 1 as x from stats where slug = ?1').bind(p).first();
  if (!known) {
    const c = await env.DB.prepare('select count(*) as n from stats').first();
    if ((c?.n || 0) >= STAT_KEYS) return;
  }
  await env.DB.prepare('insert into stats (slug, read, share) values (?1, ?2, ?3) on conflict(slug) do update set read = read + ?2, share = share + ?3')
    .bind(p, e === 'read' ? 1 : 0, e === 'share' ? 1 : 0).run();
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const origin = req.headers.get('origin') || '';
    const allowed = list(env.ALLOWED_ORIGINS, 'https://southwood.pw,https://www.southwood.pw');
    const cors = allowed.includes(origin) ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {};
    const send = (code, obj) => new Response(JSON.stringify(obj), { status: code, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...cors } });
    const ip = req.headers.get('cf-connecting-ip') || '';

    if (url.pathname === '/health') {
      const q = await env.DB.prepare('select kind, count(*) as n from queue group by kind').all();
      const by = Object.fromEntries((q.results || []).map((r) => [r.kind, r.n]));
      return send(200, { ok: true, queue: by.tg || 0, mail: by.mail || 0 });
    }

    // Файл расчета по ссылке из письма
    if (url.pathname.startsWith('/pdf/')) {
      const key = url.pathname.slice(5);
      if (!KEY.test(key)) return send(400, { ok: false });
      const obj = await env.PDFS.get(key);
      if (!obj) return send(404, { ok: false, error: 'gone' });
      return new Response(obj.body, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="${PDF_NAME()}"`, 'Cache-Control': 'private, max-age=600' } });
    }

    if (url.pathname === '/stat') {
      if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...cors, 'Access-Control-Allow-Methods': 'GET, POST', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400' } });
      if (req.method === 'GET') { const p = url.searchParams.get('p') || ''; return SLUG.test(p) ? send(200, await statOut(env, p)) : send(400, { ok: false }); }
      if (req.method !== 'POST') return send(405, { ok: false });
      if (!allowed.includes(origin)) return send(403, { ok: false });
      const raw = await req.text();
      if (raw.length > 300) return send(400, { ok: false });
      let b; try { b = JSON.parse(raw); } catch { return send(400, { ok: false }); }
      const p = String(b.p || ''), e = b.e === 'share' ? 'share' : b.e === 'read' ? 'read' : '';
      if (!SLUG.test(p) || !e) return send(400, { ok: false });
      await statHit(env, p, e, ip);
      return send(200, await statOut(env, p));
    }

    if (url.pathname !== '/lead') return send(404, { ok: false });
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: { ...cors, 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400' } });
    if (req.method !== 'POST') return send(405, { ok: false });
    if (origin && !allowed.includes(origin)) return send(403, { ok: false });
    if (await limited(env, ip)) return send(429, { ok: false, error: 'rate' });

    const raw = await req.text();
    if (raw.length > 900_000) return send(413, { ok: false });
    let body; try { body = JSON.parse(raw); } catch { return send(400, { ok: false, error: 'json' }); }
    const r = build(body);
    if (r.spam) return send(200, { ok: true });
    if (r.error) return send(422, { ok: false, error: r.error });

    // Файл расчета нужен и Telegram, и письму, поэтому кладем его до отправки.
    let file = '', text = r.text;
    if (r.pdf) {
      file = newKey();
      try {
        await env.PDFS.put(file, r.pdf, { httpMetadata: { contentType: 'application/pdf' } });
        text += `\n\nРасчет файлом: ${(env.PUBLIC_BASE || '').replace(/\/$/, '')}/pdf/${file}`;
      } catch (e) { console.error('r2:', e.message); file = ''; }
    }
    const m = { s: r.subj, t: text, r: r.reply };
    const item = { h: r.html, n: r.n, ...(file ? { doc: file, cap: r.cap } : {}) };
    // Если канал не ответил, заявка уйдет из очереди позже, посетителю это не мешает.
    const viaTg = async () => { try { await tgItem(env, item); } catch (e) { console.error('telegram:', e.message); await push(env, 'tg', e.rest || item); } };
    const viaMail = async () => { try { await mail(env, m); } catch (e) { console.error('mail:', e.message); await push(env, 'mail', m); } };
    await Promise.all([viaTg(), viaMail()]);
    return send(200, { ok: true });
  },

  async scheduled(event, env, ctx) {
    if (event.cron === '0 */6 * * *') return ctx.waitUntil(sweep(env));
    ctx.waitUntil(Promise.all([drain(env, 'tg', (it) => tgItem(env, it)), drain(env, 'mail', (m) => mail(env, m))]));
  },
};
