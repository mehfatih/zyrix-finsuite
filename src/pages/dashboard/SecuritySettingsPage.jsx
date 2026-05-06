// ============================================================
// Zyrix FinSuite - Security Settings Page (Sprint 3)
// 3 tabs: Users (RBAC), Audit Logs, IP Allowlist
// Trilingual: TR / EN / AR
// ============================================================

import React, { useState, useEffect } from "react";
import { useI18n } from "../../i18n/i18n";
import { sprint3API } from "../../services/api";

const COLORS = {
  primary: "#0891B2",
  accent: "#06B6D4",
  text: "#1E1B4B",
  muted: "#64748B",
  border: "#E2E8F8",
  bg: "#F8FAFC",
};

const ROLE_BADGE_COLORS = {
  OWNER: { bg: "#FEE2E2", color: "#991B1B" },
  ADMIN: { bg: "#DBEAFE", color: "#1E40AF" },
  MANAGER: { bg: "#D1FAE5", color: "#065F46" },
  ACCOUNTANT: { bg: "#FEF3C7", color: "#92400E" },
  STAFF: { bg: "#E0E7FF", color: "#3730A3" },
  VIEWER: { bg: "#F1F5F9", color: "#475569" },
};

// ----------------------------------------------------------------
// Translations
// ----------------------------------------------------------------

