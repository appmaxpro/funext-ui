export function sanitize(value: any): string {
  if (value == null ) return "";
  let s: string;
  if (typeof value === "object") {
    try {
      s = value.toString?.() ?? JSON.stringify(value);
    } catch {
      s = String(value);
    }
  } else {
    s = String(value);
  }
  // Strip any HTML tags, collapse whitespace and trim
  return s.replace(/<\/?[^>]+(>|$)/g, "").replace(/\s+/g, " ").trim();
}