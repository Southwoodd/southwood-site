import { type MouseEvent } from 'react';
import ScrambleButton from './ScrambleButton';
import { requestOpenLeadModal, type LeadIntent } from './LeadModalContext';

type Props = {
  label: string;
  className?: string;
  /** Значение темы в форме (Диагностика / Retainer / Проект …) */
  topic?: string;
  /** Подпись тарифа в письме — сразу видно, откуда заявка */
  tariff?: string;
};

/** CTA, открывающая модалку с формой заявки. */
export default function OpenLeadCta({
  label,
  className = '',
  topic,
  tariff,
}: Props) {
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const intent: LeadIntent = {};
    if (topic) intent.topic = topic;
    if (tariff) intent.tariff = tariff;
    requestOpenLeadModal(intent);
  };

  return (
    <ScrambleButton
      className={className}
      href="#lead"
      label={label}
      onClick={onClick}
    />
  );
}
