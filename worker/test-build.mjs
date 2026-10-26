// Проверка разбора заявки: node worker/test-build.mjs
// Тексты сверены с прежним сервером (server/lead-server.mjs), чтобы письмо и сообщение в Telegram не поехали.
// Отличие от прежнего: письмо всегда получает состав расчета, потому что файл уходит только в Telegram.
import assert from 'node:assert/strict';
import { build, b64, b64bytes, unb64, encWord } from './lead-build.mjs';

let ok = 0;
const t = (name, fn) => { try { fn(); ok++; } catch (e) { console.error('ПРОВАЛ:', name, '\n ', e.message); process.exitCode = 1; } };
const fakePdf = (n = 2000) => { const u = new Uint8Array(n); u.set(new TextEncoder().encode('%PDF-1.7')); return u; };
const lead = (extra = {}) => ({ kind: 'lead', consent: true, name: 'Сергей', company: 'ООО Ромашка', phone: '+7 999 123-45-67', via: 'call', needLabels: ['Сайт'], ...extra });

t('сообщение с сайта', () => {
  const r = build({ kind: 'write', consent: true, msg: 'Привет, нужен сайт', contact: '@southwood', via: 'telegram', name: 'Сергей', page: '/kontakty/' });
  assert.equal(r.subj, 'Сообщение с сайта: Сергей');
  assert.equal(r.reply, '');
  assert.equal(r.text, 'Сообщение с сайта\n\nСообщение: Привет, нужен сайт\n\nОтветить через: Telegram\nКонтакт: @southwood\nИмя: Сергей\nСтраница: /kontakty/');
  assert.equal(r.n, r.text.length);
  assert.equal(r.htmlPlain, r.html);
  assert.equal(r.pdf, null);
});

t('сообщение: почта попадает в Reply-To', () => {
  const r = build({ kind: 'write', consent: true, msg: 'Здравствуйте', contact: 'im@southwood.pw', via: 'email' });
  assert.equal(r.reply, 'im@southwood.pw');
  assert.equal(r.subj, 'Сообщение с сайта');
});

t('сообщение: звонок не попадает в Reply-To', () => {
  assert.equal(build({ kind: 'write', consent: true, msg: 'Здравствуйте', contact: '+79991234567', via: 'call' }).reply, '');
});

t('заявка без лишнего', () => {
  const r = build(lead());
  assert.equal(r.subj, 'Заявка с сайта: Сергей, ООО Ромашка');
  assert.equal(r.text, 'Заявка с сайта\n\nИмя: Сергей\nКомпания: ООО Ромашка\nТелефон: +7 999 123-45-67\nСвязаться: позвонить\nНужно: Сайт');
  assert.equal(r.pdf, null);
  assert.equal(r.calcHtml, '');
});

t('заявка: источник и срок словами', () => {
  const r = build(lead({ via: 'telegram', needLabels: ['Бот'], context: 'calc', deadline: '2026-11-05', task: 'Нужно к выставке', page: '/uslugi/chat-boty/' }));
  assert.equal(r.text, 'Заявка с сайта, калькулятор\n\nИмя: Сергей\nКомпания: ООО Ромашка\nТелефон: +7 999 123-45-67\nСвязаться: Telegram\nНужно: Бот\nНужно к дате: 5 ноября 2026\nКомментарий: Нужно к выставке\n\nСтраница: /uslugi/chat-boty/');
});

t('заявка: кейс в источнике', () => {
  assert.match(build(lead({ context: 'case:belmare' })).text, /^Заявка с сайта, кейс belmare/);
  assert.match(build(lead({ context: 'scenario:iiko' })).text, /^Заявка с сайта, сценарий автоматизации iiko/);
});

