import {
  type FormEvent,
  useId,
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
    telegramHref,
    telegramLabel,
  } = content.finalCta;

  const formId = useId();
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [topic, setTopic] = useState(topics[0]?.value ?? 'Диагностика');
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f: FieldDef) => [f.name, ''])),
  );

  const setField = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'sending') return;

    const form = e.currentTarget;
    const honeypot = (
      form.elements.namedItem('botcheck') as HTMLInputElement | null
    )?.value;
    if (honeypot) return;

    if (!ACCESS_KEY) {
      setStatus('error');
      setErrorMsg(missingKeyText);
      return;
    }

    for (const field of fields as FieldDef[]) {
      if (field.required && !values[field.name]?.trim()) {
        setStatus('error');
        setErrorMsg(`Заполните поле: ${field.label}`);
        return;
      }
    }
    if (!topic.trim()) {
      setStatus('error');
      setErrorMsg(`Выберите: ${topicLabel}`);
      return;
    }

    setStatus('sending');
    setErrorMsg('');

    const name = values.name?.trim() ?? '';
    const payload = {
      access_key: ACCESS_KEY,
      subject: `Заявка с southwood.pw — ${topic} — ${name}`,
      from_name: name,
      name,
      company: values.company?.trim() ?? '',
      contact: values.contact?.trim() ?? '',
      [topicName]: topic,
      message: values.message?.trim() ?? '',
      botcheck: '',
    };

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { success?: boolean; message?: string };
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'submit failed');
      }
      setStatus('success');
      setValues(
        Object.fromEntries(fields.map((f: FieldDef) => [f.name, ''])),
      );
      setTopic(topics[0]?.value ?? 'Диагностика');
    } catch {
      setStatus('error');
      setErrorMsg(errorText);
    }
  };

  if (status === 'success') {
    return (
      <div className="lead-form lead-form--success" role="status">
        <p className="label">/ Done</p>
        <p className="lead-form__success-title">{successTitle}</p>
        <p className="lead-form__success-text">{successText}</p>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => setStatus('idle')}
        >
          Еще одна заявка
        </button>
      </div>
    );
  }

  return (
    <form className="lead-form" onSubmit={onSubmit} noValidate>
      <div className="lead-form__grid">
        {(fields as FieldDef[]).map((field) => {
          const id = `${formId}-${field.name}`;
          const isArea = field.type === 'textarea';
          return (
            <label
              key={field.name}
              className={`lead-form__field${isArea ? ' lead-form__field--wide' : ''}`}
              htmlFor={id}
            >
              <span className="lead-form__label">
                {field.label}
                {field.required ? (
                  <span className="lead-form__req" aria-hidden="true">
                    *
                  </span>
                ) : (
                  <span className="lead-form__opt">необязательно</span>
                )}
              </span>
              {isArea ? (
                <textarea
                  id={id}
                  name={field.name}
                  rows={4}
                  value={values[field.name] ?? ''}
                  onChange={(ev) => setField(field.name, ev.target.value)}
                  required={field.required}
                  autoComplete="off"
                />
              ) : (
                <input
                  id={id}
                  name={field.name}
                  type={field.type || 'text'}
                  value={values[field.name] ?? ''}
                  onChange={(ev) => setField(field.name, ev.target.value)}
                  required={field.required}
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
            </label>
          );
        })}

        <fieldset className="lead-form__field lead-form__field--wide lead-form__topics">
          <legend className="lead-form__label">
            {topicLabel}
            <span className="lead-form__req" aria-hidden="true">
              *
            </span>
          </legend>
          <div className="lead-form__topic-list" role="radiogroup" aria-label={topicLabel}>
            {topics.map((item: { value: string; label: string }) => {
              const id = `${formId}-topic-${item.value}`;
              return (
                <label key={item.value} className="lead-form__topic" htmlFor={id}>
                  <input
                    id={id}
                    type="radio"
                    name={topicName}
                    value={item.value}
                    checked={topic === item.value}
                    onChange={() => setTopic(item.value)}
                  />
                  <span>{item.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>

      {/* Honeypot — должно оставаться пустым */}
      <input
        type="checkbox"
        name="botcheck"
        className="lead-form__hp"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      {status === 'error' && errorMsg ? (
        <p className="lead-form__error" role="alert">
          {errorMsg}{' '}
          <a href={telegramHref} target="_blank" rel="noopener noreferrer">
            {telegramLabel}
          </a>
        </p>
      ) : null}

      <button
        type="submit"
        className="btn btn--primary lead-form__submit"
        disabled={status === 'sending'}
      >
        {status === 'sending' ? sendingLabel : cta}
      </button>
    </form>
  );
}
