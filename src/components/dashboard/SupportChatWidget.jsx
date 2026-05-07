// ================================================================
// SupportChatWidget — floating bubble + chat panel.
// AI-bot first reply, escalation to human.
// Mount once at the dashboard shell so it's available on every page.
// ================================================================
import React, { useEffect, useRef, useState } from "react";
import { useI18n } from "../../i18n/i18n";
import { useDashboardI18n } from "../../i18n/dashboard";
import { getBrandPalette, getAIPalette, getSuccessPalette } from "../../utils/dashboardPalette";

const BOT_RESPONSES = {
  TR: {
    invoice: "Faturayı 3 yoldan oluşturabilirsin: 1) Sol menü → ★ AI Fatura Otopilotu (sesle/yazıyla), 2) Faturalar → + Yeni, 3) Sesli Mod aktifse WhatsApp'ından komut gönder. Adım adım rehber için /help → Faturalama'yı aç.",
    tax: "KDV otomatik hesaplanır. Sol menü → ★ Vergi AI Otopilotu beyannameyi 30 saniyede hazırlar. KDV tablonu görmek için Vergi → KDV Raporu'na git.",
    bank: "Bankanı bağlamak için Hesap → Ayarlar → Bankalar → + Banka Ekle yolunu izle. 17 banka destekleniyor. Açık Bankacılık (BDDK) ile sadece okuma izni — verin gizli kalır.",
    ai: "AI özellikleri 78 farklı yerde devrede: Hidden Cash bulur, Customer DNA müşterini analiz eder, Voice Mode WhatsApp'tan komut alır, Co-Founder strateji konuşur. /help → AI Özellikleri'nde tam liste var.",
    default: "Sorunu birkaç anahtar kelimeyle yazarsan ya da yukarıdaki önerilerden birine tıklarsan daha doğru yanıt verebilirim. Çözemezsen 'İnsan destek' butonuna bas."
  },
  EN: {
    invoice: "Three ways to create an invoice: 1) Sidebar → ★ AI Invoice Autopilot (voice or text), 2) Invoices → + New, 3) If Voice Mode is enabled, send a command from WhatsApp. Open /help → Invoicing for the step-by-step guide.",
    tax: "VAT is calculated automatically. Sidebar → ★ Tax AI Autopilot prepares your declaration in 30 seconds. To inspect, open Tax → VAT Report.",
    bank: "Connect a bank via Account → Settings → Banks → + Add Bank. 17 banks supported. Open Banking (BDDK regulated) gives read-only access — your data stays private.",
    ai: "AI features run in 78 places: Hidden Cash finds money, Customer DNA profiles your customers, Voice Mode takes WhatsApp commands, Co-Founder gives strategic advice. Full list at /help → AI Features.",
    default: "Try a few keywords or tap one of the suggestions above for a more accurate answer. If I can't help, hit 'Connect with a human'."
  },
  AR: {
    invoice: "ثلاث طرق لإنشاء فاتورة: 1) القائمة → ★ Autopilot الفواتير AI (صوت أو نص)، 2) الفواتير → + جديد، 3) إذا كان الوضع الصوتي مفعّلاً، أرسل أمراً من واتساب. افتح /help → الفوترة للدليل خطوة بخطوة.",
    tax: "الضريبة تُحسب تلقائياً. القائمة → ★ Autopilot الضريبة AI يجهّز إقرارك في 30 ثانية. للمعاينة افتح الضريبة → تقرير KDV.",
    bank: "اربط البنك عبر الحساب → الإعدادات → البنوك → + أضف بنكاً. 17 بنكاً مدعوم. Open Banking (تنظيم BDDK) يمنح صلاحية قراءة فقط — بياناتك خاصة.",
    ai: "ميزات AI تعمل في 78 موضعاً: Hidden Cash يكتشف المال، Customer DNA يحلّل العميل، Voice Mode يستقبل أوامر واتساب، Co-Founder يقدّم نصائح استراتيجية. القائمة الكاملة في /help → ميزات AI.",
    default: "جرّب عدة كلمات مفتاحية أو اضغط أحد الاقتراحات أعلاه للحصول على إجابة أدق. إذا لم أستطع المساعدة، اضغط 'تواصل مع إنسان'."
  }
};

function botReply(text, lang = "TR") {
  const m = String(text).toLowerCase();
  const dict = BOT_RESPONSES[lang] || BOT_RESPONSES.EN;
  if (/invoice|fatura|فاتورة/.test(m)) return dict.invoice;
  if (/tax|vat|kdv|ضريبة/.test(m)) return dict.tax;
  if (/bank|banka|بنك/.test(m)) return dict.bank;
  if (/ai|yapay|ذكاء/.test(m)) return dict.ai;
  return dict.default;
}

