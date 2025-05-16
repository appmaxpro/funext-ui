import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import svgrPlugin from "vite-plugin-svgr";
import tailwindcss from '@tailwindcss/vite'

import path from "path";
//const tailwindcss = require("@tailwindcss/vite/dist");

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react({
      babel: {
        presets: [
          [
            "@emotion/babel-preset-css-prop",
            {
              autoLabel: "dev-only",
            },
          ],
        ],
        plugins: ["babel-plugin-macros"],
      },
    }),
    svgrPlugin({ svgrOptions: { icon: true } }),
  ],
  build: {
    rollupOptions: {
      external: [
        "@mui/utils/useIsFocusVisible", // ignore @mui stuff
      ],
    },
  },
  resolve: {
    alias: [
      {
        find: /^~(.*)/,
        replacement: "$1",
      },
      {
        find: /^@\/(.*)/,
        replacement: path.join(__dirname, "src", "$1"),
      },
    ],
  },
});
