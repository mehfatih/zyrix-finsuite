// ================================================================
// Global ImpersonationBanner (Phase 14 — make-impersonate-real).
// Mounted ONCE in App.jsx so every route shows it while an
// impersonation session is active. Polls /api/admin/impersonation/status
// using the customer JWT, shows a red bar with countdown + Exit button,
// auto-exits at expiry, and adds 44px body padding so fixed top bars
// don't sit underneath.
// ================================================================
import { useEffect, useRef, useState } from 'react';
import { LogOut, AlertTriangle } from 'lucide-react';
import {
  exitImpersonationApi,
  getImpersonationStatus,
  clearImpersonationSession,
  IMPERSONATION_KEYS,
} from '../api/admin/impersonation';

const POLL_MS = 30_000;

export default function ImpersonationBanner() {
  const [status, setStatus] = useState(null);
  const [now, setNow] = useState(Date.now());
  const exitingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const probe = async () => {
      // Skip the network call entirely when no customer token is present —
      // avoids hitting /status from public landing pages on first paint.
      const tok = (() => { try { return localStorage.getItem(IMPERSONATION_KEYS.CUSTOMER_TOKEN_KEY); } catch { return null; } })();
      if (!tok) {
        if (!cancelled) setStatus({ active: false });
        return;
      }
      const s = await getImpersonationStatus();
      if (!cancelled) setStatus(s);
    };
    probe();
    const pollId = setInterval(probe, POLL_MS);
    const tickId = setInterval(() => setNow(Date.now()), 1000);
    return () => { cancelled = true; clearInterval(pollId); clearInterval(tickId); };
  }, []);

  // Push fixed admin/customer top bars below the banner.
  useEffect(() => {
    const active = !!status?.active;
    if (active) document.body.style.paddingTop = '44px';
    else        document.body.style.paddingTop = '';
    return () => { document.body.style.paddingTop = ''; };
  }, [status?.active]);

  const handleExit = async () => {
    if (exitingRef.current) return;
    exitingRef.current = true;
    try { await exitImpersonationApi(); } catch { /* keep restoring locally */ }
    clearImpersonationSession();
    // Bounce back to the impersonation console so the admin lands somewhere useful.
    window.location.href = '/admin/customers/impersonate';
  };

  if (!status?.active) return null;

  const expiresAtMs = status.expiresAt ? new Date(status.expiresAt).getTime() : 0;
  const remainingSec = Math.max(0, Math.floor((expiresAtMs - now) / 1000));
  const mm = String(Math.floor(remainingSec / 60)).padStart(2, '0');
  const ss = String(remainingSec % 60).padStart(2, '0');

  if (remainingSec === 0 && !exitingRef.current) {
    handleExit();
  }

  return (
    <div
      role="alert"
      style={{
        position: 'fixed',
        top: 0,
        insetInlineStart: 0,
        insetInlineEnd: 0,
        zIndex: 9999,
        background: 'linear-gradient(90deg, #DC2626, #B91C1C)',
        color: '#FFFFFF',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        boxShadow: '0 4px 12px rgba(220,38,38,0.35)',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        height: '44px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        <AlertTriangle size={18} style={{ flexShrink: 0 }} />
        <div style={{ fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          Impersonating <span style={{ fontWeight: 800 }}>{status.targetCustomerName}</span>
          <span style={{ marginInlineStart: '8px', opacity: 0.85 }}>
            ({status.targetCustomerId})
          </span>
        </div>
        <div style={{
          background: 'rgba(0,0,0,0.2)',
          padding: '3px 10px',
          borderRadius: '999px',
          fontFamily: 'monospace',
          fontSize: '12px',
          fontWeight: 700,
          marginInlineStart: '12px',
          flexShrink: 0,
        }}>
          ⏱ {mm}:{ss}
        </div>
      </div>
      <button
        onClick={handleExit}
        style={{
          background: '#FFFFFF',
          color: '#B91C1C',
          border: 'none',
          padding: '6px 14px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 800,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          flexShrink: 0,
        }}
      >
        <LogOut size={14} /> Exit Impersonation
      </button>
    </div>
  );
}
