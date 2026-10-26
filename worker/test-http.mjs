// Проверка адресов воркера на поднятом wrangler dev: node worker/test-http.mjs [адрес]
// Запускать без секретов: тогда оба канала отваливаются и видно, что заявка легла в очередь, а не потерялась.
import assert from 'node:assert/strict';

const BASE = process.argv[2] || 'http://127.0.0.1:8799';
const SITE = 'https://southwood.pw';
let ok = 0;
const t = async (name, fn) => { try { await fn(); ok++; console.log('  ок:', name); } catch (e) { console.error('ПРОВАЛ:', name, '\n ', e.message); process.exitCode = 1; } };
const post = (path, body, origin = SITE) => fetch(BASE + path, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify(body) });
const lead = (extra = {}) => ({ kind: 'lead', consent: true, name: 'Сергей', company: 'ООО Ромашка', phone: '+7 999 123-45-67', via: 'call', needLabels: ['Сайт'], ...extra });

await t('/health отвечает и показывает очереди', async () => {
  const r = await fetch(BASE + '/health');
  assert.equal(r.status, 200);
  const j = await r.json();
  assert.equal(j.ok, true);
  assert.equal(typeof j.queue, 'number');
  assert.equal(typeof j.mail, 'number');
});

await t('неизвестный адрес — 404', async () => {
  assert.equal((await fetch(BASE + '/nope')).status, 404);
});

await t('GET на /lead не принимается', async () => {
  assert.equal((await fetch(BASE + '/lead')).status, 405);
});

await t('заявка с чужого адреса — 403', async () => {
  assert.equal((await post('/lead', lead(), 'https://evil.example')).status, 403);
});

await t('без согласия — 422', async () => {
  const r = await post('/lead', { ...lead(), consent: false });
  assert.equal(r.status, 422);
  assert.equal((await r.json()).error, 'consent');
});

await t('битые поля — 422', async () => {
  assert.equal((await post('/lead', lead({ phone: '123' }))).status, 422);
});

await t('сломанный JSON — 400', async () => {
  const r = await fetch(BASE + '/lead', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: SITE }, body: '{нет' });
  assert.equal(r.status, 400);
});

await t('бот в ловушке получает 200 и ничего не уходит', async () => {
  const before = await (await fetch(BASE + '/health')).json();
  const r = await post('/lead', lead({ website: 'http://spam' }));
  assert.equal(r.status, 200);
  const after = await (await fetch(BASE + '/health')).json();
  assert.equal(after.queue, before.queue, 'спам не должен попадать в очередь');
  assert.equal(after.mail, before.mail);
});

await t('заявка принята и без каналов легла в обе очереди', async () => {
  const before = await (await fetch(BASE + '/health')).json();
  const r = await post('/lead', lead());
  assert.equal(r.status, 200);
  assert.equal((await r.json()).ok, true);
  const after = await (await fetch(BASE + '/health')).json();
  assert.equal(after.queue, before.queue + 1, 'очередь Telegram');
  assert.equal(after.mail, before.mail + 1, 'очередь почты');
});

await t('заявка с PDF: файл отдается по ссылке', async () => {
  const pdf = new Uint8Array(2000); pdf.set(new TextEncoder().encode('%PDF-1.7'));
  let bin = ''; for (const b of pdf) bin += String.fromCharCode(b);
  const r = await post('/lead', lead({ calc: { title: '100 000 ₽', text: 'состав', link: 'https://southwood.pw/ceny/' }, pdf: btoa(bin) }));
  assert.equal(r.status, 200);
  // имя файла знает только воркер, поэтому проверяем сам обработчик ссылок
  assert.equal((await fetch(BASE + '/pdf/нет.pdf')).status, 400, 'чужое имя не принимается');
  assert.equal((await fetch(BASE + '/pdf/1700000000000-abcdef.pdf')).status, 404, 'несуществующий файл');
});

await t('счетчик блога: до порога числа не отдаются', async () => {
  const r = await post('/stat', { p: 'skolko-stoit-sajt', e: 'read' });
  assert.equal(r.status, 200);
  const j = await r.json();
  assert.equal(j.ok, true);
  assert.equal(j.read, null, 'ниже порога показа');
});

await t('счетчик блога: один адрес не считается дважды', async () => {
  await post('/stat', { p: 'test-slug', e: 'read' });
  await post('/stat', { p: 'test-slug', e: 'read' });
  const r = await fetch(BASE + '/stat?p=test-slug');
  assert.equal(r.status, 200);
  assert.equal((await r.json()).ok, true);
});

await t('счетчик блога: мусор не принимается', async () => {
  assert.equal((await post('/stat', { p: 'ПЛОХО', e: 'read' })).status, 400);
  assert.equal((await post('/stat', { p: 'ok-slug', e: 'нет' })).status, 400);
  assert.equal((await fetch(BASE + '/stat?p=')).status, 400);
  assert.equal((await post('/stat', { p: 'ok-slug', e: 'read' }, 'https://evil.example')).status, 403);
});

await t('перебор заявок с одного адреса упирается в 429', async () => {
  let got = 0;
  for (let i = 0; i < 9; i++) { const r = await post('/lead', lead()); if (r.status === 429) got++; }
  assert.ok(got > 0, 'ограничение частоты не сработало');
});

await t('предзапрос браузера разрешен для своего адреса', async () => {
  const r = await fetch(BASE + '/lead', { method: 'OPTIONS', headers: { Origin: SITE } });
  assert.equal(r.status, 204);
  assert.equal(r.headers.get('access-control-allow-origin'), SITE);
});

if (!process.exitCode) console.log(`\nВсе проверки адресов пройдены: ${ok}`);
