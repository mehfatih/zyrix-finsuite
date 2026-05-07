import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function SocialSchedulerPage() {
  return (
    <AdminPagePlaceholder
      title="Social Scheduler"
      icon="📱"
      cluster="Cluster H · Marketing"
      permission="social.schedule"
      features={[
              "Schedule posts to Instagram/Twitter/LinkedIn",
              "Calendar view",
              "Per-platform variants",
              "Hashtag research",
              "Engagement analytics"
      ]}
    />
  );
}
