

function toArray(object) {
  let result = [];

  Object.values(object).forEach((value) => {
    if (typeof value === "string") {
      result.push(value);
    } else if (typeof value === "object" && !Array.isArray(value)) {
      result.push(...toArray(value));
    }
  });

  return result;
}
export default function values(object) {
  return object ? toArray(object).join(" ") : '';
}
