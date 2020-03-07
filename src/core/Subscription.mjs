import generateToken from "../utils/generateToken";

class Subscription {
  // callback;
  // channel;
  // once;
  // token;
  constructor(channel, callback, once = false) {
    this.callback = callback;
    this.channel = channel;
    this.once = once;
    this.token = generateToken();
  }
}

export default Subscription;
