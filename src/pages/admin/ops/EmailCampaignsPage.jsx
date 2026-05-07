import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function EmailCampaignsPage() {
  return (
    <AdminPagePlaceholder
      title="Email Campaigns"
      icon="📣"
      cluster="Cluster D · Support"
      permission="campaign.view"
      features={[
              "Drag-drop email builder",
              "Audience segmentation",
              "A/B subject lines",
              "Schedule send",
              "Open + click tracking",
              "Unsubscribe management"
      ]}
    />
  );
}
