import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/apple-touch-icon.png"],
      manifest: {
        name: "PetPomodoro",
        short_name: "PetPomo",
        description: "A gentle local-first focus companion.",
        theme_color: "#be123c",
        background_color: "#fff1f2",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/icons/pwa-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/pwa-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icons/pwa-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,svg,webp,woff2}"],
        navigateFallback: "/index.html",
      },
    }),
  ],
  test: {
    globals: true,
  },
});
