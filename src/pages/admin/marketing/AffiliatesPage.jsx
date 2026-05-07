import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function AffiliatesPage() {
  return (
    <AdminPagePlaceholder
      title="Affiliates"
      icon="🤝"
      cluster="Cluster H · Marketing"
      permission="affiliate.manage"
      features={[
              "Affiliate signup workflow",
              "Per-affiliate referral link",
              "Commission tracking",
              "Payout management",
              "Affiliate dashboard preview"
      ]}
    />
  );
}
