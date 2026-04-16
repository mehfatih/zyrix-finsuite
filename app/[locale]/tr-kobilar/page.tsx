"use client";

import { useLocale } from "next-intl";
import Link from "next/link";
import { useState } from "react";

/* ─────────────────────────────────────────────
   Meta Ads Landing Page — Turkey SMEs
   URL: /tr/tr-kobilar
   Target: Turkish SME owners via Meta Ads
───────────────────────────────────────────── */

const GOLD = "#B8892A";

const L = {
  tr: {
    badge:     "🇹🇷 Türk KOBİ'leri için özel",
    headline:  "Excel'e Veda Edin —",
    headline2: "İşletmenizi Otomatikleştirin",
    sub:       "e-Fatura, KDV, CRM ve Yapay Zeka CFO — tek platformda. 14 gün ücretsiz deneyin.",
    cta1:      "14 Gün Ücretsiz Başla",
    cta2:      "Demo İzle",
    trust:     ["Kredi kartı gerekmez","10 dakikada kurulum","Türkçe destek","İptal garantisi"],
    painTitle: "Siz de bunlardan bıktınız mı?",
    pains:     [
      "Excel tablolarında saatler harcamak",
      "GİB e-Fatura zorunluluğunu yönetmek",
      "CRM, muhasebe, ödeme için 3 ayrı yazılım",
      "Aylık mali durumu bilmemek",
    ],
    solTitle:  "Zyrix ile bunların hepsi çözülür",
    sols: [
      { icon:"🧾", title:"e-Fatura Otomasyonu",    desc:"GİB onaylı e-Fatura tek tıkla. KDV otomatik hesaplanır." },
      { icon:"👥", title:"CRM + Satış Hattı",      desc:"Müşterilerinizi takip edin, satışlarınızı büyütün." },
      { icon:"🤖", title:"Yapay Zeka CFO",          desc:"Her gün finansal öneriler alın, kararlarınızı güçlendirin." },
      { icon:"💳", title:"Online Ödeme Linkleri",   desc:"Anında ödeme linki gönderin, tahsilat sürenizi kısaltın." },
    ],
    socialTitle: "Onlar zaten kullanıyor",
    social: [
      { avatar:"AY", name:"Ahmet Y.", sector:"Tekstil", text:"Aylık raporlama 3 günden 2 saate indi." },
      { avatar:"ZK", name:"Zeynep K.", sector:"Restoran", text:"5 şubemi tek ekranda görüyorum." },
      { avatar:"BT", name:"Burak T.", sector:"E-Ticaret", text:"Shopify ile otomatik faturalama mükemmel." },
    ],
    faqTitle: "Sık sorulan sorular",
    faqs: [
      { q:"e-Fatura entegrasyonu nasıl çalışır?", a:"Zyrix, GİB onaylı Özel Entegratör üzerinden otomatik yönetir. Teknik kurulum gerekmez." },
      { q:"Mevcut verilerimi aktarabilir miyim?", a:"Evet. Excel veya CSV ile mevcut müşteri ve fatura verilerinizi kolayca aktarabilirsiniz." },
      { q:"İptal edebilir miyim?", a:"İstediğiniz zaman, hiçbir ücret ödemeden iptal edebilirsiniz. Verileriniz 30 gün saklanır." },
    ],
    ctaTitle: "Bugün başlayın — yarın fark görün",
    ctaSub:   "14 gün boyunca tüm özellikleri ücretsiz kullanın",
    formPlaceholder: "E-posta adresiniz",
    formCta:  "Ücretsiz Başla",
  },
};

