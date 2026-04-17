// ================================================================
// Zyrix FinSuite — Accounts Page (Customer)
// Linked bank accounts, cards, balance breakdown
// ================================================================

import React, { useState } from "react";
import { useApi } from "../hooks/useApi";
import { customerAPI } from "../services/api";

const C = {
  bg: "#0f1117", card: "#1a1d27", border: "#2a2d3e",
  purple: "#6C5DD3", purpleLight: "#8B7CF8",
  green: "#01B574", red: "#FF4560", yellow: "#FFB547", blue: "#3A86FF",
  text: "#FFFFFF", muted: "#8B8FA8",
};

const fmt = {
  currency: (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n ?? 0),
  date: (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  mask: (s) => s ? `•••• ${String(s).slice(-4)}` : "•••• ••••",
};

// ── Skeleton ──────────────────────────────────────
function Skeleton({ w = "100%", h = 16, radius = 6 }) {
  return (
    <div style={{ width: w, height: h, borderRadius: radius, background: `linear-gradient(90deg, ${C.border} 25%, #2e3245 50%, ${C.border} 75%)`, backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
  );
}

// ── Bank Card Visual ──────────────────────────────
function BankCard({ account }) {
  const GRADIENTS = {
    checking: "linear-gradient(135deg, #6C5DD3 0%, #3A1F9E 100%)",
    savings:  "linear-gradient(135deg, #01B574 0%, #027A4F 100%)",
    credit:   "linear-gradient(135deg, #FF4560 0%, #8B0000 100%)",
    investment: "linear-gradient(135deg, #3A86FF 0%, #1A3A7A 100%)",
    default:  "linear-gradient(135deg, #2a2d3e 0%, #1a1d27 100%)",
  };

  const TYPE_ICONS = { checking: "🏦", savings: "💰", credit: "💳", investment: "📈" };
  const type = (account.type || "default").toLowerCase();
  const gradient = GRADIENTS[type] || GRADIENTS.default;

  return (
    <div style={{
      background: gradient, borderRadius: 16, padding: "24px 24px 20px",
      width: 300, minHeight: 170, position: "relative", overflow: "hidden",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)", flexShrink: 0,
    }}>
      {/* Decorative circles */}
      <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
      <div style={{ position: "absolute", bottom: -30, right: 20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {account.type || "Account"}
          </div>
          <div style={{ color: "#fff", fontSize: 14, fontWeight: 600, marginTop: 2 }}>
            {account.bank || account.institution || "Zyrix Bank"}
          </div>
        </div>
        <span style={{ fontSize: 22 }}>{TYPE_ICONS[type] || "💳"}</span>
      </div>

      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, letterSpacing: "0.15em", marginBottom: 12 }}>
        {fmt.mask(account.account_number)}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>Balance</div>
          <div style={{ color: "#fff", fontSize: 22, fontWeight: 800, marginTop: 2 }}>{fmt.currency(account.balance)}</div>
        </div>
        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 11 }}>
          {account.status === "active"
            ? <span style={{ color: "#7fff7f" }}>● Active</span>
            : <span style={{ color: "#ff8080" }}>● {account.status}</span>}
        </div>
      </div>
    </div>
  );
}

