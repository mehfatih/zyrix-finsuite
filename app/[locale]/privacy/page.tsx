"use client";

import { useLocale } from "next-intl";
import Link from "next/link";
import { useState } from "react";

const GOLD = "#B8892A";

/* ─────────────────────────────────────────────────────────────
   Zyrix FinSuite — Gizlilik Politikası / Privacy Policy
   Uyumluluk / Compliance:
   - KVKK (6698 sayılı Kişisel Verilerin Korunması Kanunu) — TR
   - GDPR (Article 13/14) — EN reference
   - PDPL (Personal Data Protection Law, KSA 2021) — AR supplement
   Son Güncelleme / Last Updated: Nisan 2026
───────────────────────────────────────────────────────────── */

const CONTENT = {
  tr: {
    badge:    "Gizlilik Politikası",
    updated:  "Son Güncelleme: Nisan 2026",
    intro:    "Zyrix FinSuite olarak kişisel verilerinizin korunmasına büyük önem veriyoruz. Bu politika, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamındaki yükümlülüklerimizi ve uygulamalarımızı açıklamaktadır.",
    sections: [
      {
        title: "1. Veri Sorumlusu",
        body:  "Veri sorumlusu sıfatıyla Zyrix FinSuite, kişisel verilerinizi bu politikada belirtilen amaçlar ve yöntemler doğrultusunda işlemektedir. İletişim: destek@zyrix.co",
      },
      {
        title: "2. Toplanan Kişisel Veriler",
        body:  "Platformumuzu kullanırken aşağıdaki kişisel veriler toplanabilir:",
        list:  [
          "Kimlik verileri: Ad, soyad, T.C. kimlik numarası (fatura için)",
          "İletişim verileri: E-posta adresi, telefon numarası",
          "Şirket verileri: Şirket adı, vergi numarası, adres",
          "Finansal veriler: Fatura bilgileri, ödeme geçmişi (kart numarası saklanmaz)",
          "Teknik veriler: IP adresi, tarayıcı bilgisi, kullanım logları",
          "Çerez verileri: Oturum ve tercih çerezleri",
        ],
      },
      {
        title: "3. Kişisel Verilerin İşlenme Amaçları (KVKK Md. 5-6)",
        body:  "Kişisel verileriniz aşağıdaki hukuki sebepler ve amaçlarla işlenmektedir:",
        list:  [
          "Sözleşmenin kurulması ve ifası: Hesap oluşturma, fatura gönderme, ödeme işlemleri",
          "Hukuki yükümlülük: GİB e-Fatura bildirimi, vergi mevzuatı gereklilikleri",
          "Meşru menfaat: Güvenlik, dolandırıcılık önleme, sistem iyileştirme",
          "Açık rıza: Pazarlama iletişimi, analitik raporlama (rızanız alınarak)",
        ],
      },
      {
        title: "4. Kişisel Verilerin Aktarımı (KVKK Md. 8-9)",
        body:  "Kişisel verileriniz aşağıdaki taraflara aktarılabilir:",
        list:  [
          "GİB (Gelir İdaresi Başkanlığı): e-Fatura yasal zorunluluğu kapsamında",
          "Ödeme kuruluşları: iyzico, PayTR, Param — ödeme işlemleri için",
          "Bulut altyapısı: Türkiye veya AB'de konuşlu sunucular (yeterli koruma garantili)",
          "Kanunen yetkili kamu kurumları: Yasal zorunluluk halinde",
          "Üçüncü ülkelere aktarım: Yalnızca KVKK Md. 9 kapsamında, Kurul izni veya açık rıza ile",
        ],
      },
      {
        title: "5. Veri Saklama Süreleri",
        body:  "Kişisel verileriniz aşağıdaki süreler boyunca saklanır:",
        list:  [
          "Fatura ve muhasebe kayıtları: 10 yıl (Türk Ticaret Kanunu ve Vergi mevzuatı)",
          "Hesap verileri: Hesap kapatmadan itibaren 3 yıl",
          "Teknik loglar: 2 yıl",
          "Pazarlama verileri: Rıza geri alımına kadar",
          "e-Fatura arşivi: 10 yıl (GİB zorunluluğu)",
        ],
      },
      {
        title: "6. KVKK Kapsamındaki Haklarınız (Md. 11)",
        body:  "KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:",
        list:  [
          "Kişisel verilerinizin işlenip işlenmediğini öğrenme",
          "İşlenmişse bilgi talep etme",
          "İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme",
          "Yurt içinde / yurt dışında aktarıldığı üçüncü kişileri bilme",
          "Eksik veya yanlış işlenmişse düzeltilmesini isteme",
          "KVKK Md. 7 çerçevesinde silinmesini veya yok edilmesini isteme",
          "Otomatik sistemler vasıtasıyla işlenen verilerin analizi nedeniyle aleyhe sonuç doğurmasına itiraz etme",
          "Kanuna aykırı işleme nedeniyle zarara uğramanız halinde tazminat talep etme",
        ],
        footer: "Haklarınızı kullanmak için: kvkk@zyrix.co adresine yazabilir veya WhatsApp üzerinden iletişime geçebilirsiniz. Başvurular en geç 30 gün içinde yanıtlanır.",
      },
      {
        title: "7. Çerez Politikası",
        body:  "Platformumuzda kullanılan çerez türleri:",
        list:  [
          "Zorunlu çerezler: Oturum yönetimi — rıza aranmaz",
          "Analitik çerezler: Google Analytics 4 — rızanızla kullanılır",
          "Pazarlama çerezleri: Meta Pixel — rızanızla kullanılır",
          "Tercih çerezleri: Dil ve tema ayarları",
        ],
        footer: "Çerezleri tarayıcı ayarlarından devre dışı bırakabilirsiniz.",
      },
      {
        title: "8. Veri Güvenliği",
        body:  "Kişisel verilerinizin korunması için alınan teknik ve idari tedbirler:",
        list:  [
          "SSL/TLS 256-bit şifreleme — tüm veri iletimlerinde",
          "AES-256 şifreleme — veritabanında bekleyen veriler için",
          "İki faktörlü kimlik doğrulama — yönetici erişimlerinde",
          "Erişim logları — tüm veri erişimleri kayıt altında",
          "Düzenli güvenlik testleri ve sızma testleri",
          "KVKK uyumlu veri işleme sözleşmeleri — tüm alt işleyicilerle",
        ],
      },
      {
        title: "9. Kişisel Veri İhlali Bildirimi",
        body:  "KVKK Md. 12/5 uyarınca: Kişisel veri ihlali tespit edilmesi halinde, ilgili kişilere ve Kişisel Verileri Koruma Kurulu'na (KVKK Kurulu) en geç 72 saat içinde bildirim yapılır.",
      },
      {
        title: "10. PDPL (Suudi Arabistan) Ek Hükümleri",
        body:  "Suudi Arabistan'daki kullanıcılar için — Kişisel Veri Koruma Kanunu (PDPL, 2021) kapsamındaki ek haklarınız:",
        list:  [
          "Verilerinize erişim ve düzeltme talep etme hakkı",
          "Belirli işlemler için işleme onayını geri alma hakkı",
          "Veri aktarımının PDPL Md. 29 gerekliliklerini karşıladığını talep etme",
          "Otomatik karar alma süreçlerine itiraz hakkı",
        ],
        footer: "PDPL başvuruları için: pdpl@zyrix.co",
      },
      {
        title: "11. Politika Değişiklikleri",
        body:  "Bu politika değiştirildiğinde, güncellenmiş versiyon bu sayfada yayınlanır ve kayıtlı e-posta adresinize bildirim gönderilir. Önemli değişiklikler için 30 gün önceden bildirim yapılır.",
      },
      {
        title: "12. İletişim ve Başvuru",
        body:  "Veri işleme faaliyetlerimiz hakkında soru ve başvurularınız için:",
        list:  [
          "E-posta: kvkk@zyrix.co",
          "WhatsApp: +90 545 221 08 88",
          "Posta: Zyrix FinSuite, İstanbul, Türkiye",
          "Kişisel Verileri Koruma Kurumu (KVKK): kvkk.gov.tr",
        ],
      },
    ],
  },

  en: {
    badge:    "Privacy Policy",
    updated:  "Last Updated: April 2026",
    intro:    "At Zyrix FinSuite, we are committed to protecting your personal data. This policy explains our obligations and practices under Turkey's Personal Data Protection Law (KVKK No. 6698), with supplementary provisions for Saudi Arabian users under PDPL (2021).",
    sections: [
      {
        title: "1. Data Controller",
        body:  "Zyrix FinSuite acts as the data controller and processes your personal data for the purposes and methods stated in this policy. Contact: support@zyrix.co",
      },
      {
        title: "2. Personal Data Collected",
        body:  "When using our platform, the following personal data may be collected:",
        list:  [
          "Identity data: Name, surname, national ID (for invoicing purposes)",
          "Contact data: Email address, phone number",
          "Company data: Company name, tax number, address",
          "Financial data: Invoice information, payment history (card numbers are not stored)",
          "Technical data: IP address, browser info, usage logs",
          "Cookie data: Session and preference cookies",
        ],
      },
      {
        title: "3. Legal Basis and Purposes of Processing (KVKK Art. 5-6)",
        body:  "Your personal data is processed on the following legal bases:",
        list:  [
          "Performance of contract: Account creation, invoice sending, payment processing",
          "Legal obligation: GİB e-Invoice reporting, tax law requirements",
          "Legitimate interest: Security, fraud prevention, system improvement",
          "Explicit consent: Marketing communications, analytics (with your consent)",
        ],
      },
      {
        title: "4. Data Transfers (KVKK Art. 8-9)",
        body:  "Your personal data may be transferred to:",
        list:  [
          "GİB (Turkish Revenue Administration): Required by e-Invoice law",
          "Payment institutions: iyzico, PayTR, Param — for payment processing",
          "Cloud infrastructure: Servers in Turkey or EU (with adequate protection guarantees)",
          "Legally authorized public institutions: When required by law",
          "Third countries: Only under KVKK Art. 9, with Board approval or explicit consent",
        ],
      },
      {
        title: "5. Data Retention Periods",
        body:  "Your personal data is retained for the following periods:",
        list:  [
          "Invoice and accounting records: 10 years (Turkish Commercial Code and Tax Law)",
          "Account data: 3 years after account closure",
          "Technical logs: 2 years",
          "Marketing data: Until consent is withdrawn",
          "e-Invoice archive: 10 years (GİB requirement)",
        ],
      },
      {
        title: "6. Your Rights Under KVKK (Art. 11)",
        body:  "Under Article 11 of KVKK, you have the following rights:",
        list:  [
          "To learn whether your personal data is processed",
          "To request information if processed",
          "To learn the purpose of processing and whether it is used accordingly",
          "To know third parties to whom data is transferred domestically/abroad",
          "To request correction of incomplete or incorrect data",
          "To request deletion or destruction under KVKK Art. 7",
          "To object to results arising from analysis of data processed via automated systems",
          "To claim compensation for damages due to unlawful processing",
        ],
        footer: "To exercise your rights: privacy@zyrix.co or via WhatsApp. Applications are answered within 30 days.",
      },
      {
        title: "7. Cookie Policy",
        body:  "Cookie types used on our platform:",
        list:  [
          "Essential cookies: Session management — no consent required",
          "Analytics cookies: Google Analytics 4 — used with your consent",
          "Marketing cookies: Meta Pixel — used with your consent",
          "Preference cookies: Language and theme settings",
        ],
        footer: "You can disable cookies in your browser settings.",
      },
      {
        title: "8. Data Security",
        body:  "Technical and administrative measures taken to protect your data:",
        list:  [
          "SSL/TLS 256-bit encryption — all data transmissions",
          "AES-256 encryption — data at rest in database",
          "Two-factor authentication — administrator access",
          "Access logs — all data access is recorded",
          "Regular security and penetration testing",
          "KVKK-compliant data processing agreements — with all sub-processors",
        ],
      },
      {
        title: "9. Data Breach Notification",
        body:  "Under KVKK Art. 12/5: In the event of a personal data breach, notification will be made to affected individuals and the Personal Data Protection Authority (KVKK Board) within 72 hours.",
      },
      {
        title: "10. PDPL (Saudi Arabia) Supplementary Provisions",
        body:  "For users in Saudi Arabia — additional rights under Personal Data Protection Law (PDPL, 2021):",
        list:  [
          "Right to access and correct your data",
          "Right to withdraw processing consent for certain operations",
          "Right to request that data transfers meet PDPL Art. 29 requirements",
          "Right to object to automated decision-making processes",
        ],
        footer: "For PDPL requests: pdpl@zyrix.co",
      },
      {
        title: "11. Policy Changes",
        body:  "When this policy is updated, the new version will be published on this page and a notification will be sent to your registered email. For significant changes, 30 days advance notice will be given.",
      },
      {
        title: "12. Contact",
        body:  "For questions about our data processing activities:",
        list:  [
          "Email: privacy@zyrix.co",
          "WhatsApp: +90 545 221 08 88",
          "Mail: Zyrix FinSuite, Istanbul, Turkey",
          "Personal Data Protection Authority: kvkk.gov.tr",
        ],
      },
    ],
  },

  ar: {
    badge:    "سياسة الخصوصية",
    updated:  "آخر تحديث: أبريل 2026",
    intro:    "في Zyrix FinSuite، نولي حماية بياناتك الشخصية أهمية قصوى. توضح هذه السياسة التزاماتنا بموجب قانون حماية البيانات الشخصية التركي (KVKK رقم 6698) مع أحكام تكميلية للمستخدمين في المملكة العربية السعودية بموجب نظام حماية البيانات الشخصية (PDPL 2021).",
    sections: [
      {
        title: "1. المتحكم في البيانات",
        body:  "تعمل Zyrix FinSuite بوصفها المتحكم في البيانات وتعالج بياناتك الشخصية وفق الأغراض والأساليب المبيّنة في هذه السياسة. التواصل: support@zyrix.co",
      },
      {
        title: "2. البيانات الشخصية المُجمَّعة",
        body:  "عند استخدام منصتنا، قد تُجمع البيانات الشخصية التالية:",
        list:  [
          "بيانات الهوية: الاسم الكامل، الرقم الوطني (لأغراض الفواتير)",
          "بيانات الاتصال: البريد الإلكتروني، رقم الهاتف",
          "بيانات الشركة: اسم الشركة، الرقم الضريبي، العنوان",
          "البيانات المالية: معلومات الفواتير، سجل المدفوعات (لا تُخزن أرقام البطاقات)",
          "البيانات التقنية: عنوان IP، معلومات المتصفح، سجلات الاستخدام",
          "بيانات ملفات تعريف الارتباط: جلسات العمل وتفضيلات المستخدم",
        ],
      },
      {
        title: "3. الأساس القانوني وأغراض المعالجة (KVKK المادة 5-6)",
        body:  "تُعالج بياناتك الشخصية على الأسس القانونية التالية:",
        list:  [
          "تنفيذ العقد: إنشاء الحساب، إرسال الفواتير، معالجة المدفوعات",
          "الالتزام القانوني: تقارير e-Fatura لـ GİB، متطلبات قانون الضرائب",
          "المصلحة المشروعة: الأمان، منع الاحتيال، تحسين النظام",
          "الموافقة الصريحة: التواصل التسويقي، التحليلات (بموافقتك)",
        ],
      },
      {
        title: "4. نقل البيانات (KVKK المادة 8-9)",
        body:  "قد تُنقل بياناتك الشخصية إلى:",
        list:  [
          "GİB (إدارة الإيرادات التركية): بموجب قانون e-Fatura الإلزامي",
          "مؤسسات الدفع: iyzico وPayTR وParam — لمعالجة المدفوعات",
          "البنية التحتية السحابية: خوادم في تركيا أو الاتحاد الأوروبي (بضمانات حماية كافية)",
          "الجهات الحكومية المخوّلة قانونياً: عند الضرورة القانونية",
          "الدول الثالثة: فقط وفق KVKK المادة 9، بموافقة الهيئة أو الموافقة الصريحة",
        ],
      },
      {
        title: "5. فترات الاحتفاظ بالبيانات",
        body:  "تُحتفظ بياناتك الشخصية للفترات التالية:",
        list:  [
          "سجلات الفواتير والمحاسبة: 10 سنوات (قانون التجارة التركي والضرائب)",
          "بيانات الحساب: 3 سنوات بعد إغلاق الحساب",
          "السجلات التقنية: سنتان",
          "بيانات التسويق: حتى سحب الموافقة",
          "أرشيف e-Fatura: 10 سنوات (اشتراط GİB)",
        ],
      },
      {
        title: "6. حقوقك بموجب KVKK (المادة 11)",
        body:  "بموجب المادة 11 من KVKK، تتمتع بالحقوق التالية:",
        list:  [
          "معرفة ما إذا كانت بياناتك الشخصية تُعالج",
          "طلب المعلومات في حال المعالجة",
          "معرفة غرض المعالجة ومدى الالتزام به",
          "معرفة الأطراف الثالثة التي نُقلت إليها البيانات محلياً أو خارجياً",
          "طلب تصحيح البيانات الناقصة أو غير الصحيحة",
          "طلب الحذف أو الإتلاف بموجب KVKK المادة 7",
          "الاعتراض على النتائج الناجمة عن المعالجة الآلية",
          "المطالبة بالتعويض عن الأضرار الناجمة عن المعالجة غير القانونية",
        ],
        footer: "لممارسة حقوقك: privacy@zyrix.co أو عبر واتساب. تُجاب الطلبات خلال 30 يوماً.",
      },
      {
        title: "7. سياسة ملفات تعريف الارتباط",
        body:  "أنواع ملفات تعريف الارتباط المستخدمة في منصتنا:",
        list:  [
          "ملفات ضرورية: إدارة الجلسات — لا تستلزم موافقة",
          "ملفات تحليلية: Google Analytics 4 — بموافقتك",
          "ملفات تسويقية: Meta Pixel — بموافقتك",
          "ملفات التفضيلات: إعدادات اللغة والمظهر",
        ],
        footer: "يمكنك تعطيل ملفات تعريف الارتباط من إعدادات المتصفح.",
      },
      {
        title: "8. أمان البيانات",
        body:  "التدابير التقنية والإدارية المتخذة لحماية بياناتك:",
        list:  [
          "تشفير SSL/TLS 256-bit — جميع عمليات نقل البيانات",
          "تشفير AES-256 — البيانات الساكنة في قاعدة البيانات",
          "المصادقة الثنائية — وصول المسؤولين",
          "سجلات الوصول — جميع عمليات الوصول للبيانات مسجّلة",
          "اختبارات أمنية دورية واختبارات اختراق",
          "اتفاقيات معالجة البيانات المتوافقة مع KVKK — مع جميع المعالجين الفرعيين",
        ],
      },
      {
        title: "9. الإشعار بانتهاكات البيانات",
        body:  "بموجب KVKK المادة 12/5: عند اكتشاف انتهاك لبيانات شخصية، يُبلَّغ المتأثرون وهيئة حماية البيانات الشخصية التركية خلال 72 ساعة.",
      },
      {
        title: "10. أحكام تكميلية بموجب PDPL (المملكة العربية السعودية)",
        body:  "للمستخدمين في المملكة العربية السعودية — حقوق إضافية بموجب نظام حماية البيانات الشخصية (PDPL 2021):",
        list:  [
          "حق الوصول إلى بياناتك وتصحيحها",
          "حق سحب موافقة المعالجة لعمليات معينة",
          "حق طلب التحقق من استيفاء نقل البيانات لمتطلبات PDPL المادة 29",
          "حق الاعتراض على عمليات اتخاذ القرار الآلي",
        ],
        footer: "لطلبات PDPL: pdpl@zyrix.co",
      },
      {
        title: "11. تغييرات السياسة",
        body:  "عند تحديث هذه السياسة، تُنشر النسخة الجديدة في هذه الصفحة وتُرسل إشعارات للبريد الإلكتروني المسجّل. للتغييرات الجوهرية، يُعطى إشعار مسبق قبل 30 يوماً.",
      },
      {
        title: "12. التواصل",
        body:  "للاستفسار عن أنشطة معالجة البيانات:",
        list:  [
          "البريد الإلكتروني: privacy@zyrix.co",
          "واتساب: +90 545 221 08 88",
          "البريد: Zyrix FinSuite, Istanbul, Turkey",
          "هيئة حماية البيانات التركية: kvkk.gov.tr",
        ],
      },
    ],
  },
};

