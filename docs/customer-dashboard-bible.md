# Zyrix FinSuite — Customer Dashboard Bible v1.0

**Identity:** AI-First Finance Co-Pilot
**Created:** 9 May 2026
**Companion to:** Admin Operations Center Bible

> "Zyrix FinSuite, MENA ve Türkiye pazarındaki KOBİ'ler için uyumayan AI CFO'dur — vergi takibinden nakit akışına kadar tüm operasyonları otomatik yürütür ve karar destekleyen bir partner olur."

## §1 — The 10 Core Principles

1. AI is the Operating System, Not a Feature.
2. Decisions, Not Data — every visible number leads to action in 30 seconds.
3. Predictive Over Reactive — Cash Runway > Cash Balance.
4. Animations Communicate State — nothing renders static.
5. Wine Red is for Critical ONLY (≤5% of any view). Cyan is for Daily.
6. One Source of Truth Per Concept.
7. Trilingual Without Translation Smell (TR / EN / AR first-class).
8. Density Earns Its Place — denser than Admin, customers spend hours here.
9. The Sidebar is a Map, Not a Menu — 3 tiers + Cmd+K.
10. Premium is Felt, Not Stated.

## §2 — Color System

```javascript
export const CUSTOMER_PALETTE = {
  bg: {
    primary:      '#F8FAFC',
    secondary:    '#FFFFFF',
    tertiary:     '#F1F5F9',
    sidebar:      '#0A1530',
    sidebarHover: '#112044',
    inverse:      '#0F172A'
  },
  brand: {
    wine:       '#E30A17',
    wineSoft:   'rgba(227,10,23,0.06)',
    wineBorder: 'rgba(227,10,23,0.18)',
    wineGlow:   'rgba(227,10,23,0.25)'
  },
  accent: {
    cyan:       '#22D3EE',
    cyanSoft:   'rgba(34,211,238,0.08)',
    cyanGlow:   'rgba(34,211,238,0.20)',
    violet:     '#7C3AED',
    violetSoft: 'rgba(124,58,237,0.06)',
    mint:       '#2DD4BF',
    mintSoft:   'rgba(45,212,191,0.08)',
    amber:      '#F59E0B',
    amberSoft:  'rgba(245,158,11,0.08)',
    gold:       '#F59E0B'
  },
  text: {
    primary:        '#0F172A',
    secondary:      '#475569',
    tertiary:       '#94A3B8',
    inverse:        '#F9FAFB',
    onSidebar:      '#FFFFFF',
    onSidebarMuted: 'rgba(255,255,255,0.65)'
  },
  border: {
    subtle:  'rgba(15,23,42,0.06)',
    default: 'rgba(15,23,42,0.10)',
    strong:  'rgba(15,23,42,0.14)'
  },
  status: {
    healthy:  '#10B981',
    info:     '#22D3EE',
    warning:  '#F59E0B',
    critical: '#E30A17',
    neutral:  '#94A3B8'
  }
};
```

Distribution rule: in any view, weight ≈ Cyan 40% / Mint 20% / Amber 15% / Violet 15% / Wine 5% / Neutrals 5%. If Wine exceeds 5%, either there's a real crisis or the design is wrong.

## §3 — The 4 Customer KPIs (Customizable, Default Layout)

The Pano shows 4 hero KPIs in fixed positional order. Each customer can swap from a library of 25+ KPIs.

| Position | Default | Color | Companion |
|---|---|---|---|
| 1 (TL) | MRR / Aylık Gelir | Cyan | YoY % + 14d sparkline |
| 2 (TR) | Cash Runway / Nakit Ömrü | Amber, Wine if <30d | Days remaining |
| 3 (BL) | Customer Health % | Mint | AI churn alert if VIP at risk |
| 4 (BR) | Tax Burden / Vergi Yükü | Violet | Days-to-due + readiness |

Banned KPIs (never in library): Total Invoices All-Time (vanity), Active Sessions (monitoring not business), Login Streak, Total Customers (use Health % instead).

Default per-role 4 KPIs:
- Owner: mrr, cash_runway, customer_health_pct, tax_burden
- Accountant: tax_burden, payable_30d, overdue_receivables, kdv_load
- Sales: mrr, mrr_growth_pct, new_customers_30d, churn_rate
- Operations: pending_invoices, automation_savings_hours, ai_actions_taken_today, gross_margin

