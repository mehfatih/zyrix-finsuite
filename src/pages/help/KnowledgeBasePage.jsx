// ================================================================
// /help — Searchable knowledge base with category filters.
// Static article seeds; designed for /api/help/articles when ready.
// ================================================================
import React, { useMemo, useState } from "react";
import { useI18n } from "../../i18n/i18n";
import { useDashboardI18n } from "../../i18n/dashboard";
import { getBrandPalette, getReportsPalette, getAIPalette, getCustomerPalette, getMoneyPalette, getMarketPalette, getSuccessPalette, getAlertPalette } from "../../utils/dashboardPalette";

const ARTICLES = {
  TR: [
    { id: "start-1",   cat: "gettingStarted", title: "Zyrix'e ilk girişte yapılacak 5 adım",          body: "Hesabını açtıktan sonra: 1) Onboarding sihirbazını tamamla, 2) En az bir banka bağla, 3) Logo ve VKN'ni gir, 4) İlk müşteriyi ekle, 5) İlk faturayı oluştur. Tüm bunları 5 dakikada bitirebilirsin." },
    { id: "start-2",   cat: "gettingStarted", title: "Klavye kısayollarına alış",                     body: "G + I → Faturalar, G + D → Dashboard. Tam liste /help/shortcuts'ta." },
    { id: "inv-1",     cat: "invoicing",      title: "İlk faturanı 30 saniyede oluştur",              body: "AI Fatura Otopilotu sayfasında ses, metin veya fotoğrafla başlatabilirsin. AI tüm alanları doldurur, sen onaylarsın." },
    { id: "inv-2",     cat: "invoicing",      title: "Fatura PDF'ini indirmek",                       body: "Fatura detayında 'PDF İndir' butonuna bas. Marka logosun ve VKN'in otomatik gelir." },
    { id: "inv-3",     cat: "invoicing",      title: "Tekrarlayan fatura kurmak",                     body: "Faturalar → Otomatik Faturalar → + Yeni. Müşteriyi seç, periyodu seç (haftalık/aylık), kaydet." },
    { id: "tax-1",     cat: "tax",            title: "KDV otomatik hesaplaması nasıl çalışır?",       body: "Fatura kalemlerine KDV oranını seç → Zyrix toplamı, KDV'yi ve genel toplamı anlık hesaplar. Aylık beyanname için Vergi → KDV Raporu'nu aç." },
    { id: "tax-2",     cat: "tax",            title: "e-Fatura GİB'e nasıl gönderilir?",              body: "Faturayı kaydettikten sonra 'GİB'e Gönder' butonuna bas. e-Fatura/e-Arşiv otomatik karar verilir." },
    { id: "bank-1",    cat: "banks",          title: "Bankamı nasıl bağlarım?",                       body: "Onboarding sırasında veya Hesap → Ayarlar → Bankalar yolundan. 17 banka destekleniyor — Açık Bankacılık (BDDK) sadece okuma." },
    { id: "bank-2",    cat: "banks",          title: "Çek ve senet takibi",                           body: "Sol menü → Çek & Senet. Verilen, alınan, vadesi gelen ve tahsil edilen statüleri ayrı ayrı takip edebilirsin." },
    { id: "ai-1",      cat: "ai",             title: "AI özelliklerinin tam listesi (78)",            body: "Kategoriler: Otopilotlar (7), Hidden Cash (6), Predictive (7), Cognitive (8), Voice & CX (8), Ecosystem (10). Her birinin kendi kullanım kılavuzu /help'te." },
    { id: "ai-2",      cat: "ai",             title: "Customer DNA nasıl çalışır?",                   body: "Geçmiş 6 ayın faturaları + ödeme paternleri + iletişim sıklığı analiz edilerek müşterinin kişilik tipi (Analytical / Premium / Friendly / Skeptical / New) belirlenir." },
    { id: "ai-3",      cat: "ai",             title: "Hidden Cash ne kadar para bulur?",              body: "Ortalama bir işletmede yıllık 8-15K TL kayıp tespit edilir: cash discount kayıpları, double-paid invoices, vendor billing errors, unbilled work, expired credits." },
    { id: "billing-1", cat: "billing",        title: "Aboneliği yükseltmek",                          body: "Profil → Abonelik → Yükselt. Tier'lar: Lite, Pro, Business, Enterprise. Co-Founder + AR + Twin Enterprise'da." },
    { id: "billing-2", cat: "billing",        title: "Fatura ve ödeme geçmişi",                       body: "Profil → Abonelik → Faturalar. Yıllık öderken %20 indirim aktif olur." },
    { id: "trouble-1", cat: "troubleshoot",   title: "Sayfa yavaş yükleniyor",                        body: "Tarayıcı önbelleğini temizle (Ctrl+Shift+R). Sorun devam ederse sağ alt sohbet bot'una yaz." },
    { id: "trouble-2", cat: "troubleshoot",   title: "Sesli komut tanınmıyor",                        body: "Chrome veya Edge kullan (Safari sınırlı). Mikrofon iznini kontrol et. Türkçe için en az 8 karakter konuş." },
  ],
  EN: [
    { id: "start-1",   cat: "gettingStarted", title: "5 things to do on your first Zyrix login",      body: "After signup: 1) Complete onboarding wizard, 2) Connect at least one bank, 3) Add your logo + tax ID, 4) Add your first customer, 5) Create your first invoice. All in under 5 minutes." },
    { id: "start-2",   cat: "gettingStarted", title: "Learn the keyboard shortcuts",                  body: "G + I → Invoices, G + D → Dashboard. Full list at /help/shortcuts." },
    { id: "inv-1",     cat: "invoicing",      title: "Create your first invoice in 30 seconds",       body: "Open AI Invoice Autopilot. Use voice, text, or photo to start. AI fills all fields — you confirm." },
    { id: "inv-2",     cat: "invoicing",      title: "Download invoice PDF",                          body: "On the invoice detail, tap 'Download PDF'. Your brand logo + tax ID render automatically." },
    { id: "inv-3",     cat: "invoicing",      title: "Set up recurring invoices",                     body: "Invoices → Recurring → + New. Pick customer, frequency (weekly/monthly), save." },
    { id: "tax-1",     cat: "tax",            title: "How does VAT auto-calc work?",                  body: "Pick the VAT rate per invoice line → Zyrix calculates subtotal, VAT, and total live. For your monthly declaration, open Tax → VAT Report." },
    { id: "tax-2",     cat: "tax",            title: "How to submit e-Fatura to GİB",                 body: "After saving the invoice, tap 'Submit to GİB'. e-Fatura / e-Arşiv routing is automatic." },
    { id: "bank-1",    cat: "banks",          title: "How do I connect my bank?",                     body: "During onboarding or via Account → Settings → Banks. 17 banks supported. Open Banking (BDDK) is read-only." },
    { id: "bank-2",    cat: "banks",          title: "Tracking cheques",                              body: "Sidebar → Cheques. Issued, received, due, and collected status are tracked separately." },
    { id: "ai-1",      cat: "ai",             title: "Full list of AI features (78)",                 body: "Categories: Autopilots (7), Hidden Cash (6), Predictive (7), Cognitive (8), Voice & CX (8), Ecosystem (10). Each has its own guide in /help." },
    { id: "ai-2",      cat: "ai",             title: "How does Customer DNA work?",                   body: "We analyze the last 6 months of invoices + payment patterns + contact frequency to assign each customer a personality (Analytical / Premium / Friendly / Skeptical / New)." },
    { id: "ai-3",      cat: "ai",             title: "How much does Hidden Cash typically find?",     body: "An average business uncovers ₺8K-₺15K/year: missed cash discounts, double-paid invoices, vendor billing errors, unbilled work, expired credits." },
    { id: "billing-1", cat: "billing",        title: "Upgrade your subscription",                     body: "Profile → Subscription → Upgrade. Tiers: Lite, Pro, Business, Enterprise. Co-Founder + AR + Twin require Enterprise." },
    { id: "billing-2", cat: "billing",        title: "Invoice + payment history",                     body: "Profile → Subscription → Invoices. 20% off when paying annually." },
    { id: "trouble-1", cat: "troubleshoot",   title: "Page loads slowly",                             body: "Clear browser cache (Ctrl+Shift+R). If still slow, ping the chat bot bottom-right." },
    { id: "trouble-2", cat: "troubleshoot",   title: "Voice command isn't recognized",                body: "Use Chrome or Edge (Safari is limited). Check mic permission. Speak at least 8 characters." },
  ],
  AR: [
    { id: "start-1",   cat: "gettingStarted", title: "5 خطوات عند أول دخول لـ Zyrix",                  body: "بعد التسجيل: 1) أكمل معالج الإعداد، 2) اربط بنكاً واحداً على الأقل، 3) أضف الشعار والرقم الضريبي، 4) أضف أول عميل، 5) أنشئ أول فاتورة. كل ذلك في أقل من 5 دقائق." },
    { id: "inv-1",     cat: "invoicing",      title: "أنشئ أول فاتورة في 30 ثانية",                    body: "افتح Autopilot الفواتير AI. استخدم الصوت أو النص أو الصورة. AI يملأ كل الحقول، وأنت تؤكد." },
    { id: "tax-1",     cat: "tax",            title: "كيف يعمل حساب KDV التلقائي؟",                    body: "اختر نسبة الضريبة لكل بند → Zyrix يحسب المجموع و KDV والإجمالي مباشرة. للإقرار الشهري افتح الضريبة → تقرير KDV." },
    { id: "bank-1",    cat: "banks",          title: "كيف أربط بنكي؟",                                  body: "أثناء الإعداد أو عبر الحساب → الإعدادات → البنوك. 17 بنكاً مدعوم. Open Banking (BDDK) للقراءة فقط." },
    { id: "ai-1",      cat: "ai",             title: "القائمة الكاملة لميزات AI (78)",                  body: "التصنيفات: Autopilots (7)، Hidden Cash (6)، Predictive (7)، Cognitive (8)، Voice & CX (8)، Ecosystem (10). لكل منها دليل خاص في /help." },
    { id: "ai-2",      cat: "ai",             title: "كيف يعمل Customer DNA؟",                          body: "نحلّل آخر 6 أشهر من الفواتير + أنماط الدفع + تكرار التواصل لنحدّد شخصية العميل (تحليلي / بريميوم / ودود / متشكّك / جديد)." },
    { id: "billing-1", cat: "billing",        title: "ترقية الاشتراك",                                  body: "الملف الشخصي → الاشتراك → ترقية. المستويات: Lite، Pro، Business، Enterprise." },
    { id: "trouble-1", cat: "troubleshoot",   title: "الصفحة بطيئة",                                    body: "امسح ذاكرة المتصفح (Ctrl+Shift+R). إذا استمرّت المشكلة، تواصل مع البوت أسفل-يمين." },
  ]
};

