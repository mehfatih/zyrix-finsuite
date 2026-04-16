"use client";

import { useLocale } from "next-intl";
import Link from "next/link";
import { useState } from "react";

const GOLD = "#B8892A";

const L = {
  tr: {
    title:       "Tekrar Hoş Geldiniz",
    sub:         "Hesabınıza giriş yapın",
    email:       "E-posta",
    password:    "Şifre",
    remember:    "Beni hatırla",
    forgot:      "Şifremi unuttum",
    cta:         "Giriş Yap",
    or:          "veya",
    google:      "Google ile devam et",
    noAccount:   "Hesabınız yok mu?",
    signup:      "14 gün ücretsiz başlayın",
    demo:        "Demo'yu deneyin",
    features:    ["e-Fatura otomasyonu","AI CFO danışmanı","CRM + Satış hattı","KDV uyumluluğu"],
    quote:       "Zyrix ile muhasebeye harcadığım zaman %80 azaldı.",
    quoteAuthor: "Ahmet Y. — Yılmaz Tekstil",
    error:       "E-posta veya şifre hatalı.",
  },
  en: {
    title:       "Welcome Back",
    sub:         "Sign in to your account",
    email:       "Email",
    password:    "Password",
    remember:    "Remember me",
    forgot:      "Forgot password",
    cta:         "Sign In",
    or:          "or",
    google:      "Continue with Google",
    noAccount:   "Don't have an account?",
    signup:      "Start free for 14 days",
    demo:        "Try the demo",
    features:    ["e-Invoice automation","AI CFO advisor","CRM + Sales pipeline","VAT compliance"],
    quote:       "Time I spend on accounting decreased 80% with Zyrix.",
    quoteAuthor: "Ahmet Y. — Yılmaz Tekstil",
    error:       "Incorrect email or password.",
  },
  ar: {
    title:       "مرحباً بعودتك",
    sub:         "سجّل الدخول إلى حسابك",
    email:       "البريد الإلكتروني",
    password:    "كلمة المرور",
    remember:    "تذكّرني",
    forgot:      "نسيت كلمة المرور",
    cta:         "تسجيل الدخول",
    or:          "أو",
    google:      "المتابعة عبر Google",
    noAccount:   "ليس لديك حساب؟",
    signup:      "ابدأ مجاناً 14 يوماً",
    demo:        "جرّب الديمو",
    features:    ["أتمتة e-Fatura","مستشار AI CFO","CRM + خط مبيعات","توافق KDV"],
    quote:       "الوقت الذي أقضيه في المحاسبة انخفض 80٪ مع Zyrix.",
    quoteAuthor: "أحمد ي. — Yılmaz Tekstil",
    error:       "بريد إلكتروني أو كلمة مرور غير صحيحة.",
  },
};

