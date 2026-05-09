import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const FeatureFlagsContext = createContext(null);

const DEFAULT_FLAGS = {
  customerDashboardV2:  false,
  newSidebarV2:         false,
  cmdKPalette:          false,
  aiCoPilotStrip:       false,
  customizableKpis:     false,
  taxIntelligenceCal:   false,
  universalUndo:        false
};

export function FeatureFlagsProvider({ children }) {
  const [flags, setFlags] = useState(DEFAULT_FLAGS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('zyrix_feature_flags');
      if (stored) {
        const parsed = JSON.parse(stored);
        setFlags({ ...DEFAULT_FLAGS, ...parsed });
      }
    } catch {
      // ignore corrupt localStorage payload
    }
  }, []);

  const setFlag = useCallback((key, value) => {
    setFlags((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem('zyrix_feature_flags', JSON.stringify(next));
      } catch {
        // ignore quota / privacy mode failures
      }
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    setFlags(DEFAULT_FLAGS);
    try {
      localStorage.removeItem('zyrix_feature_flags');
    } catch {
      // ignore
    }
  }, []);

  return (
    <FeatureFlagsContext.Provider value={{ flags, setFlag, resetAll }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export const useFeatureFlags = () => {
  const ctx = useContext(FeatureFlagsContext);
  if (!ctx) throw new Error('useFeatureFlags must be used within FeatureFlagsProvider');
  return ctx;
};

export const useFlag = (key) => {
  const { flags } = useFeatureFlags();
  return Boolean(flags[key]);
};
