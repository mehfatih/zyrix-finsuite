// ================================================================
// Zyrix FinSuite — vite.config.js
// Optimized for production build + Railway/Vercel deploy
// Phase 12 — manual chunks tuned for 78-feature dashboard.
// ================================================================

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@":            path.resolve(__dirname, "./src"),
      "@components":  path.resolve(__dirname, "./src/components"),
      "@pages":       path.resolve(__dirname, "./src/pages"),
      "@services":    path.resolve(__dirname, "./src/services"),
      "@hooks":       path.resolve(__dirname, "./src/hooks"),
      "@context":     path.resolve(__dirname, "./src/context"),
      "@i18n":        path.resolve(__dirname, "./src/i18n"),
    },
  },

  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://finsuite-backend-production.up.railway.app",
        changeOrigin: true,
        secure: true,
      },
    },
  },

  build: {
    outDir: "dist",
    sourcemap: false,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor splitting — keep React core small + isolated
          if (id.includes("node_modules")) {
            if (id.includes("react-dom"))                       return "react-dom";
            if (id.includes("react-router"))                    return "router";
            if (id.includes("/react/"))                         return "react";
            // Sprint D-10 — Sentry browser SDK is loaded on app boot;
            // isolating it keeps it from invalidating the main vendor
            // chunk on minor lib upgrades.
            if (id.includes("/@sentry/"))                       return "sentry";
            // Heavy chart deps stay together; only the pages that
            // import a chart component pull this chunk.
            if (id.includes("/recharts/")
                || id.includes("/d3-")
                || id.includes("/victory-vendor/")) return "charts";
            // Sprint D-10 — lucide-react: return undefined so Vite
            // tree-shakes per-importer. With ~60 files each using
            // 5-15 icons, the result is ~250 B × icons per page chunk
            // instead of one 900KB shared library. The previous
            // `return "vendor"` catch-all defeated tree-shaking.
            if (id.includes("/lucide-react/"))                  return undefined;
            return "vendor";
          }
          // Shared dashboard primitives — used by every page
          if (id.includes("/src/components/dashboard/PageHeader") ||
              id.includes("/src/components/dashboard/Card") ||
              id.includes("/src/components/dashboard/KpiCard") ||
              id.includes("/src/components/dashboard/EmptyState") ||
              id.includes("/src/components/dashboard/charts/")) {
            return "dashboard-shared";
          }
          // Sprint D-10 — locale-split the dashboard i18n chunk so the
          // browser can parallelize and a future per-locale lazy loader
          // (post-launch) can drop the inactive bundles entirely.
          if (id.includes("/src/i18n/dashboard/") && id.endsWith(".tr.json")) return "i18n-dashboard-tr";
          if (id.includes("/src/i18n/dashboard/") && id.endsWith(".en.json")) return "i18n-dashboard-en";
          if (id.includes("/src/i18n/dashboard/") && id.endsWith(".ar.json")) return "i18n-dashboard-ar";
          if (id.includes("/src/i18n/dashboard/")) return "i18n-dashboard";
          if (id.includes("/src/i18n/")) return "i18n";
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },

  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});
