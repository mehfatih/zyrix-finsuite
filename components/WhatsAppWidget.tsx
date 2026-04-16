"use client";

import { useLocale } from "next-intl";
import { useState } from "react";

/* Replace with your real WhatsApp number */
const WA_NUMBER = "905452210888";

const MESSAGES = {
  tr: "Merhaba! Zyrix FinSuite hakkında bilgi almak istiyorum.",
  en: "Hello! I would like to get information about Zyrix FinSuite.",
  ar: "مرحباً! أود الحصول على معلومات حول Zyrix FinSuite.",
};

const TOOLTIP = {
  tr: "Hemen yazın — Türkçe destek",
  en: "Chat now — Turkish support",
  ar: "تحدث الآن — دعم تركي",
};

export function WhatsAppWidget() {
  const locale  = useLocale();
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const msg = encodeURIComponent(MESSAGES[locale as keyof typeof MESSAGES] ?? MESSAGES.tr);
  const url = `https://wa.me/${WA_NUMBER}?text=${msg}`;

  return (
    <div style={{
      position: "fixed",
      bottom: 28,
      right: 28,
      zIndex: 999,
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: 8,
    }}>
      {/* Tooltip bubble */}
      {hovered && (
        <div style={{
          background: "#111827",
          color: "#fff",
          fontSize: 13,
          fontWeight: 600,
          padding: "8px 14px",
          borderRadius: 10,
          whiteSpace: "nowrap",
          boxShadow: "0 4px 16px rgba(0,0,0,.2)",
          animation: "fadeInUp .2s ease",
        }}>
          {TOOLTIP[locale as keyof typeof TOOLTIP] ?? TOOLTIP.tr}
          <div style={{
            position: "absolute",
            bottom: -6,
            right: 20,
            width: 12,
            height: 12,
            background: "#111827",
            transform: "rotate(45deg)",
            borderRadius: 2,
          }} />
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Close button */}
        <button
          onClick={() => setVisible(false)}
          title="Kapat"
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "rgba(0,0,0,.3)",
            border: "none",
            color: "#fff",
            fontSize: 11,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
          }}
        >
          ✕
        </button>

        {/* WhatsApp button */}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            width: 58,
            height: 58,
            borderRadius: "50%",
            background: "#25D366",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 6px 24px rgba(37,211,102,.45)",
            transition: "all .2s",
            transform: hovered ? "scale(1.08)" : "scale(1)",
            textDecoration: "none",
            position: "relative",
          }}
        >
          {/* Pulse ring */}
          <div style={{
            position: "absolute",
            width: 58,
            height: 58,
            borderRadius: "50%",
            border: "3px solid #25D366",
            animation: "waPulse 2s infinite",
            opacity: .5,
          }} />

          {/* WhatsApp icon */}
          <svg width="30" height="30" viewBox="0 0 24 24" fill="#fff">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
      </div>

      <style>{`
        @keyframes waPulse {
          0%   { transform: scale(1);   opacity: .5; }
          70%  { transform: scale(1.4); opacity: 0;  }
          100% { transform: scale(1.4); opacity: 0;  }
        }
        @keyframes fadeInUp {
          from { opacity:0; transform:translateY(6px); }
          to   { opacity:1; transform:translateY(0);   }
        }
      `}</style>
    </div>
  );
}