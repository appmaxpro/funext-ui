import { mergeConfig, defineConfig } from "vite";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig as any,
  defineConfig({
    build: {
      sourcemap: true,
      minify: false,
    },
  })
);
