import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Undo2, X } from 'lucide-react';
import { CUSTOMER_PALETTE } from '@/design-system-v2/colors';

const UndoContext = createContext(null);

const VISIBILITY_MS = 30_000;

/**
 * Universal undo provider. Any code can call `pushUndo({ label, undo })` to
 * surface a temporary toast at bottom-center with an Undo button. Multiple
 * undos stack (last 3 visible); each auto-dismisses after 30s.
 */
export function UndoProvider({ children }) {
  const [stack, setStack] = useState([]);
  const [, forceTick] = useState(0); // re-render every second so progress bars animate

  const pushUndo = useCallback(({ label, undo }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setStack((s) => [...s, { id, label, undo, createdAt: Date.now() }]);
  }, []);

  const dismiss = useCallback((id) => {
    setStack((s) => s.filter((u) => u.id !== id));
  }, []);

  const performUndo = useCallback((id) => {
    setStack((s) => {
      const target = s.find((u) => u.id === id);
      if (target?.undo) {
        try { target.undo(); } catch (err) { console.error('Undo failed:', err); }
      }
      return s.filter((u) => u.id !== id);
    });
  }, []);

  // Auto-dismiss after 30s and tick progress bar
  useEffect(() => {
    if (stack.length === 0) return undefined;
    const t = setInterval(() => {
      const now = Date.now();
      setStack((s) => s.filter((u) => now - u.createdAt < VISIBILITY_MS));
      forceTick((n) => n + 1);
    }, 1000);
    return () => clearInterval(t);
  }, [stack.length]);

  return (
    <UndoContext.Provider value={{ pushUndo }}>
      {children}
      {stack.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '24px', left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9997,
          display: 'flex', flexDirection: 'column-reverse', gap: '8px',
          fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
          {stack.slice(-3).map((u) => {
            const remaining = Math.max(0, VISIBILITY_MS - (Date.now() - u.createdAt));
            const pct = (remaining / VISIBILITY_MS) * 100;
            return (
              <div key={u.id} style={{
                position: 'relative',
                background: CUSTOMER_PALETTE.text.primary,
                color: '#FFF',
                padding: '10px 14px',
                borderRadius: '12px',
                boxShadow: '0 12px 30px rgba(15,23,42,0.30)',
                display: 'flex', alignItems: 'center', gap: '10px',
                minWidth: 'min(320px, calc(100vw - 32px))',
                maxWidth: 'calc(100vw - 32px)',
                animation: 'undo-in 300ms cubic-bezier(0.34, 1.56, 0.64, 1) both'
              }}>
                <span style={{ fontSize: '13px', fontWeight: 600, flex: 1 }}>{u.label}</span>
                <button
                  onClick={() => performUndo(u.id)}
                  style={{
                    background: CUSTOMER_PALETTE.accent.violet,
                    color: '#FFF', border: 'none',
                    padding: '4px 10px', borderRadius: '6px',
                    fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    fontFamily: 'inherit'
                  }}
                >
                  <Undo2 size={12} /> Geri Al
                </button>
                <button
                  onClick={() => dismiss(u.id)}
                  style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '2px' }}
                >
                  <X size={14} />
                </button>
                <span style={{
                  position: 'absolute', bottom: 0, left: 0,
                  height: '2px', width: `${pct}%`,
                  background: CUSTOMER_PALETTE.accent.violet,
                  transition: 'width 1s linear',
                  borderRadius: '0 0 12px 12px'
                }} />
              </div>
            );
          })}
          <style>{`
            @keyframes undo-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
          `}</style>
        </div>
      )}
    </UndoContext.Provider>
  );
}

export const useUndo = () => {
  const ctx = useContext(UndoContext);
  if (!ctx) throw new Error('useUndo must be used within UndoProvider');
  return ctx;
};
