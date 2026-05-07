import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function FeatureFlagsPage() {
  return (
    <AdminPagePlaceholder
      title="Feature Flags"
      icon="🚩"
      cluster="Cluster G · System"
      permission="feature_flag.manage"
      features={[
              "Runtime feature toggle",
              "% rollout slider",
              "Target by user/company/tier",
              "A/B variant assignment",
              "Audit trail of flag changes"
      ]}
    />
  );
}
