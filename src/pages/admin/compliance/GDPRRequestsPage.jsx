import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function GDPRRequestsPage() {
  return (
    <AdminPagePlaceholder
      title="GDPR Requests"
      icon="🇪🇺"
      cluster="Cluster F · Compliance"
      permission="gdpr.respond"
      features={[
              "GDPR Art. 15 (access), 16 (rectify), 17 (erasure), 20 (portability)",
              "30-day SLA per article",
              "PDF + JSON export bundle",
              "EU representative attestation"
      ]}
    />
  );
}
