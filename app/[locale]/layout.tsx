import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import "../globals.css";

const locales = ["en", "ar", "tr"];
const BASE = "https://finsuite.zyrix.co";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const meta = {
    en: {
      title: "FinSuite — Professional Invoicing & Finance Suite for MENA & Turkey",
      description: "Invoicing, VAT/KDV compliance, expense tracking, and custom checkout pages. Accept payments across Gulf, Iraq & Turkey with 99.9% uptime.",
      keywords: "payment gateway MENA, smart routing, COD Iraq, Gulf payments, Moyasar, iyzico, payment links",
    },
    ar: {
      title: "زيريكس Pay — بوابة الدفع الذكية للشرق الأوسط وتركيا",
      description: "توجيه متعدد البوابات، إعادة محاولة ذكية، دعم COD، وصفحات Checkout مخصصة. اقبل المدفوعات في الخليج والعراق وتركيا بضمان تشغيل 99.9%.",
      keywords: "بوابة دفع, توجيه متعدد البوابات, دفع عند الاستلام, مدفوعات الخليج",
    },
    tr: {
      title: "FinSuite — MENA ve Türkiye için Akıllı Ödeme Altyapısı",
      description: "Çoklu ağ geçidi yönlendirme, akıllı yeniden deneme, COD desteği ve özel ödeme sayfaları.",
      keywords: "ödeme altyapısı, çoklu ağ geçidi, kapıda ödeme, Körfez ödemeleri",
    },
  };

  const current = meta[locale as keyof typeof meta] || meta.en;
  const path = locale === "en" ? "" : `/${locale}`;

  return {
    title: current.title,
    description: current.description,
    keywords: current.keywords,
    metadataBase: new URL(BASE),
    alternates: {
      canonical: `${BASE}${path}`,
      languages: { en: `${BASE}/en`, ar: `${BASE}/ar`, tr: `${BASE}/tr` },
    },
    openGraph: {
      title: current.title,
      description: current.description,
      url: `${BASE}${path}`,
      siteName: "FinSuite",
      type: "website",
      images: [{ url: `${BASE}/og-image.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: current.title,
      description: current.description,
      images: [`${BASE}/og-image.png`],
      creator: "@zyrixpay",
    },
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

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/icon.png" type="image/png" />
        <meta name="theme-color" content="#D4820A" />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}