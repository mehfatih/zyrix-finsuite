// ================================================================
// Zyrix FinSuite — Register Page
// Turkish phone validation, 30-day free trial
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

function isValidTurkishPhone(phone) {
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");
  return /^(\+90|0)5[0-9]{9}$/.test(cleaned);
}

function Field({ label, error, children, hint }) {
  return (
    <div>
      <label style={{ color: P.sub, fontSize: 12, display: "block", marginBottom: 5, fontWeight: 600 }}>{label}</label>
      {children}
      {hint && !error && <div style={{ color: P.muted, fontSize: 11, marginTop: 4 }}>{hint}</div>}
      {error && <div style={{ color: P.rose, fontSize: 11, marginTop: 4 }}>⚠ {error}</div>}
    </div>
  );
}

function Input({ value, onChange, type = "text", placeholder, hasError }) {
  const [focused, setFocused] = useState(false);
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={{
        width: "100%", background: P.light, boxSizing: "border-box",
        border: `1.5px solid ${hasError ? P.rose : focused ? P.purple : P.border}`,
        color: P.text, borderRadius: 10, padding: "11px 14px", fontSize: 14,
        outline: "none", transition: "border-color 0.15s",
      }} />
  );
}

export default function RegisterPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", confirmPassword: "",
    businessName: "", province: "İstanbul",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())          e.name = "Full name is required";
    if (!form.email.trim())         e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email address";
    if (!form.phone.trim())         e.phone = "Phone number is required";
    else if (!isValidTurkishPhone(form.phone)) e.phone = "Invalid Turkish phone number (e.g. 0532 123 45 67)";
    if (!form.password)             e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Minimum 8 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true); setServerError("");
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, email: form.email, phone: form.phone,
          password: form.password, businessName: form.businessName,
          country: form.province, language: "TR", currency: "TRY",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Registration failed");

      // Auto-login after register
      const token = data.data?.token;
      const user  = { ...data.data?.merchant, role: "MERCHANT", _type: "merchant" };
      localStorage.setItem("zyrix_token", token);
      localStorage.setItem("zyrix_user", JSON.stringify(user));
      window.location.href = "/dashboard";
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`*{box-sizing:border-box}body{margin:0;background:${P.bg}}input::placeholder{color:${P.muted}}select option{background:#fff;color:${P.text}}`}</style>
      <div style={{ minHeight: "100vh", background: P.bg, display: "flex", fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif" }}>

        {/* Left — Branding */}
        <div style={{
          width: "40%", background: `linear-gradient(135deg,${P.purple} 0%,${P.pink} 100%)`,
          display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 48px",
          position: "relative", overflow: "hidden",
        }}>
          {/* Blobs */}
          <div style={{ position:"absolute", top:-60, right:-60, width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,0.08)" }}/>
          <div style={{ position:"absolute", bottom:-40, left:-40, width:160, height:160, borderRadius:"50%", background:"rgba(255,255,255,0.06)" }}/>
          <div style={{ position:"absolute", top:"40%", right:20, width:80, height:80, borderRadius:"50%", background:"rgba(255,255,255,0.1)" }}/>

          <div style={{ position:"relative" }}>
            <div style={{ width:52, height:52, borderRadius:14, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:24, backdropFilter:"blur(10px)" }}>
              <span style={{ color:"#fff", fontWeight:900, fontSize:24 }}>Z</span>
            </div>
            <h1 style={{ color:"#fff", fontSize:32, fontWeight:900, margin:"0 0 12px", lineHeight:1.2 }}>
              Zyrix FinSuite
            </h1>
            <p style={{ color:"rgba(255,255,255,0.8)", fontSize:16, lineHeight:1.6, margin:"0 0 40px" }}>
              Türkiye'nin en akıllı işletme yönetim platformu
            </p>

            {/* Features */}
            {[
              { icon:"🎁", text:"30 gün ücretsiz deneme" },
              { icon:"📊", text:"Fatura, CRM, Deals tek platformda" },
              { icon:"🤖", text:"AI destekli iş analitiği" },
              { icon:"🔒", text:"Verileriniz daima güvende" },
              { icon:"📱", text:"Türkiye'ye özel tasarım" },
            ].map(f => (
              <div key={f.text} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{f.icon}</div>
                <span style={{ color:"rgba(255,255,255,0.9)", fontSize:14, fontWeight:500 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Form */}
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 60px", overflow:"auto" }}>
          <div style={{ width:"100%", maxWidth:480 }}>
            <div style={{ marginBottom:32 }}>
              <h2 style={{ color:P.text, fontSize:26, fontWeight:800, margin:"0 0 6px" }}>Hesap Oluştur</h2>
              <p style={{ color:P.sub, fontSize:14, margin:0 }}>
                30 günlük ücretsiz denemenizi başlatın — kredi kartı gerekmez
              </p>
            </div>

            {/* Trial badge */}
            <div style={{ background:`${P.emerald}12`, border:`1.5px solid ${P.emerald}25`, borderRadius:12, padding:"10px 16px", marginBottom:24, display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:20 }}>🎁</span>
              <div>
                <div style={{ color:P.emerald, fontSize:13, fontWeight:700 }}>30 Gün Ücretsiz Deneme</div>
                <div style={{ color:P.sub, fontSize:11 }}>Sonunda ödeme yapmak zorunda değilsiniz. Otomatik fatura kesilmez.</div>
              </div>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <Field label="Ad Soyad *" error={errors.name}>
                  <Input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="Ahmet Yılmaz" hasError={!!errors.name} />
                </Field>
                <Field label="İşletme Adı" error={errors.businessName}>
                  <Input value={form.businessName} onChange={e=>set("businessName",e.target.value)} placeholder="Şirket Adı" />
                </Field>
              </div>

              <Field label="E-posta Adresi *" error={errors.email}>
                <Input type="email" value={form.email} onChange={e=>set("email",e.target.value)} placeholder="ornek@sirket.com" hasError={!!errors.email} />
              </Field>

              <Field label="Telefon Numarası *" error={errors.phone} hint="Türkiye numarası: 0532 123 45 67 veya +90 532 123 45 67">
                <Input value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="0532 123 45 67" hasError={!!errors.phone} />
              </Field>

              <Field label="İl *">
                <select value={form.province} onChange={e=>set("province",e.target.value)}
                  style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, color:P.text, borderRadius:10, padding:"11px 14px", fontSize:14, outline:"none" }}>
                  {TR_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <Field label="Şifre *" error={errors.password} hint="En az 8 karakter">
                  <Input type="password" value={form.password} onChange={e=>set("password",e.target.value)} placeholder="••••••••" hasError={!!errors.password} />
                </Field>
                <Field label="Şifre Tekrar *" error={errors.confirmPassword}>
                  <Input type="password" value={form.confirmPassword} onChange={e=>set("confirmPassword",e.target.value)} placeholder="••••••••" hasError={!!errors.confirmPassword} />
                </Field>
              </div>

              {serverError && (
                <div style={{ background:`${P.rose}12`, border:`1.5px solid ${P.rose}25`, borderRadius:10, padding:"12px 16px", color:P.rose, fontSize:13, fontWeight:600 }}>
                  ⚠ {serverError}
                </div>
              )}

              <button onClick={handleSubmit} disabled={loading} style={{
                background: loading ? P.muted : `linear-gradient(135deg,${P.purple},${P.pink})`,
                border:"none", color:"#fff", borderRadius:12, padding:"13px 0",
                fontSize:15, fontWeight:700, cursor:loading?"not-allowed":"pointer",
                boxShadow:`0 4px 20px ${P.purple}30`, transition:"all 0.2s",
              }}>
                {loading ? "Hesap oluşturuluyor..." : "Ücretsiz Denemeyi Başlat 🚀"}
              </button>

              <div style={{ textAlign:"center", color:P.sub, fontSize:13 }}>
                Zaten hesabınız var mı?{" "}
                <a href="/login" style={{ color:P.purple, fontWeight:700, textDecoration:"none" }}>Giriş Yapın</a>
              </div>

              <div style={{ textAlign:"center", color:P.muted, fontSize:11, lineHeight:1.5 }}>
                Kayıt olarak <a href="#" style={{ color:P.purple }}>Kullanım Şartları</a>'nı ve{" "}
                <a href="#" style={{ color:P.purple }}>Gizlilik Politikası</a>'nı kabul etmiş olursunuz.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}