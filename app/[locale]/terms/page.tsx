"use client";

import { useLocale } from "next-intl";
import Link from "next/link";
import { useState } from "react";

const GOLD = "#B8892A";

/* ─────────────────────────────────────────────────────────────
   Zyrix FinSuite — Kullanım Koşulları / Terms of Service
   Uyumluluk:
   - 6098 sayılı Türk Borçlar Kanunu (TBK)
   - 6102 sayılı Türk Ticaret Kanunu (TTK)
   - 6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun
   - KVKK (6698)
   - Mesafeli Sözleşmeler Yönetmeliği
   - Saudi CITC Electronic Commerce Regulations (supplement)
   Son Güncelleme: Nisan 2026
───────────────────────────────────────────────────────────── */

const CONTENT = {
  tr: {
    badge:   "Kullanım Koşulları",
    updated: "Son Güncelleme: Nisan 2026 | Yürürlük: Nisan 2026",
    intro:   "Bu Kullanım Koşulları, Zyrix FinSuite platformunu kullanımınızı düzenler. Platforma erişim veya kayıt ile bu koşulları kabul etmiş sayılırsınız. Lütfen dikkatlice okuyunuz.",
    sections: [
      {
        title: "1. Taraflar ve Sözleşmenin Konusu",
        body:  "Bu sözleşme; Zyrix FinSuite ('Hizmet Sağlayıcı') ile platforma kayıt olan gerçek veya tüzel kişi ('Kullanıcı') arasında akdedilir. Sözleşmenin konusu, Zyrix FinSuite yazılım hizmetinin (SaaS) kullanım koşullarının belirlenmesidir.",
      },
      {
        title: "2. Hizmet Kapsamı",
        body:  "Zyrix FinSuite aşağıdaki hizmetleri sunar:",
        list:  [
          "e-Fatura ve e-Arşiv oluşturma ve GİB'e iletme (Özel Entegratör üzerinden)",
          "CRM — müşteri yönetimi, satış pipeline, sadakat programı",
          "Yapay Zeka CFO — finansal analiz, tahmin ve öneri sistemi",
          "Ödeme altyapısı — ödeme linkleri ve entegrasyonlar",
          "Raporlama — muhasebe ve KDV raporları",
          "Entegrasyonlar — Shopify, Zapier, Make, WhatsApp, Google Sheets",
        ],
      },
      {
        title: "3. Abonelik ve Ödeme Koşulları",
        body:  "Abonelik ve ödeme şartları:",
        list:  [
          "Ücretli planlar aylık veya yıllık olarak faturalandırılır",
          "14 günlük ücretsiz deneme süresi — kredi kartı gerekmez",
          "Yıllık planlarda %20 indirim uygulanır",
          "Ödemeler USD cinsinden alınır; TL karşılığı kura bağlı değişebilir",
          "Abonelik iptalinde kalan dönem için ücret iadesi yapılmaz (Mesafeli Sözleşmeler Yönetmeliği Md. 15/g)",
          "Fiyatlar 30 gün önceden bildirim yapılarak değiştirilebilir",
          "Ödeme gecikmeleri halinde hizmet askıya alınabilir",
        ],
      },
      {
        title: "4. Cayma Hakkı (Mesafeli Sözleşmeler Yönetmeliği)",
        body:  "6563 sayılı Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca:",
        list:  [
          "Ücretsiz deneme süresi içinde hesabınızı silebilirsiniz — ücret alınmaz",
          "Ücretli abonelik başladıktan sonra, dijital hizmetin kullanımına başlanmasıyla cayma hakkı kullanılamaz (Md. 15/g)",
          "Faturalandırma başlamadan önce iptal edilirse tam iade yapılır",
          "İptal talepleri: iptal@zyrix.co veya WhatsApp üzerinden yapılır",
        ],
      },
      {
        title: "5. Kullanıcı Yükümlülükleri",
        body:  "Platform kullanımında uymanız gereken kurallar:",
        list:  [
          "Hesap bilgilerinizin doğru ve güncel olmasını sağlamak",
          "Şifrenizi gizli tutmak ve üçüncü kişilerle paylaşmamak",
          "Platformu yalnızca yasal amaçlarla kullanmak",
          "Başkalarının verilerine yetkisiz erişim girişiminde bulunmamak",
          "Platform altyapısına zarar verecek faaliyetlerden kaçınmak",
          "Türk vergi ve muhasebe mevzuatına uygun fatura bilgisi girmek",
          "e-Fatura zorunluluğu kapsamındaysanız yasal süreçleri takip etmek",
        ],
      },
      {
        title: "6. Fikri Mülkiyet Hakları",
        body:  "Zyrix FinSuite platformuna ait tüm haklar saklıdır:",
        list:  [
          "Platform yazılımı, tasarımı ve içerikleri Zyrix FinSuite'e aittir",
          "Kullanıcılar platforma sınırlı, devredilemez bir kullanım lisansı alır",
          "Yazılımın kopyalanması, kaynak kodunun çözümlenmesi yasaktır",
          "Kullanıcı verileri (faturalar, müşteri bilgileri) kullanıcıya aittir",
          "Kullanıcı verileri üçüncü taraflarla ticari amaçla paylaşılmaz",
        ],
      },
      {
        title: "7. Gizlilik ve Veri Güvenliği",
        body:  "Kişisel veri işleme uygulamaları ayrıca Gizlilik Politikamızda düzenlenmektedir. Temel ilkeler:",
        list:  [
          "Verileriniz Türkiye'de veya AB'de güvenli sunucularda saklanır",
          "SSL/TLS 256-bit şifreleme tüm veri iletimlerinde kullanılır",
          "KVKK'ya uygun veri işleme — verileriniz rızasız üçüncü taraflara satılmaz",
          "Hesap silinmesinin ardından veriler 30 gün içinde kalıcı olarak silinir",
          "e-Fatura verileri yasal zorunluluk nedeniyle 10 yıl saklanır",
        ],
      },
      {
        title: "8. Hizmet Kesintisi ve Sorumluluk Sınırlaması",
        body:  "Hizmet düzeyi ve sorumluluk:",
        list:  [
          "Platformun %99,9 çalışma süresi hedeflenir (SLA)",
          "Planlı bakım çalışmaları 48 saat önceden duyurulur",
          "Mücbir sebep (doğal afet, yasal düzenleme vb.) halinde sorumluluk doğmaz",
          "Hizmet kesintisinden doğacak dolaylı zararlardan sorumluluk kabul edilmez",
          "Azami sorumluluk, kesinti dönemine ait aylık abonelik ücreti ile sınırlıdır",
          "GİB sistemlerinden kaynaklanan gecikmelerden Zyrix FinSuite sorumlu değildir",
        ],
      },
      {
        title: "9. Hesap Askıya Alma ve Sonlandırma",
        body:  "Hesabınızın askıya alınabileceği veya sonlandırılabileceği durumlar:",
        list:  [
          "Ödeme yükümlülüklerinin yerine getirilmemesi (7 gün ihtar süresi)",
          "Kullanım koşullarının ihlali",
          "Yasal düzenlemelere aykırı kullanım",
          "Platform güvenliğini tehdit eden faaliyetler",
          "Kullanıcı talebiyle — 30 gün veri erişimi sağlanır",
        ],
      },
      {
        title: "10. Elektronik Ticaret Hükümleri (6563 Sayılı Kanun)",
        body:  "Elektronik ticaret mevzuatı kapsamında:",
        list:  [
          "Hizmet sağlayıcı bilgileri: Zyrix FinSuite, İstanbul, Türkiye",
          "İletişim: destek@zyrix.co | +90 545 221 08 88",
          "Ticaret sicil bilgileri: [Tescil sonrası güncellenecek]",
          "Vergi kimlik numarası: [Tescil sonrası güncellenecek]",
          "Şikayetler için: sikayetvar.com veya Tüketici Hakem Heyeti",
        ],
      },
      {
        title: "11. Suudi Arabistan Ek Hükümleri (CITC)",
        body:  "Suudi Arabistan'dan hizmet alan kullanıcılar için ek hükümler:",
        list:  [
          "Hizmet, Suudi Arabistan'da yerleşik kullanıcılara sunulmaktadır",
          "Ödeme işlemleri uluslararası ödeme kuruluşları aracılığıyla gerçekleşir",
          "ZATCA e-fatura uyumluluğu ayrıca değerlendirilmektedir — güncel durum için iletişime geçin",
          "Anlaşmazlıklarda Türk hukuku esas alınır; CITC şikayetleri ayrıca kabul edilir",
        ],
      },
      {
        title: "12. Uygulanacak Hukuk ve Yetki",
        body:  "Bu sözleşme Türk hukukuna tabidir. Uyuşmazlıklarda İstanbul Mahkemeleri ve İcra Müdürlükleri yetkilidir. Tüketici uyuşmazlıklarında ilgili Tüketici Hakem Heyeti veya Tüketici Mahkemesi yetkilidir.",
      },
      {
        title: "13. Koşulların Değiştirilmesi",
        body:  "Bu koşullar güncellenebilir. Değişiklikler kayıtlı e-posta adresinize 30 gün önceden bildirilir. Platformu kullanmaya devam etmeniz değişiklikleri kabul ettiğiniz anlamına gelir.",
      },
    ],
  },

  en: {
    badge:   "Terms of Service",
    updated: "Last Updated: April 2026 | Effective: April 2026",
    intro:   "These Terms of Service govern your use of the Zyrix FinSuite platform. By accessing or registering on the platform, you are deemed to have accepted these terms. Please read carefully.",
    sections: [
      {
        title: "1. Parties and Subject Matter",
        body:  "This agreement is between Zyrix FinSuite ('Service Provider') and the individual or legal entity registering on the platform ('User'). The subject is establishing the terms of use for the Zyrix FinSuite SaaS software service.",
      },
      {
        title: "2. Service Scope",
        body:  "Zyrix FinSuite provides the following services:",
        list:  [
          "e-Invoice and e-Archive creation and submission to GİB (via Private Integrator)",
          "CRM — customer management, sales pipeline, loyalty program",
          "AI CFO — financial analysis, forecasting and recommendation system",
          "Payment infrastructure — payment links and integrations",
          "Reporting — accounting and VAT reports",
          "Integrations — Shopify, Zapier, Make, WhatsApp, Google Sheets",
        ],
      },
      {
        title: "3. Subscription and Payment Terms",
        body:  "Subscription and payment conditions:",
        list:  [
          "Paid plans are billed monthly or annually",
          "14-day free trial — no credit card required",
          "20% discount on annual plans",
          "Payments are taken in USD",
          "No refund for remaining period upon cancellation (per Turkish Distance Contracts Regulation Art. 15/g)",
          "Prices may change with 30 days advance notice",
          "Service may be suspended for payment delays",
        ],
      },
      {
        title: "4. Right of Withdrawal (Distance Contracts Regulation)",
        body:  "Under Turkish Law No. 6563 and Distance Contracts Regulation:",
        list:  [
          "You may delete your account during the free trial — no charge",
          "Once a paid subscription starts, withdrawal right cannot be exercised once digital service use begins (Art. 15/g)",
          "Full refund if cancelled before billing starts",
          "Cancellation requests: cancel@zyrix.co or via WhatsApp",
        ],
      },
      {
        title: "5. User Obligations",
        body:  "Rules you must follow when using the platform:",
        list:  [
          "Ensure your account information is accurate and current",
          "Keep your password confidential and not share with third parties",
          "Use the platform only for legal purposes",
          "Not attempt unauthorized access to others' data",
          "Avoid activities that could harm the platform infrastructure",
          "Enter invoice information compliant with Turkish tax and accounting law",
          "Follow legal processes if subject to e-Invoice obligation",
        ],
      },
      {
        title: "6. Intellectual Property Rights",
        body:  "All rights relating to the Zyrix FinSuite platform are reserved:",
        list:  [
          "Platform software, design and content belong to Zyrix FinSuite",
          "Users receive a limited, non-transferable usage license",
          "Copying the software or reverse engineering is prohibited",
          "User data (invoices, customer information) belongs to the user",
          "User data is not shared with third parties for commercial purposes",
        ],
      },
      {
        title: "7. Privacy and Data Security",
        body:  "Personal data processing is further governed by our Privacy Policy. Key principles:",
        list:  [
          "Your data is stored on secure servers in Turkey or EU",
          "SSL/TLS 256-bit encryption is used for all data transmissions",
          "KVKK-compliant data processing — your data is not sold to third parties",
          "Data permanently deleted within 30 days after account deletion",
          "e-Invoice data retained 10 years due to legal obligation",
        ],
      },
      {
        title: "8. Service Interruption and Liability Limitation",
        body:  "Service level and liability:",
        list:  [
          "99.9% uptime target for the platform (SLA)",
          "Planned maintenance announced 48 hours in advance",
          "No liability in cases of force majeure",
          "No liability accepted for indirect damages from service interruptions",
          "Maximum liability limited to monthly subscription fee for the interruption period",
          "Zyrix FinSuite is not responsible for delays caused by GİB systems",
        ],
      },
      {
        title: "9. Account Suspension and Termination",
        body:  "Situations where your account may be suspended or terminated:",
        list:  [
          "Failure to meet payment obligations (7 days notice period)",
          "Violation of terms of service",
          "Use contrary to legal regulations",
          "Activities threatening platform security",
          "At user request — 30 days data access provided",
        ],
      },
      {
        title: "10. E-Commerce Provisions (Law No. 6563)",
        body:  "Under Turkish e-commerce legislation:",
        list:  [
          "Service provider info: Zyrix FinSuite, Istanbul, Turkey",
          "Contact: support@zyrix.co | +90 545 221 08 88",
          "Trade registry: [To be updated after registration]",
          "Tax ID: [To be updated after registration]",
          "For complaints: Consumer Arbitration Committee",
        ],
      },
      {
        title: "11. Saudi Arabia Supplementary Provisions (CITC)",
        body:  "Additional provisions for users from Saudi Arabia:",
        list:  [
          "Service is provided to users resident in Saudi Arabia",
          "Payments are processed through international payment institutions",
          "ZATCA e-invoice compliance is under separate evaluation — contact us for current status",
          "Turkish law governs disputes; CITC complaints are also accepted separately",
        ],
      },
      {
        title: "12. Governing Law and Jurisdiction",
        body:  "This agreement is governed by Turkish law. Istanbul Courts and Execution Offices are authorized for disputes. For consumer disputes, the relevant Consumer Arbitration Committee or Consumer Court is authorized.",
      },
      {
        title: "13. Amendments",
        body:  "These terms may be updated. Changes will be notified to your registered email 30 days in advance. Continued use of the platform constitutes acceptance of the changes.",
      },
    ],
  },

  ar: {
    badge:   "شروط الاستخدام",
    updated: "آخر تحديث: أبريل 2026 | النفاذ: أبريل 2026",
    intro:   "تحكم شروط الاستخدام هذه استخدامك لمنصة Zyrix FinSuite. بالوصول إلى المنصة أو التسجيل فيها، يُعدّ ذلك قبولاً منك لهذه الشروط. يُرجى القراءة بعناية.",
    sections: [
      {
        title: "1. الأطراف وموضوع العقد",
        body:  "يُبرم هذا العقد بين Zyrix FinSuite ('مزود الخدمة') والشخص الطبيعي أو الاعتباري المسجّل في المنصة ('المستخدم'). يتعلق الموضوع بتحديد شروط استخدام خدمة البرمجيات كخدمة (SaaS) الخاصة بـ Zyrix FinSuite.",
      },
      {
        title: "2. نطاق الخدمة",
        body:  "تقدم Zyrix FinSuite الخدمات التالية:",
        list:  [
          "إنشاء e-Fatura وe-Arşiv وإرسالها إلى GİB (عبر المُدمج الخاص)",
          "CRM — إدارة العملاء، خط المبيعات، برنامج الولاء",
          "AI CFO — التحليل المالي، التنبؤ ونظام التوصيات",
          "بنية الدفع — روابط الدفع والتكاملات",
          "التقارير — تقارير المحاسبة وKDV",
          "التكاملات — Shopify وZapier وMake وواتساب وGoogle Sheets",
        ],
      },
      {
        title: "3. شروط الاشتراك والدفع",
        body:  "شروط الاشتراك والدفع:",
        list:  [
          "تُفوتر الخطط المدفوعة شهرياً أو سنوياً",
          "فترة تجربة مجانية 14 يوماً — لا بطاقة ائتمان مطلوبة",
          "خصم 20٪ على الخطط السنوية",
          "المدفوعات بالدولار الأمريكي",
          "لا استرداد للفترة المتبقية عند الإلغاء (وفق لائحة العقود عن بُعد التركية)",
          "قد تتغير الأسعار بإشعار مسبق 30 يوماً",
          "قد تُعلَّق الخدمة في حالة تأخر الدفع",
        ],
      },
      {
        title: "4. حق الانسحاب (لائحة العقود عن بُعد)",
        body:  "بموجب قانون التجارة الإلكترونية التركي رقم 6563 ولائحة العقود عن بُعد:",
        list:  [
          "يمكنك حذف حسابك خلال فترة التجربة المجانية — بدون رسوم",
          "بعد بدء الاشتراك المدفوع، لا يمكن ممارسة حق الانسحاب بعد استخدام الخدمة الرقمية",
          "استرداد كامل في حال الإلغاء قبل بدء الفوترة",
          "طلبات الإلغاء: cancel@zyrix.co أو عبر واتساب",
        ],
      },
      {
        title: "5. التزامات المستخدم",
        body:  "القواعد الواجب اتباعها عند استخدام المنصة:",
        list:  [
          "ضمان دقة وحداثة معلومات حسابك",
          "الحفاظ على سرية كلمة المرور وعدم مشاركتها",
          "استخدام المنصة لأغراض قانونية فحسب",
          "عدم محاولة الوصول غير المصرح به لبيانات الآخرين",
          "تجنب الأنشطة التي قد تضر ببنية المنصة",
          "إدخال معلومات فواتير متوافقة مع قوانين الضرائب والمحاسبة التركية",
          "اتباع الإجراءات القانونية إذا كنت ملزماً بـ e-Fatura",
        ],
      },
      {
        title: "6. حقوق الملكية الفكرية",
        body:  "جميع الحقوق المتعلقة بمنصة Zyrix FinSuite محفوظة:",
        list:  [
          "برنامج المنصة وتصميمها ومحتواها ملك لـ Zyrix FinSuite",
          "يحصل المستخدمون على ترخيص استخدام محدود وغير قابل للتحويل",
          "يُحظر نسخ البرنامج أو إجراء هندسة عكسية",
          "بيانات المستخدم (الفواتير ومعلومات العملاء) ملك للمستخدم",
          "لا تُشارك بيانات المستخدم مع أطراف ثالثة لأغراض تجارية",
        ],
      },
      {
        title: "7. الخصوصية وأمان البيانات",
        body:  "تُنظَّم معالجة البيانات الشخصية في سياسة الخصوصية. المبادئ الأساسية:",
        list:  [
          "تُخزن بياناتك على خوادم آمنة في تركيا أو الاتحاد الأوروبي",
          "تشفير SSL/TLS 256-bit لجميع عمليات نقل البيانات",
          "معالجة البيانات وفق KVKK — لا تُباع بياناتك لأطراف ثالثة",
          "حذف دائم للبيانات خلال 30 يوماً من حذف الحساب",
          "الاحتفاظ ببيانات e-Fatura 10 سنوات بموجب الالتزام القانوني",
        ],
      },
      {
        title: "8. انقطاع الخدمة وتحديد المسؤولية",
        body:  "مستوى الخدمة والمسؤولية:",
        list:  [
          "الهدف: وقت تشغيل 99.9٪ للمنصة (SLA)",
          "إعلان الصيانة المجدولة قبل 48 ساعة",
          "لا مسؤولية في حالات القوة القاهرة",
          "لا تُقبل المسؤولية عن الأضرار غير المباشرة الناجمة عن انقطاع الخدمة",
          "الحد الأقصى للمسؤولية مقيّد برسوم الاشتراك الشهري لفترة الانقطاع",
          "Zyrix FinSuite غير مسؤولة عن التأخيرات الناجمة عن أنظمة GİB",
        ],
      },
      {
        title: "9. تعليق الحساب وإنهاؤه",
        body:  "الحالات التي قد يُعلَّق فيها حسابك أو يُنهى:",
        list:  [
          "عدم الوفاء بالتزامات الدفع (مهلة إشعار 7 أيام)",
          "انتهاك شروط الاستخدام",
          "الاستخدام المخالف للأنظمة القانونية",
          "الأنشطة التي تهدد أمان المنصة",
          "بطلب المستخدم — يُتاح الوصول للبيانات 30 يوماً",
        ],
      },
      {
        title: "10. أحكام التجارة الإلكترونية (القانون رقم 6563)",
        body:  "بموجب تشريعات التجارة الإلكترونية التركية:",
        list:  [
          "معلومات مزود الخدمة: Zyrix FinSuite، إسطنبول، تركيا",
          "التواصل: support@zyrix.co | +90 545 221 08 88",
          "السجل التجاري: [سيُحدَّث بعد التسجيل]",
          "الرقم الضريبي: [سيُحدَّث بعد التسجيل]",
          "للشكاوى: لجنة التحكيم الاستهلاكي",
        ],
      },
      {
        title: "11. أحكام تكميلية للمملكة العربية السعودية (CITC)",
        body:  "أحكام إضافية للمستخدمين من المملكة العربية السعودية:",
        list:  [
          "الخدمة متاحة للمستخدمين المقيمين في المملكة العربية السعودية",
          "تُعالج المدفوعات عبر مؤسسات دفع دولية",
          "التوافق مع فاتورة ZATCA قيد التقييم المنفصل — تواصل للحالة الراهنة",
          "يحكم القانون التركي النزاعات؛ تُقبل شكاوى CITC بشكل منفصل أيضاً",
        ],
      },
      {
        title: "12. القانون الحاكم والاختصاص القضائي",
        body:  "يخضع هذا العقد للقانون التركي. تختص محاكم إسطنبول ودوائر التنفيذ بالنزاعات. في نزاعات المستهلكين، تختص لجنة التحكيم الاستهلاكي أو محكمة المستهلك المعنية.",
      },
      {
        title: "13. تعديل الشروط",
        body:  "يجوز تحديث هذه الشروط. تُرسل إشعارات التغييرات إلى بريدك الإلكتروني المسجّل قبل 30 يوماً. يُعدّ الاستمرار في استخدام المنصة قبولاً للتغييرات.",
      },
    ],
  },
};

