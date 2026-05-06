// ================================================================
// CompanySettingsPage — company info + logo + tax ID
// ================================================================
import React, { useEffect, useState } from "react";
import { useI18n } from "../../i18n/i18n";
import { useDashboardI18n } from "../../i18n/dashboard";
import {
  getMoneyPalette,
  getReportsPalette,
  getCustomerPalette,
  getBrandPalette,
} from "../../utils/dashboardPalette";
import PageHeader, { PageHeaderButton } from "../../components/dashboard/PageHeader";
import Card from "../../components/dashboard/Card";
import { ToastProvider, useToast } from "../../components/dashboard/ToastSystem";
import { FormField, FormInput } from "../../components/dashboard/DrawerForm";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem("zyrix_token");
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
  return data;
}

// Validate tax ID — TR (10–11 digits) / SA (15 digits) / generic alphanumeric ≥6
function validateTaxId(id, country = "TR") {
  if (!id) return true;
  const v = String(id).replace(/\s/g, "");
  if (country === "TR") return /^\d{10,11}$/.test(v);
  if (country === "SA") return /^\d{15}$/.test(v);
  return v.length >= 6;
}

function CompanySettingsInner() {
  const dt = useDashboardI18n("company");
  const { lang } = useI18n();
  const id = getCustomerPalette();
  const legal = getMoneyPalette();
  const brand = getBrandPalette(lang.toLowerCase());
  const reports = getReportsPalette();
  const { toast } = useToast();

  const [form, setForm] = useState({
    companyName: "",
    legalName: "",
    taxId: "",
    taxOffice: "",
    address: "",
    country: lang === "AR" ? "SA" : "TR",
    city: "",
    industry: "",
    employees: "",
    logo: "",
    website: "",
  });
  const [busy, setBusy] = useState(false);
  const [taxErr, setTaxErr] = useState(false);

  useEffect(() => {
    apiFetch("/api/company")
      .then((res) => {
        const c = res?.data ?? res;
        if (c) setForm((f) => ({ ...f, ...c }));
      })
      .catch(() => {});
  }, []);

  const onChange = (k) => (e) => {
    const v = e.target.value;
    setForm((f) => ({ ...f, [k]: v }));
    if (k === "taxId") setTaxErr(false);
  };

  const onLogo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      toast.error(dt("logoHint"));
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setForm((f) => ({ ...f, logo: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const save = async () => {
    if (!validateTaxId(form.taxId, form.country)) {
      setTaxErr(true);
      toast.error(dt("validateTaxId"));
      return;
    }
    setBusy(true);
    try {
      await apiFetch("/api/company", { method: "PUT", body: JSON.stringify(form) });
      toast.success(dt("saved"));
    } catch {
      toast.error("Save failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title={dt("title")}
        subtitle={dt("subtitle")}
        palette={brand}
        icon="🏢"
        actions={
          <PageHeaderButton onClick={save} palette={brand} disabled={busy}>
            {busy ? "…" : dt("action.save")}
          </PageHeaderButton>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        <Card palette={id} icon="🪪" title={dt("section.identity")}>
          <FormField label={dt("field.companyName")} required>
            <FormInput value={form.companyName} onChange={onChange("companyName")} />
          </FormField>
          <FormField label={dt("field.industry")}>
            <FormInput value={form.industry} onChange={onChange("industry")} />
          </FormField>
          <FormField label={dt("field.employees")}>
            <FormInput type="number" value={form.employees} onChange={onChange("employees")} />
          </FormField>
          <FormField label={dt("field.country")}>
            <select
              value={form.country}
              onChange={onChange("country")}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #E2E8F0",
                fontSize: 14,
                background: "#fff",
                outline: "none",
              }}
            >
              <option value="TR">🇹🇷 Türkiye</option>
              <option value="SA">🇸🇦 Saudi Arabia</option>
              <option value="AE">🇦🇪 UAE</option>
              <option value="EG">🇪🇬 Egypt</option>
              <option value="QA">🇶🇦 Qatar</option>
              <option value="KW">🇰🇼 Kuwait</option>
            </select>
          </FormField>
          <FormField label={dt("field.city")}>
            <FormInput value={form.city} onChange={onChange("city")} />
          </FormField>
          <FormField label={dt("field.address")}>
            <textarea
              value={form.address}
              onChange={onChange("address")}
              rows={2}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #E2E8F0",
                fontSize: 14,
                color: "#0F172A",
                background: "#fff",
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </FormField>
        </Card>

        <Card palette={legal} icon="📜" title={dt("section.legal")}>
          <FormField label={dt("field.legalName")}>
            <FormInput value={form.legalName} onChange={onChange("legalName")} />
          </FormField>
          <FormField label={dt("field.taxId")} error={taxErr ? dt("validateTaxId") : null} required>
            <FormInput value={form.taxId} onChange={onChange("taxId")} />
          </FormField>
          <FormField label={dt("field.taxOffice")}>
            <FormInput value={form.taxOffice} onChange={onChange("taxOffice")} />
          </FormField>
          <FormField label={dt("field.website")}>
            <FormInput type="url" value={form.website} onChange={onChange("website")} placeholder="https://" />
          </FormField>
        </Card>

        <Card palette={reports} icon="🎨" title={dt("section.brand")}>
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16 }}>
            <div
              style={{
                width: 86,
                height: 86,
                borderRadius: 14,
                background: form.logo ? `center/contain no-repeat url(${form.logo})` : reports.bg,
                color: reports.base,
                border: `1.5px solid ${reports.base}30`,
                display: "grid",
                placeItems: "center",
                fontSize: 30,
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {!form.logo && (form.companyName?.[0]?.toUpperCase() || "Z")}
            </div>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "inline-block",
                  padding: "8px 14px",
                  borderRadius: 10,
                  background: reports.base,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                {dt("action.uploadLogo")}
                <input type="file" accept="image/png,image/svg+xml" onChange={onLogo} style={{ display: "none" }} />
              </label>
              <div style={{ fontSize: 11, color: "#64748B", marginTop: 6 }}>{dt("logoHint")}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function CompanySettingsPage() {
  return (
    <ToastProvider>
      <CompanySettingsInner />
    </ToastProvider>
  );
}