export default function SignInPage() {
  const locale = useLocale();
  const l      = L[locale as keyof typeof L] ?? L.tr;
  const isRTL  = locale === "ar";

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) return;
    setLoading(true);
    /* TODO: connect to real auth — replace with API call */
    await new Promise(r => setTimeout(r, 1200));
    if (email === "demo@zyrix.co" && password === "demo1234") {
      window.location.href = `/${locale}/dashboard`;
    } else {
      setError(l.error);
    }
    setLoading(false);
  }

  const inp: React.CSSProperties = {
    width: "100%", padding: "11px 14px", border: "1.5px solid #E5E7EB",
    borderRadius: 9, fontSize: 14, outline: "none", fontFamily: "inherit",
    color: "#0A0A0A", background: "#fff", boxSizing: "border-box",
    transition: "border-color .15s",
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", direction: isRTL?"rtl":"ltr" }}>

      {/* ── Left panel ── */}
      <div style={{ width:380, background:"#0F172A", padding:"40px 32px", display:"flex", flexDirection:"column", gap:24, flexShrink:0 }} className="signin-left">
        <Link href={`/${locale}`} style={{ textDecoration:"none" }}>
          <span style={{ fontSize:22, fontWeight:900, color:"#fff", direction:"ltr", display:"inline-block" }}>
            <span style={{ color:"#2563EB" }}>Z</span>yrix<span style={{ color:"#2563EB" }}>.</span>
            <span style={{ fontSize:13, color:GOLD, marginLeft:6 }}>FinSuite</span>
          </span>
        </Link>

        <div>
          <h2 style={{ fontSize:22, fontWeight:800, color:"#fff", marginBottom:6 }}>{l.title}</h2>
          <p style={{ fontSize:13, color:"rgba(255,255,255,.55)", lineHeight:1.65 }}>{l.sub}</p>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {l.features.map((f,i) => (
            <div key={i} style={{ display:"flex", gap:10, alignItems:"center" }}>
              <div style={{ width:22, height:22, borderRadius:"50%", background:"rgba(37,99,235,.2)", border:"1px solid rgba(37,99,235,.4)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:"#60A5FA", fontWeight:700, flexShrink:0 }}>✓</div>
              <span style={{ fontSize:13, color:"rgba(255,255,255,.75)" }}>{f}</span>
            </div>
          ))}
        </div>

        {/* Demo hint */}
        <div style={{ background:"rgba(37,99,235,.1)", border:"1px solid rgba(37,99,235,.2)", borderRadius:10, padding:"12px 14px" }}>
          <div style={{ fontSize:11, color:"#93C5FD", fontWeight:700, marginBottom:4, textTransform:"uppercase", letterSpacing:".5px" }}>Demo</div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,.6)", lineHeight:1.6 }}>
            demo@zyrix.co / demo1234
          </div>
        </div>

        {/* Quote */}
        <div style={{ marginTop:"auto", background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.08)", borderRadius:12, padding:"14px 16px" }}>
          <div style={{ display:"flex", gap:2, marginBottom:8 }}>
            {[1,2,3,4,5].map(s => <span key={s} style={{ color:"#F59E0B", fontSize:14 }}>★</span>)}
          </div>
          <p style={{ fontSize:12, color:"rgba(255,255,255,.7)", lineHeight:1.65, fontStyle:"italic", margin:"0 0 10px" }}>
            &ldquo;{l.quote}&rdquo;
          </p>
          <div style={{ fontSize:12, fontWeight:700, color:"rgba(255,255,255,.5)" }}>{l.quoteAuthor}</div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 24px", background:"#F8FAFC" }}>
        <div style={{ width:"100%", maxWidth:420 }}>

          <h1 style={{ fontSize:26, fontWeight:900, color:GOLD, marginBottom:6 }}>{l.title}</h1>
          <p style={{ fontSize:14, color:"#6B7280", marginBottom:28 }}>{l.sub}</p>

          {/* Google SSO */}
          <button style={{ width:"100%", padding:"11px 14px", border:"1.5px solid #E5E7EB", borderRadius:9, background:"#fff", fontSize:14, fontWeight:600, color:"#374151", cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:20, transition:"all .15s" }}
            onMouseEnter={e=>(e.currentTarget.style.background="#F9FAFB")}
            onMouseLeave={e=>(e.currentTarget.style.background="#fff")}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {l.google}
          </button>

          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
            <div style={{ flex:1, height:1, background:"#E5E7EB" }} />
            <span style={{ fontSize:12, color:"#9CA3AF", fontWeight:600 }}>{l.or}</span>
            <div style={{ flex:1, height:1, background:"#E5E7EB" }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {error && (
              <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:8, padding:"10px 14px", fontSize:13, color:"#DC2626", fontWeight:600 }}>
                ⚠ {error}
              </div>
            )}

            <div>
              <label style={{ fontSize:12, fontWeight:700, color:"#374151", display:"block", marginBottom:5 }}>{l.email}</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
                style={inp} placeholder="ahmet@sirket.com"
                onFocus={e=>(e.target.style.borderColor="#2563EB")}
                onBlur={e=>(e.target.style.borderColor="#E5E7EB")} />
            </div>

            <div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                <label style={{ fontSize:12, fontWeight:700, color:"#374151" }}>{l.password}</label>
                <a href={`/${locale}/forgot-password`} style={{ fontSize:12, color:"#2563EB", textDecoration:"none", fontWeight:600 }}>{l.forgot}</a>
              </div>
              <div style={{ position:"relative" }}>
                <input type={showPass?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} required
                  style={{ ...inp, paddingRight:42 }} placeholder="••••••••"
                  onFocus={e=>(e.target.style.borderColor="#2563EB")}
                  onBlur={e=>(e.target.style.borderColor="#E5E7EB")} />
                <button type="button" onClick={()=>setShowPass(!showPass)}
                  style={{ position:"absolute", top:"50%", right:12, transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#9CA3AF", fontSize:14, padding:0, lineHeight:1 }}>
                  {showPass?"🙈":"👁"}
                </button>
              </div>
            </div>

            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <input type="checkbox" id="remember" checked={remember} onChange={e=>setRemember(e.target.checked)}
                style={{ width:16, height:16, cursor:"pointer", accentColor:"#2563EB" }} />
              <label htmlFor="remember" style={{ fontSize:13, color:"#374151", cursor:"pointer" }}>{l.remember}</label>
            </div>

            <button type="submit" disabled={loading} style={{ width:"100%", padding:"13px", border:"none", borderRadius:9, background: loading?"#93C5FD":"#2563EB", color:"#fff", fontSize:15, fontWeight:700, cursor: loading?"wait":"pointer", fontFamily:"inherit", transition:"background .15s", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              {loading ? (
                <><span style={{ width:16, height:16, border:"2px solid rgba(255,255,255,.3)", borderTop:"2px solid #fff", borderRadius:"50%", animation:"spin .7s linear infinite", display:"inline-block" }} />{l.cta}...</>
              ) : l.cta}
            </button>
          </form>

          <p style={{ textAlign:"center", marginTop:20, fontSize:13, color:"#6B7280" }}>
            {l.noAccount}{" "}
            <Link href={`/${locale}/signup`} style={{ color:"#2563EB", fontWeight:700, textDecoration:"none" }}>{l.signup}</Link>
          </p>

          <p style={{ textAlign:"center", marginTop:8, fontSize:13 }}>
            <Link href={`/${locale}/demo`} style={{ color:"#6B7280", textDecoration:"none" }}>{l.demo} →</Link>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:768px){.signin-left{display:none!important}}
      `}</style>
    </div>
  );
}