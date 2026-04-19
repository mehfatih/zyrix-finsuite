import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const P = {
  bg: "#F0F4FF", card: "#FFFFFF", border: "#E2E8F8",
  purple: "#6C3AFF", pink: "#F43F8E", text: "#1E1B4B",
  sub: "#64748B", muted: "#94A3B8", light: "#F8FAFF",
  emerald: "#10B981", rose: "#F43F5E", amber: "#F59E0B",
};

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [warning, setWarning]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState("");

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !password) { setError("Please enter email and password"); return; }
    setError(""); setWarning(""); setLoading(true);
    try {
      const user = await login(email, password);
      // Check for trial warning from response (handled in AuthContext)
      const role = user?.role?.toUpperCase();
      const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
      window.location.href = isAdmin ? "/admin" : "/dashboard";
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`*{box-sizing:border-box}body{margin:0;background:${P.bg}}input::placeholder{color:${P.muted}}`}</style>
      <div style={{ minHeight:"100vh", background:P.bg, display:"flex", fontFamily:"'DM Sans','Segoe UI',system-ui,sans-serif" }}>

        {/* Left — Branding */}
        <div style={{ width:"40%", background:`linear-gradient(135deg,${P.purple} 0%,${P.pink} 100%)`, display:"flex", flexDirection:"column", justifyContent:"center", padding:"60px 48px", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:-60, right:-60, width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,0.08)" }}/>
          <div style={{ position:"absolute", bottom:-40, left:-40, width:160, height:160, borderRadius:"50%", background:"rgba(255,255,255,0.06)" }}/>
          <div style={{ position:"relative" }}>
            <a href="/" style={{ textDecoration:"none" }}>
              <div style={{ width:52, height:52, borderRadius:14, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:24, cursor:"pointer" }}>
                <span style={{ color:"#fff", fontWeight:900, fontSize:24 }}>Z</span>
              </div>
            </a>
            <h1 style={{ color:"#fff", fontSize:32, fontWeight:900, margin:"0 0 12px" }}>Zyrix FinSuite</h1>
            <p style={{ color:"rgba(255,255,255,0.8)", fontSize:15, lineHeight:1.6, margin:"0 0 36px" }}>
              İşletmenizi akıllıca yönetin. Türkiye'nin en hızlı büyüyen ERP & CRM platformu.
            </p>
            {[
              { icon:"📄", text:"Akıllı faturalama" },
              { icon:"👥", text:"CRM & müşteri takibi" },
              { icon:"🤖", text:"AI destekli analizler" },
              { icon:"🔒", text:"Verileriniz güvende" },
            ].map(f => (
              <div key={f.text} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{f.icon}</div>
                <span style={{ color:"rgba(255,255,255,0.9)", fontSize:14 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Form */}
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 60px" }}>
          <div style={{ width:"100%", maxWidth:420 }}>
            <div style={{ marginBottom:32 }}>
              <h2 style={{ color:P.text, fontSize:26, fontWeight:800, margin:"0 0 6px" }}>Hoş Geldiniz 👋</h2>
              <p style={{ color:P.sub, fontSize:14, margin:0 }}>Hesabınıza giriş yapın</p>
            </div>

            <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div>
                <label style={{ color:P.sub, fontSize:12, display:"block", marginBottom:5, fontWeight:600 }}>E-posta</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="ornek@sirket.com" autoFocus
                  onFocus={()=>setFocused("email")} onBlur={()=>setFocused("")}
                  style={{ width:"100%", background:P.light, border:`1.5px solid ${focused==="email"?P.purple:P.border}`, color:P.text, borderRadius:10, padding:"11px 14px", fontSize:14, outline:"none", transition:"border-color 0.15s" }} />
              </div>

              <div>
                <label style={{ color:P.sub, fontSize:12, display:"block", marginBottom:5, fontWeight:600 }}>Şifre</label>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"
                  onFocus={()=>setFocused("pass")} onBlur={()=>setFocused("")}
                  style={{ width:"100%", background:P.light, border:`1.5px solid ${focused==="pass"?P.purple:P.border}`, color:P.text, borderRadius:10, padding:"11px 14px", fontSize:14, outline:"none", transition:"border-color 0.15s" }} />
              </div>

              {error && (
                <div style={{ background:`${P.rose}10`, border:`1.5px solid ${P.rose}25`, borderRadius:10, padding:"11px 14px", color:P.rose, fontSize:13, fontWeight:600 }}>
                  ⚠ {error}
                </div>
              )}

              {warning && (
                <div style={{ background:`${P.amber}10`, border:`1.5px solid ${P.amber}25`, borderRadius:10, padding:"11px 14px", color:P.amber, fontSize:13, fontWeight:600 }}>
                  ⚡ {warning}
                </div>
              )}

              <button type="submit" disabled={loading} style={{
                background: loading ? P.muted : `linear-gradient(135deg,${P.purple},${P.pink})`,
                border:"none", color:"#fff", borderRadius:12, padding:"13px 0",
                fontSize:15, fontWeight:700, cursor:loading?"not-allowed":"pointer",
                boxShadow:`0 4px 20px ${P.purple}30`, transition:"all 0.2s",
              }}>
                {loading ? "Giriş yapılıyor..." : "Giriş Yap →"}
              </button>
            </form>

            <div style={{ textAlign:"center", marginTop:20, color:P.sub, fontSize:13 }}>
              Hesabınız yok mu?{" "}
              <a href="/register" style={{ color:P.purple, fontWeight:700, textDecoration:"none" }}>
                30 Gün Ücretsiz Deneyin 🚀
              </a>
            </div>

            <div style={{ textAlign:"center", marginTop:12 }}>
              <a href="#" style={{ color:P.muted, fontSize:12, textDecoration:"none" }}>Şifremi unuttum</a>
            </div>

            <div style={{ textAlign:"center", marginTop:16 }}>
              <a href="/login/otp" style={{ color:P.purple, fontWeight:700, fontSize:13, textDecoration:"none", background:`${P.purple}10`, border:`1px solid ${P.purple}20`, borderRadius:20, padding:"8px 22px", display:"inline-block" }}>
                🔐 Şifresiz Giriş — OTP ile
              </a>
            </div>
            <div style={{ marginTop:20, paddingTop:20, borderTop:`1px solid ${P.border}`, textAlign:"center", color:P.muted, fontSize:11 }}>
              Zyrix FinSuite © 2026 — 🇹🇷 Türkiye'de yapıldı
            </div>
          </div>
        </div>
      </div>
    </>
  );
}