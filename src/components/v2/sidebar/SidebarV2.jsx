import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { ChevronDown, ChevronRight, Search, Sparkles, LogOut, Settings, Menu as MenuIcon, X as XIcon } from 'lucide-react';
import { CUSTOMER_PALETTE } from '@/design-system-v2/colors';
import { SIDEBAR_REGISTRY } from '@/config/v2/sidebarRegistry';
import { useViewport } from '@/hooks/v2/useIsMobile';

const DEFAULT_LANG = 'tr';
const SIDEBAR_WIDTH = 268;
const SIDEBAR_WIDTH_COLLAPSED = 64;

const labelOf = (entry, lang = DEFAULT_LANG) =>
  (entry.labels && (entry.labels[lang] || entry.labels.tr)) || entry.id;

const resolveIcon = (name) => Icons[name] || Icons.Circle;

const iconBtnStyle = {
  background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)',
  cursor: 'pointer', padding: '6px', borderRadius: '6px'
};

export default function SidebarV2({
  language = DEFAULT_LANG,
  onOpenCmdK,
  user,
  onSignOut
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useViewport();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openHubs, setOpenHubs] = useState(() => {
    // Default: Tier 1 hubs open, Tier 2/3 collapsed
    const init = {};
    SIDEBAR_REGISTRY.forEach((tier) => {
      tier.hubs.forEach((hub) => {
        if (hub.children) init[hub.id] = tier.tier === 1;
      });
    });
    return init;
  });

  // Auto-close mobile drawer on route change
  useEffect(() => {
    if (isMobile) setMobileOpen(false);
  }, [location.pathname, isMobile]);

  // Lock body scroll while mobile drawer is open
  useEffect(() => {
    if (!isMobile) return undefined;
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobile, mobileOpen]);

  // Restore openHubs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('zyrix_v2_sidebar_open');
      if (stored) setOpenHubs(JSON.parse(stored));
    } catch { /* keep defaults */ }
  }, []);

  const persistOpenHubs = useCallback((next) => {
    setOpenHubs(next);
    try {
      localStorage.setItem('zyrix_v2_sidebar_open', JSON.stringify(next));
    } catch { /* ignore */ }
  }, []);

  const toggleHub = useCallback((hubId) => {
    persistOpenHubs({ ...openHubs, [hubId]: !openHubs[hubId] });
  }, [openHubs, persistOpenHubs]);

  const isActive = useCallback((route) => {
    if (!route) return false;
    return location.pathname === route || location.pathname.startsWith(route + '/');
  }, [location.pathname]);

  const width = collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH;

  // ───────────────────────────────────────────────
  // MOBILE: hamburger trigger + off-canvas drawer
  // Desktop JSX below remains pixel-identical.
  // ───────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Menüyü aç"
          style={{
            position: 'fixed',
            top: '12px',
            insetInlineStart: '12px',
            zIndex: 9994,
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: CUSTOMER_PALETTE.bg.sidebar,
            color: CUSTOMER_PALETTE.text.onSidebar,
            border: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(15,23,42,0.18)',
            cursor: 'pointer'
          }}
        >
          <MenuIcon size={20} />
        </button>

        {mobileOpen && (
          <>
            <div
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(15,23,42,0.55)',
                zIndex: 9998,
                animation: 'sidebar-backdrop-in 200ms ease both'
              }}
            />
            <aside style={{
              position: 'fixed',
              top: 0, bottom: 0,
              insetInlineStart: 0,
              width: 'min(86vw, 320px)',
              background: CUSTOMER_PALETTE.bg.sidebar,
              color: CUSTOMER_PALETTE.text.onSidebar,
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              animation: 'sidebar-slide-in 280ms cubic-bezier(0.4,0,0.2,1) both',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '64px',
                padding: '0 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255,255,255,0.06)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '32px', height: '32px',
                    borderRadius: '8px',
                    background: `linear-gradient(135deg, ${CUSTOMER_PALETTE.accent.cyan}, ${CUSTOMER_PALETTE.accent.violet})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '14px', color: '#FFF'
                  }}>Z</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, lineHeight: 1.1 }}>FinSuite</div>
                    <div style={{ fontSize: '10px', opacity: 0.65, lineHeight: 1.2 }}>v2 · beta</div>
                  </div>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Menüyü kapat"
                  style={{
                    width: '44px', height: '44px',
                    background: 'transparent', border: 'none',
                    color: CUSTOMER_PALETTE.text.onSidebarMuted,
                    cursor: 'pointer',
                    borderRadius: '8px',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  <XIcon size={20} />
                </button>
              </div>

              <button
                onClick={() => { setMobileOpen(false); onOpenCmdK?.(); }}
                style={{
                  margin: '12px',
                  padding: '12px',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '10px',
                  color: CUSTOMER_PALETTE.text.onSidebarMuted,
                  fontSize: '14px',
                  cursor: 'pointer',
                  textAlign: 'start',
                  minHeight: '44px',
                  fontFamily: "'Plus Jakarta Sans', sans-serif"
                }}
              >
                <Search size={16} />
                <span style={{ flex: 1 }}>Ne yapmak istersin?</span>
              </button>

              <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '4px 8px 24px' }}>
                {SIDEBAR_REGISTRY
                  .filter((tier) => !tier.hubs.every((h) => h.hidden))
                  .map((tier) => (
                    <div key={tier.tier} style={{ marginBottom: '12px' }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '14px 10px 6px'
                      }}>
                        <span style={{
                          width: '5px', height: '5px',
                          borderRadius: '50%',
                          background: tier.tier === 1 ? CUSTOMER_PALETTE.accent.cyan
                                  : tier.tier === 2 ? CUSTOMER_PALETTE.accent.violet
                                  : CUSTOMER_PALETTE.accent.amber
                        }} />
                        <span style={{
                          fontSize: '10px', fontWeight: 800,
                          letterSpacing: '0.08em', textTransform: 'uppercase',
                          color: 'rgba(255,255,255,0.45)'
                        }}>{labelOf(tier, language)}</span>
                      </div>
                      {tier.hubs
                        .filter((hub) => {
                          if (hub.hidden) return false;
                          if (!hub.children) return true;
                          return hub.children.some((c) => !c.hidden);
                        })
                        .map((hub) => (
                          <Hub
                            key={hub.id}
                            hub={hub}
                            language={language}
                            collapsed={false}
                            isOpen={openHubs[hub.id]}
                            isActive={isActive}
                            onToggle={() => toggleHub(hub.id)}
                            onNavigate={(r) => { setMobileOpen(false); navigate(r); }}
                          />
                        ))}
                    </div>
                  ))}
              </nav>

              <div style={{
                borderTop: '1px solid rgba(255,255,255,0.06)',
                padding: '12px',
                display: 'flex', alignItems: 'center', gap: '10px'
              }}>
                <div style={{
                  width: '36px', height: '36px',
                  borderRadius: '50%',
                  background: CUSTOMER_PALETTE.accent.violetSoft,
                  color: CUSTOMER_PALETTE.accent.violet,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: 700,
                  flexShrink: 0
                }}>{(user?.name || 'M').charAt(0).toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.name || 'Kullanıcı'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {user?.email || ''}
                  </div>
                </div>
                <button
                  onClick={() => { setMobileOpen(false); onSignOut?.(); }}
                  aria-label="Çıkış"
                  style={{
                    width: '44px', height: '44px',
                    background: 'transparent', border: 'none',
                    color: 'rgba(255,255,255,0.7)',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  <LogOut size={16} />
                </button>
              </div>

              <style>{`
                @keyframes sidebar-slide-in    { from { transform: translateX(-100%); } to { transform: translateX(0); } }
                @keyframes sidebar-backdrop-in { from { opacity: 0; } to { opacity: 1; } }
              `}</style>
            </aside>
          </>
        )}
      </>
    );
  }

  // ───────────────────────────────────────────────
  // DESKTOP / TABLET (>=768px): unchanged below.
  // ───────────────────────────────────────────────
  return (
    <aside style={{
      position: 'sticky',
      top: 0,
      height: '100vh',
      width: `${width}px`,
      flexShrink: 0,
      background: CUSTOMER_PALETTE.bg.sidebar,
      color: CUSTOMER_PALETTE.text.onSidebar,
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 200ms ease',
      borderInlineEnd: '1px solid rgba(255,255,255,0.06)',
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      {/* Brand + collapse toggle */}
      <div style={{
        height: '64px',
        padding: collapsed ? '0' : '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px',
              borderRadius: '8px',
              background: `linear-gradient(135deg, ${CUSTOMER_PALETTE.accent.cyan}, ${CUSTOMER_PALETTE.accent.violet})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '14px', color: '#FFF'
            }}>Z</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, lineHeight: 1.1 }}>FinSuite</div>
              <div style={{ fontSize: '10px', opacity: 0.65, lineHeight: 1.2 }}>v2 · beta</div>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            background: 'transparent',
            border: 'none',
            color: CUSTOMER_PALETTE.text.onSidebarMuted,
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            display: 'flex'
          }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} style={{ transform: 'rotate(-90deg)' }} />}
        </button>
      </div>

      {/* Cmd+K trigger */}
      {!collapsed && (
        <button
          onClick={onOpenCmdK}
          style={{
            margin: '12px',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            color: CUSTOMER_PALETTE.text.onSidebarMuted,
            fontSize: '13px',
            cursor: 'pointer',
            textAlign: 'start'
          }}
        >
          <Search size={14} />
          <span style={{ flex: 1 }}>Ne yapmak istersin?</span>
          <span style={{
            padding: '2px 6px',
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: 700,
            fontFamily: 'monospace'
          }}>⌘K</span>
        </button>
      )}

      {/* Tiers */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '4px 8px 16px' }}>
        {SIDEBAR_REGISTRY.map((tier) => (
          <div key={tier.tier} style={{ marginBottom: '12px' }}>
            {!collapsed && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '12px 10px 6px'
              }}>
                <span style={{
                  width: '5px', height: '5px',
                  borderRadius: '50%',
                  background: tier.tier === 1 ? CUSTOMER_PALETTE.accent.cyan
                          : tier.tier === 2 ? CUSTOMER_PALETTE.accent.violet
                          : CUSTOMER_PALETTE.accent.amber
                }} />
                <span style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.45)'
                }}>{labelOf(tier, language)}</span>
              </div>
            )}

            {tier.hubs
              .filter((hub) => {
                if (hub.hidden) return false;
                if (!hub.children) return true;
                return hub.children.some((c) => !c.hidden);
              })
              .map((hub) => (
                <Hub
                  key={hub.id}
                  hub={hub}
                  language={language}
                  collapsed={collapsed}
                  isOpen={openHubs[hub.id]}
                  isActive={isActive}
                  onToggle={() => toggleHub(hub.id)}
                  onNavigate={(r) => navigate(r)}
                />
              ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: collapsed ? '8px' : '12px',
        display: 'flex',
        flexDirection: collapsed ? 'column' : 'row',
        alignItems: 'center',
        gap: '8px'
      }}>
        {!collapsed ? (
          <>
            <div style={{
              width: '32px', height: '32px',
              borderRadius: '50%',
              background: CUSTOMER_PALETTE.accent.violetSoft,
              color: CUSTOMER_PALETTE.accent.violet,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 700,
              flexShrink: 0
            }}>{(user?.name || 'M').charAt(0).toUpperCase()}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#FFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || 'Kullanıcı'}
              </div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email || ''}
              </div>
            </div>
            <button
              onClick={() => navigate('/settings/profile')}
              title="Ayarlar"
              style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', padding: '4px' }}
            >
              <Settings size={14} />
            </button>
            <button
              onClick={onSignOut}
              title="Çıkış"
              style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', padding: '4px' }}
            >
              <LogOut size={14} />
            </button>
          </>
        ) : (
          <>
            <button onClick={() => navigate('/settings/profile')} title="Ayarlar" style={iconBtnStyle}><Settings size={16} /></button>
            <button onClick={onSignOut} title="Çıkış" style={iconBtnStyle}><LogOut size={16} /></button>
          </>
        )}
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────
// Hub component (single page or expandable group)
// ─────────────────────────────────────────────────────────────
function Hub({ hub, language, collapsed, isOpen, isActive, onToggle, onNavigate }) {
  const HubIcon = resolveIcon(hub.icon);
  const hasChildren = Boolean(hub.children?.length);
  const directActive = !hasChildren && isActive(hub.route);
  const childActive = hasChildren && hub.children.some((c) => isActive(c.route));
  const isHubActive = directActive || childActive;

  const onClick = () => {
    if (hasChildren) {
      onToggle();
    } else if (hub.route) {
      onNavigate(hub.route);
    }
  };

  return (
    <div>
      <button
        onClick={onClick}
        title={collapsed ? labelOf(hub, language) : undefined}
        style={{
          width: '100%',
          padding: collapsed ? '10px 0' : '8px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: collapsed ? '0' : '10px',
          justifyContent: collapsed ? 'center' : 'flex-start',
          background: isHubActive ? 'rgba(34,211,238,0.10)' : 'transparent',
          color: isHubActive ? CUSTOMER_PALETTE.accent.cyan : CUSTOMER_PALETTE.text.onSidebar,
          border: 'none',
          borderRadius: '8px',
          borderInlineStart: directActive ? `3px solid ${CUSTOMER_PALETTE.brand.wine}` : '3px solid transparent',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: isHubActive ? 700 : 500,
          marginBottom: '2px',
          textAlign: 'start',
          transition: 'background 150ms ease, color 150ms ease'
        }}
        onMouseEnter={(e) => { if (!isHubActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
        onMouseLeave={(e) => { if (!isHubActive) e.currentTarget.style.background = 'transparent'; }}
      >
        <HubIcon size={16} />
        {!collapsed && (
          <>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {labelOf(hub, language)}
            </span>
            {hub.ai && <Sparkles size={11} style={{ color: CUSTOMER_PALETTE.accent.violet, flexShrink: 0 }} />}
            {hasChildren && (
              <ChevronDown size={12}
                style={{
                  transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                  transition: 'transform 200ms ease',
                  opacity: 0.55, flexShrink: 0
                }}
              />
            )}
          </>
        )}
      </button>

      {/* Children (only if expanded and not collapsed) */}
      {hasChildren && isOpen && !collapsed && (
        <div style={{ paddingInlineStart: '20px', marginBottom: '4px' }}>
          {hub.children.filter((c) => !c.hidden).map((child) => {
            const active = isActive(child.route);
            return (
              <button
                key={child.id}
                onClick={() => onNavigate(child.route)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: active ? 'rgba(227,10,23,0.14)' : 'transparent',
                  color: active ? '#FFFFFF' : 'rgba(255,255,255,0.78)',
                  border: 'none',
                  borderRadius: '6px',
                  borderInlineStart: active ? `3px solid ${CUSTOMER_PALETTE.brand.wine}` : '3px solid transparent',
                  cursor: 'pointer',
                  fontSize: '12.5px',
                  fontWeight: active ? 700 : 500,
                  textAlign: 'start',
                  marginBottom: '1px',
                  transition: 'background 150ms ease'
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {labelOf(child, language)}
                </span>
                {child.ai && <Sparkles size={10} style={{ color: CUSTOMER_PALETTE.accent.violet, flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
