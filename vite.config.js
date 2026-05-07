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
            if (id.includes("react-dom"))         return "react-dom";
            if (id.includes("react-router"))      return "router";
            if (id.includes("/react/"))           return "react";
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
          // i18n bundles can be heavy — separate
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
