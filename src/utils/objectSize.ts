import objectKeys from "./objectKeys.js";

export default function objectSize(object) {
  return objectKeys(object).length;
}
