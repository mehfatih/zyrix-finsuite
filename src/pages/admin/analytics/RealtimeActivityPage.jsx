import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function RealtimeActivityPage() {
  return (
    <AdminPagePlaceholder
      title="Realtime Activity"
      icon="🟢"
      cluster="Cluster E · Analytics"
      permission="analytics.view"
      features={[
              "See who's online right now",
              "Active page per user",
              "Live session count",
              "Geographic activity map"
      ]}
    />
  );
}
