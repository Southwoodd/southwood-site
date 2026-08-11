import { type MouseEvent } from 'react';
import ScrambleButton from './ScrambleButton';
import { useLeadModal } from './LeadModalContext';

type Props = {
  children: string;
  className?: string;
};

/** CTA, открывающая модалку с формой заявки. */
export default function OpenLeadCta({ children, className = '' }: Props) {
  const { openLeadModal } = useLeadModal();

  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    openLeadModal();
  };

  return (
    <ScrambleButton className={className} href="#lead" onClick={onClick}>
      {children}
    </ScrambleButton>
  );
}
