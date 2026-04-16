"use client";

import { useLocale } from "next-intl";
import Link from "next/link";
import { useState } from "react";

const GOLD = "#B8892A";

const L = {
  tr: {
    title:    "Zyrix'e Hoş Geldiniz",
    sub:      "14 gün ücretsiz — kredi kartı gerekmez",
    steps:    ["Hesap Bilgileri","Şirket Bilgileri","Plan Seçimi"],
    fields: {
      fullName:  "Ad Soyad", email: "E-posta", password: "Şifre",
      company:   "Şirket Adı", sector: "Sektör", size: "Çalışan Sayısı", city: "Şehir",
    },
    sectors:   ["Restoran","Ticaret","Hizmet","İnşaat","Üretim","Danışmanlık","Diğer"],
    sizes:     ["1-5","6-15","16-30","31-50","50+"],
    plans:     ["Starter","Business","Pro"],
    prices:    ["$19/ay","$45/ay","$65/ay"],
    planDescs: ["Yeni başlayanlar için","Büyüyen işletmeler için","Ölçeklenmek isteyenler için"],
    next: "Devam Et", prev: "Geri", finish: "Ücretsiz Başla",
    loginLink: "Zaten hesabınız var mı? Giriş yapın",
    popular:   "En Popüler",
  },
  en: {
    title:    "Welcome to Zyrix",
    sub:      "14 days free — no credit card required",
    steps:    ["Account Info","Company Info","Choose Plan"],
    fields: {
      fullName: "Full Name", email: "Email", password: "Password",
      company:  "Company Name", sector: "Sector", size: "Employees", city: "City",
    },
    sectors:  ["Restaurant","Trade","Services","Construction","Manufacturing","Consulting","Other"],
    sizes:    ["1-5","6-15","16-30","31-50","50+"],
    plans:    ["Starter","Business","Pro"],
    prices:   ["$19/mo","$45/mo","$65/mo"],
    planDescs:["For new businesses","For growing businesses","For scaling up"],
    next: "Continue", prev: "Back", finish: "Start Free",
    loginLink: "Already have an account? Sign in",
    popular:  "Most Popular",
  },
  ar: {
    title:    "مرحباً بك في Zyrix",
    sub:      "14 يوماً مجاناً — لا بطاقة ائتمان",
    steps:    ["بيانات الحساب","بيانات الشركة","اختر الخطة"],
    fields: {
      fullName: "الاسم الكامل", email: "البريد الإلكتروني", password: "كلمة المرور",
      company:  "اسم الشركة", sector: "القطاع", size: "عدد الموظفين", city: "المدينة",
    },
    sectors:  ["مطعم","تجارة","خدمات","إنشاء","تصنيع","استشارات","أخرى"],
    sizes:    ["1-5","6-15","16-30","31-50","50+"],
    plans:    ["Starter","Business","Pro"],
    prices:   ["$19/شهر","$45/شهر","$65/شهر"],
    planDescs:["للشركات الناشئة","للشركات المتنامية","للتوسع والنمو"],
    next: "متابعة", prev: "رجوع", finish: "ابدأ مجاناً",
    loginLink: "لديك حساب؟ تسجيل الدخول",
    popular:  "الأكثر شعبية",
  },
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px",
  border: "1.5px solid #E5E7EB", borderRadius: 9,
  fontSize: 14, outline: "none",
  fontFamily: "inherit", color: "#0A0A0A",
  background: "#fff", boxSizing: "border-box",
  transition: "border-color .15s",
};

