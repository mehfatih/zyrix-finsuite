import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function CustomQuotesPage() {
  return (
    <AdminPagePlaceholder
      title="Custom Quotes"
      icon="📝"
      cluster="Cluster C · Plans"
      permission="plan.create"
      features={[
              "Build enterprise quote with custom line items",
              "Auto-PDF generation with branding",
              "Send via email + DocuSign integration",
              "Quote expiration",
              "Convert quote to active subscription"
      ]}
    />
  );
}
