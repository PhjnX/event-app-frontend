import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import flowbiteReact from "flowbite-react/plugin/vite";
import path from "path"; // 1. Import thư viện path

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), flowbiteReact()],
  server: { port: 3000 },

  // 2. Thêm cấu hình resolve alias tại đây
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
