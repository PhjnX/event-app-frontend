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
      open: false,
      filename: "stats.html",
      gzipSize: true,
      brotliSize: true,
    }),
  ],

  server: {
    port: 3000,
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    minify: "esbuild",
    target: "es2020",

    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": [
            "react",
            "react-dom",
            "react-router-dom",
            "react-redux",
            "@reduxjs/toolkit",
          ],
          "vendor-motion": ["framer-motion"],
          "vendor-icons": ["react-icons"],
          "vendor-charts": ["recharts"],
          "vendor-excel": ["xlsx"],
        },

        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
  },

  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@reduxjs/toolkit",
      "react-redux",
    ],
  },
});
