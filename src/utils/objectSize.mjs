import objectKeys from "./objectKeys";

export default function objectSize(object) {
  return objectKeys(object).length;
}
