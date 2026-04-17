// ================================================================
// Zyrix FinSuite — Shared UI Components
// Skeleton, Charts, Empty States, Toast, Table, Badge, Modal
// ================================================================

import React, { useState, useEffect, useRef } from "react";

export const C = {
  bg: "#0f1117", card: "#1a1d27", border: "#2a2d3e",
  purple: "#6C5DD3", purpleLight: "#8B7CF8",
  green: "#01B574", red: "#FF4560", yellow: "#FFB547", blue: "#3A86FF",
  text: "#FFFFFF", muted: "#8B8FA8", sidebar: "#13151f",
};

// ── Skeleton Loader ───────────────────────────────
export function Skeleton({ w = "100%", h = 16, radius = 6, className = "" }) {
  return (
    <div className={className} style={{
      width: w, height: h, borderRadius: radius,
      background: `linear-gradient(90deg, ${C.border} 25%, #2e3245 50%, ${C.border} 75%)`,
      backgroundSize: "200% 100%",
      animation: "zyrix-shimmer 1.5s infinite",
    }} />
  );
}

export function CardSkeleton({ rows = 3 }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
      <Skeleton w="50%" h={14} />
      <div style={{ marginTop: 16 }}><Skeleton w="80%" h={28} /></div>
      {rows > 1 && <div style={{ marginTop: 12 }}><Skeleton w="40%" h={12} /></div>}
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr>
      {Array(cols).fill(0).map((_, i) => (
        <td key={i} style={{ padding: "14px 16px" }}>
          <Skeleton w={`${60 + Math.random() * 30}%`} h={13} />
        </td>
      ))}
    </tr>
  );
}

// ── Spinner ───────────────────────────────────────
export function Spinner({ size = 32, color = C.purple }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
      <div style={{
        width: size, height: size,
        border: `3px solid ${C.border}`,
        borderTopColor: color,
        borderRadius: "50%",
        animation: "zyrix-spin 0.7s linear infinite",
      }} />
    </div>
  );
}

// ── Toast Notifications ───────────────────────────
let toastQueue = [];
let toastListeners = [];

export function toast(message, type = "success", duration = 3500) {
  const id = Date.now();
  const item = { id, message, type };
  toastQueue = [...toastQueue, item];
  toastListeners.forEach(fn => fn([...toastQueue]));
  setTimeout(() => {
    toastQueue = toastQueue.filter(t => t.id !== id);
    toastListeners.forEach(fn => fn([...toastQueue]));
  }, duration);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    toastListeners.push(setToasts);
    return () => { toastListeners = toastListeners.filter(fn => fn !== setToasts); };
  }, []);

  const colors = { success: C.green, error: C.red, warning: C.yellow, info: C.blue };
  const icons = { success: "✓", error: "✕", warning: "⚠", info: "ℹ" };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: C.card, border: `1px solid ${colors[t.type] || C.border}`,
          borderLeft: `4px solid ${colors[t.type] || C.purple}`,
          borderRadius: 10, padding: "12px 16px", minWidth: 280, maxWidth: 380,
          display: "flex", alignItems: "center", gap: 10,
          animation: "zyrix-slideIn 0.25s ease",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        }}>
          <span style={{ color: colors[t.type], fontSize: 16, fontWeight: 700 }}>{icons[t.type]}</span>
          <span style={{ color: C.text, fontSize: 14 }}>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

