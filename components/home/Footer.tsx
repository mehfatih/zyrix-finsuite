"use client";

import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

/* ── Real social icons with brand colors ── */
const SOCIAL = [
  {
    name: "X / Twitter", href: "https://x.com/zyrixco",
    color: "#000000",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
  },
  {
    name: "LinkedIn", href: "https://linkedin.com/company/zyrix",
    color: "#0A66C2",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  },
  {
    name: "Instagram", href: "https://instagram.com/zyrixco",
    color: "#E1306C",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
  },
  {
    name: "YouTube", href: "https://youtube.com/@zyrixco",
    color: "#FF0000",
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>,
  },
];

/* ── Payment cards — Türkiye focused ── */
const CARDS = [
  { name:"Visa",       bg:"#1A1F71", text:"#fff",    logo: <svg width="38" height="13" viewBox="0 0 38 13" fill="none"><path d="M14.5 1.2L11.8 11.8H9L11.7 1.2h2.8zM25.5 7.9l1.5-4 .8 4h-2.3zm3.1 3.9H31L29.2 1.2h-2.1c-.5 0-.9.3-1.1.7L22 11.8h2.8l.6-1.5h3.4l.3 1.5zM20.6 8.6c0-2.7-3.8-2.9-3.8-4.1 0-.4.4-.8 1.1-.9.4 0 1.4-.1 2.6.4l.5-2.2C20.3 1.5 19.3 1 18 1c-2.6 0-4.4 1.4-4.4 3.3 0 1.4 1.3 2.2 2.3 2.7 1 .5 1.3.8 1.3 1.2 0 .7-.8 1-1.5 1-1.3 0-2-.3-2.6-.6l-.5 2.3c.6.3 1.7.5 2.8.5 2.8.1 4.2-1.3 4.2-3.8zM7.5 1.2L3 11.8H.2L2.5 6.8c-.5-1.3-1-2.5-1.5-3.6l2.7-.2.8 3.2L7 1.2h.5z" fill="#1A1F71"/><path d="M14.5 1.2L11.8 11.8H9L11.7 1.2h2.8z" fill="#fff"/></svg> },
  { name:"Mastercard", bg:"#EB001B", text:"#fff",    logo: <svg width="32" height="20" viewBox="0 0 32 20" fill="none"><circle cx="12" cy="10" r="10" fill="#EB001B"/><circle cx="20" cy="10" r="10" fill="#F79E1B"/><path d="M16 3.8a10 10 0 010 12.4A10 10 0 0116 3.8z" fill="#FF5F00"/></svg> },
  { name:"Troy",       bg:"#004B87", text:"#fff",    logo: <svg width="36" height="14" viewBox="0 0 36 14" fill="none"><rect width="36" height="14" rx="2" fill="#004B87"/><text x="4" y="10" fill="#FFD700" fontSize="8" fontWeight="bold" fontFamily="Arial">TROY</text></svg> },
  { name:"BKM Express",bg:"#E8000D", text:"#fff",    logo: <svg width="36" height="14" viewBox="0 0 36 14" fill="none"><rect width="36" height="14" rx="2" fill="#E8000D"/><text x="3" y="10" fill="#fff" fontSize="7" fontWeight="bold" fontFamily="Arial">BKM</text></svg> },
  { name:"iyzico",     bg:"#FF6B35", text:"#fff",    logo: <svg width="36" height="14" viewBox="0 0 36 14" fill="none"><rect width="36" height="14" rx="2" fill="#FF6B35"/><text x="4" y="10" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="Arial">iyzico</text></svg> },
  { name:"PayTR",      bg:"#0071CE", text:"#fff",    logo: <svg width="36" height="14" viewBox="0 0 36 14" fill="none"><rect width="36" height="14" rx="2" fill="#0071CE"/><text x="3" y="10" fill="#fff" fontSize="8" fontWeight="bold" fontFamily="Arial">PayTR</text></svg> },
];

const GOLD = "#C9A84C";

