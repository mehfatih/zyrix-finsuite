"use client";

import { useLocale } from "next-intl";
import { useState } from "react";

const GOLD = "#B8892A";

const L = {
  tr: {
    badge:"İletişim", title:"Nasıl Yardımcı Olabiliriz?", sub:"Sorularınız için bize ulaşın. Türkçe destek ekibimiz 9-18 saatleri arasında hizmetinizdedir.",
    name:"Ad Soyad", email:"E-posta", company:"Şirket", subject:"Konu", message:"Mesajınız", send:"Mesaj Gönder",
    subjects:["Genel Soru","Teknik Destek","Fiyatlandırma","Entegrasyon","Demo Talebi","Diğer"],
    sending:"Gönderiliyor...", sent:"Mesajınız alındı! 24 saat içinde yanıt vereceğiz.", error:"Bir hata oluştu. Lütfen tekrar deneyin.",
    channels:[
      { icon:"💬", t:"WhatsApp", d:"+90 545 221 08 88", sub:"Hızlı yanıt için", href:"https://wa.me/905452210888" },
      { icon:"📧", t:"E-posta", d:"destek@zyrix.co", sub:"24 saat içinde yanıt", href:"mailto:destek@zyrix.co" },
      { icon:"📍", t:"Adres", d:"İstanbul, Türkiye", sub:"Uzaktan destek", href:"#" },
    ],
    faqTitle:"Sık Sorulan Sorular",
    faqs:[
      { q:"Demo nasıl alabilirim?", a:"demo@zyrix.co adresine e-posta gönderin veya WhatsApp'tan yazın. 24 saat içinde dönüş yaparız." },
      { q:"Teknik destek ne zaman açık?", a:"Pazartesi-Cuma 09:00-18:00 arası Türkçe destek mevcuttur. Acil durumlar için WhatsApp." },
      { q:"Entegrasyon desteği alabilir miyim?", a:"Evet. Business ve Pro planlarda ücretsiz onboarding ve entegrasyon desteği dahildir." },
    ],
  },
  en: {
    badge:"Contact", title:"How Can We Help?", sub:"Reach us with your questions. Our Turkish support team is available 9-18.",
    name:"Full Name", email:"Email", company:"Company", subject:"Subject", message:"Your message", send:"Send Message",
    subjects:["General","Technical Support","Pricing","Integration","Demo Request","Other"],
    sending:"Sending...", sent:"Message received! We'll reply within 24 hours.", error:"An error occurred. Please try again.",
    channels:[
      { icon:"💬", t:"WhatsApp", d:"+90 545 221 08 88", sub:"For quick response", href:"https://wa.me/905452210888" },
      { icon:"📧", t:"Email", d:"support@zyrix.co", sub:"Reply within 24h", href:"mailto:support@zyrix.co" },
      { icon:"📍", t:"Location", d:"Istanbul, Turkey", sub:"Remote support", href:"#" },
    ],
    faqTitle:"Frequently Asked Questions",
    faqs:[
      { q:"How can I get a demo?", a:"Email demo@zyrix.co or write on WhatsApp. We'll get back within 24 hours." },
      { q:"When is technical support available?", a:"Turkish support Monday-Friday 09:00-18:00. WhatsApp for urgent issues." },
      { q:"Can I get integration support?", a:"Yes. Free onboarding and integration support included in Business and Pro plans." },
    ],
  },
  ar: {
    badge:"اتصل بنا", title:"كيف يمكننا المساعدة؟", sub:"تواصل معنا لأسئلتك. فريق الدعم التركي متاح 9-18.",
    name:"الاسم الكامل", email:"البريد الإلكتروني", company:"الشركة", subject:"الموضوع", message:"رسالتك", send:"إرسال الرسالة",
    subjects:["استفسار عام","دعم تقني","التسعير","التكامل","طلب ديمو","أخرى"],
    sending:"إرسال...", sent:"تم استلام رسالتك! سنرد خلال 24 ساعة.", error:"حدث خطأ. يرجى المحاولة مرة أخرى.",
    channels:[
      { icon:"💬", t:"واتساب", d:"+90 545 221 08 88", sub:"للرد السريع", href:"https://wa.me/905452210888" },
      { icon:"📧", t:"البريد", d:"support@zyrix.co", sub:"رد خلال 24 ساعة", href:"mailto:support@zyrix.co" },
      { icon:"📍", t:"الموقع", d:"إسطنبول، تركيا", sub:"دعم عن بُعد", href:"#" },
    ],
    faqTitle:"الأسئلة الشائعة",
    faqs:[
      { q:"كيف أحصل على ديمو؟", a:"أرسل بريداً إلى demo@zyrix.co أو اكتب على واتساب. سنرد خلال 24 ساعة." },
      { q:"متى يتوفر الدعم التقني؟", a:"الدعم التركي من الإثنين للجمعة 09:00-18:00. واتساب للحالات العاجلة." },
      { q:"هل يمكنني الحصول على دعم للتكامل؟", a:"نعم. دعم الإعداد والتكامل مجاناً في خطتي Business وPro." },
    ],
  },
};

