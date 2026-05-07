import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function SEOManagerPage() {
  return (
    <AdminPagePlaceholder
      title="SEO Manager"
      icon="🔍"
      cluster="Cluster H · Marketing"
      permission="seo.edit"
      features={[
              "Per-page meta tag editor",
              "Sitemap.xml regeneration",
              "Robots.txt config",
              "Schema.org structured data builder",
              "Search console integration"
      ]}
    />
  );
}