const TXT = {
  TR: {
    pageTitle: "Guvenlik & Kullanicilar",
    pageSubtitle: "Ekip uyelerini, denetim kayitlarini ve ag erisim kontrollerini yonetin",
    tabUsers: "Kullanicilar",
    tabAudit: "Denetim Kayitlari",
    tabIp: "IP Listesi",
    // Users
    usersTitle: "Ekip Uyeleri",
    usersDesc: "Ekip uyelerini davet edin ve roller atayin. Her rolun farkli izinleri vardir.",
    inviteBtn: "+ Kullanici Davet Et",
    emptyUsers: "Henuz ekip uyesi yok. Davet ederek baslayin.",
    colUser: "Kullanici",
    colRole: "Rol",
    colStatus: "Durum",
    colLastLogin: "Son Giris",
    colActions: "Islemler",
    statusActive: "Aktif",
    statusInactive: "Pasif",
    btnDisable: "Devre Disi Birak",
    btnEnable: "Etkinlestir",
    btnRemove: "Kaldir",
    confirmRemove: "{email} kaldirilsin mi? Erisim hemen kapanacak.",
    neverLogin: "Hic giris yapmadi",
    // Invite modal
    modalInviteTitle: "Ekip Uyesi Davet Et",
    fldName: "Tam Ad",
    fldEmail: "E-posta",
    fldRole: "Rol",
    fldPassword: "Baslangic Sifresi",
    placeholderName: "Ali Yilmaz",
    placeholderEmail: "kullanici@firma.com",
    placeholderPassword: "En az 8 karakter",
    errAllRequired: "Tum alanlar zorunlu",
    errPasswordShort: "Sifre en az 8 karakter olmali",
    btnCancel: "Iptal",
    btnCreating: "Olusturuluyor...",
    btnSendInvite: "Davet Gonder",
    // Audit
    statTotalEvents: "Olay (30g)",
    statFailures: "Hatalar",
    statRecentLogins: "Son Girisler",
    statActionTypes: "Islem Turu",
    filterAllActions: "Tum islemler",
    filterFailuresOnly: "Sadece hatalar",
    btnRefresh: "Yenile",
    emptyAudit: "Filtrelere uyan olay yok.",
    colTime: "Zaman",
    colUserCol: "Kullanici",
    colAction: "Islem",
    colResource: "Kaynak",
    colIp: "IP",
    colStatusCol: "Durum",
    statusOk: "OK",
    statusFail: "FAIL",
    // IP Allowlist
    ipModeTitle: "Uygulama Modu",
    ipModeDesc: "IP kurallarinin API isteklerine nasil uygulanacagini secin.",
    modeDisabled: "Devre Disi",
    modeDisabledDesc: "Kisitlama yok",
    modeAllowlist: "Allowlist",
    modeAllowlistDesc: "Sadece listedekiler",
    modeBlocklist: "Blocklist",
    modeBlocklistDesc: "Listedekiler engelli",
    confirmEmptyAllowlist: "Bos ALLOWLIST modu TUM erisimi engeller. Devam edilsin mi?",
    ipEntriesTitle: "IP Girisleri",
    ipEntriesDesc: "Tek IP (orn. 1.2.3.4) veya CIDR (orn. 10.0.0.0/24).",
    btnAddIp: "+ IP Ekle",
    emptyIp: "Henuz IP girisi yok.",
    colIpCidr: "IP / CIDR",
    colDescription: "Aciklama",
    colAdded: "Eklendi",
    confirmRemoveIp: "{ip} kaldirilsin mi?",
    modalAddIpTitle: "IP Adresi Ekle",
    fldIpCidr: "IP / CIDR",
    placeholderIpCidr: "1.2.3.4 veya 10.0.0.0/24",
    fldDesc: "Aciklama (opsiyonel)",
    placeholderDesc: "Ofis agi, VPN gateway...",
    errIpRequired: "IP adresi zorunlu",
    btnAdding: "Ekleniyor...",
    btnAdd: "Ekle",
    loading: "Yukleniyor...",
  },
  EN: {
    pageTitle: "Security & Users",
    pageSubtitle: "Manage team members, audit trail, and network access controls",
    tabUsers: "Users",
    tabAudit: "Audit Logs",
    tabIp: "IP Allowlist",
    usersTitle: "Team Members",
    usersDesc: "Invite team members and assign roles. Each role has a different set of permissions.",
    inviteBtn: "+ Invite User",
    emptyUsers: "No team members yet. Invite one to get started.",
    colUser: "User",
    colRole: "Role",
    colStatus: "Status",
    colLastLogin: "Last Login",
    colActions: "Actions",
    statusActive: "Active",
    statusInactive: "Inactive",
    btnDisable: "Disable",
    btnEnable: "Enable",
    btnRemove: "Remove",
    confirmRemove: "Remove {email}? They will lose access immediately.",
    neverLogin: "Never",
    modalInviteTitle: "Invite Team Member",
    fldName: "Full Name",
    fldEmail: "Email",
    fldRole: "Role",
    fldPassword: "Initial Password",
    placeholderName: "John Doe",
    placeholderEmail: "user@company.com",
    placeholderPassword: "Min 8 characters",
    errAllRequired: "All fields are required",
    errPasswordShort: "Password must be at least 8 characters",
    btnCancel: "Cancel",
    btnCreating: "Creating...",
    btnSendInvite: "Send Invite",
    statTotalEvents: "Events (30d)",
    statFailures: "Failures",
    statRecentLogins: "Recent Logins",
    statActionTypes: "Action Types",
    filterAllActions: "All actions",
    filterFailuresOnly: "Failures only",
    btnRefresh: "Refresh",
    emptyAudit: "No audit events match the current filter.",
    colTime: "Time",
    colUserCol: "User",
    colAction: "Action",
    colResource: "Resource",
    colIp: "IP",
    colStatusCol: "Status",
    statusOk: "OK",
    statusFail: "FAIL",
    ipModeTitle: "Enforcement Mode",
    ipModeDesc: "Choose how IP rules are applied to API requests.",
    modeDisabled: "Disabled",
    modeDisabledDesc: "No restrictions",
    modeAllowlist: "Allowlist",
    modeAllowlistDesc: "Only listed IPs allowed",
    modeBlocklist: "Blocklist",
    modeBlocklistDesc: "Listed IPs blocked",
    confirmEmptyAllowlist: "ALLOWLIST mode with no entries will block ALL access. Continue?",
    ipEntriesTitle: "IP Entries",
    ipEntriesDesc: "Single IPs (e.g. 1.2.3.4) or CIDR ranges (e.g. 10.0.0.0/24).",
    btnAddIp: "+ Add IP",
    emptyIp: "No IP entries configured.",
    colIpCidr: "IP / CIDR",
    colDescription: "Description",
    colAdded: "Added",
    confirmRemoveIp: "Remove {ip}?",
    modalAddIpTitle: "Add IP Address",
    fldIpCidr: "IP / CIDR",
    placeholderIpCidr: "1.2.3.4 or 10.0.0.0/24",
    fldDesc: "Description (optional)",
    placeholderDesc: "Office network, VPN gateway...",
    errIpRequired: "IP address required",
    btnAdding: "Adding...",
    btnAdd: "Add",
    loading: "Loading...",
  },
  AR: {
    pageTitle: "الأمان والمستخدمون",
    pageSubtitle: "إدارة أعضاء الفريق وسجل التدقيق وعناصر التحكم في الوصول إلى الشبكة",
    tabUsers: "المستخدمون",
    tabAudit: "سجلات التدقيق",
    tabIp: "قائمة IP المسموح بها",
    usersTitle: "أعضاء الفريق",
    usersDesc: "ادعُ أعضاء الفريق وعيّن الأدوار. كل دور لديه مجموعة مختلفة من الأذونات.",
    inviteBtn: "+ دعوة مستخدم",
    emptyUsers: "لا يوجد أعضاء فريق بعد. ابدأ بدعوة شخص.",
    colUser: "المستخدم",
    colRole: "الدور",
    colStatus: "الحالة",
    colLastLogin: "آخر دخول",
    colActions: "الإجراءات",
    statusActive: "نشط",
    statusInactive: "غير نشط",
    btnDisable: "تعطيل",
    btnEnable: "تفعيل",
    btnRemove: "إزالة",
    confirmRemove: "هل تريد إزالة {email}؟ سيفقد الوصول فوراً.",
    neverLogin: "لم يدخل أبداً",
    modalInviteTitle: "دعوة عضو فريق",
    fldName: "الاسم الكامل",
    fldEmail: "البريد الإلكتروني",
    fldRole: "الدور",
    fldPassword: "كلمة المرور الأولية",
    placeholderName: "محمد أحمد",
    placeholderEmail: "user@company.com",
    placeholderPassword: "8 أحرف على الأقل",
    errAllRequired: "جميع الحقول مطلوبة",
    errPasswordShort: "يجب أن تكون كلمة المرور 8 أحرف على الأقل",
    btnCancel: "إلغاء",
    btnCreating: "جاري الإنشاء...",
    btnSendInvite: "إرسال الدعوة",
    statTotalEvents: "الأحداث (30 يوم)",
    statFailures: "إخفاقات",
    statRecentLogins: "آخر الدخول",
    statActionTypes: "أنواع الإجراءات",
    filterAllActions: "جميع الإجراءات",
    filterFailuresOnly: "الإخفاقات فقط",
    btnRefresh: "تحديث",
    emptyAudit: "لا توجد أحداث تطابق الفلتر الحالي.",
    colTime: "الوقت",
    colUserCol: "المستخدم",
    colAction: "الإجراء",
    colResource: "المورد",
    colIp: "IP",
    colStatusCol: "الحالة",
    statusOk: "OK",
    statusFail: "فشل",
    ipModeTitle: "وضع التطبيق",
    ipModeDesc: "اختر كيفية تطبيق قواعد IP على طلبات API.",
    modeDisabled: "معطّل",
    modeDisabledDesc: "بدون قيود",
    modeAllowlist: "قائمة مسموحة",
    modeAllowlistDesc: "فقط IPs المدرجة",
    modeBlocklist: "قائمة محظورة",
    modeBlocklistDesc: "IPs المدرجة محظورة",
    confirmEmptyAllowlist: "وضع ALLOWLIST بدون مدخلات سيمنع جميع الوصول. هل تريد المتابعة؟",
    ipEntriesTitle: "مدخلات IP",
    ipEntriesDesc: "عناوين IP فردية (مثل 1.2.3.4) أو نطاقات CIDR (مثل 10.0.0.0/24).",
    btnAddIp: "+ إضافة IP",
    emptyIp: "لا توجد مدخلات IP مكوّنة.",
    colIpCidr: "IP / CIDR",
    colDescription: "الوصف",
    colAdded: "تمت الإضافة",
    confirmRemoveIp: "هل تريد إزالة {ip}؟",
    modalAddIpTitle: "إضافة عنوان IP",
    fldIpCidr: "IP / CIDR",
    placeholderIpCidr: "1.2.3.4 أو 10.0.0.0/24",
    fldDesc: "الوصف (اختياري)",
    placeholderDesc: "شبكة المكتب، بوابة VPN...",
    errIpRequired: "عنوان IP مطلوب",
    btnAdding: "جاري الإضافة...",
    btnAdd: "إضافة",
    loading: "جاري التحميل...",
  },
};

