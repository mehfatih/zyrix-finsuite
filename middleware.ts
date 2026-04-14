import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

const arabicCountries = [
  "SA","AE","IQ","EG","QA","KW","BH","OM",
  "JO","LB","SY","YE","LY","TN","DZ","MA","PS",
];
const locales = ["en", "ar", "tr"] as const;

const SANCTIONED_COUNTRIES = new Set([
  "IR","KP","CU","RU","BY","MM","SD","ZW","VE",
]);

function addSecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(self)");
  return res;
}

const ipCounts = new Map<string, { n: number; reset: number }>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = ipCounts.get(ip);
  if (!rec || now > rec.reset) { ipCounts.set(ip, { n: 1, reset: now + 60_000 }); return false; }
  rec.n++;
  return rec.n > 120;
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const country = (
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") || ""
  ).toUpperCase();

  const clientIp =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") || "unknown";

  if (SANCTIONED_COUNTRIES.has(country)) {
    return new NextResponse(
      JSON.stringify({ error: "Service not available in your region.", code: "GEO_RESTRICTED" }),
      { status: 451, headers: { "Content-Type": "application/json" } }
    );
  }

  if (clientIp !== "unknown" && isRateLimited(clientIp)) {
    return new NextResponse(
      JSON.stringify({ error: "Too many requests.", code: "RATE_LIMITED" }),
      { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "60" } }
    );
  }

  const pathnameHasLocale = locales.some(
    (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
  );

  let response: NextResponse;

  if (pathnameHasLocale) {
    const i18n = createMiddleware({ locales: ["en","ar","tr"], defaultLocale: "en", localeDetection: false });
    response = i18n(request) as NextResponse;
  } else {
    let locale: "en" | "ar" | "tr" = "en";
    if (country === "TR") locale = "tr";
    else if (arabicCountries.includes(country)) locale = "ar";
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
    response = NextResponse.redirect(url);
  }

  return addSecurityHeaders(response);
}

export const config = {
  matcher: ["/((?!_next|api|favicon|.*\\..*).*)" ],
};