// Dashboard i18n loader — bridges JSON namespace files to the global lang.
// Usage:
//   const dt = useDashboardI18n("home");
//   dt("greeting.morning")
import { useI18n } from "../i18n";

import homeTr from "./home.tr.json";
import homeEn from "./home.en.json";
import homeAr from "./home.ar.json";

import profileTr from "./profile.tr.json";
import profileEn from "./profile.en.json";
import profileAr from "./profile.ar.json";

import companyTr from "./company.tr.json";
import companyEn from "./company.en.json";
import companyAr from "./company.ar.json";

import notifTr from "./notifications.tr.json";
import notifEn from "./notifications.en.json";
import notifAr from "./notifications.ar.json";

import salesTr from "./sales.tr.json";
import salesEn from "./sales.en.json";
import salesAr from "./sales.ar.json";

import purchasesTr from "./purchases.tr.json";
import purchasesEn from "./purchases.en.json";
import purchasesAr from "./purchases.ar.json";

import productsTr from "./products.tr.json";
import productsEn from "./products.en.json";
import productsAr from "./products.ar.json";

import stockTr from "./stock.tr.json";
import stockEn from "./stock.en.json";
import stockAr from "./stock.ar.json";

import efaturaTr from "./efatura.tr.json";
import efaturaEn from "./efatura.en.json";
import efaturaAr from "./efatura.ar.json";

import taxTr from "./tax.tr.json";
import taxEn from "./tax.en.json";
import taxAr from "./tax.ar.json";

import cashTr from "./cash.tr.json";
import cashEn from "./cash.en.json";
import cashAr from "./cash.ar.json";

import aiFinanceTr from "./ai-finance.tr.json";
import aiFinanceEn from "./ai-finance.en.json";
import aiFinanceAr from "./ai-finance.ar.json";

import autopilotsTr from "./autopilots.tr.json";
import autopilotsEn from "./autopilots.en.json";
import autopilotsAr from "./autopilots.ar.json";

import inboxTr from "./inbox.tr.json";
import inboxEn from "./inbox.en.json";
import inboxAr from "./inbox.ar.json";

import intelligenceTr from "./intelligence.tr.json";
import intelligenceEn from "./intelligence.en.json";
import intelligenceAr from "./intelligence.ar.json";

import predictiveTr from "./predictive.tr.json";
import predictiveEn from "./predictive.en.json";
import predictiveAr from "./predictive.ar.json";

import cognitiveTr from "./cognitive.tr.json";
import cognitiveEn from "./cognitive.en.json";
import cognitiveAr from "./cognitive.ar.json";

const NAMESPACES = {
  home:          { TR: homeTr,         EN: homeEn,         AR: homeAr },
  profile:       { TR: profileTr,      EN: profileEn,      AR: profileAr },
  company:       { TR: companyTr,      EN: companyEn,      AR: companyAr },
  notifications: { TR: notifTr,        EN: notifEn,        AR: notifAr },
  sales:         { TR: salesTr,        EN: salesEn,        AR: salesAr },
  purchases:     { TR: purchasesTr,    EN: purchasesEn,    AR: purchasesAr },
  products:      { TR: productsTr,     EN: productsEn,     AR: productsAr },
  stock:         { TR: stockTr,        EN: stockEn,        AR: stockAr },
  efatura:       { TR: efaturaTr,      EN: efaturaEn,      AR: efaturaAr },
  tax:           { TR: taxTr,          EN: taxEn,          AR: taxAr },
  cash:          { TR: cashTr,         EN: cashEn,         AR: cashAr },
  "ai-finance":  { TR: aiFinanceTr,    EN: aiFinanceEn,    AR: aiFinanceAr },
  autopilots:    { TR: autopilotsTr,   EN: autopilotsEn,   AR: autopilotsAr },
  inbox:         { TR: inboxTr,        EN: inboxEn,        AR: inboxAr },
  intelligence:  { TR: intelligenceTr, EN: intelligenceEn, AR: intelligenceAr },
  predictive:    { TR: predictiveTr,   EN: predictiveEn,   AR: predictiveAr },
  cognitive:     { TR: cognitiveTr,    EN: cognitiveEn,    AR: cognitiveAr },
};

export function useDashboardI18n(namespace) {
  const { lang } = useI18n();
  const ns = NAMESPACES[namespace] || {};
  const dict = ns[lang] || ns.TR || {};
  const fallback = ns.TR || {};
  return (key, vars = {}) => {
    let s = dict[key] ?? fallback[key] ?? key;
    Object.entries(vars).forEach(([k, v]) => {
      s = s.replace(`{${k}}`, String(v));
    });
    return s;
  };
}

export default NAMESPACES;