const ACTION_LABELS = {
  TR: {
    CREATE: "Olusturuldu", READ: "Okundu", UPDATE: "Guncellendi", DELETE: "Silindi",
    LOGIN: "Giris", LOGOUT: "Cikis", EXPORT: "Disa Aktarildi", IMPORT: "Iceri Aktarildi",
    PERMISSION_CHANGE: "Izin Degisikligi", SUBSCRIPTION_CHANGE: "Abonelik Degisikligi",
    CONNECTION_CONNECT: "Baglanti", CONNECTION_DISCONNECT: "Baglanti Kesimi",
    WEBHOOK_RECEIVED: "Webhook", CRON_RUN: "Cron Isi", ERROR: "Hata",
  },
  EN: {
    CREATE: "Created", READ: "Read", UPDATE: "Updated", DELETE: "Deleted",
    LOGIN: "Login", LOGOUT: "Logout", EXPORT: "Exported", IMPORT: "Imported",
    PERMISSION_CHANGE: "Permission Change", SUBSCRIPTION_CHANGE: "Subscription Change",
    CONNECTION_CONNECT: "Connection Connect", CONNECTION_DISCONNECT: "Connection Disconnect",
    WEBHOOK_RECEIVED: "Webhook", CRON_RUN: "Cron Job", ERROR: "Error",
  },
  AR: {
    CREATE: "إنشاء", READ: "قراءة", UPDATE: "تحديث", DELETE: "حذف",
    LOGIN: "دخول", LOGOUT: "خروج", EXPORT: "تصدير", IMPORT: "استيراد",
    PERMISSION_CHANGE: "تغيير الإذن", SUBSCRIPTION_CHANGE: "تغيير الاشتراك",
    CONNECTION_CONNECT: "اتصال", CONNECTION_DISCONNECT: "قطع الاتصال",
    WEBHOOK_RECEIVED: "Webhook", CRON_RUN: "مهمة Cron", ERROR: "خطأ",
  },
};

