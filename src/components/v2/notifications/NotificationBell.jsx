// ================================================================
// NotificationBell — header bell + unread badge + dropdown trigger.
// Uses cinematic tokens from D-1; first place that surface lands
// on a header (per the kickoff direction: cinematic UI may now
// appear on live pages, not only the showcase routes).
// ================================================================
import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { CINEMATIC, TYPE_STACK } from '@/design-system-v2/cinematic/tokens';
import { glowOf } from '@/design-system-v2/cinematic/shadows';
import { useNotificationCenter } from './NotificationCenterContext';
import NotificationDropdown from './NotificationDropdown';

export default function NotificationBell({ language = 'tr' }) {
  const { unread, lastEvent } = useNotificationCenter();
  const [open, setOpen]     = useState(false);
  const [shake, setShake]   = useState(false);
  const wrapRef = useRef(null);

  // Trigger a single shake when a new notification arrives.
  useEffect(() => {
    if (!lastEvent) return;
    setShake(true);
    const t = setTimeout(() => setShake(false), 600);
    return () => clearTimeout(t);
  }, [lastEvent?.at]);

  // Outside click closes the dropdown.
  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const tone = unread > 0 ? 'crimson' : 'cyan';
  const showBadge = unread > 0;

  return (
    <div ref={wrapRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        aria-label="Notifications"
        aria-expanded={open}
        style={{
          position: 'relative',
          width: 36, height: 36,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: open ? CINEMATIC.glass.tint2 : 'transparent',
          color: showBadge ? CINEMATIC.accent.crimsonGlow : CINEMATIC.text.pearlDim,
          border: `1px solid ${open ? CINEMATIC.glass.borderStrong : 'transparent'}`,
          borderRadius: 10,
          cursor: 'pointer',
          fontFamily: TYPE_STACK.body,
          transition: 'background 200ms, border-color 200ms, color 200ms, transform 200ms',
          boxShadow: showBadge ? glowOf('crimson', 1) : 'none',
          animation: shake ? 'cn-bell-shake 0.6s ease-in-out' : undefined
        }}
      >
        <Bell size={17} />
        {showBadge && (
          <span
            aria-label={`${unread} unread`}
            style={{
              position: 'absolute',
              top: 4,
              insetInlineEnd: 4,
              minWidth: 16, height: 16,
              padding: '0 4px',
              background: CINEMATIC.accent.crimsonGlow,
              color: '#0A0E27',
              border: `2px solid ${CINEMATIC.bg.deepSpace1}`,
              borderRadius: 999,
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.02em',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              lineHeight: 1,
              boxShadow: glowOf('crimson', 1)
            }}
          >
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>
      {open && <NotificationDropdown language={language} onClose={() => setOpen(false)} />}

      <style>{`
        @keyframes cn-bell-shake {
          0%, 100% { transform: rotate(0); }
          15%      { transform: rotate(-12deg); }
          30%      { transform: rotate(10deg); }
          45%      { transform: rotate(-7deg); }
          60%      { transform: rotate(5deg); }
          75%      { transform: rotate(-3deg); }
        }
      `}</style>
    </div>
  );
}
