import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function NPSSurveysPage() {
  return (
    <AdminPagePlaceholder
      title="NPS Surveys"
      icon="⭐"
      cluster="Cluster D · Support"
      permission="nps.manage"
      features={[
              "NPS campaign creation",
              "Trigger rules (after invoice paid, after 30 days, etc.)",
              "Score distribution chart",
              "Detractor follow-up workflow",
              "Export responses"
      ]}
    />
  );
}
