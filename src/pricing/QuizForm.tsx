/** @jsxImportSource preact */
// Контакты на последнем шаге подбора. Заявка уходит сразу отсюда, вместе с расчетом в PDF.
import { useState } from 'preact/hooks';
import { form as f } from '../i18n/ru';

export type QuizPayload = { labels: string[]; needs: string[]; context: string; calc: { text: string; link: string; title: string }; pdf: () => Promise<Uint8Array> };
const mask = (raw: string) => {
  let d = raw.replace(/\D/g, ''); if (!d) return '';
  if (d[0] === '8') d = '7' + d.slice(1);
  if (d[0] !== '7') return '+' + d.slice(0, 15);
  d = d.slice(0, 11); const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
  return '+7' + (p[0] ? ' ' + p[0] : '') + (p[1] ? ' ' + p[1] : '') + (p[2] ? '-' + p[2] : '') + (p[3] ? '-' + p[3] : '');
};
const b64 = (u: Uint8Array) => { let bin = ''; for (let i = 0; i < u.length; i += 0x8000) bin += String.fromCharCode(...u.subarray(i, i + 0x8000)); return btoa(bin); };

export default function QuizForm({ build, disabled, onSent }: { build: () => QuizPayload; disabled?: boolean; onSent: (via: string) => void }) {
  const [v, setV] = useState({ name: '', company: '', phone: '', via: f.viaOptions[0].v, deadline: '', task: '', consent: false, website: '' });
  const [tried, setTried] = useState(false); const [busy, setBusy] = useState(false); const [fail, setFail] = useState(false);
  const set = (k: keyof typeof v) => (e: Event) => { const t = e.target as HTMLInputElement; setV((p) => ({ ...p, [k]: k === 'consent' ? t.checked : k === 'phone' ? mask(t.value) : t.value })); };
  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  const digits = v.phone.replace(/\D/g, '');
  const bad = { name: v.name.trim().length < 2, company: v.company.trim().length < 2, phone: digits.length < 11, consent: !v.consent };
  const err = (k: keyof typeof bad) => tried && bad[k];
  const submit = async (e: Event) => {
    e.preventDefault(); setTried(true);
    if (Object.values(bad).includes(true)) { requestAnimationFrame(() => (e.currentTarget as HTMLElement | null)?.querySelector<HTMLElement>('.is-bad input')?.focus()); return; }
    if (v.website) { onSent(v.via); return; }
    setBusy(true); setFail(false);
    const p = build();
    const body: Record<string, unknown> = { kind: 'lead', need: p.needs, needLabels: p.labels, name: v.name, company: v.company, phone: v.phone, via: v.via, deadline: v.deadline, task: v.task, page: location.pathname, context: p.context, calc: p.calc, consent: true };
    const post = (b: unknown) => fetch(f.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
    try {
      let pdf = ''; try { pdf = b64(await p.pdf()); } catch (x) { console.error(x); }
      let r: Response | null = null;
      if (pdf) { try { r = await post({ ...body, pdf }); } catch { r = null; } }
      if (!r || !r.ok) r = await post(body);
      if (!r.ok) throw new Error(String(r.status));
      (window as any).swGoal?.('lead_sent'); (window as any).swGoal?.('quiz_lead');
      onSent(v.via);
    } catch { setFail(true); }
    setBusy(false);
  };
  return (
    <form class="lf pr-form ym-disable-keys" noValidate onSubmit={submit}>
      <div class="lf__main">
        <div class="lf__row">
          <label class={'lf__field' + (err('name') ? ' is-bad' : '')}><span>{f.name} <i>*</i></span><input type="text" name="name" autocomplete="name" placeholder={f.namePh} maxLength={80} value={v.name} onInput={set('name')} />{err('name') && <p class="lf__err">{f.errors.name}</p>}</label>
          <label class={'lf__field' + (err('company') ? ' is-bad' : '')}><span>{f.company} <i>*</i></span><input type="text" name="company" autocomplete="organization" placeholder={f.companyPh} maxLength={120} value={v.company} onInput={set('company')} />{err('company') && <p class="lf__err">{f.errors.company}</p>}</label>
        </div>
        <div class="lf__row">
          <label class={'lf__field' + (err('phone') ? ' is-bad' : '')}><span>{f.phone} <i>*</i></span><input type="tel" name="phone" autocomplete="tel" inputMode="tel" placeholder={f.phonePh} maxLength={24} value={v.phone} onInput={set('phone')} />{err('phone') && <p class="lf__err">{digits.length ? f.errors.phone : f.errors.phoneEmpty}</p>}</label>
          <fieldset class="lf__field lf__via"><legend>{f.via} <i>*</i></legend>
            <div>{f.viaOptions.map((o) => <label><input type="radio" name="quiz-via" value={o.v} checked={v.via === o.v} onChange={set('via')} /><span>{o.l}</span></label>)}</div>
          </fieldset>
        </div>
        <div class="lf__row">
          <label class="lf__field"><span>{f.deadline} <em>{f.taskOpt}</em></span><input type="date" name="deadline" min={today} value={v.deadline} onInput={set('deadline')} /></label>
          <p class="lf__hint">{f.deadlineHint}</p>
        </div>
        <label class="lf__field"><span>Комментарий <em>{f.taskOpt}</em></span><textarea name="task" placeholder={f.taskPh} maxLength={1500} rows={2} value={v.task} onInput={set('task')} /></label>
        <input class="lf__hp" type="text" name="website" tabIndex={-1} autocomplete="off" aria-hidden="true" value={v.website} onInput={set('website')} />
        <footer>
          <label class={'lf__consent' + (err('consent') ? ' is-bad' : '')}><input type="checkbox" checked={v.consent} onChange={set('consent')} /><i></i><span>{f.consentA}<a href="/consent/" target="_blank">{f.consentLink}</a>{f.consentB}<a href="/privacy/" target="_blank">{f.policyLink}</a></span></label>
          {err('consent') && <p class="lf__err">{f.errors.consent}</p>}
          {fail && <p class="lf__err lf__failmsg" role="alert">{f.failText}</p>}
          <button class={'btn btn--deep lf__submit' + (busy ? ' is-busy' : '')} type="submit" disabled={busy || disabled}>{busy ? f.sending : fail ? f.failRetry : f.submit}</button>
        </footer>
      </div>
    </form>
  );
}
