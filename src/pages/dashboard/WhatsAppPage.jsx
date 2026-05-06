// ============================================================
// Zyrix FinSuite - WhatsApp Page (extended)
// 4 tabs: Messages | Send PDF | Bulk Campaign | Auto Reminders
// ============================================================

import React, { useState, useEffect } from "react";
import { whatsappAPI } from "../../services/api";

const COLORS = {
  primary: "#0891B2",
  accent: "#06B6D4",
  text: "#1E1B4B",
  muted: "#64748B",
  border: "#E2E8F8",
  bg: "#F8FAFC",
  whatsapp: "#25D366",
};

const STATUS_LABELS = {
  PENDING:   { label: "Bekliyor",      color: "#94A3B8", bg: "#F1F5F9" },
  QUEUED:    { label: "Kuyrukta",      color: "#0EA5E9", bg: "#E0F2FE" },
  SENT:      { label: "Gonderildi",    color: "#6366F1", bg: "#E0E7FF" },
  DELIVERED: { label: "Teslim Edildi", color: "#10B981", bg: "#D1FAE5" },
  READ:      { label: "Okundu",        color: "#10B981", bg: "#D1FAE5" },
  FAILED:    { label: "Hata",          color: "#EF4444", bg: "#FEE2E2" },
};

export default function WhatsAppPage() {
  const [tab, setTab] = useState("messages");

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: COLORS.text }}>
          💬 WhatsApp Business
        </h1>
        <p style={{ margin: "4px 0 0", color: COLORS.muted, fontSize: 13 }}>
          Send invoices, run bulk campaigns, and configure auto-reminders.
        </p>
      </div>

      <div style={{ display: "flex", gap: 4, borderBottom: `1.5px solid ${COLORS.border}`, marginBottom: 24, flexWrap: "wrap" }}>
        <TabBtn active={tab === "messages"}  onClick={() => setTab("messages")}>📋 Messages</TabBtn>
        <TabBtn active={tab === "pdf"}       onClick={() => setTab("pdf")}>📄 Send PDF</TabBtn>
        <TabBtn active={tab === "bulk"}      onClick={() => setTab("bulk")}>📢 Bulk Campaign</TabBtn>
        <TabBtn active={tab === "reminders"} onClick={() => setTab("reminders")}>⏰ Auto Reminders</TabBtn>
      </div>

      {tab === "messages"  && <MessagesTab />}
      {tab === "pdf"       && <SendPdfTab />}
      {tab === "bulk"      && <BulkTab />}
      {tab === "reminders" && <RemindersTab />}
    </div>
  );
}

// ============================================================
// MESSAGES TAB - List of all sent messages
// ============================================================

