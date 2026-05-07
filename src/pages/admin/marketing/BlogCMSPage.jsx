import React from "react";
import AdminPagePlaceholder from "../../../components/admin/AdminPagePlaceholder";

export default function BlogCMSPage() {
  return (
    <AdminPagePlaceholder
      title="Blog CMS"
      icon="📝"
      cluster="Cluster H · Marketing"
      permission="blog.publish"
      features={[
              "Rich text editor",
              "Per-post SEO meta",
              "Draft/scheduled/published states",
              "Author management",
              "Category + tag system",
              "RSS feed"
      ]}
    />
  );
}
