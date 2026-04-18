// ================================================================
// Zyrix FinSuite — Landing Page
// Turkish market, vivid, animated, with pricing
// ================================================================

import React, { useState, useEffect } from "react";

const P = {
  bg: "#F0F4FF", white: "#FFFFFF", border: "#E2E8F8",
  purple: "#6C3AFF", pink: "#F43F8E", cyan: "#0EA5E9",
  emerald: "#10B981", amber: "#F59E0B", text: "#1E1B4B",
  sub: "#64748B", muted: "#94A3B8", light: "#F8FAFF",
  indigo: "#6366F1", teal: "#14B8A6",
};

function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav style={{
      position:"fixed", top:0, left:0, right:0, zIndex:100,
      background: scrolled ? "rgba(255,255,255,0.95)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? `1px solid ${P.border}` : "none",
      padding:"0 40px", height:64,
      display:"flex", alignItems:"center", justifyContent:"space-between",
      transition:"all 0.3s",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${P.purple},${P.pink})`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 4px 12px ${P.purple}40` }}>
          <span style={{ color:"#fff", fontWeight:900, fontSize:16 }}>Z</span>
        </div>
        <span style={{ color:P.text, fontWeight:800, fontSize:18 }}>Zyrix <span style={{ color:P.purple }}>FinSuite</span></span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:24 }}>
        {["Özellikler","Fiyatlar","Hakkında"].map(item => (
          <a key={item} href={`#${item.toLowerCase()}`} style={{ color:P.sub, fontSize:14, fontWeight:500, textDecoration:"none" }}
            onMouseEnter={e=>e.target.style.color=P.purple}
            onMouseLeave={e=>e.target.style.color=P.sub}>{item}</a>
        ))}
        <a href="/login" style={{ color:P.purple, fontSize:14, fontWeight:700, textDecoration:"none" }}>Giriş Yap</a>
        <a href="/register" style={{
          background:`linear-gradient(135deg,${P.purple},${P.pink})`,
          color:"#fff", borderRadius:10, padding:"9px 20px",
          fontSize:14, fontWeight:700, textDecoration:"none",
          boxShadow:`0 4px 14px ${P.purple}30`,
        }}>Ücretsiz Başla 🚀</a>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section style={{ paddingTop:140, paddingBottom:100, textAlign:"center", position:"relative", overflow:"hidden" }}>
      {/* BG Blobs */}
      <div style={{ position:"absolute", top:-100, left:"50%", transform:"translateX(-50%)", width:600, height:600, borderRadius:"50%", background:`radial-gradient(circle,${P.purple}15 0%,transparent 70%)`, pointerEvents:"none" }}/>
      <div style={{ position:"absolute", top:200, left:100, width:300, height:300, borderRadius:"50%", background:`radial-gradient(circle,${P.pink}12 0%,transparent 70%)`, pointerEvents:"none" }}/>
      <div style={{ position:"absolute", top:100, right:80, width:250, height:250, borderRadius:"50%", background:`radial-gradient(circle,${P.cyan}12 0%,transparent 70%)`, pointerEvents:"none" }}/>

      <div style={{ position:"relative", maxWidth:800, margin:"0 auto", padding:"0 24px" }}>
        {/* Badge */}
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:`${P.purple}12`, border:`1.5px solid ${P.purple}25`, borderRadius:20, padding:"6px 16px", marginBottom:24 }}>
          <span style={{ fontSize:14 }}>🇹🇷</span>
          <span style={{ color:P.purple, fontSize:13, fontWeight:700 }}>Türkiye'ye Özel ERP & CRM Platform</span>
        </div>

        <h1 style={{ color:P.text, fontSize:52, fontWeight:900, lineHeight:1.15, margin:"0 0 20px" }}>
          İşletmenizi{" "}
          <span style={{ background:`linear-gradient(135deg,${P.purple},${P.pink})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            Akıllıca
          </span>{" "}
          Yönetin
        </h1>

        <p style={{ color:P.sub, fontSize:18, lineHeight:1.7, margin:"0 0 40px", maxWidth:600, marginLeft:"auto", marginRight:"auto" }}>
          Fatura, CRM, satış pipeline ve AI destekli analitik — hepsi tek platformda.
          Türk KOBİ'leri için tasarlandı.
        </p>

        <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap", marginBottom:48 }}>
          <a href="/register" style={{
            background:`linear-gradient(135deg,${P.purple},${P.pink})`,
            color:"#fff", borderRadius:14, padding:"14px 32px",
            fontSize:16, fontWeight:700, textDecoration:"none",
            boxShadow:`0 6px 24px ${P.purple}35`,
            display:"inline-flex", alignItems:"center", gap:8,
          }}>
            30 Gün Ücretsiz Dene 🚀
          </a>
          <a href="/login" style={{
            background:P.white, color:P.purple, border:`1.5px solid ${P.purple}30`,
            borderRadius:14, padding:"14px 32px", fontSize:16, fontWeight:700,
            textDecoration:"none", boxShadow:"0 2px 12px rgba(0,0,0,0.06)",
          }}>
            Giriş Yap →
          </a>
        </div>

        {/* Social proof */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, color:P.sub, fontSize:13 }}>
          <div style={{ display:"flex" }}>
            {["🧑‍💼","👩‍💼","🧑‍💻","👨‍💼"].map((e,i)=>(
              <div key={i} style={{ width:28, height:28, borderRadius:"50%", background:`linear-gradient(135deg,${[P.purple,P.pink,P.cyan,P.emerald][i]},${[P.pink,P.amber,P.indigo,P.teal][i]})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, marginLeft:i?-6:0, border:`2px solid ${P.white}` }}>{e}</div>
            ))}
          </div>
          <span><strong style={{ color:P.text }}>500+</strong> işletme Zyrix FinSuite kullanıyor</span>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    { icon:"📄", color:P.purple,  title:"Akıllı Faturalama",    desc:"KDV hesaplama, e-fatura entegrasyonu ve otomatik hatırlatmalar ile tahsilatı kolaylaştırın." },
    { icon:"👥", color:P.cyan,    title:"CRM & Müşteri Yönetimi", desc:"Müşteri sadakat puanları, takip notları ve satış geçmişi ile ilişkileri güçlendirin." },
    { icon:"🤝", color:P.emerald, title:"Satış Pipeline",         desc:"Deal takibi, aşama yönetimi ve olasılık analizi ile satışlarınızı artırın." },
    { icon:"🤖", color:P.pink,    title:"AI İş Analitiği",        desc:"Yapay zeka destekli öneriler ile işletmenizin büyüme fırsatlarını keşfedin." },
    { icon:"📊", color:P.amber,   title:"Gelir & Gider Takibi",  desc:"Nakit akışı analizi, gider kategorileri ve kar/zarar raporları." },
    { icon:"👨‍👩‍👧", color:P.indigo, title:"Ekip Yönetimi",         desc:"Çalışan rolleri, yetki yönetimi ve görev atamaları ile ekibinizi koordine edin." },
  ];

  return (
    <section id="özellikler" style={{ padding:"80px 40px", maxWidth:1200, margin:"0 auto" }}>
      <div style={{ textAlign:"center", marginBottom:56 }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:`${P.emerald}12`, border:`1.5px solid ${P.emerald}25`, borderRadius:20, padding:"6px 16px", marginBottom:16 }}>
          <span style={{ color:P.emerald, fontSize:13, fontWeight:700 }}>✨ Tüm Özellikler</span>
        </div>
        <h2 style={{ color:P.text, fontSize:36, fontWeight:800, margin:"0 0 12px" }}>İşletmenizin İhtiyacı Olan Her Şey</h2>
        <p style={{ color:P.sub, fontSize:16, maxWidth:500, margin:"0 auto" }}>Tek platformda tüm iş süreçlerinizi dijitalleştirin</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24 }}>
        {features.map((f,i) => (
          <div key={i} style={{
            background:P.white, borderRadius:20, padding:28,
            border:`1.5px solid ${f.color}15`,
            boxShadow:`0 4px 24px ${f.color}08, 0 1px 4px rgba(0,0,0,0.04)`,
            transition:"transform 0.2s, box-shadow 0.2s",
          }}
            onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow=`0 12px 36px ${f.color}18`; }}
            onMouseLeave={e=>{ e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=`0 4px 24px ${f.color}08, 0 1px 4px rgba(0,0,0,0.04)`; }}>
            {/* Top bar */}
            <div style={{ height:4, background:`linear-gradient(90deg,${f.color},${f.color}50)`, borderRadius:4, marginBottom:20 }}/>
            <div style={{ background:`${f.color}15`, borderRadius:14, width:48, height:48, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, marginBottom:16 }}>{f.icon}</div>
            <h3 style={{ color:P.text, fontSize:16, fontWeight:700, margin:"0 0 8px" }}>{f.title}</h3>
            <p style={{ color:P.sub, fontSize:14, lineHeight:1.6, margin:0 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    {
      name:"Starter", price:"₺499", period:"/ay",
      color:P.cyan, popular:false,
      features:["500 fatura/ay","1.000 müşteri","Temel CRM","E-posta desteği","Mobil uygulama"],
    },
    {
      name:"Business", price:"₺999", period:"/ay",
      color:P.purple, popular:true,
      features:["Sınırsız fatura","10.000 müşteri","Gelişmiş CRM","AI analitiği","Öncelikli destek","Ekip yönetimi (5 üye)"],
    },
    {
      name:"Pro", price:"₺1.999", period:"/ay",
      color:P.pink, popular:false,
      features:["Sınırsız her şey","Sınırsız müşteri","Tam AI suite","7/24 öncelikli destek","Sınırsız ekip üyesi","API erişimi","Özel entegrasyonlar"],
    },
  ];

  return (
    <section id="fiyatlar" style={{ padding:"80px 40px", background:`linear-gradient(180deg,${P.bg} 0%,${P.white} 100%)` }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:56 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:`${P.amber}12`, border:`1.5px solid ${P.amber}25`, borderRadius:20, padding:"6px 16px", marginBottom:16 }}>
            <span style={{ color:P.amber, fontSize:13, fontWeight:700 }}>💰 Fiyatlandırma</span>
          </div>
          <h2 style={{ color:P.text, fontSize:36, fontWeight:800, margin:"0 0 12px" }}>Şeffaf & Adil Fiyatlar</h2>
          <p style={{ color:P.sub, fontSize:16 }}>30 gün ücretsiz deneyin. Kredi kartı gerekmez.</p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24 }}>
          {plans.map((plan,i) => (
            <div key={i} style={{
              background:plan.popular ? `linear-gradient(135deg,${P.purple},${P.pink})` : P.white,
              borderRadius:24, padding:32,
              border:`1.5px solid ${plan.popular ? "transparent" : plan.color+"20"}`,
              boxShadow:plan.popular ? `0 12px 48px ${P.purple}30` : `0 4px 20px rgba(0,0,0,0.06)`,
              position:"relative", transform:plan.popular ? "scale(1.04)" : "none",
            }}>
              {plan.popular && (
                <div style={{ position:"absolute", top:-14, left:"50%", transform:"translateX(-50%)", background:`linear-gradient(90deg,${P.amber},${P.orange})`, color:"#fff", borderRadius:20, padding:"5px 16px", fontSize:12, fontWeight:700, whiteSpace:"nowrap" }}>
                  ⭐ En Popüler
                </div>
              )}
              <h3 style={{ color:plan.popular?"#fff":P.text, fontSize:20, fontWeight:800, margin:"0 0 8px" }}>{plan.name}</h3>
              <div style={{ display:"flex", alignItems:"baseline", gap:4, marginBottom:24 }}>
                <span style={{ color:plan.popular?"#fff":plan.color, fontSize:36, fontWeight:900 }}>{plan.price}</span>
                <span style={{ color:plan.popular?"rgba(255,255,255,0.7)":P.muted, fontSize:14 }}>{plan.period}</span>
              </div>

              {plan.features.map((f,j) => (
                <div key={j} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                  <div style={{ width:20, height:20, borderRadius:"50%", background:plan.popular?"rgba(255,255,255,0.25)":`${plan.color}15`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <span style={{ color:plan.popular?"#fff":plan.color, fontSize:11, fontWeight:700 }}>✓</span>
                  </div>
                  <span style={{ color:plan.popular?"rgba(255,255,255,0.9)":P.sub, fontSize:14 }}>{f}</span>
                </div>
              ))}

              <a href="/register" style={{
                display:"block", marginTop:24, textAlign:"center",
                background:plan.popular?"rgba(255,255,255,0.2)":plan.color,
                color:"#fff", borderRadius:12, padding:"12px 0",
                fontSize:15, fontWeight:700, textDecoration:"none",
                border:plan.popular?"2px solid rgba(255,255,255,0.3)":"none",
                boxShadow:plan.popular?"none":`0 4px 14px ${plan.color}30`,
              }}>
                Ücretsiz Başla
              </a>
            </div>
          ))}
        </div>

        {/* Grace period notice */}
        <div style={{ marginTop:32, background:`${P.emerald}08`, border:`1.5px solid ${P.emerald}20`, borderRadius:14, padding:"16px 24px", display:"flex", alignItems:"center", gap:14, maxWidth:700, margin:"32px auto 0" }}>
          <span style={{ fontSize:24 }}>🛡️</span>
          <div>
            <div style={{ color:P.text, fontSize:14, fontWeight:700, marginBottom:4 }}>Verileriniz Daima Güvende</div>
            <div style={{ color:P.sub, fontSize:13, lineHeight:1.5 }}>
              Abonelik bittikten sonra 10 günlük ödeme süresi verilir. Ödeme yapılmazsa hesap askıya alınır — ancak verileriniz silinmez. İstediğiniz zaman geri dönüp kaldığınız yerden devam edebilirsiniz.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ background:P.text, padding:"40px 40px 24px" }}>
      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24, paddingBottom:24, borderBottom:`1px solid rgba(255,255,255,0.1)` }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg,${P.purple},${P.pink})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ color:"#fff", fontWeight:900, fontSize:16 }}>Z</span>
            </div>
            <span style={{ color:"#fff", fontWeight:800, fontSize:16 }}>Zyrix FinSuite</span>
          </div>
          <div style={{ display:"flex", gap:24 }}>
            {["Gizlilik","Kullanım Şartları","Destek"].map(item => (
              <a key={item} href="#" style={{ color:"rgba(255,255,255,0.5)", fontSize:13, textDecoration:"none" }}>{item}</a>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ color:"rgba(255,255,255,0.4)", fontSize:13 }}>© 2026 Zyrix FinSuite. Tüm hakları saklıdır.</div>
          <div style={{ color:"rgba(255,255,255,0.4)", fontSize:13 }}>🇹🇷 Türkiye'de yapıldı</div>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <>
      <style>{`*{box-sizing:border-box}body{margin:0;background:${P.bg}}a{transition:all 0.15s}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:${P.bg}}::-webkit-scrollbar-thumb{background:${P.border};border-radius:3px}`}</style>
      <div style={{ fontFamily:"'DM Sans','Segoe UI',system-ui,sans-serif" }}>
        <NavBar />
        <Hero />
        <Features />
        <Pricing />
        <Footer />
      </div>
    </>
  );
}