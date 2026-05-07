import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function ComplianceReportsPage() {
  return (
    <AdminPagePlaceholder
      title="Compliance Reports"
      icon="📋"
      cluster="Cluster F · Compliance"
      permission="audit.export"
      features={[
              "KVKK annual compliance report PDF",
              "GDPR Art. 30 records of processing",
              "SOC 2 evidence collection",
              "ISO 27001 control evidence",
              "Auto-fill auditor questionnaires"
      ]}
    />
  );
}