// ── Account Detail Panel ──────────────────────────
function AccountDetail({ account, onClose }) {
  const { data: txData, loading: txLoading } = useApi(
    () => customerAPI.getTransactions({ account_id: account.id, limit: 10 }),
    [account.id]
  );
  const txList = txData?.data || txData?.items || txData || [];

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ color: C.text, fontSize: 18, fontWeight: 700, margin: 0 }}>
          {account.name || account.type} Account
        </h3>
        <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, fontSize: 20, cursor: "pointer" }}>×</button>
      </div>

      {/* Info grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        {[
          ["Account Number", fmt.mask(account.account_number)],
          ["Account Type", account.type || "—"],
          ["Bank / Institution", account.bank || account.institution || "—"],
          ["Currency", account.currency || "USD"],
          ["Status", account.status || "Active"],
          ["Opened Date", account.created_at ? fmt.date(account.created_at) : "—"],
          ["Available Balance", fmt.currency(account.available_balance ?? account.balance)],
          ["Credit Limit", account.credit_limit ? fmt.currency(account.credit_limit) : "—"],
        ].map(([label, val]) => (
          <div key={label} style={{ background: "#ffffff06", borderRadius: 8, padding: "12px 14px" }}>
            <div style={{ color: C.muted, fontSize: 11, marginBottom: 4 }}>{label}</div>
            <div style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Recent transactions */}
      <div>
        <h4 style={{ color: C.text, fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Recent Activity</h4>
        {txLoading ? (
          [1,2,3].map(i => <div key={i} style={{ marginBottom: 10 }}><Skeleton h={44} radius={8} /></div>)
        ) : txList.length === 0 ? (
          <p style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: "20px 0" }}>No transactions yet</p>
        ) : txList.map((tx, i) => {
          const isCredit = tx.amount > 0 || tx.type === "credit";
          return (
            <div key={tx.id || i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ background: isCredit ? `${C.green}20` : `${C.red}20`, borderRadius: 6, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", color: isCredit ? C.green : C.red, fontSize: 14 }}>
                  {isCredit ? "↓" : "↑"}
                </div>
                <div>
                  <div style={{ color: C.text, fontSize: 13 }}>{tx.description || tx.title}</div>
                  <div style={{ color: C.muted, fontSize: 11 }}>{fmt.date(tx.created_at || tx.date)}</div>
                </div>
              </div>
              <span style={{ color: isCredit ? C.green : C.red, fontSize: 13, fontWeight: 600 }}>
                {isCredit ? "+" : ""}{fmt.currency(Math.abs(tx.amount))}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Empty State ───────────────────────────────────
function EmptyAccounts() {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}>🏦</div>
      <div style={{ color: C.text, fontSize: 18, fontWeight: 600, marginBottom: 8 }}>No Accounts Linked</div>
      <div style={{ color: C.muted, fontSize: 14, maxWidth: 280, margin: "0 auto" }}>
        Your linked bank accounts and cards will appear here.
      </div>
    </div>
  );
}

// ── Stats Banner ──────────────────────────────────
function StatsBanner({ accounts }) {
  const totalBalance = accounts.reduce((s, a) => s + (a.balance ?? 0), 0);
  const activeCount = accounts.filter(a => a.status === "active" || !a.status).length;
  const creditAccounts = accounts.filter(a => (a.type || "").toLowerCase() === "credit");
  const totalCredit = creditAccounts.reduce((s, a) => s + (a.credit_limit ?? 0), 0);
  const usedCredit = creditAccounts.reduce((s, a) => s + (a.balance ?? 0), 0);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
      {[
        { label: "Net Balance", value: fmt.currency(totalBalance), icon: "💵", color: C.green },
        { label: "Active Accounts", value: activeCount, icon: "✅", color: C.blue },
        { label: "Total Credit Limit", value: totalCredit ? fmt.currency(totalCredit) : "—", icon: "💳", color: C.purple },
        { label: "Credit Used", value: totalCredit ? `${((usedCredit / totalCredit) * 100).toFixed(0)}%` : "—", icon: "📊", color: C.yellow },
      ].map(({ label, value, icon, color }) => (
        <div key={label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ color: C.muted, fontSize: 12 }}>{label}</span>
            <div style={{ background: `${color}20`, borderRadius: 6, padding: "4px 8px", fontSize: 14 }}>{icon}</div>
          </div>
          <div style={{ color: C.text, fontSize: 22, fontWeight: 800 }}>{value}</div>
        </div>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────
export default function AccountsPage() {
  const { data: raw, loading, error, refetch } = useApi(() => customerAPI.getAccounts());
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");

  const accounts = raw?.data || raw?.items || raw || [];
  const types = ["all", ...new Set(accounts.map(a => (a.type || "other").toLowerCase()))];
  const filtered = accounts.filter(a => filter === "all" || (a.type || "").toLowerCase() === filter);

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ color: C.text, fontSize: 24, fontWeight: 700, margin: 0 }}>My Accounts</h1>
          <p style={{ color: C.muted, fontSize: 14, margin: "4px 0 0" }}>{accounts.length} linked account{accounts.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={refetch} style={{ background: `${C.purple}20`, border: `1px solid ${C.purple}`, color: C.purpleLight, borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13 }}>
          ↻ Refresh
        </button>
      </div>

      {error && (
        <div style={{ background: `${C.red}15`, border: `1px solid ${C.red}30`, borderRadius: 8, padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: C.red, fontSize: 13 }}>⚠ {error}</span>
          <button onClick={refetch} style={{ color: C.purple, background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>Retry</button>
        </div>
      )}

      {/* Loading skeletons */}
      {loading ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
            {[1,2,3,4].map(i => <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}><Skeleton h={12} w="60%" /><div style={{marginTop:12}}><Skeleton h={24} w="80%" /></div></div>)}
          </div>
          <div style={{ display: "flex", gap: 20, marginBottom: 24, overflowX: "auto", paddingBottom: 8 }}>
            {[1,2].map(i => <div key={i} style={{ width: 300, minHeight: 170, background: C.border, borderRadius: 16 }} className="animate-pulse" />)}
          </div>
        </>
      ) : accounts.length === 0 ? (
        <EmptyAccounts />
      ) : (
        <>
          {/* Stats */}
          <StatsBanner accounts={accounts} />

          {/* Filter tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            {types.map(t => (
              <button key={t} onClick={() => { setFilter(t); setSelected(null); }}
                style={{ background: filter === t ? C.purple : C.card, border: `1px solid ${filter === t ? C.purple : C.border}`, color: filter === t ? "#fff" : C.muted, borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: 13, textTransform: "capitalize" }}>
                {t}
              </button>
            ))}
          </div>

          {/* Cards scroll */}
          <div style={{ display: "flex", gap: 20, marginBottom: 28, overflowX: "auto", paddingBottom: 8 }}>
            {filtered.map((acc, i) => (
              <div key={acc.id || i} onClick={() => setSelected(selected?.id === acc.id ? null : acc)}
                style={{ cursor: "pointer", outline: selected?.id === acc.id ? `2px solid ${C.purple}` : "none", borderRadius: 16, transition: "outline 0.15s" }}>
                <BankCard account={acc} />
              </div>
            ))}
          </div>

          {/* Detail panel */}
          {selected && (
            <AccountDetail account={selected} onClose={() => setSelected(null)} />
          )}

          {/* List view */}
          {!selected && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}`, background: "#ffffff06" }}>
                    {["Account", "Type", "Balance", "Available", "Status", ""].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: C.muted, fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((acc, i) => (
                    <tr key={acc.id || i} style={{ borderBottom: `1px solid ${C.border}` }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#ffffff05"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ color: C.text, fontSize: 14, fontWeight: 500 }}>{acc.name || acc.bank || "Account"}</div>
                        <div style={{ color: C.muted, fontSize: 12 }}>{fmt.mask(acc.account_number)}</div>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ background: `${C.purple}20`, color: C.purpleLight, borderRadius: 6, padding: "3px 8px", fontSize: 12, textTransform: "capitalize" }}>{acc.type || "—"}</span>
                      </td>
                      <td style={{ padding: "14px 16px", color: C.text, fontSize: 14, fontWeight: 600 }}>{fmt.currency(acc.balance)}</td>
                      <td style={{ padding: "14px 16px", color: C.muted, fontSize: 14 }}>{fmt.currency(acc.available_balance ?? acc.balance)}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ color: acc.status === "active" || !acc.status ? C.green : C.red, fontSize: 12, fontWeight: 600 }}>
                          {acc.status === "active" || !acc.status ? "● Active" : `● ${acc.status}`}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <button onClick={() => setSelected(acc)}
                          style={{ background: `${C.purple}20`, border: `1px solid ${C.purple}40`, color: C.purpleLight, borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 12 }}>
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );
}