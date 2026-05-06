// ================================================================
// ★ Invoice Autopilot — HERO PAGE
// Voice/WhatsApp/Email/Photo → AI extracts → draft → send
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getAIPalette,
  getMoneyPalette,
  getSuccessPalette,
  getCustomerPalette,
  getMarketPalette,
  getReportsPalette,
  getBrandPalette,
  getPaletteById,
} from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import KpiCard from "../../../components/dashboard/KpiCard";
import Card from "../../../components/dashboard/Card";
import VoiceRecorder from "../../../components/dashboard/autopilots/VoiceRecorder";
import AIProcessingPulse from "../../../components/dashboard/autopilots/AIProcessingPulse";
import InvoiceDraftPreview from "../../../components/dashboard/autopilots/InvoiceDraftPreview";
import DocumentScanner from "../../../components/dashboard/autopilots/DocumentScanner";
import {
  api,
  localStore,
  KEYS,
  parseInvoiceText,
  recordMinutesSaved,
  getMinutesSaved,
  ensureInvoiceDraftSeed,
  fmtCurrency,
  fmtDate,
} from "./autopilotsApi";

const STAGES = ["transcribing", "parsing", "matching", "draft"];
const INPUT_METHODS = [
  { id: "voice",    paletteId: "purple",  icon: "🎤" },
  { id: "whatsapp", paletteId: "emerald", icon: "💬" },
  { id: "email",    paletteId: "indigo",  icon: "📧" },
  { id: "photo",    paletteId: "orange",  icon: "📸" },
];

