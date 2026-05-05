// ============================================================
// Zyrix FinSuite - Cash Crisis Predictive Alerts Page
// Track C - Sprint 2 Feature 2 (Frontend)
// ============================================================

import React, { useState, useEffect } from "react";
import { cashCrisisAPI } from "../../services/api";

const SEVERITY = {
  CRITICAL: { color: "#DC2626", bg: "#FEE2E2", border: "#FCA5A5", icon: "🚨", label: "Kritik" },
  HIGH:     { color: "#EA580C", bg: "#FFEDD5", border: "#FDBA74", icon: "⚠️", label: "Yuksek" },
  MEDIUM:   { color: "#D97706", bg: "#FEF3C7", border: "#FCD34D", icon: "⚡", label: "Orta" },
  LOW:      { color: "#0891B2", bg: "#CFFAFE", border: "#67E8F9", icon: "ℹ️", label: "Dusuk" },
};

const TYPE_LABELS = {
  NEGATIVE_TREND: "Nakit Akisi Negatif",
  OVERDUE_AR: "Vadesi Gecen Alacak",
  TAX_DUE: "Yaklasan Vergi",
  PAYROLL_RISK: "Maas Riski",
  BURN_RATE: "Yanma Hizi",
  INVOICE_GAP: "Fatura Bosluğu",
  EXPENSE_SPIKE: "Gider Artisi",
};

