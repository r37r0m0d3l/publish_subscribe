import cloneDeep from "./cloneDeep";
import isPrimitive from "./isPrimitive";

export default function clone(value) {
  if (isPrimitive(value)) {
    return value;
  }
  return cloneDeep(value);
}