export default function SignupPage() {
  const locale = useLocale();
  const l      = L[locale as keyof typeof L] ?? L.tr;
  const isRTL  = locale === "ar";

  const [step,    setStep]    = useState(0);
  const [selPlan, setSelPlan] = useState(1); // Business default

  const [form, setForm] = useState({
    fullName:"", email:"", password:"",
    company:"", sector:"", size:"", city:"",
  });

  function set(k: string, v: string) { setForm(f => ({...f, [k]:v})); }

  const PLAN_FEATS = [
    locale==="tr"
      ? ["3 kullanıcı","500 fatura/ay","Temel CRM","E-posta destek"]
      : locale==="ar"
      ? ["3 مستخدمين","500 فاتورة/شهر","CRM أساسي","دعم بريد"]
      : ["3 users","500 invoices/mo","Basic CRM","Email support"],
    locale==="tr"
      ? ["10 kullanıcı","Sınırsız fatura","Tam CRM","e-Fatura + KDV","AI CFO","WhatsApp destek"]
      : locale==="ar"
      ? ["10 مستخدمين","فواتير غير محدودة","CRM كامل","e-Fatura + KDV","AI CFO","دعم واتساب"]
      : ["10 users","Unlimited invoices","Full CRM","e-Invoice + VAT","AI CFO","WhatsApp support"],
    locale==="tr"
      ? ["Sınırsız kullanıcı","Çoklu şube","API + Webhooks","Zapier/Make","7/24 destek"]
      : locale==="ar"
      ? ["مستخدمون غير محدودون","متعدد الفروع","API + Webhooks","Zapier/Make","دعم 24/7"]
      : ["Unlimited users","Multi-branch","API + Webhooks","Zapier/Make","24/7 support"],
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#F8FAFC", display:"flex", direction: isRTL?"rtl":"ltr" }}>

      {/* Left panel — benefits */}
      <div style={{ width:360, background:"#0F172A", padding:"40px 32px", display:"flex", flexDirection:"column", gap:24 }} className="signup-left">
        <Link href={`/${locale}`} style={{ textDecoration:"none" }}>
          <span style={{ fontSize:22, fontWeight:900, color:"#fff", direction:"ltr", display:"inline-block" }}>
            <span style={{ color:"#2563EB" }}>Z</span>yrix<span style={{ color:"#2563EB" }}>.</span>
            <span style={{ fontSize:13, color:GOLD, marginLeft:6 }}>FinSuite</span>
          </span>
        </Link>

        <div>
          <h2 style={{ fontSize:20, fontWeight:800, color:"#fff", marginBottom:6 }}>{l.title}</h2>
          <p style={{ fontSize:13, color:"rgba(255,255,255,.6)", lineHeight:1.65 }}>{l.sub}</p>
        </div>

        {/* Benefits */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {[
            locale==="tr" ? ["✅","e-Fatura ve KDV otomatik"] : locale==="ar" ? ["✅","e-Fatura وKDV تلقائي"] : ["✅","e-Invoice & VAT automatic"],
            locale==="tr" ? ["🤖","AI CFO — 7/24 finansal danışman"] : locale==="ar" ? ["🤖","AI CFO — مستشار مالي 24/7"] : ["🤖","AI CFO — 24/7 financial advisor"],
            locale==="tr" ? ["📱","Android uygulaması dahil"] : locale==="ar" ? ["📱","تطبيق Android مدمج"] : ["📱","Android app included"],
            locale==="tr" ? ["🔒","SSL şifreleme + KVKK uyumlu"] : locale==="ar" ? ["🔒","تشفير SSL + متوافق KVKK"] : ["🔒","SSL encryption + GDPR compliant"],
            locale==="tr" ? ["💬","Türkçe destek — hızlı yanıt"] : locale==="ar" ? ["💬","دعم تركي — استجابة سريعة"] : ["💬","Turkish support — fast response"],
          ].map(([icon,text],i)=>(
            <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
              <span style={{ fontSize:16 }}>{icon}</span>
              <span style={{ fontSize:13, color:"rgba(255,255,255,.8)", lineHeight:1.5 }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div style={{ background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", borderRadius:12, padding:"14px 16px", marginTop:"auto" }}>
          <div style={{ display:"flex", gap:3, marginBottom:8 }}>
            {[1,2,3,4,5].map(s=>(<span key={s} style={{ color:"#F59E0B", fontSize:14 }}>★</span>))}
          </div>
          <p style={{ fontSize:12, color:"rgba(255,255,255,.7)", lineHeight:1.6, margin:"0 0 10px", fontStyle:"italic" }}>
            {locale==="tr"?"\"Zyrix ile 3 farklı yazılımdan kurtulduk. Hem zaman hem para tasarrufu.\"":locale==="ar"?"\"مع Zyrix تخلصنا من 3 برامج مختلفة. توفير في الوقت والمال.\"":"\"With Zyrix we got rid of 3 different softwares. Both time and money saved.\""}
          </p>
          <div style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,.6)" }}>
            Zeynep K. — Kara Gıda
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 24px" }}>
        <div style={{ width:"100%", maxWidth:480 }}>

          {/* Step indicator */}
          <div style={{ display:"flex", alignItems:"center", gap:0, marginBottom:28 }}>
            {l.steps.map((s,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", flex: i<l.steps.length-1?1:"auto" }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                  <div style={{
                    width:30, height:30, borderRadius:"50%",
                    background: i<step?"#059669":i===step?"#2563EB":"#E5E7EB",
                    color: i<=step?"#fff":"#9CA3AF",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:12, fontWeight:700, transition:"all .25s",
                  }}>
                    {i<step?"✓":(i+1)}
                  </div>
                  <span style={{ fontSize:10, color: i===step?"#2563EB":"#9CA3AF", fontWeight: i===step?700:500, whiteSpace:"nowrap" }}>{s}</span>
                </div>
                {i<l.steps.length-1 && (
                  <div style={{ flex:1, height:2, background: i<step?"#059669":"#E5E7EB", margin:"0 6px", marginBottom:18, transition:"background .25s" }} />
                )}
              </div>
            ))}
          </div>

          {/* Step 0 — Account */}
          {step===0 && (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <h2 style={{ fontSize:22, fontWeight:800, color:"#0A0A0A", margin:0 }}>{l.steps[0]}</h2>
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:"#374151", display:"block", marginBottom:5 }}>{l.fields.fullName}</label>
                <input value={form.fullName} onChange={e=>set("fullName",e.target.value)} style={inputStyle} placeholder="Ahmet Yılmaz"
                  onFocus={e=>(e.target.style.borderColor="#2563EB")} onBlur={e=>(e.target.style.borderColor="#E5E7EB")} />
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:"#374151", display:"block", marginBottom:5 }}>{l.fields.email}</label>
                <input type="email" value={form.email} onChange={e=>set("email",e.target.value)} style={inputStyle} placeholder="ahmet@sirket.com"
                  onFocus={e=>(e.target.style.borderColor="#2563EB")} onBlur={e=>(e.target.style.borderColor="#E5E7EB")} />
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:"#374151", display:"block", marginBottom:5 }}>{l.fields.password}</label>
                <input type="password" value={form.password} onChange={e=>set("password",e.target.value)} style={inputStyle} placeholder="••••••••"
                  onFocus={e=>(e.target.style.borderColor="#2563EB")} onBlur={e=>(e.target.style.borderColor="#E5E7EB")} />
              </div>
            </div>
          )}

          {/* Step 1 — Company */}
          {step===1 && (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <h2 style={{ fontSize:22, fontWeight:800, color:"#0A0A0A", margin:0 }}>{l.steps[1]}</h2>
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:"#374151", display:"block", marginBottom:5 }}>{l.fields.company}</label>
                <input value={form.company} onChange={e=>set("company",e.target.value)} style={inputStyle} placeholder="Şirket A.Ş."
                  onFocus={e=>(e.target.style.borderColor="#2563EB")} onBlur={e=>(e.target.style.borderColor="#E5E7EB")} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:"#374151", display:"block", marginBottom:5 }}>{l.fields.sector}</label>
                  <select value={form.sector} onChange={e=>set("sector",e.target.value)}
                    style={{ ...inputStyle, cursor:"pointer" }}>
                    <option value="">—</option>
                    {l.sectors.map(s=>(<option key={s}>{s}</option>))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:"#374151", display:"block", marginBottom:5 }}>{l.fields.size}</label>
                  <select value={form.size} onChange={e=>set("size",e.target.value)}
                    style={{ ...inputStyle, cursor:"pointer" }}>
                    <option value="">—</option>
                    {l.sizes.map(s=>(<option key={s}>{s}</option>))}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:"#374151", display:"block", marginBottom:5 }}>{l.fields.city}</label>
                <input value={form.city} onChange={e=>set("city",e.target.value)} style={inputStyle} placeholder="İstanbul"
                  onFocus={e=>(e.target.style.borderColor="#2563EB")} onBlur={e=>(e.target.style.borderColor="#E5E7EB")} />
              </div>
            </div>
          )}

          {/* Step 2 — Plan */}
          {step===2 && (
            <div>
              <h2 style={{ fontSize:22, fontWeight:800, color:"#0A0A0A", margin:"0 0 16px" }}>{l.steps[2]}</h2>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {l.plans.map((plan,i)=>(
                  <div key={i} onClick={()=>setSelPlan(i)} style={{
                    border: `2px solid ${selPlan===i?"#2563EB":"#E5E7EB"}`,
                    borderRadius:12, padding:"14px 16px", cursor:"pointer",
                    background: selPlan===i?"#EFF6FF":"#fff",
                    transition:"all .15s", position:"relative",
                  }}>
                    {i===1 && (
                      <span style={{ position:"absolute", top:-10, left:"50%", transform:"translateX(-50%)", background:"#2563EB", color:"#fff", fontSize:10, fontWeight:700, padding:"2px 10px", borderRadius:100, whiteSpace:"nowrap" }}>
                        {l.popular}
                      </span>
                    )}
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                      <div>
                        <span style={{ fontSize:15, fontWeight:800, color:selPlan===i?"#2563EB":"#0A0A0A" }}>{plan}</span>
                        <span style={{ fontSize:12, color:"#6B7280", marginLeft:8 }}>{l.planDescs[i]}</span>
                      </div>
                      <span style={{ fontSize:18, fontWeight:900, color:selPlan===i?"#2563EB":GOLD, fontFamily:"'Nunito Sans',sans-serif" }}>{l.prices[i]}</span>
                    </div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:"4px 12px" }}>
                      {PLAN_FEATS[i].map((f,fi)=>(
                        <span key={fi} style={{ fontSize:11, color:"#374151", display:"flex", alignItems:"center", gap:4 }}>
                          <span style={{ color:"#059669" }}>✓</span> {f}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div style={{ display:"flex", gap:10, marginTop:20 }}>
            {step>0 && (
              <button onClick={()=>setStep(s=>s-1)} style={{ flex:1, padding:"12px", border:"1.5px solid #E5E7EB", borderRadius:9, background:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit", color:"#374151" }}>
                ← {l.prev}
              </button>
            )}
            <button
              onClick={()=>{ if(step<2) setStep(s=>s+1); }}
              style={{ flex:2, padding:"12px", border:"none", borderRadius:9, background:"#2563EB", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit", transition:"background .15s" }}
              onMouseEnter={e=>(e.currentTarget.style.background="#1D4ED8")}
              onMouseLeave={e=>(e.currentTarget.style.background="#2563EB")}
            >
              {step<2 ? `${l.next} →` : `🚀 ${l.finish}`}
            </button>
          </div>

          <p style={{ textAlign:"center", marginTop:14, fontSize:13, color:"#6B7280" }}>
            <Link href={`/${locale}/signin`} style={{ color:"#2563EB", fontWeight:600, textDecoration:"none" }}>
              {l.loginLink}
            </Link>
          </p>
        </div>
      </div>

      <style>{`
        @media(max-width:768px){ .signup-left{ display:none!important } }
      `}</style>
    </div>
  );
}