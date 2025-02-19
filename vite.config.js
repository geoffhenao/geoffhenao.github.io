import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"; // remove if you're not using react

// https://vitejs.dev/config/
export default defineConfig({
  base: "/geoffhenao.github.io/",
  plugins: [react()], // remove if you're not using react
});
