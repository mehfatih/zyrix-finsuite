import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function ManualInvoicePage() {
  return (
    <AdminPagePlaceholder
      title="Manual Invoice"
      icon="🧾"
      cluster="Cluster B · Revenue"
      permission="invoice.create"
      features={[
              "Create off-cycle invoice for enterprise deals",
              "Line items + VAT + due date",
              "Multi-currency support",
              "Auto-send to customer email",
              "Mark as paid / sent / overdue"
      ]}
    />
  );
}