export function Footer() {
  const t      = useTranslations("footer");
  const locale = useLocale();
  const isRTL  = locale === "ar";

  const COL_P  = ["p1","p2","p3","p4","p5"] as const;
  const COL_A  = ["a1","a2","a3","a4"]      as const;
  const COL_I  = ["i1","i2","i3","i4"]      as const;
  const COL_C  = [
    { key:"c1" as const, href:"https://zyrix.co"    },
    { key:"c2" as const, href:`/${locale}/blog`     },
    { key:"c3" as const, href:`/${locale}/customers`},
    { key:"c4" as const, href:`/${locale}/partners` },
    { key:"c5" as const, href:`/${locale}/contact`  },
  ];

  const linkStyle: React.CSSProperties = {
    fontSize:13, color:"rgba(255,255,255,.72)", textDecoration:"none", transition:"color .15s",
  };

  return (
    <footer style={{ background:"#0F172A", direction: isRTL?"rtl":"ltr" }}>

      {/* ── Main columns ── */}
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"48px 28px 32px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr 1fr 1fr 1fr", gap:32, marginBottom:36 }} className="ft-grid">

          {/* Brand */}
          <div>
            <Link href={`/${locale}`} style={{ textDecoration:"none", display:"inline-block", marginBottom:14 }}>
              <Image src="/logo.png" alt="Zyrix" width={130} height={44}
                style={{ height:44, width:"auto", filter:"brightness(0) invert(1)" }} />
            </Link>
            <p style={{ fontSize:13, color:"rgba(255,255,255,.6)", lineHeight:1.7, maxWidth:210, margin:"0 0 18px" }}>
              {t("desc")}
            </p>

            {/* Social icons — brand colors */}
            <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:18 }}>
              {SOCIAL.map(s => (
                <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" title={s.name}
                  style={{
                    width:34, height:34,
                    background: s.color,
                    borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center",
                    color:"#fff", textDecoration:"none", transition:"all .15s", flexShrink:0,
                  }}
                  onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 4px 12px ${s.color}55`;}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
                  {s.icon}
                </a>
              ))}
            </div>

            {/* Google Play */}
            <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer"
              style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"8px 14px", background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.12)", borderRadius:9, textDecoration:"none", transition:"all .15s" }}
              onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,.12)")}
              onMouseLeave={e=>(e.currentTarget.style.background="rgba(255,255,255,.06)")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#4ADE80">
                <path d="M3.18 23.76a2.07 2.07 0 01-1.08-1.87V2.11c0-.8.44-1.5 1.08-1.87l11.3 11.76zM20.13 13.5l-2.54 1.47-3.12-3.22 3.12-3.22 2.57 1.48a2.08 2.08 0 010 3.49zM3.62.08L14.38 11.4l-2.84 2.95z"/>
              </svg>
              <div>
                <div style={{ fontSize:9, color:"rgba(255,255,255,.5)", lineHeight:1 }}>GET IT ON</div>
                <div style={{ fontSize:13, fontWeight:700, color:"#fff", lineHeight:1.3 }}>Google Play</div>
              </div>
            </a>
          </div>

          {/* Products */}
          <div>
            <h5 style={{ fontSize:12, fontWeight:700, color:GOLD, marginBottom:14, textTransform:"uppercase", letterSpacing:".8px" }}>
              {t("products")}
            </h5>
            <ul style={{ listStyle:"none", margin:0, padding:0, display:"flex", flexDirection:"column", gap:9 }}>
              {COL_P.map(k => (
                <li key={k}>
                  <a href={`/${locale}#features`} style={linkStyle}
                    onMouseEnter={e=>(e.currentTarget.style.color="#fff")}
                    onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,.72)")}>
                    {t(k)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* AI + Integrations */}
          <div>
            <h5 style={{ fontSize:12, fontWeight:700, color:GOLD, marginBottom:14, textTransform:"uppercase", letterSpacing:".8px" }}>
              {t("ai_col")}
            </h5>
            <ul style={{ listStyle:"none", margin:0, padding:0, display:"flex", flexDirection:"column", gap:9, marginBottom:20 }}>
              {COL_A.map(k => (
                <li key={k}>
                  <a href={`/${locale}#ai`} style={linkStyle}
                    onMouseEnter={e=>(e.currentTarget.style.color="#fff")}
                    onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,.72)")}>
                    {t(k)}
                  </a>
                </li>
              ))}
            </ul>
            <h5 style={{ fontSize:12, fontWeight:700, color:GOLD, marginBottom:14, textTransform:"uppercase", letterSpacing:".8px" }}>
              {t("integrations_col")}
            </h5>
            <ul style={{ listStyle:"none", margin:0, padding:0, display:"flex", flexDirection:"column", gap:9 }}>
              {COL_I.map(k => (
                <li key={k}>
                  <a href={`/${locale}#integrations`} style={linkStyle}
                    onMouseEnter={e=>(e.currentTarget.style.color="#fff")}
                    onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,.72)")}>
                    {t(k)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h5 style={{ fontSize:12, fontWeight:700, color:GOLD, marginBottom:14, textTransform:"uppercase", letterSpacing:".8px" }}>
              {t("company_col")}
            </h5>
            <ul style={{ listStyle:"none", margin:0, padding:0, display:"flex", flexDirection:"column", gap:9 }}>
              {COL_C.map(({ key, href }) => (
                <li key={key}>
                  <a href={href} style={linkStyle}
                    onMouseEnter={e=>(e.currentTarget.style.color="#fff")}
                    onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,.72)")}>
                    {t(key)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust + Payments */}
          <div>
            <h5 style={{ fontSize:12, fontWeight:700, color:GOLD, marginBottom:14, textTransform:"uppercase", letterSpacing:".8px" }}>
              {locale==="tr"?"Güvenlik":locale==="ar"?"الأمان":"Security"}
            </h5>

            {[
              { icon:"🔒", text:"SSL 256-bit" },
              { icon:"🇹🇷", text:"e-Fatura Onaylı" },
              { icon:"💳", text:"PCI DSS" },
              { icon:"☁️", text:"99.9% Uptime" },
            ].map(b=>(
              <div key={b.text} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <div style={{ width:30, height:30, background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.08)", borderRadius:7, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>{b.icon}</div>
                <span style={{ fontSize:12, color:"rgba(255,255,255,.65)", fontWeight:600 }}>{b.text}</span>
              </div>
            ))}

            {/* Payment cards */}
            <h5 style={{ fontSize:12, fontWeight:700, color:GOLD, marginBottom:10, marginTop:18, textTransform:"uppercase", letterSpacing:".8px" }}>
              {locale==="tr"?"Ödeme":locale==="ar"?"الدفع":"Payments"}
            </h5>
            <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
              {CARDS.map(c=>(
                <div key={c.name} title={c.name} style={{
                  height:22, padding:"0 6px",
                  background:c.bg, borderRadius:4,
                  display:"flex", alignItems:"center",
                  cursor:"default",
                }}>
                  {c.logo}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height:1, background:"rgba(255,255,255,.08)", marginBottom:20 }} />

        {/* Bottom bar */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <p style={{ fontSize:12, color:"rgba(255,255,255,.35)", margin:0 }}>
            © 2026 Zyrix FinSuite. {t("rights")}.
          </p>
          <div style={{ display:"flex", gap:18, flexWrap:"wrap" }}>
            {(["privacy","terms","data"] as const).map(k=>(
              <a key={k} href={`/${locale}/${k}`} style={{ fontSize:12, color:"rgba(255,255,255,.35)", textDecoration:"none", transition:"color .15s" }}
                onMouseEnter={e=>(e.currentTarget.style.color="rgba(255,255,255,.7)")}
                onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,.35)")}>
                {t(k)}
              </a>
            ))}
          </div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,.35)", display:"flex", alignItems:"center", gap:5 }}>
            <span>{locale==="tr"?"🇹🇷":locale==="ar"?"🇸🇦":"🇬🇧"}</span>
            <span>{locale==="tr"?"Türkçe":locale==="ar"?"العربية":"English"}</span>
          </div>
        </div>
      </div>

      <style>{`
        @media(max-width:1024px){.ft-grid{grid-template-columns:repeat(3,1fr)!important}}
        @media(max-width:640px){.ft-grid{grid-template-columns:1fr 1fr!important}}
        @media(max-width:400px){.ft-grid{grid-template-columns:1fr!important}}
      `}</style>
    </footer>
  );
}