// ================================================================
// Sprint D-8 — Context-aware suggested prompts.
//
// Three chips above the chat input. V1 ships a curated locale-
// aware seed list (per spec examples); V2 will dynamically
// generate based on the merchant's current data state (overdue
// invoices, upcoming taxes, etc.) — that's a future enhancement.
//
// Click → fills the chat input via onPick callback (parent owns
// the input state).
// ================================================================
import React, { useMemo } from 'react';

const SEEDS = {
  tr: [
    'Bu ayki en büyük masrafım ne?',
    'Geçen aya göre ne değişti?',
    'Önümüzdeki ay nakit dengem ne olacak?',
    'Hangi vergi ödemelerim yaklaşıyor?',
    'Hangi müşterim en kârlı?'
  ],
  en: [
    'What is my biggest expense this month?',
    'What changed vs last month?',
    'What will my cash balance be next month?',
    'Which tax payments are coming up?',
    'Which customer is most profitable?'
  ],
  ar: [
    'ما أكبر مصاريفي هذا الشهر؟',
    'ما الذي تغير مقارنةً بالشهر الماضي؟',
    'كم سيكون رصيدي النقدي الشهر القادم؟',
    'أي مدفوعات ضريبية قادمة؟',
    'أي عميل هو الأكثر ربحاً؟'
  ]
};

export default function SuggestedPrompts({ language = 'tr', onPick }) {
  const prompts = useMemo(() => {
    const all = SEEDS[language] || SEEDS.tr;
    // Surface 3 — rotate by day so the same merchant sees variety
    // without us actually maintaining personalization yet.
    const dayOffset = Math.floor(Date.now() / (24 * 60 * 60 * 1000)) % all.length;
    const out = [];
    for (let i = 0; i < 3; i++) {
      out.push(all[(dayOffset + i) % all.length]);
    }
    return out;
  }, [language]);

  if (!prompts.length) return null;

  return (
    <div
      style={{
        display: 'flex',
        gap: 6,
        padding: '8px 14px 0',
        flexWrap: 'wrap'
      }}
    >
      {prompts.map((p, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onPick?.(p)}
          style={{
            padding: '5px 10px',
            background: 'rgba(0, 217, 255, 0.08)',
            color: '#5DFAFF',
            border: '1px solid rgba(0, 217, 255, 0.30)',
            borderRadius: 999,
            fontSize: 11, fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 0 1px rgba(0, 217, 255, 0.45)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
