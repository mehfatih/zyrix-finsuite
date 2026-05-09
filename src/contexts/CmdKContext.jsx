import { createContext, useContext, useEffect, useState, useCallback, lazy, Suspense } from 'react';

const LazyPalette = lazy(() => import('@/components/v2/cmdk/CommandPalette'));

const CmdKContext = createContext(null);

export function CmdKProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  const openPalette = useCallback(() => {
    setHasMounted(true);
    setOpen(true);
  }, []);
  const closePalette = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setHasMounted(true);
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <CmdKContext.Provider value={{ open, openPalette, closePalette }}>
      {children}
      {hasMounted && (
        <Suspense fallback={null}>
          <LazyPalette open={open} onClose={closePalette} />
        </Suspense>
      )}
    </CmdKContext.Provider>
  );
}

export const useCmdK = () => {
  const ctx = useContext(CmdKContext);
  if (!ctx) throw new Error('useCmdK must be used within CmdKProvider');
  return ctx;
};
