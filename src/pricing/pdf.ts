// PDF расчета на одну страницу A4. Собирается в браузере посетителя. На сервер уходит только вместе с заявкой из калькулятора.
import { PDFDocument, PDFName, PDFString, rgb, type PDFFont, type PDFPage } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { byId, fmtRange, servicesWord, SIZES, PRESETS, type Calc, type State } from './model';

const LOGO = 'M117.65 66.37A58 58 0 0 1 66.37 117.65L63.57 92.28A32.48 32.48 0 0 0 92.28 63.57ZM53.63 117.65A58 58 0 0 1 2.35 66.37L27.72 63.57A32.48 32.48 0 0 0 56.43 92.28ZM2.35 53.63A58 58 0 0 1 53.63 2.35L56.43 27.72A32.48 32.48 0 0 0 27.72 56.43Z';
const hex = (h: string) => { const n = parseInt(h.slice(1), 16); return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255); };
const INK = hex('#0a0a0a'), MUTED = hex('#5a6b62'), LINE = hex('#d5e0d8'), DEEP = hex('#3f6b56'), SOFT = hex('#f3f6f2'), WHITE = rgb(1, 1, 1);

export async function buildPdf(s: State, c: Calc, url: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create(); doc.registerFontkit(fontkit);
  const bytes = await fetch('/fonts/onest-pdf.ttf').then((r) => { if (!r.ok) throw new Error('font'); return r.arrayBuffer(); });
  const font = await doc.embedFont(bytes, { subset: true });
  const page = doc.addPage([595.28, 841.89]);
  const K = 595.28 / 794; // макет 794 px
  const W = 794, H = 1192; const L = 56, Rr = W - 56;
  const y = (v: number) => (H - v) * K * (841.89 / (H * K));
  const sy = 841.89 / H;
  const text = (t: string, x: number, top: number, size: number, color = INK, opt: { right?: boolean; max?: number; lh?: number; bold?: boolean } = {}) => {
    const fs = size * K; const lines = opt.max ? wrap(t, font, fs, opt.max * K) : [t]; let yy = top;
    for (const ln of lines) {
      const w = font.widthOfTextAtSize(ln, fs); const px = (opt.right ? x - w / K : x) * K; const py = 841.89 - (yy + size * 0.82) * sy;
      page.drawText(ln, { x: px, y: py, size: fs, font, color });
      if (opt.bold) page.drawText(ln, { x: px + 0.25, y: py, size: fs, font, color });
      yy += opt.lh || size * 1.35;
    }
    return yy;
  };
  const rect = (x: number, top: number, w: number, h: number, color: ReturnType<typeof rgb>, r = 0) => roundRect(page, x * K, 841.89 - (top + h) * sy, w * K, h * sy, r * K, color);
  const hr = (top: number) => page.drawLine({ start: { x: L * K, y: 841.89 - top * sy }, end: { x: Rr * K, y: 841.89 - top * sy }, thickness: 0.6, color: LINE });

  // знак и имя, вся шапка слева ведет на сайт
  const LS = 38, lk = (LS * K) / 120;
  page.drawSvgPath(LOGO, { x: L * K, y: 841.89 - 56 * sy, scale: lk, color: DEEP });
  page.drawCircle({ x: L * K + 91.99 * lk, y: 841.89 - 56 * sy - 28.01 * lk, size: 14 * lk, color: hex('#7dab90') });
  const NX = L + LS + 12;
  text('Сергей Воробьев', NX, 58, 17, INK, { bold: true });
  text('Сайты, CRM, боты и автоматизация · самозанятый', NX, 84, 11, MUTED);
  text('southwood.pw', Rr, 58, 11, MUTED, { right: true });
  text('Telegram @imsouthwood', Rr, 78, 11, MUTED, { right: true });
  text('im@southwood.pw', Rr, 98, 11, MUTED, { right: true });
  text('Предварительный расчет', L, 142, 28, INK);
  const date = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).replace(' г.', '');
  text([date, c.sizedOn ? `компания ${SIZES[s.size].s}` : '', s.preset ? `набор ${PRESETS[s.preset].name}` : '', s.urgent ? 'срочно' : ''].filter(Boolean).join(' · '), L, 184, 12, MUTED);

  // строки состава: высота подстраивается, чтобы все поместилось на страницу
  const rows = c.lines.map((l) => ({ name: l.name, sum: l.text, desc: l.id === 'diag' ? 'Разбор текущей ситуации и план. Стоимость засчитывается в проект' : byId[l.id]?.desc || '' }));
  if (c.own) rows.push({ name: 'Своя задача', sum: 'после разбора', desc: c.own.slice(0, 110) });
  const mods: [string, string][] = [];
  if (c.sizedOn) mods.push([`Компания ${SIZES[s.size].s}`, `× ${String(SIZES[s.size].k).replace('.', ',')}`]);
  if (c.disc) mods.push([`Скидка за комплекс, ${servicesWord(c.count)}`, `−${c.disc * 100}%`]);
  if (s.urgent) mods.push(['Срочно, сроки вдвое короче', '× 2']);
  const space = 600 - 228 - mods.length * 38; const rowH = Math.max(24, Math.min(56, space / Math.max(rows.length, 1))); const small = rowH < 44;
  let top = 228;
  for (const r of rows) {
    text(r.name, L, top + (small ? 6 : 10), small ? 12 : 14, INK, { max: 470 });
    text(r.sum, Rr, top + (small ? 6 : 10), small ? 12 : 14, INK, { right: true, bold: true });
    if (!small && r.desc) text(r.desc, L, top + 31, 10, MUTED);
    top += rowH; hr(top);
  }
  for (const m of mods) { text(m[0], L, top + 12, 13, MUTED); text(m[1], Rr, top + 12, 13, MUTED, { right: true }); top += 38; hr(top); }

  top += 28; rect(L, top, Rr - L, 102, SOFT, 16);
  text(c.large ? 'Больше 1,5 млн ₽' : 'Итого разово', L + 24, top + 22, 12, MUTED);
  text(c.large ? 'Крупный проект' : c.onlyTbd ? 'После разбора' : fmtRange(c.total), L + 24, top + 44, 32, INK);
  if (c.instOk) { text('или в рассрочку', Rr - 24, top + 22, 12, MUTED, { right: true }); text(`от ${c.monthly} тыс. ₽ × ${c.term} мес.`, Rr - 24, top + 44, 18, DEEP, { right: true }); text('без банка и процентов', Rr - 24, top + 72, 10, MUTED, { right: true }); }
  else text(`Срок ${c.large ? 'по этапам' : c.weeks}`, Rr - 24, top + 46, 14, DEEP, { right: true });
  top += 130;
  if (!c.large && !c.onlyTbd) {
    text('Тот же набор на рынке', L, top, 12, MUTED); top += 26;
    const cw = (Rr - L - 20) / 3; const cols: [string, string, boolean][] = [['Мой расчет', fmtRange(c.total), true], ['Фрилансеры с биржи', fmtRange(c.birzha) + (c.count > 1 ? `, ${c.count} исп.` : ''), false], ['Агентство', fmtRange(c.studio), false]];
    cols.forEach((col, i) => { const x = L + i * (cw + 10); rect(x, top, cw, 66, col[2] ? DEEP : SOFT, 12); text(col[0], x + 14, top + 14, 10, col[2] ? WHITE : MUTED); text(col[1], x + 14, top + 33, 13, col[2] ? WHITE : INK, { bold: true }); });
    top += 76; text('Оценка по открытым прайсам студий и бирж, октябрь 2026', L, top, 9, MUTED); top += 34;
  }
  const notes = ['· Сумма предварительная. Точную фиксирую в договоре после брифа на 30–45 минут, дальше она не меняется.', '· Оплата по этапам или в рассрочку до 6 месяцев: первый платеж до старта, права на дизайн и код переходят после последнего платежа.', `· Отдельно оплачиваются ${c.ext.length ? 'сторонние сервисы: ' + c.ext.map((e) => e.name).join(', ') + (c.ai ? ', AI-запросы' : '') : 'сторонние сервисы, хостинг и домен'}. Суммы назову в смете.`, `· Срок ${c.large ? 'по этапам, назову после разбора' : c.weeks}. После запуска: ${c.after.s}.`];
  for (const n of notes) top = text(n, L, top, 11.5, INK, { max: Rr - L, lh: 17 }) + 5;

  const fy = H - 56 - 104; rect(L, fy, Rr - L, 104, hex('#16201b'), 16);
  text('Обсудить расчет', L + 24, fy + 24, 16, WHITE, { bold: true });
  text('Напишите в Telegram @imsouthwood, отвечу в течение часа. Расчет на сайте открывается по ссылке:', L + 24, fy + 52, 10.5, hex('#c5d9c8'), { max: Rr - L - 48, lh: 15 });
  const linkTop = fy + 72; text('Открыть этот расчет на southwood.pw', L + 24, linkTop, 11.5, WHITE, { bold: true });
  const made = H - 34; text('Расчет сформирован на southwood.pw', L, made, 10.5, DEEP, { bold: true });
  text('Соберите свой за 2 минуты: сайт, CRM, боты и автоматизация под ключ', L + 208, made, 10.5, MUTED);
  const linkTo = (x1: number, t1: number, x2: number, t2: number, uri: string) => doc.context.register(doc.context.obj({ Type: 'Annot', Subtype: 'Link', Rect: [x1 * K, 841.89 - t2 * sy, x2 * K, 841.89 - t1 * sy], Border: [0, 0, 0], A: { Type: 'Action', S: 'URI', URI: PDFString.of(uri) } }));
  const SITE = 'https://southwood.pw/?utm_source=pdf&utm_medium=raschet';
  page.node.set(PDFName.of('Annots'), doc.context.obj([linkTo(L + 24, linkTop - 2, L + 320, linkTop + 18, url), linkTo(L, 50, L + 420, 102, SITE), linkTo(L, made - 4, Rr, made + 16, SITE)]));

  return doc.save();
}
export async function makePdf(s: State, c: Calc, url: string) {
  const out = await buildPdf(s, c, url); const blob = new Blob([out as BlobPart], { type: 'application/pdf' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `raschet-southwood-${new Date().toISOString().slice(0, 10)}.pdf`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
function wrap(t: string, font: PDFFont, size: number, max: number): string[] {
  const words = t.split(' '); const out: string[] = []; let cur = '';
  for (const w of words) { const next = cur ? cur + ' ' + w : w; if (font.widthOfTextAtSize(next, size) > max && cur) { out.push(cur); cur = w; } else cur = next; }
  if (cur) out.push(cur); return out;
}
function roundRect(page: PDFPage, x: number, y: number, w: number, h: number, r: number, color: ReturnType<typeof rgb>) {
  const k = 0.5523 * r; const path = `M ${r} 0 H ${w - r} C ${w - r + k} 0 ${w} ${r - k} ${w} ${r} V ${h - r} C ${w} ${h - r + k} ${w - r + k} ${h} ${w - r} ${h} H ${r} C ${r - k} ${h} 0 ${h - r + k} 0 ${h - r} V ${r} C 0 ${r - k} ${r - k} 0 ${r} 0 Z`;
  page.drawSvgPath(path, { x, y: y + h, color });
}
