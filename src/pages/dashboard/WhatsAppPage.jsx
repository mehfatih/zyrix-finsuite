// ============================================================
// Zyrix FinSuite - WhatsApp Page (extended, trilingual)
// 4 tabs: Messages | Send PDF | Bulk Campaign | Auto Reminders
// TR / EN / AR
// ============================================================

import React, { useState, useEffect } from "react";
import { useI18n } from "../../i18n/i18n";
import { whatsappAPI } from "../../services/api";

const COLORS = {
  primary: "#0891B2",
  accent: "#06B6D4",
  text: "#1E1B4B",
  muted: "#64748B",
  border: "#E2E8F8",
  bg: "#F8FAFC",
  whatsapp: "#25D366",
};

const TXT = {
  TR: {
    pageTitle: "WhatsApp Business",
    pageSubtitle: "Fatura gonderin, toplu kampanya yapin, otomatik hatirlatmalari yapilandirin.",
    tabMessages: "Mesajlar",
    tabPdf: "PDF Gonder",
    tabBulk: "Toplu Kampanya",
    tabReminders: "Oto. Hatirlatmalar",

    // Messages tab
    statTotal: "Toplam",
    statSent: "Gonderildi",
    statDelivered: "Teslim Edildi",
    statRead: "Okundu",
    statFailed: "Hata",
    filterAllStatuses: "Tum durumlar",
    btnRefresh: "Yenile",
    emptyMessages: "Henuz mesaj gonderilmedi.",
    colRecipient: "Alici",
    colType: "Tip",
    colMessage: "Mesaj",
    colStatus: "Durum",
    colSent: "Gonderim",
    statusPending: "Bekliyor",
    statusQueued: "Kuyrukta",
    statusSent: "Gonderildi",
    statusDelivered: "Teslim Edildi",
    statusReadLabel: "Okundu",
    statusFailed: "Hata",
    msgMedia: "📎 Medya",

    // Send PDF tab
    pdfTitle: "Faturayi PDF olarak gonder",
    pdfDesc: "Musteriye WhatsApp uzerinden PDF dokumani gonderir. Musteri WhatsApp icinde onizleyebilir, kaydedebilir ve iletebilir.",
    fldInvoiceId: "Fatura ID *",
    placeholderInvoiceId: "Fatura UUID",
    fldPdfUrl: "PDF URL *",
    placeholderPdfUrl: "https://...",
    fldRecipientPhone: "Alici Telefon (override)",
    placeholderRecipientPhone: "+90555... (varsayilan: fatura kontagi)",
    fldCaption: "Aciklama",
    placeholderCaption: "Faturaniz: #...",
    fldDocName: "Dosya Adi",
    placeholderDocName: "Fatura-XXX.pdf",
    btnSendPdf: "📄 PDF Gonder",
    errPdfRequired: "Fatura ID ve PDF URL zorunlu.",
    sendingLabel: "Gonderiliyor...",
    successSent: "✓ Basariyla gonderildi",
    msgIdLabel: "Mesaj ID:",
    statusLabel: "Durum:",
    pdfTipsTitle: "📄 PDF Gonderme Ipuclari",
    pdfTip1: "PDF URL public olarak erisilebilir olmali (auth gereken yer olmamali).",
    pdfTip2: "Maksimum dosya boyutu: 100 MB (Meta limiti).",
    pdfTip3: "Alici once isletmenize mesaj atmis olmali VEYA sablon mesaj kullanilmali.",
    pdfTip4: "Alici Telefon bos birakilirsa, faturanin musteri telefonu kullanilir.",

    // Bulk tab
    bulkTitle: "Toplu Kampanya",
    bulkDesc: "Ayni mesaji 100'e kadar numaraya gonderir. ~10 msg/sn hizinda.",
    fldRecipientsCount: "Aliclar ({n} gecerli)",
    placeholderRecipients: "Her satira bir numara veya virgulle ayirin:&#10;+905551234567&#10;+905559876543",
    fldCampaignName: "Kampanya Adi (opsiyonel)",
    placeholderCampaignName: "Q4 promosyon, yil sonu hatirlatmasi...",
    fldBodyText: "Mesaj Metni *",
    placeholderBodyText: "Merhaba, ozel bir teklif var...",
    btnSendBulk: "📢 Kampanya Gonder",
    errAtLeastOne: "En az bir telefon numarasi ekleyin.",
    errMaxRecipients: "Kampanya basina maksimum 100 alici.",
    errBodyRequired: "Mesaj metni zorunlu.",
    confirmBulk: '"{preview}..." mesajini {count} aliciya gonder? Toplu gonderimler saatlik kampanya limitinize sayilir (5/sa).',
    bulkResultsTitle: "Kampanya Sonuclari",
    bulkResultTotal: "Toplam",
    bulkResultSuccess: "Basarili",
    bulkResultFailed: "Hatali",
    bulkResultSentText: "✓ Gonderildi",
    bulkResultFailedText: "Hatali",
    bulkTipsTitle: "📢 Toplu Kampanya Ipuclari",
    bulkTip1: "Numaralar E.164 formatinda olmali (+90...).",
    bulkTip2: "Yinelenen numaralar otomatik kaldirilir.",
    bulkTip3: "Limit: saatte 5 kampanya, her birinde 100 alici.",
    bulkTip4: "Her mesaj WhatsApp ticaret politikasina uygun olmali.",
    bulkTip5: "Aliclar onay vermis OLMALI veya 24 saat icinde iletisime gecmis olmali.",

    // Reminders tab
    remindersHowTitle: "Oto. Hatirlatmalar Nasil Calisir",
    remindersHowDesc: "Oto. hatirlatmalar gunluk calisir ve fatura vade tarihlerine gore musterilere WhatsApp mesajlari gonderir. Her hatirlatma kademesi her fatura icin gunde bir kez tetiklenir.",
    tier7Before: "Vade Oncesi 7 Gun",
    tierOnDue: "Vade Tarihinde",
    tier3After: "3 Gun Geciktirilmis",
    tier7After: "7 Gun Geciktirilmis",
    tier14After: "14 Gun Geciktirilmis",
    tierLabelBefore: "Vade Oncesi",
    tierLabelOnDue: "Vade Gunu",
    tierLabelOverdue: "Vadesi Gecmis",
    multilingualNote: "Cok dilli:",
    multilingualText: "Hatirlatmalar hesap dilinizde gonderilir (TR/EN/AR), musteri adi, fatura numarasi, tutar ve vade tarihi korunur.",
    manualTitle: "Manuel Tetikleme",
    manualDesc: "Test veya yapilandirma degisikliklerinden sonra yetisme icin yararli. Cron her gun otomatik calisir.",
    btnRunNow: "▶ Simdi Calistir",
    runningLabel: "Calisiyor...",
    confirmRunReminders: "Hatirlatmalari simdi calistir? Vadesi yaklasan veya gecmis tum musterilere WhatsApp mesaji gonderilir.",
    runResultsTitle: "Calistirma Sonuclari",
    runStatInvoices: "Faturalar",
    runStatSent: "Gonderildi",
    runStatSkipped: "Atlandi",
    runStatFailed: "Hatali",
    byTierLabel: "Kademeye Gore",
  },

  EN: {
    pageTitle: "WhatsApp Business",
    pageSubtitle: "Send invoices, run bulk campaigns, and configure auto-reminders.",
    tabMessages: "Messages",
    tabPdf: "Send PDF",
    tabBulk: "Bulk Campaign",
    tabReminders: "Auto Reminders",

    statTotal: "Total",
    statSent: "Sent",
    statDelivered: "Delivered",
    statRead: "Read",
    statFailed: "Failed",
    filterAllStatuses: "All statuses",
    btnRefresh: "Refresh",
    emptyMessages: "No messages sent yet.",
    colRecipient: "Recipient",
    colType: "Type",
    colMessage: "Message",
    colStatus: "Status",
    colSent: "Sent",
    statusPending: "Pending",
    statusQueued: "Queued",
    statusSent: "Sent",
    statusDelivered: "Delivered",
    statusReadLabel: "Read",
    statusFailed: "Failed",
    msgMedia: "📎 Media",

    pdfTitle: "Send Invoice as PDF",
    pdfDesc: "Sends a PDF document to the customer's WhatsApp. The customer can preview, save, and forward it inside WhatsApp.",
    fldInvoiceId: "Invoice ID *",
    placeholderInvoiceId: "UUID of the invoice",
    fldPdfUrl: "PDF URL *",
    placeholderPdfUrl: "https://...",
    fldRecipientPhone: "Recipient Phone (override)",
    placeholderRecipientPhone: "+90555... (defaults to invoice contact)",
    fldCaption: "Caption",
    placeholderCaption: "Your invoice: #...",
    fldDocName: "Document Filename",
    placeholderDocName: "Invoice-XXX.pdf",
    btnSendPdf: "📄 Send PDF",
    errPdfRequired: "Invoice ID and PDF URL are required.",
    sendingLabel: "Sending...",
    successSent: "✓ Sent successfully",
    msgIdLabel: "Message ID:",
    statusLabel: "Status:",
    pdfTipsTitle: "📄 PDF Send Tips",
    pdfTip1: "The PDF URL must be publicly accessible (not behind auth).",
    pdfTip2: "Max file size: 100 MB (Meta limit).",
    pdfTip3: "The recipient must have messaged your business first OR the message must use a template.",
    pdfTip4: "If you leave Recipient Phone empty, the invoice's customerPhone will be used.",

    bulkTitle: "Bulk Campaign",
    bulkDesc: "Send the same message to up to 100 numbers. Throttled at ~10 msg/sec.",
    fldRecipientsCount: "Recipients ({n} valid)",
    placeholderRecipients: "One number per line, e.g.:&#10;+905551234567&#10;+905559876543",
    fldCampaignName: "Campaign Name (optional)",
    placeholderCampaignName: "Q4 promo, end-of-year reminder...",
    fldBodyText: "Message Body *",
    placeholderBodyText: "Hello, we have a special offer...",
    btnSendBulk: "📢 Send Campaign",
    errAtLeastOne: "Add at least one phone number.",
    errMaxRecipients: "Maximum 100 recipients per campaign.",
    errBodyRequired: "Message body is required.",
    confirmBulk: 'Send "{preview}..." to {count} recipients? Bulk sends count toward your hourly campaign limit (5/hr).',
    bulkResultsTitle: "Campaign Results",
    bulkResultTotal: "Total",
    bulkResultSuccess: "Successful",
    bulkResultFailed: "Failed",
    bulkResultSentText: "✓ Sent",
    bulkResultFailedText: "Failed",
    bulkTipsTitle: "📢 Bulk Campaign Tips",
    bulkTip1: "Numbers must be in E.164 format (+90...).",
    bulkTip2: "Duplicates are auto-removed.",
    bulkTip3: "Limit: 5 campaigns/hour, 100 recipients each.",
    bulkTip4: "Each message must comply with WhatsApp's commerce policy.",
    bulkTip5: "Recipients must have opted in OR initiated contact within 24h.",

    remindersHowTitle: "How Auto Reminders Work",
    remindersHowDesc: "Auto-reminders run daily and send WhatsApp messages to customers based on invoice due dates. Each reminder tier fires once per invoice per day.",
    tier7Before: "7 Days Before",
    tierOnDue: "On Due Date",
    tier3After: "3 Days Late",
    tier7After: "7 Days Late",
    tier14After: "14 Days Late",
    tierLabelBefore: "Before Due",
    tierLabelOnDue: "On Due",
    tierLabelOverdue: "Overdue",
    multilingualNote: "Multilingual:",
    multilingualText: "Reminders are sent in your account language (TR/EN/AR), preserving the customer's name, invoice number, amount, and due date.",
    manualTitle: "Manual Trigger",
    manualDesc: "Useful for testing or catching up after configuration changes. The cron runs automatically every day.",
    btnRunNow: "▶ Run Now",
    runningLabel: "Running...",
    confirmRunReminders: "Run reminders now? This sends WhatsApp messages to all customers with overdue or upcoming-due invoices.",
    runResultsTitle: "Run Results",
    runStatInvoices: "Invoices",
    runStatSent: "Sent",
    runStatSkipped: "Skipped",
    runStatFailed: "Failed",
    byTierLabel: "By Tier",
  },

  AR: {
    pageTitle: "WhatsApp للأعمال",
    pageSubtitle: "أرسل الفواتير، شغّل الحملات الجماعية، وقم بتكوين التذكيرات التلقائية.",
    tabMessages: "الرسائل",
    tabPdf: "إرسال PDF",
    tabBulk: "حملة جماعية",
    tabReminders: "تذكيرات تلقائية",

    statTotal: "الإجمالي",
    statSent: "مُرسلة",
    statDelivered: "مُسلَّمة",
    statRead: "مقروءة",
    statFailed: "فشل",
    filterAllStatuses: "جميع الحالات",
    btnRefresh: "تحديث",
    emptyMessages: "لم يتم إرسال أي رسائل بعد.",
    colRecipient: "المستلم",
    colType: "النوع",
    colMessage: "الرسالة",
    colStatus: "الحالة",
    colSent: "مُرسلة",
    statusPending: "قيد الانتظار",
    statusQueued: "في الطابور",
    statusSent: "مُرسلة",
    statusDelivered: "مُسلَّمة",
    statusReadLabel: "مقروءة",
    statusFailed: "فشل",
    msgMedia: "📎 وسائط",

    pdfTitle: "إرسال الفاتورة كـ PDF",
    pdfDesc: "يرسل ملف PDF إلى WhatsApp العميل. يمكن للعميل المعاينة والحفظ وإعادة التوجيه داخل WhatsApp.",
    fldInvoiceId: "معرّف الفاتورة *",
    placeholderInvoiceId: "UUID الفاتورة",
    fldPdfUrl: "رابط PDF *",
    placeholderPdfUrl: "https://...",
    fldRecipientPhone: "هاتف المستلم (تجاوز)",
    placeholderRecipientPhone: "+90555... (افتراضي: جهة اتصال الفاتورة)",
    fldCaption: "التعليق",
    placeholderCaption: "فاتورتك: #...",
    fldDocName: "اسم الملف",
    placeholderDocName: "Invoice-XXX.pdf",
    btnSendPdf: "📄 إرسال PDF",
    errPdfRequired: "معرّف الفاتورة ورابط PDF مطلوبان.",
    sendingLabel: "جاري الإرسال...",
    successSent: "✓ تم الإرسال بنجاح",
    msgIdLabel: "معرّف الرسالة:",
    statusLabel: "الحالة:",
    pdfTipsTitle: "📄 نصائح لإرسال PDF",
    pdfTip1: "يجب أن يكون رابط PDF متاحاً للعموم (بدون مصادقة).",
    pdfTip2: "الحجم الأقصى للملف: 100 ميجابايت (حد Meta).",
    pdfTip3: "يجب أن يكون المستلم قد راسل عملك أولاً أو يجب استخدام قالب رسالة.",
    pdfTip4: "إذا تركت هاتف المستلم فارغاً، سيتم استخدام customerPhone من الفاتورة.",

    bulkTitle: "حملة جماعية",
    bulkDesc: "أرسل نفس الرسالة إلى ما يصل إلى 100 رقم. بمعدل ~10 رسائل/ثانية.",
    fldRecipientsCount: "المستلمون ({n} صالح)",
    placeholderRecipients: "رقم واحد لكل سطر، على سبيل المثال:&#10;+905551234567&#10;+905559876543",
    fldCampaignName: "اسم الحملة (اختياري)",
    placeholderCampaignName: "ترويج الربع الرابع، تذكير نهاية العام...",
    fldBodyText: "نص الرسالة *",
    placeholderBodyText: "مرحباً، لدينا عرض خاص...",
    btnSendBulk: "📢 إرسال الحملة",
    errAtLeastOne: "أضف رقم هاتف واحد على الأقل.",
    errMaxRecipients: "الحد الأقصى 100 مستلم لكل حملة.",
    errBodyRequired: "نص الرسالة مطلوب.",
    confirmBulk: 'إرسال "{preview}..." إلى {count} مستلم؟ الإرسال الجماعي يحتسب ضمن حد الحملات بالساعة (5/ساعة).',
    bulkResultsTitle: "نتائج الحملة",
    bulkResultTotal: "الإجمالي",
    bulkResultSuccess: "ناجحة",
    bulkResultFailed: "فاشلة",
    bulkResultSentText: "✓ مُرسلة",
    bulkResultFailedText: "فشل",
    bulkTipsTitle: "📢 نصائح للحملات الجماعية",
    bulkTip1: "يجب أن تكون الأرقام بصيغة E.164 (+90...).",
    bulkTip2: "تتم إزالة المكررات تلقائياً.",
    bulkTip3: "الحد: 5 حملات/ساعة، 100 مستلم لكل واحدة.",
    bulkTip4: "كل رسالة يجب أن تتوافق مع سياسة WhatsApp التجارية.",
    bulkTip5: "يجب أن يكون المستلمون قد وافقوا أو بدأوا الاتصال خلال 24 ساعة.",

    remindersHowTitle: "كيف تعمل التذكيرات التلقائية",
    remindersHowDesc: "تعمل التذكيرات التلقائية يومياً وترسل رسائل WhatsApp إلى العملاء بناءً على تواريخ استحقاق الفواتير. كل مستوى تذكير يُطلق مرة واحدة لكل فاتورة يومياً.",
    tier7Before: "قبل الاستحقاق بـ 7 أيام",
    tierOnDue: "في تاريخ الاستحقاق",
    tier3After: "متأخر 3 أيام",
    tier7After: "متأخر 7 أيام",
    tier14After: "متأخر 14 يوماً",
    tierLabelBefore: "قبل الاستحقاق",
    tierLabelOnDue: "في الاستحقاق",
    tierLabelOverdue: "متأخر",
    multilingualNote: "متعدد اللغات:",
    multilingualText: "تُرسل التذكيرات بلغة حسابك (TR/EN/AR)، مع الحفاظ على اسم العميل ورقم الفاتورة والمبلغ وتاريخ الاستحقاق.",
    manualTitle: "تشغيل يدوي",
    manualDesc: "مفيد للاختبار أو اللحاق بعد تغييرات التكوين. يعمل cron تلقائياً كل يوم.",
    btnRunNow: "▶ شغّل الآن",
    runningLabel: "قيد التشغيل...",
    confirmRunReminders: "تشغيل التذكيرات الآن؟ سيرسل رسائل WhatsApp لجميع العملاء الذين لديهم فواتير متأخرة أو قريبة الاستحقاق.",
    runResultsTitle: "نتائج التشغيل",
    runStatInvoices: "الفواتير",
    runStatSent: "مُرسلة",
    runStatSkipped: "مُتجاوزة",
    runStatFailed: "فاشلة",
    byTierLabel: "حسب المستوى",
  },
};

