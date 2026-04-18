// ================================================================
// Zyrix FinSuite — Onboarding Wizard
// Shown once after first login if onboardingDone = false
// ================================================================

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const P = {
  bg: "#F0F4FF", card: "#FFFFFF", border: "#E2E8F8",
  purple: "#6C3AFF", pink: "#F43F8E", text: "#1E1B4B",
  sub: "#64748B", muted: "#94A3B8", light: "#F8FAFF",
  emerald: "#10B981", rose: "#F43F5E", amber: "#F59E0B",
};

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

const BUSINESS_TYPES = [
  { id: "retail",      label: "Perakende",        icon: "🏪" },
  { id: "service",     label: "Hizmet",            icon: "🔧" },
  { id: "restaurant",  label: "Restoran & Kafe",   icon: "🍽️" },
  { id: "ecommerce",   label: "E-Ticaret",         icon: "🛒" },
  { id: "consulting",  label: "Danışmanlık",       icon: "💼" },
  { id: "technology",  label: "Teknoloji",         icon: "💻" },
  { id: "healthcare",  label: "Sağlık",            icon: "🏥" },
  { id: "education",   label: "Eğitim",            icon: "📚" },
  { id: "construction",label: "İnşaat",            icon: "🏗️" },
  { id: "other",       label: "Diğer",             icon: "✨" },
];

const CURRENCIES = [
  { id: "TRY", label: "Türk Lirası (₺)", flag: "🇹🇷" },
  { id: "USD", label: "US Dollar ($)",   flag: "🇺🇸" },
  { id: "EUR", label: "Euro (€)",        flag: "🇪🇺" },
];

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

const STEPS = [
  { id: 1, title: "İşletme Bilgileri", icon: "🏢" },
  { id: 2, title: "Faaliyet Türü",     icon: "📊" },
  { id: 3, title: "Tercihler",         icon: "⚙️" },
  { id: 4, title: "Hazırsınız!",       icon: "🚀" },
];

