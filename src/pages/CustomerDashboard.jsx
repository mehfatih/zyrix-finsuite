// ================================================================
// Zyrix FinSuite — Customer Dashboard (v2)
// Integrates: Overview, Transactions, InvestmentsPage, AccountsPage, Profile
// ================================================================

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useApi } from "../hooks/useApi";
import { customerAPI } from "../services/api";
import { Skeleton, EmptyState, ErrorBanner, LineChart, GlobalStyles, C } from "../components/ui";
import InvestmentsPage from "./InvestmentsPage";
import AccountsPage from "./AccountsPage";

const fmt = {
  currency: (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n ?? 0),
  pct: (n) => `${(n ?? 0) >= 0 ? "+" : ""}${(n ?? 0).toFixed(2)}%`,
  date: (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
};

function StatCard({ label, value, change, icon, loading, color = C.purple }) {
  const positive = (change ?? 0) >= 0;
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <span style={{ color: C.muted, fontSize: 12, fontWeight: 500 }}>{label}</span>
        <div style={{ background: `${color}20`, borderRadius: 8, padding: "6px 8px", fontSize: 15 }}>{icon}</div>
      </div>
      {loading
        ? <><Skeleton w="65%" h={26} /><div style={{ marginTop: 8 }}><Skeleton w="40%" h={12} /></div></>
        : <>
          <div style={{ color: C.text, fontSize: 24, fontWeight: 800, marginBottom: 5 }}>{value ?? "—"}</div>
          {change !== undefined && (
            <div style={{ fontSize: 12, fontWeight: 600, color: positive ? C.green : C.red }}>
              {positive ? "▲" : "▼"} {Math.abs(change).toFixed(1)}% vs last month
            </div>
          )}
        </>}
    </div>
  );
}

