import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function RefundsPage() {
  return (
    <AdminPagePlaceholder
      title="Refunds"
      icon="↩"
      cluster="Cluster B · Revenue"
      permission="subscription.refund"
      features={[
              "Issue partial or full refund",
              "Reason picker (KVKK/GDPR/dispute/goodwill)",
              "Auto credit-note generation",
              "Sync to Iyzico/Stripe",
              "Refund history with admin attribution"
      ]}
    />
  );
}
