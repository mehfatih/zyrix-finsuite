// ================================================================
// ReconciliationMatcher — split-pane matcher with AI suggestions
// Left: bank statement rows. Right: open invoices. Confidence-scored
// auto-matches highlighted in emerald. Mismatches in rose.
// ================================================================
import React, { useMemo, useState } from "react";
import {
  getCustomerPalette,
  getMoneyPalette,
  getSuccessPalette,
  getAlertPalette,
  getReportsPalette,
} from "../../../utils/dashboardPalette";
import { fmtCurrencyExact, fmtDate } from "../../../pages/dashboard/cash/cashApi";

// Confidence: amount match weight + date proximity weight
function scoreMatch(stmt, invoice) {
  const a = Math.abs((Number(stmt.amount) || 0) - (Number(invoice.total) || 0));
  const amtPct = Math.min(1, a / Math.max(1, Math.abs(Number(invoice.total) || 1)));
  const amtScore = Math.max(0, 1 - amtPct * 4); // amount within 25% → 0-1
  const days = Math.abs(new Date(stmt.date).getTime() - new Date(invoice.dueDate || invoice.createdAt).getTime()) / 86400000;
  const dateScore = Math.max(0, 1 - days / 30);
  // Bias if direction matches (positive amount = inflow → matches sales invoice)
  const dirBias = Number(stmt.amount) > 0 ? 0.05 : 0;
  return Math.round((amtScore * 0.7 + dateScore * 0.3 + dirBias) * 100);
}