function MessagesTab() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (statusFilter) params.status = statusFilter;
      const r = await whatsappAPI.list(params);
      setRows(r?.data?.rows || []);
      setTotal(r?.data?.total || 0);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  if (loading) return <Loading>Loading messages...</Loading>;
  if (error) return <ErrorBox>{error}</ErrorBox>;

  // Stats
  const sent = rows.filter((r) => r.status === "SENT").length;
  const delivered = rows.filter((r) => r.status === "DELIVERED" || r.status === "READ").length;
  const read = rows.filter((r) => r.status === "READ").length;
  const failed = rows.filter((r) => r.status === "FAILED").length;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
        <StatCard label="Total" value={total} />
        <StatCard label="Sent" value={sent} color={COLORS.primary} />
        <StatCard label="Delivered" value={delivered} color="#10B981" />
        <StatCard label="Read" value={read} color="#10B981" />
        <StatCard label="Failed" value={failed} color={failed > 0 ? "#EF4444" : COLORS.muted} />
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ ...inp, width: "auto", padding: "8px 12px" }}
        >
          <option value="">All statuses</option>
          {Object.keys(STATUS_LABELS).map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s].label}</option>
          ))}
        </select>
        <button onClick={load} style={btnSm}>🔄 Refresh</button>
      </div>

      {rows.length === 0 ? (
        <EmptyState>No messages sent yet.</EmptyState>
      ) : (
        <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${COLORS.border}`, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: COLORS.bg }}>
              <tr>
                <Th>Recipient</Th>
                <Th>Type</Th>
                <Th>Message</Th>
                <Th>Status</Th>
                <Th>Sent</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const st = STATUS_LABELS[r.status] || STATUS_LABELS.PENDING;
                return (
                  <tr key={r.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                    <Td><span style={{ fontFamily: "monospace", fontSize: 12 }}>{r.recipientPhone}</span></Td>
                    <Td><span style={{ fontSize: 11, color: COLORS.muted, textTransform: "uppercase" }}>{r.messageType}</span></Td>
                    <Td>
                      <div style={{ maxWidth: 320, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: 12 }}>
                        {r.bodyText || (r.mediaUrl ? "📎 Media" : "—")}
                      </div>
                    </Td>
                    <Td>
                      <span style={{ background: st.bg, color: st.color, padding: "3px 10px", borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                        {st.label}
                      </span>
                    </Td>
                    <Td><span style={{ fontSize: 11, color: COLORS.muted }}>{new Date(r.createdAt).toLocaleString("tr-TR")}</span></Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================
// SEND PDF TAB
// ============================================================

function SendPdfTab() {
  const [invoiceId, setInvoiceId] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const submit = async () => {
    setError(null);
    setResult(null);
    if (!invoiceId || !pdfUrl) {
      setError("Invoice ID and PDF URL are required.");
      return;
    }
    setSubmitting(true);
    try {
      const r = await whatsappAPI.sendPdf(invoiceId, {
        recipientPhone: recipientPhone || undefined,
        pdfUrl,
        caption: caption || undefined,
        documentName: documentName || undefined,
      });
      setResult(r?.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      <div>
        <h3 style={{ margin: "0 0 6px", fontSize: 16, color: COLORS.text }}>Send Invoice as PDF</h3>
        <p style={{ margin: "0 0 16px", fontSize: 12, color: COLORS.muted }}>
          Sends a PDF document to the customer's WhatsApp. The customer can preview, save, and forward it inside WhatsApp.
        </p>

        <Field label="Invoice ID *">
          <input value={invoiceId} onChange={(e) => setInvoiceId(e.target.value)} style={inp} placeholder="UUID of the invoice" />
        </Field>
        <Field label="PDF URL *">
          <input value={pdfUrl} onChange={(e) => setPdfUrl(e.target.value)} style={inp} placeholder="https://..." />
        </Field>
        <Field label="Recipient Phone (override)">
          <input value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} style={inp} placeholder="+90555... (defaults to invoice contact)" />
        </Field>
        <Field label="Caption">
          <input value={caption} onChange={(e) => setCaption(e.target.value)} style={inp} placeholder="Faturaniz: #..." />
        </Field>
        <Field label="Document Filename">
          <input value={documentName} onChange={(e) => setDocumentName(e.target.value)} style={inp} placeholder="Fatura-XXX.pdf" />
        </Field>

        <button onClick={submit} disabled={submitting} style={{ ...btnPrimary, opacity: submitting ? 0.6 : 1, marginTop: 12 }}>
          {submitting ? "Sending..." : "📄 Send PDF"}
        </button>
      </div>

      <div>
        {error && <ErrorBox>{error}</ErrorBox>}
        {result && (
          <div style={{ background: "#D1FAE5", color: "#065F46", padding: 16, borderRadius: 12 }}>
            <strong>✓ Sent successfully</strong>
            <div style={{ fontSize: 12, marginTop: 8, fontFamily: "monospace" }}>
              Message ID: {result.providerMessageId || result.id}
            </div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              Status: {result.status}
            </div>
          </div>
        )}
        {!error && !result && (
          <div style={{ padding: 20, background: COLORS.bg, borderRadius: 12, border: `1px dashed ${COLORS.border}` }}>
            <strong style={{ fontSize: 13, color: COLORS.text }}>📄 PDF Send Tips</strong>
            <ul style={{ fontSize: 12, color: COLORS.muted, marginTop: 8, paddingLeft: 18, lineHeight: 1.7 }}>
              <li>The PDF URL must be publicly accessible (not behind auth).</li>
              <li>Max file size: 100 MB (Meta limit).</li>
              <li>The recipient must have messaged your business first OR the message must use a template.</li>
              <li>If you leave Recipient Phone empty, the invoice's customerPhone will be used.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// BULK CAMPAIGN TAB
// ============================================================

function BulkTab() {
  const [recipientsRaw, setRecipientsRaw] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const recipients = recipientsRaw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 8);

  const submit = async () => {
    setError(null);
    setResult(null);
    if (recipients.length === 0) {
      setError("Add at least one phone number.");
      return;
    }
    if (recipients.length > 100) {
      setError("Maximum 100 recipients per campaign.");
      return;
    }
    if (!bodyText.trim()) {
      setError("Message body is required.");
      return;
    }
    if (!confirm(`Send "${bodyText.substring(0, 50)}..." to ${recipients.length} recipients? Bulk sends count toward your hourly campaign limit (5/hr).`)) {
      return;
    }
    setSubmitting(true);
    try {
      const r = await whatsappAPI.bulkSend({ recipients, bodyText, campaignName: campaignName || undefined });
      setResult(r?.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      <div>
        <h3 style={{ margin: "0 0 6px", fontSize: 16, color: COLORS.text }}>Bulk Campaign</h3>
        <p style={{ margin: "0 0 16px", fontSize: 12, color: COLORS.muted }}>
          Send the same message to up to 100 numbers. Throttled at ~10 msg/sec.
        </p>

        <Field label={`Recipients (${recipients.length} valid)`}>
          <textarea
            value={recipientsRaw}
            onChange={(e) => setRecipientsRaw(e.target.value)}
            style={{ ...inp, minHeight: 120, fontFamily: "monospace", fontSize: 12 }}
            placeholder="One number per line, e.g.:&#10;+905551234567&#10;+905559876543"
          />
        </Field>

        <Field label="Campaign Name (optional)">
          <input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} style={inp} placeholder="Q4 promo, end-of-year reminder..." />
        </Field>

        <Field label="Message Body *">
          <textarea
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            style={{ ...inp, minHeight: 100 }}
            placeholder="Hello, we have a special offer..."
            maxLength={4000}
          />
          <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 4, textAlign: "right" }}>
            {bodyText.length} / 4000
          </div>
        </Field>

        <button onClick={submit} disabled={submitting} style={{ ...btnPrimary, opacity: submitting ? 0.6 : 1, marginTop: 12 }}>
          {submitting ? "Sending..." : "📢 Send Campaign"}
        </button>
      </div>

      <div>
        {error && <ErrorBox>{error}</ErrorBox>}
        {result && (
          <div>
            <div style={{ background: COLORS.bg, padding: 16, borderRadius: 12, marginBottom: 12 }}>
              <strong style={{ fontSize: 13, color: COLORS.text }}>Campaign Results</strong>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: COLORS.muted }}>Total</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.text }}>{result.total}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: COLORS.muted }}>Successful</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#10B981" }}>{result.successful}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: COLORS.muted }}>Failed</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: result.failed > 0 ? "#EF4444" : COLORS.muted }}>{result.failed}</div>
                </div>
              </div>
            </div>
            {result.results && result.results.length > 0 && (
              <div style={{ background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 10, maxHeight: 300, overflow: "auto" }}>
                {result.results.map((r, i) => (
                  <div key={i} style={{
                    padding: "8px 12px",
                    borderBottom: i < result.results.length - 1 ? `1px solid ${COLORS.border}` : "none",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}>
                    <span style={{ fontFamily: "monospace", fontSize: 12 }}>{r.phone}</span>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: r.success ? "#065F46" : "#991B1B",
                    }}>
                      {r.success ? "✓ Sent" : `✗ ${r.error || "Failed"}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {!error && !result && (
          <div style={{ padding: 20, background: COLORS.bg, borderRadius: 12, border: `1px dashed ${COLORS.border}` }}>
            <strong style={{ fontSize: 13, color: COLORS.text }}>📢 Bulk Campaign Tips</strong>
            <ul style={{ fontSize: 12, color: COLORS.muted, marginTop: 8, paddingLeft: 18, lineHeight: 1.7 }}>
              <li>Numbers must be in E.164 format (+90...).</li>
              <li>Duplicates are auto-removed.</li>
              <li>Limit: 5 campaigns/hour, 100 recipients each.</li>
              <li>Each message must comply with WhatsApp's commerce policy.</li>
              <li>Recipients must have opted in OR initiated contact within 24h.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// AUTO REMINDERS TAB
// ============================================================

function RemindersTab() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const run = async () => {
    if (!confirm("Run reminders now? This sends WhatsApp messages to all customers with overdue or upcoming-due invoices.")) return;
    setError(null);
    setResult(null);
    setRunning(true);
    try {
      const r = await whatsappAPI.runReminders();
      setResult(r?.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div>
      <div style={{ background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 24 }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 16, color: COLORS.text }}>How Auto Reminders Work</h3>
        <p style={{ margin: "0 0 12px", fontSize: 13, color: COLORS.muted, lineHeight: 1.6 }}>
          Auto-reminders run daily and send WhatsApp messages to customers based on invoice due dates.
          Each reminder tier fires once per invoice per day.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 16 }}>
          <ReminderTier label="7 Days Before" days={7} color="#10B981" before />
          <ReminderTier label="On Due Date" days={0} color="#F59E0B" />
          <ReminderTier label="3 Days Late" days={3} color="#F97316" />
          <ReminderTier label="7 Days Late" days={7} color="#EF4444" />
          <ReminderTier label="14 Days Late" days={14} color="#991B1B" />
        </div>

        <div style={{ background: COLORS.bg, padding: 14, borderRadius: 10, marginTop: 20, fontSize: 12, color: COLORS.muted }}>
          <strong style={{ color: COLORS.text }}>Multilingual:</strong> Reminders are sent in your account language (TR/EN/AR), preserving the customer's name, invoice number, amount, and due date.
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, padding: 20, background: COLORS.bg, borderRadius: 14 }}>
        <div>
          <strong style={{ fontSize: 15, color: COLORS.text }}>Manual Trigger</strong>
          <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 4 }}>
            Useful for testing or catching up after configuration changes. The cron runs automatically every day.
          </div>
        </div>
        <button onClick={run} disabled={running} style={{ ...btnPrimary, opacity: running ? 0.6 : 1, whiteSpace: "nowrap" }}>
          {running ? "Running..." : "▶ Run Now"}
        </button>
      </div>

      {error && <div style={{ marginTop: 16 }}><ErrorBox>{error}</ErrorBox></div>}
      {result && (
        <div style={{ marginTop: 16, background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 20 }}>
          <strong style={{ fontSize: 14, color: COLORS.text }}>Run Results</strong>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 14 }}>
            <SmallStat label="Invoices" value={result.invoicesProcessed} />
            <SmallStat label="Sent" value={result.remindersSent} color="#10B981" />
            <SmallStat label="Skipped" value={result.remindersSkipped} />
            <SmallStat label="Failed" value={result.remindersFailed} color={result.remindersFailed > 0 ? "#EF4444" : COLORS.muted} />
          </div>
          {result.byTier && (
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 600, marginBottom: 8, textTransform: "uppercase" }}>By Tier</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {Object.entries(result.byTier).map(([tier, count]) => (
                  <div key={tier} style={{ background: COLORS.bg, padding: "6px 12px", borderRadius: 8, fontSize: 11 }}>
                    <span style={{ color: COLORS.muted }}>{tier}: </span>
                    <strong style={{ color: COLORS.text }}>{count}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReminderTier({ label, days, color, before }) {
  return (
    <div style={{ background: COLORS.bg, padding: 12, borderRadius: 10, borderLeft: `3px solid ${color}` }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: color, textTransform: "uppercase" }}>
        {before ? "Before Due" : days === 0 ? "On Due" : "Overdue"}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text, marginTop: 4 }}>{label}</div>
    </div>
  );
}