export default function OnboardingPage() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    businessName: user?.name || "",
    businessType: "",
    province:     "İstanbul",
    currency:     "TRY",
    language:     "TR",
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleComplete = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("zyrix_token");
      await fetch(`${API}/api/profile/onboarding`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          businessName: form.businessName,
          businessType: form.businessType,
          country:      form.province,
          currency:     form.currency,
          language:     form.language,
        }),
      });
      // Update local user
      const cached = JSON.parse(localStorage.getItem("zyrix_user") || "{}");
      localStorage.setItem("zyrix_user", JSON.stringify({ ...cached, onboardingDone: true, businessName: form.businessName }));
      window.location.href = "/dashboard";
    } catch {
      window.location.href = "/dashboard";
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`*{box-sizing:border-box}body{margin:0;background:${P.bg}}input::placeholder{color:${P.muted}}select option{background:#fff}`}</style>
      <div style={{ minHeight:"100vh", background:P.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"'DM Sans','Segoe UI',system-ui,sans-serif" }}>

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:32 }}>
          <div style={{ width:40, height:40, borderRadius:12, background:`linear-gradient(135deg,${P.purple},${P.pink})`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 4px 16px ${P.purple}35` }}>
            <span style={{ color:"#fff", fontWeight:900, fontSize:18 }}>Z</span>
          </div>
          <span style={{ color:P.text, fontWeight:800, fontSize:20 }}>Zyrix <span style={{ color:P.purple }}>FinSuite</span></span>
        </div>

        {/* Progress */}
        <div style={{ display:"flex", alignItems:"center", gap:0, marginBottom:32 }}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                <div style={{
                  width:40, height:40, borderRadius:"50%",
                  background: step >= s.id ? `linear-gradient(135deg,${P.purple},${P.pink})` : P.border,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:step >= s.id ? 18 : 14,
                  boxShadow: step === s.id ? `0 4px 16px ${P.purple}35` : "none",
                  transition:"all 0.3s",
                }}>
                  {step > s.id ? <span style={{ color:"#fff", fontSize:16 }}>✓</span> : <span>{s.icon}</span>}
                </div>
                <span style={{ color: step >= s.id ? P.purple : P.muted, fontSize:11, fontWeight:600, whiteSpace:"nowrap" }}>{s.title}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ width:48, height:2, background: step > s.id ? P.purple : P.border, margin:"0 4px 20px", transition:"background 0.3s" }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Card */}
        <div style={{ background:P.card, borderRadius:24, padding:"36px 40px", width:"100%", maxWidth:520, boxShadow:`0 8px 40px ${P.purple}12, 0 2px 8px rgba(0,0,0,0.06)`, border:`1.5px solid ${P.border}` }}>

          {/* Step 1 — Business Info */}
          {step === 1 && (
            <div>
              <h2 style={{ color:P.text, fontSize:22, fontWeight:800, margin:"0 0 6px" }}>İşletmenizi Tanıtalım 🏢</h2>
              <p style={{ color:P.sub, fontSize:14, margin:"0 0 28px" }}>Bu bilgiler fatura ve raporlarınızda görünecek.</p>

              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <div>
                  <label style={{ color:P.sub, fontSize:12, fontWeight:600, display:"block", marginBottom:5 }}>İşletme / Şirket Adı *</label>
                  <input value={form.businessName} onChange={e=>set("businessName",e.target.value)}
                    placeholder="Şirket Adı Anonim Şirketi"
                    style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, color:P.text, borderRadius:10, padding:"11px 14px", fontSize:14, outline:"none" }}
                    onFocus={e=>e.target.style.borderColor=P.purple}
                    onBlur={e=>e.target.style.borderColor=P.border} />
                </div>
                <div>
                  <label style={{ color:P.sub, fontSize:12, fontWeight:600, display:"block", marginBottom:5 }}>📍 İl</label>
                  <select value={form.province} onChange={e=>set("province",e.target.value)}
                    style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, color:P.text, borderRadius:10, padding:"11px 14px", fontSize:14, outline:"none" }}>
                    {TR_PROVINCES.map(p=><option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Business Type */}
          {step === 2 && (
            <div>
              <h2 style={{ color:P.text, fontSize:22, fontWeight:800, margin:"0 0 6px" }}>Faaliyet Türünüz? 📊</h2>
              <p style={{ color:P.sub, fontSize:14, margin:"0 0 24px" }}>Size en uygun deneyimi sunabilmemiz için.</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {BUSINESS_TYPES.map(bt => (
                  <button key={bt.id} onClick={()=>set("businessType",bt.id)} style={{
                    background: form.businessType===bt.id ? `linear-gradient(135deg,${P.purple}15,${P.pink}08)` : P.light,
                    border: `1.5px solid ${form.businessType===bt.id ? P.purple : P.border}`,
                    borderRadius:12, padding:"14px 12px", cursor:"pointer", textAlign:"left",
                    display:"flex", alignItems:"center", gap:10, transition:"all 0.15s",
                  }}>
                    <span style={{ fontSize:22 }}>{bt.icon}</span>
                    <span style={{ color: form.businessType===bt.id ? P.purple : P.text, fontSize:13, fontWeight:600 }}>{bt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 — Preferences */}
          {step === 3 && (
            <div>
              <h2 style={{ color:P.text, fontSize:22, fontWeight:800, margin:"0 0 6px" }}>Tercihleriniz ⚙️</h2>
              <p style={{ color:P.sub, fontSize:14, margin:"0 0 24px" }}>Para birimi ve dil ayarlarınızı belirleyin.</p>

              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                <div>
                  <label style={{ color:P.sub, fontSize:12, fontWeight:600, display:"block", marginBottom:8 }}>Para Birimi</label>
                  <div style={{ display:"flex", gap:10 }}>
                    {CURRENCIES.map(c => (
                      <button key={c.id} onClick={()=>set("currency",c.id)} style={{
                        flex:1, background: form.currency===c.id ? `${P.purple}12` : P.light,
                        border:`1.5px solid ${form.currency===c.id ? P.purple : P.border}`,
                        borderRadius:12, padding:"12px 8px", cursor:"pointer",
                        display:"flex", flexDirection:"column", alignItems:"center", gap:6,
                      }}>
                        <span style={{ fontSize:22 }}>{c.flag}</span>
                        <span style={{ color: form.currency===c.id ? P.purple : P.text, fontSize:12, fontWeight:700 }}>{c.id}</span>
                        <span style={{ color:P.muted, fontSize:10 }}>{c.label.split(" ")[0]} {c.label.split(" ")[1]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ color:P.sub, fontSize:12, fontWeight:600, display:"block", marginBottom:8 }}>Dil</label>
                  <div style={{ display:"flex", gap:10 }}>
                    {[{id:"TR",label:"Türkçe",flag:"🇹🇷"},{id:"EN",label:"English",flag:"🇬🇧"}].map(l=>(
                      <button key={l.id} onClick={()=>set("language",l.id)} style={{
                        flex:1, background: form.language===l.id ? `${P.purple}12` : P.light,
                        border:`1.5px solid ${form.language===l.id ? P.purple : P.border}`,
                        borderRadius:12, padding:"12px 8px", cursor:"pointer",
                        display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                      }}>
                        <span style={{ fontSize:20 }}>{l.flag}</span>
                        <span style={{ color: form.language===l.id ? P.purple : P.text, fontSize:13, fontWeight:700 }}>{l.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4 — Ready */}
          {step === 4 && (
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:64, marginBottom:16 }}>🚀</div>
              <h2 style={{ color:P.text, fontSize:24, fontWeight:800, margin:"0 0 8px" }}>Hazırsınız!</h2>
              <p style={{ color:P.sub, fontSize:15, lineHeight:1.7, margin:"0 0 24px" }}>
                <strong>{form.businessName}</strong> için Zyrix FinSuite hesabınız hazır.<br/>
                30 günlük ücretsiz denemeniz başladı.
              </p>

              {/* Summary */}
              <div style={{ background:P.light, borderRadius:14, padding:20, marginBottom:24, textAlign:"left" }}>
                {[
                  ["🏢 İşletme", form.businessName],
                  ["📍 İl", form.province],
                  ["📊 Tür", BUSINESS_TYPES.find(b=>b.id===form.businessType)?.label || "—"],
                  ["💰 Para Birimi", CURRENCIES.find(c=>c.id===form.currency)?.label || form.currency],
                ].map(([k,v])=>(
                  <div key={String(k)} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${P.border}` }}>
                    <span style={{ color:P.sub, fontSize:13 }}>{k}</span>
                    <span style={{ color:P.text, fontSize:13, fontWeight:600 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:28, gap:12 }}>
            {step > 1 && (
              <button onClick={()=>setStep(s=>s-1)} style={{ background:P.light, border:`1.5px solid ${P.border}`, color:P.sub, borderRadius:12, padding:"12px 20px", cursor:"pointer", fontSize:14, fontWeight:600 }}>
                ← Geri
              </button>
            )}
            <button onClick={step < 4 ? ()=>setStep(s=>s+1) : handleComplete}
              disabled={loading || (step===1 && !form.businessName) || (step===2 && !form.businessType)}
              style={{
                flex:1, background:`linear-gradient(135deg,${P.purple},${P.pink})`,
                border:"none", color:"#fff", borderRadius:12, padding:"13px 0",
                fontSize:15, fontWeight:700, cursor:"pointer",
                boxShadow:`0 4px 20px ${P.purple}30`,
                opacity: (loading || (step===1 && !form.businessName) || (step===2 && !form.businessType)) ? 0.6 : 1,
              }}>
              {loading ? "Kaydediliyor..." : step < 4 ? "Devam →" : "Dashboard'a Git 🚀"}
            </button>
          </div>
        </div>

        <p style={{ color:P.muted, fontSize:12, marginTop:20 }}>
          Bu adımları dilediğiniz zaman Ayarlar'dan değiştirebilirsiniz.
        </p>
      </div>
    </>
  );
}