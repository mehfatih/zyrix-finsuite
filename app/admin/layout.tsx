"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("zyrix_admin_token");
    if (!token && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [pathname]);

  return (
    <div style={{ fontFamily: "Inter, sans-serif", minHeight: "100vh", background: "#0F172A" }}>
      {children}
    </div>
  );
}
