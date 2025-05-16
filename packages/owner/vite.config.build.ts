import { mergeConfig } from "vite";
import { defineConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig as any,
  defineConfig({
    build: {
      outDir: './dist',
      emptyOutDir: true,
    },
  })
);
