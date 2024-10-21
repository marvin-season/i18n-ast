import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { i18nPlugin } from "./plugins/i18n";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [i18nPlugin(), react()],
});
