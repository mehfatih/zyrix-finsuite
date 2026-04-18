import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";

const P = {
  bg:"#F0F4FF", card:"#FFFFFF", border:"#E2E8F8",
  purple:"#6C3AFF", pink:"#F43F8E", text:"#1E1B4B",
  sub:"#64748B", muted:"#94A3B8", light:"#F8FAFF",
  emerald:"#10B981", rose:"#F43F5E", amber:"#F59E0B",
  cyan:"#0EA5E9", indigo:"#6366F1", teal:"#14B8A6", orange:"#F97316",
};
const COLORS = [P.purple, P.cyan, P.emerald, P.amber, P.pink, P.indigo, P.teal, P.orange];
const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

const TR_PROVINCES = [
  "Adana","Adıyaman","Afyonkarahisar","Ağrı","Aksaray","Amasya","Ankara","Antalya",
  "Ardahan","Artvin","Aydın","Balıkesir","Bartın","Batman","Bayburt","Bilecik",
  "Bingöl","Bitlis","Bolu","Burdur","Bursa","Çanakkale","Çankırı","Çorum",
  "Denizli","Diyarbakır","Düzce","Edirne","Elazığ","Erzincan","Erzurum","Eskişehir",
  "Gaziantep","Giresun","Gümüşhane","Hakkari","Hatay","Iğdır","Isparta","İstanbul",
  "İzmir","Kahramanmaraş","Karabük","Karaman","Kars","Kastamonu","Kayseri","Kilis",
  "Kırıkkale","Kırklareli","Kırşehir","Kocaeli","Konya","Kütahya","Malatya","Manisa",
  "Mardin","Mersin","Muğla","Muş","Nevşehir","Niğde","Ordu","Osmaniye","Rize",
  "Sakarya","Samsun","Şanlıurfa","Siirt","Sinop","Şırnak","Sivas","Tekirdağ",
  "Tokat","Trabzon","Tunceli","Uşak","Van","Yalova","Yozgat","Zonguldak",
];

async function adminFetch(path, options = {}) {
  const token = localStorage.getItem("zyrix_token");
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { "Content-Type":"application/json", ...(token?{Authorization:`Bearer ${token}`}:{}), ...options.headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || `Error ${res.status}`);
  return data;
}

function useData(path, deps=[]) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const load = useCallback(async () => {
    setLoading(true);
    try { setData((await adminFetch(path))?.data || null); }
    catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }, [path, ...deps]);
  useEffect(() => { load(); }, [load]);
  return { data, loading, error, reload: load };
}

function Spinner() {
  return <div style={{ display:"flex", justifyContent:"center", padding:48 }}><div style={{ width:36, height:36, border:`3px solid ${P.border}`, borderTopColor:P.purple, borderRadius:"50%", animation:"spin 0.7s linear infinite" }} /></div>;
}

