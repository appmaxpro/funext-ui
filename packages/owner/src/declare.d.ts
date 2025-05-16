/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />
/// <reference types="vite-plugin-pwa/handlebars" />
/// <reference types="vite-plugin-pwa/svgr" />
/// <reference types="vite-tsconfig-paths" />
/// <reference types="@vitejs/plugin-react" />

declare module "maplibre-google-maps" {
  export function googleProtocol(params:any, abortController:any):Promise<GetResourceResponse<any>>;
}