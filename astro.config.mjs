import { defineConfig } from "astro/config";

import react from "@astrojs/react";

import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://www.imoto-portfolio.jp",
  integrations: [react(), sitemap()],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
        },
      },
    },
  },
});