// ============================================================
// MAIN
// ============================================================

export default function SecuritySettingsPage() {
  const { lang } = useI18n();
  const t = TXT[lang] || TXT.TR;

  const [tab, setTab] = useState("users");

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: COLORS.text, margin: 0 }}>
          🔒 {t.pageTitle}
        </h1>
        <p style={{ color: COLORS.muted, fontSize: 13, margin: "4px 0 0" }}>
          {t.pageSubtitle}
        </p>
      </div>

      <div style={{ display: "flex", gap: 4, borderBottom: `1.5px solid ${COLORS.border}`, marginBottom: 24 }}>
        <TabBtn active={tab === "users"} onClick={() => setTab("users")}>👥 {t.tabUsers}</TabBtn>
        <TabBtn active={tab === "audit"} onClick={() => setTab("audit")}>📋 {t.tabAudit}</TabBtn>
        <TabBtn active={tab === "ip"} onClick={() => setTab("ip")}>🌐 {t.tabIp}</TabBtn>
      </div>

      {tab === "users" && <UsersTab t={t} lang={lang} />}
      {tab === "audit" && <AuditTab t={t} lang={lang} />}
      {tab === "ip" && <IpAllowlistTab t={t} />}
    </div>
  );
}

// ============================================================
// USERS TAB
// ============================================================