export default function ReconciliationMatcher({
  statementRows = [],
  invoices = [],
  onMatch,
  lang = "TR",
  t = (s) => s,
}) {
  const customer = getCustomerPalette();
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const alert = getAlertPalette();
  const reports = getReportsPalette();

  const [matches, setMatches] = useState([]);
  const [stmtSel, setStmtSel] = useState(null);
  const [invSel, setInvSel] = useState(null);
  const [filter, setFilter] = useState("UNMATCHED");

  const matchedStmt = new Set(matches.map((m) => m.stmtId));
  const matchedInv = new Set(matches.map((m) => m.invId));

  const suggestions = useMemo(() => {
    const out = [];
    statementRows.forEach((s) => {
      if (matchedStmt.has(s.id)) return;
      let best = null;
      invoices.forEach((inv) => {
        if (matchedInv.has(inv.id)) return;
        const sc = scoreMatch(s, inv);
        if (!best || sc > best.score) best = { invoice: inv, score: sc };
      });
      if (best && best.score >= 65) {
        out.push({ stmt: s, invoice: best.invoice, score: best.score });
      }
    });
    return out;
  }, [statementRows, invoices, matchedStmt, matchedInv]);

  const filteredStmt = useMemo(() => {
    if (filter === "MATCHED") return statementRows.filter((s) => matchedStmt.has(s.id));
    if (filter === "ALL") return statementRows;
    return statementRows.filter((s) => !matchedStmt.has(s.id));
  }, [statementRows, filter, matchedStmt]);

  const matchPair = (stmtId, invId, source = "manual") => {
    const stmt = statementRows.find((s) => s.id === stmtId);
    const inv = invoices.find((i) => i.id === invId);
    if (!stmt || !inv) return;
    const score = scoreMatch(stmt, inv);
    setMatches((arr) => [...arr, { stmtId, invId, score, source, at: new Date().toISOString() }]);
    setStmtSel(null);
    setInvSel(null);
    onMatch && onMatch({ stmtId, invId, score, source });
  };

  const acceptAllSuggestions = () => {
    suggestions.filter((s) => s.score >= 90).forEach((s) => matchPair(s.stmt.id, s.invoice.id, "ai"));
  };

  const removeMatch = (stmtId) => {
    setMatches((arr) => arr.filter((m) => m.stmtId !== stmtId));
  };

  return (
    <div>
      {suggestions.length > 0 && (
        <div
          style={{
            background: `linear-gradient(135deg, ${reports.bg}, ${success.bg})`,
            border: `1px solid ${reports.base}30`,
            borderRadius: 14,
            padding: "12px 16px",
            marginBottom: 14,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: reports.dark }}>
              🤖 {suggestions.length} AI suggestion{suggestions.length === 1 ? "" : "s"} ready
            </div>
            <div style={{ fontSize: 11, color: "#64748B" }}>
              {suggestions.filter((s) => s.score >= 90).length} above 90% confidence
            </div>
          </div>
          <button
            type="button"
            onClick={acceptAllSuggestions}
            style={{
              background: `linear-gradient(135deg, ${success.base}, ${success.dark})`,
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: 10,
              fontWeight: 800,
              fontSize: 12,
              cursor: "pointer",
              boxShadow: `0 4px 12px ${success.base}40`,
            }}
          >
            ⚡ {t("recon.match.suggested")}
          </button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="recon-grid">
        {/* LEFT: bank statement */}
        <Pane title={t("recon.statement")} palette={customer} count={filteredStmt.length}>
          <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
            {[
              { id: "UNMATCHED", label: t("recon.unmatched") },
              { id: "MATCHED",   label: t("recon.matched") },
              { id: "ALL",       label: "All" },
            ].map((f) => {
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 999,
                    border: active ? `2px solid ${customer.base}` : `1px solid ${customer.base}30`,
                    background: active ? customer.base : "transparent",
                    color: active ? "#fff" : customer.dark,
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
          {filteredStmt.length === 0 ? (
            <Empty text={t("recon.empty.statement")} />
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0, maxHeight: 380, overflowY: "auto" }}>
              {filteredStmt.map((s) => {
                const isMatched = matchedStmt.has(s.id);
                const isSel = stmtSel === s.id;
                const sug = suggestions.find((x) => x.stmt.id === s.id);
                return (
                  <li
                    key={s.id}
                    onClick={() => !isMatched && setStmtSel(s.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 10px",
                      borderBottom: "1px solid #F1F5F9",
                      cursor: isMatched ? "default" : "pointer",
                      background: isSel ? customer.bg : isMatched ? success.bg : "transparent",
                      transition: "background .15s",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSel || isMatched}
                      readOnly
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isMatched) removeMatch(s.id);
                        else setStmtSel(isSel ? null : s.id);
                      }}
                      style={{ width: 14, height: 14, accentColor: customer.base, cursor: "pointer" }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: "#64748B" }}>{fmtDate(s.date, lang)}</div>
                      <div style={{ fontSize: 12, color: "#0F172A", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {s.description || "—"}
                      </div>
                      {sug && !isMatched && (
                        <div style={{ fontSize: 10, color: success.dark, fontWeight: 700, marginTop: 2 }}>
                          ✨ {t("recon.suggestion")} · {sug.score}%
                        </div>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        color: s.amount >= 0 ? success.base : alert.base,
                        fontFamily: "monospace",
                      }}
                    >
                      {s.amount >= 0 ? "+" : ""}{fmtCurrencyExact(s.amount)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Pane>

        {/* RIGHT: open invoices */}
        <Pane title={t("recon.invoices")} palette={money} count={invoices.filter((i) => !matchedInv.has(i.id)).length}>
          {invoices.length === 0 ? (
            <Empty text={t("recon.empty.invoices")} />
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0, maxHeight: 420, overflowY: "auto" }}>
              {invoices.map((inv) => {
                const isMatched = matchedInv.has(inv.id);
                const isSel = invSel === inv.id;
                return (
                  <li
                    key={inv.id}
                    onClick={() => !isMatched && setInvSel(inv.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 10px",
                      borderBottom: "1px solid #F1F5F9",
                      cursor: isMatched ? "default" : "pointer",
                      background: isSel ? money.bg : isMatched ? success.bg : "transparent",
                      opacity: isMatched ? 0.6 : 1,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSel || isMatched}
                      readOnly
                      style={{ width: 14, height: 14, accentColor: money.base, cursor: "pointer" }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: "#64748B", fontFamily: "monospace" }}>
                        {inv.invoiceNumber || inv.number || (inv.id || "").slice(0, 8)}
                      </div>
                      <div style={{ fontSize: 12, color: "#0F172A", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {inv.customerName || inv.supplierName || "—"}
                      </div>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 800, color: money.dark, fontFamily: "monospace" }}>
                      {fmtCurrencyExact(inv.total, inv.currency)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Pane>
      </div>

      {stmtSel && invSel && (
        <div style={{ marginTop: 14, display: "flex", justifyContent: "center" }}>
          <button
            type="button"
            onClick={() => matchPair(stmtSel, invSel, "manual")}
            style={{
              background: `linear-gradient(135deg, ${success.base}, ${success.dark})`,
              color: "#fff",
              border: "none",
              padding: "10px 22px",
              borderRadius: 12,
              fontWeight: 800,
              fontSize: 13,
              cursor: "pointer",
              boxShadow: `0 6px 18px ${success.base}40`,
            }}
          >
            ✓ {t("recon.match.selected")}
          </button>
        </div>
      )}

      <style>{`@media (max-width: 720px) { .recon-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

function Pane({ title, palette, count, children }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${palette.base}25`, overflow: "hidden" }}>
      <div style={{ padding: "10px 14px", background: palette.bg, borderBottom: `1px solid ${palette.base}20`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: palette.dark, textTransform: "uppercase", letterSpacing: "0.06em" }}>{title}</span>
        <span style={{ fontSize: 10, fontWeight: 800, background: palette.base, color: "#fff", padding: "2px 8px", borderRadius: 999 }}>{count}</span>
      </div>
      <div style={{ padding: 12 }}>{children}</div>
    </div>
  );
}

function Empty({ text }) {
  return (
    <div style={{ padding: 24, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>{text}</div>
  );
}
