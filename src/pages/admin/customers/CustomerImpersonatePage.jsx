// ================================================================
// /admin/customers/impersonate — Search → Impersonate flow page
// ================================================================
import React, { useState } from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function CustomerImpersonatePage() {
  return (
    <AdminPagePlaceholder
      title="Impersonate Customer"
      subtitle="Login as any customer with consent + audit. Open a customer's detail page → Admin Actions tab → Login as customer."
      icon="🎭"
      cluster="Cluster A · Customer Management"
      permission="customer.impersonate"
      status="beta"
      features={[
        "Mandatory reason field (audit-logged)",
        "Optional customer consent email with magic link",
        "4-hour temporary token expiry",
        "Bright red banner shown on customer dashboard",
        "All actions logged with both admin + customer IDs",
        "Cannot perform destructive actions while impersonating",
        "Cannot change password while impersonating",
        "Auto-end on timeout or manual end",
      ]}
    />
  );
}