export default function CashCrisisPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = showAll
        ? await cashCrisisAPI.listAll()
        : await cashCrisisAPI.list();
      setAlerts(r?.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [showAll]);

  const onAnalyze = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const r = await cashCrisisAPI.analyze();
      const result = r?.data;
      if (result) {
        alert(
          "Analiz tamamlandi!\n\n" +
          "Yeni uyari: " + result.alertsCreated + "\n" +
          "Suresi dolan: " + result.alertsExpired + "\n" +
          "Calistirilan algilayici: " + result.detectorRuns
        );
      }
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const onDismiss = async (id) => {
    try {
      await cashCrisisAPI.dismiss(id);
      await load();
    } catch (e) { alert("Hata: " + e.message); }
  };

  const onResolve = async (id) => {
    if (!confirm("Bu uyariyi cozulmus olarak isaretlemek istediginizden emin misiniz?")) return;
    try {
      await cashCrisisAPI.resolve(id);
      await load();
    } catch (e) { alert("Hata: " + e.message); }
  };

  // Group by severity
  const grouped = alerts.reduce((acc, a) => {
    const key = a.severity;
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {});

  const severityOrder = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#1E1B4B" }}>
            🔮 Tahminsel Nakit Krizi Uyarilari
          </h1>
          <p style={{ margin: "4px 0 0", color: "#64748B", fontSize: 13 }}>
            Yapay zeka destekli risk algilayicilari · {alerts.length} {showAll ? "toplam" : "aktif"} uyari
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setShowAll(!showAll)}
            style={{
              background: showAll ? "#6C3AFF" : "#F8FAFF",
              color: showAll ? "#fff" : "#6C3AFF",
              border: "1.5px solid #6C3AFF",
              borderRadius: 10,
              padding: "8px 14px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {showAll ? "Sadece Aktif" : "Tum Gecmis"}
          </button>
          <button
            onClick={onAnalyze}
            disabled={analyzing}
            style={{
              background: "linear-gradient(135deg,#6C3AFF,#F43F8E)",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "8px 16px",
              fontSize: 12,
              fontWeight: 700,
              cursor: analyzing ? "not-allowed" : "pointer",
              boxShadow: "0 4px 12px rgba(108,58,255,0.25)",
              opacity: analyzing ? 0.6 : 1,
            }}
          >
            {analyzing ? "Analiz Ediliyor..." : "🔍 Yeni Analiz"}
          </button>
        </div>
      </div>

      {/* Info banner */}
      <div style={{
        padding: 14,
        background: "linear-gradient(135deg,#6C3AFF15,#F43F8E15)",
        border: "1.5px solid #C7D2FE",
        borderRadius: 12,
        marginBottom: 20,
        fontSize: 12,
        color: "#3730A3",
      }}>
        💡 <strong>Tavsiye:</strong> Bu sistem 7 farkli risk algilayicisi calistirir
        (negatif trend, vadesi gecen alacak, vergi, maas, yanma hizi, fatura bosluğu, gider artisi).
        Her uyari icin yapay zeka kisa bir aciklama saglar.
      </div>

      {error && <div style={{ padding: 14, background: "#FEE2E2", color: "#991B1B", borderRadius: 10, marginBottom: 16 }}>{error}</div>}

      {loading && <div style={{ padding: 40, textAlign: "center", color: "#64748B" }}>Yukleniyor...</div>}

      {!loading && alerts.length === 0 && (
        <div style={{ padding: 60, textAlign: "center", background: "#F8FAFF", borderRadius: 16, border: "1.5px dashed #E2E8F8" }}>
          <div style={{ fontSize: 56, marginBottom: 14 }}>✅</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#1E1B4B", marginBottom: 6 }}>
            {showAll ? "Hic uyari yok" : "Aktif uyari yok"}
          </div>
          <div style={{ color: "#64748B", fontSize: 13 }}>
            Mali durumunuz saglikli görünüyor. Analizi yenilemek icin "Yeni Analiz" butonuna basabilirsiniz.
          </div>
        </div>
      )}

      {!loading && alerts.length > 0 && severityOrder.map((sev) => {
        const items = grouped[sev];
        if (!items || items.length === 0) return null;
        const cfg = SEVERITY[sev];
        return (
          <div key={sev} style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 18 }}>{cfg.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: cfg.color, textTransform: "uppercase" }}>
                {cfg.label} · {items.length}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(380px,1fr))", gap: 12 }}>
              {items.map((a) => (
                <AlertCard key={a.id} alert={a} cfg={cfg} onDismiss={onDismiss} onResolve={onResolve} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AlertCard({ alert, cfg, onDismiss, onResolve }) {
  const isActive = alert.status === "ACTIVE";
  return (
    <div style={{
      background: "#FFFFFF",
      border: "1.5px solid " + cfg.border,
      borderLeft: "4px solid " + cfg.color,
      borderRadius: 14,
      padding: 18,
      opacity: isActive ? 1 : 0.6,
      position: "relative",
    }}>
      {/* Status badge */}
      {!isActive && (
        <span style={{
          position: "absolute", top: 12, right: 12,
          background: "#F1F5F9", color: "#64748B",
          padding: "3px 10px", borderRadius: 12, fontSize: 10, fontWeight: 700,
        }}>{alert.status}</span>
      )}

      <div style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", marginBottom: 6 }}>
        {TYPE_LABELS[alert.type] || alert.type}
      </div>
      <h3 style={{ margin: "0 0 10px", fontSize: 15, fontWeight: 800, color: "#1E1B4B" }}>
        {alert.title}
      </h3>
      <p style={{ margin: "0 0 12px", fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
        {alert.message}
      </p>

      {alert.daysUntilCrisis !== null && alert.daysUntilCrisis !== undefined && (
        <div style={{
          display: "inline-block",
          background: cfg.bg,
          color: cfg.color,
          padding: "5px 12px",
          borderRadius: 12,
          fontSize: 12,
          fontWeight: 700,
          marginBottom: 12,
        }}>
          ⏱ {alert.daysUntilCrisis} gun icinde kritik
        </div>
      )}

      {alert.aiInsight && (
        <div style={{
          background: "#F8FAFF",
          border: "1px dashed #C7D2FE",
          borderRadius: 10,
          padding: 12,
          marginBottom: 12,
          fontSize: 12,
          color: "#3730A3",
          lineHeight: 1.5,
        }}>
          <strong>🤖 AI CFO:</strong> {alert.aiInsight}
        </div>
      )}

      {alert.recommendation && (
        <div style={{
          fontSize: 12,
          color: "#0F766E",
          background: "#D1FAE5",
          padding: 10,
          borderRadius: 10,
          marginBottom: 12,
          lineHeight: 1.5,
        }}>
          <strong>💡 Onerilen Adim:</strong> {alert.recommendation}
        </div>
      )}

      {isActive && (
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button onClick={() => onResolve(alert.id)} style={btnPrimary}>✓ Cozuldu</button>
          <button onClick={() => onDismiss(alert.id)} style={btnSecondary}>Gormezden Gel</button>
        </div>
      )}

      <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 10 }}>
        {new Date(alert.createdAt).toLocaleString("tr-TR")}
      </div>
    </div>
  );
}

const btnPrimary = {
  background: "linear-gradient(135deg,#10B981,#059669)",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "7px 14px",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
  flex: 1,
};

const btnSecondary = {
  background: "#F1F5F9",
  color: "#64748B",
  border: "1.5px solid #E2E8F8",
  borderRadius: 8,
  padding: "7px 14px",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
  flex: 1,
};
