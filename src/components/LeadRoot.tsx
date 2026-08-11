import HudPointer from './HudPointer';
import LeadModal from './LeadModal';
import { LeadModalProvider } from './LeadModalContext';

/** Клиентский слой: курсор HUD + модалка формы. */
export default function LeadRoot() {
  return (
    <LeadModalProvider>
      <HudPointer />
      <LeadModal />
    </LeadModalProvider>
  );
}
