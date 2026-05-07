// ================================================================
// SkeletonScreen — animated shimmer loader for Suspense fallbacks.
// Replaces inline "Loading…" text across lazy routes.
// ================================================================
import React from "react";

const SHIMMER = `linear-gradient(90deg, #F1F5F9 0%, #E2E8F0 50%, #F1F5F9 100%)`;

export default function SkeletonScreen({ kind = "page" }) {
  if (kind === "row") return <SkeletonRow />;
  if (kind === "card") return <SkeletonCard />;
  return <SkeletonPage />;
}

function SkeletonPage() {
  return (
    <div role="status" aria-label="Loading" aria-busy="true" style={{ padding: 24, animation: "skelFade .25s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <Block w={48} h={48} round={14} />
        <div style={{ flex: 1 }}>
          <Block w="40%" h={22} round={6} />
          <div style={{ height: 8 }} />
          <Block w="55%" h={14} round={6} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} delay={i * 0.08} />)}
      </div>

      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, padding: 20 }}>
        <Block w="30%" h={16} round={6} />
        <div style={{ height: 16 }} />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F1F5F9" }}>
            <Block w={32} h={32} round={8} delay={i * 0.05} />
            <div style={{ flex: 1 }}>
              <Block w={`${60 + (i * 7)}%`} h={12} round={4} delay={i * 0.05} />
              <div style={{ height: 6 }} />
              <Block w={`${30 + (i * 5)}%`} h={10} round={4} delay={i * 0.05} />
            </div>
            <Block w={70} h={26} round={999} delay={i * 0.05} />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes skelShimmer { 0% { background-position: -300px 0; } 100% { background-position: calc(300px + 100%) 0; } }
        @keyframes skelFade    { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}

function SkeletonCard({ delay = 0 }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 14, padding: 16 }}>
      <Block w="50%" h={10} round={4} delay={delay} />
      <div style={{ height: 12 }} />
      <Block w="70%" h={24} round={6} delay={delay} />
      <div style={{ height: 10 }} />
      <Block w="40%" h={10} round={4} delay={delay} />
    </div>
  );
}

function SkeletonRow() {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 0" }}>
      <Block w={32} h={32} round={8} />
      <div style={{ flex: 1 }}>
        <Block w="60%" h={12} round={4} />
        <div style={{ height: 6 }} />
        <Block w="35%" h={10} round={4} />
      </div>
    </div>
  );
}

function Block({ w, h, round = 6, delay = 0 }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: round,
        background: SHIMMER,
        backgroundSize: "300px 100%",
        animation: `skelShimmer 1.4s ${delay}s linear infinite`,
      }}
    />
  );
}
