import { mergeConfig, defineConfig } from "vite";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    resolve: {
      alias: [
        {
          find: /^(react-dom)$/,
          replacement: "react-dom/profiling",
        },
      ],
    },
    build: {
      sourcemap: true,
      minify: false,
      emptyOutDir: true,
    },
  })
);
