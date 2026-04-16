"use client";
import { useLocale } from "next-intl";
import Link from "next/link";
const GOLD="#B8892A";
const L={
  tr:{ badge:"Hakkımızda", title:"Türkiye'nin KOBİ'lerini Güçlendiriyoruz", sub:"Zyrix FinSuite, küçük ve orta ölçekli işletmelerin finansal operasyonlarını otomatikleştirmek için kuruldu.", mission:"Misyonumuz", missionText:"Türkiye'deki her KOBİ'nin kurumsal yazılımlara eşit erişimi olsun. AI destekli finans araçlarını uygun fiyatla sunmak.", vision:"Vizyonumuz", visionText:"2030'a kadar Türkiye'nin 3.7 milyon KOBİ'sinin %10'unun platformumuzu kullanması.", founder:"Kurucu", founderName:"Mehmet", founderTitle:"MBA — Dijital Pazarlama & Media Buying Uzmanı", founderBio:"Dijital pazarlama ve girişimcilik alanındaki 10+ yıllık deneyimle, KOBİ'lerin ihtiyaç duyduğu finansal araçları demokratikleştirmek için Zyrix'i kurdu.", values:"Değerlerimiz", vals:[{icon:"🎯",t:"Sadelik",d:"Karmaşık muhasebe süreçlerini herkes için basit hale getiriyoruz."},{icon:"🔒",t:"Güvenlik",d:"Verileriniz SSL şifrelemeli sunucularda güvende."},{icon:"🚀",t:"İnovasyon",d:"AI ve otomasyon ile sürekli gelişiyoruz."},{icon:"🤝",t:"Destek",d:"Türkçe müşteri desteği ile her zaman yanınızdayız."}], stats:[{v:"3.7M",l:"Potansiyel KOBİ"},{v:"14",l:"Tamamlanan Özellik"},{v:"$100",l:"Aylık Operasyon Maliyeti"},{v:"2026",l:"Kuruluş Yılı"}], cta:"14 Gün Ücretsiz Başla" },
  en:{ badge:"About Us", title:"Empowering Turkey's SMEs", sub:"Zyrix FinSuite was founded to automate the financial operations of small and medium-sized businesses.", mission:"Our Mission", missionText:"Give every SME in Turkey equal access to enterprise-grade software. Deliver AI-powered financial tools at an affordable price.", vision:"Our Vision", visionText:"By 2030, have 10% of Turkey's 3.7 million SMEs using our platform.", founder:"Founder", founderName:"Mehmet", founderTitle:"MBA — Digital Marketing & Media Buying Expert", founderBio:"With 10+ years in digital marketing and entrepreneurship, founded Zyrix to democratize financial tools that SMEs need.", values:"Our Values", vals:[{icon:"🎯",t:"Simplicity",d:"Making complex accounting simple for everyone."},{icon:"🔒",t:"Security",d:"Your data is safe on SSL-encrypted servers."},{icon:"🚀",t:"Innovation",d:"Continuously improving with AI and automation."},{icon:"🤝",t:"Support",d:"Always by your side with Turkish customer support."}], stats:[{v:"3.7M",l:"Potential SMEs"},{v:"14",l:"Completed Features"},{v:"$100",l:"Monthly Operation Cost"},{v:"2026",l:"Founded"}], cta:"Start Free 14 Days" },
  ar:{ badge:"من نحن", title:"نمكّن الشركات الصغيرة في تركيا", sub:"تأسست Zyrix FinSuite لأتمتة العمليات المالية للشركات الصغيرة والمتوسطة.", mission:"مهمتنا", missionText:"منح كل شركة صغيرة في تركيا وصولاً متساوياً لبرامج المؤسسات. تقديم أدوات مالية بالذكاء الاصطناعي بسعر معقول.", vision:"رؤيتنا", visionText:"بحلول 2030، يستخدم 10٪ من 3.7 مليون شركة صغيرة في تركيا منصتنا.", founder:"المؤسس", founderName:"محمد", founderTitle:"ماجستير — خبير التسويق الرقمي", founderBio:"بخبرة تزيد على 10 سنوات في التسويق الرقمي وريادة الأعمال، أسس Zyrix لجعل الأدوات المالية في متناول الجميع.", values:"قيمنا", vals:[{icon:"🎯",t:"البساطة",d:"نجعل العمليات المحاسبية المعقدة بسيطة للجميع."},{icon:"🔒",t:"الأمان",d:"بياناتك آمنة على خوادم مشفرة بـ SSL."},{icon:"🚀",t:"الابتكار",d:"نتطور باستمرار بالذكاء الاصطناعي والأتمتة."},{icon:"🤝",t:"الدعم",d:"دائماً إلى جانبك بدعم عملاء بالتركية والعربية."}], stats:[{v:"3.7M",l:"شركة محتملة"},{v:"14",l:"ميزة مكتملة"},{v:"$100",l:"تكلفة تشغيل شهرية"},{v:"2026",l:"سنة التأسيس"}], cta:"ابدأ مجاناً 14 يوماً" },
};
export default function AboutPage(){
  const locale=await getLocale();
  const l=L[locale as keyof typeof L]??L.tr;
  const isRTL=locale==="ar";
  return(
    <div style={{minHeight:"100vh",background:"#fff",direction:isRTL?"rtl":"ltr"}}>
      <section style={{background:"linear-gradient(160deg,#0F172A,#1E3A8A)",padding:"72px 24px",textAlign:"center"}}>
        <span style={{display:"inline-block",background:"rgba(255,255,255,.1)",color:"#93C5FD",fontSize:12,fontWeight:700,padding:"5px 14px",borderRadius:100,marginBottom:14}}>{l.badge}</span>
        <h1 style={{fontSize:"clamp(26px,4vw,44px)",fontWeight:900,color:"#fff",marginBottom:12,lineHeight:1.2}}>{l.title}</h1>
        <p style={{fontSize:17,color:"rgba(255,255,255,.75)",maxWidth:600,margin:"0 auto",lineHeight:1.7}}>{l.sub}</p>
      </section>

      <section style={{maxWidth:1000,margin:"0 auto",padding:"64px 24px"}}>
        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:56}} className="ab-stats">
          {l.stats.map((s,i)=>(
            <div key={i} style={{textAlign:"center",padding:"20px 14px",background:"#F8FAFC",border:"1.5px solid #E5E7EB",borderRadius:14}}>
              <div style={{fontSize:32,fontWeight:900,color:GOLD,fontFamily:"'Nunito Sans',sans-serif",marginBottom:6}}>{s.v}</div>
              <div style={{fontSize:13,color:"#374151",fontWeight:600}}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Mission + Vision */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,marginBottom:56}} className="ab-mv">
          {[{t:l.mission,d:l.missionText,bg:"#EFF6FF",border:"#BFDBFE",icon:"🎯"},{t:l.vision,d:l.visionText,bg:"#ECFDF5",border:"#A7F3D0",icon:"🚀"}].map((item,i)=>(
            <div key={i} style={{background:item.bg,border:`1.5px solid ${item.border}`,borderRadius:16,padding:28}}>
              <div style={{fontSize:28,marginBottom:12}}>{item.icon}</div>
              <h3 style={{fontSize:18,fontWeight:800,color:"#0A0A0A",marginBottom:10}}>{item.t}</h3>
              <p style={{fontSize:14,color:"#374151",lineHeight:1.75,margin:0}}>{item.d}</p>
            </div>
          ))}
        </div>

        {/* Founder */}
        <div style={{background:"#0F172A",borderRadius:20,padding:"32px 36px",marginBottom:56,display:"flex",gap:28,alignItems:"center"}} className="ab-founder">
          <div style={{width:80,height:80,borderRadius:"50%",background:"#2563EB",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:900,color:"#fff",flexShrink:0}}>M</div>
          <div>
            <div style={{fontSize:12,color:"#64748B",fontWeight:700,textTransform:"uppercase",letterSpacing:".5px",marginBottom:6}}>{l.founder}</div>
            <div style={{fontSize:20,fontWeight:800,color:"#fff",marginBottom:4}}>{l.founderName}</div>
            <div style={{fontSize:13,color:GOLD,fontWeight:600,marginBottom:10}}>{l.founderTitle}</div>
            <p style={{fontSize:14,color:"rgba(255,255,255,.7)",lineHeight:1.7,margin:0}}>{l.founderBio}</p>
          </div>
        </div>

        {/* Values */}
        <h2 style={{fontSize:26,fontWeight:900,color:GOLD,marginBottom:24}}>{l.values}</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}} className="ab-vals">
          {l.vals.map((v,i)=>(
            <div key={i} style={{background:"#F8FAFC",border:"1.5px solid #E5E7EB",borderRadius:14,padding:"20px 16px",textAlign:"center"}}>
              <div style={{fontSize:28,marginBottom:10}}>{v.icon}</div>
              <div style={{fontSize:14,fontWeight:700,color:"#0A0A0A",marginBottom:6}}>{v.t}</div>
              <div style={{fontSize:12,color:"#374151",lineHeight:1.6}}>{v.d}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{background:"#0F172A",padding:"52px 24px",textAlign:"center"}}>
        <h2 style={{fontSize:26,fontWeight:900,color:GOLD,marginBottom:10}}>{l.cta}</h2>
        <Link href={`/${locale}/signup`} style={{background:"#2563EB",color:"#fff",padding:"14px 32px",borderRadius:10,fontSize:15,fontWeight:800,textDecoration:"none",display:"inline-block",marginTop:16}}>{l.cta}</Link>
      </section>
      <style>{`@media(max-width:860px){.ab-stats{grid-template-columns:repeat(2,1fr)!important}.ab-mv{grid-template-columns:1fr!important}.ab-vals{grid-template-columns:repeat(2,1fr)!important}.ab-founder{flex-direction:column!important}}`}</style>
    </div>
  );
}