function UsersTab({ t }) {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInvite, setShowInvite] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [u, r] = await Promise.all([
        sprint3API.listUsers(),
        sprint3API.rolesCatalog(),
      ]);
      setUsers(u?.data?.users || []);
      setRoles(r?.data?.roles || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onDelete = async (user) => {
    if (!confirm(t.confirmRemove.replace("{email}", user.email))) return;
    try {
      await sprint3API.deleteUser(user.id);
      await load();
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const onToggleActive = async (user) => {
    try {
      await sprint3API.updateUser(user.id, { isActive: !user.isActive });
      await load();
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  if (loading) return <Loading>{t.loading}</Loading>;
  if (error) return <ErrorBox>{error}</ErrorBox>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, color: COLORS.text }}>{t.usersTitle} ({users.length})</h3>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: COLORS.muted }}>{t.usersDesc}</p>
        </div>
        <button onClick={() => setShowInvite(true)} style={btnPrimary}>{t.inviteBtn}</button>
      </div>

      {users.length === 0 ? (
        <EmptyState>{t.emptyUsers}</EmptyState>
      ) : (
        <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: COLORS.bg }}>
              <tr>
                <Th>{t.colUser}</Th>
                <Th>{t.colRole}</Th>
                <Th>{t.colStatus}</Th>
                <Th>{t.colLastLogin}</Th>
                <Th align="right">{t.colActions}</Th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                  <Td>
                    <div style={{ fontWeight: 600, color: COLORS.text }}>{u.name}</div>
                    <div style={{ fontSize: 12, color: COLORS.muted }}>{u.email}</div>
                  </Td>
                  <Td><RoleBadge role={u.role} /></Td>
                  <Td>
                    <span style={{
                      padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 600,
                      background: u.isActive ? "#D1FAE5" : "#FEE2E2",
                      color: u.isActive ? "#065F46" : "#991B1B",
                    }}>
                      {u.isActive ? t.statusActive : t.statusInactive}
                    </span>
                  </Td>
                  <Td>{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : <span style={{ color: COLORS.muted }}>{t.neverLogin}</span>}</Td>
                  <Td align="right">
                    <button onClick={() => onToggleActive(u)} style={btnSm}>{u.isActive ? t.btnDisable : t.btnEnable}</button>
                    <button onClick={() => onDelete(u)} style={{ ...btnSm, marginLeft: 8, color: "#991B1B" }}>{t.btnRemove}</button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showInvite && (
        <InviteModal
          t={t}
          roles={roles}
          onClose={() => setShowInvite(false)}
          onCreated={() => { setShowInvite(false); load(); }}
        />
      )}
    </div>
  );
}

function InviteModal({ t, roles, onClose, onCreated }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("STAFF");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    setError(null);
    if (!email || !name || !password) {
      setError(t.errAllRequired);
      return;
    }
    if (password.length < 8) {
      setError(t.errPasswordShort);
      return;
    }
    setSubmitting(true);
    try {
      await sprint3API.inviteUser({ email, name, role, password });
      onCreated();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <h3 style={{ margin: "0 0 16px", color: COLORS.text }}>{t.modalInviteTitle}</h3>

      <Field label={t.fldName}>
        <input value={name} onChange={(e) => setName(e.target.value)} style={inp} placeholder={t.placeholderName} />
      </Field>
      <Field label={t.fldEmail}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} style={inp} placeholder={t.placeholderEmail} />
      </Field>
      <Field label={t.fldRole}>
        <select value={role} onChange={(e) => setRole(e.target.value)} style={inp}>
          {roles.filter((r) => r.role !== "OWNER").map((r) => (
            <option key={r.role} value={r.role}>
              {r.label} - {r.description}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t.fldPassword}>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inp} placeholder={t.placeholderPassword} />
      </Field>

      {error && <div style={{ color: "#991B1B", fontSize: 13, marginTop: 8 }}>{error}</div>}

      <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}>
        <button onClick={onClose} style={btnSecondary}>{t.btnCancel}</button>
        <button onClick={submit} disabled={submitting} style={{ ...btnPrimary, opacity: submitting ? 0.6 : 1 }}>
          {submitting ? t.btnCreating : t.btnSendInvite}
        </button>
      </div>
    </ModalOverlay>
  );
}

