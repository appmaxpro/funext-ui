import { fetch } from "./client";
import { DATE_RANGES } from "./constant";

let bundle: Record<string, string> = {};

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace i18n {
  export async function loadAssets(lang: Record<string, string>) {
    bundle = lang;
  }
  export async function load() {
    // load the translation catalog
    bundle = await fetch({
      url: "assets/messages.js",
    })
    .then((res) => res.json());
    (Object.keys(DATE_RANGES ) as Array<keyof typeof DATE_RANGES>)
    .forEach((key) => 
      DATE_RANGES[key] = bundle[key] || DATE_RANGES[key])
  }
  export function get(text: string, ...args: any[]): string {
    let message = bundle[text] || bundle[(text || "").trim()] || text;
    if (message && args.length) {
      for (let i = 0; i < args.length; i++) {
        const placeholder = new RegExp(`\\{${i}\\}`, "g");
        const value = args[i];
        message = message.replace(placeholder, value);
      }
    }
    return message;
  }

  export const t = get
}
