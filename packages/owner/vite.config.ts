import react from "@vitejs/plugin-react";
import path from "path";
import process from 'node:process'
import { defineConfig, resolveConfig  } from "vite";
import svgr from "vite-plugin-svgr";
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa';
import replace from '@rollup/plugin-replace'
import type { ManifestOptions, VitePWAOptions } from 'vite-plugin-pwa'


const pwaOptions: Partial<VitePWAOptions> = {
  mode: 'development',
  base: '/',
  includeAssets: ['favicon.svg'],
  manifest: {
    name: 'Owner App',
    short_name: 'Owner App',
    theme_color: '#ff0000',
    icons: [
      {
        src: 'pwa-192x192.png', // <== don't add slash, for testing
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/pwa-512x512.png', // <== don't remove slash, for testing
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: 'pwa-512x512.png', // <== don't add slash, for testing
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  },
  devOptions: {
    enabled: process.env.SW_DEV === 'true',
    /* when using generateSW the PWA plugin will switch to classic */
    type: 'module',
    navigateFallback: 'index.html',
  },
}

const claims = process.env.CLAIMS === 'true'
const selfDestroying = process.env.SW_DESTROY === 'true'

if (process.env.SW === 'true') {
  pwaOptions.srcDir = 'src'
  pwaOptions.filename = claims ? 'claims-sw.ts' : 'prompt-sw.ts'
  pwaOptions.strategies = 'injectManifest'
  ;(pwaOptions.manifest as Partial<ManifestOptions>).name = 'PWA Inject Manifest'
  ;(pwaOptions.manifest as Partial<ManifestOptions>).short_name = 'PWA Inject'
  pwaOptions.injectManifest = {
    minify: false,
    enableWorkboxModulesLogs: true,
  }
}

if (claims)
  pwaOptions.registerType = 'autoUpdate'

if (selfDestroying)
  pwaOptions.selfDestroying = selfDestroying


// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    tailwindcss(),
    react({
      jsxImportSource: "@emotion/react",
      babel: {
        
        presets: [
          [
            "@emotion/babel-preset-css-prop",
            {
              autoLabel: "dev-only",
            }
          ],
          [
            "@babel/preset-react",
            {
              runtime: "automatic"
            }
          ],
        ],

      },
    }),
    svgr({
      svgrOptions: {
        icon: true,
      },
    }),
    VitePWA(pwaOptions),
    //replace(),

  ],
  optimizeDeps: {
    entries: ["src/**/*.{ts,js,tsx,jsx,css,scss,html}", '@emotion/react'],
  },
  
  resolve: {
    alias: [
      {
        find: /^~\/(.*)/,
        replacement: path.join(__dirname, "src", "$1"),
      },
    ],
    dedupe: ["react", "react-dom", '@emotion/react', '@vite-plugin-pwa/virtual:pwa-register/react', 'virtual:pwa-register/react'],
  },
  build: {
    target: ["es2022"]
  },
});

