import react from "@vitejs/plugin-react-swc";
//import react from "@vitejs/plugin-react";
//import babel from 'vite-plugin-babel';
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { viteStaticCopy } from "vite-plugin-static-copy";
import type { ManifestOptions, VitePWAOptions } from "vite-plugin-pwa";

const pwaOptions: Partial<VitePWAOptions> = {
  mode: "development",
  base: "/",
  includeAssets: ["favicon.svg"],
  manifest: {
    name: "Owner App",
    short_name: "Owner App",
    theme_color: "#ff0000",
    icons: [
      {
        src: "pwa-192x192.png", // <== don't add slash, for testing
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/pwa-512x512.png", // <== don't remove slash, for testing
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "pwa-512x512.png", // <== don't add slash, for testing
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  },
  devOptions: {
    enabled: process.env.SW_DEV === "true",
    /* when using generateSW the PWA plugin will switch to classic */
    type: "module",
    navigateFallback: "index.html",
  },
};

const claims = process.env.CLAIMS === "true";
const selfDestroying = process.env.SW_DESTROY === "true";

if (process.env.SW === "true") {
  pwaOptions.srcDir = "src";
  pwaOptions.filename = claims ? "claims-sw.ts" : "prompt-sw.ts";
  pwaOptions.strategies = "injectManifest";
  (pwaOptions.manifest as Partial<ManifestOptions>).name =
    "PWA Inject Manifest";
  (pwaOptions.manifest as Partial<ManifestOptions>).short_name = "PWA Inject";
  pwaOptions.injectManifest = {
    minify: false,
    enableWorkboxModulesLogs: true,
  };
}

if (claims) pwaOptions.registerType = "autoUpdate";

if (selfDestroying) pwaOptions.selfDestroying = selfDestroying;

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",

  plugins: [
    tailwindcss(),
    react(),
    svgr({
      svgrOptions: {
        icon: true,
      },
    }),
    VitePWA({
      includeAssets: ["favicon.ico", "apple-touch-icon-180x180.png"],
      workbox: {
        navigateFallbackDenylist: [/^\/api/],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        globPatterns: ["**/*.{js,css,html,woff,woff2,mp3}"],
      },
      manifest: {
        short_name: "${title}",
        name: "${description}",
        theme_color: "${colorPrimary}",
        icons: [
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/@mapbox/mapbox-gl-rtl-text/dist/mapbox-gl-rtl-text.js",
          dest: "",
        },
        {
          src: "node_modules/@funext/icons/build/index.js",
          dest: "./build",
        },
      ],
    }),
  ],
  optimizeDeps: {
    entries: [
      "src/**/*.{ts,js,tsx,jsx,css,scss,html}",
      "@emotion/react",
      "@emotion/react/jsx-dev-runtime",
    ],
  },
  resolve: {
    alias: [
      {
        find: /^~\/(.*)/,
        replacement: path.join(__dirname, "src", "$1"),
      },
      //'@emotion/react/jsx-runtime': resolvePkg('jsx-runtime'),
			//'@emotion/react/jsx-dev-runtime': resolvePkg('jsx-runtime'),
    ],
    dedupe: [
      "react",
      "react-dom",
      "@emotion/react",
      "@emotion/react/jsx-dev-runtime",
      "@vite-plugin-pwa/virtual:pwa-register/react",
      "virtual:pwa-register/react",
    ],
  },
  build: {
    target: ["es2022"],
  },
});
