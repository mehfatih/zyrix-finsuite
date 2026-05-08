// ================================================================
// BrandedLoader — full-viewport branded Suspense fallback.
// Replaces the old SkeletonScreen page fallback so route-to-route
// transitions never paint a white flash before the next page mounts.
// Dark wine background matches the landing page hero, so even if the
// next page is white-themed the transition feels intentional rather
// than blank.
// ================================================================
import React from "react";

export default function BrandedLoader({ label = "Loading…" }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        display: "grid",
        placeItems: "center",
        background:
          "radial-gradient(ellipse 900px 700px at 50% 40%, rgba(168, 8, 26, 0.35), transparent 60%), " +
          "linear-gradient(135deg, #2A0306 0%, #4A070C 35%, #1A0205 70%, #0F0103 100%)",
        color: "#fff",
        fontFamily: "'Plus Jakarta Sans', 'Manrope', system-ui, sans-serif",
      }}
    >
      <style>{`
        @keyframes zyrixLoaderSpin { to { transform: rotate(360deg); } }
        @keyframes zyrixLoaderPulse {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50%      { opacity: 0.95; transform: scale(1.08); }
        }
        @keyframes zyrixLoaderFade { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      <div style={{
        animation: "zyrixLoaderFade .25s ease-out",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 22,
      }}>
        {/* Logo + spinning ring */}
        <div style={{ position: "relative", width: 84, height: 84 }}>
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "3px solid rgba(255, 215, 0, 0.18)",
              borderTopColor: "#FFD700",
              animation: "zyrixLoaderSpin 0.95s linear infinite",
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 10,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.92)",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 8px 28px rgba(0,0,0,0.45)",
              animation: "zyrixLoaderPulse 1.6s ease-in-out infinite",
            }}
          >
            <span style={{
              fontSize: 28,
              fontWeight: 900,
              background: "linear-gradient(135deg, #E30A17, #B30810)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.02em",
            }}>Z</span>
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: 10,
            fontWeight: 800,
            color: "rgba(255, 215, 0, 0.85)",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: 4,
          }}>Zyrix FinSuite</div>
          <div style={{
            fontSize: 13,
            fontWeight: 700,
            color: "rgba(255,255,255,0.78)",
            letterSpacing: "0.04em",
          }}>{label}</div>
        </div>
      </div>
    </div>
  );
}