export default function InvoiceAutopilotPage({ onNavigate }) {
  const { lang } = useI18n();
  const t = useDashboardI18n("autopilots");
  const ai = getAIPalette();
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const customer = getCustomerPalette();
  const market = getMarketPalette();
  const reports = getReportsPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const [method, setMethod] = useState("voice");
  const [stage, setStage] = useState(null);
  const [draft, setDraft] = useState(null);
  const [textInput, setTextInput] = useState("");
  const [toast, setToast] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [recentDrafts, setRecentDrafts] = useState([]);
  const [minutesTotal, setMinutesTotal] = useState(0);

  const reload = () => setRecentDrafts(localStore.list(KEYS.invoiceDrafts).slice(0, 5));

  useEffect(() => {
    ensureInvoiceDraftSeed();
    reload();
    setMinutesTotal(getMinutesSaved());
    api("/api/customers").then((r) => {
      const list = r?.data?.customers || r?.data?.items || r?.data || [];
      setCustomers(Array.isArray(list) ? list : []);
    });
    api("/api/stock?limit=200").then((r) => {
      const list = r?.data?.items || r?.data?.products || [];
      setProducts((Array.isArray(list) ? list : []).map((p) => ({ name: p.name, salePrice: p.salePrice ?? p.price })));
    });
  }, []);

  const handleInput = async (text) => {
    if (!text || !text.trim()) return;
    setStage("transcribing");
    await wait(700);
    setStage("parsing");
    await wait(900);
    setStage("matching");
    await wait(700);
    setStage("draft");
    await wait(600);
    const parsed = parseInvoiceText(text, { customers, products });
    setStage(null);
    setDraft(parsed);
  };

  const onPhoto = async (capture) => {
    setStage("transcribing");
    await wait(800);
    setStage("parsing");
    // Mock OCR: pretend the photo extracted a recognizable order
    await wait(1100);
    setStage("matching");
    await wait(600);
    setStage("draft");
    await wait(400);
    const fakeText = "Acme Yapı'ya bir tablet ve iki klavye fatura kes";
    const parsed = parseInvoiceText(fakeText, { customers, products });
    setStage(null);
    setDraft({ ...parsed, source: "photo", photoData: capture?.dataUrl });
  };

  const confirm = () => {
    if (!draft) return;
    const saved = localStore.add(KEYS.invoiceDrafts, {
      ...draft,
      status: "SENT",
      createdAt: new Date().toISOString(),
    });
    const total = recordMinutesSaved(5);
    setMinutesTotal(total);
    setToast({ kind: "success", msg: t("invoice.toast.saved").replace("{minutes}", 5) });
    setTimeout(() => setToast(null), 3500);
    setDraft(null);
    setTextInput("");
    reload();
  };

  const discard = () => {
    setDraft(null);
    setTextInput("");
  };

  const inputCard = (m) => {
    const palette = getPaletteById(m.paletteId);
    const active = method === m.id;
    return (
      <button
        key={m.id}
        type="button"
        onClick={() => { setMethod(m.id); setDraft(null); }}
        style={{
          background: active ? `linear-gradient(135deg, ${palette.bg}, ${palette.base}25)` : "#fff",
          border: active ? `2px solid ${palette.base}` : `1px solid ${palette.base}30`,
          borderRadius: 16,
          padding: "16px 14px",
          cursor: "pointer",
          textAlign: "start",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          transition: "transform .15s, box-shadow .15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-3px)";
          e.currentTarget.style.boxShadow = `0 10px 26px ${palette.base}25`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "";
          e.currentTarget.style.boxShadow = "";
        }}
      >
        <div style={{ fontSize: 24 }}>{m.icon}</div>
        <div style={{ fontSize: 13, fontWeight: 800, color: palette.dark }}>
          {t(`invoice.input.${m.id}`)}
        </div>
        <div style={{ fontSize: 11, color: "#64748B" }}>{t(`invoice.input.${m.id}.desc`)}</div>
      </button>
    );
  };

  const stats = useMemo(() => ({
    drafts: recentDrafts.length,
    minutesSaved: minutesTotal,
    today: recentDrafts.filter((d) => new Date(d.createdAt).toDateString() === new Date().toDateString()).length,
  }), [recentDrafts, minutesTotal]);

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader title={t("invoice.title")} subtitle={t("invoice.subtitle")} icon="🤖" palette={ai} />

      {/* HERO — voice recorder */}
      <Card palette={ai} style={{ marginBottom: 18, padding: 32 }}>
        <VoiceRecorder
          lang={lang}
          t={t}
          onTranscript={handleInput}
          onError={(err) => {
            setToast({ kind: "error", msg: err });
            setTimeout(() => setToast(null), 2800);
          }}
        />
      </Card>

      {/* KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 18,
        }}
        className="ap-kpi-grid"
      >
        <KpiCard label={t("invoice.toast.saved").replace("{minutes}", "").replace(" 🎉", "")} value={stats.minutesSaved} suffix="m" palette={ai} icon="⏱" />
        <KpiCard label="Drafts Today" value={stats.today} palette={success} icon="✨" />
        <KpiCard label="Total Drafts" value={stats.drafts} palette={customer} icon="📋" />
      </div>

      {/* Input method switcher */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
          marginBottom: 18,
        }}
      >
        {INPUT_METHODS.map(inputCard)}
      </div>

      {/* Method-specific input */}
      {!stage && !draft && (
        <Card palette={getPaletteById(INPUT_METHODS.find((m) => m.id === method)?.paletteId)} style={{ marginBottom: 18 }}>
          {method === "voice" && (
            <div style={{ padding: 18, textAlign: "center", color: "#64748B", fontSize: 13 }}>
              ☝️ Use the big mic above to dictate an invoice.
            </div>
          )}
          {(method === "whatsapp" || method === "email") && (
            <div style={{ padding: 12 }}>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={5}
                placeholder={t("invoice.text.placeholder")}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: `1px solid ${getPaletteById(method === "whatsapp" ? "emerald" : "indigo").base}30`,
                  background: "#fff",
                  fontSize: 13,
                  fontFamily: "inherit",
                  resize: "vertical",
                  outline: "none",
                  boxSizing: "border-box",
                  marginBottom: 10,
                }}
              />
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => handleInput(textInput)}
                  disabled={!textInput.trim()}
                  style={{
                    background: !textInput.trim() ? "#CBD5E1" : `linear-gradient(135deg, ${ai.base}, ${ai.dark})`,
                    color: "#fff",
                    border: "none",
                    padding: "10px 18px",
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: !textInput.trim() ? "not-allowed" : "pointer",
                    boxShadow: !textInput.trim() ? "none" : `0 6px 16px ${ai.base}40`,
                  }}
                >
                  ✨ {t("invoice.text.parse")}
                </button>
              </div>
            </div>
          )}
          {method === "photo" && (
            <div style={{ padding: 12 }}>
              <DocumentScanner onCapture={onPhoto} t={t} label={t("invoice.photo.upload")} />
              <div style={{ fontSize: 11, color: "#64748B", textAlign: "center", marginTop: 10, fontStyle: "italic" }}>
                {t("invoice.photo.tip")}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Processing state */}
      {stage && (
        <Card palette={ai} style={{ marginBottom: 18 }}>
          <AIProcessingPulse stage={stage} stages={STAGES} lang={lang} t={t} />
        </Card>
      )}

      {/* Draft preview */}
      {draft && !stage && (
        <div style={{ marginBottom: 18 }}>
          <InvoiceDraftPreview
            draft={draft}
            onConfirm={confirm}
            onEdit={() => onNavigate && onNavigate("sales-invoice-new")}
            onDiscard={discard}
            lang={lang}
            t={t}
          />
        </div>
      )}

      {/* Recent drafts */}
      {recentDrafts.length > 0 && (
        <Card palette={reports} title="Recent AI Drafts" icon="📋">
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {recentDrafts.map((d) => (
              <li
                key={d.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 12px",
                  borderBottom: "1px solid #F1F5F9",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: ai.bg,
                    color: ai.dark,
                    display: "grid",
                    placeItems: "center",
                    fontSize: 14,
                    flexShrink: 0,
                  }}
                >
                  🤖
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{d.customer?.name || "—"}</div>
                  <div style={{ fontSize: 11, color: "#64748B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    "{d.transcript || "—"}"
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: money.dark, fontFamily: "monospace" }}>
                  {fmtCurrency(d.grandTotal)}
                </div>
                <div style={{ fontSize: 10, color: "#94A3B8" }}>{fmtDate(d.createdAt, lang)}</div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 28,
            insetInlineEnd: 28,
            background: toast.kind === "error" ? "#FFE4E6" : `linear-gradient(135deg, ${success.bg}, ${ai.bg})`,
            color: toast.kind === "error" ? "#9F1239" : success.dark,
            border: toast.kind === "error" ? `2px solid #F43F5E` : `2px solid ${success.base}`,
            borderRadius: 14,
            padding: "14px 20px",
            fontSize: 14,
            fontWeight: 800,
            boxShadow: toast.kind === "error" ? "0 8px 28px rgba(244,63,94,.35)" : `0 12px 36px ${success.base}40`,
            zIndex: 250,
            animation: "toastIn .25s ease",
            maxWidth: 360,
          }}
        >
          {toast.msg}
        </div>
      )}

      <style>{`
        @media (max-width: 720px) { .ap-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @keyframes toastIn { from { opacity: 0; transform: translateY(10px) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>
  );
}

function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }
