import objectSize from "./objectSize";

export default function isObjectEmpty(object) {
  return objectSize(object) === 0;
}