export default function TermsPage() {
  const locale  = useLocale();
  const isRTL   = locale === "ar";
  const content = CONTENT[locale as keyof typeof CONTENT] ?? CONTENT.tr;
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div style={{ minHeight:"100vh", background:"#F8FAFC", direction: isRTL?"rtl":"ltr" }}>

      {/* Hero */}
      <section style={{ background:"linear-gradient(160deg,#0F172A,#1E3A8A)", padding:"56px 24px 48px" }}>
        <div style={{ maxWidth:860, margin:"0 auto" }}>
          <span style={{ display:"inline-block", background:"rgba(255,255,255,.1)", color:"#93C5FD", fontSize:12, fontWeight:700, padding:"5px 14px", borderRadius:100, marginBottom:14 }}>
            {content.badge}
          </span>
          <h1 style={{ fontSize:"clamp(24px,4vw,38px)", fontWeight:900, color:"#fff", marginBottom:10 }}>
            {content.badge} — Zyrix FinSuite
          </h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,.5)" }}>{content.updated}</p>
          <p style={{ fontSize:15, color:"rgba(255,255,255,.75)", lineHeight:1.75, marginTop:10, maxWidth:700 }}>
            {content.intro}
          </p>

          {/* Law compliance badges */}
          <div style={{ display:"flex", gap:10, marginTop:18, flexWrap:"wrap" }}>
            {["TBK (6098)", "TTK (6102)", "E-Ticaret (6563)", "KVKK (6698)", "Mesafeli Sözleşme"].map(b=>(
              <span key={b} style={{ background:"rgba(255,255,255,.1)", border:"1px solid rgba(255,255,255,.2)", color:"#fff", fontSize:11, fontWeight:700, padding:"4px 12px", borderRadius:100 }}>{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section style={{ maxWidth:860, margin:"0 auto", padding:"48px 24px 64px" }}>

        {/* Quick nav */}
        <div style={{ background:"#fff", border:"1px solid #E5E7EB", borderRadius:14, padding:"16px 20px", marginBottom:32 }}>
          <div style={{ fontSize:12, fontWeight:700, color:GOLD, marginBottom:10, textTransform:"uppercase", letterSpacing:".5px" }}>
            {locale==="tr"?"İçindekiler":locale==="ar"?"المحتويات":"Contents"}
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
            {content.sections.map((s,i)=>(
              <button key={i} onClick={()=>{ setOpen(i); document.getElementById(`t${i}`)?.scrollIntoView({behavior:"smooth"}); }}
                style={{ fontSize:12, color:"#2563EB", background:"#EFF6FF", border:"none", padding:"4px 10px", borderRadius:7, cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>
                {s.title.split(".")[0]}.
              </button>
            ))}
          </div>
        </div>

        {/* Sections accordion */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {content.sections.map((s,i)=>(
            <div key={i} id={`t${i}`} style={{ background:"#fff", border:`1px solid ${open===i?"#2563EB":"#E5E7EB"}`, borderRadius:14, overflow:"hidden", transition:"border-color .2s" }}>
              <button onClick={()=>setOpen(open===i?null:i)}
                style={{ width:"100%", padding:"16px 20px", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontSize:15, fontWeight:700, color:"#0A0A0A", display:"flex", justifyContent:"space-between", alignItems:"center", textAlign: isRTL?"right":"left" }}>
                {s.title}
                <span style={{ fontSize:14, color: open===i?"#2563EB":"#9CA3AF", transform: open===i?"rotate(180deg)":"none", display:"inline-block", transition:"transform .25s", flexShrink:0 }}>▾</span>
              </button>
              {open===i && (
                <div style={{ padding:"0 20px 18px" }}>
                  <p style={{ fontSize:14, color:"#374151", lineHeight:1.75, marginBottom: s.list?"12px":"0" }}>{s.body}</p>
                  {s.list && (
                    <ul style={{ margin:"0 0 10px", padding: isRTL?"0 20px 0 0":"0 0 0 20px" }}>
                      {s.list.map((item,j)=>(
                        <li key={j} style={{ fontSize:13, color:"#374151", lineHeight:1.75, marginBottom:4 }}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {(s as any).footer && <p style={{ fontSize:13, color:"#2563EB", fontWeight:600, marginTop:8, padding:"8px 12px", background:"#EFF6FF", borderRadius:8 }}>{(s as any).footer}</p>}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Back links */}
        <div style={{ display:"flex", gap:14, marginTop:32, flexWrap:"wrap" }}>
          <Link href={`/${locale}`} style={{ color:"#2563EB", fontSize:13, fontWeight:700, textDecoration:"none" }}>
            ← {locale==="tr"?"Ana Sayfaya Dön":locale==="ar"?"العودة للرئيسية":"Back to Home"}
          </Link>
          <Link href={`/${locale}/privacy`} style={{ color:"#6B7280", fontSize:13, textDecoration:"none" }}>
            {locale==="tr"?"Gizlilik Politikası →":locale==="ar"?"سياسة الخصوصية →":"Privacy Policy →"}
          </Link>
        </div>
      </section>
    </div>
  );
}