// ============================================================
// AUDIT LOGS TAB
// ============================================================

function AuditTab({ t, lang }) {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState({ action: "", failuresOnly: false });

  const labels = ACTION_LABELS[lang] || ACTION_LABELS.TR;

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filter.action) params.action = filter.action;
      if (filter.failuresOnly) params.failuresOnly = "true";
      params.limit = 100;

      const [l, s] = await Promise.all([
        sprint3API.listAuditLogs(params),
        sprint3API.auditSummary(30),
      ]);
      setLogs(l?.data?.rows || []);
      setSummary(s?.data || null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter.action, filter.failuresOnly]);

  if (loading) return <Loading>{t.loading}</Loading>;
  if (error) return <ErrorBox>{error}</ErrorBox>;

  return (
    <div>
      {summary && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
          <StatCard label={t.statTotalEvents} value={summary.totalEvents} />
          <StatCard label={t.statFailures} value={summary.failures} color={summary.failures > 0 ? "#EF4444" : "#10B981"} />
          <StatCard label={t.statRecentLogins} value={summary.recentLogins?.length || 0} />
          <StatCard label={t.statActionTypes} value={summary.byAction?.length || 0} />
        </div>
      )}

      <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
        <select
          value={filter.action}
          onChange={(e) => setFilter({ ...filter, action: e.target.value })}
          style={{ ...inp, width: "auto", padding: "8px 12px" }}
        >
          <option value="">{t.filterAllActions}</option>
          {Object.entries(labels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <label style={{ fontSize: 13, color: COLORS.text, display: "flex", alignItems: "center", gap: 6 }}>
          <input
            type="checkbox"
            checked={filter.failuresOnly}
            onChange={(e) => setFilter({ ...filter, failuresOnly: e.target.checked })}
          />
          {t.filterFailuresOnly}
        </label>

        <button onClick={load} style={btnSm}>🔄 {t.btnRefresh}</button>
      </div>

      {logs.length === 0 ? (
        <EmptyState>{t.emptyAudit}</EmptyState>
      ) : (
        <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: COLORS.bg }}>
              <tr>
                <Th>{t.colTime}</Th>
                <Th>{t.colUserCol}</Th>
                <Th>{t.colAction}</Th>
                <Th>{t.colResource}</Th>
                <Th>{t.colIp}</Th>
                <Th>{t.colStatusCol}</Th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                  <Td><span style={{ fontSize: 12, color: COLORS.muted }}>{new Date(log.createdAt).toLocaleString()}</span></Td>
                  <Td><span style={{ fontSize: 12 }}>{log.userEmail || "-"}</span></Td>
                  <Td><span style={{ fontSize: 12, fontWeight: 600 }}>{labels[log.action] || log.action}</span></Td>
                  <Td>
                    <span style={{ fontSize: 12 }}>{log.resource}</span>
                    {log.resourceId && <span style={{ fontSize: 10, color: COLORS.muted, display: "block" }}>{log.resourceId.substring(0, 12)}...</span>}
                  </Td>
                  <Td><span style={{ fontSize: 11, fontFamily: "monospace", color: COLORS.muted }}>{log.ipAddress || "-"}</span></Td>
                  <Td>
                    <span style={{
                      padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 600,
                      background: log.success ? "#D1FAE5" : "#FEE2E2",
                      color: log.success ? "#065F46" : "#991B1B",
                    }}>
                      {log.success ? t.statusOk : t.statusFail}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================
// IP ALLOWLIST TAB
// ============================================================

function IpAllowlistTab({ t }) {
  const [config, setConfig] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await sprint3API.getAllowlist();
      setConfig(r?.data?.config || null);
      setEntries(r?.data?.entries || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onChangeMode = async (mode) => {
    if (mode === "ALLOWLIST" && entries.length === 0) {
      if (!confirm(t.confirmEmptyAllowlist)) return;
    }
    try {
      await sprint3API.setAllowlistMode(mode);
      await load();
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const onToggle = async (entry) => {
    try {
      await sprint3API.toggleAllowlistEntry(entry.id, !entry.isActive);
      await load();
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  const onRemove = async (entry) => {
    if (!confirm(t.confirmRemoveIp.replace("{ip}", entry.ipAddress))) return;
    try {
      await sprint3API.removeAllowlistEntry(entry.id);
      await load();
    } catch (e) {
      alert("Error: " + e.message);
    }
  };

  if (loading) return <Loading>{t.loading}</Loading>;
  if (error) return <ErrorBox>{error}</ErrorBox>;

  const mode = config?.mode || "DISABLED";

  return (
    <div>
      <div style={{ background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20, marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 8px", color: COLORS.text, fontSize: 15 }}>{t.ipModeTitle}</h3>
        <p style={{ margin: "0 0 16px", fontSize: 12, color: COLORS.muted }}>{t.ipModeDesc}</p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[
            { v: "DISABLED",  label: t.modeDisabled,  desc: t.modeDisabledDesc },
            { v: "ALLOWLIST", label: t.modeAllowlist, desc: t.modeAllowlistDesc },
            { v: "BLOCKLIST", label: t.modeBlocklist, desc: t.modeBlocklistDesc },
          ].map((m) => (
            <ModeButton
              key={m.v}
              active={mode === m.v}
              onClick={() => onChangeMode(m.v)}
              label={m.label}
              desc={m.desc}
            />
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, color: COLORS.text }}>{t.ipEntriesTitle} ({entries.length})</h3>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: COLORS.muted }}>{t.ipEntriesDesc}</p>
        </div>
        <button onClick={() => setShowAdd(true)} style={btnPrimary}>{t.btnAddIp}</button>
      </div>

      {entries.length === 0 ? (
        <EmptyState>{t.emptyIp}</EmptyState>
      ) : (
        <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: COLORS.bg }}>
              <tr>
                <Th>{t.colIpCidr}</Th>
                <Th>{t.colDescription}</Th>
                <Th>{t.colStatus}</Th>
                <Th>{t.colAdded}</Th>
                <Th align="right">{t.colActions}</Th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                  <Td><code style={{ fontFamily: "monospace", color: COLORS.text }}>{e.ipAddress}</code></Td>
                  <Td>{e.description || <span style={{ color: COLORS.muted }}>—</span>}</Td>
                  <Td>
                    <span style={{
                      padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 600,
                      background: e.isActive ? "#D1FAE5" : "#F1F5F9",
                      color: e.isActive ? "#065F46" : "#475569",
                    }}>
                      {e.isActive ? t.statusActive : t.statusInactive}
                    </span>
                  </Td>
                  <Td><span style={{ fontSize: 12, color: COLORS.muted }}>{new Date(e.createdAt).toLocaleDateString()}</span></Td>
                  <Td align="right">
                    <button onClick={() => onToggle(e)} style={btnSm}>{e.isActive ? t.btnDisable : t.btnEnable}</button>
                    <button onClick={() => onRemove(e)} style={{ ...btnSm, marginLeft: 8, color: "#991B1B" }}>{t.btnRemove}</button>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && (
        <AddIpModal t={t} onClose={() => setShowAdd(false)} onAdded={() => { setShowAdd(false); load(); }} />
      )}
    </div>
  );
}

function AddIpModal({ t, onClose, onAdded }) {
  const [ip, setIp] = useState("");
  const [desc, setDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    setError(null);
    if (!ip) { setError(t.errIpRequired); return; }
    setSubmitting(true);
    try {
      await sprint3API.addAllowlistEntry(ip, desc);
      onAdded();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <h3 style={{ margin: "0 0 16px", color: COLORS.text }}>{t.modalAddIpTitle}</h3>

      <Field label={t.fldIpCidr}>
        <input value={ip} onChange={(e) => setIp(e.target.value)} style={inp} placeholder={t.placeholderIpCidr} />
      </Field>
      <Field label={t.fldDesc}>
        <input value={desc} onChange={(e) => setDesc(e.target.value)} style={inp} placeholder={t.placeholderDesc} />
      </Field>

      {error && <div style={{ color: "#991B1B", fontSize: 13, marginTop: 8 }}>{error}</div>}

      <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "flex-end" }}>
        <button onClick={onClose} style={btnSecondary}>{t.btnCancel}</button>
        <button onClick={submit} disabled={submitting} style={{ ...btnPrimary, opacity: submitting ? 0.6 : 1 }}>
          {submitting ? t.btnAdding : t.btnAdd}
        </button>
      </div>
    </ModalOverlay>
  );
}

// ============================================================
// SHARED COMPONENTS (no text changes needed)
// ============================================================

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "transparent", border: "none", padding: "10px 18px",
        fontSize: 13, fontWeight: active ? 700 : 500,
        color: active ? COLORS.primary : COLORS.muted,
        borderBottom: active ? `2px solid ${COLORS.primary}` : "2px solid transparent",
        cursor: "pointer", marginBottom: -1.5,
      }}
    >
      {children}
    </button>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 14 }}>
      <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 600, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: color || COLORS.text, marginTop: 4 }}>{value}</div>
    </div>
  );
}

