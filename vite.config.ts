import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
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
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router-dom")
            ) {
              return "vendor-react";
            }

            if (id.includes("antd") || id.includes("@ant-design"))
              return "vendor-antd";
            if (id.includes("framer-motion")) return "vendor-motion";
            if (id.includes("recharts")) return "vendor-charts";
            if (id.includes("react-icons")) return "vendor-icons";

            if (
              id.includes("lodash") ||
              id.includes("axios") ||
              id.includes("date-fns")
            ) {
              return "vendor-utils";
            }
          }
        },
      },
    },
  },
});
