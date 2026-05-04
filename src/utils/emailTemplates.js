// ================================================================
// Zyrix FinSuite - Email Templates Utility
// Trilingual (TR/EN/AR) email templates for transactional sends.
//
// Templates:
//   - welcome  : after signup confirmation
//   - invite   : team member invitation
//   - reset    : password reset link
//
// Usage:
//   import { getEmailTemplate } from "../utils/emailTemplates.js";
//
//   const { subject, html } = getEmailTemplate("welcome", {
//     lang: "TR",
//     name: "Mehmet",
//     appUrl: "https://finsuite.zyrix.co/onboarding",
//   });
// ================================================================

// ---------- Brand tokens (matches V2 design system) ----------
const BRAND = {
  name: "Zyrix",
  product: "Zyrix FinSuite",
  domain: "zyrix.co",
  appUrl: "https://finsuite.zyrix.co",
  supportEmail: "hello@zyrix.co",
};

const THEME = {
  // Wine red (TR / EN)
  red:        "#E30A17",
  redDeep:    "#B30810",
  redBright:  "#FF1A2A",
  wine900:    "#3A0509",
  wine950:    "#1F0205",
  bgTinted:   "#FFF7F4",

  // Saudi green (AR)
  green:        "#006C35",
  greenDeep:    "#004D26",
  greenBright:  "#0A8C45",
  green900:     "#003D1F",
  green950:     "#002A15",
  greenTinted:  "#F4FBF7",

  ink:        "#1B0F11",
  muted:      "#5C4F52",
  hairline:   "#F1E1DF",
};

// ---------- Theme picker per language ----------
function getThemeForLang(lang) {
  const isAR = lang === "AR";
  return {
    primary:     isAR ? THEME.green       : THEME.red,
    primaryDeep: isAR ? THEME.greenDeep   : THEME.redDeep,
    bright:      isAR ? THEME.greenBright : THEME.redBright,
    night:       isAR ? THEME.green950    : THEME.wine950,
    bg:          isAR ? THEME.greenTinted : THEME.bgTinted,
    shadowRGB:   isAR ? "0,77,38"         : "58,5,9",
  };
}

// ---------- Localized labels ----------
function getLabels(lang) {
  if (lang === "AR") {
    return {
      preheaderHidden: "هذه رسالة من زيركس",
      ignoreNote: "إذا لم تتوقع هذه الرسالة، يمكنك تجاهلها بأمان.",
      copyright: "جميع الحقوق محفوظة",
      tagline: "ذكاء التدفق النقدي للأعمال",
      fallbackText: "إذا لم يعمل الزر، انسخ والصق هذا الرابط في متصفحك:",
    };
  }
  if (lang === "TR") {
    return {
      preheaderHidden: "Zyrix tarafindan gonderildi",
      ignoreNote: "Bu e-postayi beklemiyorsaniz guvenle yok sayabilirsiniz.",
      copyright: "Tum haklari saklidir",
      tagline: "Isletmeler icin nakit akisi zekasi",
      fallbackText: "Buton calismazsa, asagidaki baglantiyi tarayicinizda acin:",
    };
  }
  return {
    preheaderHidden: "Sent by Zyrix",
    ignoreNote: "If you did not expect this email, you can safely ignore it.",
    copyright: "All rights reserved",
    tagline: "Cashflow intelligence for businesses",
    fallbackText: "If the button does not work, copy and paste this link into your browser:",
  };
}

