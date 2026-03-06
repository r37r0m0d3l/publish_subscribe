import PROTOTYPE_ASYNC from "../const/PROTOTYPE_ASYNC.js";
import PROTOTYPE_SYNC from "../const/PROTOTYPE_SYNC.js";
import getPrototypeName from "./getPrototypeName.js";

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