const STATUS_KEYS = {
  PENDING:   { key: "statusPending",   color: "#94A3B8", bg: "#F1F5F9" },
  QUEUED:    { key: "statusQueued",    color: "#0EA5E9", bg: "#E0F2FE" },
  SENT:      { key: "statusSent",      color: "#6366F1", bg: "#E0E7FF" },
  DELIVERED: { key: "statusDelivered", color: "#10B981", bg: "#D1FAE5" },
  READ:      { key: "statusReadLabel", color: "#10B981", bg: "#D1FAE5" },
  FAILED:    { key: "statusFailed",    color: "#EF4444", bg: "#FEE2E2" },
};

// ============================================================
// MAIN
// ============================================================

export default function WhatsAppPage() {
  const { lang } = useI18n();
  const t = TXT[lang] || TXT.TR;
  const [tab, setTab] = useState("messages");

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: COLORS.text }}>
          💬 {t.pageTitle}
        </h1>
        <p style={{ margin: "4px 0 0", color: COLORS.muted, fontSize: 13 }}>{t.pageSubtitle}</p>
      </div>

      <div style={{ display: "flex", gap: 4, borderBottom: `1.5px solid ${COLORS.border}`, marginBottom: 24, flexWrap: "wrap" }}>
        <TabBtn active={tab === "messages"}  onClick={() => setTab("messages")}>📋 {t.tabMessages}</TabBtn>
        <TabBtn active={tab === "pdf"}       onClick={() => setTab("pdf")}>📄 {t.tabPdf}</TabBtn>
        <TabBtn active={tab === "bulk"}      onClick={() => setTab("bulk")}>📢 {t.tabBulk}</TabBtn>
        <TabBtn active={tab === "reminders"} onClick={() => setTab("reminders")}>⏰ {t.tabReminders}</TabBtn>
      </div>

      {tab === "messages"  && <MessagesTab t={t} />}
      {tab === "pdf"       && <SendPdfTab t={t} />}
      {tab === "bulk"      && <BulkTab t={t} />}
      {tab === "reminders" && <RemindersTab t={t} />}
    </div>
  );
}