// ---------- Layout wrapper (used by all templates) ----------
function layout({ lang, title, preview, body, ctaText, ctaUrl }) {
  const isAR = lang === "AR";
  const dir = isAR ? "rtl" : "ltr";
  const align = isAR ? "right" : "left";
  const t = getThemeForLang(lang);
  const labels = getLabels(lang);
  const year = new Date().getFullYear();
  const arrow = isAR ? "&larr;" : "&rarr;";
  const brandSidePad = isAR ? "right" : "left";

  return [
    '<!doctype html>',
    '<html lang="' + lang.toLowerCase() + '" dir="' + dir + '">',
    '<head>',
    '<meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    '<meta name="x-apple-disable-message-reformatting" />',
    '<title>' + title + '</title>',
    '</head>',
    '<body style="margin:0;padding:0;background:' + t.bg + ';font-family:Arial,Helvetica,sans-serif;color:' + THEME.ink + ';-webkit-font-smoothing:antialiased;">',

    '<div style="display:none;max-height:0;overflow:hidden;color:transparent;">',
    preview + ' - ' + labels.preheaderHidden,
    '</div>',

    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:' + t.bg + ';padding:32px 16px;">',
    '<tr><td align="center">',

    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border:1px solid ' + THEME.hairline + ';border-radius:28px;overflow:hidden;box-shadow:0 24px 70px rgba(' + t.shadowRGB + ',.10);">',

    '<tr><td style="padding:0;">',
    '<div style="height:6px;background:linear-gradient(135deg,' + t.bright + ',' + t.primaryDeep + ');"></div>',
    '</td></tr>',

    '<tr><td style="padding:36px 38px;text-align:' + align + ';" dir="' + dir + '">',

    '<div style="font-size:26px;font-weight:900;color:' + t.primary + ';letter-spacing:-0.5px;line-height:1;">',
    BRAND.name,
    '<span style="color:' + THEME.muted + ';font-weight:700;font-size:14px;margin-' + brandSidePad + ':8px;letter-spacing:0;">FinSuite</span>',
    '</div>',

    '<h1 style="margin:30px 0 0;font-size:32px;line-height:1.18;letter-spacing:-1.2px;color:' + THEME.ink + ';font-weight:900;">',
    title,
    '</h1>',

    '<div style="margin-top:20px;font-size:16px;line-height:1.78;color:' + THEME.muted + ';font-weight:600;">',
    body,
    '</div>',

    '<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:32px;">',
    '<tr><td style="border-radius:18px;background:linear-gradient(135deg,' + t.bright + ',' + t.primaryDeep + ');box-shadow:0 18px 44px rgba(' + t.shadowRGB + ',.28);">',
    '<a href="' + ctaUrl + '" target="_blank" rel="noopener" style="display:inline-block;padding:17px 28px;color:#ffffff;text-decoration:none;font-weight:900;font-size:15px;letter-spacing:0.2px;font-family:Arial,Helvetica,sans-serif;">',
    ctaText + ' ' + arrow,
    '</a>',
    '</td></tr>',
    '</table>',

    '<div style="margin-top:22px;font-size:12px;line-height:1.65;color:' + THEME.muted + ';">',
    labels.fallbackText,
    '<br /><a href="' + ctaUrl + '" style="color:' + t.primary + ';word-break:break-all;text-decoration:underline;">' + ctaUrl + '</a>',
    '</div>',

    '<div style="margin-top:30px;padding-top:22px;border-top:1px solid ' + THEME.hairline + ';font-size:13px;line-height:1.7;color:' + THEME.muted + ';">',
    labels.ignoreNote,
    '</div>',

    '</td></tr>',
    '</table>',

    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;margin-top:18px;">',
    '<tr><td style="text-align:center;font-size:12px;line-height:1.7;color:' + THEME.muted + ';" dir="' + dir + '">',
    '<div style="font-weight:800;color:' + THEME.ink + ';">' + BRAND.product + '</div>',
    '<div style="margin-top:4px;">' + labels.tagline + '</div>',
    '<div style="margin-top:10px;opacity:0.7;">&copy; ' + year + ' ' + BRAND.name + '. ' + labels.copyright + '.</div>',
    '</td></tr>',
    '</table>',

    '</td></tr>',
    '</table>',

    '</body>',
    '</html>',
  ].join("\n");
}

