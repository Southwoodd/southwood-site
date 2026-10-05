/** @jsxImportSource preact */
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { ComponentChildren } from 'preact';
import icons from '../icons/ui.json';
import QuizForm, { type QuizPayload } from './QuizForm';
import { form as leadForm } from '../i18n/ru';
import { AFTER, CHANNELS, DIAG, GROUPS, ITEMS, LINK_METHODS, PLATFORMS, PRESETS, REDESIGN, SIZES, TIERS, TILE_DEFAULT, byId, composition, compute, decode, encode, fmtRange, groupSummary, initial, itemPrice, servicesWord, type Calc, type GroupId, type State } from './model';
const WORK_HREF: Record<string, string> = { 'Роман Копосов': '/kejsy/roman-koposov/', 'Alfa Elite': '/kejsy/alfa-elite/', Caro: '/kejsy/caro/', 'Mono Coffee': '/kejsy/mono-coffee/', MeetFlow: '/kejsy/meetflow/' };

const KEY = 'sw-calc-v1';
const Ic = ({ n, c }: { n: keyof typeof icons; c?: string }) => <svg class={'ui-ic ' + (c || '')} viewBox={icons[n].vb} fill="none" aria-hidden="true" dangerouslySetInnerHTML={{ __html: icons[n].body }} />;
const Arrow = () => <svg class="arrow" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M5 13 13 5M6.5 5H13v6.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>;
const nb = (s: string) => s.replace(/(^|[\s(«])(а|в|и|к|о|с|у|я|бы|во|да|до|же|за|из|ко|ли|на|не|ни|но|об|от|по|со|то|без|для|или|над|под|при|про|что|как) (?=\S)/gi, '$1$2 ');
const price = (id: string, s: State) => { const it = byId[id]; const p = itemPrice(s, id); return it.tbd ? 'после разбора' : it.pct ? '+30% к сайту' : it.from ? `от ${p[0]} тыс. ₽` : fmtRange(p); };
const short = (id: string, s: State) => { const it = byId[id]; const p = itemPrice(s, id); return it.tbd ? 'после разбора' : it.pct ? '+30%' : it.from ? `от ${p[0]}` : p[0] === p[1] ? `${p[0]}` : `${p[0]}–${p[1]}`; };

function Seg({ opts, value, onChange, label, cls }: { opts: string[]; value: number; onChange: (i: number) => void; label?: string; cls?: string }) {
  return (
    <div class={'pr-param ' + (cls || '')}>
      {label && <span class="pr-label">{label}</span>}
      <div class="pr-seg" role="radiogroup" aria-label={label}>
        {opts.map((o, i) => <button type="button" role="radio" aria-checked={i === value} class={i === value ? 'on' : ''} onClick={() => onChange(i)}>{o}</button>)}
      </div>
    </div>
  );
}
function Opt({ on, multi, title, desc, sum, onClick, tag }: { on: boolean; multi?: boolean; title: string; desc?: string; sum: string; onClick: () => void; tag?: string }) {
  return (
    <button type="button" class={'pr-opt' + (on ? ' on' : '')} role={multi ? 'checkbox' : 'radio'} aria-checked={on} onClick={onClick}>
      <span class="pr-opt__top"><b>{title}</b><i class={multi ? 'pr-check' : 'pr-radio'} /></span>
      {desc && <span class="pr-opt__desc">{nb(desc)}</span>}
      <span class="pr-opt__sum">{sum}</span>
      {tag && <em>{tag}</em>}
    </button>
  );
}
function Chip({ on, label, sum, onClick }: { on: boolean; label: string; sum: string; onClick: () => void }) {
  return <button type="button" class={'pr-chip' + (on ? ' on' : '')} role="checkbox" aria-checked={on} onClick={onClick}><i class="pr-check" />{label}<small>{sum}</small></button>;
}

export default function Pricing() {
  const [s, setS] = useState<State>(initial);
  const [ready, setReady] = useState(false);
  const [banner, setBanner] = useState<{ date: string; diff: string } | null>(null);
  const [toast, setToast] = useState('');
  const [copied, setCopied] = useState(false);
  const [pdf, setPdf] = useState<'idle' | 'busy' | 'fail'>('idle');
  const [sheet, setSheet] = useState(false);
  const [sent, setSent] = useState(false); // заявка с этой сборкой уже ушла
  const [sentVia, setSentVia] = useState('telegram');
  const [mob, setMob] = useState(false);
  const [svc, setSvc] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const root = useRef<HTMLDivElement>(null);
  const c = useMemo(() => compute(s), [s]);
  const up = (patch: Partial<State> | ((p: State) => Partial<State>)) => setS((p) => ({ ...p, preset: '', ...(typeof patch === 'function' ? patch(p) : patch) }));

  // загрузка: ссылка на расчет важнее сохраненного выбора
  useEffect(() => {
    const m = location.hash.match(/calc=([\w-]+)/);
    const fromLink = m ? decode(m[1]) : null;
    if (fromLink) {
      const now = compute(fromLink.s).total; const was = fromLink.tot;
      const date = new Date(fromLink.t).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
      setBanner({ date, diff: was && (was[0] !== now[0] || was[1] !== now[1]) ? `С тех пор цены изменились: было ${fmtRange(was)}, сейчас ${fmtRange(now)}` : 'Услуги отмечены как в расчете, цены пересчитаны на сегодня' });
      setS({ ...fromLink.s, done: fromLink.s.mode === 'quiz' ? true : fromLink.s.done });
      setTimeout(() => document.getElementById('pricing')?.scrollIntoView(), 50);
    } else {
      try { const raw = localStorage.getItem(KEY); if (raw) setS({ ...initial(), ...JSON.parse(raw) }); } catch { /* хранилище недоступно */ }
    }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* хранилище недоступно */ } }, [s, ready]);
  // на телефоне и планшете калькулятора нет
  useEffect(() => {
    const mq = matchMedia('(max-width: 1023px)');
    const f = () => { setMob(mq.matches); if (mq.matches) setS((p) => (p.mode === 'calc' ? { ...p, mode: 'quiz' } : p)); };
    f(); mq.addEventListener('change', f); return () => mq.removeEventListener('change', f);
  }, []);
  // кнопки в других блоках страницы
  useEffect(() => {
    const h = (e: Event) => {
      const d = (e as CustomEvent).detail as { pack?: string; go?: string }; (window as any).__pricingGo = null;
      if (d.pack && PRESETS[d.pack]) setS({ ...initial(), sel: [...PRESETS[d.pack].sel], preset: d.pack, done: true, mode: 'quiz', tiles: tilesOf(PRESETS[d.pack].sel), seen: tilesOf(PRESETS[d.pack].sel) });
      if (d.go === 'calc') setS((p) => ({ ...p, mode: matchMedia('(max-width: 1023px)').matches ? 'quiz' : 'calc', done: false, step: 0 }));
      if (d.go === 'inst') setS((p) => ({ ...p, pay: 'inst' }));
      if (d.go === 'team' || d.go === 'support') setS((p) => ({ ...p, mode: 'quiz', done: false, after: d.go === 'team' ? 'team' : 'full', step: 1 + p.tiles.length }));
    };
    const w = window as any; if (w.__pricingGo) { h(new CustomEvent('pricing:go', { detail: w.__pricingGo })); }
    window.addEventListener('pricing:go', h); return () => window.removeEventListener('pricing:go', h);
  }, []);

  const tilesOf = (sel: string[]) => GROUPS.map((g) => g.id).filter((g) => sel.some((id) => byId[id].group === g)) as GroupId[];
  const has = (id: string) => s.sel.includes(id);
  const toggle = (id: string) => up((p) => {
    const it = byId[id]; let sel = p.sel.filter((x) => x !== id);
    if (!p.sel.includes(id)) { if (it.excl) sel = sel.filter((x) => byId[x].excl !== it.excl); sel.push(id); }
    if (id !== 'lang' && !sel.some((x) => byId[x].excl === 'siteType')) sel = sel.filter((x) => x !== 'lang');
    return { sel, tiles: p.mode === 'quiz' ? p.tiles : tilesOf(sel) };
  });
  const pick = (id: string) => { if (!has(id)) toggle(id); };
  const setTier = (id: string, v: number) => up((p) => ({ tier: { ...p.tier, [id]: v } }));
  const toggleCh = (i: number) => up((p) => { const ch = p.ch.includes(i) ? p.ch.filter((x) => x !== i) : [...p.ch, i].sort(); return { ch: ch.length ? ch : p.ch }; });
  const toggleTile = (g: GroupId) => up((p) => {
    if (p.tiles.includes(g)) return { tiles: p.tiles.filter((x) => x !== g), seen: p.seen.filter((x) => x !== g), sel: p.sel.filter((id) => byId[id].group !== g) };
    const order = GROUPS.map((x) => x.id) as GroupId[];
    return { tiles: order.filter((x) => x === g || p.tiles.includes(x)), sel: p.sel.some((id) => byId[id].group === g) ? p.sel : [...p.sel, TILE_DEFAULT[g]] };
  });
  const steps: (GroupId | 'what' | 'terms')[] = ['what', ...s.tiles, 'terms'];
  const cur = steps[Math.min(s.step, steps.length - 1)];
  const scrollTop = () => { const el = root.current; if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  const go = (d: number) => { setS((p) => { const st = ['what', ...p.tiles, 'terms']; const here = st[p.step] as GroupId; const seen = d > 0 && here !== ('what' as any) && here !== ('terms' as any) && !p.seen.includes(here) ? [...p.seen, here] : p.seen; const n = p.step + d; return n >= st.length ? { ...p, seen, done: true } : { ...p, seen, step: Math.max(0, n) }; }); scrollTop(); };
  const edit = (g: GroupId | 'terms') => { setS((p) => ({ ...p, done: false, step: g === 'terms' ? 1 + p.tiles.length : 1 + p.tiles.indexOf(g) })); scrollTop(); };
  const reset = () => { setS({ ...initial(), mode: s.mode }); setBanner(null); history.replaceState(null, '', location.pathname + location.search + '#pricing'); };
  useEffect(() => { const f = () => setSent(true); window.addEventListener('lead:sent', f); return () => window.removeEventListener('lead:sent', f); }, []);
  const sentKey = s.sel.join() + s.after + s.size + s.urgent + s.platform + s.diag + s.pay;
  useEffect(() => { setSent(false); }, [sentKey]); // состав изменился, заявку можно отправить снова
  const link = () => `${location.origin}${location.pathname}#calc=${encode(s, c.total)}`;
  const copy = async () => { try { await navigator.clipboard.writeText(link()); setCopied(true); (window as any).swGoal?.('calc_link'); setToast('Ссылка на расчет скопирована. Отправьте ее руководителю'); setTimeout(() => setCopied(false), 2000); setTimeout(() => setToast(''), 3500); } catch { setToast('Не получилось скопировать. Выделите адрес в строке браузера'); setTimeout(() => setToast(''), 3500); } };
  const savePdf = async () => { setPdf('busy'); try { const m = await import('./pdf'); await m.makePdf(s, c, link()); setPdf('idle'); (window as any).swGoal?.('calc_pdf'); } catch (e) { console.error(e); setPdf('fail'); setTimeout(() => setPdf('idle'), 4000); } };
  const payload = (): QuizPayload => {
    const needs = [...new Set(s.sel.map((id) => byId[id].group as string))]; if (s.after !== 'none') needs.push('support'); if (!needs.length) needs.push('unknown');
    const url = link(); const snap = s, calc = c;
    return { needs, labels: needs.map((n) => leadForm.chips.find((x) => x.v === n)?.l || n), context: s.mode === 'quiz' ? 'quiz' : 'calc', calc: { text: composition(s, c), link: url, title: c.large ? 'Крупный проект' : c.onlyTbd ? 'После разбора' : fmtRange(c.total) }, pdf: async () => (await import('./pdf')).buildPdf(snap, calc, url) };
  };
  // Калькулятор: заявка через окно с формой. В подборе контакты спрашивает последний шаг.
  const discuss = () => {
    if (s.mode === 'quiz') { setS((p) => ({ ...p, done: true })); setSheet(false); scrollTop(); return; }
    const p = payload(); (window as any).swGoal?.('calc_discuss');
    window.dispatchEvent(new CustomEvent('lead:open', { detail: { kind: p.context, chips: p.needs, text: p.calc.text, link: p.calc.link, title: p.calc.title, pdf: p.pdf } }));
    setSheet(false);
  };
  const empty = c.empty && s.after === 'none';

  // ---------- шаги подбора ----------
  const stepNo = Math.min(s.step, steps.length - 1) + 1;
  const stepName = cur === 'what' ? 'Что нужно' : cur === 'terms' ? 'Условия' : GROUPS.find((g) => g.id === cur)!.step;
  const nextKey = steps[s.step + 1];
  const nextLabel = !nextKey ? 'Дальше: контакты' : `Дальше: ${nextKey === 'terms' ? 'условия' : GROUPS.find((g) => g.id === nextKey)!.next}`;
  const platform = PLATFORMS.find((p) => p.v === s.platform)!;
  const head = (q: string, sub?: string) => <div class="pr-q"><h3>{q}</h3>{sub && <p>{nb(sub)}</p>}</div>;
  const groupOpts = (ids: string[], multi: boolean) => <div class={'pr-opts pr-opts--' + Math.min(ids.length, 3)}>{ids.map((id) => <Opt on={has(id)} multi={multi} title={byId[id].short || byId[id].name} desc={byId[id].desc} sum={price(id, s)} onClick={() => (multi ? toggle(id) : pick(id))} />)}</div>;
  const chips = (label: string, ids: string[]) => <div class="pr-param"><span class="pr-label">{label}</span><div class="pr-chips">{ids.map((id) => <Chip on={has(id)} label={byId[id].short || byId[id].name} sum={short(id, s)} onClick={() => toggle(id)} />)}</div></div>;
  const body: Record<string, () => ComponentChildren> = {
    what: () => (<>
      {head('Что нужно собрать?', 'Можно выбрать несколько. Число шагов зависит от выбора: по одному экрану на каждую плитку.')}
      <div class="pr-tiles">
        {GROUPS.map((g) => (
          <button type="button" class={'pr-tile' + (s.tiles.includes(g.id) ? ' on' : '')} role="checkbox" aria-checked={s.tiles.includes(g.id)} onClick={() => toggleTile(g.id)}>
            <span class="pr-tile__top"><span class="pr-tile__ico"><Ic n={g.icon as any} /></span><i class="pr-check" /></span>
            <b>{g.tile}</b><small>от {g.from} тыс. ₽</small>
          </button>
        ))}
      </div>
      <button type="button" class={'pr-diag' + (s.diag ? ' on' : '')} role="checkbox" aria-checked={s.diag} onClick={() => up({ diag: !s.diag })}><i class="pr-check" />Не знаю, с чего начать. Диагностика за 30–50 тыс. ₽, засчитывается в проект</button>
    </>),
    site: () => (<>
      {head('Какой сайт нужен?', 'Выберите один тип. Платформу и дополнения можно поменять в любой момент.')}
      <div class="pr-opts pr-opts--3">
        <Opt on={has('landing')} title="Лендинг" desc="Одна страница до 10 экранов под рекламу или услугу" sum={price('landing', s)} onClick={() => pick('landing')} />
        <Opt on={has('corp')} title="Корпоративный сайт" desc={byId.corp.desc} sum={price('corp', s)} onClick={() => pick('corp')} />
        <Opt on={has('shop')} title="Интернет-магазин" desc={byId.shop.desc} sum={price('shop', s)} onClick={() => pick('shop')} />
      </div>
      <Seg label="На чем делаем" opts={PLATFORMS.map((p) => p.l)} value={PLATFORMS.indexOf(platform)} onChange={(i) => up({ platform: PLATFORMS[i].v })} cls="pr-param--wide" />
      <Seg label="Что с текущим сайтом" opts={['Нового нет', 'Редизайн']} value={s.redesign ? 1 : 0} onChange={(i) => up({ redesign: i === 1 })} />
      <p class="pr-hint">{nb(platform.d)} {s.redesign ? nb(REDESIGN.re) : ''}</p>
      {chips('Что добавить к сайту, можно несколько', ['texts', 'seo', 'booking', 'pay', 'quiz', 'lk', 'lang', 'legal'])}
    </>),
    app: () => { const both = has('tgapp') && has('phoneapp'); const set = (ids: string[]) => up((p) => ({ sel: [...p.sel.filter((x) => byId[x].group !== 'app'), ...ids] })); const pb = [itemPrice(s, 'tgapp'), itemPrice(s, 'phoneapp')]; return (<>
      {head('Какое приложение нужно?', 'Оба варианта работают с вашей CRM и оплатой.')}
      <div class="pr-opts pr-opts--3">
        <Opt on={has('tgapp') && !both} title="Приложение в Telegram" desc="Открывается внутри мессенджера, без установки. Каталог, запись, заказ, оплата" sum={price('tgapp', s)} onClick={() => set(['tgapp'])} />
        <Opt on={has('phoneapp') && !both} title="Приложение для телефона" desc="Устанавливается на экран телефона, работает на iPhone и Android" sum={price('phoneapp', s)} onClick={() => set(['phoneapp'])} />
        <Opt on={both} title="Оба сразу" desc="Одна база и один личный кабинет на два приложения" sum={fmtRange([pb[0][0] + pb[1][0], pb[0][1] + pb[1][1]])} onClick={() => set(['tgapp', 'phoneapp'])} />
      </div>
      {chips('Что добавить, можно несколько', ['lk', 'pay', 'booking'])}
    </>); },
    crm: () => (<>
      {head('Какая CRM нужна?', 'Если CRM уже есть, выберите подходящий вариант и напишите об этом в форме, начну с того, что настроено.')}
      {groupOpts(['crmBasic', 'crmAuto'], false)}
      <div class="pr-row">
        <Seg label="Система" opts={['Битрикс24', 'amoCRM', 'Пока не выбрали']} value={s.crmSys} onChange={(i) => up({ crmSys: i })} />
        {has('crmAuto') && <Seg label="Воронок продаж" opts={['1–2', '3–5', 'Больше 5']} value={s.tier.crmAuto || 0} onChange={(i) => setTier('crmAuto', i)} />}
      </div>
      {chips('Что подключить к CRM, можно несколько', ['crmLink', 'goals', 'tel', 'msg', 'email'])}
    </>),
    bots: () => (<>
      {head('Какой бот нужен?', 'Бот отвечает клиентам, собирает контакт и передает заявку в CRM.')}
      {groupOpts(['botScen', 'botAi'], false)}
      <div class="pr-param"><span class="pr-label">Где работает. Первый канал входит в цену, каждый следующий +30%</span>
        <div class="pr-chips">{CHANNELS.map((ch, i) => <Chip on={s.ch.includes(i)} label={ch} sum={s.ch.includes(i) && s.ch[0] === i ? 'входит' : '+30%'} onClick={() => toggleCh(i)} />)}</div></div>
    </>),
    docs: () => (<>{head('Какие документы нужны?', 'Можно выбрать несколько.')}{groupOpts(['kp', 'pres', 'logo'], true)}</>),
    team: () => (<>{head('Что нужно команде?', 'Можно выбрать несколько.')}{groupOpts(['regs', 'aihelp', 'train'], true)}</>),
    data: () => (<>
      {head('Какие цифры хотите видеть?', 'Можно выбрать оба варианта.')}
      {groupOpts(['dash', 'fin'], true)}
      {has('dash') && <Seg label="Откуда берем данные для дашборда. Каждый источник +20 тыс. ₽" opts={['1 источник', '2', '3', '4 и больше']} value={s.src - 1} onChange={(i) => up({ src: i + 1 })} />}
    </>),
    link: () => (<>
      {head('Какие программы нужно связать?', 'Напишите своими словами. Например: IDENT, 1С Склад и 1С Бухгалтерия, чтобы остатки и оплаты сходились сами.')}
      <label class="pr-param"><span class="pr-label">Какие программы и что должно происходить</span>
        <textarea class="pr-area" rows={2} maxLength={600} placeholder="Например: заказы из iiko должны попадать в 1С и в таблицу закупок" value={s.linkText} onInput={(e) => up({ linkText: (e.target as HTMLTextAreaElement).value })} /></label>
      <div class="pr-row">
        <Seg label="Сколько программ" opts={['2', '3', '4', '5 и больше']} value={s.linkN - 2} onChange={(i) => up({ linkN: i + 2 })} />
        <Seg label="Куда идут данные" opts={['В одну сторону', 'В обе стороны × 1,3']} value={s.linkBoth ? 1 : 0} onChange={(i) => up({ linkBoth: i === 1 })} />
      </div>
      <Seg label="Как связываем" opts={LINK_METHODS.map((m) => m.l)} value={s.linkM} onChange={(i) => up({ linkM: i })} cls="pr-param--wide" />
      {chips('Еще по автоматизации', ['routine', 'oneprog'])}
      <p class="pr-hint">{nb('От 80 тыс. ₽ за первую связку, +40 тыс. ₽ за каждую следующую программу. Точную цену назову после разбора, в течение дня.')}</p>
    </>),
    fix: () => (<>
      {head('Что доработать на сайте?', 'Можно выбрать несколько.')}
      {groupOpts(['fixpack', 'block', 'audit'], true)}
      {groupOpts(['migrate', 'concept'], true)}
      {has('block') && <Seg label="Сколько новых блоков" opts={['1', '2', '3', '4 и больше']} value={Math.min(s.blockN, 4) - 1} onChange={(i) => up({ blockN: i + 1 })} />}
    </>),
    terms: () => (<>
      {head('Последний шаг: сроки и что после запуска')}
      {c.sizedOn && <Seg label="Размер компании. Влияет на CRM, регламенты и отчеты" opts={SIZES.map((x) => x.l)} value={s.size} onChange={(i) => up({ size: i })} cls="pr-param--full" />}
      <div class="pr-param"><span class="pr-label">Сроки</span><div class="pr-opts pr-opts--2">
        <Opt on={!s.urgent} title="Обычно" desc="Работаю в спокойном темпе, этапы по графику" sum={s.urgent ? 'без наценки' : c.weeks} onClick={() => up({ urgent: false })} />
        <Opt on={s.urgent} title="Срочно" desc="Нужно еще вчера: сроки вдвое короче, работаю в приоритете" sum="× 2 к цене" onClick={() => up({ urgent: true })} />
      </div></div>
      <div class="pr-param"><span class="pr-label">После запуска</span><div class="pr-opts pr-opts--4">
        {AFTER.map((a) => <Opt on={s.after === a.v} title={a.l} desc={a.d} sum={a.p} onClick={() => up({ after: a.v })} />)}
      </div></div>
    </>),
  };

  // ---------- каталог ----------
  const params = (id: string) => {
    const it = byId[id]; const out: ComponentChildren[] = [];
    if (it.excl === 'siteType') { out.push(<Seg opts={PLATFORMS.map((p) => p.l)} value={PLATFORMS.indexOf(platform)} onChange={(i) => up({ platform: PLATFORMS[i].v })} />, <Seg opts={['Новый', 'Редизайн']} value={s.redesign ? 1 : 0} onChange={(i) => up({ redesign: i === 1 })} />); }
    if (TIERS[id]) out.push(<Seg label={TIERS[id].label} opts={TIERS[id].opts} value={s.tier[id] || 0} onChange={(i) => setTier(id, i)} />);
    if (it.excl === 'crm') out.push(<Seg label="Система" opts={['Битрикс24', 'amoCRM']} value={Math.min(s.crmSys, 1)} onChange={(i) => up({ crmSys: i })} />);
    if (it.excl === 'bot') out.push(<div class="pr-param"><span class="pr-label">Где работает</span><div class="pr-seg pr-seg--multi">{CHANNELS.map((ch, i) => <button type="button" class={s.ch.includes(i) ? 'on' : ''} aria-pressed={s.ch.includes(i)} onClick={() => toggleCh(i)}>{ch}</button>)}</div></div>);
    if (id === 'fixpack') out.push(<Seg label="Пакетов" opts={['1', '2', '3']} value={s.fixN - 1} onChange={(i) => up({ fixN: i + 1 })} />);
    if (id === 'block') out.push(<Seg label="Блоков" opts={['1', '2', '3', '5']} value={[1, 2, 3, 5].indexOf(s.blockN) < 0 ? 3 : [1, 2, 3, 5].indexOf(s.blockN)} onChange={(i) => up({ blockN: [1, 2, 3, 5][i] })} />);
    if (id === 'dash') out.push(<Seg label="Источников данных" opts={['1', '2', '3', '4']} value={s.src - 1} onChange={(i) => up({ src: i + 1 })} />);
    if (id === 'link') out.push(<Seg label="Сколько программ" opts={['2', '3', '4', '5 и больше']} value={s.linkN - 2} onChange={(i) => up({ linkN: i + 2 })} />, <Seg label="Куда идут данные" opts={['В одну сторону', 'В обе стороны']} value={s.linkBoth ? 1 : 0} onChange={(i) => up({ linkBoth: i === 1 })} />, <Seg label="Как связать" opts={LINK_METHODS.map((m) => m.l)} value={s.linkM} onChange={(i) => up({ linkM: i })} />);
    const hint = it.excl === 'siteType' ? `${platform.d} ${s.redesign ? REDESIGN.re : REDESIGN.new}` : it.excl === 'bot' ? `${s.ch.length > 1 ? `Выбрано каналов: ${s.ch.length}, +${(s.ch.length - 1) * 30}% к цене. ` : ''}Каждый дополнительный канал +30% к цене.${id === 'botAi' ? ' Оплата AI-запросов отдельно.' : ''}` : id === 'fixpack' ? 'Каждый пакет 10 часов, 25 тыс. ₽. Неиспользованные часы переносятся на следующий месяц.' : id === 'block' ? 'Каждый следующий блок дешевле на 20%.' : id === 'dash' ? 'Каждый дополнительный источник +20 тыс. ₽.' : id === 'concept' ? 'Мобильная версия входит.' : it.excl === 'crm' ? 'Лицензия CRM оплачивается отдельно.' : id === 'aihelp' ? 'Оплата AI-запросов отдельно.' : id === 'link' ? 'Как считается: 80 тыс. за связку двух программ, +40 тыс. за каждую следующую, обмен в обе стороны × 1,3, свой софт-посредник × 2, готовый модуль × 0,5. Точная цена после разбора ваших программ.' : '';
    if (!out.length && !hint && !it.work) return null;
    return (<div class="pr-item__more">
      {out.length > 0 && <div class="pr-item__params">{out}</div>}
      {id === 'link' && <textarea class="pr-area" rows={2} maxLength={600} placeholder="Какие программы и что должно происходить" value={s.linkText} onInput={(e) => up({ linkText: (e.target as HTMLTextAreaElement).value })} />}
      {it.work && <a class="pr-work" href={WORK_HREF[it.work] || '/kejsy/'}>Похожая работа · {it.work}<Arrow /></a>}
      {hint && <p class="pr-hint">{nb(hint)}</p>}
    </div>);
  };
  const itemRow = (id: string) => { const it = byId[id]; const on = has(id); return (
    <div class={'pr-item' + (on ? ' on' : '')}>
      <button type="button" class="pr-item__head" role={it.excl ? 'radio' : 'checkbox'} aria-checked={on} onClick={() => toggle(id)}>
        <i class={it.excl ? 'pr-radio' : 'pr-check'} /><span><b>{it.name}</b><small>{nb(it.desc)}</small></span><em>{price(id, s)}</em>
      </button>
      {on && params(id)}
    </div>); };
  const sub = (label: string) => <p class="pr-sub">{label}</p>;
  const catalog: Record<GroupId, () => ComponentChildren> = {
    site: () => <>{sub('Тип сайта, один на выбор')}{['landing', 'corp', 'shop'].map(itemRow)}{sub('Дополнения к сайту, можно несколько')}{['lang', 'lk', 'booking', 'pay', 'quiz', 'seo', 'texts', 'legal'].map(itemRow)}</>,
    app: () => <>{['tgapp', 'phoneapp'].map(itemRow)}</>,
    crm: () => <>{sub('CRM, один вариант')}{['crmBasic', 'crmAuto'].map(itemRow)}{sub('Можно несколько')}{['crmLink', 'goals', 'tel', 'msg', 'email'].map(itemRow)}</>,
    bots: () => <>{sub('Бот, один вариант')}{['botScen', 'botAi'].map(itemRow)}</>,
    docs: () => <>{['kp', 'pres', 'logo'].map(itemRow)}</>,
    team: () => <>{['regs', 'aihelp', 'train'].map(itemRow)}</>,
    data: () => <>{['dash', 'fin'].map(itemRow)}</>,
    link: () => <>{['link', 'routine', 'oneprog'].map(itemRow)}</>,
    fix: () => <>{['fixpack', 'block', 'migrate', 'concept', 'audit'].map(itemRow)}</>,
  };
  const calcOrder: GroupId[] = ['site', 'app', 'fix', 'crm', 'bots', 'docs', 'team', 'data', 'link'];
  const applyPreset = (k: string) => setS((p) => ({ ...initial(), mode: p.mode, pay: p.pay, sel: p.preset === k ? [] : [...PRESETS[k].sel], preset: p.preset === k ? '' : k, tiles: p.preset === k ? [] : tilesOf(PRESETS[k].sel), seen: p.preset === k ? [] : tilesOf(PRESETS[k].sel) }));

  // ---------- итог ----------
  const summary = (kind: 'card' | 'sheet' | 'live' = 'card') => {
    const inst = s.pay === 'inst' && c.instOk;
    const showSave = s.mode === 'calc' && !c.large && !empty;
    return (
      <div class={'pr-sum' + (kind === 'sheet' ? ' pr-sum--sheet' : kind === 'live' ? ' pr-sum--live' : '')}>
        <div class="pr-pay" role="radiogroup" aria-label="Способ оплаты">
          <button type="button" role="radio" aria-checked={!inst} class={!inst ? 'on' : ''} onClick={() => setS((p) => ({ ...p, pay: 'once' }))}>Разово</button>
          <button type="button" role="radio" aria-checked={inst} class={inst ? 'on' : ''} disabled={!c.instOk} onClick={() => setS((p) => ({ ...p, pay: 'inst' }))}>В рассрочку</button>
        </div>
        <p class="pr-sum__title">{c.onlyTbd ? 'Ваша задача' : 'Ваша сборка'}{c.count > 0 ? ` · ${servicesWord(c.count)}` : ''}{c.own && c.count > 0 ? ' и своя задача' : ''}{c.lines.some((l) => l.pale) ? ', уточняем' : ''}</p>
        {empty ? <p class="pr-sum__empty">{nb('Отметьте слева услуги или готовый набор, и здесь появится расчет.')}</p>
          : c.empty && !c.own ? <p class="pr-sum__empty">{nb('Сборка не выбрана. Сопровождение того, что у вас уже работает: сайт, CRM, боты.')}</p>
          : c.large ? <p class="pr-sum__empty">{c.lines.slice(0, 5).map((l) => l.name).join(', ')}{c.count > 5 ? ` и еще ${servicesWord(c.count - 5)}` : ''}</p>
          : <ul class="pr-lines" data-lenis-prevent>
              {c.lines.map((l) => <li class={l.pale ? 'pale' : ''}><span>{l.name}</span><b>{l.text}</b></li>)}
              {c.own && <li><span>Своя задача: {c.own.length > 60 ? c.own.slice(0, 60) + '…' : c.own}</span><b>после разбора</b></li>}
              {(c.sizedOn || c.disc > 0 || s.urgent) && <li class="sep" />}
              {c.sizedOn && <li class="mod"><span>Компания {SIZES[s.size].s}</span><b>× {String(SIZES[s.size].k).replace('.', ',')}</b></li>}
              {c.disc > 0 && <li class="mod"><span>За комплекс · {servicesWord(c.count)}</span><b>−{c.disc * 100}%</b></li>}
              {s.urgent && <li class="mod"><span>Срочно, сроки вдвое короче</span><b>× 2</b></li>}
            </ul>}
        {c.large ? (<>
          <p class="pr-sum__label">Больше 1,5 млн ₽</p>
          <p class="pr-total">Крупный проект</p>
          <p class="pr-sum__note">{nb('Такие проекты считаю лично: разобью на этапы, предложу очередность и точную сумму по каждому')}</p>
        </>) : c.onlyTbd ? (<>
          <p class="pr-sum__label">Разово</p><p class="pr-total">После разбора</p>
          <p class="pr-sum__note">{nb('Посмотрю задачу и пришлю оценку и срок в течение дня')}</p>
        </>) : (<>
          <p class="pr-sum__label">{inst ? `В месяц, ${c.term} ${c.term < 5 ? 'платежа' : 'платежей'}` : 'Разово'}</p>
          <p class="pr-total" aria-live="polite">{empty || c.empty ? '0 ₽' : inst ? `от ${c.monthly} тыс. ₽` : fmtRange(c.total)}</p>
          {inst && <div class="pr-terms">{c.terms.map((t) => <button type="button" class={t.n === c.term ? 'on' : ''} disabled={!t.ok} onClick={() => setS((p) => ({ ...p, term: t.n }))}>{t.n} мес.</button>)}</div>}
          {inst && c.terms.some((t) => !t.ok) && <p class="pr-sum__note">{c.terms.filter((t) => !t.ok).map((t) => t.n).join(' и ')} мес. недоступно: платеж был бы меньше 15 тыс. ₽</p>}
          {!inst && c.lines.some((l) => l.pale) && <p class="pr-sum__note">{nb('Бледные строки пока стоят в типовом варианте, уточним на следующих шагах')}</p>}
          {!inst && !c.lines.some((l) => l.pale) && !empty && !c.empty && <p class="pr-sum__note">{c.tbd ? nb('Плюс своя задача: оценю после разбора и добавлю в смету') : nb('Фиксирую в договоре после брифа, доплат по ходу нет')}</p>}
        </>)}
        <dl class="pr-facts">
          {!c.onlyTbd && <div><dt>{inst ? 'Всего' : 'В месяц'}</dt><dd>{inst ? `итого ${fmtRange(c.total)}, ${c.after.s}` : c.after.m}</dd></div>}
          {!empty && !c.empty && !c.onlyTbd && <div><dt>Срок</dt><dd>{c.large ? 'по этапам, назову после разбора' : c.weeks}</dd></div>}
        </dl>
        {!c.large && !c.onlyTbd && !empty && !c.empty && (inst ? <p class="pr-sum__inst">{nb('Первый платеж до старта, остальные после запуска. Без банка и процентов')}</p>
          : c.instOk ? <button type="button" class="pr-sum__inst pr-sum__inst--link" onClick={() => setS((p) => ({ ...p, pay: 'inst' }))}>Или в рассрочку без банка: от {c.monthly} тыс. ₽ в месяц<Arrow /></button>
          : <p class="pr-sum__inst">Рассрочка доступна для сборки от 30 тыс. ₽</p>)}
        {s.mode === 'calc' && !c.large && c.ext.length > 0 && <div class="pr-ext"><p><span>Сторонние сервисы</span><b>≈ {String(Math.round(c.extSum[0] / 100) / 10).replace('.', ',')}–{String(Math.round(c.extSum[1] / 100) / 10).replace('.', ',')} тыс. ₽ в месяц</b></p><small>{c.ext.map((e) => e.name).join(', ')}{c.ai ? ', AI-запросы по тарифу' : ''}. Оплачиваете напрямую сервисам</small></div>}
        {kind !== 'live' && <div class="pr-sum__actions">
          <button type="button" class="btn btn--white pr-sum__cta" disabled={empty || (sent && s.mode === 'calc')} onClick={discuss}>{s.mode === 'quiz' ? 'Перейти к отправке' : sent ? 'Заявка отправлена' : c.large ? 'Отправить на оценку' : c.onlyTbd ? 'Отправить задачу на оценку' : 'Отправить заявку'}{!(sent && s.mode === 'calc') && <Arrow />}</button>
          {showSave && <div class="pr-save">
            <button type="button" class="btn" disabled={pdf === 'busy'} onClick={savePdf}>{pdf === 'busy' ? 'Готовлю PDF…' : pdf === 'fail' ? 'Не получилось, повторить' : 'Скачать расчет в PDF'}</button>
            <button type="button" class="btn" onClick={copy}>{copied ? 'Ссылка скопирована' : 'Скопировать ссылку'}</button>
          </div>}
          <p class="pr-sum__foot">{nb('Минимальный проект 60 тыс. ₽. Расчет можно переслать руководителю. Можно начать с диагностики за 30–50 тыс. ₽, она засчитывается в проект.')}</p>
        </div>}
        {kind === 'live' && <p class="pr-sum__foot">{nb('Минимальный проект 60 тыс. ₽. Можно начать с диагностики за 30–50 тыс. ₽, она засчитывается в проект.')}</p>}
      </div>);
  };
  const rel = Math.max(c.studio[1], c.total[1], 1);
  const hideCompare = c.large || empty || c.empty || c.onlyTbd;

  return (
    <div class={'pr pr--' + s.mode + (s.mode === 'quiz' && s.done ? ' is-done' : '')} ref={root}>
      <div class="pr-modes">
        <div class="pr-modes__intro"><b>Два способа получить расчет</b><p>{nb('Сумма и срок видны сразу, без созвона. Выбор сохраняется при переключении, можно начать в одном и продолжить в другом.')}</p></div>
        <div class="pr-modes__opts" role="radiogroup" aria-label="Режим расчета">
          <button type="button" role="radio" aria-checked={s.mode === 'quiz'} class={'pr-modeopt' + (s.mode === 'quiz' ? ' on' : '')} onClick={() => setS((p) => (p.mode === 'quiz' ? p : { ...p, mode: 'quiz', tiles: tilesOf(p.sel), seen: tilesOf(p.sel), done: false, step: 0 }))}>
            <span class="pr-modeopt__top"><b>Подбор по вопросам</b><i class="pr-radio" /></span>
            <span class="pr-modeopt__text">{nb('Проще и быстрее. По одному вопросу на экран, подскажу типовой вариант. Подойдет, если не уверены в составе.')}</span>
            <span class="pr-modeopt__tags"><em>около 2 минут</em><em>по шагам</em><em>заявка последним шагом</em></span>
          </button>
          <button type="button" role="radio" aria-checked={s.mode === 'calc'} class={'pr-modeopt' + (s.mode === 'calc' ? ' on' : '')} onClick={() => setS((p) => ({ ...p, mode: 'calc' }))}>
            <span class="pr-modeopt__top"><b>Калькулятор</b><i class="pr-radio" /></span>
            <span class="pr-modeopt__text">{nb(`Весь каталог на одном экране: ${ITEMS.length} услуг в любом сочетании и тонкие настройки каждой. Подойдет, если знаете, что нужно.`)}</span>
            <span class="pr-modeopt__tags"><em>готовые наборы</em><em>своя задача</em><em>PDF и ссылка на расчет</em></span>
          </button>
        </div>
      </div>
      {banner && <div class="pr-banner"><div><b>Вы открыли расчет от {banner.date}</b><span>{banner.diff}</span></div><button type="button" class="btn btn--grey" onClick={reset}>Начать заново</button></div>}
      <div class="pr-grid">
        <div class="pr-main">
          {s.mode === 'quiz' && (
            <div class={'pr-card pr-quiz' + (s.done ? ' is-done' : '')}>
              <div class="pr-split">
                <div class="pr-split__main">
                  <div class="pr-progress">
                    <p><span>Шаг {s.done ? steps.length + 1 : stepNo} из {steps.length + 1} · {s.done ? 'Контакты' : stepName}</span><button type="button" class="pr-linkbtn pr-desk" onClick={() => setS((p) => ({ ...p, mode: 'calc' }))}>Показать весь каталог</button></p>
                    <div class="pr-bar">{[...steps, 'contacts'].map((_, i) => <i class={s.done || i < stepNo ? 'on' : ''} />)}</div>
                  </div>
                  {!s.done && (<>
                    <div class="pr-step" key={cur}>{body[cur]()}</div>
                    <div class="pr-nav">
                      {s.step > 0 && <button type="button" class="btn btn--white pr-back" onClick={() => go(-1)}>Назад</button>}
                      <button type="button" class={'btn pr-next ' + (nextKey ? 'btn--ink' : 'btn--deep')} disabled={s.step === 0 && !s.tiles.length && !s.diag} onClick={() => go(1)}><span>{nextLabel.split(':')[0]}{nextLabel.includes(':') && <span class={s.step > 0 ? 'pr-next__to' : ''}>:{nextLabel.split(':')[1]}</span>}</span><Arrow /></button>
                    </div>
                  </>)}
                  {s.done && (
                    <div class="pr-step pr-fin" key="contacts">
                      {sent ? (
                        <div class="pr-fin__ok" role="status">
                          <span><svg viewBox="0 0 24 24" fill="none"><path d="m6 12.5 4 4 8-9" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" /></svg></span>
                          <h3>Заявка отправлена</h3>
                          <p>{nb(`${(leadForm.okVia as Record<string, string>)[sentVia] || ''} Расчет приложен к заявке, отвечу в течение часа в рабочее время.`)}</p>
                        </div>
                      ) : (<>
                        {head('Последний шаг: куда ответить', 'Заявка уйдет мне вместе с расчетом. Свяжусь сам, уточню детали и зафиксирую сумму в договоре.')}
                        <QuizForm build={payload} disabled={empty} onSent={(via) => { setSentVia(via); setSent(true); scrollTop(); }} />
                      </>)}
                      <div class="pr-fin__more">
                        {!c.large && !empty && <button type="button" class="btn btn--white" disabled={pdf === 'busy'} onClick={savePdf}><Ic n="c_fix" />{pdf === 'busy' ? 'Готовлю PDF…' : pdf === 'fail' ? 'Не получилось, повторить' : 'Скачать расчет в PDF'}</button>}
                        {!empty && <button type="button" class="btn btn--white" onClick={copy}>{copied ? 'Ссылка скопирована' : 'Скопировать ссылку'}</button>}
                        <span class="pr-fin__links">
                          {!sent && <button type="button" class="pr-linkbtn" onClick={() => edit('terms')}>Изменить ответы</button>}
                          <button type="button" class="pr-linkbtn pr-desk" onClick={() => setS((p) => ({ ...p, mode: 'calc' }))}>Открыть в калькуляторе</button>
                          <button type="button" class="pr-linkbtn pr-linkbtn--muted" onClick={reset}>Пройти заново</button>
                        </span>
                      </div>
                    </div>)}
                </div>
                <aside class="pr-live">{summary('live')}</aside>
              </div>
            </div>)}
          {s.mode === 'calc' && (
            <div class="pr-card pr-calc">
              <span class="pr-label">Готовые наборы</span>
              <div class="pr-presets">{Object.entries(PRESETS).map(([k, p]) => <button type="button" class={s.preset === k ? 'on' : ''} aria-pressed={s.preset === k} onClick={() => applyPreset(k)}>{p.name}</button>)}<button type="button" class={!s.preset && s.sel.length ? 'on' : ''} disabled>Свой набор</button></div>
              <p class="pr-calc__label"><span>Что собрать</span><small>любые услуги в любом сочетании</small></p>
              <div class={'pr-item pr-item--solo' + (s.diag ? ' on' : '')}><button type="button" class="pr-item__head" role="checkbox" aria-checked={s.diag} onClick={() => up({ diag: !s.diag })}><i class="pr-check" /><span><b>{DIAG.name}</b><small>{DIAG.desc}</small></span><em>{fmtRange(DIAG.base)}</em></button></div>
              {calcOrder.map((gid) => { const g = GROUPS.find((x) => x.id === gid)!; const all = ITEMS.filter((i) => i.group === gid); const n = all.filter((i) => has(i.id)).length; const isOpen = open[gid] ?? (n > 0 || gid === 'site'); return (
                <section class={'pr-group' + (isOpen ? ' open' : '')}>
                  <button type="button" class="pr-group__head" aria-expanded={isOpen} onClick={() => setOpen((o) => ({ ...o, [gid]: !isOpen }))}>
                    <span class="pr-tile__ico"><Ic n={g.icon as any} /></span><span><b>{g.name}</b><small>{g.sub}</small></span><em class={n ? 'on' : ''}>{n} из {all.length} выбрано</em><i class="pr-caret" />
                  </button>
                  {isOpen && <div class="pr-group__body">{catalog[gid]()}</div>}
                </section>); })}
              <section class="pr-group open"><div class="pr-group__head pr-group__head--static"><span><b>Своя задача</b><small>Нет в списке? Опишите своими словами, оценю после разбора</small></span></div>
                <div class="pr-group__body"><textarea class="pr-area" rows={3} maxLength={800} placeholder="Например: у нас Шеф-Эксперт и iiko, техкарты переносим вручную. Нужно, чтобы новая техкарта сама появлялась в iiko" value={s.own} onInput={(e) => up({ own: (e.target as HTMLTextAreaElement).value })} /></div></section>
              <p class="pr-calc__label"><span>Размер компании</span><small>влияет только на CRM, регламенты, AI-помощника и дашборд</small></p>
              <Seg opts={SIZES.map((x) => x.l)} value={s.size} onChange={(i) => up({ size: i })} cls="pr-param--full" />
              <p class="pr-calc__label"><span>Сроки</span><small>срочно: сроки вдвое короче, × 2 к цене</small></p>
              <Seg opts={['Обычно', 'Срочно × 2']} value={s.urgent ? 1 : 0} onChange={(i) => up({ urgent: i === 1 })} />
              <p class="pr-calc__label"><span>После запуска</span></p>
              <div class="pr-opts pr-opts--4">{AFTER.map((a) => <Opt on={s.after === a.v} title={a.l} desc={a.d} sum={a.p} onClick={() => up({ after: a.v })} />)}</div>
            </div>)}
        </div>
        {s.mode === 'calc' && <aside class="pr-aside">{summary()}</aside>}
      </div>

      {!hideCompare && (
        <div class="pr-compare">
          <div class="pr-compare__head"><h3>Сравните с другими вариантами</h3><span>Оценка по открытым прайсам студий и бирж, октябрь 2026</span></div>
          <div class="pr-compare__cols">
            <div class="me"><span>Мой прайс</span><b>{fmtRange(c.total)}</b><i><u style={{ width: Math.max(8, (c.total[1] / rel) * 100) + '%' }} /></i><p>{nb('Один исполнитель, одна смета и одна ответственность за результат. Похожие задачи уже делал, ссылки есть в каталоге.')}</p></div>
            <div><span>Фрилансеры с биржи</span><b>{fmtRange(c.birzha)}</b><i><u style={{ width: Math.max(6, (c.birzha[1] / rel) * 100) + '%' }} /></i><p>{nb(`Дешевле, но это ${c.count > 1 ? c.count + ' разных исполнителей' : 'отдельный исполнитель'}. Искать, сравнивать и связывать их придется вам, отвечать за итог некому.`)}</p></div>
            <div><span>Агентство</span><b>{fmtRange(c.studio)}</b><i><u style={{ width: (c.studio[1] / rel) * 100 + '%' }} /></i><p>{nb(`Примерно в ${Math.max(2, Math.round(c.studio[1] / Math.max(c.total[1], 1)))} раза дороже: менеджеры, согласования, отдельный договор на поддержку после запуска.`)}</p></div>
          </div>
          <details class="pr-services" open={!mob || svc} onToggle={(e) => { if (mob) setSvc((e.currentTarget as HTMLDetailsElement).open); }}>
            <summary><b>Сторонние сервисы оплачиваете напрямую им, без моей наценки</b><b class="m">Сколько стоят сторонние сервисы</b><i class="fold__ic" /></summary>
            <ul>{[['Тильда', '500–1 200 ₽', 'в месяц, оплата за год дешевле'], ['Битрикс24', '2 490–13 990 ₽', 'в месяц за всю компанию'], ['amoCRM', '599–1 699 ₽', 'в месяц за пользователя'], ['Сервер', 'от 500 ₽', 'в месяц, для бота или посредника'], ['AI и сервисы автоматизации', 'по тарифу', 'сумму назову в смете']].map((x) => <li><span>{x[0]}</span><b>{x[1]}</b><small>{x[2]}</small></li>)}</ul>
            <p>Цены сервисов по открытым тарифам и обзорам, октябрь 2026. Могут меняться.</p>
          </details>
        </div>)}

      <div class={'pr-bar-m' + (empty ? ' is-empty' : '')}>
        <div><small>{empty ? 'Отметьте, что нужно' : c.onlyTbd ? 'Своя задача' : `${servicesWord(c.count)} · ${c.large ? 'по этапам' : c.weeks}`}</small><b>{empty ? '0 ₽' : c.large ? 'Крупный проект' : c.onlyTbd ? 'После разбора' : fmtRange(c.total)}</b></div>
        <button type="button" onClick={() => setSheet(true)} disabled={empty}>Состав</button>
      </div>
      {sheet && <div class="pr-sheet" role="dialog" aria-modal="true" aria-label="Состав сборки" onClick={(e) => { if (e.target === e.currentTarget) setSheet(false); }}><div><button type="button" class="pr-sheet__close" aria-label="Закрыть" onClick={() => setSheet(false)} />{summary('sheet')}</div></div>}
      {toast && <div class="pr-toast" role="status">{toast}</div>}
    </div>
  );
}
