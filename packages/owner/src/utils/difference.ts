import type { DataRecord } from ".";

type Diff =
  | {
      type: "ADDED" | "DELETED";
      value: any;
    }
  | {
      type: "UPDATED";
      oldValue: any;
      newValue: any;
    }
  | {
      type: "UPDATED_NESTED";
      changes: Diffs;
    };

type Diffs = Record<string, Diff>;

function difference(
  obj1: DataRecord,
  obj2: DataRecord,
  deep: boolean = true,
): Diffs {
  const diffs: Diffs = {};
  const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]); // Get all unique keys from both objects

  for (const key of allKeys) {
    const val1 = obj1[key];
    const val2 = obj2[key];

    // Check for keys that exist in one object but not the other
    if (!(key in obj1)) {
      diffs[key] = { type: "ADDED", value: val2 };
    } else if (!(key in obj2)) {
      diffs[key] = { type: "DELETED", value: val1 };
    }
    // Deeply compare if both values are objects
    else if (
      deep &&
      typeof val1 === "object" &&
      val1 !== null &&
      typeof val2 === "object" &&
      val2 !== null
    ) {
      const subDiff = difference(val1, val2);
      if (Object.keys(subDiff).length > 0) {
        diffs[key] = { type: "UPDATED_NESTED", changes: subDiff };
      }
    } else if (val1 == null && val2 == null) {
      continue;
    }
    // Compare primitive values
    else if (val1 !== val2) {
      diffs[key] = { type: "UPDATED", oldValue: val1, newValue: val2 };
    }
  }
  return diffs;
}