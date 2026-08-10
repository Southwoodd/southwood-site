import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import HudPointer from './components/HudPointer';
import LeadModal from './components/LeadModal';
import { LeadModalProvider } from './components/LeadModalContext';
import HomePage from './pages/HomePage';
import CasePage from './pages/CasePage';
import PrivacyPage from './pages/PrivacyPage';

function ScrollAndHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const id = hash.replace(/^#/, '');
    if (id === 'final-cta' || id === 'lead') {
      return;
    }
    if (hash) {
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
        window.scrollTo(0, 0);
      });
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

export default function App() {
  return (
    <LeadModalProvider>
      <ScrollAndHash />
      <HudPointer />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cases/:slug" element={<CasePage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <LeadModal />
    </LeadModalProvider>
  );
}
