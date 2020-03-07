import PROTOTYPE_ASYNC from "../const/PROTOTYPE_ASYNC";
import PROTOTYPE_SYNC from "../const/PROTOTYPE_SYNC";
import getPrototypeName from "./getPrototypeName";

export default function call(callback, args) {
  if (!callback) {
    return;
  }
  switch (getPrototypeName(callback)) {
    case PROTOTYPE_ASYNC:
      callback(...args)
        .then(() => {})
        .catch(() => {});
      break;
    case PROTOTYPE_SYNC:
      try {
        callback(...args);
      } catch (_error) {
        //
      }
      break;
  }
}
