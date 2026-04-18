import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const P = {
  bg:"#F0F4FF", card:"#FFFFFF", border:"#E2E8F8",
  purple:"#6C3AFF", pink:"#F43F8E", text:"#1E1B4B",
  sub:"#64748B", muted:"#94A3B8", light:"#F8FAFF",
  emerald:"#10B981", rose:"#F43F5E", amber:"#F59E0B", cyan:"#0EA5E9",
};

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

async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem("zyrix_token");
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: { "Content-Type":"application/json", ...(token?{Authorization:`Bearer ${token}`}:{}), ...opts.headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Error");
  return data;
}

function Field({ label, children, hint }) {
  return (
    <div>
      <label style={{ color:P.sub, fontSize:12, fontWeight:600, display:"block", marginBottom:5 }}>{label}</label>
      {children}
      {hint && <div style={{ color:P.muted, fontSize:11, marginTop:4 }}>{hint}</div>}
    </div>
  );
}

function Input({ value, onChange, type="text", placeholder, disabled }) {
  const [f, setF] = useState(false);
  return (
    <input type={type} value={value||""} onChange={onChange} placeholder={placeholder} disabled={disabled}
      onFocus={()=>setF(true)} onBlur={()=>setF(false)}
      style={{ width:"100%", background:disabled?P.bg:P.light, border:`1.5px solid ${f?P.purple:P.border}`, color:P.text, borderRadius:10, padding:"10px 14px", fontSize:14, outline:"none", boxSizing:"border-box", transition:"border-color 0.15s", opacity:disabled?0.6:1 }} />
  );
}

