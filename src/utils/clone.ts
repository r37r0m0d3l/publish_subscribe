import cloneDeep from "./cloneDeep.js";
import isPrimitive from "./isPrimitive.js";

export default function clone<T>(value: T, useNative: boolean = true): T {
  if (isPrimitive(value) || typeof value === "symbol") {
    return value;
  }

  // If the value has symbol keys, prefer cloneDeep to preserve them
  if (value && typeof value === "object") {
    const syms = Object.getOwnPropertySymbols(value as object);
    if (syms.length > 0) {
      return cloneDeep(value, false);
    }
  }

  if (useNative && typeof globalThis.structuredClone === "function") {
    try {
      return globalThis.structuredClone(value);
    } catch {
      // Fallback to cloneDeep if structuredClone fails (e.g., for non-cloneable objects)
    }
  }

  return cloneDeep(value, false);
}
