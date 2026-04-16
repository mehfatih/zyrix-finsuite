"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

const LANGS = [
  { code: "tr", short: "TR", label: "Türkçe"  },
  { code: "en", short: "EN", label: "English"  },
  { code: "ar", short: "AR", label: "العربية"  },
];

const DROPDOWNS = {
  products: [
    { icon:"🧾", tr:"Muhasebe ve Faturalama", en:"Accounting & Invoicing",   ar:"المحاسبة والفواتير"  },
    { icon:"👥", tr:"CRM Müşteri Yönetimi",   en:"CRM Customer Management", ar:"إدارة العملاء"        },
    { icon:"💳", tr:"Ödeme Altyapısı",        en:"Payment Infrastructure",  ar:"بنية الدفع"           },
    { icon:"📊", tr:"Akıllı Raporlar",        en:"Smart Reports",           ar:"التقارير الذكية"      },
    { icon:"🧮", tr:"KDV Motoru",             en:"VAT Engine",              ar:"محرك KDV"             },
    { icon:"🔔", tr:"Akıllı Takip",           en:"Smart Follow-up",        ar:"المتابعة الذكية"       },
    { icon:"✅", tr:"Görev Yönetimi",         en:"Task Management",        ar:"إدارة المهام"          },
  ],
  ai: [
    { icon:"🤖", tr:"Yapay Zeka CFO",        en:"AI CFO",                  ar:"AI CFO"               },
    { icon:"📷", tr:"Fatura Tarayıcı",       en:"Invoice Scanner",         ar:"ماسح الفواتير"        },
    { icon:"💰", tr:"Nakit Akış Tahmini",    en:"Cash Flow Forecast",      ar:"توقع التدفق النقدي"  },
    { icon:"💬", tr:"İş Asistanı",           en:"Business Assistant",      ar:"مساعد الأعمال"        },
    { icon:"📈", tr:"Satış Koçu",            en:"Sales Coach",             ar:"مدرب المبيعات"        },
    { icon:"🎯", tr:"Müşteri Skoru",         en:"Customer Score",          ar:"تقييم العملاء"        },
    { icon:"⚡", tr:"AI Onboarding",         en:"AI Onboarding",           ar:"إعداد AI"             },
  ],
  integrations: [
    { icon:"🇹🇷", tr:"e-Fatura Türkiye",     en:"e-Invoice Turkey",        ar:"e-Fatura تركيا"       },
    { icon:"🧮", tr:"KDV Uyumluluğu",        en:"VAT Compliance",          ar:"توافق KDV"            },
    { icon:"⚡", tr:"Zapier",                en:"Zapier",                  ar:"Zapier"               },
    { icon:"🔧", tr:"Make",                  en:"Make",                    ar:"Make"                 },
    { icon:"🛒", tr:"Shopify",               en:"Shopify",                 ar:"Shopify"              },
    { icon:"💬", tr:"WhatsApp Business",     en:"WhatsApp Business",       ar:"واتساب بيزنس"        },
    { icon:"📊", tr:"Google Sheets",         en:"Google Sheets",           ar:"جداول جوجل"          },
  ],
} as const;

type DDKey = keyof typeof DROPDOWNS;

