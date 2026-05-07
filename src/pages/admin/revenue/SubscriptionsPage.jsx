import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function SubscriptionsPage() {
  return (
    <AdminPagePlaceholder
      title="Subscriptions"
      icon="🔁"
      cluster="Cluster B · Revenue"
      permission="subscription.view"
      features={[
              "All subscriptions list",
              "Status filter (active/past_due/canceled)",
              "Tier change with proration",
              "Schedule cancellation at period end",
              "View payment method on file",
              "Attach discount/credit"
      ]}
    />
  );
}