export default function SettingsPage({ onClose }) {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("profile");
  const [profile, setProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Password change
  const [pwForm, setPwForm] = useState({ current:"", next:"", confirm:"" });

  useEffect(() => {
    apiFetch("/api/profile").then(r => setProfile(r.data)).catch(() => {});
  }, []);

  const set = (k, v) => setProfile(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    setSaving(true); setError(""); setSuccess("");
    try {
      const res = await apiFetch("/api/profile", {
        method: "PUT",
        body: JSON.stringify({
          name:         profile.name,
          businessName: profile.businessName,
          businessType: profile.businessType,
          country:      profile.country,
          language:     profile.language,
          currency:     profile.currency,
          phone:        profile.phone,
        }),
      });
      // Update localStorage
      const cached = JSON.parse(localStorage.getItem("zyrix_user")||"{}");
      localStorage.setItem("zyrix_user", JSON.stringify({ ...cached, name: res.data.name, businessName: res.data.businessName }));
      setSuccess("Ayarlar kaydedildi ✅");
      setTimeout(() => setSuccess(""), 3000);
    } catch(e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async () => {
    if (pwForm.next !== pwForm.confirm) { setError("Şifreler eşleşmiyor"); return; }
    if (pwForm.next.length < 8) { setError("Şifre en az 8 karakter olmalı"); return; }
    setSaving(true); setError(""); setSuccess("");
    try {
      await apiFetch("/api/auth/change-password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
      });
      setSuccess("Şifre başarıyla değiştirildi ✅");
      setPwForm({ current:"", next:"", confirm:"" });
      setTimeout(() => setSuccess(""), 3000);
    } catch(e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const TABS = [
    { id:"profile",      icon:"👤", label:"Profil" },
    { id:"business",     icon:"🏢", label:"İşletme" },
    { id:"preferences",  icon:"⚙️", label:"Tercihler" },
    { id:"security",     icon:"🔒", label:"Güvenlik" },
    { id:"subscription", icon:"💳", label:"Abonelik" },
  ];

  const planColors = { STARTER:P.cyan, BUSINESS:P.purple, PRO:P.pink, ENTERPRISE:P.amber, FREE:P.muted };

  return (
    <>
      <style>{`*{box-sizing:border-box}select option{background:#fff}input::placeholder{color:${P.muted}}`}</style>
      <div style={{ minHeight:"100vh", background:P.bg, fontFamily:"'DM Sans','Segoe UI',system-ui,sans-serif" }}>
        {/* Header */}
        <div style={{ background:P.card, borderBottom:`1.5px solid ${P.border}`, padding:"16px 32px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button onClick={onClose} style={{ background:P.light, border:`1.5px solid ${P.border}`, color:P.sub, borderRadius:10, padding:"7px 14px", cursor:"pointer", fontSize:13, fontWeight:600 }}>
              ← Geri
            </button>
            <h1 style={{ color:P.text, fontSize:20, fontWeight:800, margin:0 }}>Ayarlar</h1>
          </div>
          <button onClick={handleSave} disabled={saving || tab==="security" || tab==="subscription"}
            style={{ background:saving?P.muted:`linear-gradient(135deg,${P.purple},${P.pink})`, border:"none", color:"#fff", borderRadius:10, padding:"9px 22px", cursor:saving?"not-allowed":"pointer", fontSize:14, fontWeight:700, opacity:(tab==="security"||tab==="subscription")?0:1 }}>
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>

        <div style={{ display:"flex", maxWidth:960, margin:"0 auto", padding:"24px 16px", gap:20 }}>
          {/* Sidebar */}
          <aside style={{ width:200, flexShrink:0 }}>
            <div style={{ background:P.card, borderRadius:16, overflow:"hidden", border:`1.5px solid ${P.border}` }}>
              {TABS.map(t => (
                <button key={t.id} onClick={()=>{ setTab(t.id); setError(""); setSuccess(""); }} style={{
                  width:"100%", background: tab===t.id ? `${P.purple}10` : "transparent",
                  border:"none", borderLeft:`3px solid ${tab===t.id ? P.purple : "transparent"}`,
                  color: tab===t.id ? P.purple : P.sub,
                  padding:"13px 16px", cursor:"pointer", textAlign:"left",
                  display:"flex", alignItems:"center", gap:10, fontSize:14, fontWeight:tab===t.id?700:500,
                  transition:"all 0.15s",
                }}>
                  <span>{t.icon}</span>{t.label}
                </button>
              ))}
            </div>
          </aside>

          {/* Content */}
          <div style={{ flex:1 }}>
            {success && <div style={{ background:`${P.emerald}12`, border:`1.5px solid ${P.emerald}25`, borderRadius:12, padding:"12px 16px", color:P.emerald, fontSize:13, fontWeight:600, marginBottom:16 }}>{success}</div>}
            {error   && <div style={{ background:`${P.rose}12`,    border:`1.5px solid ${P.rose}25`,    borderRadius:12, padding:"12px 16px", color:P.rose,    fontSize:13, fontWeight:600, marginBottom:16 }}>⚠ {error}</div>}

            <div style={{ background:P.card, borderRadius:20, padding:28, border:`1.5px solid ${P.border}`, boxShadow:"0 2px 16px rgba(108,58,255,0.06)" }}>

              {/* Profile Tab */}
              {tab==="profile" && profile && (
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  <h2 style={{ color:P.text, fontSize:17, fontWeight:800, margin:"0 0 4px" }}>Profil Bilgileri</h2>
                  {/* Avatar */}
                  <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:8, padding:16, background:P.light, borderRadius:14 }}>
                    <div style={{ width:56, height:56, borderRadius:"50%", background:`linear-gradient(135deg,${P.purple},${P.pink})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:22, fontWeight:800 }}>
                      {(profile.name||"U")[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ color:P.text, fontSize:16, fontWeight:700 }}>{profile.name}</div>
                      <div style={{ color:P.sub, fontSize:13 }}>{profile.email}</div>
                      <div style={{ color:planColors[profile.plan]||P.muted, fontSize:11, fontWeight:700, background:`${planColors[profile.plan]||P.muted}15`, borderRadius:20, padding:"1px 8px", display:"inline-block", marginTop:4 }}>{profile.plan}</div>
                    </div>
                  </div>
                  <Field label="Ad Soyad"><Input value={profile.name} onChange={e=>set("name",e.target.value)} placeholder="Ad Soyad" /></Field>
                  <Field label="E-posta"><Input value={profile.email} disabled placeholder="E-posta" hint="E-posta değiştirmek için destek ile iletişime geçin" /></Field>
                  <Field label="Telefon" hint="Türkiye formatı: 0532 123 45 67"><Input value={profile.phone} onChange={e=>set("phone",e.target.value)} placeholder="+90 532 123 45 67" /></Field>
                </div>
              )}

              {/* Business Tab */}
              {tab==="business" && profile && (
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  <h2 style={{ color:P.text, fontSize:17, fontWeight:800, margin:"0 0 4px" }}>İşletme Bilgileri</h2>
                  <Field label="İşletme / Şirket Adı"><Input value={profile.businessName} onChange={e=>set("businessName",e.target.value)} placeholder="Şirket Adı" /></Field>
                  <Field label="Faaliyet Türü">
                    <select value={profile.businessType||""} onChange={e=>set("businessType",e.target.value)}
                      style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, color:P.text, borderRadius:10, padding:"10px 14px", fontSize:14, outline:"none" }}>
                      <option value="">Seçiniz</option>
                      {["Perakende","Hizmet","Restoran","E-Ticaret","Danışmanlık","Teknoloji","Sağlık","Eğitim","İnşaat","Diğer"].map(t=><option key={t} value={t.toLowerCase()}>{t}</option>)}
                    </select>
                  </Field>
                  <Field label="📍 İl">
                    <select value={profile.country||"İstanbul"} onChange={e=>set("country",e.target.value)}
                      style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, color:P.text, borderRadius:10, padding:"10px 14px", fontSize:14, outline:"none" }}>
                      {TR_PROVINCES.map(p=><option key={p} value={p}>{p}</option>)}
                    </select>
                  </Field>
                </div>
              )}

              {/* Preferences Tab */}
              {tab==="preferences" && profile && (
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  <h2 style={{ color:P.text, fontSize:17, fontWeight:800, margin:"0 0 4px" }}>Tercihler</h2>
                  <Field label="Para Birimi">
                    <div style={{ display:"flex", gap:10 }}>
                      {[{id:"TRY",flag:"🇹🇷",label:"₺ TRY"},{id:"USD",flag:"🇺🇸",label:"$ USD"},{id:"EUR",flag:"🇪🇺",label:"€ EUR"}].map(c=>(
                        <button key={c.id} onClick={()=>set("currency",c.id)} style={{ flex:1, background:profile.currency===c.id?`${P.purple}12`:P.light, border:`1.5px solid ${profile.currency===c.id?P.purple:P.border}`, borderRadius:10, padding:"10px 8px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                          <span style={{ fontSize:18 }}>{c.flag}</span>
                          <span style={{ color:profile.currency===c.id?P.purple:P.text, fontSize:13, fontWeight:700 }}>{c.label}</span>
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label="Dil">
                    <div style={{ display:"flex", gap:10 }}>
                      {[{id:"TR",flag:"🇹🇷",label:"Türkçe"},{id:"EN",flag:"🇬🇧",label:"English"}].map(l=>(
                        <button key={l.id} onClick={()=>set("language",l.id)} style={{ flex:1, background:profile.language===l.id?`${P.purple}12`:P.light, border:`1.5px solid ${profile.language===l.id?P.purple:P.border}`, borderRadius:10, padding:"10px 8px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                          <span style={{ fontSize:18 }}>{l.flag}</span>
                          <span style={{ color:profile.language===l.id?P.purple:P.text, fontSize:13, fontWeight:700 }}>{l.label}</span>
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>
              )}

              {/* Security Tab */}
              {tab==="security" && (
                <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  <h2 style={{ color:P.text, fontSize:17, fontWeight:800, margin:"0 0 4px" }}>Güvenlik</h2>
                  <Field label="Mevcut Şifre"><input type="password" value={pwForm.current} onChange={e=>setPwForm(f=>({...f,current:e.target.value}))} placeholder="••••••••" style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, color:P.text, borderRadius:10, padding:"10px 14px", fontSize:14, outline:"none", boxSizing:"border-box" }} /></Field>
                  <Field label="Yeni Şifre" hint="En az 8 karakter"><input type="password" value={pwForm.next} onChange={e=>setPwForm(f=>({...f,next:e.target.value}))} placeholder="••••••••" style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, color:P.text, borderRadius:10, padding:"10px 14px", fontSize:14, outline:"none", boxSizing:"border-box" }} /></Field>
                  <Field label="Yeni Şifre Tekrar"><input type="password" value={pwForm.confirm} onChange={e=>setPwForm(f=>({...f,confirm:e.target.value}))} placeholder="••••••••" style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, color:P.text, borderRadius:10, padding:"10px 14px", fontSize:14, outline:"none", boxSizing:"border-box" }} /></Field>
                  <button onClick={handlePasswordChange} disabled={saving} style={{ background:`linear-gradient(135deg,${P.purple},${P.pink})`, border:"none", color:"#fff", borderRadius:10, padding:"12px 0", cursor:"pointer", fontSize:14, fontWeight:700 }}>
                    {saving ? "Değiştiriliyor..." : "Şifreyi Değiştir"}
                  </button>
                  <div style={{ marginTop:16, paddingTop:16, borderTop:`1px solid ${P.border}` }}>
                    <button onClick={logout} style={{ width:"100%", background:`${P.rose}10`, border:`1.5px solid ${P.rose}25`, color:P.rose, borderRadius:10, padding:"11px 0", cursor:"pointer", fontSize:14, fontWeight:700 }}>
                      Tüm Cihazlardan Çıkış Yap
                    </button>
                  </div>
                </div>
              )}

              {/* Subscription Tab */}
              {tab==="subscription" && profile && (
                <div>
                  <h2 style={{ color:P.text, fontSize:17, fontWeight:800, margin:"0 0 20px" }}>Abonelik</h2>
                  <div style={{ background:P.light, borderRadius:14, padding:20, marginBottom:20 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div>
                        <div style={{ color:P.muted, fontSize:12, fontWeight:600, marginBottom:4 }}>Mevcut Plan</div>
                        <div style={{ color:planColors[profile.plan]||P.muted, fontSize:22, fontWeight:800 }}>{profile.plan}</div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ color:P.muted, fontSize:12, marginBottom:4 }}>Durum</div>
                        <span style={{ background:`${profile.status==="ACTIVE"?P.emerald:P.amber}15`, color:profile.status==="ACTIVE"?P.emerald:P.amber, borderRadius:20, padding:"3px 12px", fontSize:12, fontWeight:700 }}>{profile.status}</span>
                      </div>
                    </div>
                    {profile.trialEndsAt && (
                      <div style={{ marginTop:12, color:P.sub, fontSize:13 }}>
                        Deneme bitiş: <strong>{new Date(profile.trialEndsAt).toLocaleDateString("tr-TR")}</strong>
                      </div>
                    )}
                  </div>
                  <a href="/payment" style={{ display:"block", background:`linear-gradient(135deg,${P.purple},${P.pink})`, color:"#fff", textAlign:"center", borderRadius:12, padding:"13px 0", fontSize:15, fontWeight:700, textDecoration:"none", boxShadow:`0 4px 20px ${P.purple}30` }}>
                    Plan Yükselt →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}