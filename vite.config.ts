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
  define: {
    global: "window",
  },

  server: {
    port: 3000,
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    sourcemap: "hidden",
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
          "vendor-icons": ["react-icons", "lucide-react"],
          "vendor-charts": ["recharts"],
          "vendor-excel": ["xlsx"],
          "vendor-ui": ["react-toastify", "flowbite"],
          "vendor-websocket": ["sockjs-client", "@stomp/stompjs"],
          "vendor-utils": ["axios", "clsx", "tailwind-merge"],
          "vendor-i18n": [
            "i18next",
            "react-i18next",
            "i18next-browser-languagedetector",
          ],
          "vendor-editor": [
            "@editorjs/editorjs",
            "@editorjs/header",
            "@editorjs/image",
            "@editorjs/list",
            "@editorjs/quote",
          ],
          "vendor-map": ["leaflet", "react-leaflet"],
        },

        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",

        assetFileNames: (assetInfo) => {
          if (!assetInfo.names || assetInfo.names.length === 0) {
            return `assets/[name]-[hash][extname]`;
          }

          const name = assetInfo.names[0];
          const ext = path.extname(name).slice(1).toLowerCase();

          if (
            [
              "png",
              "jpg",
              "jpeg",
              "svg",
              "gif",
              "webp",
              "avif",
              "ico",
            ].includes(ext)
          ) {
            return `assets/img/[name]-[hash][extname]`;
          }

          if (["woff", "woff2", "eot", "ttf", "otf"].includes(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }

          if (ext === "css") {
            return `assets/css/[name]-[hash][extname]`;
          }

          return `assets/[name]-[hash][extname]`;
        },
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