// ---------- Welcome template ----------
function welcomeTemplate({ lang, name, appUrl }) {
  const userName = name || (lang === "AR" ? "مرحبا" : lang === "TR" ? "Merhaba" : "Hello");
  const url = appUrl || BRAND.appUrl;

  if (lang === "AR") {
    return {
      subject: "مرحبا بك في زيركس - مساحة عمل التدفق النقدي جاهزة",
      html: layout({
        lang,
        title: "مساحة عمل التدفق النقدي جاهزة.",
        preview: "ابدأ بأول تحليل ذكي للفواتير وفرص الاسترداد.",
        body: '<p style="margin:0 0 14px;">' + userName + '، مرحبا بك في زيركس.</p>' +
              '<p style="margin:0 0 14px;">مساحة عملك جاهزة لمساعدتك على تحليل سلوك الفواتير، اكتشاف مخاطر التدفق النقدي، وتحويل الرؤى إلى متابعات جاهزة للتنفيذ.</p>' +
              '<p style="margin:0;">ابدأ بأول تحليل ذكي للتدفق النقدي وشاهد ما تخبرك به فواتيرك.</p>',
        ctaText: "افتح مساحة العمل",
        ctaUrl: url,
      }),
    };
  }

  if (lang === "TR") {
    return {
      subject: "Zyrix\u2019e hos geldiniz - nakit akisi calisma alaniniz hazir",
      html: layout({
        lang,
        title: "Nakit akisi calisma alaniniz hazir.",
        preview: "Fatura riskini ve toparlanma firsatlarini analiz etmeye baslayin.",
        body: '<p style="margin:0 0 14px;">' + userName + ', Zyrix\u2019e hos geldiniz.</p>' +
              '<p style="margin:0 0 14px;">Calisma alaniniz; fatura davranisini analiz etmek, nakit akisi riskini gormek ve icgoruleri aksiyona donusturmek icin hazir.</p>' +
              '<p style="margin:0;">Ilk AI nakit akisi analizinizle baslayin ve faturalarinizin size ne soyledigini gorun.</p>',
        ctaText: "Calisma Alanini Ac",
        ctaUrl: url,
      }),
    };
  }

  return {
    subject: "Welcome to Zyrix - your cashflow workspace is ready",
    html: layout({
      lang: "EN",
      title: "Your cashflow workspace is ready.",
      preview: "Start analyzing invoice risk and recovery opportunities.",
      body: '<p style="margin:0 0 14px;">' + userName + ', welcome to Zyrix.</p>' +
            '<p style="margin:0 0 14px;">Your workspace is ready to help you analyze invoice behavior, detect cashflow risk, and turn insights into action-ready follow-ups.</p>' +
            '<p style="margin:0;">Start with your first AI cashflow analysis and see what your invoices are already telling you.</p>',
      ctaText: "Open Workspace",
      ctaUrl: url,
    }),
  };
}

// ---------- Invite template ----------
function inviteTemplate({ lang, name, workspace, inviteLink, inviterName }) {
  const userName = name || (lang === "AR" ? "مرحبا" : lang === "TR" ? "Merhaba" : "Hello");
  const ws = workspace || (lang === "AR" ? "مساحة عمل زيركس" : "Zyrix Workspace");
  const inviter = inviterName || (lang === "AR" ? "فريقك" : lang === "TR" ? "ekibiniz" : "your team");
  const url = inviteLink || BRAND.appUrl;

  if (lang === "AR") {
    return {
      subject: "تمت دعوتك إلى " + ws,
      html: layout({
        lang,
        title: "انضم إلى " + ws + ".",
        preview: "تمت دعوتك للتعاون داخل زيركس.",
        body: '<p style="margin:0 0 14px;">' + userName + '، دعاك ' + inviter + ' للانضمام إلى <strong style="color:#1B0F11;">' + ws + '</strong>.</p>' +
              '<p style="margin:0 0 14px;">داخل زيركس يمكن لفريقك التعاون على ذكاء الفواتير، وضوح المخاطر، المتابعات، وقرارات التدفق النقدي.</p>' +
              '<p style="margin:0;">اقبل الدعوة لإنشاء حسابك والبدء فورا.</p>',
        ctaText: "قبول الدعوة",
        ctaUrl: url,
      }),
    };
  }

  if (lang === "TR") {
    return {
      subject: ws + " calisma alanina davet edildiniz",
      html: layout({
        lang,
        title: ws + " alanina katilin.",
        preview: "Zyrix uzerinde birlikte calismaniz icin davet edildiniz.",
        body: '<p style="margin:0 0 14px;">' + userName + ', ' + inviter + ' sizi <strong style="color:#1B0F11;">' + ws + '</strong> calisma alanina davet etti.</p>' +
              '<p style="margin:0 0 14px;">Zyrix icinde ekibiniz fatura zekasi, risk gorunurlugu, takip aksiyonlari ve nakit akisi kararlari uzerinde birlikte calisabilir.</p>' +
              '<p style="margin:0;">Daveti kabul edin ve hemen baslayin.</p>',
        ctaText: "Daveti Kabul Et",
        ctaUrl: url,
      }),
    };
  }

  return {
    subject: "You were invited to " + ws,
    html: layout({
      lang: "EN",
      title: "Join " + ws + ".",
      preview: "You have been invited to collaborate on Zyrix.",
      body: '<p style="margin:0 0 14px;">' + userName + ', ' + inviter + ' invited you to join <strong style="color:#1B0F11;">' + ws + '</strong>.</p>' +
            '<p style="margin:0 0 14px;">Inside Zyrix, your team can work together on invoice intelligence, risk visibility, follow-ups, and cashflow decisions.</p>' +
            '<p style="margin:0;">Accept the invitation to create your account and get started.</p>',
      ctaText: "Accept Invitation",
      ctaUrl: url,
    }),
  };
}

