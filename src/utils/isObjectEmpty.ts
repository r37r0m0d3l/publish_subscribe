import objectSize from "./objectSize.js";

export default function isObjectEmpty(object) {
  return objectSize(object) === 0;
}
