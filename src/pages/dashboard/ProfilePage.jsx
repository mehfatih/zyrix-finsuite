// ================================================================
// ProfilePage — avatar upload + bio + preferences + security
// ================================================================
import React, { useEffect, useState } from "react";
import { useI18n } from "../../i18n/i18n";
import { useDashboardI18n } from "../../i18n/dashboard";
import { useAuth } from "../../context/AuthContext";
import {
  getCustomerPalette,
  getAIPalette,
  getAlertPalette,
  getBrandPalette,
} from "../../utils/dashboardPalette";
import PageHeader, { PageHeaderButton } from "../../components/dashboard/PageHeader";
import Card from "../../components/dashboard/Card";
import { ToastProvider, useToast } from "../../components/dashboard/ToastSystem";
import { FormField, FormInput } from "../../components/dashboard/DrawerForm";
import ConfirmDialog from "../../components/dashboard/ConfirmDialog";

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

function ProfilePageInner() {
  const dt = useDashboardI18n("profile");
  const { lang, setLang } = useI18n();
  const { user } = useAuth();
  const customer = getCustomerPalette();
  const ai = getAIPalette();
  const alert = getAlertPalette();
  const brand = getBrandPalette(lang.toLowerCase());
  const { toast } = useToast();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "",
    bio: "",
    timezone: "",
    avatar: "",
  });
  const [busy, setBusy] = useState(false);
  const [confirmPwOpen, setConfirmPwOpen] = useState(false);

  useEffect(() => {
    apiFetch("/api/profile")
      .then((res) => {
        const p = res?.data ?? res;
        if (p) setForm((f) => ({ ...f, ...p }));
      })
      .catch(() => {
        // fall back to local user info
        if (user) {
          setForm((f) => ({
            ...f,
            fullName: user.fullName || user.name || "",
            email: user.email || "",
            role: user.role || "",
          }));
        }
      });
  }, [user]);

  const onChange = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error(dt("avatarHint"));
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setForm((f) => ({ ...f, avatar: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setBusy(true);
    try {
      await apiFetch("/api/profile", { method: "PUT", body: JSON.stringify(form) });
      toast.success(dt("saved"));
    } catch {
      toast.error(dt("saveError"));
    } finally {
      setBusy(false);
    }
  };

  const initials = (form.fullName || form.email || "U")
    .split(/\s|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join("");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title={dt("title")}
        subtitle={dt("subtitle")}
        palette={customer}
        icon="🪪"
        actions={
          <PageHeaderButton onClick={save} palette={customer} disabled={busy}>
            {busy ? "…" : dt("action.save")}
          </PageHeaderButton>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        {/* Identity card */}
        <Card palette={customer} icon="👤" title={dt("section.identity")}>
          <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 18 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: form.avatar ? `center/cover url(${form.avatar})` : customer.base,
                color: "#fff",
                display: "grid",
                placeItems: "center",
                fontWeight: 800,
                fontSize: 24,
                flexShrink: 0,
                border: `3px solid ${customer.bg}`,
              }}
            >
              {!form.avatar && initials}
            </div>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: "inline-block",
                  padding: "8px 14px",
                  borderRadius: 10,
                  background: customer.base,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                {dt("action.upload")}
                <input type="file" accept="image/*" onChange={onAvatar} style={{ display: "none" }} />
              </label>
              <div style={{ fontSize: 11, color: "#64748B", marginTop: 6 }}>{dt("avatarHint")}</div>
            </div>
          </div>

          <FormField label={dt("field.fullName")} required>
            <FormInput value={form.fullName} onChange={onChange("fullName")} />
          </FormField>
          <FormField label={dt("field.email")}>
            <FormInput type="email" value={form.email} onChange={onChange("email")} />
          </FormField>
          <FormField label={dt("field.phone")}>
            <FormInput value={form.phone} onChange={onChange("phone")} placeholder="+90 …" />
          </FormField>
          <FormField label={dt("field.role")}>
            <FormInput value={form.role} disabled />
          </FormField>
          <FormField label={dt("field.bio")}>
            <textarea
              value={form.bio}
              onChange={onChange("bio")}
              rows={3}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #E2E8F0",
                fontSize: 14,
                color: "#0F172A",
                background: "#fff",
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </FormField>
        </Card>

        {/* Preferences */}
        <Card palette={ai} icon="⚙️" title={dt("section.preferences")}>
          <FormField label={dt("field.language")}>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
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
              <option value="TR">🇹🇷 Türkçe</option>
              <option value="EN">🇬🇧 English</option>
              <option value="AR">🇸🇦 العربية</option>
            </select>
          </FormField>
          <FormField label={dt("field.timezone")}>
            <FormInput value={form.timezone} onChange={onChange("timezone")} placeholder="Europe/Istanbul" />
          </FormField>
        </Card>

        {/* Security */}
        <Card palette={alert} icon="🔒" title={dt("section.security")}>
          <button
            type="button"
            onClick={() => setConfirmPwOpen(true)}
            style={{
              display: "block",
              width: "100%",
              padding: "12px 14px",
              borderRadius: 10,
              border: `1px solid ${alert.base}30`,
              background: "#fff",
              color: alert.dark,
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              marginBottom: 10,
              textAlign: "start",
            }}
          >
            {dt("action.changePassword")} →
          </button>
          <button
            type="button"
            onClick={() => toast.info(dt("action.enable2FA"))}
            style={{
              display: "block",
              width: "100%",
              padding: "12px 14px",
              borderRadius: 10,
              border: `1px solid ${alert.base}30`,
              background: "#fff",
              color: alert.dark,
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              textAlign: "start",
            }}
          >
            {dt("action.enable2FA")} →
          </button>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmPwOpen}
        title={dt("action.changePassword")}
        description="Send password reset link to your email?"
        palette={brand}
        onConfirm={() => {
          setConfirmPwOpen(false);
          toast.success("Reset link sent");
        }}
        onCancel={() => setConfirmPwOpen(false)}
      />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ToastProvider>
      <ProfilePageInner />
    </ToastProvider>
  );
}
