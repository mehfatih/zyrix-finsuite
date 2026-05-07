// ================================================================
// ImpersonationBanner — bright red banner shown when admin impersonating
// ================================================================
import React, { useEffect, useState } from "react";
import { CRITICAL_RED } from "../../utils/admin/adminPalette";
import { logAdminAction, localAdmin, ADMIN_KEYS } from "../../utils/admin/adminApi";

const KEY = "zyrix_impersonation_active";

export default function ImpersonationBanner() {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return null; }
  });
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!session) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [session]);

  if (!session) return null;

  const expiresAt = new Date(session.expiresAt).getTime();
  const remainingMs = Math.max(0, expiresAt - now);
  if (remainingMs <= 0) {
    end();
    return null;
  }
  const mins = Math.floor(remainingMs / 60000);
  const secs = Math.floor((remainingMs % 60000) / 1000);

  function end() {
    logAdminAction({
      action: "customer.impersonate.ended",
      resourceType: "customer",
      resourceId: session.customerId,
      severity: "WARNING",
    });
    localStorage.removeItem(KEY);
    setSession(null);
    if (typeof window !== "undefined") window.location.href = "/admin/customers";
  }

  return (
    <div role="alert" style={{
      position: "fixed", top: 0, insetInlineStart: 0, insetInlineEnd: 0,
      zIndex: 9999,
      background: `linear-gradient(135deg, ${CRITICAL_RED.base}, ${CRITICAL_RED.dark})`,
      color: "#fff",
      padding: "10px 18px",
      display: "flex",
      alignItems: "center",
      gap: 14,
      boxShadow: "0 6px 16px rgba(220,38,38,0.4)",
      animation: "impPulse 2s ease-in-out infinite",
    }}>
      <span style={{ fontSize: 18 }}>🔴</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 900 }}>
          You are impersonating: {session.customerName || session.customerId}
        </div>
        <div style={{ fontSize: 11, opacity: 0.9, fontWeight: 700 }}>
          Reason: {session.reason} · {mins}m {String(secs).padStart(2, "0")}s remaining
        </div>
      </div>
      <button type="button" onClick={end} style={{ background: "#fff", color: CRITICAL_RED.dark, border: "none", padding: "8px 18px", borderRadius: 10, fontSize: 12, fontWeight: 900, cursor: "pointer", whiteSpace: "nowrap" }}>
        ✗ End Session
      </button>
      <style>{`@keyframes impPulse { 0%, 100% { box-shadow: 0 6px 16px rgba(220,38,38,0.4); } 50% { box-shadow: 0 6px 22px rgba(220,38,38,0.7); } }`}</style>
    </div>
  );
}

export function startImpersonation({ customerId, customerName, reason, durationMin = 240 }) {
  const session = {
    customerId, customerName, reason,
    startedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + durationMin * 60000).toISOString(),
  };
  try { localStorage.setItem(KEY, JSON.stringify(session)); } catch {}
  logAdminAction({
    action: "customer.impersonate.started",
    resourceType: "customer",
    resourceId: customerId,
    severity: "WARNING",
    metadata: { reason, durationMin },
  });
  return session;
}

export function isImpersonating() {
  try { return !!JSON.parse(localStorage.getItem(KEY) || "null"); } catch { return false; }
}