function RoleBadge({ role }) {
  const c = ROLE_BADGE_COLORS[role] || { bg: "#F1F5F9", color: "#475569" };
  return (
    <span style={{
      background: c.bg, color: c.color, padding: "3px 10px", borderRadius: 10,
      fontSize: 11, fontWeight: 700,
    }}>
      {role}
    </span>
  );
}

function ModeButton({ active, onClick, label, desc }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, minWidth: 160,
        background: active ? COLORS.primary : "#fff",
        color: active ? "#fff" : COLORS.text,
        border: active ? "none" : `1.5px solid ${COLORS.border}`,
        borderRadius: 10, padding: 14, cursor: "pointer", textAlign: "left",
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 14 }}>{label}</div>
      <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>{desc}</div>
    </button>
  );
}

function ModalOverlay({ children, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: 20,
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 14, padding: 28, width: "100%", maxWidth: 460 }}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: COLORS.text, marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}

function Th({ children, align }) {
  return (
    <th style={{
      padding: "12px 16px", textAlign: align || "left",
      fontSize: 11, fontWeight: 700, color: COLORS.muted,
      textTransform: "uppercase", letterSpacing: "0.05em",
    }}>{children}</th>
  );
}

function Td({ children, align }) {
  return (
    <td style={{ padding: "12px 16px", textAlign: align || "left", fontSize: 13, color: COLORS.text }}>{children}</td>
  );
}

function Loading({ children }) {
  return <div style={{ padding: 40, textAlign: "center", color: COLORS.muted }}>{children}</div>;
}

function ErrorBox({ children }) {
  return <div style={{ padding: 14, background: "#FEE2E2", color: "#991B1B", borderRadius: 10, marginBottom: 16 }}>{children}</div>;
}

function EmptyState({ children }) {
  return (
    <div style={{
      padding: 40, textAlign: "center", color: COLORS.muted,
      background: "#fff", borderRadius: 12, border: `1px dashed ${COLORS.border}`,
    }}>{children}</div>
  );
}

const inp = {
  width: "100%", padding: "10px 12px", borderRadius: 8,
  border: `1.5px solid ${COLORS.border}`, fontSize: 13,
  outline: "none", fontFamily: "inherit",
};

const btnPrimary = {
  background: COLORS.primary, color: "#fff", border: "none",
  borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer",
};

const btnSecondary = {
  background: "#fff", color: COLORS.text, border: `1.5px solid ${COLORS.border}`,
  borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer",
};

const btnSm = {
  background: "transparent", color: COLORS.text, border: `1px solid ${COLORS.border}`,
  borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer",
};