// ---------- Reset password template ----------
function resetTemplate({ lang, name, resetLink }) {
  const userName = name || (lang === "AR" ? "مرحبا" : lang === "TR" ? "Merhaba" : "Hello");
  const url = resetLink || BRAND.appUrl;

  if (lang === "AR") {
    return {
      subject: "إعادة تعيين كلمة مرور زيركس",
      html: layout({
        lang,
        title: "أعد تعيين كلمة المرور بأمان.",
        preview: "استخدم هذا الرابط الآمن لإعادة تعيين كلمة مرور زيركس.",
        body: '<p style="margin:0 0 14px;">' + userName + '، تلقينا طلبا لإعادة تعيين كلمة مرور حسابك في زيركس.</p>' +
              '<p style="margin:0 0 14px;">استخدم الرابط الآمن أدناه لإنشاء كلمة مرور جديدة والعودة إلى مساحة عمل التدفق النقدي.</p>' +
              '<p style="margin:0;font-size:13px;color:#5C4F52;">هذا الرابط صالح لمدة محدودة لأسباب أمنية.</p>',
        ctaText: "إعادة تعيين كلمة المرور",
        ctaUrl: url,
      }),
    };
  }

  if (lang === "TR") {
    return {
      subject: "Zyrix sifrenizi sifirlayin",
      html: layout({
        lang,
        title: "Sifrenizi guvenli sekilde sifirlayin.",
        preview: "Zyrix sifrenizi sifirlamak icin bu guvenli baglantiyi kullanin.",
        body: '<p style="margin:0 0 14px;">' + userName + ', Zyrix sifrenizi sifirlamak icin bir talep aldik.</p>' +
              '<p style="margin:0 0 14px;">Asagidaki guvenli baglantiyi kullanarak yeni sifre olusturabilir ve calisma alaniniza donebilirsiniz.</p>' +
              '<p style="margin:0;font-size:13px;color:#5C4F52;">Bu baglanti guvenlik nedeniyle sinirli sure gecerlidir.</p>',
        ctaText: "Sifreyi Sifirla",
        ctaUrl: url,
      }),
    };
  }

  return {
    subject: "Reset your Zyrix password",
    html: layout({
      lang: "EN",
      title: "Reset your password securely.",
      preview: "Use this secure link to reset your Zyrix password.",
      body: '<p style="margin:0 0 14px;">' + userName + ', we received a request to reset your Zyrix password.</p>' +
            '<p style="margin:0 0 14px;">Use the secure link below to create a new password and return to your cashflow workspace.</p>' +
            '<p style="margin:0;font-size:13px;color:#5C4F52;">This link is valid for a limited time for security reasons.</p>',
      ctaText: "Reset Password",
      ctaUrl: url,
    }),
  };
}

// ================================================================
// Public API
// ================================================================

/**
 * Get a transactional email template by name.
 *
 * @param {"welcome"|"invite"|"reset"} name - Template name
 * @param {object} input - Template input
 * @param {"TR"|"EN"|"AR"} [input.lang="EN"] - Language code
 * @param {string} [input.name] - Recipient display name
 * @param {string} [input.workspace] - Workspace name (invite only)
 * @param {string} [input.inviterName] - Person who sent invite (invite only)
 * @param {string} [input.inviteLink] - Invite acceptance URL (invite only)
 * @param {string} [input.resetLink] - Password reset URL (reset only)
 * @param {string} [input.appUrl] - Workspace URL (welcome only)
 * @returns {{ subject: string, html: string }}
 */
export function getEmailTemplate(name, input) {
  const safeInput = input || {};
  const lang = safeInput.lang || "EN";
  const merged = Object.assign({}, safeInput, { lang: lang });

  if (name === "welcome") return welcomeTemplate(merged);
  if (name === "invite")  return inviteTemplate(merged);
  if (name === "reset")   return resetTemplate(merged);

  throw new Error("Unknown email template: " + name);
}

// Named exports for direct use
export { welcomeTemplate, inviteTemplate, resetTemplate };

// Default export = the public API
export default getEmailTemplate;
