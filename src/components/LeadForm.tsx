import {
  type FormEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
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
  const {
    consentLabel,
    consentLinkLabel,
    consentHref,
    consentError,
  } = content.legal;

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
  const [consent, setConsent] = useState(false);
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('sent') !== '1') return;
    setStatus('success');
    setToast({ type: 'success', text: successAnnounce });
    params.delete('sent');
    const next = params.toString();
    const url = `${window.location.pathname}${next ? `?${next}` : ''}${window.location.hash || '#final-cta'}`;
    window.history.replaceState({}, '', url);
  }, [successAnnounce]);

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
    if (!consent) {
      next.consent = consentError;
    }
    return next;
  };

  const focusFirstError = (nextErrors: Record<string, string>) => {
    const order = [
      ...(fields as FieldDef[]).map((f) => f.name),
      topicName,
      'consent',
    ];
    const first = order.find((key) => nextErrors[key]);
    if (!first) return;
    const el = formRef.current?.querySelector<HTMLElement>(
      `[data-field="${first}"]`,
    );
    el?.focus();
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'sending') return;

    const formEl = e.currentTarget;
    const honeypot = formEl.elements.namedItem(
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
    const subject = `Заявка с southwood.pw — ${topic} — ${name}`;

    const post = document.createElement('form');
    post.method = 'POST';
    post.action = 'https://api.web3forms.com/submit';
    post.acceptCharset = 'UTF-8';
    post.style.display = 'none';

    const payload: Record<string, string> = {
      access_key: ACCESS_KEY,
      subject,
      from_name: `Southwood · ${name}`,
      redirect: `${window.location.origin}/?sent=1#final-cta`,
      Имя: name,
      Компания: company,
      'Telegram или телефон': contact,
      'О чем речь': topic,
      'Кратко о задаче': message || '—',
      'Согласие на обработку персональных данных': 'Да',
      botcheck: '',
    };

    for (const [key, value] of Object.entries(payload)) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      post.appendChild(input);
    }

    document.body.appendChild(post);
    post.submit();
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
              setConsent(false);
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

          <div
            className={`lead-form__consent${errors.consent ? ' is-invalid' : ''}`}
          >
            <label className="lead-form__consent-label" htmlFor={`${formId}-consent`}>
              <input
                id={`${formId}-consent`}
                type="checkbox"
                name="consent"
                data-field="consent"
                checked={consent}
                disabled={busy}
                aria-invalid={Boolean(errors.consent)}
                aria-describedby={
                  errors.consent ? `${formId}-consent-error` : undefined
                }
                onChange={(ev) => {
                  setConsent(ev.target.checked);
                  if (errors.consent) {
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.consent;
                      return next;
                    });
                  }
                }}
              />
              <span>
                {consentLabel}{' '}
                <Link to={consentHref} target="_blank" rel="noopener noreferrer">
                  {consentLinkLabel}
                </Link>
                <span className="lead-form__req" aria-hidden="true">
                  *
                </span>
              </span>
            </label>
            {errors.consent ? (
              <p
                className="lead-form__field-error"
                id={`${formId}-consent-error`}
                role="alert"
              >
                {errors.consent}
              </p>
            ) : null}
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