## §4 — Shape Language: 4 Distinct Visualizations

Below KPIs and AI Co-Pilot Strip, the Pano shows 4 analytics blocks in a 2x2 grid. Each MUST use a different shape.

| Block | Shape | Direction |
|---|---|---|
| 1 Revenue | Donut + Tier Bars | Centripetal |
| 2 Cash Flow | Sankey | Left → Right |
| 3 Geo Customers | Bubble Map | Multi-directional |
| 4 Invoice→Payment | Animated Funnel | Top → Bottom |

Test: Take any 2 blocks, squint. If they look interchangeable, redesign.

## §5 — AI Co-Pilot Strip

Below the 4 KPIs, full-width. Always exactly 3 cards:
- 🔴 KRİTİK (Wine) — most urgent issue
- 🟡 DİKKAT (Amber) — important not critical
- 🟢 FIRSAT (Mint or Cyan) — opportunity

Each card: 1-2 sentence insight + ONE action button.

Generation: cron at 6am local time → pulls last 30d activity → Gemini 2.0 Flash → stored in `customer_daily_brief` table with `expires_at = next 6am`.

Customization: Customer chooses focus area in settings (Cash | Sales | Tax | Customers | Operations | All).

Empty critical state: if AI finds no critical, Wine card becomes "Bugün acil bir sorun yok — uzun vadeli fırsata bak →" linking to Tahminler.

## §6 — Tax Intelligence Calendar

Each tax date gets a colored chip:
- 🟢 Mint — cash sufficient (>1.5x due)
- 🟡 Amber — tight (1.0–1.5x)
- 🔴 Wine — at risk (<1.0x)
- ⚪ Gray — paid / past

Hover tooltip shows AI suggestion with action button.

## §7 — Sidebar: 3 Tiers

### Tier 1 — Operasyon (always visible)
1. Pano
2. Satış: Faturalar, Siparişler, Teklifler, Esnaf Faturası, Satış Hattı★, Klasik Özet
3. Alış: Faturalar, Siparişler, Hizmet Alımı, Tedarikçiler★, Giderler
4. Müşteriler: Liste, 360°★, Skor★, Anlaşmalar, Görevler, Portal★
5. Nakit & Banka: Kasa, Banka Mutabakatı★, Çek & Senet, Finansman, Taksit
6. E-Fatura & Vergi: Giden, Gelen★, e-Arşiv, Otomatik Faturalar (merges 4 legacy entries), Vergi Otopilotu★, Takvim, KDV, Mali Müşavir, Mevzuat★
7. Stok & Ürün: Ürün Kataloğu, Hizmet Kataloğu, Hareketler, Raporlar★, e-İrsaliye, Fiş Okuma★, Personel & SGK
8. Raporlar: Aylık, Vergi Takvimi, KDV, Benchmark★, Mutabakat★

### Tier 2 — Zekâ (collapsed)
9. AI Co-Pilot★: Günlük Brifing, AI CFO, AI Asistan, WhatsApp AI, Çok Kanal, Doküman Kasası, Müzakere Koçu, Karar Yöneticisi, AI Takvim, Dolandırıcılık AI
10. Tahminler: Nakit, Stok, Churn, Stres Testi, Reel Kâr
11. Müşteri DNA: DNA, Zaman Döngüsü, Akıllı Fiyatlama, İndirim Optimizörü, Sadakat, Özel Gün, İnceleme, E-posta, Kampanyalar
12. Risk & Sağlık: İş Sağlığı, Kriz Uyarısı, Gizli Para Bulucu, Gizli Gelir, Gelecek Sen
13. Sesli & İletişim: Sesli Mod, AR Fiş, AR Mağaza, Ödeme Hatırlatma

### Tier 3 — Büyüme (Pro+ collapsed)
14. Pazar Yeri Hub: Pazar Yeri, WhatsApp, Kartvizit, Pazaryeri Zekâsı
15. Ekosistem: AI Kurucu Ortak, Zyrix Twin, B2B Pazaryeri, Sigorta Pazaryeri, Tedarikçi Sağlık, Açık Bankacılık, Influencer ROI
16. Capital
17. Üniversite