export default function ContactPage() {
  const locale = useLocale();
  const l      = L[locale as keyof typeof L] ?? L.tr;
  const isRTL  = locale === "ar";

  const [form, setForm] = useState({ name:"", email:"", company:"", subject:"", message:"" });
  const [status, setStatus] = useState<"idle"|"sending"|"sent"|"error">("idle");
  const [faq, setFaq] = useState<number|null>(null);

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]:v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    await new Promise(r => setTimeout(r, 1200));
    /* TODO: Connect to real form handler / email service */
    setStatus("sent");
  }

  const inp: React.CSSProperties = {
    width:"100%", padding:"11px 14px", border:"1.5px solid #E5E7EB",
    borderRadius:9, fontSize:14, fontFamily:"inherit", color:"#0A0A0A",
    background:"#fff", outline:"none", boxSizing:"border-box", transition:"border-color .15s",
  };

  return (
    <div style={{ minHeight:"100vh", background:"#F8FAFC", direction: isRTL?"rtl":"ltr" }}>

      {/* Hero */}
      <section style={{ background:"linear-gradient(160deg,#0F172A,#1E3A8A)", padding:"60px 24px 48px", textAlign:"center" }}>
        <span style={{ display:"inline-block", background:"rgba(255,255,255,.1)", color:"#93C5FD", fontSize:12, fontWeight:700, padding:"5px 14px", borderRadius:100, marginBottom:14 }}>{l.badge}</span>
        <h1 style={{ fontSize:"clamp(26px,4vw,40px)", fontWeight:900, color:"#fff", marginBottom:10 }}>{l.title}</h1>
        <p style={{ fontSize:16, color:"rgba(255,255,255,.75)", maxWidth:480, margin:"0 auto" }}>{l.sub}</p>
      </section>

      <section style={{ maxWidth:1060, margin:"0 auto", padding:"48px 24px 64px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1.4fr", gap:28 }} className="contact-grid">

          {/* Left — channels + FAQ */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {/* Channel cards */}
            {l.channels.map((ch,i)=>(
              <a key={i} href={ch.href} target={ch.href.startsWith("http")?"_blank":"_self"} rel="noopener noreferrer"
                style={{ display:"flex", gap:14, padding:"16px 18px", background:"#fff", border:"1.5px solid #E5E7EB", borderRadius:14, textDecoration:"none", transition:"all .15s" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="#2563EB";e.currentTarget.style.transform="translateX(3px)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="#E5E7EB";e.currentTarget.style.transform="none";}}>
                <div style={{ width:42, height:42, borderRadius:11, background:"#EFF6FF", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>{ch.icon}</div>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:"#0A0A0A", marginBottom:3 }}>{ch.t}</div>
                  <div style={{ fontSize:14, color:"#2563EB", fontWeight:600 }}>{ch.d}</div>
                  <div style={{ fontSize:12, color:"#9CA3AF" }}>{ch.sub}</div>
                </div>
              </a>
            ))}

            {/* FAQ */}
            <div style={{ background:"#fff", border:"1px solid #E5E7EB", borderRadius:16, padding:"18px 16px", marginTop:4 }}>
              <h3 style={{ fontSize:15, fontWeight:800, color:GOLD, marginBottom:14 }}>{l.faqTitle}</h3>
              {l.faqs.map((f,i)=>(
                <div key={i} style={{ borderBottom: i<l.faqs.length-1?"1px solid #F3F4F6":"none", paddingBottom:10, marginBottom:10 }}>
                  <button onClick={()=>setFaq(faq===i?null:i)} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:700, color:"#0A0A0A", textAlign:"left", width:"100%", display:"flex", justifyContent:"space-between", padding:0 }}>
                    {f.q}
                    <span style={{ color:"#9CA3AF", fontSize:14, transform:faq===i?"rotate(180deg)":"none", display:"inline-block", transition:"transform .2s", flexShrink:0 }}>▾</span>
                  </button>
                  {faq===i && <p style={{ fontSize:12, color:"#4B5563", lineHeight:1.65, margin:"6px 0 0" }}>{f.a}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Right — contact form */}
          <div style={{ background:"#fff", border:"1px solid #E5E7EB", borderRadius:20, padding:28 }}>
            {status==="sent" ? (
              <div style={{ textAlign:"center", padding:"40px 20px" }}>
                <div style={{ fontSize:48, marginBottom:16 }}>✅</div>
                <h3 style={{ fontSize:20, fontWeight:800, color:"#059669", marginBottom:8 }}>{l.sent}</h3>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }} className="form-row">
                  <div>
                    <label style={{ fontSize:12, fontWeight:700, color:"#374151", display:"block", marginBottom:5 }}>{l.name}</label>
                    <input value={form.name} onChange={e=>set("name",e.target.value)} required style={inp} placeholder="Ahmet Yılmaz"
                      onFocus={e=>(e.target.style.borderColor="#2563EB")} onBlur={e=>(e.target.style.borderColor="#E5E7EB")} />
                  </div>
                  <div>
                    <label style={{ fontSize:12, fontWeight:700, color:"#374151", display:"block", marginBottom:5 }}>{l.email}</label>
                    <input type="email" value={form.email} onChange={e=>set("email",e.target.value)} required style={inp} placeholder="ahmet@sirket.com"
                      onFocus={e=>(e.target.style.borderColor="#2563EB")} onBlur={e=>(e.target.style.borderColor="#E5E7EB")} />
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }} className="form-row">
                  <div>
                    <label style={{ fontSize:12, fontWeight:700, color:"#374151", display:"block", marginBottom:5 }}>{l.company}</label>
                    <input value={form.company} onChange={e=>set("company",e.target.value)} style={inp} placeholder="Şirket A.Ş."
                      onFocus={e=>(e.target.style.borderColor="#2563EB")} onBlur={e=>(e.target.style.borderColor="#E5E7EB")} />
                  </div>
                  <div>
                    <label style={{ fontSize:12, fontWeight:700, color:"#374151", display:"block", marginBottom:5 }}>{l.subject}</label>
                    <select value={form.subject} onChange={e=>set("subject",e.target.value)} style={{ ...inp, cursor:"pointer" }}>
                      <option value="">—</option>
                      {l.subjects.map(s=>(<option key={s}>{s}</option>))}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize:12, fontWeight:700, color:"#374151", display:"block", marginBottom:5 }}>{l.message}</label>
                  <textarea value={form.message} onChange={e=>set("message",e.target.value)} required rows={5}
                    style={{ ...inp, resize:"vertical" }}
                    onFocus={e=>(e.target.style.borderColor="#2563EB")} onBlur={e=>(e.target.style.borderColor="#E5E7EB")} />
                </div>
                <button type="submit" disabled={status==="sending"} style={{ padding:"13px", background:status==="sending"?"#93C5FD":"#2563EB", color:"#fff", border:"none", borderRadius:9, fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"inherit", transition:"background .15s" }}>
                  {status==="sending" ? l.sending : l.send}
                </button>
                {status==="error" && <p style={{ color:"#DC2626", fontSize:13, textAlign:"center" }}>{l.error}</p>}
              </form>
            )}
          </div>
        </div>
      </section>

      <style>{`@media(max-width:860px){.contact-grid{grid-template-columns:1fr!important}.form-row{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}