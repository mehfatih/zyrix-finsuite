import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function AccountantReferralsPage() {
  return (
    <AdminPagePlaceholder
      title="Accountant Referrals"
      icon="🔗"
      cluster="Cluster I · Mali Müşavir"
      permission="musavir.view"
      features={[
              "Accountant referral link generator",
              "Per-referral conversion tracking",
              "Custom landing page per accountant",
              "Top performers"
      ]}
    />
  );
}
