// ================================================================
// ★ AI Negotiation Coach — pre-call brief + recording + post-call
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getAIPalette,
  getMoneyPalette,
  getCustomerPalette,
  getSuccessPalette,
  getBrandPalette,
} from "../../../utils/dashboardPalette";
import PageHeader from "../../../components/dashboard/PageHeader";
import Card from "../../../components/dashboard/Card";
import EmptyState from "../../../components/dashboard/EmptyState";
import PreCallBriefCard from "../../../components/dashboard/cognitive/PreCallBriefCard";
import CallRecorder from "../../../components/dashboard/cognitive/CallRecorder";
import PostCallAnalysis from "../../../components/dashboard/cognitive/PostCallAnalysis";
import { api, buildPreCallBrief, analyzeCallRecording, localStore, KEYS } from "./cognitiveApi";

export default function NegotiationCoachPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("cognitive");
  const ai = getAIPalette();
  const money = getMoneyPalette();
  const customer = getCustomerPalette();
  const success = getSuccessPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const [tab, setTab] = useState("PRE");
  const [customers, setCustomers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [recordings, setRecordings] = useState([]);

  useEffect(() => {
    api("/api/customers").then((r) => {
      const list = r?.data?.customers || r?.data?.items || r?.data || [];
      const arr = Array.isArray(list) ? list : [];
      setCustomers(arr);
      if (arr.length > 0) setSelectedId(arr[0].id || arr[0].name);
    });
    setRecordings(localStore.list(KEYS.callRecordings));
  }, []);

  const selected = customers.find((c) => (c.id || c.name) === selectedId);

  // For demo, use a fake DNA inferred from name length
  const dna = selected
    ? {
        personality: ["analytical", "driver", "expressive", "amiable"][selected.name?.length % 4 || 0],
      }
    : null;

  const brief = useMemo(
    () => (selected ? buildPreCallBrief({
      customer: selected,
      dna,
      lastInvoice: 5000,
      ltv: 47000,
      churn: 12,
    }) : null),
    [selected, dna?.personality]
  );

  const onTranscript = ({ transcript, durationSec }) => {
    const result = analyzeCallRecording({ durationSec, transcript });
    setAnalysis(result);
    const saved = localStore.add(KEYS.callRecordings, {
      customerId: selectedId,
      customerName: selected?.name,
      transcript,
      durationSec,
      analyzedAt: new Date().toISOString(),
      analysis: result,
    });
    setRecordings(localStore.list(KEYS.callRecordings));
    setTab("POST");
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={t("coach.title")}
        subtitle={t("coach.subtitle")}
        icon="🎙"
        palette={ai}
        actions={
          <div style={{ display: "flex", gap: 4, padding: 4, background: ai.bg, borderRadius: 10 }}>
            {[
              { id: "PRE",  label: t("coach.tab.preCall") },
              { id: "POST", label: t("coach.tab.postCall") },
            ].map((tabDef) => {
              const active = tab === tabDef.id;
              return (
                <button
                  key={tabDef.id}
                  type="button"
                  onClick={() => setTab(tabDef.id)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: "none",
                    background: active ? "#fff" : "transparent",
                    color: active ? ai.dark : "#64748B",
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: active ? `0 2px 8px ${ai.base}25` : "none",
                  }}
                >
                  {tabDef.label}
                </button>
              );
            })}
          </div>
        }
      />

      {/* Customer picker */}
      <Card palette={ai} style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, color: ai.dark, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
          Select customer
        </div>
        {customers.length === 0 ? (
          <EmptyState title={t("common.empty")} icon="👤" palette={ai} />
        ) : (
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            {customers.slice(0, 12).map((c) => {
              const id = c.id || c.name;
              const active = id === selectedId;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => { setSelectedId(id); setAnalysis(null); }}
                  style={{
                    background: active ? `linear-gradient(135deg, ${ai.base}, ${ai.dark})` : "#fff",
                    color: active ? "#fff" : ai.dark,
                    border: active ? `2px solid ${ai.base}` : `1px solid ${ai.base}30`,
                    borderRadius: 14,
                    padding: "10px 14px",
                    cursor: "pointer",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow: active ? `0 6px 18px ${ai.base}40` : "none",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: active ? "rgba(255,255,255,0.25)" : ai.base,
                      color: "#fff",
                      display: "grid",
                      placeItems: "center",
                      fontWeight: 800,
                      fontSize: 12,
                    }}
                  >
                    {(c.name || "?")[0].toUpperCase()}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap" }}>{c.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </Card>

      {tab === "PRE" && brief && (
        <>
          <div style={{ marginBottom: 18 }}>
            <PreCallBriefCard brief={brief} lang={lang} t={t} />
          </div>
          <Card palette={ai} title={t("coach.action.record")} icon="🎙">
            <CallRecorder onTranscript={onTranscript} lang={lang} t={t} />
            <div style={{ marginTop: 10, fontSize: 11, color: "#94A3B8", fontStyle: "italic", textAlign: "center" }}>
              ☝️ {t("coach.consent")}
            </div>
          </Card>
        </>
      )}

      {tab === "POST" && (
        <>
          {analysis ? (
            <PostCallAnalysis analysis={analysis} lang={lang} t={t} />
          ) : recordings.length > 0 ? (
            <Card palette={ai} title="Recent Recordings" icon="📼">
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {recordings.slice(0, 8).map((r) => (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => setAnalysis(r.analysis)}
                      style={{
                        width: "100%",
                        background: "transparent",
                        border: "none",
                        borderBottom: "1px solid #F1F5F9",
                        padding: "10px 12px",
                        cursor: "pointer",
                        textAlign: "start",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{r.customerName || "Unknown"}</div>
                        <div style={{ fontSize: 11, color: "#64748B" }}>{Math.floor(r.durationSec / 60)}m · {new Date(r.analyzedAt).toLocaleString(lang === "AR" ? "ar-SA" : lang === "EN" ? "en-US" : "tr-TR")}</div>
                      </div>
                      <span style={{ fontSize: 16, color: ai.base }}>›</span>
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          ) : (
            <EmptyState title="Record a call to see post-call analysis" icon="🎙" palette={ai} />
          )}
        </>
      )}
    </div>
  );
}
