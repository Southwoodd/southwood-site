import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';

type LeadModalContextValue = {
  isOpen: boolean;
  openLeadModal: () => void;
  closeLeadModal: () => void;
};

const LeadModalContext = createContext<LeadModalContextValue | null>(null);

export function useLeadModal() {
  const ctx = useContext(LeadModalContext);
  if (!ctx) {
    throw new Error('useLeadModal must be used within LeadModalProvider');
  }
  return ctx;
}

export function LeadModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const { hash, search } = useLocation();

  const openLeadModal = useCallback(() => setIsOpen(true), []);
  const closeLeadModal = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const params = new URLSearchParams(search);
    if (params.get('sent') === '1') {
      setIsOpen(true);
    }
  }, [search]);

  useEffect(() => {
    const id = hash.replace(/^#/, '');
    if (id === 'final-cta' || id === 'lead') {
      setIsOpen(true);
    }
  }, [hash]);

  const value = useMemo(
    () => ({ isOpen, openLeadModal, closeLeadModal }),
    [isOpen, openLeadModal, closeLeadModal],
  );

  return (
    <LeadModalContext.Provider value={value}>
      {children}
    </LeadModalContext.Provider>
  );
}
