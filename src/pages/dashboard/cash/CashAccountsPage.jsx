// ================================================================
// Cash Accounts — multi-currency balance grid + KPIs
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getMoneyPalette,
  getCustomerPalette,
  getReportsPalette,
  getSuccessPalette,
  getBrandPalette,
  getPaletteById,
  paletteSequence,
} from "../../../utils/dashboardPalette";
import PageHeader, { PageHeaderButton } from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import Card from "../../../components/dashboard/Card";
import EmptyState from "../../../components/dashboard/EmptyState";
import { Sparkline } from "../../../components/dashboard/charts";
import CurrencyConverter from "../../../components/dashboard/cash/CurrencyConverter";
import { localStore, KEYS, ensureAccountSeed, fmtCurrencyExact, convertFx } from "./cashApi";

// Generate a 30-day fake sparkline per account so the cards feel alive
function fakeSpark(seed = 1) {
  const out = [];
  let v = 100;
  for (let i = 0; i < 30; i++) {
    v += (Math.sin(i * 0.4 + seed) * 10) + (Math.random() - 0.5) * 6;
    out.push(Math.max(50, v));
  }
  return out;
}

export default function CashAccountsPage({ onNavigate }) {
  const { lang } = useI18n();
  const t = useDashboardI18n("cash");
  const money = getMoneyPalette();
  const customer = getCustomerPalette();
  const reports = getReportsPalette();
  const success = getSuccessPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const [accounts, setAccounts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({ name: "", currency: "TRY", balance: 0, type: "BANK", bank: "", paletteId: "teal" });

  const reload = () => setAccounts(localStore.list(KEYS.cashAccounts));
  useEffect(() => {
    ensureAccountSeed();
    reload();
  }, []);

  const totals = useMemo(() => {
    const totalTry = accounts.reduce((s, a) => s + convertFx(a.balance, a.currency, "TRY"), 0);
    const totalTxnsMonth = localStore.list(KEYS.cashTxn).filter((x) => {
      const d = new Date(x.date || 0);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    // FX gain/loss vs nominal — simple snapshot
    const fxGain = accounts
      .filter((a) => a.currency !== "TRY")
      .reduce((s, a) => s + (convertFx(a.balance, a.currency, "TRY") - a.balance), 0);
    return { totalTry, accounts: accounts.length, txns: totalTxnsMonth, fx: fxGain };
  }, [accounts]);

  const palettes = paletteSequence(accounts.length, { exclude: ["wine"] });

  const submit = () => {
    if (!draft.name) return;
    localStore.add(KEYS.cashAccounts, { ...draft, balance: Number(draft.balance) || 0 });
    setDraft({ name: "", currency: "TRY", balance: 0, type: "BANK", bank: "", paletteId: "teal" });
    setShowForm(false);
    reload();
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={t("accounts.title")}
        subtitle={t("accounts.subtitle")}
        icon="💼"
        palette={money}
        actions={
          <PageHeaderButton palette={brand} variant="primary" icon="＋" onClick={() => setShowForm((v) => !v)}>
            {t("accounts.new")}
          </PageHeaderButton>
        }
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
        className="cash-kpi-grid"
      >
        <KpiCard label={t("accounts.kpi.total")} value={Math.round(totals.totalTry)} prefix="₺" palette={money} icon="💰" />
        <KpiCard label={t("accounts.kpi.accounts")} value={totals.accounts} palette={customer} icon="🏦" />
        <KpiCard label={t("accounts.kpi.transactions")} value={totals.txns} palette={reports} icon="🔁" />
        <KpiCard label={t("accounts.kpi.fx")} value={Math.round(totals.fx)} prefix="₺" palette={success} icon="💱" />
      </div>

      {showForm && (
        <Card palette={money} title={t("accounts.new")} icon="＋" style={{ marginBottom: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
            <Field label="Name">
              <input type="text" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} style={input(money)} />
            </Field>
            <Field label="Bank">
              <input type="text" value={draft.bank} onChange={(e) => setDraft({ ...draft, bank: e.target.value })} style={input(money)} />
            </Field>
            <Field label="Currency">
              <select value={draft.currency} onChange={(e) => setDraft({ ...draft, currency: e.target.value })} style={input(money)}>
                <option value="TRY">TRY ₺</option>
                <option value="USD">USD $</option>
                <option value="EUR">EUR €</option>
                <option value="GBP">GBP £</option>
              </select>
            </Field>
            <Field label="Type">
              <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })} style={input(money)}>
                <option value="BANK">{t("accounts.type.BANK")}</option>
                <option value="PETTY">{t("accounts.type.PETTY")}</option>
                <option value="SAVINGS">{t("accounts.type.SAVINGS")}</option>
              </select>
            </Field>
            <Field label="Initial Balance">
              <input type="number" min="0" value={draft.balance} onChange={(e) => setDraft({ ...draft, balance: e.target.value })} style={{ ...input(money), fontFamily: "monospace", textAlign: "end" }} />
            </Field>
          </div>
          <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" onClick={() => setShowForm(false)} style={btn(money, "secondary")}>{t("common.cancel")}</button>
            <button type="button" onClick={submit} style={btn(success, "primary")}>✓ {t("common.save")}</button>
          </div>
        </Card>
      )}

      {accounts.length === 0 ? (
        <EmptyState title={t("accounts.empty")} icon="💼" palette={money} />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 14,
            marginBottom: 18,
          }}
        >
          {accounts.map((a, i) => {
            const palette = a.paletteId ? getPaletteById(a.paletteId) : palettes[i] || customer;
            const txnCount = localStore.list(KEYS.cashTxn).filter((x) => x.accountId === a.id).length;
            const sparkData = fakeSpark(i + 1);
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => onNavigate && onNavigate("cash-account-detail", { id: a.id })}
                style={{
                  background: "#fff",
                  border: `1.5px solid ${palette.base}30`,
                  borderRadius: 16,
                  padding: 16,
                  textAlign: "start",
                  cursor: "pointer",
                  transition: "transform .15s, box-shadow .15s",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = `0 12px 28px ${palette.base}30`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                <div style={{ position: "absolute", top: 0, insetInlineEnd: 0, padding: "5px 12px", background: palette.base, color: "#fff", fontSize: 10, fontWeight: 800, borderBottomLeftRadius: 12 }}>
                  {a.currency}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: `linear-gradient(135deg, ${palette.base}, ${palette.dark})`,
                      color: "#fff",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 18,
                      flexShrink: 0,
                    }}
                  >
                    {a.type === "PETTY" ? "💵" : a.type === "SAVINGS" ? "🏛️" : "🏦"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</div>
                    <div style={{ fontSize: 11, color: "#64748B" }}>{a.bank || t(`accounts.type.${a.type || "BANK"}`)}</div>
                  </div>
                </div>
                <div style={{ fontSize: 10, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>
                  {t("accounts.card.balance")}
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: palette.base, fontFamily: "monospace", marginBottom: 4 }}>
                  {fmtCurrencyExact(a.balance, a.currency)}
                </div>
                {a.currency !== "TRY" && (
                  <div style={{ fontSize: 11, color: "#64748B", marginBottom: 8 }}>
                    ≈ {fmtCurrencyExact(convertFx(a.balance, a.currency, "TRY"), "TRY")}
                  </div>
                )}
                <div style={{ marginTop: 6 }}>
                  <Sparkline data={sparkData} palette={palette} height={32} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "#94A3B8" }}>
                  <span>{t("accounts.card.txnCount").replace("{n}", txnCount)}</span>
                  <span>{t("accounts.card.last30")}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <Card palette={money} title={t("fx.title")} icon="💱">
        <CurrencyConverter t={t} />
      </Card>

      <style>{`@media (max-width: 720px) { .cash-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; } }`}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "block" }}>
      <div style={{ fontSize: 11, color: "#475569", fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {children}
    </label>
  );
}
function input(palette) {
  return {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: `1px solid ${palette.base}25`,
    background: "#fff",
    fontSize: 13,
    color: "#0F172A",
    outline: "none",
    boxSizing: "border-box",
  };
}
function btn(palette, variant) {
  if (variant === "primary") {
    return {
      background: `linear-gradient(135deg, ${palette.base}, ${palette.dark})`,
      color: "#fff",
      border: "none",
      padding: "10px 18px",
      borderRadius: 10,
      fontSize: 13,
      fontWeight: 800,
      cursor: "pointer",
      boxShadow: `0 4px 12px ${palette.base}40`,
    };
  }
  return {
    background: "#fff",
    color: palette.dark,
    border: `1px solid ${palette.base}30`,
    padding: "10px 18px",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  };
}