export function Navbar() {
  const t      = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const path   = usePathname();
  const isRTL  = locale === "ar";

  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen,   setLangOpen]   = useState(false);
  const [dd,         setDD]         = useState<DDKey | null>(null);
  const [scrolled,   setScrolled]   = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const s = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", s);
    return () => window.removeEventListener("scroll", s);
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setDD(null); setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  function switchLang(code: string) {
    const s = path.split("/"); s[1] = code;
    router.push(s.join("/") || "/");
    setLangOpen(false);
  }

  function lbl(item: { tr: string; en: string; ar: string }) {
    return locale === "tr" ? item.tr : locale === "ar" ? item.ar : item.en;
  }

  const seeAll = locale === "tr" ? "Tümünü gör →" : locale === "ar" ? "عرض الكل ←" : "See all →";

  const NAV: { ddKey?: DDKey; label: string; href?: string }[] = [
    { ddKey: "products",     label: t("products")     },
    { ddKey: "ai",           label: t("ai")           },
    { ddKey: "integrations", label: t("integrations") },
    { label: t("pricing"),   href: `/${locale}#pricing` },
  ];

  const curShort = LANGS.find(l => l.code === locale)?.short ?? "TR";

  return (
    <header ref={ref} style={{
      position: "sticky", top: 0, zIndex: 200,
      background: scrolled ? "rgba(255,255,255,.97)" : "rgba(255,255,255,.93)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      borderBottom: `1px solid rgba(0,0,0,${scrolled ? .08 : .05})`,
      boxShadow: scrolled ? "0 2px 24px rgba(0,0,0,.07)" : "none",
      transition: "all .25s",
    }}>
      {/* Rainbow top-line */}
      <div style={{ height: 2, background: "linear-gradient(90deg,#2563EB,#7C3AED,#06B6D4,#2563EB)", backgroundSize:"200%", animation:"navshine 4s linear infinite" }} />

      <div style={{
        maxWidth: 1200, margin: "0 auto", padding: "0 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 68, direction: isRTL ? "rtl" : "ltr",
      }}>

        {/* ── Logo ── */}
        <Link href={`/${locale}`} style={{ flexShrink:0, textDecoration:"none", display:"flex", alignItems:"center" }}>
          <Image src="/logo.png" alt="Zyrix" width={140} height={48}
            style={{ height:48, width:"auto", objectFit:"contain" }} priority />
        </Link>

        {/* ── Desktop Nav ── */}
        <nav style={{ display:"flex", gap:2, alignItems:"center" }} className="nd">
          {NAV.map(item => (
            <div key={item.label} style={{ position:"relative" }}>
              {item.ddKey ? (
                <button
                  onClick={() => setDD(dd === item.ddKey ? null : item.ddKey!)}
                  style={{ display:"flex", alignItems:"center", gap:3, padding:"8px 14px", border:"none", background:"transparent", cursor:"pointer", fontFamily:"inherit", fontSize:14, fontWeight:600, color:"#0A0A0A", borderRadius:8, transition:"background .15s" }}
                  onMouseEnter={e=>(e.currentTarget.style.background="#F3F4F6")}
                  onMouseLeave={e=>{ if(dd!==item.ddKey) e.currentTarget.style.background="transparent"; }}
                >
                  {item.label}
                  <span style={{ fontSize:9, color:"#6B7280", display:"inline-block", transform: dd===item.ddKey?"rotate(180deg)":"none", transition:"transform .2s" }}>▾</span>
                </button>
              ) : (
                <a href={item.href} style={{ display:"flex", alignItems:"center", padding:"8px 14px", fontSize:14, fontWeight:600, color:"#0A0A0A", textDecoration:"none", borderRadius:8, transition:"background .15s" }}
                  onMouseEnter={e=>(e.currentTarget.style.background="#F3F4F6")}
                  onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                  {item.label}
                </a>
              )}

              {/* Dropdown panel */}
              {item.ddKey && dd === item.ddKey && (
                <div style={{ position:"absolute", top:"calc(100% + 6px)", left:"50%", transform:"translateX(-50%)", background:"#fff", border:"1px solid #E5E7EB", borderRadius:14, boxShadow:"0 16px 48px rgba(0,0,0,.12)", padding:"6px 0", minWidth:240, zIndex:300 }}>
                  {DROPDOWNS[item.ddKey].map((it, i) => (
                    <a key={i} href="#" onClick={e=>{e.preventDefault();setDD(null);}} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 16px", textDecoration:"none", fontSize:13, color:"#111827", fontWeight:500, transition:"background .1s" }}
                      onMouseEnter={e=>(e.currentTarget.style.background="#F9FAFB")}
                      onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                      <span style={{ fontSize:15, width:20, textAlign:"center" }}>{it.icon}</span>
                      {lbl(it)}
                    </a>
                  ))}
                  <div style={{ borderTop:"1px solid #F3F4F6", margin:"4px 0" }} />
                  <a href={`/${locale}`} onClick={()=>setDD(null)} style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"9px 16px", fontSize:13, fontWeight:700, color:"#2563EB", textDecoration:"none", transition:"background .1s" }}
                    onMouseEnter={e=>(e.currentTarget.style.background="#EFF6FF")}
                    onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
                    {seeAll}
                  </a>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* ── Right actions ── */}
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>

          {/* Lang — short only */}
          <div style={{ position:"relative" }}>
            <button onClick={()=>{setLangOpen(!langOpen);setDD(null);}} style={{ display:"flex", alignItems:"center", gap:4, padding:"7px 11px", border:"1px solid #E5E7EB", borderRadius:8, background:"#fff", cursor:"pointer", fontSize:13, fontWeight:700, color:"#0A0A0A", fontFamily:"inherit" }}>
              {curShort} <span style={{ fontSize:9, color:"#6B7280" }}>▾</span>
            </button>
            {langOpen && (
              <div style={{ position:"absolute", top:"calc(100% + 6px)", [isRTL?"left":"right"]:0, background:"#fff", border:"1px solid #E5E7EB", borderRadius:10, boxShadow:"0 8px 24px rgba(0,0,0,.1)", overflow:"hidden", minWidth:150, zIndex:300 }}>
                {LANGS.map(l => (
                  <button key={l.code} onClick={()=>switchLang(l.code)} style={{ display:"flex", alignItems:"center", gap:9, width:"100%", padding:"10px 14px", background:l.code===locale?"#EFF6FF":"transparent", border:"none", cursor:"pointer", fontSize:13, fontWeight:l.code===locale?700:500, color:l.code===locale?"#2563EB":"#374151", fontFamily:"inherit", textAlign: isRTL?"right":"left" }}>
                    <span style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:22, height:15, background:l.code==="tr"?"#E30A17":l.code==="en"?"#012169":"#007A3D", borderRadius:2, fontSize:8, color:"#fff", fontWeight:700 }}>{l.short}</span>
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Demo */}
          <a href={`/${locale}/demo`} className="nd" style={{ fontSize:13, fontWeight:600, color:"#0A0A0A", padding:"8px 14px", border:"1px solid #E5E7EB", borderRadius:8, textDecoration:"none", background:"#fff", transition:"all .15s" }}
            onMouseEnter={e=>(e.currentTarget.style.background="#F9FAFB")}
            onMouseLeave={e=>(e.currentTarget.style.background="#fff")}>
            {t("demo")}
          </a>

          {/* CTA */}
          <a href={`/${locale}/signup`} style={{ fontSize:13, fontWeight:700, color:"#fff", padding:"9px 20px", background:"#2563EB", borderRadius:8, textDecoration:"none", transition:"all .15s", whiteSpace:"nowrap", boxShadow:"0 2px 8px rgba(37,99,235,.3)" }}
            onMouseEnter={e=>{e.currentTarget.style.background="#1D4ED8";e.currentTarget.style.transform="translateY(-1px)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="#2563EB";e.currentTarget.style.transform="none";}}>
            {t("cta")}
          </a>

          {/* Hamburger */}
          <button className="nm" onClick={()=>{setMobileOpen(!mobileOpen);setDD(null);setLangOpen(false);}}
            style={{ background:"none", border:"none", cursor:"pointer", fontSize:20, color:"#0A0A0A", padding:"4px 6px", lineHeight:1 }}>
            {mobileOpen?"✕":"☰"}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{ background:"#fff", borderTop:"1px solid #F3F4F6", padding:"12px 24px 20px", direction:isRTL?"rtl":"ltr" }}>
          {NAV.map(item => (
            <a key={item.label} href={item.href ?? `/${locale}#${item.ddKey}`} onClick={()=>setMobileOpen(false)} style={{ display:"block", padding:"11px 0", fontSize:15, fontWeight:600, color:"#0A0A0A", textDecoration:"none", borderBottom:"1px solid #F3F4F6" }}>{item.label}</a>
          ))}
          <div style={{ display:"flex", gap:8, marginTop:14 }}>
            {LANGS.map(l=>(
              <button key={l.code} onClick={()=>{switchLang(l.code);setMobileOpen(false);}} style={{ padding:"7px 14px", border:`1.5px solid ${l.code===locale?"#2563EB":"#E5E7EB"}`, borderRadius:7, background:l.code===locale?"#EFF6FF":"#fff", color:l.code===locale?"#2563EB":"#374151", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>{l.short}</button>
            ))}
          </div>
          <a href={`/${locale}/signup`} style={{ display:"block", marginTop:14, textAlign:"center", padding:"13px", background:"#2563EB", color:"#fff", borderRadius:8, fontWeight:700, fontSize:14, textDecoration:"none" }}>{t("cta")}</a>
        </div>
      )}

      <style>{`
        @keyframes navshine{0%{background-position:0 0}100%{background-position:200% 0}}
        @media(max-width:900px){.nd{display:none!important}.nm{display:flex!important}}
        @media(min-width:901px){.nd{display:flex!important}.nm{display:none!important}}
      `}</style>
    </header>
  );
}