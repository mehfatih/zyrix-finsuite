import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function SessionReplaysPage() {
  return (
    <AdminPagePlaceholder
      title="Session Replays"
      icon="🎥"
      cluster="Cluster E · Analytics"
      permission="analytics.replay"
      features={[
              "Replay specific user sessions",
              "Privacy-preserving (PII redacted)",
              "Filter by errors/rage clicks",
              "Bookmark + share replays",
              "Heatmap overlay"
      ]}
    />
  );
}
