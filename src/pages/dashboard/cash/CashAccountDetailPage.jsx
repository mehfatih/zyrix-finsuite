// ================================================================
// Cash Account Detail — txn ledger + add txn + transfer + FX
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getMoneyPalette,
  getCustomerPalette,
  getSuccessPalette,
  getAlertPalette,
  getReportsPalette,
  getBrandPalette,
  getPaletteById,
} from "../../../utils/dashboardPalette";
import PageHeader, { PageHeaderButton } from "../../../components/dashboard/PageHeader";
import Card from "../../../components/dashboard/Card";
import EmptyState from "../../../components/dashboard/EmptyState";
import { AreaChart } from "../../../components/dashboard/charts";
import CurrencyConverter from "../../../components/dashboard/cash/CurrencyConverter";
import { localStore, KEYS, fmtCurrencyExact, fmtDate, convertFx } from "./cashApi";

export default function CashAccountDetailPage({ accountId, onNavigate }) {
  const { lang } = useI18n();
  const t = useDashboardI18n("cash");
  const money = getMoneyPalette();
  const customer = getCustomerPalette();
  const success = getSuccessPalette();
  const alert = getAlertPalette();
  const reports = getReportsPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const [account, setAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [txns, setTxns] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [draft, setDraft] = useState({ type: "IN", amount: 0, description: "", date: new Date().toISOString().slice(0, 10) });
  const [transfer, setTransfer] = useState({ toId: "", amount: 0, date: new Date().toISOString().slice(0, 10) });

  const reload = () => {
    setAccount(localStore.get(KEYS.cashAccounts, accountId));
    setAccounts(localStore.list(KEYS.cashAccounts));
    setTxns(localStore.list(KEYS.cashTxn).filter((x) => x.accountId === accountId));
  };

  useEffect(() => {
    if (!accountId) return;
    reload();
  }, [accountId]);

  const palette = account?.paletteId ? getPaletteById(account.paletteId) : money;

  const sortedTxns = useMemo(() => txns.slice().sort((a, b) => new Date(b.date) - new Date(a.date)), [txns]);

  // Build ledger with running balance
  const ledger = useMemo(() => {
    const arr = [...sortedTxns].reverse();
    let bal = 0;
    const withBal = arr.map((tx) => {
      const sign = tx.type === "OUT" || (tx.type === "TRANSFER" && tx.transferDirection === "OUT") ? -1 : 1;
      bal += sign * (Number(tx.amount) || 0);
      return { ...tx, balanceAfter: bal };
    });
    return withBal.reverse();
  }, [sortedTxns]);

  const trend = useMemo(() => {
    const days = 30;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const buckets = Array.from({ length: days }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (days - 1 - i));
      const key = d.toISOString().slice(0, 10);
      return { key, label: d.getDate().toString(), value: 0 };
    });
    txns.forEach((tx) => {
      const k = String(tx.date || "").slice(0, 10);
      const b = buckets.find((x) => x.key === k);
      if (b) {
        const sign = tx.type === "OUT" ? -1 : 1;
        b.value += sign * (Number(tx.amount) || 0);
      }
    });
    // Cumulative
    let cum = 0;
    buckets.forEach((b) => {
      cum += b.value;
      b.value = cum;
    });
    return buckets;
  }, [txns]);

  const submitTxn = () => {
    if (Number(draft.amount) <= 0) return;
    localStore.add(KEYS.cashTxn, { ...draft, accountId, amount: Number(draft.amount), date: new Date(draft.date).toISOString() });
    // Update balance
    const sign = draft.type === "OUT" ? -1 : 1;
    localStore.update(KEYS.cashAccounts, accountId, { balance: (Number(account.balance) || 0) + sign * Number(draft.amount) });
    setDraft({ type: "IN", amount: 0, description: "", date: new Date().toISOString().slice(0, 10) });
    setShowAdd(false);
    reload();
  };

  const submitTransfer = () => {
    if (!transfer.toId || Number(transfer.amount) <= 0) return;
    const target = localStore.get(KEYS.cashAccounts, transfer.toId);
    if (!target) return;
    const fxAmount = convertFx(transfer.amount, account.currency, target.currency);
    const ts = new Date(transfer.date).toISOString();
    // Outflow from source
    localStore.add(KEYS.cashTxn, {
      accountId,
      type: "TRANSFER",
      transferDirection: "OUT",
      amount: Number(transfer.amount),
      description: `→ ${target.name}`,
      date: ts,
    });
    localStore.update(KEYS.cashAccounts, accountId, { balance: (Number(account.balance) || 0) - Number(transfer.amount) });
    // Inflow to target
    localStore.add(KEYS.cashTxn, {
      accountId: target.id,
      type: "TRANSFER",
      transferDirection: "IN",
      amount: fxAmount,
      description: `← ${account.name}`,
      date: ts,
    });
    localStore.update(KEYS.cashAccounts, target.id, { balance: (Number(target.balance) || 0) + fxAmount });
    setTransfer({ toId: "", amount: 0, date: new Date().toISOString().slice(0, 10) });
    setShowTransfer(false);
    reload();
  };

  const exportCsv = () => {
    const rows = ["Date,Description,Type,Amount,Balance"];
    ledger.forEach((tx) => {
      rows.push(`${tx.date},${(tx.description || "").replace(/,/g, " ")},${tx.type},${tx.amount},${tx.balanceAfter}`);
    });
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${account.name}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!account) return <div style={{ padding: 40, textAlign: "center", color: "#94A3B8" }}>{t("common.loading")}</div>;

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={account.name}
        subtitle={`${account.bank || t(`accounts.type.${account.type}`)} · ${account.currency}`}
        icon="💼"
        palette={palette}
        breadcrumb={[
          { label: t("accounts.title"), href: "#cash-accounts" },
          { label: account.name },
        ]}
        actions={
          <PageHeaderButton palette={palette} variant="ghost" onClick={() => onNavigate && onNavigate("cash-accounts")}>
            ←
          </PageHeaderButton>
        }
      />

      {/* Hero balance */}
      <div
        style={{
          background: `linear-gradient(135deg, ${palette.bg}, ${palette.base}25)`,
          border: `1px solid ${palette.base}30`,
          borderRadius: 18,
          padding: 22,
          marginBottom: 18,
          display: "flex",
          gap: 18,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: palette.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {t("account.detail.balance")}
          </div>
          <div style={{ fontSize: 38, fontWeight: 900, color: palette.base, fontFamily: "monospace", letterSpacing: "-0.02em" }}>
            {fmtCurrencyExact(account.balance, account.currency)}
          </div>
          {account.currency !== "TRY" && (
            <div style={{ fontSize: 13, color: "#64748B" }}>
              ≈ {fmtCurrencyExact(convertFx(account.balance, account.currency, "TRY"), "TRY")}
            </div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <AreaChart data={trend} palette={palette} height={120} showAxis={false} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <PageHeaderButton palette={brand} variant="primary" icon="＋" onClick={() => setShowAdd((v) => !v)}>
            {t("account.detail.add")}
          </PageHeaderButton>
          <PageHeaderButton palette={customer} variant="secondary" icon="↔" onClick={() => setShowTransfer((v) => !v)}>
            {t("account.detail.transfer")}
          </PageHeaderButton>
          <PageHeaderButton palette={reports} variant="secondary" icon="⬇" onClick={exportCsv}>
            {t("account.detail.export")}
          </PageHeaderButton>
        </div>
      </div>

      {showAdd && (
        <Card palette={palette} title={t("account.detail.add.title")} icon="＋" style={{ marginBottom: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
            <Field label={t("account.detail.field.type")}>
              <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })} style={input(palette)}>
                <option value="IN">{t("account.detail.txn.IN")}</option>
                <option value="OUT">{t("account.detail.txn.OUT")}</option>
              </select>
            </Field>
            <Field label={t("account.detail.field.amount")}>
              <input
                type="number"
                min="0"
                step="0.01"
                value={draft.amount}
                onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
                style={{ ...input(palette), fontFamily: "monospace", textAlign: "end" }}
              />
            </Field>
            <Field label={t("account.detail.field.date")}>
              <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} style={input(palette)} />
            </Field>
            <Field label={t("account.detail.field.desc")}>
              <input type="text" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} style={input(palette)} />
            </Field>
          </div>
          <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" onClick={() => setShowAdd(false)} style={btn(palette, "secondary")}>{t("common.cancel")}</button>
            <button type="button" onClick={submitTxn} style={btn(success, "primary")}>✓ {t("common.save")}</button>
          </div>
        </Card>
      )}

      {showTransfer && (
        <Card palette={customer} title={t("account.detail.transfer.title")} icon="↔" style={{ marginBottom: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
            <Field label={t("account.detail.field.from")}>
              <input type="text" value={`${account.name} (${account.currency})`} readOnly style={{ ...input(customer), background: "#F8FAFC" }} />
            </Field>
            <Field label={t("account.detail.field.to")}>
              <select value={transfer.toId} onChange={(e) => setTransfer({ ...transfer, toId: e.target.value })} style={input(customer)}>
                <option value="">—</option>
                {accounts.filter((a) => a.id !== accountId).map((a) => (
                  <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>
                ))}
              </select>
            </Field>
            <Field label={t("account.detail.field.amount")}>
              <input
                type="number"
                min="0"
                step="0.01"
                value={transfer.amount}
                onChange={(e) => setTransfer({ ...transfer, amount: e.target.value })}
                style={{ ...input(customer), fontFamily: "monospace", textAlign: "end" }}
              />
            </Field>
            <Field label={t("account.detail.field.date")}>
              <input type="date" value={transfer.date} onChange={(e) => setTransfer({ ...transfer, date: e.target.value })} style={input(customer)} />
            </Field>
          </div>
          {transfer.toId && (() => {
            const target = accounts.find((a) => a.id === transfer.toId);
            if (!target) return null;
            const conv = convertFx(transfer.amount, account.currency, target.currency);
            return (
              <div style={{ marginTop: 10, padding: "8px 12px", background: customer.bg, borderRadius: 10, fontSize: 12, color: customer.dark, fontWeight: 700 }}>
                {fmtCurrencyExact(transfer.amount, account.currency)} → {fmtCurrencyExact(conv, target.currency)}
              </div>
            );
          })()}
          <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" onClick={() => setShowTransfer(false)} style={btn(customer, "secondary")}>{t("common.cancel")}</button>
            <button type="button" onClick={submitTransfer} style={btn(customer, "primary")}>↔ {t("account.detail.transfer")}</button>
          </div>
        </Card>
      )}

      <Card palette={palette} title={t("account.detail.txn.title")} icon="📋" style={{ marginBottom: 18 }}>
        {ledger.length === 0 ? (
          <EmptyState title={t("account.detail.txn.empty")} icon="📋" palette={palette} />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: palette.bg }}>
                  <th style={th}>{t("account.detail.col.date")}</th>
                  <th style={th}>{t("account.detail.col.desc")}</th>
                  <th style={th}>{t("account.detail.col.type")}</th>
                  <th style={{ ...th, textAlign: "end" }}>{t("account.detail.col.amount")}</th>
                  <th style={{ ...th, textAlign: "end" }}>{t("account.detail.col.balance")}</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((tx) => {
                  const isOut = tx.type === "OUT" || (tx.type === "TRANSFER" && tx.transferDirection === "OUT");
                  const sign = isOut ? "-" : "+";
                  const palette = isOut ? alert : success;
                  return (
                    <tr key={tx.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ ...td, color: "#64748B", fontSize: 12 }}>{fmtDate(tx.date, lang)}</td>
                      <td style={td}>{tx.description || "—"}</td>
                      <td style={td}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: palette.bg, color: palette.dark }}>
                          {t(`account.detail.txn.${tx.type}`)}
                        </span>
                      </td>
                      <td style={{ ...td, textAlign: "end", fontFamily: "monospace", fontWeight: 700, color: palette.base }}>
                        {sign}{fmtCurrencyExact(tx.amount, account.currency)}
                      </td>
                      <td style={{ ...td, textAlign: "end", fontFamily: "monospace", color: "#475569" }}>
                        {fmtCurrencyExact(tx.balanceAfter, account.currency)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card palette={money} title={t("fx.title")} icon="💱">
        <CurrencyConverter defaultFrom={account.currency} defaultTo="TRY" t={t} />
      </Card>
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

const th = {
  textAlign: "start",
  padding: "10px 12px",
  fontSize: 11,
  fontWeight: 800,
  color: "#475569",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};
const td = { padding: "10px 12px", color: "#0F172A" };