export default function PrivacyPage() {
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

          {/* Compliance badges */}
          <div style={{ display:"flex", gap:10, marginTop:18, flexWrap:"wrap" }}>
            {["KVKK (6698)", "PDPL 2021", "SSL 256-bit", "ISO 27001 hedefli"].map(b=>(
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
              <button key={i} onClick={()=>{ setOpen(i); document.getElementById(`s${i}`)?.scrollIntoView({behavior:"smooth"}); }}
                style={{ fontSize:12, color:"#2563EB", background:"#EFF6FF", border:"none", padding:"4px 10px", borderRadius:7, cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>
                {s.title.split(".")[0]}.
              </button>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {content.sections.map((s,i)=>(
            <div key={i} id={`s${i}`} style={{ background:"#fff", border:`1px solid ${open===i?"#2563EB":"#E5E7EB"}`, borderRadius:14, overflow:"hidden", transition:"border-color .2s" }}>
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
                  {s.footer && <p style={{ fontSize:13, color:"#2563EB", fontWeight:600, marginTop:8, padding:"8px 12px", background:"#EFF6FF", borderRadius:8 }}>{s.footer}</p>}
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
          <Link href={`/${locale}/terms`} style={{ color:"#6B7280", fontSize:13, textDecoration:"none" }}>
            {locale==="tr"?"Kullanım Koşulları →":locale==="ar"?"شروط الاستخدام →":"Terms of Service →"}
          </Link>
        </div>
      </section>
    </div>
  );
}