function TxRow({ tx }) {
  const isCredit = tx.type === "credit" || tx.amount > 0;
  const statusColor = { completed: C.green, pending: C.yellow, failed: C.red }[tx.status] || C.muted;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: `1px solid ${C.border}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ background: isCredit ? `${C.green}20` : `${C.red}20`, borderRadius: 8, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", color: isCredit ? C.green : C.red, fontSize: 14 }}>
          {isCredit ? "↓" : "↑"}
        </div>
        <div>
          <div style={{ color: C.text, fontSize: 13, fontWeight: 500 }}>{tx.description || tx.title || "Transaction"}</div>
          <div style={{ color: C.muted, fontSize: 11 }}>{fmt.date(tx.created_at || tx.date)}</div>
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ color: isCredit ? C.green : C.red, fontSize: 13, fontWeight: 700 }}>
          {isCredit ? "+" : ""}{fmt.currency(Math.abs(tx.amount))}
        </div>
        <div style={{ color: statusColor, fontSize: 10, fontWeight: 600, textTransform: "capitalize" }}>{tx.status}</div>
      </div>
    </div>
  );
}

function OverviewSection({ onNavigate }) {
  const { data: stats, loading: statsL, error: statsErr, refetch } = useApi(() => customerAPI.getStats());
  const { data: txData, loading: txL } = useApi(() => customerAPI.getTransactions({ limit: 6 }));
  const { data: invData, loading: invL } = useApi(() => customerAPI.getInvestments());
  const { data: portfolio } = useApi(() => customerAPI.getPortfolio());

  const txList = txData?.data || txData?.items || txData || [];
  const invList = invData?.data || invData?.items || invData || [];
  const totalInvValue = invList.reduce((s, i) => s + (i.value ?? i.current_value ?? 0), 0);
  const chartData = txList.slice().reverse().map(tx => Math.abs(tx.amount ?? 0));

  return (
    <div>
      <h1 style={{ color: C.text, fontSize: 24, fontWeight: 700, margin: "0 0 4px" }}>Dashboard</h1>
      <p style={{ color: C.muted, fontSize: 14, margin: "0 0 24px" }}>Welcome back — here's your financial overview</p>

      {statsErr && <ErrorBanner message={statsErr} onRetry={refetch} />}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Balance" value={fmt.currency(stats?.total_balance ?? portfolio?.balance)} change={stats?.balance_change} icon="💰" loading={statsL} color={C.purple} />
        <StatCard label="Portfolio Value" value={fmt.currency(stats?.portfolio_value ?? totalInvValue)} change={stats?.portfolio_change} icon="📊" loading={statsL} color={C.blue} />
        <StatCard label="Monthly Income" value={fmt.currency(stats?.monthly_income)} change={stats?.income_change} icon="💳" loading={statsL} color={C.green} />
        <StatCard label="Monthly Spend" value={fmt.currency(stats?.monthly_spend)} change={stats?.spend_change} icon="🛍️" loading={statsL} color={C.yellow} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20, marginBottom: 20 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
          <h3 style={{ color: C.text, fontSize: 15, fontWeight: 600, margin: "0 0 16px" }}>Transaction Activity</h3>
          {txL ? <Skeleton h={140} radius={8} />
            : chartData.length > 1
              ? <LineChart data={chartData} width={420} height={140} color={C.purple} />
              : <EmptyState icon="📉" title="Not enough data" description="Make more transactions to see your chart" />}
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ color: C.text, fontSize: 15, fontWeight: 600, margin: 0 }}>Recent Transactions</h3>
            <button onClick={() => onNavigate("transactions")} style={{ background: "none", border: "none", color: C.purple, fontSize: 12, cursor: "pointer", fontWeight: 600 }}>View all →</button>
          </div>
          {txL ? [1,2,3,4].map(i => <div key={i} style={{ marginBottom: 10 }}><Skeleton h={40} radius={8} /></div>)
            : txList.length === 0 ? <EmptyState icon="📭" title="No transactions" description="Your recent transactions will appear here" />
            : txList.slice(0, 5).map((tx, i) => <TxRow key={tx.id || i} tx={tx} />)}
        </div>
      </div>

      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ color: C.text, fontSize: 15, fontWeight: 600, margin: 0 }}>Top Investments</h3>
          <button onClick={() => onNavigate("investments")} style={{ background: "none", border: "none", color: C.purple, fontSize: 12, cursor: "pointer", fontWeight: 600 }}>View all →</button>
        </div>
        {invL ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
            {[1,2,3,4].map(i => <Skeleton key={i} h={60} radius={8} />)}
          </div>
        ) : invList.length === 0 ? (
          <EmptyState icon="📈" title="No investments" description="Your investment portfolio will appear here" />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
            {invList.slice(0, 4).map((inv, i) => {
              const isUp = (inv.change_pct ?? inv.change ?? 0) >= 0;
              return (
                <div key={inv.id || i} style={{ background: "#ffffff06", borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ color: C.muted, fontSize: 11, marginBottom: 4 }}>{inv.symbol || inv.name}</div>
                  <div style={{ color: C.text, fontSize: 15, fontWeight: 700 }}>{fmt.currency(inv.value ?? inv.current_value)}</div>
                  <div style={{ color: isUp ? C.green : C.red, fontSize: 12, marginTop: 2, fontWeight: 600 }}>
                    {isUp ? "▲" : "▼"} {fmt.pct(inv.change_pct ?? inv.change)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function TransactionsSection() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const { data, loading, error, refetch } = useApi(
    () => customerAPI.getTransactions({ search, type: type !== "all" ? type : undefined, limit: 30 }),
    [search, type]
  );
  const list = data?.data || data?.items || data || [];

  return (
    <div>
      <h1 style={{ color: C.text, fontSize: 24, fontWeight: 700, margin: "0 0 4px" }}>Transactions</h1>
      <p style={{ color: C.muted, fontSize: 14, margin: "0 0 20px" }}>Your full transaction history</p>
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search transactions..."
          style={{ flex: 1, background: C.card, border: `1px solid ${C.border}`, color: C.text, borderRadius: 8, padding: "10px 14px", fontSize: 14, outline: "none" }} />
        {["all", "credit", "debit"].map(t => (
          <button key={t} onClick={() => setType(t)}
            style={{ background: type === t ? C.purple : C.card, border: `1px solid ${type === t ? C.purple : C.border}`, color: type === t ? "#fff" : C.muted, borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13, textTransform: "capitalize" }}>
            {t}
          </button>
        ))}
      </div>
      {error && <ErrorBanner message={error} onRetry={refetch} />}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px" }}>
        <div style={{ color: C.muted, fontSize: 12, marginBottom: 12 }}>{list.length} transactions</div>
        {loading ? [1,2,3,4,5,6].map(i => <div key={i} style={{ marginBottom: 10 }}><Skeleton h={48} radius={8} /></div>)
          : list.length === 0 ? <EmptyState icon="📭" title="No transactions found" description="Try changing your search or filter" />
          : list.map((tx, i) => <TxRow key={tx.id || i} tx={tx} />)}
      </div>
    </div>
  );
}

function ProfileSection() {
  const { user } = useAuth();
  const { data: profile, loading } = useApi(() => customerAPI.getProfile());
  const p = { ...user, ...(profile || {}) };
  return (
    <div>
      <h1 style={{ color: C.text, fontSize: 24, fontWeight: 700, margin: "0 0 20px" }}>My Profile</h1>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, maxWidth: 520 }}>
        {loading ? [1,2,3,4,5].map(i => <div key={i} style={{ marginBottom: 10 }}><Skeleton h={40} radius={8} /></div>)
          : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                <div style={{ background: `linear-gradient(135deg, ${C.purple}, #3A1F9E)`, borderRadius: "50%", width: 60, height: 60, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 22, fontWeight: 800 }}>
                  {(p.name || p.email || "U")[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ color: C.text, fontSize: 18, fontWeight: 700 }}>{p.name || "Customer"}</div>
                  <div style={{ color: C.muted, fontSize: 13 }}>{p.email}</div>
                </div>
              </div>
              {[["Full Name", p.name], ["Email Address", p.email], ["Phone", p.phone], ["Country", p.country],
                ["Member Since", p.created_at ? new Date(p.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : "—"]
              ].map(([label, val]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ color: C.muted, fontSize: 13 }}>{label}</span>
                  <span style={{ color: C.text, fontSize: 13, fontWeight: 500 }}>{val || "—"}</span>
                </div>
              ))}
            </>
          )}
      </div>
    </div>
  );
}

