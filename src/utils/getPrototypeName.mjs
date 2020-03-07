export default function getPrototypeName(value) {
  return Object.prototype.toString.call(value);
}
