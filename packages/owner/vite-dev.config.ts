//import react from "@vitejs/plugin-react";
import { type ProxyOptions, loadEnv, mergeConfig, defineConfig, createLogger } from "vite";
import viteConfig from "./vite.config";
import generateData from "./server/fake-data";
import fleet_vehicle from "./server/fleet_vehicle";
import fs from "fs";

type UserConfig = typeof viteConfig  ;//ReturnType<typeof defineConfig>;

const logger = createLogger("info");
const loggerWarn = logger.warn;

let env = loadEnv("dev", process.cwd(), "");
let base = env.VITE_PROXY_CONTEXT ?? "/";

base = base.endsWith("/") ? base : `${base}/`;

const { plugins, ...conf } = viteConfig as UserConfig;

let contextPath = (env.CONTEXT_PATH ? `/${env.CONTEXT_PATH}` : "/").replaceAll(
  /\/\//g,
  "/",
);

const contextRegex = RegExp(`^${contextPath}/`);

const proxyOdata: ProxyOptions = {
  target: env.VITE_PROXY_TARGET,
  changeOrigin: true,
  //rewrite: (path) => path.replace(contextRegex, "/"),
  configure: (proxy) => {
    proxy.on("end", (req, res, proxyRes) => {
      console.log("proxy end:", {
        status: res.statusCode,
        url: req.url,
      });
    }),
      proxy.on("proxyRes", (proxyRes, req, res) => {
        proxyRes.on("error", (error) => {
          console.log("proxy end:", {
            error,
            status: res.statusCode,
            url: req.url,
            requestHeaders: req.headers,
            method: req.method,
            contentType: req.headers.accept,
          });
        })
        console.log("proxyRes:", {
          responseHeaders: proxyRes.headers,
          status: proxyRes.statusCode,
          url: req.url,
          requestHeaders: req.headers,
          method: req.method,
          contentType: req.headers.accept,
        });
      });
  },
};
const proxyWs: ProxyOptions = {
  target: env.VITE_PROXY_TARGET,
  changeOrigin: true,
  ws: true,
};
const proxyStatic: ProxyOptions = {
  target: env.TRACKER_PROXY_TARGET,
  changeOrigin: true,
  //rewrite: (path) => path.replace(/^\/oxmlui/, '/fms_owner')
};
//
export default mergeConfig(
  conf,
  defineConfig({
    customLogger: logger,
    plugins,
    //base,
    server: {
      //preTransformRequests: false,
      proxy: {
        '/api/socket': proxyWs,
        [`${contextPath}`]: proxyOdata,
        //'/api': env.TRACKER_PROXY_TARGET,
      },
      watch: {
        usePolling: true,
        ignored: ["/server/**", "./server/**", "/res/**", "/public/res/**"],
      },
      fs: {
        // Allow serving files from one level up to the project root
        //allow: ["..", "../ui"],
      },
    },
  }),
);
