import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CUSTOMER_PALETTE } from '@/design-system-v2/colors';

const COLORS = [
  CUSTOMER_PALETTE.accent.cyan,
  CUSTOMER_PALETTE.accent.violet,
  CUSTOMER_PALETTE.accent.mint,
  CUSTOMER_PALETTE.accent.amber,
  CUSTOMER_PALETTE.text.tertiary
];

const MOCK = [
  { name: 'Atlas Tekstil',    value: 58400 },
  { name: 'Sahra Trade',      value: 42100 },
  { name: 'Nile Holdings',    value: 36800 },
  { name: 'Marmara Lojistik', value: 29500 },
  { name: 'Levant Foods',     value: 21200 }
];

export default function RevenueDonut() {
  const total = MOCK.reduce((s, x) => s + x.value, 0);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', height: '100%' }}>
      <div style={{ position: 'relative' }}>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={MOCK}
              dataKey="value"
              cx="50%" cy="50%"
              innerRadius={56}
              outerRadius={90}
              paddingAngle={2}
              animationDuration={900}
            >
              {MOCK.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip
              formatter={(v) => `₺${Math.round(v).toLocaleString('tr-TR')}`}
              contentStyle={{
                background: '#FFF',
                border: `1px solid ${CUSTOMER_PALETTE.border.default}`,
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none'
        }}>
          <div style={{ fontSize: '11px', color: CUSTOMER_PALETTE.text.tertiary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Toplam
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: CUSTOMER_PALETTE.text.primary }}>
            ₺{Math.round(total / 1000)}K
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center' }}>
        {MOCK.map((item, i) => {
          const pct = (item.value / total) * 100;
          return (
            <div key={item.name} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              animation: `bar-fade ${500 + i * 80}ms cubic-bezier(0,0,0.2,1) both`,
              animationDelay: `${i * 80}ms`
            }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
              <span style={{
                flex: 1, fontSize: '12px', color: CUSTOMER_PALETTE.text.primary,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600
              }}>{item.name}</span>
              <span style={{ fontSize: '12px', color: CUSTOMER_PALETTE.text.secondary, fontWeight: 700 }}>{pct.toFixed(0)}%</span>
            </div>
          );
        })}
      </div>
      <style>{`@keyframes bar-fade { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: translateX(0); } }`}</style>
    </div>
  );
}
