import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

/** С каким тарифом / темой открыли форму */
export type LeadIntent = {
  topic?: string;
  tariff?: string;
};

type LeadModalContextValue = {
  isOpen: boolean;
  intent: LeadIntent;
  openLeadModal: (intent?: LeadIntent) => void;
  closeLeadModal: () => void;
};

const LeadModalContext = createContext<LeadModalContextValue | null>(null);

const OPEN_EVENT = 'southwood:open-lead';

export function useLeadModal() {
  const ctx = useContext(LeadModalContext);
  if (!ctx) {
    throw new Error('useLeadModal must be used within LeadModalProvider');
  }
  return ctx;
}

/** Открыть модалку из любой острова / разметки. */
export function requestOpenLeadModal(intent: LeadIntent = {}) {
  window.dispatchEvent(
    new CustomEvent<LeadIntent>(OPEN_EVENT, { detail: intent }),
  );
}

export function LeadModalProvider({ children }: { children?: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [intent, setIntent] = useState<LeadIntent>({});

  const openLeadModal = useCallback((next: LeadIntent = {}) => {
    setIntent(next);
    setIsOpen(true);
  }, []);

  const closeLeadModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('sent') === '1') {
        setIsOpen(true);
      }
      const id = window.location.hash.replace(/^#/, '');
      if (id === 'final-cta' || id === 'lead') {
        setIsOpen(true);
      }
    };

    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<LeadIntent>).detail ?? {};
      openLeadModal(detail);
    };

    syncFromUrl();
    window.addEventListener('hashchange', syncFromUrl);
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => {
      window.removeEventListener('hashchange', syncFromUrl);
      window.removeEventListener(OPEN_EVENT, onOpen);
    };
  }, [openLeadModal]);

  const value = useMemo(
    () => ({ isOpen, intent, openLeadModal, closeLeadModal }),
    [isOpen, intent, openLeadModal, closeLeadModal],
  );

  return (
    <LeadModalContext.Provider value={value}>
      {children}
    </LeadModalContext.Provider>
  );
}
