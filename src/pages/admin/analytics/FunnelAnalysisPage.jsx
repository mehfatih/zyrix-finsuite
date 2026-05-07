import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function FunnelAnalysisPage() {
  return (
    <AdminPagePlaceholder
      title="Funnel Analysis"
      icon="🪣"
      cluster="Cluster E · Analytics"
      permission="analytics.funnel"
      features={[
              "Build custom funnel from event sequence",
              "Drop-off at each step",
              "Time-to-convert",
              "Segment funnels by tier/country",
              "Compare two funnels side-by-side"
      ]}
    />
  );
}
