import React, { useState, useEffect } from "react";

const P = {
  bg:"#F0F4FF", card:"#FFFFFF", border:"#E2E8F8",
  purple:"#6C3AFF", pink:"#F43F8E", text:"#1E1B4B",
  sub:"#64748B", muted:"#94A3B8", light:"#F8FAFF",
  emerald:"#10B981", rose:"#F43F5E", amber:"#F59E0B", cyan:"#0EA5E9",
};
const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

const PLANS = [
  { id:"STARTER",  name:"Starter",  price:499,  color:P.cyan,   features:["500 fatura/ay","1.000 müşteri","Temel CRM"] },
  { id:"BUSINESS", name:"Business", price:999,  color:P.purple, features:["Sınırsız fatura","10.000 müşteri","AI analitiği"], popular:true },
  { id:"PRO",      name:"Pro",      price:1999, color:P.pink,   features:["Sınırsız her şey","Tam AI suite","API erişimi"] },
];

async function apiFetch(path, opts={}) {
  const token = localStorage.getItem("zyrix_token");
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers:{"Content-Type":"application/json",...(token?{Authorization:`Bearer ${token}`}:{}),...opts.headers},
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Error");
  return data;
}

function formatCard(v) {
  return v.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim();
}

export default function PaymentPage() {
  const [selectedPlan, setSelectedPlan] = useState("BUSINESS");
  const [step, setStep] = useState("plan"); // plan | card | success
  const [card, setCard] = useState({ holder:"", number:"", month:"", year:"", cvc:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const setC = (k,v) => setCard(c=>({...c,[k]:v}));

  const handlePayment = async () => {
    if (!card.holder||!card.number||!card.month||!card.year||!card.cvc) {
      setError("Lütfen tüm kart bilgilerini doldurun"); return;
    }
    setLoading(true); setError("");
    try {
      await apiFetch("/api/payments/initiate", {
        method:"POST",
        body: JSON.stringify({
          plan: selectedPlan,
          cardHolderName: card.holder,
          cardNumber: card.number.replace(/\s/g,""),
          expireMonth: card.month,
          expireYear: card.year,
          cvc: card.cvc,
        }),
      });
      setStep("success");
    } catch(e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const plan = PLANS.find(p=>p.id===selectedPlan);

  return (
    <>
      <style>{`*{box-sizing:border-box}body{margin:0;background:${P.bg}}input::placeholder{color:${P.muted}}`}</style>
      <div style={{ minHeight:"100vh", background:P.bg, fontFamily:"'DM Sans','Segoe UI',system-ui,sans-serif" }}>
        {/* Header */}
        <div style={{ background:P.card, borderBottom:`1.5px solid ${P.border}`, padding:"16px 32px", display:"flex", alignItems:"center", gap:12 }}>
          <a href="/dashboard" style={{ background:P.light, border:`1.5px solid ${P.border}`, color:P.sub, borderRadius:10, padding:"7px 14px", textDecoration:"none", fontSize:13, fontWeight:600 }}>← Geri</a>
          <h1 style={{ color:P.text, fontSize:20, fontWeight:800, margin:0 }}>Abonelik</h1>
        </div>

        <div style={{ maxWidth:860, margin:"32px auto", padding:"0 16px" }}>

          {step==="plan" && (
            <div>
              <div style={{ textAlign:"center", marginBottom:32 }}>
                <h2 style={{ color:P.text, fontSize:24, fontWeight:800, margin:"0 0 8px" }}>Plan Seçin</h2>
                <p style={{ color:P.sub, fontSize:15, margin:0 }}>İstediğiniz zaman plan değiştirebilirsiniz</p>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20, marginBottom:28 }}>
                {PLANS.map(p=>(
                  <div key={p.id} onClick={()=>setSelectedPlan(p.id)} style={{
                    background: selectedPlan===p.id ? `linear-gradient(135deg,${p.color}15,${P.card})` : P.card,
                    border:`2px solid ${selectedPlan===p.id ? p.color : P.border}`,
                    borderRadius:20, padding:24, cursor:"pointer",
                    boxShadow: selectedPlan===p.id ? `0 8px 32px ${p.color}20` : "0 2px 12px rgba(0,0,0,0.04)",
                    position:"relative", transition:"all 0.2s",
                  }}>
                    {p.popular && <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:`linear-gradient(90deg,${P.amber},${P.orange})`, color:"#fff", borderRadius:20, padding:"3px 14px", fontSize:11, fontWeight:700, whiteSpace:"nowrap" }}>⭐ En Popüler</div>}
                    <div style={{ height:4, background:`linear-gradient(90deg,${p.color},${p.color}60)`, borderRadius:4, marginBottom:16 }}/>
                    <div style={{ color:P.text, fontSize:18, fontWeight:800, marginBottom:6 }}>{p.name}</div>
                    <div style={{ display:"flex", alignItems:"baseline", gap:4, marginBottom:16 }}>
                      <span style={{ color:p.color, fontSize:30, fontWeight:900 }}>₺{p.price}</span>
                      <span style={{ color:P.muted, fontSize:13 }}>/ay</span>
                    </div>
                    {p.features.map(f=>(
                      <div key={f} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                        <span style={{ color:p.color, fontSize:14 }}>✓</span>
                        <span style={{ color:P.sub, fontSize:13 }}>{f}</span>
                      </div>
                    ))}
                    {selectedPlan===p.id && (
                      <div style={{ marginTop:16, background:`${p.color}15`, border:`1px solid ${p.color}30`, borderRadius:8, padding:"6px 12px", textAlign:"center", color:p.color, fontSize:12, fontWeight:700 }}>
                        ✓ Seçildi
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ textAlign:"center" }}>
                <button onClick={()=>setStep("card")} style={{ background:`linear-gradient(135deg,${P.purple},${P.pink})`, border:"none", color:"#fff", borderRadius:14, padding:"14px 48px", fontSize:16, fontWeight:700, cursor:"pointer", boxShadow:`0 4px 20px ${P.purple}30` }}>
                  Ödemeye Geç →
                </button>
              </div>
            </div>
          )}

          {step==="card" && (
            <div style={{ maxWidth:460, margin:"0 auto" }}>
              <div style={{ textAlign:"center", marginBottom:28 }}>
                <h2 style={{ color:P.text, fontSize:22, fontWeight:800, margin:"0 0 6px" }}>Kart Bilgileri</h2>
                <p style={{ color:P.sub, fontSize:14, margin:0 }}>
                  {plan?.name} — <strong style={{ color:plan?.color }}>₺{plan?.price}/ay</strong>
                </p>
              </div>

              {/* Card Preview */}
              <div style={{ background:`linear-gradient(135deg,${P.purple},${P.pink})`, borderRadius:18, padding:"24px 28px", marginBottom:24, position:"relative", overflow:"hidden", boxShadow:`0 8px 32px ${P.purple}30` }}>
                <div style={{ position:"absolute", top:-20, right:-20, width:100, height:100, borderRadius:"50%", background:"rgba(255,255,255,0.1)" }}/>
                <div style={{ position:"absolute", bottom:-30, left:-10, width:80, height:80, borderRadius:"50%", background:"rgba(255,255,255,0.07)" }}/>
                <div style={{ color:"rgba(255,255,255,0.7)", fontSize:11, marginBottom:20 }}>Zyrix FinSuite</div>
                <div style={{ color:"#fff", fontSize:20, fontFamily:"monospace", letterSpacing:3, marginBottom:20 }}>
                  {card.number || "**** **** **** ****"}
                </div>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <div>
                    <div style={{ color:"rgba(255,255,255,0.6)", fontSize:10, marginBottom:2 }}>KART SAHİBİ</div>
                    <div style={{ color:"#fff", fontSize:13, fontWeight:600 }}>{card.holder || "Ad Soyad"}</div>
                  </div>
                  <div>
                    <div style={{ color:"rgba(255,255,255,0.6)", fontSize:10, marginBottom:2 }}>SON KULLANIM</div>
                    <div style={{ color:"#fff", fontSize:13, fontWeight:600 }}>{card.month||"MM"}/{card.year||"YY"}</div>
                  </div>
                </div>
              </div>

              <div style={{ background:P.card, borderRadius:20, padding:24, border:`1.5px solid ${P.border}`, display:"flex", flexDirection:"column", gap:14 }}>
                <div>
                  <label style={{ color:P.sub, fontSize:12, fontWeight:600, display:"block", marginBottom:5 }}>Kart Sahibinin Adı</label>
                  <input value={card.holder} onChange={e=>setC("holder",e.target.value.toUpperCase())} placeholder="AD SOYAD"
                    style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, color:P.text, borderRadius:10, padding:"11px 14px", fontSize:14, outline:"none" }} />
                </div>
                <div>
                  <label style={{ color:P.sub, fontSize:12, fontWeight:600, display:"block", marginBottom:5 }}>Kart Numarası</label>
                  <input value={card.number} onChange={e=>setC("number",formatCard(e.target.value))} placeholder="0000 0000 0000 0000" maxLength={19}
                    style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, color:P.text, borderRadius:10, padding:"11px 14px", fontSize:14, outline:"none", fontFamily:"monospace", letterSpacing:2 }} />
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
                  <div>
                    <label style={{ color:P.sub, fontSize:12, fontWeight:600, display:"block", marginBottom:5 }}>Ay</label>
                    <input value={card.month} onChange={e=>setC("month",e.target.value.replace(/\D/g,"").slice(0,2))} placeholder="MM" maxLength={2}
                      style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, color:P.text, borderRadius:10, padding:"11px 14px", fontSize:14, outline:"none", textAlign:"center" }} />
                  </div>
                  <div>
                    <label style={{ color:P.sub, fontSize:12, fontWeight:600, display:"block", marginBottom:5 }}>Yıl</label>
                    <input value={card.year} onChange={e=>setC("year",e.target.value.replace(/\D/g,"").slice(0,2))} placeholder="YY" maxLength={2}
                      style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, color:P.text, borderRadius:10, padding:"11px 14px", fontSize:14, outline:"none", textAlign:"center" }} />
                  </div>
                  <div>
                    <label style={{ color:P.sub, fontSize:12, fontWeight:600, display:"block", marginBottom:5 }}>CVV</label>
                    <input value={card.cvc} onChange={e=>setC("cvc",e.target.value.replace(/\D/g,"").slice(0,3))} placeholder="***" maxLength={3} type="password"
                      style={{ width:"100%", background:P.light, border:`1.5px solid ${P.border}`, color:P.text, borderRadius:10, padding:"11px 14px", fontSize:14, outline:"none", textAlign:"center" }} />
                  </div>
                </div>

                {error && <div style={{ background:`${P.rose}12`, border:`1.5px solid ${P.rose}25`, borderRadius:10, padding:"10px 14px", color:P.rose, fontSize:13, fontWeight:600 }}>⚠ {error}</div>}

                <div style={{ display:"flex", gap:10 }}>
                  <button onClick={()=>setStep("plan")} style={{ background:P.light, border:`1.5px solid ${P.border}`, color:P.sub, borderRadius:10, padding:"12px 18px", cursor:"pointer", fontSize:14 }}>← Geri</button>
                  <button onClick={handlePayment} disabled={loading} style={{ flex:1, background:loading?P.muted:`linear-gradient(135deg,${P.purple},${P.pink})`, border:"none", color:"#fff", borderRadius:10, padding:"12px 0", cursor:loading?"not-allowed":"pointer", fontSize:15, fontWeight:700 }}>
                    {loading ? "İşleniyor..." : `₺${plan?.price} Öde`}
                  </button>
                </div>

                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, color:P.muted, fontSize:11 }}>
                  <span>🔒</span> iyzico güvencesiyle ödeme
                </div>
              </div>
            </div>
          )}

          {step==="success" && (
            <div style={{ textAlign:"center", maxWidth:400, margin:"60px auto" }}>
              <div style={{ fontSize:72, marginBottom:16 }}>🎉</div>
              <h2 style={{ color:P.text, fontSize:26, fontWeight:800, margin:"0 0 12px" }}>Ödeme Başarılı!</h2>
              <p style={{ color:P.sub, fontSize:15, lineHeight:1.7, margin:"0 0 28px" }}>
                <strong>{plan?.name}</strong> planınız aktifleştirildi. İyi çalışmalar!
              </p>
              <a href="/dashboard" style={{ display:"inline-block", background:`linear-gradient(135deg,${P.purple},${P.pink})`, color:"#fff", borderRadius:14, padding:"14px 36px", fontSize:16, fontWeight:700, textDecoration:"none", boxShadow:`0 4px 20px ${P.purple}30` }}>
                Dashboard'a Git →
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}