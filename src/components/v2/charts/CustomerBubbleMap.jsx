import { CUSTOMER_PALETTE } from '@/design-system-v2/colors';

/**
 * Stylized Turkey "map" using rough region positions on a normalized 540x300
 * canvas. Each bubble = a city; bubble radius scales with revenue. This is
 * an info-graphic, not a real GIS projection.
 */
const CITIES = [
  { name: 'İstanbul', cx: 130, cy:  70, revenue: 184000 },
  { name: 'Ankara',   cx: 280, cy: 120, revenue:  92000 },
  { name: 'İzmir',    cx:  90, cy: 160, revenue:  76000 },
  { name: 'Antalya',  cx: 200, cy: 220, revenue:  48000 },
  { name: 'Bursa',    cx: 160, cy:  90, revenue:  56000 },
  { name: 'Konya',    cx: 250, cy: 170, revenue:  42000 },
  { name: 'Adana',    cx: 350, cy: 200, revenue:  38000 },
  { name: 'Trabzon',  cx: 420, cy:  90, revenue:  18000 },
  { name: 'Gaziantep',cx: 410, cy: 200, revenue:  29000 }
];

export default function CustomerBubbleMap() {
  const max = Math.max(...CITIES.map((c) => c.revenue));
  return (
    <div style={{
      width: '100%',
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch',
      paddingBottom: '8px'
    }}>
      <svg viewBox="0 0 540 300" style={{ width: '100%', minWidth: '480px', maxHeight: '240px' }}>
        <ellipse cx={270} cy={150} rx={250} ry={110} fill={CUSTOMER_PALETTE.bg.tertiary} />

        {CITIES.map((city, i) => {
          const r = 6 + (city.revenue / max) * 22;
          const isTop = city.revenue === max;
          const fill = isTop ? CUSTOMER_PALETTE.brand.wine : CUSTOMER_PALETTE.accent.cyan;
          return (
            <g key={city.name} style={{
              animation: `bubble-pop 600ms ${i * 70}ms cubic-bezier(0.34, 1.56, 0.64, 1) both`,
              transformOrigin: `${city.cx}px ${city.cy}px`
            }}>
              <circle cx={city.cx} cy={city.cy} r={r * 1.5} fill={fill} fillOpacity={0.10} />
              <circle cx={city.cx} cy={city.cy} r={r}       fill={fill} fillOpacity={0.6}>
                <title>{`${city.name}: ₺${Math.round(city.revenue/1000)}K`}</title>
              </circle>
              <text x={city.cx} y={city.cy - r - 6} textAnchor="middle" fontSize={10} fill={CUSTOMER_PALETTE.text.primary} fontWeight={700}>
                {city.name}
              </text>
              <text x={city.cx} y={city.cy - r + 4} textAnchor="middle" fontSize={9} fill={CUSTOMER_PALETTE.text.tertiary}>
                ₺{Math.round(city.revenue/1000)}K
              </text>
            </g>
          );
        })}
        <style>{`
          @keyframes bubble-pop {
            0%   { transform: scale(0); opacity: 0; }
            70%  { transform: scale(1.15); }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </svg>
    </div>
  );
}