const CAT_PALETTE = (success, ai, customer, money, market, brand, alert) => ({
  gettingStarted: brand,
  invoicing:      money,
  tax:            customer,
  banks:          ai,
  ai:             { id: "purple", bg: "#F3EFFF", base: "#6C3AFF", dark: "#4C1FA8" },
  billing:        market,
  troubleshoot:   alert,
});

export default function KnowledgeBasePage() {
  const { lang } = useI18n();
  const t = useDashboardI18n("help");
  const brand = getBrandPalette(String(lang).toLowerCase());
  const reports = getReportsPalette();
  const ai = getAIPalette();
  const customer = getCustomerPalette();
  const money = getMoneyPalette();
  const market = getMarketPalette();
  const success = getSuccessPalette();
  const alert = getAlertPalette();

  const articles = ARTICLES[lang] || ARTICLES.EN;
  const palettes = CAT_PALETTE(success, ai, customer, money, market, brand, alert);
  const categories = Array.from(new Set(articles.map((a) => a.cat)));

  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((a) => {
      if (activeCat !== "all" && a.cat !== activeCat) return false;
      if (!q) return true;
      return (a.title + " " + a.body).toLowerCase().includes(q);
    });
  }, [articles, activeCat, query]);

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(circle at 0% 0%, ${brand.bg}, #F8FAFC 60%)`, padding: 24 }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <header style={{ textAlign: "center", marginBottom: 28 }}>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0F172A", margin: "0 0 6px" }}>{t("kb.title")}</h1>
          <p style={{ fontSize: 14, color: "#64748B", margin: 0 }}>{t("kb.subtitle")}</p>
        </header>

        {/* Search */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ position: "relative" }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("kb.search")}
              aria-label={t("kb.search")}
              style={{ width: "100%", padding: "16px 18px 16px 50px", border: `1.5px solid ${brand.base}30`, borderRadius: 14, fontSize: 14, fontFamily: "inherit", background: "#fff", boxSizing: "border-box", boxShadow: "0 4px 14px rgba(15,23,42,0.06)" }}
            />
            <span style={{ position: "absolute", insetInlineStart: 18, top: 16, fontSize: 18, opacity: 0.5 }}>🔍</span>
          </div>
        </div>

        {/* Category chips */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          <button type="button" onClick={() => setActiveCat("all")} style={chipStyle(brand, activeCat === "all")}>All</button>
          {categories.map((c) => {
            const p = palettes[c] || reports;
            return (
              <button key={c} type="button" onClick={() => setActiveCat(c)} style={chipStyle(p, activeCat === c)}>
                {t(`kb.cat.${c}`)}
              </button>
            );
          })}
        </div>

        {/* Articles */}
        {filtered.length === 0 ? (
          <div style={{ background: "#fff", padding: 40, borderRadius: 16, textAlign: "center", color: "#94A3B8", border: "1px solid #E2E8F0" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{t("kb.empty")}</div>
            <div style={{ marginTop: 14, fontSize: 12, color: "#64748B" }}>👇 {t("kb.chat.cta")}</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
            {filtered.map((a) => {
              const p = palettes[a.cat] || reports;
              return (
                <article key={a.id} style={{ background: "#fff", border: `1px solid ${p.base}30`, borderRadius: 14, padding: 16, boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: p.dark, background: p.bg, padding: "4px 10px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.06em", display: "inline-block", marginBottom: 8 }}>
                    {t(`kb.cat.${a.cat}`)}
                  </span>
                  <h3 style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", margin: "0 0 8px", lineHeight: 1.35 }}>{a.title}</h3>
                  <p style={{ fontSize: 12, color: "#64748B", lineHeight: 1.55, margin: 0 }}>{a.body}</p>
                  <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px solid #F1F5F9" }}>
                    <span style={{ fontSize: 10, color: "#94A3B8", fontWeight: 700 }}>{t("kb.helpful")}</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button type="button" style={smBtn(success)}>👍</button>
                      <button type="button" style={smBtn(alert)}>👎</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function chipStyle(p, active) {
  return {
    background: active ? `linear-gradient(135deg, ${p.base}, ${p.dark})` : p.bg,
    color: active ? "#fff" : p.dark,
    border: `1px solid ${active ? p.base : p.base + "30"}`,
    padding: "8px 14px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
    cursor: "pointer",
  };
}

function smBtn(p) {
  return { background: p.bg, color: p.dark, border: `1px solid ${p.base}30`, padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer" };
}
