import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function ReviewsManagerPage() {
  return (
    <AdminPagePlaceholder
      title="Reviews Manager"
      icon="⭐"
      cluster="Cluster H · Marketing"
      permission="review.moderate"
      features={[
              "Inbox of all customer reviews",
              "Approve/reject for public display",
              "Reply to reviews",
              "Auto-translate to TR/EN/AR",
              "Schema.org markup for SEO"
      ]}
    />
  );
}
