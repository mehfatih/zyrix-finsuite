import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function PowerUsersPage() {
  return (
    <AdminPagePlaceholder
      title="Power Users"
      icon="💪"
      cluster="Cluster E · Analytics"
      permission="analytics.view"
      features={[
              "Top 5% by feature usage",
              "Top 5% by API calls",
              "Top 5% by login frequency",
              "Champion identification for case studies",
              "Outreach automation"
      ]}
    />
  );
}
