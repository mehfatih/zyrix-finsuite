import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function HeatmapsPage() {
  return (
    <AdminPagePlaceholder
      title="Heatmaps"
      icon="🔥"
      cluster="Cluster E · Analytics"
      permission="analytics.heatmap"
      features={[
              "Click heatmap per page",
              "Scroll depth heatmap",
              "Mouse-move heatmap",
              "Per-device segmentation",
              "Time-range filter"
      ]}
    />
  );
}
