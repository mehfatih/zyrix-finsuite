import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function FailedPaymentsPage() {
  return (
    <AdminPagePlaceholder
      title="Failed Payments"
      icon="⚠"
      cluster="Cluster B · Revenue"
      permission="subscription.view"
      features={[
              "Queue of failed charges",
              "Retry now button",
              "Dunning email status per attempt",
              "Customer contact actions",
              "Write-off option for unrecoverable",
              "Sync with Iyzico/Stripe"
      ]}
    />
  );
}