export default function TrKobilarPage() {
  const locale = useLocale();
  const l      = L.tr; // Always Turkish — this is the TR ads landing page
  const [email, setEmail]   = useState("");
  const [faq,   setFaq]     = useState<number|null>(null);

  return (
    <div style={{ minHeight:"100vh", background:"#fff", direction:"ltr" }}>

      {/* ── Sticky top bar ── */}
      <div style={{ background:"#0F172A", padding:"10px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
        <span style={{ fontSize:20, fontWeight:900, color:"#fff", direction:"ltr" }}>
          <span style={{ color:"#2563EB" }}>Z</span>yrix<span style={{ color:"#2563EB" }}>.</span>
          <span style={{ fontSize:12, color:GOLD, marginLeft:6 }}>FinSuite</span>
        </span>
        <Link href="/tr/signup" style={{ background:"#2563EB", color:"#fff", padding:"8px 18px", borderRadius:7, fontSize:13, fontWeight:700, textDecoration:"none" }}>
          {l.cta1} →
        </Link>
      </div>

      {/* ── Hero ── */}
      <section style={{ background:"linear-gradient(160deg,#0F172A 0%,#1E3A8A 100%)", padding:"60px 24px 52px", textAlign:"center" }}>
        <div style={{ maxWidth:680, margin:"0 auto" }}>
          <span style={{ display:"inline-block", background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.2)", color:"#fff", fontSize:13, fontWeight:700, padding:"5px 14px", borderRadius:100, marginBottom:18 }}>
            {l.badge}
          </span>
          <h1 style={{ fontSize:"clamp(28px,5vw,48px)", fontWeight:900, color:"#fff", lineHeight:1.15, marginBottom:8 }}>
            {l.headline}<br />
            <span style={{ color:"#60A5FA" }}>{l.headline2}</span>
          </h1>
          <p style={{ fontSize:17, color:"rgba(255,255,255,.8)", lineHeight:1.7, marginBottom:28 }}>{l.sub}</p>

          {/* Email form */}
          <div style={{ display:"flex", gap:10, maxWidth:440, margin:"0 auto 16px", flexWrap:"wrap" }}>
            <input
              type="email" value={email} onChange={e=>setEmail(e.target.value)}
              placeholder={l.formPlaceholder}
              style={{ flex:1, padding:"13px 16px", border:"none", borderRadius:9, fontSize:15, outline:"none", fontFamily:"inherit", minWidth:200 }}
            />
            <Link href="/tr/signup" style={{ background:"#2563EB", color:"#fff", padding:"13px 22px", borderRadius:9, fontSize:15, fontWeight:800, textDecoration:"none", whiteSpace:"nowrap", boxShadow:"0 4px 16px rgba(37,99,235,.4)" }}>
              {l.formCta}
            </Link>
          </div>

          {/* Trust badges */}
          <div style={{ display:"flex", justifyContent:"center", gap:18, flexWrap:"wrap" }}>
            {l.trust.map(t=>(
              <span key={t} style={{ fontSize:12, color:"rgba(255,255,255,.7)", display:"flex", alignItems:"center", gap:5 }}>
                <span style={{ color:"#4ADE80" }}>✓</span> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pain points ── */}
      <section style={{ padding:"48px 24px", background:"#FFF1F2" }}>
        <div style={{ maxWidth:800, margin:"0 auto", textAlign:"center" }}>
          <h2 style={{ fontSize:"clamp(20px,3vw,28px)", fontWeight:900, color:"#9F1239", marginBottom:24 }}>{l.painTitle}</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12, textAlign:"left" }} className="pain-grid">
            {l.pains.map(p=>(
              <div key={p} style={{ background:"#fff", border:"1.5px solid #FECDD3", borderRadius:10, padding:"12px 14px", display:"flex", gap:8, alignItems:"center" }}>
                <span style={{ color:"#DC2626", fontWeight:700, fontSize:16 }}>✗</span>
                <span style={{ fontSize:14, color:"#0A0A0A", fontWeight:500 }}>{p}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Solutions ── */}
      <section style={{ padding:"48px 24px", background:"#fff" }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <h2 style={{ fontSize:"clamp(20px,3vw,28px)", fontWeight:900, color:GOLD, textAlign:"center", marginBottom:28 }}>{l.solTitle}</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:16 }} className="sol-grid">
            {l.sols.map((s,i)=>(
              <div key={i} style={{ background:"#F8FAFC", border:"1.5px solid #E5E7EB", borderRadius:14, padding:"20px 22px", display:"flex", gap:14 }}>
                <span style={{ fontSize:28, flexShrink:0 }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize:15, fontWeight:800, color:"#0A0A0A", marginBottom:5 }}>{s.title}</div>
                  <div style={{ fontSize:13, color:"#374151", lineHeight:1.65 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social proof ── */}
      <section style={{ padding:"48px 24px", background:"#F8FAFC" }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <h2 style={{ fontSize:"clamp(20px,3vw,26px)", fontWeight:900, color:GOLD, textAlign:"center", marginBottom:24 }}>{l.socialTitle}</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }} className="soc-grid">
            {l.social.map((s,i)=>(
              <div key={i} style={{ background:"#fff", border:"1px solid #FDE68A", borderRadius:14, padding:18 }}>
                <div style={{ display:"flex", gap:3, marginBottom:10 }}>
                  {[1,2,3,4,5].map(x=>(<svg key={x} width="16" height="16" viewBox="0 0 24 24" fill="#F59E0B"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>))}
                </div>
                <p style={{ fontSize:13, color:"#1A1A1A", lineHeight:1.7, fontStyle:"italic", margin:"0 0 12px" }}>
                  &ldquo;{s.text}&rdquo;
                </p>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:32, height:32, borderRadius:"50%", background:"#DBEAFE", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color:"#1D4ED8" }}>{s.avatar}</div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color:"#0A0A0A" }}>{s.name}</div>
                    <div style={{ fontSize:11, color:"#6B7280" }}>{s.sector}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding:"48px 24px", background:"#fff" }}>
        <div style={{ maxWidth:680, margin:"0 auto" }}>
          <h2 style={{ fontSize:"clamp(20px,3vw,26px)", fontWeight:900, color:GOLD, textAlign:"center", marginBottom:20 }}>{l.faqTitle}</h2>
          {l.faqs.map((f,i)=>(
            <div key={i} style={{ border:`1px solid ${faq===i?"#2563EB":"#E5E7EB"}`, borderRadius:10, marginBottom:8, overflow:"hidden", transition:"border-color .2s" }}>
              <button onClick={()=>setFaq(faq===i?null:i)} style={{ width:"100%", padding:"14px 18px", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:14, fontWeight:700, color:"#0A0A0A", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                {f.q}
                <span style={{ fontSize:16, color: faq===i?"#2563EB":"#9CA3AF", transform: faq===i?"rotate(180deg)":"none", transition:"transform .2s", display:"inline-block" }}>▾</span>
              </button>
              {faq===i && (
                <div style={{ padding:"0 18px 14px", fontSize:13, color:"#374151", lineHeight:1.7 }}>{f.a}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ background:"#2563EB", padding:"52px 24px", textAlign:"center" }}>
        <div style={{ maxWidth:520, margin:"0 auto" }}>
          <h2 style={{ fontSize:"clamp(22px,3vw,32px)", fontWeight:900, color:"#fff", marginBottom:10 }}>{l.ctaTitle}</h2>
          <p style={{ fontSize:15, color:"rgba(255,255,255,.82)", marginBottom:24 }}>{l.ctaSub}</p>
          <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
            <Link href="/tr/signup" style={{ background:"#fff", color:"#2563EB", padding:"14px 32px", borderRadius:9, fontSize:15, fontWeight:800, textDecoration:"none", boxShadow:"0 4px 16px rgba(0,0,0,.15)" }}>
              {l.cta1}
            </Link>
            <Link href="/tr/demo" style={{ background:"transparent", color:"#fff", padding:"14px 24px", borderRadius:9, fontSize:15, fontWeight:700, textDecoration:"none", border:"2px solid rgba(255,255,255,.4)" }}>
              {l.cta2}
            </Link>
          </div>
          <p style={{ fontSize:12, color:"rgba(255,255,255,.6)", marginTop:14 }}>
            {l.trust.join("  ·  ")}
          </p>
        </div>
      </section>

      <style>{`
        @media(max-width:640px){.pain-grid{grid-template-columns:1fr!important}.sol-grid{grid-template-columns:1fr!important}.soc-grid{grid-template-columns:1fr!important}}
      `}</style>
    </div>
  );
}