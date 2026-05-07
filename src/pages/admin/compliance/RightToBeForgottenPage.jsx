import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function RightToBeForgottenPage() {
  return (
    <AdminPagePlaceholder
      title="Right to Be Forgotten"
      icon="🗑"
      cluster="Cluster F · Compliance"
      permission="gdpr.respond"
      features={[
              "GDPR Art. 17 fully automated workflow",
              "Multi-system data location finder",
              "Cascading deletion chain",
              "Verification email to requester",
              "Compliance attestation generated"
      ]}
    />
  );
}
