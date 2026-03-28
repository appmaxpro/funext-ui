import type { Schema } from "../data-types";

declare class HTMLtoJson {
  new(config?:object);
  convert(xml:string): Schema;
}

export default HTMLtoJson;