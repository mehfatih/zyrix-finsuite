import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function ConversionAnalyticsPage() {
  return (
    <AdminPagePlaceholder
      title="Conversion Analytics"
      icon="📈"
      cluster="Cluster H · Marketing"
      permission="marketing.view"
      features={[
              "Funnel from visit to paid",
              "Source attribution (GA, ads, organic)",
              "Per-page conversion rate",
              "Heatmap overlay on landing pages"
      ]}
    />
  );
}