t('расчет без файла: состав и в письме, и в Telegram', () => {
  const r = build(lead({ calc: { title: '350 000 ₽', text: 'Сайт: 250 000\nCRM: 100 000', link: 'https://southwood.pw/ceny/#calc=abc' } }));
  assert.match(r.text, /\n\nРасчет: 350 000 ₽\nСайт: 250 000\nCRM: 100 000/);
  assert.match(r.text, /\n\nОткрыть расчет на сайте: https:\/\/southwood\.pw\/ceny\/#calc=abc$/);
  assert.match(r.html, /Расчет: 350 000 ₽\nСайт: 250 000/);
  assert.match(r.html, /<a href="https:\/\/southwood\.pw\/ceny\/#calc=abc">Открыть расчет на сайте<\/a>$/);
  assert.equal(r.htmlPlain, r.html, 'без файла оба вида совпадают');
  assert.equal(r.nPlain, r.n);
});

t('расчет с файлом: в письме состав, в Telegram пометка про вложение', () => {
  const r = build(lead({ calc: { title: '100 000 ₽', text: 'Сайт: 100 000\nCRM: 50 000\nБот: 40 000', link: 'https://southwood.pw/ceny/#calc=abc' }, pdf: b64bytes(fakePdf()) }));
  assert.ok(r.pdf instanceof Uint8Array);
  assert.equal(r.pdf.length, 2000);
  // письмо: состав есть, про вложение не пишем, потому что файла в письме нет
  assert.match(r.text, /Расчет: 100 000 ₽\nСайт: 100 000\nCRM: 50 000\nБот: 40 000/);
  assert.doesNotMatch(r.text, /во вложении/);
  assert.match(r.text, /Открыть расчет на сайте: https/);
  // Telegram: пометка про вложение, состав не дублируем
  assert.match(r.html, /Расчет: 100 000 ₽, PDF во вложении/);
  assert.doesNotMatch(r.html, /Сайт: 100 000/);
  // запасной вид для очереди: состав на месте, про вложение ничего
  assert.match(r.htmlPlain, /Расчет: 100 000 ₽\nСайт: 100 000\nCRM: 50 000\nБот: 40 000/);
  assert.doesNotMatch(r.htmlPlain, /во вложении/);
  assert.ok(r.nPlain > r.n, 'запасной вид длиннее: в нем весь состав');
  // отдельное сообщение, если файл не дошел после текста
  assert.equal(r.calcHtml, 'Расчет: 100 000 ₽\nСайт: 100 000\nCRM: 50 000\nБот: 40 000');
});

t('длина для Telegram считается со ссылкой', () => {
  const link = 'https://southwood.pw/ceny/#calc=abc';
  const a = build(lead({ calc: { title: 'х', text: 'у', link } }));
  const b = build(lead({ calc: { title: 'х', text: 'у', link: '' } }));
  assert.equal(a.n - b.n, 'Открыть расчет на сайте'.length + 2);
});

t('чужая ссылка на расчет отбрасывается', () => {
  const r = build(lead({ calc: { title: 'х', text: 'у', link: 'https://evil.example/ceny/' } }));
  assert.doesNotMatch(r.text, /evil\.example/);
  assert.doesNotMatch(r.text, /Открыть расчет/);
});

t('подделка под PDF отбрасывается, состав уходит текстом', () => {
  const junk = new Uint8Array(2000); junk.set(new TextEncoder().encode('<html>'));
  const r = build(lead({ calc: { title: 'х', text: 'состав', link: '' }, pdf: b64bytes(junk) }));
  assert.equal(r.pdf, null);
  assert.match(r.html, /состав/);
  assert.doesNotMatch(r.html, /во вложении/);
});

t('слишком короткий файл отбрасывается', () => {
  assert.equal(build(lead({ calc: { title: 'х', text: 'у', link: '' }, pdf: b64bytes(fakePdf(500)) })).pdf, null);
});

t('без согласия не принимаем', () => {
  assert.equal(build({ kind: 'lead', name: 'Сергей', company: 'ООО', phone: '79991234567', needLabels: ['x'] }).error, 'consent');
});

t('ловушка для ботов', () => {
  assert.equal(build(lead({ website: 'http://spam' })).spam, true);
});

t('короткий телефон и пустой список не проходят', () => {
  assert.equal(build(lead({ phone: '123' })).error, 'fields');
  assert.equal(build(lead({ needLabels: [] })).error, 'fields');
  assert.equal(build({ kind: 'write', consent: true, msg: 'ок', contact: '@x' }).error, 'fields');
});

t('разметка в полях не ломает письмо', () => {
  const r = build(lead({ name: '<b>Сергей</b>', company: 'ООО "Кавычки"' }));
  assert.match(r.html, /&lt;b&gt;Сергей&lt;\/b&gt;/);
  assert.match(r.html, /&quot;Кавычки&quot;/);
  assert.match(r.text, /<b>Сергей<\/b>/); // в письме текстом, без разметки
});

t('управляющие символы вычищаются', () => {
  assert.match(build({ kind: 'write', consent: true, msg: 'стро\u0007ка', contact: '@southwood', via: 'telegram' }).text, /строка/);
});

t('base64 туда и обратно', () => {
  const s = 'Заявка с сайта: Сергей, ООО «Ромашка»';
  assert.equal(new TextDecoder().decode(unb64(b64(s))), s);
  assert.match(encWord('Сайт southwood.pw'), /^=\?UTF-8\?B\?/);
});

if (!process.exitCode) console.log(`Все проверки пройдены: ${ok}`);
