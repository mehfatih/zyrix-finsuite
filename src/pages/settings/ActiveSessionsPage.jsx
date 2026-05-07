// ================================================================
// /settings/sessions — Active devices list with revoke
// ================================================================
import React, { useEffect, useState } from "react";
import { useI18n } from "../../i18n/i18n";
import { useDashboardI18n } from "../../i18n/dashboard";
import { TRUST_PALETTE } from "../../utils/trustPalette";
import { getAlertPalette } from "../../utils/dashboardPalette";
import PageHeader from "../../components/dashboard/PageHeader";
import EmptyState from "../../components/dashboard/EmptyState";
import SessionCard from "../../components/trust/SessionCard";
import { listSessions, revokeSession } from "./securityApi";

export default function ActiveSessionsPage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("security");
  const p = TRUST_PALETTE;
  const alert = getAlertPalette();
  const [sessions, setSessions] = useState([]);

  const load = () => listSessions().then(setSessions);
  useEffect(() => { load(); }, []);

  const onRevoke = async (s) => {
    if (!window.confirm(`${t("sessions.revoke")} — ${s.deviceInfo?.browser}?`)) return;
    await revokeSession(s.id);
    setSessions((arr) => arr.filter((x) => x.id !== s.id));
  };

  const onRevokeAll = async () => {
    if (!window.confirm(t("sessions.revokeAll"))) return;
    const others = sessions.filter((s) => !s.current);
    await Promise.all(others.map((s) => revokeSession(s.id)));
    setSessions((arr) => arr.filter((x) => x.current));
  };

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <PageHeader
        title={t("sessions.title")}
        subtitle={t("sessions.subtitle")}
        icon="💻"
        palette={p}
        actions={
          sessions.filter((s) => !s.current).length > 0 && (
            <button type="button" onClick={onRevokeAll} style={{ background: alert.bg, color: alert.dark, border: `1px solid ${alert.base}40`, padding: "10px 16px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>
              {t("sessions.revokeAll")}
            </button>
          )
        }
      />

      {sessions.length === 0 ? (
        <EmptyState icon="💻" title={t("sessions.empty")} palette={p} />
      ) : (
        <div>
          {sessions.map((s) => (
            <SessionCard key={s.id} session={s} onRevoke={onRevoke} t={t} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
}
