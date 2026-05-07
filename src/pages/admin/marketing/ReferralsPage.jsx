import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function ReferralsPage() {
  return (
    <AdminPagePlaceholder
      title="Referrals"
      icon="🔗"
      cluster="Cluster H · Marketing"
      permission="marketing.view"
      features={[
              "Customer-to-customer referral program",
              "Reward configuration (% credit/free month/cash)",
              "Conversion tracking",
              "Top referrers leaderboard"
      ]}
    />
  );
}
