// ================================================================
// Services Catalog — services you offer (hourly or flat)
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../../../i18n/i18n";
import { useDashboardI18n } from "../../../i18n/dashboard";
import {
  getMarketPalette,
  getMoneyPalette,
  getSuccessPalette,
  getBrandPalette,
  paletteSequence,
} from "../../../utils/dashboardPalette";
import PageHeader, { PageHeaderButton } from "../../../components/dashboard/PageHeader";
import Card from "../../../components/dashboard/Card";
import EmptyState from "../../../components/dashboard/EmptyState";
import InvoiceStatusPill from "../../../components/dashboard/sales/InvoiceStatusPill";
import { fmtCurrency, localList, localSave, SERVICES_KEY } from "./productsApi";

function seedIfEmpty() {
  if (localList(SERVICES_KEY).length > 0) return;
  const seeds = [
    { id: "svc-1", name: "Danışmanlık (Saatlik)",  category: "Danışmanlık", type: "HOURLY", rate: 750,  active: true,  description: "İş ve teknoloji danışmanlığı" },
    { id: "svc-2", name: "Web Sitesi Yapımı",      category: "Yazılım",     type: "FLAT",   rate: 18500, active: true,  description: "Tek sayfa kurumsal web sitesi" },
    { id: "svc-3", name: "Eğitim Atölyesi (Yarım Gün)", category: "Eğitim",  type: "FLAT",   rate: 4500, active: true,  description: "4 saatlik atölye" },
    { id: "svc-4", name: "Aylık Bakım",             category: "Destek",      type: "FLAT",   rate: 1200, active: false, description: "Sistem bakım sözleşmesi" },
  ];
  localSave(SERVICES_KEY, seeds);
}

export default function ServicesPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("products");
  const market = getMarketPalette();
  const money = getMoneyPalette();
  const success = getSuccessPalette();
  const brand = getBrandPalette(lang.toLowerCase());

  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({
    name: "",
    category: "",
    type: "HOURLY",
    rate: 0,
    description: "",
    active: true,
  });

  const reload = () => setServices(localList(SERVICES_KEY));
  useEffect(() => {
    seedIfEmpty();
    reload();
  }, []);

  const palettes = useMemo(() => paletteSequence(services.length, { exclude: ["wine"] }), [services.length]);

  const submit = () => {
    if (!draft.name || Number(draft.rate) <= 0) return;
    const arr = localList(SERVICES_KEY);
    arr.unshift({ ...draft, id: `svc-${Date.now()}`, rate: Number(draft.rate) });
    localSave(SERVICES_KEY, arr);
    setDraft({ name: "", category: "", type: "HOURLY", rate: 0, description: "", active: true });
    setShowForm(false);
    reload();
  };

  const toggleActive = (id) => {
    const arr = localList(SERVICES_KEY).map((s) => (s.id === id ? { ...s, active: !s.active } : s));
    localSave(SERVICES_KEY, arr);
    reload();
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={t("services.title")}
        subtitle={t("services.subtitle")}
        icon="🛎️"
        palette={market}
        actions={
          <PageHeaderButton palette={brand} variant="primary" icon="＋" onClick={() => setShowForm((v) => !v)}>
            {t("services.new")}
          </PageHeaderButton>
        }
      />

      {showForm && (
        <Card palette={market} title={t("services.new")} icon="📝" style={{ marginBottom: 18 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            <Field label={t("services.field.name")}>
              <input type="text" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} style={input(market)} />
            </Field>
            <Field label={t("services.field.cat")}>
              <input type="text" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} style={input(market)} />
            </Field>
            <Field label={t("services.field.type")}>
              <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })} style={input(market)}>
                <option value="HOURLY">{t("services.type.HOURLY")}</option>
                <option value="FLAT">{t("services.type.FLAT")}</option>
              </select>
            </Field>
            <Field label={`${t("services.field.rate")} (₺)`}>
              <input
                type="number"
                min="0"
                step="0.01"
                value={draft.rate}
                onChange={(e) => setDraft({ ...draft, rate: e.target.value })}
                style={{ ...input(market), fontFamily: "monospace", textAlign: "end" }}
              />
            </Field>
          </div>
          <div style={{ marginTop: 12 }}>
            <Field label={t("services.field.desc")}>
              <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={2} style={{ ...input(market), fontFamily: "inherit", resize: "vertical" }} />
            </Field>
          </div>
          <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button type="button" onClick={() => setShowForm(false)} style={btnGhost(market)}>
              {t("common.cancel")}
            </button>
            <button type="button" onClick={submit} style={btnPrimary(success)}>
              ✓ {t("common.save")}
            </button>
          </div>
        </Card>
      )}

      {services.length === 0 ? (
        <EmptyState title={t("services.empty")} icon="🛎️" palette={market} />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 14,
          }}
        >
          {services.map((s, i) => {
            const palette = palettes[i] || market;
            return (
              <div
                key={s.id}
                style={{
                  background: "#fff",
                  border: `1px solid ${palette.base}30`,
                  borderRadius: 14,
                  padding: 16,
                  opacity: s.active ? 1 : 0.6,
                  transition: "transform .15s, box-shadow .15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = `0 8px 22px ${palette.base}25`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", flex: 1, minWidth: 0 }}>{s.name}</div>
                  <InvoiceStatusPill status={s.active ? "ACTIVE" : "INACTIVE"} label={s.active ? "Active" : "Inactive"} size="compact" />
                </div>
                <div style={{ fontSize: 11, color: palette.dark, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                  {s.category || "—"} · {t(`services.type.${s.type}`)}
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, color: money.base, fontFamily: "monospace", marginBottom: 8 }}>
                  {fmtCurrency(s.rate)}
                  {s.type === "HOURLY" && <span style={{ fontSize: 12, color: "#64748B", fontWeight: 600 }}> /hr</span>}
                </div>
                {s.description && <div style={{ fontSize: 12, color: "#64748B", marginBottom: 10, lineHeight: 1.5 }}>{s.description}</div>}
                <button
                  type="button"
                  onClick={() => toggleActive(s.id)}
                  style={{
                    width: "100%",
                    padding: "6px 10px",
                    borderRadius: 8,
                    border: `1px solid ${palette.base}40`,
                    background: palette.bg,
                    color: palette.dark,
                    fontWeight: 700,
                    fontSize: 11,
                    cursor: "pointer",
                  }}
                >
                  {s.active ? "Deactivate" : "Activate"}
                </button>
              </div>
            );
          })}
        </div>
      )}
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
function btnPrimary(palette) {
  return {
    background: `linear-gradient(135deg, ${palette.base}, ${palette.dark})`,
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: `0 4px 12px ${palette.base}35`,
  };
}
function btnGhost(palette) {
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
