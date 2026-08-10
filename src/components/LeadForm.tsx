import {
  type FormEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { content } from '../data/content.js';
import './LeadForm.css';

type Status = 'idle' | 'sending' | 'success' | 'error';

type FieldDef = {
  name: string;
  label: string;
  type: string;
  required: boolean;
};

const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY as
  | string
  | undefined;

export default function LeadForm() {
  const {
    fields,
    topicLabel,
    topicName,
    topics,
    cta,
    sendingLabel,
    successTitle,
    successText,
    errorText,
    missingKeyText,
    requiredError,
    topicRequiredError,
    invalidSummary,
    sendingAnnounce,
    successAnnounce,
    resetLabel,
    telegramHref,
    telegramLabel,
  } = content.finalCta;

  const formId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [banner, setBanner] = useState('');
  const [toast, setToast] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [topic, setTopic] = useState(topics[0]?.value ?? 'Диагностика');
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f: FieldDef) => [f.name, ''])),
  );

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 5200);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (status === 'success') {
      successRef.current?.focus();
    }
  }, [status]);

  const setField = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (status === 'error') {
      setStatus('idle');
      setBanner('');
    }
  };

  const validate = () => {
    const next: Record<string, string> = {};
    for (const field of fields as FieldDef[]) {
      if (field.required && !values[field.name]?.trim()) {
        next[field.name] = `${requiredError}: ${field.label}`;
      }
    }
    if (!topic.trim()) {
      next[topicName] = topicRequiredError;
    }
    return next;
  };

  const focusFirstError = (nextErrors: Record<string, string>) => {
    const order = [
      ...(fields as FieldDef[]).map((f) => f.name),
      topicName,
    ];
    const first = order.find((key) => nextErrors[key]);
    if (!first) return;
    const el = formRef.current?.querySelector<HTMLElement>(
      `[data-field="${first}"]`,
    );
    el?.focus();
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'sending') return;

    const form = e.currentTarget;
    const honeypot = form.elements.namedItem(
      'botcheck',
    ) as HTMLInputElement | null;
    if (honeypot?.value?.trim()) return;

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setStatus('error');
      setBanner(invalidSummary);
      setToast({ type: 'error', text: invalidSummary });
      focusFirstError(nextErrors);
      return;
    }

    if (!ACCESS_KEY) {
      setStatus('error');
      setBanner(missingKeyText);
      setToast({ type: 'error', text: missingKeyText });
      return;
    }

    setStatus('sending');
    setBanner('');
    setErrors({});
    setToast(null);

    const name = values.name?.trim() ?? '';
    const company = values.company?.trim() ?? '';
    const contact = values.contact?.trim() ?? '';
    const message = values.message?.trim() ?? '';

    const payload: Record<string, string> = {
      access_key: ACCESS_KEY,
      subject: `Заявка с southwood.pw — ${topic} — ${name}`,
      from_name: `Southwood · ${name}`,
      // Подписи 1:1 как на форме — так же придут в письмо
      Имя: name,
      Компания: company,
      'Telegram или телефон': contact,
      'О чем речь': topic,
      'Кратко о задаче': message || '—',
      botcheck: '',
    };

    try {
      // FormData — без JSON-preflight; Web3Forms так и рассчитан на client-side
      const body = new FormData();
      for (const [key, value] of Object.entries(payload)) {
        body.append(key, value);
      }

      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body,
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'submit failed');
      }
      setStatus('success');
      setToast({ type: 'success', text: successAnnounce });
      setValues(
        Object.fromEntries(fields.map((f: FieldDef) => [f.name, ''])),
      );
      setTopic(topics[0]?.value ?? 'Диагностика');
    } catch {
      setStatus('error');
      setBanner(errorText);
      setToast({ type: 'error', text: errorText });
    }
  };

  const busy = status === 'sending';

  return (
    <>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {status === 'sending'
          ? sendingAnnounce
          : status === 'success'
            ? successAnnounce
            : banner}
      </div>

      {toast ? (
        <div
          className={`form-toast form-toast--${toast.type}`}
          role="status"
        >
          <span className="form-toast__mark" aria-hidden="true">
            {toast.type === 'success' ? 'OK' : '!'}
          </span>
          <span>{toast.text}</span>
          <button
            type="button"
            className="form-toast__close"
            aria-label="Закрыть уведомление"
            onClick={() => setToast(null)}
          >
            ×
          </button>
        </div>
      ) : null}

      {status === 'success' ? (
        <div
          className="lead-form lead-form--success"
          role="status"
          tabIndex={-1}
          ref={successRef}
        >
          <p className="label">/ Done</p>
          <p className="lead-form__success-title">{successTitle}</p>
          <p className="lead-form__success-text">{successText}</p>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              setStatus('idle');
              setBanner('');
              setToast(null);
            }}
          >
            {resetLabel}
          </button>
        </div>
      ) : (
        <form
          className="lead-form"
          onSubmit={onSubmit}
          noValidate
          ref={formRef}
          aria-busy={busy}
        >
          <div className="lead-form__grid">
            {(fields as FieldDef[]).map((field) => {
              const id = `${formId}-${field.name}`;
              const errId = `${id}-error`;
              const isArea = field.type === 'textarea';
              const hasError = Boolean(errors[field.name]);
              return (
                <div
                  key={field.name}
                  className={`lead-form__field${isArea ? ' lead-form__field--wide' : ''}${hasError ? ' is-invalid' : ''}`}
                >
                  <label className="lead-form__label" htmlFor={id}>
                    {field.label}
                    {field.required ? (
                      <span className="lead-form__req" aria-hidden="true">
                        *
                      </span>
                    ) : (
                      <span className="lead-form__opt">необязательно</span>
                    )}
                  </label>
                  {isArea ? (
                    <textarea
                      id={id}
                      name={field.name}
                      data-field={field.name}
                      rows={4}
                      value={values[field.name] ?? ''}
                      onChange={(ev) => setField(field.name, ev.target.value)}
                      required={field.required}
                      disabled={busy}
                      autoComplete="off"
                      aria-invalid={hasError}
                      aria-describedby={hasError ? errId : undefined}
                    />
                  ) : (
                    <input
                      id={id}
                      name={field.name}
                      data-field={field.name}
                      type={field.type || 'text'}
                      value={values[field.name] ?? ''}
                      onChange={(ev) => setField(field.name, ev.target.value)}
                      required={field.required}
                      disabled={busy}
                      aria-invalid={hasError}
                      aria-describedby={hasError ? errId : undefined}
                      autoComplete={
                        field.name === 'name'
                          ? 'name'
                          : field.name === 'company'
                            ? 'organization'
                            : field.name === 'contact'
                              ? 'tel'
                              : 'off'
                      }
                    />
                  )}
                  {hasError ? (
                    <p className="lead-form__field-error" id={errId} role="alert">
                      {errors[field.name]}
                    </p>
                  ) : null}
                </div>
              );
            })}

            <fieldset
              className={`lead-form__field lead-form__field--wide lead-form__topics${errors[topicName] ? ' is-invalid' : ''}`}
              disabled={busy}
            >
              <legend className="lead-form__label">
                {topicLabel}
                <span className="lead-form__req" aria-hidden="true">
                  *
                </span>
              </legend>
              <div
                className="lead-form__topic-list"
                role="radiogroup"
                aria-label={topicLabel}
                aria-invalid={Boolean(errors[topicName])}
                aria-describedby={
                  errors[topicName] ? `${formId}-topic-error` : undefined
                }
              >
                {topics.map((item: { value: string; label: string }) => {
                  const id = `${formId}-topic-${item.value}`;
                  return (
                    <label
                      key={item.value}
                      className="lead-form__topic"
                      htmlFor={id}
                    >
                      <input
                        id={id}
                        type="radio"
                        name={topicName}
                        data-field={topicName}
                        value={item.value}
                        checked={topic === item.value}
                        onChange={() => {
                          setTopic(item.value);
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next[topicName];
                            return next;
                          });
                        }}
                      />
                      <span>{item.label}</span>
                    </label>
                  );
                })}
              </div>
              {errors[topicName] ? (
                <p
                  className="lead-form__field-error"
                  id={`${formId}-topic-error`}
                  role="alert"
                >
                  {errors[topicName]}
                </p>
              ) : null}
            </fieldset>
          </div>

          <input
            type="text"
            name="botcheck"
            className="lead-form__hp"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            defaultValue=""
          />

          {banner ? (
            <p className="lead-form__error" role="alert">
              {banner}{' '}
              <a href={telegramHref} target="_blank" rel="noopener noreferrer">
                {telegramLabel}
              </a>
            </p>
          ) : null}

          <button
            type="submit"
            className="btn btn--primary lead-form__submit"
            disabled={busy}
          >
            {busy ? sendingLabel : cta}
          </button>
        </form>
      )}
    </>
  );
}