function SmallStat({ label, value, color }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: COLORS.muted, fontWeight: 600, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: color || COLORS.text, marginTop: 2 }}>{value}</div>
    </div>
  );
}

// ============================================================
// SHARED COMPONENTS
// ============================================================

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "transparent",
        border: "none",
        padding: "10px 18px",
        fontSize: 13,
        fontWeight: active ? 700 : 500,
        color: active ? COLORS.primary : COLORS.muted,
        borderBottom: active ? `2px solid ${COLORS.primary}` : "2px solid transparent",
        cursor: "pointer",
        marginBottom: -1.5,
      }}
    >
      {children}
    </button>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: 14 }}>
      <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 600, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 800, color: color || COLORS.text, marginTop: 4 }}>{value}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: COLORS.text, marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}

function Th({ children }) {
  return <th style={{ padding: "12px 14px", fontSize: 11, fontWeight: 700, color: COLORS.muted, textAlign: "left", textTransform: "uppercase" }}>{children}</th>;
}

function Td({ children }) {
  return <td style={{ padding: "12px 14px", fontSize: 13, color: COLORS.text }}>{children}</td>;
}

function Loading({ children }) {
  return <div style={{ padding: 40, textAlign: "center", color: COLORS.muted }}>{children}</div>;
}

function ErrorBox({ children }) {
  return <div style={{ padding: 14, background: "#FEE2E2", color: "#991B1B", borderRadius: 10, marginBottom: 16 }}>{children}</div>;
}

function EmptyState({ children }) {
  return (
    <div style={{ padding: 40, textAlign: "center", color: COLORS.muted, background: "#fff", borderRadius: 12, border: `1px dashed ${COLORS.border}` }}>
      {children}
    </div>
  );
}

const inp = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: `1.5px solid ${COLORS.border}`,
  fontSize: 13,
  outline: "none",
  fontFamily: "inherit",
  resize: "vertical",
};

const btnPrimary = {
  background: COLORS.primary,
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "10px 18px",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};

const btnSm = {
  background: "transparent",
  color: COLORS.text,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  padding: "6px 12px",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};
