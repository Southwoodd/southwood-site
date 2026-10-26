// Проверка разбора заявки: node worker/test-build.mjs
// Тексты сверены с прежним сервером (server/lead-server.mjs), чтобы письмо и сообщение в Telegram не поехали.
import assert from 'node:assert/strict';
import { build, b64, unb64, encWord } from './lead-build.mjs';

let ok = 0;
const t = (name, fn) => { try { fn(); ok++; } catch (e) { console.error('ПРОВАЛ:', name, '\n ', e.message); process.exitCode = 1; } };

t('сообщение с сайта', () => {
  const r = build({ kind: 'write', consent: true, msg: 'Привет, нужен сайт', contact: '@southwood', via: 'telegram', name: 'Сергей', page: '/kontakty/' });
  assert.equal(r.subj, 'Сообщение с сайта: Сергей');
  assert.equal(r.reply, '');
  assert.equal(r.text, 'Сообщение с сайта\n\nСообщение: Привет, нужен сайт\n\nОтветить через: Telegram\nКонтакт: @southwood\nИмя: Сергей\nСтраница: /kontakty/');
  assert.equal(r.n, r.text.length);
});

t('сообщение: почта попадает в Reply-To', () => {
  const r = build({ kind: 'write', consent: true, msg: 'Здравствуйте', contact: 'im@southwood.pw', via: 'email' });
  assert.equal(r.reply, 'im@southwood.pw');
  assert.equal(r.subj, 'Сообщение с сайта');
});

t('сообщение: звонок не попадает в Reply-To', () => {
  const r = build({ kind: 'write', consent: true, msg: 'Здравствуйте', contact: '+79991234567', via: 'call' });
  assert.equal(r.reply, '');
});

t('заявка без лишнего', () => {
  const r = build({ kind: 'lead', consent: true, name: 'Сергей', company: 'ООО Ромашка', phone: '+7 999 123-45-67', via: 'call', needLabels: ['Сайт', 'CRM'] });
  assert.equal(r.subj, 'Заявка с сайта: Сергей, ООО Ромашка');
  assert.equal(r.text, 'Заявка с сайта\n\nИмя: Сергей\nКомпания: ООО Ромашка\nТелефон: +7 999 123-45-67\nСвязаться: позвонить\nНужно: Сайт, CRM');
  assert.equal(r.pdf, null);
});

t('заявка: источник и срок словами', () => {
  const r = build({ kind: 'lead', consent: true, name: 'Сергей', company: 'ООО Ромашка', phone: '79991234567', via: 'telegram', needLabels: ['Бот'], context: 'calc', deadline: '2026-11-05', task: 'Нужно к выставке', page: '/uslugi/chat-boty/' });
  assert.equal(r.text, 'Заявка с сайта, калькулятор\n\nИмя: Сергей\nКомпания: ООО Ромашка\nТелефон: 79991234567\nСвязаться: Telegram\nНужно: Бот\nНужно к дате: 5 ноября 2026\nКомментарий: Нужно к выставке\n\nСтраница: /uslugi/chat-boty/');
});

t('заявка: кейс и набор в источнике', () => {
  assert.match(build({ kind: 'lead', consent: true, name: 'А', company: 'Б', phone: '79991234567', needLabels: ['x'] }).error || '', /fields/);
  const r = build({ kind: 'lead', consent: true, name: 'Аа', company: 'Бб', phone: '79991234567', needLabels: ['x'], context: 'case:belmare' });
  assert.match(r.text, /^Заявка с сайта, кейс belmare/);
});

t('расчет без файла уходит составом в тексте', () => {
  const r = build({ kind: 'lead', consent: true, name: 'Сергей', company: 'ООО Ромашка', phone: '79991234567', via: 'call', needLabels: ['Сайт'],
    calc: { title: '350 000 ₽', text: 'Сайт: 250 000\nCRM: 100 000', link: 'https://southwood.pw/ceny/?c=1' } });
  assert.match(r.text, /Расчет: 350 000 ₽\nСайт: 250 000\nCRM: 100 000/);
  assert.match(r.text, /Открыть расчет на сайте: https:\/\/southwood\.pw\/ceny\/\?c=1$/);
  assert.match(r.html, /<a href="https:\/\/southwood\.pw\/ceny\/\?c=1">Открыть расчет на сайте<\/a>$/);
  assert.equal(r.n, r.text.replace(/\n\nОткрыть расчет на сайте: .*$/, '\n\nОткрыть расчет на сайте').length);
});

