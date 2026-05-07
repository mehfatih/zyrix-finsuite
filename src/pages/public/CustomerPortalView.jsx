// ================================================================
// Public CustomerPortalView — no-login, customer-facing portal page
// Route: /portal/:slug
// ================================================================
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { localStore, KEYS, loadPortalBrand, fmtCurrency, fmtDate, api } from "../dashboard/voice-cx/voiceCxApi";

export default function CustomerPortalView() {
  const { slug } = useParams();
  const [portal, setPortal] = useState(null);
  const [brand, setBrand] = useState(loadPortalBrand());
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setBrand(loadPortalBrand());
    const all = localStore.list(KEYS.portals);
    const found = all.find((p) => p.slug === slug);
    if (found) {
      setPortal(found);
      // bump view count
      localStore.update(KEYS.portals, found.id, { views: (Number(found.views) || 0) + 1, lastView: new Date().toISOString() });
      api(`/api/invoices?customerId=${found.customerId}`).then((r) => {
        const items = r?.data?.invoices || r?.data?.items || r?.data || [];
        setInvoices(Array.isArray(items) ? items : []);
        setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [slug]);

  const primary = brand.primaryColor || "#E30A17";
  const primaryDark = primary;

  const outstanding = useMemo(() =>
    invoices.filter((i) => String(i.status || "").toLowerCase() !== "paid").reduce((s, i) => s + (Number(i.totalAmount || i.total) || 0), 0),
    [invoices]
  );

  if (loading) {
    return (
      <PortalShell primary={primary}>
        <div style={{ padding: 60, textAlign: "center", color: "#94A3B8" }}>Loading…</div>
      </PortalShell>
    );
  }

  if (!portal) {
    return (
      <PortalShell primary={primary}>
        <div style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🪟</div>
          <h1 style={{ fontSize: 22, color: "#0F172A", margin: "0 0 8px" }}>Portal not found</h1>
          <p style={{ color: "#64748B", fontSize: 14 }}>The link you opened is invalid or has been disabled.</p>
        </div>
      </PortalShell>
    );
  }

  const enabled = brand.enabledFeatures || [];
  const welcome = brand.welcomeMessage || `Welcome to your portal`;

  return (
    <PortalShell primary={primary}>
      {/* Branded header */}
      <div style={{ background: `linear-gradient(135deg, ${primary}, ${primaryDark}E0)`, color: "#fff", padding: "32px 24px 40px", borderRadius: "0 0 24px 24px", boxShadow: `0 12px 40px ${primary}40` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(255,255,255,0.2)", display: "grid", placeItems: "center", overflow: "hidden" }}>
            {brand.logoDataUrl ? (
              <img src={brand.logoDataUrl} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
            ) : (
              <span style={{ fontSize: 22 }}>🏢</span>
            )}
          </div>
          <div>
            <div style={{ fontSize: 12, opacity: 0.85, fontWeight: 700 }}>portal.zyrix.co</div>
            <div style={{ fontSize: 10, opacity: 0.65 }}>/{slug}</div>
          </div>
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{welcome}</div>
        <div style={{ fontSize: 14, opacity: 0.85 }}>{portal.customerName}</div>
      </div>

      <div style={{ padding: "20px 24px 60px" }}>
        {enabled.includes("payOnline") && outstanding > 0 && (
          <div
            style={{
              background: `linear-gradient(135deg, #fff, ${primary}10)`,
              border: `1.5px solid ${primary}30`,
              borderRadius: 16, padding: 20, marginBottom: 20,
              boxShadow: `0 6px 20px ${primary}15`,
            }}
          >
            <div style={{ fontSize: 11, color: "#64748B", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Outstanding balance
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: primary, fontFamily: "monospace", margin: "6px 0 14px" }}>
              {fmtCurrency(outstanding)}
            </div>
            <button
              type="button"
              style={{
                width: "100%",
                background: `linear-gradient(135deg, ${primary}, ${primaryDark})`,
                color: "#fff", border: "none",
                padding: "14px 20px", borderRadius: 12, fontSize: 14, fontWeight: 800, cursor: "pointer",
                boxShadow: `0 8px 22px ${primary}60`,
              }}
              onClick={() => alert("Zyrix Pay integration coming soon")}
            >
              💳 Pay now
            </button>
          </div>
        )}

        {enabled.includes("viewInvoices") && (
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 12px" }}>
              Recent invoices
            </h2>
            {invoices.length === 0 ? (
              <div style={{ textAlign: "center", color: "#94A3B8", fontSize: 13, padding: 24, background: "#F8FAFC", borderRadius: 12 }}>
                No invoices yet
              </div>
            ) : (
              invoices.slice(0, 8).map((inv) => {
                const isPaid = String(inv.status || "").toLowerCase() === "paid";
                return (
                  <div
                    key={inv.id}
                    style={{
                      background: "#fff", border: "1px solid #E2E8F0",
                      borderRadius: 12, padding: 14, marginBottom: 8,
                      display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", marginBottom: 2 }}>
                        Invoice #{inv.invoiceNumber || inv.number || inv.id}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748B" }}>
                        {fmtDate(inv.invoiceDate || inv.dueDate)} · {fmtCurrency(inv.totalAmount || inv.total || 0)}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                      <span
                        style={{
                          fontSize: 9, fontWeight: 800,
                          background: isPaid ? "#DCFCE7" : "#FEF2F2",
                          color: isPaid ? "#166534" : "#9F1239",
                          padding: "3px 8px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.06em",
                        }}
                      >
                        {isPaid ? "Paid" : "Unpaid"}
                      </span>
                      {enabled.includes("downloadPdf") && (
                        <a href="#" style={{ fontSize: 10, color: primary, fontWeight: 700, textDecoration: "none" }}>
                          ⬇ PDF
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        <div style={{ background: "#F8FAFC", padding: 20, borderRadius: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", marginBottom: 12 }}>
            Need something?
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {enabled.includes("requestNew") && (
              <button type="button" style={{ background: "#fff", border: "1px solid #E2E8F0", color: "#0F172A", padding: "10px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                📄 Request new invoice
              </button>
            )}
            <button type="button" style={{ background: "#25D366", color: "#fff", border: "none", padding: "10px 16px", borderRadius: 10, fontSize: 12, fontWeight: 800, cursor: "pointer" }}>
              💬 Contact via WhatsApp
            </button>
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "20px 0 30px", color: "#94A3B8", fontSize: 11 }}>
        Powered by <strong style={{ color: "#0F172A" }}>Zyrix FinSuite</strong>
      </div>
    </PortalShell>
  );
}

function PortalShell({ primary, children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: `radial-gradient(circle at 0% 0%, ${primary}10, #F8FAFC 60%)`,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div style={{ maxWidth: 540, margin: "0 auto", background: "#fff", minHeight: "100vh", boxShadow: "0 0 60px rgba(0,0,0,0.05)" }}>
        {children}
      </div>
    </div>
  );
}
