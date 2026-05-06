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

const NAMESPACES = {
  home:          { TR: homeTr,    EN: homeEn,    AR: homeAr },
  profile:       { TR: profileTr, EN: profileEn, AR: profileAr },
  company:       { TR: companyTr, EN: companyEn, AR: companyAr },
  notifications: { TR: notifTr,   EN: notifEn,   AR: notifAr },
  sales:         { TR: salesTr,   EN: salesEn,   AR: salesAr },
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
