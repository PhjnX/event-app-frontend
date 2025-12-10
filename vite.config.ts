import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import flowbiteReact from "flowbite-react/plugin/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss(), flowbiteReact()],
  server: { port: 3000 },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
