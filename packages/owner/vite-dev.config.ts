import react from "@vitejs/plugin-react";
import { ProxyOptions, loadEnv, mergeConfig, createLogger } from "vite";
import { UserConfig, defineConfig } from "vitest/config";
import viteConfig from "./vite.config";
import { url } from "inspector";
import {generateData} from './src/server/fake-data';


const logger = createLogger("info");
const loggerWarn = logger.warn

let env = loadEnv("dev", process.cwd(), "");
let base = env.VITE_PROXY_CONTEXT ?? "/";

base = base.endsWith("/") ? base : `${base}/`;

const { plugins, ...conf } = viteConfig as UserConfig;


const proxyAll: ProxyOptions = {
  target: env.VITE_PROXY_TARGET,
  changeOrigin: true,
  configure: (proxy) => {
    proxy.on("proxyRes", (proxyRes, req, res) => {
      if('application/json' == req.headers.accept ){
        req.headers['content-type'] = 'application/json';
      }
      if (req.headers['sec-fetch-mode'] == 'cors') {
        req.headers['X-Requested-With'] = 'XMLHttpRequest';
      }
      
      //proxyRes.on("data", (chunk) => chunks.push(chunk));
      proxyRes.on("error", console.error);
      proxyRes.on("end", () => {
        //const buffer = Buffer.concat(chunks);

        console.log("proxyRes:", {
          responseHeaders: proxyRes.headers,
          status: proxyRes.statusCode,
          url: req.url,
          requestHeaders: req.headers,
          method: req.method,
          contentType: req.headers.accept
        } );
      });
    });
  },
  bypass(req, res, options) {
    console.log("bypass:", req.url)
    if (req.url && (
      req.url === base ||
      req.url === base + "index.html" ||
      req.url.startsWith(base + "src/") ||
      req.url.startsWith(base + "@fs/") ||
      req.url === base + "@react-refresh" ||
      req.url.startsWith(base + "@id/") ||
      req.url.startsWith(base + "@vite") ||
      req.url.startsWith(base + "node_modules/") ||
      /\/theme\/([^.]+)\.json/.test(req.url) ||
      req.url.startsWith(base + "js/libs/monaco-editor/vs/") ||
      req.url.endsWith("favicon.ico")
    )
    ) {
      return req.url;
    }

    if (req.url && req.url.startsWith(base + "api/data/fake")){
      res?.writeHead(200, { 'Content-Type': 'application/json' });
      res?.write(JSON.stringify(generateData()));
      res?.end();
      return req.url;
    }

    console.log("proxy error:", req.url);
  },
};

const proxyWs: ProxyOptions = {
  target: env.VITE_PROXY_TARGET,
  changeOrigin: true,
  ws: true,
};

export default mergeConfig(
  conf,
  defineConfig({
    customLogger: logger,
    plugins,
    base,
    server: {
      //preTransformRequests: false,
      proxy: {
        [`${base}websocket`]: proxyWs,
        [`${base}`]: proxyAll,

      },
      fs: {
        // Allow serving files from one level up to the project root
        allow: ["..", "../ui"],
      },
    },
  }),
);

