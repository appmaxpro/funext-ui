// vite.config.ts
import { reactRouter } from "file:///D:/dev/funext/funext-ui/node_modules/.pnpm/@react-router+dev@7.3.0_@react-router+serve@7.3.0_react-router@7.3.0_react-dom@19.0.0_react@1_y55bbmbouqn6ubkdsncdjcckhy/node_modules/@react-router/dev/dist/vite.js";
import tailwindcss from "file:///D:/dev/funext/funext-ui/node_modules/.pnpm/@tailwindcss+vite@4.0.12_vite@5.4.14_@types+node@20.17.18_lightningcss@1.29.2_sass@1.84.0_terser@5.38.2_/node_modules/@tailwindcss/vite/dist/index.mjs";
import { defineConfig } from "file:///D:/dev/funext/funext-ui/node_modules/.pnpm/vite@5.4.14_@types+node@20.17.18_lightningcss@1.29.2_sass@1.84.0_terser@5.38.2/node_modules/vite/dist/node/index.js";
import tsconfigPaths from "file:///D:/dev/funext/funext-ui/node_modules/.pnpm/vite-tsconfig-paths@5.1.4_typescript@5.7.3_vite@5.4.14_@types+node@20.17.18_lightningcss@1.29_jqdpqgq5c47rooikqd34fnxfcu/node_modules/vite-tsconfig-paths/dist/index.js";
import react from "file:///D:/dev/funext/funext-ui/node_modules/.pnpm/@vitejs+plugin-react@4.4.1_vite@5.4.14_@types+node@20.17.18_lightningcss@1.29.2_sass@1.84.0_terser@5.38.2_/node_modules/@vitejs/plugin-react/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [
    tailwindcss(),
    reactRouter(),
    react({
      babel: {
        plugins: [
          "babel-plugin-react-compiler",
          { target: "19" }
        ]
      }
    }),
    tsconfigPaths()
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxkZXZcXFxcZnVuZXh0XFxcXGZ1bmV4dC11aVxcXFxwYWNrYWdlc1xcXFxvd2wtcmVhY3RcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXGRldlxcXFxmdW5leHRcXFxcZnVuZXh0LXVpXFxcXHBhY2thZ2VzXFxcXG93bC1yZWFjdFxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovZGV2L2Z1bmV4dC9mdW5leHQtdWkvcGFja2FnZXMvb3dsLXJlYWN0L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgcmVhY3RSb3V0ZXIgfSBmcm9tIFwiQHJlYWN0LXJvdXRlci9kZXYvdml0ZVwiO1xuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gXCJAdGFpbHdpbmRjc3Mvdml0ZVwiO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCB0c2NvbmZpZ1BhdGhzIGZyb20gXCJ2aXRlLXRzY29uZmlnLXBhdGhzXCI7XG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0XCI7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICB0YWlsd2luZGNzcygpLCBcbiAgICByZWFjdFJvdXRlcigpLCBcbiAgICByZWFjdCh7XG4gICAgICBiYWJlbDoge1xuICAgICAgICBwbHVnaW5zOiBbXG4gICAgICAgICAgJ2JhYmVsLXBsdWdpbi1yZWFjdC1jb21waWxlcicsIHt0YXJnZXQ6ICcxOSd9XG4gICAgICAgIF1cbiAgICAgIH1cbiAgICAgIFxuICAgIH0pLFxuICAgIHRzY29uZmlnUGF0aHMoKVxuICBdLFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTRULFNBQVMsbUJBQW1CO0FBQ3hWLE9BQU8saUJBQWlCO0FBQ3hCLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sbUJBQW1CO0FBQzFCLE9BQU8sV0FBVztBQUVsQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxZQUFZO0FBQUEsSUFDWixZQUFZO0FBQUEsSUFDWixNQUFNO0FBQUEsTUFDSixPQUFPO0FBQUEsUUFDTCxTQUFTO0FBQUEsVUFDUDtBQUFBLFVBQStCLEVBQUMsUUFBUSxLQUFJO0FBQUEsUUFDOUM7QUFBQSxNQUNGO0FBQUEsSUFFRixDQUFDO0FBQUEsSUFDRCxjQUFjO0FBQUEsRUFDaEI7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