function StatCard({ label, value, icon, color, sub }) {
  return (
    <div style={{ background:P.card, borderRadius:16, padding:"16px 18px", border:`1.5px solid ${color}20`, boxShadow:`0 4px 20px ${color}08`, position:"relative", overflow:"hidden", transition:"transform 0.2s", cursor:"default" }}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)"}} onMouseLeave={e=>{e.currentTarget.style.transform=""}}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${color},${color}60)` }} />
      <div style={{ position:"absolute", bottom:-14, right:-14, width:56, height:56, borderRadius:"50%", background:color, opacity:0.06 }} />
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
        <span style={{ color:P.sub, fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em" }}>{label}</span>
        <div style={{ background:`${color}15`, borderRadius:8, padding:"4px 7px", fontSize:14 }}>{icon}</div>
      </div>
      <div style={{ color:P.text, fontSize:24, fontWeight:800 }}>{value ?? "—"}</div>
      {sub && <div style={{ color, fontSize:11, fontWeight:600, marginTop:3 }}>{sub}</div>}
    </div>
  );
}

function Badge({ val, color }) {
  return <span style={{ background:`${color}15`, color, border:`1px solid ${color}25`, borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:700 }}>{val}</span>;
}

function Input({ label, value, onChange, type="text", placeholder, disabled, hint }) {
  const [f, setF] = useState(false);
  return (
    <div>
      {label && <label style={{ color:P.sub, fontSize:12, fontWeight:600, display:"block", marginBottom:5 }}>{label}</label>}
      <input type={type} value={value||""} onChange={onChange} placeholder={placeholder} disabled={disabled}
        onFocus={()=>setF(true)} onBlur={()=>setF(false)}
        style={{ width:"100%", background:disabled?P.bg:P.light, border:`1.5px solid ${f?P.purple:P.border}`, color:P.text, borderRadius:10, padding:"10px 14px", fontSize:14, outline:"none", boxSizing:"border-box", transition:"border-color 0.15s", opacity:disabled?0.6:1 }} />
      {hint && <div style={{ color:P.muted, fontSize:11, marginTop:3 }}>{hint}</div>}
    </div>
  );
}

function Modal({ open, title, color=P.purple, onClose, children }) {
  if (!open) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(30,27,75,0.5)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(4px)" }}>
      <div style={{ background:P.card, border:`1.5px solid ${P.border}`, borderRadius:20, padding:28, width:"100%", maxWidth:500, boxShadow:`0 24px 64px ${color}15`, maxHeight:"90vh", overflowY:"auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
          <h3 style={{ color:P.text, fontSize:17, fontWeight:800, margin:0 }}>{title}</h3>
          <button onClick={onClose} style={{ background:P.light, border:`1px solid ${P.border}`, color:P.sub, width:30, height:30, borderRadius:9, cursor:"pointer", fontSize:16 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Merchant Details Page ─────────────────────────
function MerchantDetailsPage({ merchantId, onBack }) {
  const { data: merchant, loading, reload } = useData(`/api/admin/merchants/${merchantId}`);
  const [activeTab, setActiveTab] = useState("overview");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Modals
  const [extendModal, setExtendModal] = useState(false);
  const [notifModal, setNotifModal] = useState(false);
  const [resetPwModal, setResetPwModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [archiveModal, setArchiveModal] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState(null);
  const [extendDays, setExtendDays] = useState(14);
  const [notifForm, setNotifForm] = useState({ title:"", body:"", type:"INFO" });
  const [newPassword, setNewPassword] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => { if (merchant) { setEditForm({ ...merchant }); setAdminNotes(merchant.adminNotes || ""); } }, [merchant?.id]);

  const showSuccess = (msg) => { setSuccess(msg); setTimeout(() => setSuccess(""), 3000); };
  const showError   = (msg) => { setError(msg);   setTimeout(() => setError(""), 4000); };

  const doSave = async () => {
    setSaving(true);
    try {
      await adminFetch(`/api/admin/merchants/${merchantId}`, { method:"PATCH", body:JSON.stringify({ name:editForm.name, businessName:editForm.businessName, phone:editForm.phone, country:editForm.country, adminNotes, trialEndsAt:editForm.trialEndsAt }) });
      showSuccess("Kaydedildi ✅"); reload();
    } catch(e) { showError(e.message); }
    finally { setSaving(false); }
  };

  const doExtendTrial = async () => {
    try {
      await adminFetch(`/api/admin/merchants/${merchantId}/extend-trial`, { method:"POST", body:JSON.stringify({ days:extendDays }) });
      showSuccess(`${extendDays} gün eklendi ✅`); setExtendModal(false); reload();
    } catch(e) { showError(e.message); }
  };

  const doSendNotif = async () => {
    try {
      await adminFetch(`/api/admin/merchants/${merchantId}/notify`, { method:"POST", body:JSON.stringify(notifForm) });
      showSuccess("Bildirim gönderildi ✅"); setNotifModal(false); setNotifForm({ title:"", body:"", type:"INFO" });
    } catch(e) { showError(e.message); }
  };

  const doResetPassword = async () => {
    try {
      await adminFetch(`/api/admin/merchants/${merchantId}/reset-password`, { method:"POST", body:JSON.stringify({ newPassword }) });
      showSuccess("Şifre sıfırlandı ✅"); setResetPwModal(false); setNewPassword("");
    } catch(e) { showError(e.message); }
  };

  const doArchive = async () => {
    try {
      await adminFetch(`/api/admin/merchants/${merchantId}/archive`, { method:"POST" });
      showSuccess("Arşivlendi ✅"); setArchiveModal(false); reload();
    } catch(e) { showError(e.message); }
  };

  const doUnarchive = async () => {
    try {
      await adminFetch(`/api/admin/merchants/${merchantId}/unarchive`, { method:"POST" });
      showSuccess("Arşivden çıkarıldı ✅"); reload();
    } catch(e) { showError(e.message); }
  };

  const doDelete = async () => {
    if (deleteConfirm !== "DELETE") { showError('Onay için "DELETE" yazın'); return; }
    try {
      await adminFetch(`/api/admin/merchants/${merchantId}`, { method:"DELETE", body:JSON.stringify({ confirm:"DELETE" }) });
      onBack();
    } catch(e) { showError(e.message); }
  };

  const loadAuditLog = async () => {
    try { const r = await adminFetch(`/api/admin/merchants/${merchantId}/audit`); setAuditLogs(r.data || []); }
    catch {}
  };

  const doStatusChange = async (status) => {
    try {
      await adminFetch(`/api/admin/merchants/${merchantId}/status`, { method:"PUT", body:JSON.stringify({ status }) });
      showSuccess("Durum güncellendi ✅"); reload();
    } catch(e) { showError(e.message); }
  };

  const doPlanChange = async (plan) => {
    try {
      await adminFetch(`/api/admin/merchants/${merchantId}/plan`, { method:"PUT", body:JSON.stringify({ plan }) });
      showSuccess("Plan güncellendi ✅"); reload();
    } catch(e) { showError(e.message); }
  };

  if (loading) return <div style={{ padding:40 }}><Spinner /></div>;
  if (!merchant) return <div style={{ padding:40, color:P.muted, textAlign:"center" }}>Merchant bulunamadı</div>;

  const statusColor = { ACTIVE:P.emerald, SUSPENDED:P.rose, TRIAL:P.amber, EXPIRED:P.muted, INACTIVE:P.muted };
  const planColor   = { FREE:P.muted, STARTER:P.cyan, BUSINESS:P.purple, PRO:P.pink, ENTERPRISE:P.amber };

  const TABS = [
    { id:"overview",  icon:"📋", label:"Genel Bakış" },
    { id:"account",   icon:"⚙️", label:"Hesap" },
    { id:"notes",     icon:"📝", label:"Notlar" },
    { id:"activity",  icon:"📊", label:"Aktivite" },
    { id:"actions",   icon:"⚡", label:"İşlemler" },
    { id:"danger",    icon:"🗑️", label:"Tehlikeli Alan" },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:24 }}>
        <button onClick={onBack} style={{ background:P.light, border:`1.5px solid ${P.border}`, color:P.sub, borderRadius:10, padding:"8px 16px", cursor:"pointer", fontSize:13, fontWeight:600 }}>← Geri</button>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:44, height:44, borderRadius:"50%", background:`linear-gradient(135deg,${P.purple},${P.pink})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:18, fontWeight:800 }}>
              {(merchant.name||"?")[0].toUpperCase()}
            </div>
            <div>
              <div style={{ color:P.text, fontSize:20, fontWeight:800, display:"flex", alignItems:"center", gap:10 }}>
                {merchant.name}
                {merchant.archivedAt && <span style={{ background:`${P.muted}15`, color:P.muted, borderRadius:20, padding:"2px 10px", fontSize:11, fontWeight:700 }}>ARŞİV</span>}
              </div>
              <div style={{ color:P.sub, fontSize:13 }}>{merchant.email} · 📍 {merchant.country}</div>
            </div>
          </div>
        </div>
        <Badge val={merchant.status} color={statusColor[merchant.status]||P.muted} />
        <Badge val={merchant.plan} color={planColor[merchant.plan]||P.muted} />
        <button onClick={doSave} disabled={saving} style={{ background:`linear-gradient(135deg,${P.purple},${P.pink})`, border:"none", color:"#fff", borderRadius:10, padding:"9px 22px", cursor:"pointer", fontSize:14, fontWeight:700, opacity:saving?0.7:1 }}>
          {saving?"Kaydediliyor...":"Kaydet"}
        </button>
      </div>

      {success && <div style={{ background:`${P.emerald}12`, border:`1.5px solid ${P.emerald}25`, borderRadius:12, padding:"12px 16px", color:P.emerald, fontSize:13, fontWeight:600, marginBottom:16 }}>{success}</div>}
      {error   && <div style={{ background:`${P.rose}12`,    border:`1.5px solid ${P.rose}25`,    borderRadius:12, padding:"12px 16px", color:P.rose,    fontSize:13, fontWeight:600, marginBottom:16 }}>⚠ {error}</div>}

      {/* Quick Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:22 }}>
        <StatCard label="Müşteriler" value={merchant._count?.customers} icon="👥" color={P.purple} />
        <StatCard label="Faturalar"  value={merchant._count?.invoices}  icon="📄" color={P.cyan} />
        <StatCard label="Anlaşmalar" value={merchant._count?.deals}     icon="🤝" color={P.amber} />
        <StatCard label="Görevler"   value={merchant._count?.tasks}     icon="✅" color={P.emerald} />
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:4, marginBottom:20, background:P.light, borderRadius:14, padding:4, border:`1.5px solid ${P.border}` }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setActiveTab(t.id); if(t.id==="activity") loadAuditLog(); }} style={{
            flex:1, background:activeTab===t.id?P.card:"transparent",
            border:`1.5px solid ${activeTab===t.id?P.purple+"25":"transparent"}`,
            borderRadius:10, color:activeTab===t.id?P.purple:P.sub,
            padding:"8px 4px", cursor:"pointer", fontSize:12, fontWeight:activeTab===t.id?700:500,
            display:"flex", flexDirection:"column", alignItems:"center", gap:3, transition:"all 0.15s",
          }}>
            <span style={{ fontSize:15 }}>{t.icon}</span>
            <span style={{ whiteSpace:"nowrap" }}>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ background:P.card, borderRadius:20, padding:24, border:`1.5px solid ${P.border}`, boxShadow:"0 2px 16px rgba(108,58,255,0.06)" }}>

        {/* OVERVIEW */}
        {activeTab==="overview" && editForm && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <h3 style={{ color:P.text, fontSize:16, fontWeight:800, margin:0 }}>Kişisel & İşletme Bilgileri</h3>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <Input label="Ad Soyad" value={editForm.name} onChange={e=>setEditForm(f=>({...f,name:e.target.value}))} />
              <Input label="İşletme Adı" value={editForm.businessName} onChange={e=>setEditForm(f=>({...f,businessName:e.target.value}))} />
              <Input label="E-posta" value={editForm.email} disabled />
              <Input label="Telefon" value={editForm.phone} onChange={e=>setEditForm(f=>({...f,phone:e.target.value}))} placeholder="+90 532 123 45 67" />
              <div>
                <label style={{ color:P.sub, fontSize:12, fontWeight:600, display:"block", marginBottom:5 }}>📍 İl</label>
                <select value={editForm.country||"İstanbul"} onChange={e=>setEditForm(f=>({...f,country:e.target.value}))}
                  style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, color:P.text, borderRadius:10, padding:"10px 14px", fontSize:14, outline:"none" }}>
                  {TR_PROVINCES.map(p=><option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <Input label="İşletme Türü" value={editForm.businessType||""} onChange={e=>setEditForm(f=>({...f,businessType:e.target.value}))} placeholder="Perakende, Hizmet..." />
            </div>
            <div style={{ paddingTop:16, borderTop:`1px solid ${P.border}` }}>
              <h4 style={{ color:P.text, fontSize:14, fontWeight:700, margin:"0 0 12px" }}>Üyelik Bilgileri</h4>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
                {[
                  ["Merchant ID", merchant.merchantId],
                  ["Kayıt Tarihi", merchant.createdAt ? new Date(merchant.createdAt).toLocaleDateString("tr-TR") : "—"],
                  ["Trial Bitiş", merchant.trialEndsAt ? new Date(merchant.trialEndsAt).toLocaleDateString("tr-TR") : "—"],
                  ["Onboarding", merchant.onboardingDone ? "✅ Tamamlandı" : "⏳ Bekliyor"],
                  ["Para Birimi", merchant.currency],
                  ["Dil", merchant.language],
                ].map(([k,v])=>(
                  <div key={k} style={{ background:P.light, borderRadius:10, padding:"12px 14px" }}>
                    <div style={{ color:P.muted, fontSize:10, fontWeight:600, textTransform:"uppercase", marginBottom:4 }}>{k}</div>
                    <div style={{ color:P.text, fontSize:13, fontWeight:600 }}>{v||"—"}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ACCOUNT CONTROL */}
        {activeTab==="account" && (
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            <h3 style={{ color:P.text, fontSize:16, fontWeight:800, margin:0 }}>Hesap Kontrolü</h3>

            {/* Status */}
            <div style={{ background:P.light, borderRadius:14, padding:18 }}>
              <div style={{ color:P.sub, fontSize:12, fontWeight:700, textTransform:"uppercase", marginBottom:12 }}>Hesap Durumu</div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                {["ACTIVE","TRIAL","SUSPENDED","EXPIRED"].map(s=>(
                  <button key={s} onClick={()=>doStatusChange(s)} style={{
                    background: merchant.status===s ? `${statusColor[s]}20` : P.card,
                    border:`2px solid ${merchant.status===s ? statusColor[s] : P.border}`,
                    color: merchant.status===s ? statusColor[s] : P.sub,
                    borderRadius:10, padding:"8px 18px", cursor:"pointer", fontSize:13, fontWeight:700, transition:"all 0.15s",
                  }}>{s}</button>
                ))}
              </div>
            </div>

            {/* Plan */}
            <div style={{ background:P.light, borderRadius:14, padding:18 }}>
              <div style={{ color:P.sub, fontSize:12, fontWeight:700, textTransform:"uppercase", marginBottom:12 }}>Plan</div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                {["STARTER","BUSINESS","PRO","ENTERPRISE"].map(p=>(
                  <button key={p} onClick={()=>doPlanChange(p)} style={{
                    background: merchant.plan===p ? `${planColor[p]||P.muted}20` : P.card,
                    border:`2px solid ${merchant.plan===p ? planColor[p]||P.muted : P.border}`,
                    color: merchant.plan===p ? planColor[p]||P.muted : P.sub,
                    borderRadius:10, padding:"8px 18px", cursor:"pointer", fontSize:13, fontWeight:700, transition:"all 0.15s",
                  }}>{p}</button>
                ))}
              </div>
            </div>

            {/* Trial */}
            <div style={{ background:P.light, borderRadius:14, padding:18 }}>
              <div style={{ color:P.sub, fontSize:12, fontWeight:700, textTransform:"uppercase", marginBottom:8 }}>Deneme Süresi</div>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ color:P.text, fontSize:14 }}>
                  Bitiş: <strong>{merchant.trialEndsAt ? new Date(merchant.trialEndsAt).toLocaleDateString("tr-TR") : "—"}</strong>
                </div>
                <button onClick={()=>setExtendModal(true)} style={{ background:`${P.emerald}15`, border:`1px solid ${P.emerald}30`, color:P.emerald, borderRadius:10, padding:"7px 16px", cursor:"pointer", fontSize:13, fontWeight:700 }}>
                  + Süre Uzat
                </button>
              </div>
            </div>

            {/* Feature Flags */}
            <div style={{ background:P.light, borderRadius:14, padding:18 }}>
              <div style={{ color:P.sub, fontSize:12, fontWeight:700, textTransform:"uppercase", marginBottom:12 }}>Feature Flags</div>
              {merchant.featureFlags?.length === 0 ? (
                <div style={{ color:P.muted, fontSize:13 }}>Özel flag yok — tüm varsayılan özellikler aktif.</div>
              ) : (
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {merchant.featureFlags?.map(f=>(
                    <div key={f.id} style={{ background:f.isEnabled?`${P.emerald}12`:P.card, border:`1px solid ${f.isEnabled?P.emerald:P.border}`, borderRadius:8, padding:"4px 12px", fontSize:12, color:f.isEnabled?P.emerald:P.muted, fontWeight:600 }}>
                      {f.isEnabled?"✓":"✗"} {f.feature}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* NOTES */}
        {activeTab==="notes" && (
          <div>
            <h3 style={{ color:P.text, fontSize:16, fontWeight:800, margin:"0 0 6px" }}>Admin Notları</h3>
            <p style={{ color:P.sub, fontSize:13, margin:"0 0 16px" }}>Bu notlar sadece adminler tarafından görülür. Müşteri göremez.</p>
            <textarea value={adminNotes} onChange={e=>setAdminNotes(e.target.value)} rows={10}
              placeholder="Müşteri hakkında özel notlar, takip bilgileri, özel anlaşmalar..."
              style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, color:P.text, borderRadius:12, padding:"14px 16px", fontSize:14, outline:"none", resize:"vertical", boxSizing:"border-box", lineHeight:1.6, fontFamily:"inherit" }}
              onFocus={e=>e.target.style.borderColor=P.purple}
              onBlur={e=>e.target.style.borderColor=P.border} />
            <div style={{ marginTop:12, color:P.muted, fontSize:12 }}>Son güncelleme: kaydet butonuna basılınca otomatik kaydedilir.</div>
          </div>
        )}

        {/* ACTIVITY */}
        {activeTab==="activity" && (
          <div>
            <h3 style={{ color:P.text, fontSize:16, fontWeight:800, margin:"0 0 16px" }}>Aktivite Geçmişi</h3>
            {/* Subscriptions */}
            {merchant.subscriptions?.length > 0 && (
              <div style={{ marginBottom:20 }}>
                <div style={{ color:P.sub, fontSize:11, fontWeight:700, textTransform:"uppercase", marginBottom:10 }}>Abonelik Geçmişi</div>
                {merchant.subscriptions.map((s,i)=>(
                  <div key={s.id} style={{ display:"flex", justifyContent:"space-between", padding:"10px 14px", background:P.light, borderRadius:10, marginBottom:8, border:`1px solid ${P.border}` }}>
                    <div>
                      <span style={{ color:P.text, fontSize:13, fontWeight:600 }}>{s.planName}</span>
                      <span style={{ color:P.muted, fontSize:12, marginLeft:12 }}>{s.interval}</span>
                    </div>
                    <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                      <span style={{ color:P.sub, fontSize:12 }}>{new Date(s.currentPeriodStart).toLocaleDateString("tr-TR")} → {new Date(s.currentPeriodEnd).toLocaleDateString("tr-TR")}</span>
                      <Badge val={s.status} color={{ ACTIVE:P.emerald, TRIAL:P.amber, PAST_DUE:P.rose, CANCELLED:P.muted }[s.status]||P.muted} />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Audit Log */}
            <div style={{ color:P.sub, fontSize:11, fontWeight:700, textTransform:"uppercase", marginBottom:10 }}>Admin İşlem Geçmişi</div>
            {auditLogs.length === 0 ? (
              <div style={{ color:P.muted, fontSize:13, padding:"20px 0" }}>İşlem geçmişi yükleniyor...</div>
            ) : (
              auditLogs.map((log,i)=>(
                <div key={log.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 14px", background:P.light, borderRadius:10, marginBottom:6, border:`1px solid ${P.border}` }}>
                  <div>
                    <div style={{ color:P.text, fontSize:13, fontWeight:600 }}>{log.action}</div>
                    <div style={{ color:P.muted, fontSize:11 }}>by {log.admin?.name || "Admin"}</div>
                  </div>
                  <div style={{ color:P.muted, fontSize:12 }}>{new Date(log.createdAt).toLocaleDateString("tr-TR")}</div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ACTIONS */}
        {activeTab==="actions" && (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <h3 style={{ color:P.text, fontSize:16, fontWeight:800, margin:0 }}>Yönetim İşlemleri</h3>

            {[
              { icon:"🔔", label:"Bildirim Gönder", desc:"Müşteriye anlık bildirim gönder", color:P.cyan, action:()=>setNotifModal(true) },
              { icon:"⏰", label:"Deneme Süresini Uzat", desc:"Ücretsiz deneme günü ekle", color:P.emerald, action:()=>setExtendModal(true) },
              { icon:"🔑", label:"Şifre Sıfırla", desc:"Müşterinin şifresini admin olarak sıfırla", color:P.amber, action:()=>setResetPwModal(true) },
              { icon:"📤", label:"Veriyi Dışa Aktar", desc:"Tüm müşteri verilerini JSON olarak dışa aktar", color:P.purple, action:()=>{ window.open(`${API}/api/admin/merchants/${merchantId}?export=true`,'_blank'); } },
            ].map(item=>(
              <button key={item.label} onClick={item.action} style={{ background:P.card, border:`1.5px solid ${item.color}20`, borderRadius:14, padding:"16px 18px", cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:14, transition:"all 0.15s" }}
                onMouseEnter={e=>{e.currentTarget.style.background=`${item.color}06`;e.currentTarget.style.borderColor=`${item.color}40`;}}
                onMouseLeave={e=>{e.currentTarget.style.background=P.card;e.currentTarget.style.borderColor=`${item.color}20`;}}>
                <div style={{ width:44, height:44, borderRadius:12, background:`${item.color}15`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{item.icon}</div>
                <div>
                  <div style={{ color:P.text, fontSize:14, fontWeight:700 }}>{item.label}</div>
                  <div style={{ color:P.sub, fontSize:12, marginTop:2 }}>{item.desc}</div>
                </div>
                <div style={{ marginLeft:"auto", color:item.color, fontSize:18 }}>→</div>
              </button>
            ))}
          </div>
        )}

        {/* DANGER ZONE */}
        {activeTab==="danger" && (
          <div>
            <div style={{ background:`${P.rose}08`, border:`1.5px solid ${P.rose}20`, borderRadius:14, padding:"14px 18px", marginBottom:20, display:"flex", gap:12, alignItems:"center" }}>
              <span style={{ fontSize:24 }}>⚠️</span>
              <div>
                <div style={{ color:P.rose, fontSize:14, fontWeight:700 }}>Tehlikeli Alan</div>
                <div style={{ color:P.sub, fontSize:12 }}>Bu işlemler geri alınamaz. Dikkatli olun.</div>
              </div>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {/* Archive */}
              {!merchant.archivedAt ? (
                <div style={{ background:P.light, border:`1.5px solid ${P.border}`, borderRadius:14, padding:"16px 18px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ color:P.text, fontSize:14, fontWeight:700 }}>📦 Hesabı Arşivle</div>
                    <div style={{ color:P.sub, fontSize:12, marginTop:3 }}>Hesap dondurulur, veriler korunur. İstediğinde geri açılabilir.</div>
                  </div>
                  <button onClick={()=>setArchiveModal(true)} style={{ background:`${P.amber}15`, border:`1.5px solid ${P.amber}30`, color:P.amber, borderRadius:10, padding:"8px 18px", cursor:"pointer", fontSize:13, fontWeight:700, whiteSpace:"nowrap" }}>
                    Arşivle
                  </button>
                </div>
              ) : (
                <div style={{ background:`${P.emerald}08`, border:`1.5px solid ${P.emerald}20`, borderRadius:14, padding:"16px 18px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ color:P.text, fontSize:14, fontWeight:700 }}>📤 Arşivden Çıkar</div>
                    <div style={{ color:P.sub, fontSize:12, marginTop:3 }}>Hesap yeniden aktif edilir. Arşivlenme tarihi: {new Date(merchant.archivedAt).toLocaleDateString("tr-TR")}</div>
                  </div>
                  <button onClick={doUnarchive} style={{ background:`${P.emerald}15`, border:`1.5px solid ${P.emerald}30`, color:P.emerald, borderRadius:10, padding:"8px 18px", cursor:"pointer", fontSize:13, fontWeight:700 }}>
                    Geri Yükle
                  </button>
                </div>
              )}

              {/* Delete */}
              <div style={{ background:`${P.rose}08`, border:`1.5px solid ${P.rose}25`, borderRadius:14, padding:"16px 18px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div>
                  <div style={{ color:P.rose, fontSize:14, fontWeight:700 }}>🗑️ Hesabı Kalıcı Sil</div>
                  <div style={{ color:P.sub, fontSize:12, marginTop:3 }}>Tüm veriler silinir. Bu işlem GERİ ALINAMAZ.</div>
                </div>
                <button onClick={()=>setDeleteModal(true)} style={{ background:P.rose, border:"none", color:"#fff", borderRadius:10, padding:"8px 18px", cursor:"pointer", fontSize:13, fontWeight:700, whiteSpace:"nowrap" }}>
                  Kalıcı Sil
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ─────────────────────────────────── */}

      {/* Extend Trial */}
      <Modal open={extendModal} title="⏰ Deneme Süresini Uzat" color={P.emerald} onClose={()=>setExtendModal(false)}>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ background:P.light, borderRadius:12, padding:"12px 16px", color:P.sub, fontSize:13 }}>
            Mevcut bitiş: <strong>{merchant.trialEndsAt?new Date(merchant.trialEndsAt).toLocaleDateString("tr-TR"):"—"}</strong>
          </div>
          <Input label="Eklenecek Gün Sayısı" type="number" value={extendDays} onChange={e=>setExtendDays(e.target.value)} />
          <div style={{ display:"flex", gap:8 }}>
            {[7,14,30].map(d=><button key={d} onClick={()=>setExtendDays(d)} style={{ flex:1, background:extendDays==d?`${P.emerald}15`:P.light, border:`1.5px solid ${extendDays==d?P.emerald:P.border}`, color:extendDays==d?P.emerald:P.sub, borderRadius:10, padding:"8px 0", cursor:"pointer", fontSize:13, fontWeight:700 }}>{d} gün</button>)}
          </div>
          <button onClick={doExtendTrial} style={{ background:`linear-gradient(135deg,${P.emerald},${P.teal})`, border:"none", color:"#fff", borderRadius:10, padding:"12px 0", cursor:"pointer", fontSize:14, fontWeight:700 }}>
            {extendDays} Gün Ekle
          </button>
        </div>
      </Modal>

      {/* Send Notification */}
      <Modal open={notifModal} title="🔔 Bildirim Gönder" color={P.cyan} onClose={()=>setNotifModal(false)}>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Input label="Başlık" value={notifForm.title} onChange={e=>setNotifForm(f=>({...f,title:e.target.value}))} placeholder="Bildirim başlığı" />
          <div>
            <label style={{ color:P.sub, fontSize:12, fontWeight:600, display:"block", marginBottom:5 }}>Mesaj</label>
            <textarea value={notifForm.body} onChange={e=>setNotifForm(f=>({...f,body:e.target.value}))} rows={3} placeholder="Bildirim mesajı..."
              style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, color:P.text, borderRadius:10, padding:"10px 14px", fontSize:14, outline:"none", resize:"none", boxSizing:"border-box", fontFamily:"inherit" }} />
          </div>
          <div>
            <label style={{ color:P.sub, fontSize:12, fontWeight:600, display:"block", marginBottom:5 }}>Tip</label>
            <div style={{ display:"flex", gap:8 }}>
              {[["INFO",P.cyan],["SUCCESS",P.emerald],["WARNING",P.amber],["ERROR",P.rose]].map(([t,c])=>(
                <button key={t} onClick={()=>setNotifForm(f=>({...f,type:t}))} style={{ flex:1, background:notifForm.type===t?`${c}15`:P.light, border:`1.5px solid ${notifForm.type===t?c:P.border}`, color:notifForm.type===t?c:P.sub, borderRadius:10, padding:"7px 0", cursor:"pointer", fontSize:12, fontWeight:700 }}>{t}</button>
              ))}
            </div>
          </div>
          <button onClick={doSendNotif} disabled={!notifForm.title||!notifForm.body} style={{ background:`linear-gradient(135deg,${P.cyan},${P.indigo})`, border:"none", color:"#fff", borderRadius:10, padding:"12px 0", cursor:"pointer", fontSize:14, fontWeight:700, opacity:(!notifForm.title||!notifForm.body)?0.5:1 }}>
            Gönder
          </button>
        </div>
      </Modal>

      {/* Reset Password */}
      <Modal open={resetPwModal} title="🔑 Şifre Sıfırla" color={P.amber} onClose={()=>setResetPwModal(false)}>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ background:`${P.amber}10`, border:`1px solid ${P.amber}25`, borderRadius:10, padding:"10px 14px", color:P.amber, fontSize:13 }}>
            ⚠ Müşteriye şifre sıfırlama bildirimi gönderilecek.
          </div>
          <Input label="Yeni Şifre" type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="Min 8 karakter" hint="Güçlü bir şifre seçin" />
          <button onClick={doResetPassword} disabled={newPassword.length<8} style={{ background:`linear-gradient(135deg,${P.amber},${P.orange})`, border:"none", color:"#fff", borderRadius:10, padding:"12px 0", cursor:"pointer", fontSize:14, fontWeight:700, opacity:newPassword.length<8?0.5:1 }}>
            Şifreyi Sıfırla
          </button>
        </div>
      </Modal>

      {/* Archive Confirm */}
      <Modal open={archiveModal} title="📦 Hesabı Arşivle" color={P.amber} onClose={()=>setArchiveModal(false)}>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ background:P.light, borderRadius:12, padding:"14px 16px", color:P.sub, fontSize:13, lineHeight:1.6 }}>
            <strong>{merchant.name}</strong> hesabı arşivlenecek. Tüm veriler korunur, hesap askıya alınır. İstediğinizde geri açabilirsiniz.
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={()=>setArchiveModal(false)} style={{ flex:1, background:P.light, border:`1.5px solid ${P.border}`, color:P.sub, borderRadius:10, padding:"11px 0", cursor:"pointer", fontSize:14 }}>İptal</button>
            <button onClick={doArchive} style={{ flex:1, background:`linear-gradient(135deg,${P.amber},${P.orange})`, border:"none", color:"#fff", borderRadius:10, padding:"11px 0", cursor:"pointer", fontSize:14, fontWeight:700 }}>Arşivle</button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={deleteModal} title="🗑️ Kalıcı Silme Onayı" color={P.rose} onClose={()=>{ setDeleteModal(false); setDeleteConfirm(""); }}>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ background:`${P.rose}10`, border:`1.5px solid ${P.rose}25`, borderRadius:12, padding:"14px 16px", color:P.rose, fontSize:13, lineHeight:1.6, fontWeight:600 }}>
            ⚠ Bu işlem GERİ ALINAMAZ! <strong>{merchant.name}</strong> ve tüm verileri kalıcı olarak silinecek.
          </div>
          <Input label='Onaylamak için "DELETE" yazın' value={deleteConfirm} onChange={e=>setDeleteConfirm(e.target.value)} placeholder="DELETE" />
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={()=>{ setDeleteModal(false); setDeleteConfirm(""); }} style={{ flex:1, background:P.light, border:`1.5px solid ${P.border}`, color:P.sub, borderRadius:10, padding:"11px 0", cursor:"pointer", fontSize:14 }}>İptal</button>
            <button onClick={doDelete} disabled={deleteConfirm!=="DELETE"} style={{ flex:1, background:deleteConfirm==="DELETE"?P.rose:P.muted, border:"none", color:"#fff", borderRadius:10, padding:"11px 0", cursor:deleteConfirm==="DELETE"?"pointer":"not-allowed", fontSize:14, fontWeight:700 }}>
              Kalıcı Sil
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── Overview Page ─────────────────────────────────
function OverviewPage() {
  const { data:stats, loading, error } = useData("/api/admin/stats");
  const s = stats?.merchants, r = stats?.revenue, t = stats?.totals;

  return (
    <div>
      <div style={{ background:`linear-gradient(135deg,${P.purple} 0%,${P.pink} 100%)`, borderRadius:20, padding:"22px 28px", marginBottom:28, position:"relative", overflow:"hidden", boxShadow:`0 8px 32px ${P.purple}30` }}>
        <div style={{ position:"absolute", top:-20, right:60, width:110, height:110, borderRadius:"50%", background:"rgba(255,255,255,0.1)" }}/>
        <div style={{ position:"absolute", bottom:-25, right:20, width:75, height:75, borderRadius:"50%", background:"rgba(255,255,255,0.07)" }}/>
        <div style={{ position:"relative" }}>
          <div style={{ color:"rgba(255,255,255,0.8)", fontSize:13, marginBottom:4 }}>🏢 Admin Dashboard</div>
          <h1 style={{ color:"#fff", fontSize:24, fontWeight:800, margin:"0 0 4px" }}>Platform Genel Bakış</h1>
          <div style={{ color:"rgba(255,255,255,0.7)", fontSize:13 }}>{new Date().toLocaleDateString("tr-TR",{weekday:"long",month:"long",day:"numeric"})}</div>
        </div>
      </div>

      {error && <div style={{ background:`${P.rose}12`, border:`1.5px solid ${P.rose}30`, borderRadius:12, padding:"12px 16px", color:P.rose, fontSize:13, marginBottom:16 }}>⚠ {error}</div>}
      {loading ? <Spinner /> : !stats ? null : (
        <>
          <div style={{ marginBottom:22 }}>
            <div style={{ color:P.sub, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>Merchantlar</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
              <StatCard label="Toplam" value={s?.total??0} icon="🏪" color={P.purple} />
              <StatCard label="Aktif"  value={s?.active??0} icon="✅" color={P.emerald} sub={s?.total?`${Math.round((s.active/s.total)*100)}%`:null} />
              <StatCard label="Trial"  value={s?.trial??0}  icon="⏳" color={P.amber} />
              <StatCard label="Bu Ay Yeni" value={s?.newThisMonth??0} icon="✨" color={P.cyan} />
            </div>
          </div>
          <div style={{ marginBottom:22 }}>
            <div style={{ color:P.sub, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>Gelir</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:14 }}>
              <StatCard label="Bu Ay" value={r?.thisMonth?`$${Number(r.thisMonth).toLocaleString()}`:"$0"} icon="📈" color={P.emerald} />
              <StatCard label="Geçen Ay" value={r?.lastMonth?`$${Number(r.lastMonth).toLocaleString()}`:"$0"} icon="📅" color={P.indigo} />
            </div>
          </div>
          <div style={{ marginBottom:22 }}>
            <div style={{ color:P.sub, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>Platform Toplamları</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
              <StatCard label="Faturalar"  value={t?.invoices??0}  icon="🧾" color={P.pink} />
              <StatCard label="Müşteriler" value={t?.customers??0} icon="👥" color={P.teal} />
              <StatCard label="Anlaşmalar" value={t?.deals??0}     icon="🤝" color={P.orange} />
            </div>
          </div>
          {stats?.planDistribution?.length > 0 && (
            <div style={{ marginBottom:22 }}>
              <div style={{ color:P.sub, fontSize:11, fontWeight:700, textTransform:"uppercase", marginBottom:12 }}>Plan Dağılımı</div>
              <div style={{ background:P.card, border:`1.5px solid ${P.border}`, borderRadius:16, overflow:"hidden" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <thead><tr style={{ background:`${P.purple}08`, borderBottom:`1.5px solid ${P.border}` }}>
                    <th style={{ padding:"10px 16px", textAlign:"left", color:P.sub, fontSize:11, fontWeight:700, textTransform:"uppercase" }}>Plan</th>
                    <th style={{ padding:"10px 16px", textAlign:"right", color:P.sub, fontSize:11, fontWeight:700 }}>Merchant</th>
                    <th style={{ padding:"10px 16px", minWidth:120 }} />
                  </tr></thead>
                  <tbody>
                    {stats.planDistribution.map((p,i)=>{
                      const c={FREE:P.muted,STARTER:P.cyan,BUSINESS:P.purple,PRO:P.pink,ENTERPRISE:P.amber}[p.plan]||P.muted;
                      const pct=s?.total?Math.round((p._count.id/s.total)*100):0;
                      return (
                        <tr key={i} style={{ borderBottom:`1px solid ${P.border}` }}>
                          <td style={{ padding:"11px 16px" }}><Badge val={p.plan} color={c} /></td>
                          <td style={{ padding:"11px 16px", color:P.text, textAlign:"right", fontWeight:800, fontSize:15 }}>{p._count.id}</td>
                          <td style={{ padding:"11px 16px" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                              <div style={{ flex:1, height:7, background:`${c}15`, borderRadius:4, overflow:"hidden" }}><div style={{ width:`${pct}%`, height:"100%", background:`linear-gradient(90deg,${c},${c}80)`, borderRadius:4, transition:"width 1.2s ease" }}/></div>
                              <span style={{ color:P.sub, fontSize:11 }}>{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {stats?.countryDistribution?.length > 0 && (
            <div>
              <div style={{ color:P.sub, fontSize:11, fontWeight:700, textTransform:"uppercase", marginBottom:12 }}>İller</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
                {stats.countryDistribution.map((c,i)=>(
                  <div key={i} style={{ background:P.card, border:`1.5px solid ${COLORS[i%COLORS.length]}25`, borderRadius:20, padding:"7px 16px", display:"flex", alignItems:"center", gap:8, boxShadow:`0 2px 10px ${COLORS[i%COLORS.length]}10` }}>
                    <span>📍</span><span style={{ color:P.text, fontSize:13, fontWeight:600 }}>{c.country}</span>
                    <span style={{ color:"#fff", fontSize:11, fontWeight:700, background:COLORS[i%COLORS.length], borderRadius:20, padding:"1px 8px" }}>{c._count.id}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Merchants Page ────────────────────────────────
function MerchantsPage({ onSelectMerchant }) {
  const [showArchived, setShowArchived] = useState(false);
  const { data, loading, error, reload } = useData(`/api/admin/merchants?archived=${showArchived}`);
  const merchants = data?.merchants || [];
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [form, setForm] = useState({ name:"", email:"", password:"", businessName:"", phone:"", province:"İstanbul", plan:"STARTER" });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleCreate = async () => {
    if (!form.name||!form.email||!form.password) { setCreateError("Ad, e-posta ve şifre zorunlu"); return; }
    setCreating(true); setCreateError("");
    try {
      await adminFetch("/api/admin/merchants", { method:"POST", body:JSON.stringify({...form, country:form.province}) });
      setCreateOpen(false);
      setForm({ name:"", email:"", password:"", businessName:"", phone:"", province:"İstanbul", plan:"STARTER" });
      setSuccessMsg(`Merchant "${form.name}" oluşturuldu!`);
      setTimeout(()=>setSuccessMsg(""),4000);
      reload();
    } catch(e) { setCreateError(e.message); }
    finally { setCreating(false); }
  };

  const filtered = merchants.filter(m=>!search||m.name?.toLowerCase().includes(search.toLowerCase())||m.email?.toLowerCase().includes(search.toLowerCase()));
  const statusColors={ACTIVE:P.emerald,SUSPENDED:P.rose,TRIAL:P.amber,INACTIVE:P.muted,EXPIRED:P.muted};
  const planColors={FREE:P.muted,STARTER:P.cyan,BUSINESS:P.purple,PRO:P.pink,ENTERPRISE:P.amber};

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <h1 style={{ color:P.text, fontSize:24, fontWeight:800, margin:0 }}>Merchantlar</h1>
          <p style={{ color:P.sub, fontSize:14, margin:"4px 0 0" }}>{merchants.length} kayıtlı merchant</p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={()=>{ setShowArchived(v=>!v); }} style={{ background:showArchived?`${P.amber}15`:P.light, border:`1.5px solid ${showArchived?P.amber:P.border}`, color:showArchived?P.amber:P.sub, borderRadius:10, padding:"9px 16px", cursor:"pointer", fontSize:13, fontWeight:600 }}>
            {showArchived ? "📦 Arşivler" : "📋 Aktifler"}
          </button>
          <button onClick={()=>setCreateOpen(true)} style={{ background:`linear-gradient(135deg,${P.purple},${P.pink})`, border:"none", color:"#fff", borderRadius:12, padding:"10px 20px", cursor:"pointer", fontSize:14, fontWeight:700, boxShadow:`0 4px 16px ${P.purple}30` }}>
            + Yeni Merchant
          </button>
        </div>
      </div>

      {successMsg && <div style={{ background:`${P.emerald}12`, border:`1.5px solid ${P.emerald}30`, borderRadius:12, padding:"12px 16px", color:P.emerald, fontSize:13, fontWeight:600, marginBottom:16 }}>✅ {successMsg}</div>}

      <div style={{ marginBottom:16 }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍  İsim veya e-posta ile ara..."
          style={{ width:"100%", background:P.card, border:`1.5px solid ${P.border}`, color:P.text, borderRadius:12, padding:"11px 16px", fontSize:14, outline:"none", boxSizing:"border-box" }}
          onFocus={e=>e.target.style.borderColor=P.purple} onBlur={e=>e.target.style.borderColor=P.border} />
      </div>

      {loading ? <Spinner /> : (
        <div style={{ background:P.card, border:`1.5px solid ${P.border}`, borderRadius:16, overflow:"hidden", boxShadow:"0 2px 16px rgba(108,58,255,0.06)" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:`${P.purple}08`, borderBottom:`1.5px solid ${P.border}` }}>
                {["Merchant","İl","Plan","Durum","Müşteri","Kayıt",""].map(h=>(
                  <th key={h} style={{ padding:"12px 16px", textAlign:"left", color:P.sub, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length===0 ? (
                <tr><td colSpan={7} style={{ padding:48, textAlign:"center", color:P.muted }}>
                  <div style={{ fontSize:36, marginBottom:10 }}>🏪</div>
                  {showArchived ? "Arşivlenmiş merchant yok" : "Henüz merchant yok — ilk merchantı oluşturun!"}
                </td></tr>
              ) : filtered.map((m,i)=>(
                <tr key={m.id||i} style={{ borderBottom:`1px solid ${P.border}`, transition:"background 0.1s" }}
                  onMouseEnter={e=>e.currentTarget.style.background=`${P.purple}04`}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                  <td style={{ padding:"13px 16px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:34, height:34, borderRadius:"50%", background:`linear-gradient(135deg,${COLORS[i%COLORS.length]}30,${COLORS[i%COLORS.length]}15)`, display:"flex", alignItems:"center", justifyContent:"center", color:COLORS[i%COLORS.length], fontSize:13, fontWeight:800, flexShrink:0 }}>
                        {(m.name||"?")[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ color:P.text, fontSize:13, fontWeight:700 }}>{m.name}</div>
                        <div style={{ color:P.muted, fontSize:11 }}>{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:"13px 16px" }}><div style={{ display:"flex", alignItems:"center", gap:5 }}><span>📍</span><span style={{ color:P.sub, fontSize:13 }}>{m.country||"—"}</span></div></td>
                  <td style={{ padding:"13px 16px" }}>
                    <select value={m.plan} onChange={e=>adminFetch(`/api/admin/merchants/${m.id}/plan`,{method:"PUT",body:JSON.stringify({plan:e.target.value})}).then(()=>reload())}
                      style={{ background:`${planColors[m.plan]||P.muted}15`, border:`1px solid ${planColors[m.plan]||P.muted}30`, color:planColors[m.plan]||P.muted, borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:700, cursor:"pointer", outline:"none" }}>
                      {["STARTER","BUSINESS","PRO","ENTERPRISE"].map(p=><option key={p} value={p}>{p}</option>)}
                    </select>
                  </td>
                  <td style={{ padding:"13px 16px" }}>
                    <select value={m.status} onChange={e=>adminFetch(`/api/admin/merchants/${m.id}/status`,{method:"PUT",body:JSON.stringify({status:e.target.value})}).then(()=>reload())}
                      style={{ background:`${statusColors[m.status]||P.muted}15`, border:`1px solid ${statusColors[m.status]||P.muted}30`, color:statusColors[m.status]||P.muted, borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:700, cursor:"pointer", outline:"none" }}>
                      {["ACTIVE","TRIAL","SUSPENDED","INACTIVE"].map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{ padding:"13px 16px", color:P.text, fontSize:14, fontWeight:700 }}>{m._count?.customers??0}</td>
                  <td style={{ padding:"13px 16px", color:P.muted, fontSize:12 }}>{m.createdAt?new Date(m.createdAt).toLocaleDateString("tr-TR"):"—"}</td>
                  <td style={{ padding:"13px 16px" }}>
                    <button onClick={()=>onSelectMerchant(m.id)} style={{ background:`${P.purple}12`, border:`1px solid ${P.purple}25`, color:P.purple, borderRadius:8, padding:"6px 14px", cursor:"pointer", fontSize:12, fontWeight:700 }}>
                      Detay →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <Modal open={createOpen} title="✨ Yeni Merchant Oluştur" onClose={()=>{ setCreateOpen(false); setCreateError(""); }}>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Input label="Ad Soyad *" value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Ahmet Yılmaz" />
            <Input label="İşletme Adı" value={form.businessName} onChange={e=>set("businessName",e.target.value)} placeholder="Şirket Adı" />
          </div>
          <Input label="E-posta *" type="email" value={form.email} onChange={e=>set("email",e.target.value)} placeholder="merchant@sirket.com" />
          <Input label="Şifre *" type="password" value={form.password} onChange={e=>set("password",e.target.value)} placeholder="Min 8 karakter" />
          <Input label="Telefon" value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="+90 555 123 45 67" />
          <div>
            <label style={{ color:P.sub, fontSize:12, fontWeight:600, display:"block", marginBottom:5 }}>📍 İl</label>
            <select value={form.province} onChange={e=>set("province",e.target.value)} style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, color:P.text, borderRadius:10, padding:"10px 14px", fontSize:14, outline:"none" }}>
              {TR_PROVINCES.map(p=><option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label style={{ color:P.sub, fontSize:12, fontWeight:600, display:"block", marginBottom:5 }}>Plan</label>
            <select value={form.plan} onChange={e=>set("plan",e.target.value)} style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, color:P.text, borderRadius:10, padding:"10px 14px", fontSize:14, outline:"none" }}>
              {[["STARTER","Starter"],["BUSINESS","Business"],["PRO","Pro"],["ENTERPRISE","Enterprise"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          {createError && <div style={{ background:`${P.rose}12`, border:`1.5px solid ${P.rose}25`, borderRadius:10, padding:"10px 14px", color:P.rose, fontSize:13 }}>⚠ {createError}</div>}
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={handleCreate} disabled={creating} style={{ flex:1, background:creating?P.muted:`linear-gradient(135deg,${P.purple},${P.pink})`, border:"none", color:"#fff", borderRadius:10, padding:"12px 0", cursor:creating?"not-allowed":"pointer", fontSize:14, fontWeight:700 }}>
              {creating?"Oluşturuluyor...":"Merchant Oluştur"}
            </button>
            <button onClick={()=>{ setCreateOpen(false); setCreateError(""); }} style={{ background:P.light, border:`1.5px solid ${P.border}`, color:P.sub, borderRadius:10, padding:"12px 18px", cursor:"pointer", fontSize:14 }}>İptal</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── Profile Page ──────────────────────────────────
function ProfilePage() {
  const { user, logout } = useAuth();
  return (
    <div>
      <h1 style={{ color:P.text, fontSize:24, fontWeight:800, margin:"0 0 20px" }}>Admin Profili</h1>
      <div style={{ background:P.card, border:`1.5px solid ${P.border}`, borderRadius:18, padding:24, maxWidth:480, boxShadow:"0 2px 16px rgba(108,58,255,0.06)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:24, background:P.light, borderRadius:14, padding:16 }}>
          <div style={{ background:`linear-gradient(135deg,${P.purple},${P.pink})`, borderRadius:"50%", width:56, height:56, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:22, fontWeight:800, boxShadow:`0 4px 16px ${P.purple}35` }}>
            {(user?.name||"A")[0].toUpperCase()}
          </div>
          <div>
            <div style={{ color:P.text, fontSize:18, fontWeight:800 }}>{user?.name||"Admin"}</div>
            <div style={{ color:P.sub, fontSize:13 }}>{user?.email}</div>
          </div>
        </div>
        {[["Ad",user?.name],["E-posta",user?.email],["Rol",user?.role]].map(([k,v])=>(
          <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"12px 0", borderBottom:`1px solid ${P.border}` }}>
            <span style={{ color:P.sub, fontSize:13 }}>{k}</span>
            <span style={{ color:P.text, fontSize:13, fontWeight:600 }}>{v||"—"}</span>
          </div>
        ))}
        <button onClick={logout} style={{ marginTop:20, width:"100%", background:`${P.rose}12`, border:`1.5px solid ${P.rose}25`, color:P.rose, borderRadius:10, padding:11, cursor:"pointer", fontWeight:700, fontSize:14 }}>Çıkış Yap</button>
      </div>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────
function Sidebar({ page, setPage, user, logout }) {
  const NAV = [
    { id:"overview",  label:"Genel Bakış", icon:"⊞" },
    { id:"merchants", label:"Merchantlar",  icon:"🏪" },
    { id:"profile",   label:"Profil",       icon:"👤" },
  ];
  return (
    <aside style={{ width:230, background:P.card, borderRight:`1.5px solid ${P.border}`, display:"flex", flexDirection:"column", padding:"20px 12px", gap:3, position:"sticky", top:0, height:"100vh", boxShadow:"4px 0 24px rgba(108,58,255,0.06)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:28, padding:"0 8px" }}>
        <div style={{ width:38, height:38, borderRadius:12, background:`linear-gradient(135deg,${P.purple},${P.pink})`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 4px 16px ${P.purple}35` }}>
          <span style={{ color:"#fff", fontWeight:900, fontSize:17 }}>Z</span>
        </div>
        <div>
          <div style={{ color:P.text, fontWeight:800, fontSize:16, lineHeight:1 }}>Zyrix</div>
          <div style={{ color:P.rose, fontSize:9, fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase", background:`${P.rose}12`, borderRadius:4, padding:"1px 5px", display:"inline-block", marginTop:2 }}>ADMIN</div>
        </div>
      </div>
      {NAV.map(item=>{
        const active=page===item.id;
        return (
          <button key={item.id} onClick={()=>setPage(item.id)} style={{ background:active?`linear-gradient(90deg,${P.purple}15,${P.purple}06)`:"transparent", border:`1.5px solid ${active?P.purple+"30":"transparent"}`, borderRadius:12, color:active?P.purple:P.sub, padding:"10px 14px", cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:10, fontSize:14, fontWeight:active?700:500, transition:"all 0.15s" }}
            onMouseEnter={e=>{ if(!active){e.currentTarget.style.background=`${P.purple}08`;e.currentTarget.style.color=P.purple;}}}
            onMouseLeave={e=>{ if(!active){e.currentTarget.style.background="transparent";e.currentTarget.style.color=P.sub;}}}>
            <span style={{ fontSize:17 }}>{item.icon}</span>{item.label}
          </button>
        );
      })}
      <div style={{ marginTop:"auto", paddingTop:16, borderTop:`1.5px solid ${P.border}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:9, marginBottom:10, background:P.light, borderRadius:12, padding:"8px 10px" }}>
          <div style={{ background:`linear-gradient(135deg,${P.rose},${P.orange})`, borderRadius:"50%", width:30, height:30, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:12, fontWeight:700 }}>
            {(user?.name||"A")[0].toUpperCase()}
          </div>
          <div style={{ overflow:"hidden" }}>
            <div style={{ color:P.text, fontSize:12, fontWeight:700, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:130 }}>{user?.name||"Admin"}</div>
            <div style={{ color:P.muted, fontSize:10, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:130 }}>{user?.email}</div>
          </div>
        </div>
        <button onClick={logout} style={{ width:"100%", background:`${P.rose}12`, border:`1.5px solid ${P.rose}25`, color:P.rose, borderRadius:10, padding:"7px 0", cursor:"pointer", fontSize:12, fontWeight:700 }}>Çıkış Yap</button>
      </div>
    </aside>
  );
}

// ── Main ──────────────────────────────────────────
export default function AdminPanel() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState("overview");
  const [selectedMerchantId, setSelectedMerchantId] = useState(null);

  const handleSelectMerchant = (id) => { setSelectedMerchantId(id); setPage("merchant-detail"); };
  const handleBack = () => { setSelectedMerchantId(null); setPage("merchants"); };

  const pageContent = () => {
    if (page === "merchant-detail" && selectedMerchantId)
      return <MerchantDetailsPage merchantId={selectedMerchantId} onBack={handleBack} />;
    if (page === "merchants") return <MerchantsPage onSelectMerchant={handleSelectMerchant} />;
    if (page === "profile")   return <ProfilePage />;
    return <OverviewPage />;
  };

  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}*{box-sizing:border-box}body{margin:0;background:${P.bg}}::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-track{background:${P.bg}}::-webkit-scrollbar-thumb{background:${P.border};border-radius:3px}::-webkit-scrollbar-thumb:hover{background:${P.purple}}select option{background:#fff;color:${P.text}}input::placeholder{color:${P.muted}}`}</style>
      <div style={{ background:P.bg, minHeight:"100vh", display:"flex", fontFamily:"'DM Sans','Segoe UI',system-ui,sans-serif" }}>
        <Sidebar page={page} setPage={p=>{ setPage(p); setSelectedMerchantId(null); }} user={user} logout={logout} />
        <main style={{ flex:1, padding:"28px 32px", overflow:"auto" }}>{pageContent()}</main>
      </div>
    </>
  );
}