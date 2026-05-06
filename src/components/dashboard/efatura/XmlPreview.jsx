// ================================================================
// XmlPreview — UBL 2.1 XML viewer with syntax highlighting + copy
// Builds an XML string from the invoice when none is provided.
// ================================================================
import React, { useMemo, useState } from "react";
import { getReportsPalette } from "../../../utils/dashboardPalette";

function escapeXml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildUblXml(invoice = {}) {
  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const subtotal = invoice.subtotal ?? items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0);
  const vat = invoice.vatAmount ?? subtotal * (Number(invoice.vatRate ?? 20) / 100);
  const total = invoice.total ?? subtotal + vat;
  const issue = (invoice.issueDate || invoice.createdAt || new Date().toISOString()).slice(0, 10);
  const due = (invoice.dueDate || issue).slice(0, 10);
  const lines = items
    .map((it, i) => {
      const lineTotal = (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0);
      return `    <cac:InvoiceLine>
      <cbc:ID>${i + 1}</cbc:ID>
      <cbc:InvoicedQuantity unitCode="${escapeXml(it.unit || "C62")}">${Number(it.quantity) || 0}</cbc:InvoicedQuantity>
      <cbc:LineExtensionAmount currencyID="${escapeXml(invoice.currency || "TRY")}">${lineTotal.toFixed(2)}</cbc:LineExtensionAmount>
      <cac:Item>
        <cbc:Name>${escapeXml(it.name || "")}</cbc:Name>
      </cac:Item>
      <cac:Price>
        <cbc:PriceAmount currencyID="${escapeXml(invoice.currency || "TRY")}">${Number(it.unitPrice || 0).toFixed(2)}</cbc:PriceAmount>
      </cac:Price>
    </cac:InvoiceLine>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>TR1.2</cbc:CustomizationID>
  <cbc:ProfileID>EARSIVFATURA</cbc:ProfileID>
  <cbc:ID>${escapeXml(invoice.serial || invoice.invoiceNumber || "")}</cbc:ID>
  <cbc:UUID>${escapeXml(invoice.uuid || invoice.id || "")}</cbc:UUID>
  <cbc:IssueDate>${issue}</cbc:IssueDate>
  <cbc:DueDate>${due}</cbc:DueDate>
  <cbc:InvoiceTypeCode>SATIS</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>${escapeXml(invoice.currency || "TRY")}</cbc:DocumentCurrencyCode>

  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName>
        <cbc:Name>Zyrix FinSuite</cbc:Name>
      </cac:PartyName>
    </cac:Party>
  </cac:AccountingSupplierParty>

  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName>
        <cbc:Name>${escapeXml(invoice.customerName || invoice.supplierName || "")}</cbc:Name>
      </cac:PartyName>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${escapeXml(invoice.customerTaxId || invoice.supplierTaxId || "")}</cbc:CompanyID>
      </cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingCustomerParty>

  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${escapeXml(invoice.currency || "TRY")}">${Number(vat).toFixed(2)}</cbc:TaxAmount>
  </cac:TaxTotal>

  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${escapeXml(invoice.currency || "TRY")}">${Number(subtotal).toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${escapeXml(invoice.currency || "TRY")}">${Number(subtotal).toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${escapeXml(invoice.currency || "TRY")}">${Number(total).toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="${escapeXml(invoice.currency || "TRY")}">${Number(total).toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>

${lines || "    <!-- no line items -->"}
</Invoice>`;
}

function highlight(xml) {
  // very light syntax highlighting via spans
  return xml
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/(&lt;\/?[\w:.-]+)/g, '<span class="xml-tag">$1</span>')
    .replace(/([\w:.-]+)=("[^"]*")/g, '<span class="xml-attr">$1</span>=<span class="xml-val">$2</span>');
}

export default function XmlPreview({ invoice, xml, t = (s) => s }) {
  const reports = getReportsPalette();
  const content = useMemo(() => xml || buildUblXml(invoice || {}), [invoice, xml]);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const download = () => {
    const blob = new Blob([content], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `efatura-${invoice?.serial || invoice?.id || "preview"}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        background: "#0F172A",
        color: "#E2E8F0",
        borderRadius: 14,
        overflow: "hidden",
        border: `1px solid ${reports.base}40`,
        boxShadow: `0 4px 18px ${reports.base}20`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          background: "#1E293B",
          borderBottom: `1px solid ${reports.base}30`,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: reports.chart, fontFamily: "monospace" }}>
          {t("detail.xml.title")}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            type="button"
            onClick={copy}
            style={{
              background: "transparent",
              color: copied ? reports.chart : "#94A3B8",
              border: `1px solid ${copied ? reports.chart : "#334155"}`,
              borderRadius: 8,
              padding: "4px 10px",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {copied ? "✓ Copied" : "📋 Copy"}
          </button>
          <button
            type="button"
            onClick={download}
            style={{
              background: reports.base,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "4px 10px",
              fontSize: 11,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            ⬇ XML
          </button>
        </div>
      </div>
      <pre
        style={{
          margin: 0,
          padding: "14px 16px",
          maxHeight: 360,
          overflow: "auto",
          fontFamily: "Consolas, Menlo, monospace",
          fontSize: 11,
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
        dangerouslySetInnerHTML={{ __html: highlight(content) }}
      />
      <style>{`
        .xml-tag  { color: #93C5FD; }
        .xml-attr { color: #FBBF24; }
        .xml-val  { color: #6EE7B7; }
      `}</style>
    </div>
  );
}
