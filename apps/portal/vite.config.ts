import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  publicDir: "../web/public",
  resolve: { dedupe: ["react", "react-dom", "react-router"] },
});
