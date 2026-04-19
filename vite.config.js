// ================================================================
// Zyrix FinSuite — vite.config.js
// Optimized for production build + PWA + Railway/Vercel deploy
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
    rollupOptions: {
      output: {
        manualChunks: {
          react:    ["react", "react-dom"],
          router:   ["react-router-dom"],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },

  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
});
