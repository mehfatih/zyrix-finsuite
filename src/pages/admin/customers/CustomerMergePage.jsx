import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function CustomerMergePage() {
  return (
    <AdminPagePlaceholder
      title="Account Merging"
      subtitle="Combine duplicate customer accounts into one canonical record."
      icon="🔀"
      cluster="Cluster A · Customer Management"
      permission="merge.accounts"
      features={[
        "Source + target account picker with diff preview",
        "Conflict resolution per field (use source / use target / merge)",
        "Move all invoices, users, tickets, audit history",
        "Email notification to both account owners",
        "Reversible within 30 days",
        "Final merge audit-logged at CRITICAL severity",
      ]}
    />
  );
}