// ── Empty State ───────────────────────────────────
export function EmptyState({ icon = "📭", title, description, action, onAction }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 24px" }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}>{icon}</div>
      <div style={{ color: C.text, fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{title}</div>
      {description && <div style={{ color: C.muted, fontSize: 14, maxWidth: 300, margin: "0 auto 20px" }}>{description}</div>}
      {action && onAction && (
        <button onClick={onAction} style={{ background: C.purple, border: "none", color: "#fff", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
          {action}
        </button>
      )}
    </div>
  );
}

// ── Error Banner ──────────────────────────────────
export function ErrorBanner({ message, onRetry }) {
  return (
    <div style={{ background: `${C.red}12`, border: `1px solid ${C.red}35`, borderRadius: 10, padding: "13px 16px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: C.red, fontSize: 16 }}>⚠</span>
        <span style={{ color: C.text, fontSize: 13 }}>{message}</span>
      </div>
      {onRetry && (
        <button onClick={onRetry} style={{ color: C.purple, background: "none", border: `1px solid ${C.purple}40`, borderRadius: 6, padding: "4px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
          Retry
        </button>
      )}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────
export function Badge({ color = "gray", children, size = "md" }) {
  const palette = {
    green:  { bg: `${C.green}20`,  text: C.green },
    red:    { bg: `${C.red}20`,    text: C.red },
    yellow: { bg: `${C.yellow}20`, text: C.yellow },
    blue:   { bg: `${C.blue}20`,   text: C.blue },
    purple: { bg: `${C.purple}20`, text: C.purpleLight },
    gray:   { bg: "#ffffff12",     text: C.muted },
  };
  const p = palette[color] || palette.gray;
  const pad = size === "sm" ? "2px 6px" : "3px 9px";
  const fs = size === "sm" ? 10 : 11;

  return (
    <span style={{ background: p.bg, color: p.text, borderRadius: 6, padding: pad, fontSize: fs, fontWeight: 700, textTransform: "capitalize" }}>
      {children}
    </span>
  );
}

// ── Modal ─────────────────────────────────────────
export function Modal({ open, title, onClose, children, maxWidth = 520 }) {
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div ref={ref} onClick={(e) => e.target === ref.current && onClose()}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, width: "100%", maxWidth, animation: "zyrix-fadeIn 0.2s ease", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ color: C.text, fontSize: 18, fontWeight: 700, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "#ffffff10", border: "none", color: C.muted, width: 30, height: 30, borderRadius: 8, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Confirm Dialog ────────────────────────────────
export function ConfirmModal({ open, title, message, onConfirm, onCancel, danger = false }) {
  return (
    <Modal open={open} title={title} onClose={onCancel} maxWidth={380}>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 24 }}>{message}</p>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button onClick={onCancel} style={{ background: C.card, border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, padding: "9px 18px", cursor: "pointer", fontSize: 14 }}>Cancel</button>
        <button onClick={onConfirm} style={{ background: danger ? C.red : C.purple, border: "none", color: "#fff", borderRadius: 8, padding: "9px 18px", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>Confirm</button>
      </div>
    </Modal>
  );
}

// ── Input ─────────────────────────────────────────
export function Input({ label, error, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      {label && <label style={{ color: C.muted, fontSize: 12, display: "block", marginBottom: 5, fontWeight: 500 }}>{label}</label>}
      <input
        {...props}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
        style={{
          width: "100%", background: "#13151f", boxSizing: "border-box",
          border: `1px solid ${error ? C.red : focused ? C.purple : C.border}`,
          color: C.text, borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none",
          transition: "border-color 0.15s",
          ...props.style,
        }}
      />
      {error && <div style={{ color: C.red, fontSize: 11, marginTop: 4 }}>{error}</div>}
    </div>
  );
}

// ── Line Chart (SVG, no deps) ─────────────────────
export function LineChart({ data = [], width = 500, height = 140, color = C.purple, label = "value" }) {
  if (!data || data.length < 2) return <div style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: 20 }}>No chart data</div>;

  const values = data.map(d => typeof d === "number" ? d : d[label] ?? d.value ?? 0);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = { top: 10, right: 10, bottom: 24, left: 44 };
  const W = width - pad.left - pad.right;
  const H = height - pad.top - pad.bottom;

  const pts = values.map((v, i) => {
    const x = pad.left + (i / (values.length - 1)) * W;
    const y = pad.top + H - ((v - min) / range) * H;
    return [x, y];
  });

  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");
  const fillPath = `${linePath} L ${pts[pts.length - 1][0]} ${pad.top + H} L ${pts[0][0]} ${pad.top + H} Z`;

  // Y-axis labels
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => ({
    y: pad.top + H - t * H,
    val: min + t * range,
  }));

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={`grad-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={pad.left} y1={t.y} x2={pad.left + W} y2={t.y} stroke={C.border} strokeWidth={1} />
          <text x={pad.left - 6} y={t.y + 4} textAnchor="end" fill={C.muted} fontSize={10}>
            {t.val >= 1000 ? `${(t.val/1000).toFixed(0)}k` : t.val.toFixed(0)}
          </text>
        </g>
      ))}

      {/* Fill */}
      <path d={fillPath} fill={`url(#grad-${color.replace("#","")})`} />

      {/* Line */}
      <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

      {/* Dots on last point */}
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={4} fill={color} />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={7} fill={color} fillOpacity={0.2} />
    </svg>
  );
}

// ── Global CSS Animations ─────────────────────────
export function GlobalStyles() {
  return (
    <style>{`
      @keyframes zyrix-shimmer {
        0%  { background-position: 200% 0 }
        100%{ background-position: -200% 0 }
      }
      @keyframes zyrix-spin {
        to { transform: rotate(360deg) }
      }
      @keyframes zyrix-fadeIn {
        from { opacity: 0; transform: translateY(-8px) }
        to   { opacity: 1; transform: translateY(0) }
      }
      @keyframes zyrix-slideIn {
        from { opacity: 0; transform: translateX(20px) }
        to   { opacity: 1; transform: translateX(0) }
      }
      * { box-sizing: border-box; }
      body { margin: 0; background: #0f1117; }
      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-track { background: #0f1117; }
      ::-webkit-scrollbar-thumb { background: #2a2d3e; border-radius: 3px; }
      ::-webkit-scrollbar-thumb:hover { background: #6C5DD3; }
      input::placeholder { color: #8B8FA8 !important; }
      select option { background: #1a1d27; color: #fff; }
    `}</style>
  );
}