function Sidebar({ active, onChange, user, onLogout }) {
  const NAV = [
    { id: "overview",     label: "Overview",     icon: "⊞" },
    { id: "transactions", label: "Transactions",  icon: "⇄" },
    { id: "investments",  label: "Investments",   icon: "📈" },
    { id: "accounts",     label: "Accounts",      icon: "🏦" },
    { id: "profile",      label: "Profile",       icon: "👤" },
  ];
  return (
    <aside style={{ background: C.sidebar, borderRight: `1px solid ${C.border}`, width: 232, minHeight: "100vh", display: "flex", flexDirection: "column", padding: "20px 14px", gap: 2 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 32, padding: "0 6px" }}>
        <div style={{ background: `linear-gradient(135deg, ${C.purple}, #3A1F9E)`, borderRadius: 9, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>Z</span>
        </div>
        <div>
          <div style={{ color: C.text, fontWeight: 700, fontSize: 15, lineHeight: 1.1 }}>Zyrix</div>
          <div style={{ color: C.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>FinSuite</div>
        </div>
      </div>
      {NAV.map(item => {
        const isActive = active === item.id;
        return (
          <button key={item.id} onClick={() => onChange(item.id)} style={{
            background: isActive ? `${C.purple}22` : "transparent",
            border: `1px solid ${isActive ? C.purple : "transparent"}`,
            borderRadius: 9, color: isActive ? C.purpleLight : C.muted,
            padding: "9px 12px", cursor: "pointer", textAlign: "left",
            display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 500,
          }}
            onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#ffffff08"; }}
            onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.label}
          </button>
        );
      })}
      <div style={{ marginTop: "auto", paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10, padding: "0 4px" }}>
          <div style={{ background: C.purple, borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
            {(user?.name || user?.email || "U")[0].toUpperCase()}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ color: C.text, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name || "Customer"}</div>
            <div style={{ color: C.muted, fontSize: 11, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.email}</div>
          </div>
        </div>
        <button onClick={onLogout} style={{ width: "100%", background: `${C.red}15`, border: `1px solid ${C.red}30`, color: C.red, borderRadius: 8, padding: "8px 0", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const [section, setSection] = useState("overview");

  const pages = {
    overview:     <OverviewSection onNavigate={setSection} />,
    transactions: <TransactionsSection />,
    investments:  <InvestmentsPage />,
    accounts:     <AccountsPage />,
    profile:      <ProfileSection />,
  };

  return (
    <>
      <GlobalStyles />
      <div style={{ background: C.bg, minHeight: "100vh", display: "flex", fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
        <Sidebar active={section} onChange={setSection} user={user} onLogout={logout} />
        <main style={{ flex: 1, padding: "32px 36px", overflow: "auto" }}>
          {pages[section] || pages.overview}
        </main>
      </div>
    </>
  );
}