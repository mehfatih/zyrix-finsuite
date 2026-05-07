import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function APIUsagePage() {
  return (
    <AdminPagePlaceholder
      title="API Usage"
      icon="🔌"
      cluster="Cluster G · System"
      permission="system.view"
      features={[
              "Per-customer API call volume",
              "Rate limit status",
              "Throttled requests count",
              "Slowest endpoints",
              "API key management"
      ]}
    />
  );
}