// ============================================================
// MESSAGES TAB
// ============================================================

function MessagesTab({ t }) {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (statusFilter) params.status = statusFilter;
      const r = await whatsappAPI.list(params);
      setRows(r?.data?.rows || []);
      setTotal(r?.data?.total || 0);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  if (loading) return <Loading />;
  if (error) return <ErrorBox>{error}</ErrorBox>;

  const sent = rows.filter((r) => r.status === "SENT").length;
  const delivered = rows.filter((r) => r.status === "DELIVERED" || r.status === "READ").length;
  const read = rows.filter((r) => r.status === "READ").length;
  const failed = rows.filter((r) => r.status === "FAILED").length;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
        <StatCard label={t.statTotal} value={total} />
        <StatCard label={t.statSent} value={sent} color={COLORS.primary} />
        <StatCard label={t.statDelivered} value={delivered} color="#10B981" />
        <StatCard label={t.statRead} value={read} color="#10B981" />
        <StatCard label={t.statFailed} value={failed} color={failed > 0 ? "#EF4444" : COLORS.muted} />
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ ...inp, width: "auto", padding: "8px 12px" }}
        >
          <option value="">{t.filterAllStatuses}</option>
          {Object.entries(STATUS_KEYS).map(([s, info]) => (
            <option key={s} value={s}>{t[info.key]}</option>
          ))}
        </select>
        <button onClick={load} style={btnSm}>🔄 {t.btnRefresh}</button>
      </div>

      {rows.length === 0 ? (
        <EmptyState>{t.emptyMessages}</EmptyState>
      ) : (
        <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: COLORS.bg }}>
              <tr>
                <Th>{t.colRecipient}</Th>
                <Th>{t.colType}</Th>
                <Th>{t.colMessage}</Th>
                <Th>{t.colStatus}</Th>
                <Th>{t.colSent}</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const st = STATUS_KEYS[r.status] || STATUS_KEYS.PENDING;
                return (
                  <tr key={r.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                    <Td><span style={{ fontFamily: "monospace", fontSize: 12 }}>{r.recipientPhone}</span></Td>
                    <Td><span style={{ fontSize: 11, color: COLORS.muted, textTransform: "uppercase" }}>{r.messageType}</span></Td>
                    <Td>
                      <div style={{ maxWidth: 320, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: 12 }}>
                        {r.bodyText || (r.mediaUrl ? t.msgMedia : "—")}
                      </div>
                    </Td>
                    <Td>
                      <span style={{ background: st.bg, color: st.color, padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                        {t[st.key]}
                      </span>
                    </Td>
                    <Td><span style={{ fontSize: 11, color: COLORS.muted }}>{new Date(r.createdAt).toLocaleString()}</span></Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================
// SEND PDF TAB
// ============================================================

function SendPdfTab({ t }) {
  const [invoiceId, setInvoiceId] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const submit = async () => {
    setError(null);
    setResult(null);
    if (!invoiceId || !pdfUrl) {
      setError(t.errPdfRequired);
      return;
    }
    setSubmitting(true);
    try {
      const r = await whatsappAPI.sendPdf(invoiceId, {
        recipientPhone: recipientPhone || undefined,
        pdfUrl,
        caption: caption || undefined,
        documentName: documentName || undefined,
      });
      setResult(r?.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      <div>
        <h3 style={{ margin: "0 0 6px", fontSize: 16, color: COLORS.text }}>{t.pdfTitle}</h3>
        <p style={{ margin: "0 0 16px", fontSize: 12, color: COLORS.muted }}>{t.pdfDesc}</p>

        <Field label={t.fldInvoiceId}>
          <input value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)} style={inp} placeholder={t.placeholderInvoiceId} />
        </Field>
        <Field label={t.fldPdfUrl}>
          <input value={pdfUrl} onChange={(e) => setPdfUrl(e.target.value)} style={inp} placeholder={t.placeholderPdfUrl} />
        </Field>
        <Field label={t.fldRecipientPhone}>
          <input value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} style={inp} placeholder={t.placeholderRecipientPhone} />
        </Field>
        <Field label={t.fldCaption}>
          <input value={caption} onChange={(e) => setCaption(e.target.value)} style={inp} placeholder={t.placeholderCaption} />
        </Field>
        <Field label={t.fldDocName}>
          <input value={documentName} onChange={(e) => setDocumentName(e.target.value)} style={inp} placeholder={t.placeholderDocName} />
        </Field>

        <button onClick={submit} disabled={submitting} style={{ ...btnPrimary, opacity: submitting ? 0.6 : 1, marginTop: 12 }}>
          {submitting ? t.sendingLabel : t.btnSendPdf}
        </button>
      </div>

      <div>
        {error && <ErrorBox>{error}</ErrorBox>}
        {result && (
          <div style={{ background: "#D1FAE5", color: "#065F46", padding: 16, borderRadius: 12 }}>
            <strong>{t.successSent}</strong>
            <div style={{ fontSize: 12, marginTop: 8, fontFamily: "monospace" }}>
              {t.msgIdLabel} {result.providerMessageId || result.id}
            </div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              {t.statusLabel} {result.status}
            </div>
          </div>
        )}
        {!error && !result && (
          <div style={{ padding: 20, background: COLORS.bg, borderRadius: 12, border: `1px dashed ${COLORS.border}` }}>
            <strong style={{ fontSize: 13, color: COLORS.text }}>{t.pdfTipsTitle}</strong>
            <ul style={{ fontSize: 12, color: COLORS.muted, marginTop: 8, paddingLeft: 18, lineHeight: 1.7 }}>
              <li>{t.pdfTip1}</li>
              <li>{t.pdfTip2}</li>
              <li>{t.pdfTip3}</li>
              <li>{t.pdfTip4}</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// BULK CAMPAIGN TAB
// ============================================================

function BulkTab({ t }) {
  const [recipientsRaw, setRecipientsRaw] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const recipients = recipientsRaw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 8);

  const submit = async () => {
    setError(null);
    setResult(null);
    if (recipients.length === 0) { setError(t.errAtLeastOne); return; }
    if (recipients.length > 100) { setError(t.errMaxRecipients); return; }
    if (!bodyText.trim()) { setError(t.errBodyRequired); return; }

    const preview = bodyText.substring(0, 50);
    const confirmMsg = t.confirmBulk
      .replace("{preview}", preview)
      .replace("{count}", recipients.length);
    if (!confirm(confirmMsg)) return;

    setSubmitting(true);
    try {
      const r = await whatsappAPI.bulkSend({ recipients, bodyText, campaignName: campaignName || undefined });
      setResult(r?.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      <div>
        <h3 style={{ margin: "0 0 6px", fontSize: 16, color: COLORS.text }}>{t.bulkTitle}</h3>
        <p style={{ margin: "0 0 16px", fontSize: 12, color: COLORS.muted }}>{t.bulkDesc}</p>

        <Field label={t.fldRecipientsCount.replace("{n}", recipients.length)}>
          <textarea
            value={recipientsRaw}
            onChange={(e) => setRecipientsRaw(e.target.value)}
            style={{ ...inp, minHeight: 120, fontFamily: "monospace", fontSize: 12 }}
            placeholder={t.placeholderRecipients.replace(/&#10;/g, "\n")}
          />
        </Field>

        <Field label={t.fldCampaignName}>
          <input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} style={inp} placeholder={t.placeholderCampaignName} />
        </Field>

        <Field label={t.fldBodyText}>
          <textarea
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            style={{ ...inp, minHeight: 100 }}
            placeholder={t.placeholderBodyText}
            maxLength={4000}
          />
          <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4, textAlign: "right" }}>
            {bodyText.length} / 4000
          </div>
        </Field>

        <button onClick={submit} disabled={submitting} style={{ ...btnPrimary, opacity: submitting ? 0.6 : 1, marginTop: 12 }}>
          {submitting ? t.sendingLabel : t.btnSendBulk}
        </button>
      </div>

      <div>
        {error && <ErrorBox>{error}</ErrorBox>}
        {result && (
          <div>
            <div style={{ background: COLORS.bg, padding: 16, borderRadius: 12, marginBottom: 12 }}>
              <strong style={{ fontSize: 13, color: COLORS.text }}>{t.bulkResultsTitle}</strong>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: COLORS.muted }}>{t.bulkResultTotal}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.text }}>{result.total}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: COLORS.muted }}>{t.bulkResultSuccess}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#10B981" }}>{result.successful}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: COLORS.muted }}>{t.bulkResultFailed}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: result.failed > 0 ? "#EF4444" : COLORS.muted }}>{result.failed}</div>
                </div>
              </div>
            </div>
            {result.results && result.results.length > 0 && (
              <div style={{ background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 10, maxHeight: 300, overflow: "auto" }}>
                {result.results.map((r, i) => (
                  <div key={i} style={{
                    padding: "8px 12px",
                    borderBottom: i < result.results.length - 1 ? `1px solid ${COLORS.border}` : "none",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <span style={{ fontFamily: "monospace", fontSize: 12 }}>{r.phone}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: r.success ? "#065F46" : "#991B1B" }}>
                      {r.success ? t.bulkResultSentText : "✗ " + (r.error || t.bulkResultFailedText)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {!error && !result && (
          <div style={{ padding: 20, background: COLORS.bg, borderRadius: 12, border: `1px dashed ${COLORS.border}` }}>
            <strong style={{ fontSize: 13, color: COLORS.text }}>{t.bulkTipsTitle}</strong>
            <ul style={{ fontSize: 12, color: COLORS.muted, marginTop: 8, paddingLeft: 18, lineHeight: 1.7 }}>
              <li>{t.bulkTip1}</li>
              <li>{t.bulkTip2}</li>
              <li>{t.bulkTip3}</li>
              <li>{t.bulkTip4}</li>
              <li>{t.bulkTip5}</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// AUTO REMINDERS TAB
// ============================================================

function RemindersTab({ t }) {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const run = async () => {
    if (!confirm(t.confirmRunReminders)) return;
    setError(null);
    setResult(null);
    setRunning(true);
    try {
      const r = await whatsappAPI.runReminders();
      setResult(r?.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div>
      <div style={{ background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 24 }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 16, color: COLORS.text }}>{t.remindersHowTitle}</h3>
        <p style={{ margin: "0 0 12px", fontSize: 13, color: COLORS.muted, lineHeight: 1.6 }}>
          {t.remindersHowDesc}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 16 }}>
          <ReminderTier t={t} label={t.tier7Before} kind="before" color="#10B981" />
          <ReminderTier t={t} label={t.tierOnDue}   kind="onDue"  color="#F59E0B" />
          <ReminderTier t={t} label={t.tier3After}  kind="overdue" color="#F97316" />
          <ReminderTier t={t} label={t.tier7After}  kind="overdue" color="#EF4444" />
          <ReminderTier t={t} label={t.tier14After} kind="overdue" color="#991B1B" />
        </div>

        <div style={{ background: COLORS.bg, padding: 14, borderRadius: 10, marginTop: 20, fontSize: 12, color: COLORS.muted }}>
          <strong style={{ color: COLORS.text }}>{t.multilingualNote}</strong> {t.multilingualText}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, padding: 20, background: COLORS.bg, borderRadius: 14 }}>
        <div>
          <strong style={{ fontSize: 15, color: COLORS.text }}>{t.manualTitle}</strong>
          <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>{t.manualDesc}</div>
        </div>
        <button onClick={run} disabled={running} style={{ ...btnPrimary, opacity: running ? 0.6 : 1, whiteSpace: "nowrap" }}>
          {running ? t.runningLabel : t.btnRunNow}
        </button>
      </div>

      {error && <div style={{ marginTop: 16 }}><ErrorBox>{error}</ErrorBox></div>}
      {result && (
        <div style={{ marginTop: 16, background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20 }}>
          <strong style={{ fontSize: 14, color: COLORS.text }}>{t.runResultsTitle}</strong>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 14 }}>
            <SmallStat label={t.runStatInvoices} value={result.invoicesProcessed} />
            <SmallStat label={t.runStatSent} value={result.remindersSent} color="#10B981" />
            <SmallStat label={t.runStatSkipped} value={result.remindersSkipped} />
            <SmallStat label={t.runStatFailed} value={result.remindersFailed} color={result.remindersFailed > 0 ? "#EF4444" : COLORS.muted} />
          </div>
          {result.byTier && (
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>{t.byTierLabel}</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {Object.entries(result.byTier).map(([tier, count]) => (
                  <div key={tier} style={{ background: COLORS.bg, padding: "6px 12px", borderRadius: 8, fontSize: 11 }}>
                    <span style={{ color: COLORS.muted }}>{tier}: </span>
                    <strong style={{ color: COLORS.text }}>{count}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReminderTier({ t, label, kind, color }) {
  const tierLabel = kind === "before" ? t.tierLabelBefore : kind === "onDue" ? t.tierLabelOnDue : t.tierLabelOverdue;
  return (
    <div style={{ background: COLORS.bg, padding: 12, borderRadius: 10, borderLeft: `3px solid ${color}` }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: color, textTransform: "uppercase" }}>{tierLabel}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, marginTop: 4 }}>{label}</div>
    </div>
  );
}

function SmallStat({ label, value, color }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: COLORS.muted, fontWeight: 600, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: color || COLORS.text, marginTop: 2 }}>{value}</div>
    </div>
  );
}

// ============================================================
// SHARED COMPONENTS
// ============================================================

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "transparent", border: "none", padding: "10px 18px",
        fontSize: 13, fontWeight: active ? 700 : 500,
        color: active ? COLORS.primary : COLORS.muted,
        borderBottom: active ? `2px solid ${COLORS.primary}` : "2px solid transparent",
        cursor: "pointer", marginBottom: -1.5,
      }}
    >
      {children}
    </button>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 14 }}>
      <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 600, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: color || COLORS.text, marginTop: 4 }}>{value}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: COLORS.text, marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}

function Th({ children }) {
  return <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 700, color: COLORS.muted, textAlign: "left", textTransform: "uppercase" }}>{children}</th>;
}

function Td({ children }) {
  return <td style={{ padding: "12px 14px", fontSize: 13, color: COLORS.text }}>{children}</td>;
}

function Loading() {
  return <div style={{ padding: 40, textAlign: "center", color: COLORS.muted }}>...</div>;
}

function ErrorBox({ children }) {
  return <div style={{ padding: 14, background: "#FEE2E2", color: "#991B1B", borderRadius: 10, marginBottom: 16 }}>{children}</div>;
}

function EmptyState({ children }) {
  return (
    <div style={{ padding: 40, textAlign: "center", color: COLORS.muted, background: "#fff", borderRadius: 12, border: `1px dashed ${COLORS.border}` }}>
      {children}
    </div>
  );
}

const inp = {
  width: "100%", padding: "10px 12px", borderRadius: 8,
  border: `1.5px solid ${COLORS.border}`, fontSize: 13, outline: "none",
  fontFamily: "inherit", resize: "vertical",
};

const btnPrimary = {
  background: COLORS.primary, color: "#fff", border: "none",
  borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer",
};

const btnSm = {
  background: "transparent", color: COLORS.text, border: `1px solid ${COLORS.border}`,
  borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer",
};