export default function SupportChatWidget() {
  const { lang } = useI18n();
  const t = useDashboardI18n("help");
  const brand = getBrandPalette(String(lang).toLowerCase());
  const ai = getAIPalette();
  const success = getSuccessPalette();

  const [open, setOpen] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => [
    { role: "bot", text: t("chat.welcome"), at: Date.now() },
  ]);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (open) scrollRef.current?.scrollTo?.({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, thinking]);

  const send = (text) => {
    const trimmed = String(text).trim();
    if (!trimmed) return;
    setMessages((m) => [...m, { role: "user", text: trimmed, at: Date.now() }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "bot", text: botReply(trimmed, lang), at: Date.now() }]);
      setThinking(false);
    }, 700);
  };

  const escalate = () => {
    setEscalated(true);
    setMessages((m) => [...m, { role: "system", text: t("chat.escalated"), at: Date.now() }]);
  };

  const SUGGESTS = ["invoice", "tax", "bank", "ai"];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("chat.open")}
        aria-expanded={open}
        style={{
          position: "fixed", bottom: 22, insetInlineEnd: 22, zIndex: 9000,
          width: 60, height: 60, borderRadius: "50%",
          background: `linear-gradient(135deg, ${brand.base}, ${brand.dark})`,
          color: "#fff", border: "none",
          fontSize: 26, cursor: "pointer",
          boxShadow: open ? `0 8px 24px ${brand.base}50` : `0 12px 32px ${brand.base}60`,
          transition: "all .25s",
          transform: open ? "scale(0.92)" : "scale(1)",
        }}
      >
        {open ? "✕" : "💬"}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={t("chat.open")}
          style={{
            position: "fixed", bottom: 92, insetInlineEnd: 22, zIndex: 9001,
            width: 360, maxWidth: "calc(100vw - 32px)", height: 540, maxHeight: "calc(100vh - 130px)",
            background: "#fff", borderRadius: 18,
            boxShadow: "0 20px 60px rgba(15,23,42,0.25)",
            display: "flex", flexDirection: "column", overflow: "hidden",
            animation: "scwSlide .25s ease",
          }}
        >
          <div style={{ background: `linear-gradient(135deg, ${brand.base}, ${brand.dark})`, color: "#fff", padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>Zyrix Support</div>
              <div style={{ fontSize: 10, opacity: 0.85, fontWeight: 700 }}>● Online</div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close" style={{ background: "rgba(255,255,255,0.18)", color: "#fff", border: "none", width: 28, height: 28, borderRadius: 8, fontSize: 14, fontWeight: 800, cursor: "pointer" }}>✕</button>
          </div>

          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 14, background: `linear-gradient(180deg, ${brand.bg} 0%, #fff 30%)` }}>
            {messages.map((m, i) => (
              <Bubble key={i} message={m} brand={brand} ai={ai} success={success} />
            ))}
            {thinking && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: ai.bg, borderRadius: 12, marginBottom: 8 }}>
                <Dots color={ai.base} />
                <span style={{ fontSize: 11, color: ai.dark, fontWeight: 700 }}>{t("chat.thinking")}</span>
              </div>
            )}
            {messages.length <= 1 && (
              <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                {SUGGESTS.map((s) => (
                  <button key={s} type="button" onClick={() => send(t(`chat.suggest.${s}`))} style={{ background: ai.bg, color: ai.dark, border: `1px solid ${ai.base}30`, padding: "6px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                    {t(`chat.suggest.${s}`)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {!escalated && messages.length > 2 && (
            <button type="button" onClick={escalate} style={{ background: brand.bg, color: brand.dark, border: "none", borderTop: "1px solid #F1F5F9", padding: "10px 14px", fontSize: 11, fontWeight: 800, cursor: "pointer", textAlign: "center" }}>
              👤 {t("chat.escalate")}
            </button>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, padding: 12, borderTop: "1px solid #F1F5F9", background: "#fff", alignItems: "center" }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder={t("chat.placeholder")}
              aria-label={t("chat.placeholder")}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 13, fontFamily: "inherit", boxSizing: "border-box" }}
            />
            <button type="button" onClick={() => send(input)} aria-label={t("chat.send")} style={{ background: `linear-gradient(135deg, ${brand.base}, ${brand.dark})`, color: "#fff", border: "none", padding: "10px 14px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>
              ↑
            </button>
          </div>
          <style>{`@keyframes scwSlide { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
      )}
    </>
  );
}

function Bubble({ message, brand, ai, success }) {
  if (message.role === "system") {
    return (
      <div style={{ textAlign: "center", padding: "8px 12px", background: success.bg, color: success.dark, borderRadius: 10, fontSize: 11, fontWeight: 700, marginBottom: 10 }}>
        {message.text}
      </div>
    );
  }
  const isBot = message.role === "bot";
  return (
    <div style={{ display: "flex", justifyContent: isBot ? "flex-start" : "flex-end", marginBottom: 8 }}>
      <div
        style={{
          maxWidth: "85%",
          background: isBot ? "#fff" : `linear-gradient(135deg, ${brand.base}, ${brand.dark})`,
          color: isBot ? "#0F172A" : "#fff",
          border: isBot ? "1px solid #E2E8F0" : "none",
          padding: "9px 12px",
          borderRadius: isBot ? "12px 12px 12px 4px" : "12px 12px 4px 12px",
          fontSize: 12, lineHeight: 1.55,
          boxShadow: isBot ? "0 2px 6px rgba(15,23,42,0.04)" : `0 4px 10px ${brand.base}40`,
          whiteSpace: "pre-wrap",
        }}
      >
        {message.text}
      </div>
    </div>
  );
}

function Dots({ color }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: color, animation: `scwDot 1.2s ${i * 0.15}s ease-in-out infinite` }} />
      ))}
      <style>{`@keyframes scwDot { 0%,80%,100% { opacity: 0.3; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1.2); } }`}</style>
    </div>
  );
}
