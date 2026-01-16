import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import sitemap from "vite-plugin-sitemap";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    sitemap({
      hostname: "https://ems.webie.com.vn",

      dynamicRoutes: ["/about", "/value", "/events", "/news"],

      robots: [
        {
          userAgent: "*",
          allow: "/",
          disallow: ["/profile", "/my-tickets", "/event/*/moments", "/admin"],
        },
      ],
    }),

    visualizer({
      open: true,
      filename: "stats.html",
      gzipSize: true,
      brotliSize: true,
    }),
  ],

  server: { port: 3000 },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("recharts")) return "vendor-charts";
            if (id.includes("framer-motion")) return "vendor-motion";
            if (id.includes("react-icons")) return "vendor-icons";
            if (id.includes("xlsx")) return "vendor-excel";

            if (
              id.includes("antd") ||
              id.includes("@ant-design") ||
              id.includes("rc-")
            ) {
              return "vendor-antd";
            }
          }
        },
      },
    },
  },
});
