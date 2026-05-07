import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function SecurityScannerPage() {
  return (
    <AdminPagePlaceholder
      title="Security Scanner"
      icon="🛡"
      cluster="Cluster G · System"
      permission="security.scan"
      features={[
              "Auto vulnerability scan (npm audit + Snyk)",
              "Dependency upgrade suggestions",
              "OWASP Top 10 check",
              "Security headers verification",
              "TLS certificate expiry"
      ]}
    />
  );
}
