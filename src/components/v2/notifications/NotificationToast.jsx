// ================================================================
// NotificationToast — real-time pop-up triggered by SSE events.
// Stack of up to 3 (managed by NotificationCenterContext); older
// ones slide out. Fixed position top-right (mobile: bottom-center).
// ================================================================
import { useEffect, useState } from 'react';
import { CINEMATIC, RADIUS, TYPE_STACK } from '@/design-system-v2/cinematic/tokens';
import { glowOf, aurora } from '@/design-system-v2/cinematic/shadows';
import NotificationListItem from './NotificationListItem';
import { useNotificationCenter } from './NotificationCenterContext';

export default function NotificationToastStack({ language = 'tr' }) {
  const { toasts, dismissToast } = useNotificationCenter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      style={{
        position: 'fixed',
        zIndex: 9100,
        ...(isMobile ? {
          left: 12, right: 12, bottom: 12,
          display: 'flex', flexDirection: 'column-reverse', gap: 8
        } : {
          top: 80, insetInlineEnd: 16,
          display: 'flex', flexDirection: 'column', gap: 10,
          maxWidth: 360
        })
      }}
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} notification={t} language={language} onClose={() => dismissToast(t.id)} />
      ))}
    </div>
  );
}

function ToastCard({ notification: n, language, onClose }) {
  const isCritical = n.severity === 'CRITICAL';
  return (
    <div
      role="alert"
      style={{
        position: 'relative',
        background: CINEMATIC.bg.deepSpace2,
        border: `1px solid ${CINEMATIC.glass.borderStrong}`,
        borderRadius: RADIUS.md,
        padding: 12,
        boxShadow: isCritical ? aurora(3) : glowOf(n.iconTone || 'cyan', 2),
        animation: 'cn-fade-up 320ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
        fontFamily: TYPE_STACK.body
      }}
    >
      <NotificationListItem
        notification={n}
        language={language}
        onClick={() => {
          if (n.ctaRoute) window.location.href = n.ctaRoute;
          onClose();
        }}
      />
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss"
        style={{
          position: 'absolute',
          top: 6,
          insetInlineEnd: 6,
          background: 'transparent',
          border: 'none',
          color: CINEMATIC.text.pearlFaint,
          cursor: 'pointer',
          fontSize: 14,
          lineHeight: 1,
          padding: 4
        }}
      >×</button>
    </div>
  );
}