### Footer
Settings (Profil, Şirket, Ekip, Bildirimler, KVKK, Güvenlik, Veri, Destek, Taleplerim) + user card + Çıkış.

### Legacy entries hidden (replaced, not removed)
| Old | Replacement |
|---|---|
| Faturalar (Eski) | Satış Faturaları + Alış Faturaları |
| E-Fatura (Eski) | Giden / Gelen e-Fatura |
| Bankalar (Eski) | Banka Mutabakatı |
| Çek (Eski) | Çek & Senet |
| Oto. Fatura (Eski) | Otomatik Faturalar |
| Stok (Eski) | Stok Hareketleri |
| Hızlı Otomatik Fatura | Otomatik Faturalar (quick-action button inside) |
| Fatura Otopilotu | Otomatik Faturalar (AI mode tab inside) |

The old routes still resolve, but sidebar entries point to the consolidated replacements.

## §8 — Cmd+K Universal Command Palette

Triggers: Cmd+K / Ctrl+K, sidebar search, header pill.

Modal sections: AI suggestion (Violet, top), Pages (fuzzy search across ~95 entries), Customers (top 5 with MRR + health), Invoices (IDs/amounts/status), Quick Actions (Cmd+N, Cmd+Shift+M, Cmd+Shift+R, etc.).

Tech: `cmdk` library + `GET /api/customer/search?q=` + `POST /api/customer/cmdk-intent` (Gemini).

## §9 — Animation Standards

```javascript
TIMING  = { micro:150, short:250, medium:400, data:800, story:1200 };
EASING  = {
  default:    'cubic-bezier(0.4, 0, 0.2, 1)',
  energetic:  'cubic-bezier(0.34, 1.56, 0.64, 1)',
  decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
  accelerate: 'cubic-bezier(0.4, 0, 1, 1)'
};
```

Mandatory: KPI numbers count up (800ms), all sparklines draw L→R (800ms), all charts animate on mount, status dots pulse for live states.

Anti-patterns: looping animations on non-live data; animations >1.2s; auto-playing parallax; hover animations >200ms.

## §10 — Typography & Spacing

```
HERO NUMBER:   36px / 800 / -0.02em
PAGE TITLE:    24px / 800 / -0.02em
SECTION TITLE: 16px / 700 / -0.01em
BODY:          14px / 500
KPI LABEL:     11px / 700 / 0.06em uppercase
CAPTION:       12px / 600

Spacing: xs(4) sm(8) md(12) lg(16) xl(20) 2xl(24) 3xl(32) 4xl(48)
Radius:  sm(6) md(8) lg(10) xl(12) 2xl(14) full(9999)
Font: 'Plus Jakarta Sans', 'Inter', system. AR: 'IBM Plex Sans Arabic'.
```

## §11 — Iconography: NO Emojis

Use Lucide React for all UI chrome. Emojis allowed ONLY in:
- AI-generated text content
- User-generated content (customer names, memos)
- One-time celebration animations

Icon sizes: 14px inline · 16px button · 18px KPI · 24px hero · 32px empty state.

## §12 — Customer vs. Admin Differentiation

| Dimension | Admin | Customer |
|---|---|---|
| Mood | Strategic, executive, calm | Operational, alive, present |
| Background | Cream #FAFAFA | Slate #F8FAFC |
| Primary | Wine (brand) | Cyan (daily) + Wine (critical only) |
| Sidebar | Light, structured | Dark navy, premium |
| KPIs | Strategic (rev, customers, churn, NRR) | Operational (MRR, runway, health, tax) |
| Time horizon | Quarterly, yearly | Daily, weekly, monthly |
| AI voice | Recommendations | Co-pilot (proactive, conversational) |
| Cmd+K | Optional | Essential |

## §13 — Anti-Patterns

- Sidebar: showing 95 entries flat; "(Eski)" labels visible to customers; mixing function & tech clusters.
- Pano: empty AI Brifingi for >5s; vanity metrics; all 4 charts being line/area; using Wine as decoration.
- AI: "AI thinking..." indefinitely; AI features as separate menu entries when they could enrich existing; auto-executing without approval.
- Identity: looking like a generic SaaS template; mixing emoji + Lucide; inconsistent radii; non-palette colors.

End of Bible v1.0
