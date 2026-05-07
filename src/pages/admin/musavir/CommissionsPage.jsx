import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function CommissionsPage() {
  return (
    <AdminPagePlaceholder
      title="Commissions"
      icon="💵"
      cluster="Cluster I · Mali Müşavir"
      permission="commission.manage"
      features={[
              "Commission rate per tier",
              "Monthly commission report per partner",
              "Payout scheduling",
              "Tax form generation (1099/Stopaj)",
              "Commission history"
      ]}
    />
  );
}
