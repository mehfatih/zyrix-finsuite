import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import Script from "next/script";
import { WhatsAppWidget } from "@/components/WhatsAppWidget";
import "../globals.css";

const locales = ["tr", "en", "ar"];
const BASE    = "https://finsuite.zyrix.co";

/* ─────────────────────────────────────────
   TODO: Replace placeholders with real IDs
   GA4:   https://analytics.google.com
   Pixel: https://business.facebook.com
───────────────────────────────────────── */
const GA4_ID    = "G-XXXXXXXXXX";   // ← replace with your GA4 Measurement ID
const PIXEL_ID  = "XXXXXXXXXXXXXXX"; // ← replace with your Meta Pixel ID

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const meta: Record<string, { title: string; description: string; keywords: string }> = {
    tr: {
      title: "Zyrix FinSuite — Türk KOBİ'leri için Akıllı İşletme Platformu",
      description:
        "ERP + CRM + Yapay Zeka CFO + Ödeme — tek platformda. e-Fatura, KDV uyumlu. 14 gün ücretsiz deneyin.",
      keywords:
        "işletme yazılımı, e-fatura, KDV, CRM, ERP, yapay zeka, küçük işletme, muhasebe yazılımı türkiye",
    },
    en: {
      title: "Zyrix FinSuite — Smart Business Platform for Turkish SMEs",
      description:
        "ERP + CRM + AI CFO + Payments in one platform. e-Invoice and VAT compliant. Try 14 days free.",
      keywords:
        "business software turkey, e-invoice, VAT KDV, CRM ERP, AI finance, SME platform",
    },
    ar: {
      title: "Zyrix FinSuite — منصة الأعمال الذكية للشركات في تركيا",
      description:
        "ERP + CRM + AI CFO + بوابة دفع في منصة واحدة. متوافق مع e-Fatura و KDV. جرّب 14 يوماً مجاناً.",
      keywords:
        "برنامج أعمال تركيا، فاتورة إلكترونية، CRM، ERP، ذكاء اصطناعي، محاسبة",
    },
  };

  const current = meta[locale] ?? meta.tr;
  const path    = locale === "tr" ? "" : `/${locale}`;

  return {
    title:       current.title,
    description: current.description,
    keywords:    current.keywords,
    metadataBase: new URL(BASE),
    alternates: {
      canonical: `${BASE}${path}`,
      languages: { tr: `${BASE}/tr`, en: `${BASE}/en`, ar: `${BASE}/ar` },
    },
    openGraph: {
      title:       current.title,
      description: current.description,
      url:         `${BASE}${path}`,
      siteName:    "Zyrix FinSuite",
      type:        "website",
      locale:      locale === "tr" ? "tr_TR" : locale === "ar" ? "ar_SA" : "en_US",
      images: [{ url:`${BASE}/og-image.png`, width:1200, height:630, alt:"Zyrix FinSuite" }],
    },
    twitter: {
      card:        "summary_large_image",
      title:       current.title,
      description: current.description,
      images:      [`${BASE}/og-image.png`],
      creator:     "@zyrixco",
    },
    robots: { index:true, follow:true },
    icons:  { icon:"/icon.png", apple:"/apple-icon.png" },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale)) notFound();
  const messages = await getMessages();
  const isRTL    = locale === "ar";

  return (
    <html lang={locale} dir={isRTL ? "rtl" : "ltr"}>
      <head>
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito+Sans:opsz,wght@6..12,400;6..12,500;6..12,600;6..12,700;6..12,800;6..12,900&family=Cairo:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />

        {/* ── Google Analytics 4 ── */}
        {GA4_ID !== "G-XXXXXXXXXX" && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA4_ID}', { page_path: window.location.pathname });
            `}</Script>
          </>
        )}

        {/* ── Meta Pixel ── */}
        {PIXEL_ID !== "XXXXXXXXXXXXXXX" && (
          <Script id="meta-pixel" strategy="afterInteractive">{`
            !function(f,b,e,v,n,t,s){
              if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${PIXEL_ID}');
            fbq('track', 'PageView');
          `}</Script>
        )}
      </head>

      <body style={{
        fontFamily: isRTL
          ? "'Cairo', 'Nunito Sans', sans-serif"
          : "'Nunito Sans', 'Cairo', sans-serif",
        margin: 0, padding: 0,
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      }}>
        <NextIntlClientProvider messages={messages}>
          {children}
          <WhatsAppWidget />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}