t('чужая ссылка на расчет отбрасывается', () => {
  const r = build({ kind: 'lead', consent: true, name: 'Сергей', company: 'ООО Ромашка', phone: '79991234567', needLabels: ['Сайт'],
    calc: { title: 'х', text: 'у', link: 'https://evil.example/ceny/' } });
  assert.doesNotMatch(r.text, /evil\.example/);
  assert.doesNotMatch(r.text, /Открыть расчет/);
});

t('настоящий PDF принимается, подпись про ссылку', () => {
  const pdf = new Uint8Array(2000); pdf.set(new TextEncoder().encode('%PDF-1.7'));
  const r = build({ kind: 'lead', consent: true, name: 'Сергей', company: 'ООО Ромашка', phone: '79991234567', needLabels: ['Сайт'],
    calc: { title: '100 000 ₽', text: 'не нужен', link: '' }, pdf: b64bytesOf(pdf) });
  assert.ok(r.pdf instanceof Uint8Array);
  assert.equal(r.pdf.length, 2000);
  assert.match(r.text, /Расчет: 100 000 ₽, PDF отдельной ссылкой/);
  assert.doesNotMatch(r.text, /не нужен/); // состав текстом только когда файла нет
});

t('подделка под PDF отбрасывается', () => {
  const junk = new Uint8Array(2000); junk.set(new TextEncoder().encode('<html>'));
  const r = build({ kind: 'lead', consent: true, name: 'Сергей', company: 'ООО Ромашка', phone: '79991234567', needLabels: ['Сайт'],
    calc: { title: 'х', text: 'состав', link: '' }, pdf: b64bytesOf(junk) });
  assert.equal(r.pdf, null);
  assert.match(r.text, /состав/);
});

t('без согласия не принимаем', () => {
  assert.equal(build({ kind: 'lead', name: 'Сергей', company: 'ООО', phone: '79991234567', needLabels: ['x'] }).error, 'consent');
});

t('ловушка для ботов', () => {
  assert.equal(build({ kind: 'lead', consent: true, website: 'http://spam', name: 'Сергей', company: 'ООО', phone: '79991234567', needLabels: ['x'] }).spam, true);
});

t('короткий телефон и пустой список не проходят', () => {
  assert.equal(build({ kind: 'lead', consent: true, name: 'Сергей', company: 'ООО', phone: '123', needLabels: ['x'] }).error, 'fields');
  assert.equal(build({ kind: 'lead', consent: true, name: 'Сергей', company: 'ООО', phone: '79991234567', needLabels: [] }).error, 'fields');
  assert.equal(build({ kind: 'write', consent: true, msg: 'ок', contact: '@x' }).error, 'fields');
});

t('разметка в полях не ломает письмо', () => {
  const r = build({ kind: 'lead', consent: true, name: '<b>Сергей</b>', company: 'ООО "Кавычки"', phone: '79991234567', needLabels: ['Сайт'] });
  assert.match(r.html, /&lt;b&gt;Сергей&lt;\/b&gt;/);
  assert.match(r.html, /&quot;Кавычки&quot;/);
  assert.match(r.text, /<b>Сергей<\/b>/); // в письме текстом, без разметки
});

t('управляющие символы вычищаются', () => {
  const r = build({ kind: 'write', consent: true, msg: 'стро\u0007ка', contact: '@southwood', via: 'telegram' });
  assert.match(r.text, /строка/);
});

t('base64 туда и обратно', () => {
  const s = 'Заявка с сайта: Сергей, ООО «Ромашка»';
  assert.equal(new TextDecoder().decode(unb64(b64(s))), s);
  assert.match(encWord('Сайт southwood.pw'), /^=\?UTF-8\?B\?/);
});

function b64bytesOf(u8) { let bin = ''; for (let i = 0; i < u8.length; i += 0x8000) bin += String.fromCharCode(...u8.subarray(i, i + 0x8000)); return btoa(bin); }

if (!process.exitCode) console.log(`Все проверки пройдены: ${ok}`);
