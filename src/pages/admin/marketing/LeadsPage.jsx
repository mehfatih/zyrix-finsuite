import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function LeadsPage() {
  return (
    <AdminPagePlaceholder
      title="Leads"
      icon="🪝"
      cluster="Cluster H · Marketing"
      permission="lead.manage"
      features={[
              "Lead inbox with source tracking",
              "Lead scoring",
              "Manual disposition (qualified/disqualified)",
              "Auto-assign to sales rep",
              "Sync to CRM"
      ]}
    />
  );
}
