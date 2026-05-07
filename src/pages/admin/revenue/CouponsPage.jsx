import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function CouponsPage() {
  return (
    <AdminPagePlaceholder
      title="Coupons & Promotions"
      icon="🎟"
      cluster="Cluster B · Revenue"
      permission="coupon.view"
      features={[
              "Coupon CRUD",
              "Percentage / fixed / free-month types",
              "Tier targeting",
              "Max-redemptions cap",
              "Expiry date",
              "New-customers-only flag",
              "Redemption history per coupon"
      ]}
    />
  );
}
